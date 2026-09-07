"""BIND zone-file parser.

Treats input strictly as text. Does not execute, include, or generate files.
"""

from __future__ import annotations

import re
from dataclasses import dataclass

MAX_CONTENT_BYTES = 256 * 1024
MAX_RECORDS = 2000

SUPPORTED_TYPES = frozenset(
    {"A", "AAAA", "CNAME", "MX", "TXT", "NS", "SOA", "SRV", "CAA", "PTR"}
)
# Used to tell a record type from an owner name when the name is omitted.
KNOWN_TYPES = SUPPORTED_TYPES | {
    "SPF",
    "NAPTR",
    "DS",
    "DNSKEY",
    "TLSA",
    "SSHFP",
    "URI",
    "LOC",
    "HINFO",
    "RP",
    "AFSDB",
    "DNAME",
    "ALIAS",
    "HTTPS",
    "SVCB",
    "CAA",
}
CLASSES = frozenset({"IN", "CH", "HS", "CS"})
_TTL_UNIT = {"s": 1, "m": 60, "h": 3600, "d": 86400, "w": 604800}


class BindParseError(Exception):
    def __init__(self, message: str, line: int | None = None) -> None:
        self.line = line
        self.message = message
        super().__init__(message)

    def __str__(self) -> str:
        if self.line is None:
            return self.message
        return f"Line {self.line}: {self.message}"


@dataclass(frozen=True)
class ParsedBindRecord:
    name: str
    type: str
    ttl: int
    rdata: str
    line: int


def ensure_text_zone_file(raw: bytes | str, *, filename: str | None = None) -> str:
    """Reject binary / oversized payloads. Filenames are never trusted."""
    del filename  # caller may pass a name for UI only
    if isinstance(raw, str):
        data = raw.encode("utf-8", errors="strict")
        text = raw
    else:
        data = raw
        try:
            text = data.decode("utf-8")
        except UnicodeDecodeError as exc:
            raise BindParseError(
                "Zone file must be UTF-8 text, not a binary file."
            ) from exc

    if len(data) > MAX_CONTENT_BYTES:
        raise BindParseError(
            f"Zone file exceeds the {MAX_CONTENT_BYTES} byte size limit."
        )
    if b"\x00" in data:
        raise BindParseError("Zone file contains binary data and was rejected.")

    control = sum(
        1 for byte in data if byte < 32 and byte not in {9, 10, 13}
    )
    if data and control / max(len(data), 1) > 0.05:
        raise BindParseError("Zone file contains unexpected binary content.")
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    if text.startswith("\ufeff"):
        text = text[1:]
    return text


def parse_ttl_token(token: str) -> int:
    raw = token.strip().lower()
    if raw.isdigit():
        value = int(raw)
    else:
        match = re.fullmatch(r"(\d+)([smhdw])", raw)
        if not match:
            raise BindParseError(f"Invalid TTL: {token}")
        value = int(match.group(1)) * _TTL_UNIT[match.group(2)]
    if value < 0:
        raise BindParseError(f"TTL out of range: {token}")
    return value


def qualify_name(name: str, origin: str) -> str:
    origin = _with_dot(origin.strip()) if origin.strip() else "."
    token = name.strip()
    if not token:
        raise BindParseError("Record name is empty.")
    if token == "@":
        return origin
    if token.endswith("."):
        return token.lower()
    if origin == ".":
        return f"{token}.".lower()
    return f"{token}.{origin}".lower()


def qualify_rdata_hostname(value: str, origin: str) -> str:
    token = value.strip()
    if not token:
        return token
    if token == "@":
        return _with_dot(origin)
    if token.endswith("."):
        return token.lower()
    return qualify_name(token, origin)


def _with_dot(name: str) -> str:
    cleaned = name.strip().lower()
    if cleaned == ".":
        return "."
    return cleaned if cleaned.endswith(".") else f"{cleaned}."


def parse_zone(text: str, *, zone_origin: str, default_ttl: int = 3600) -> list[
    ParsedBindRecord
]:
    origin = _with_dot(zone_origin)
    ttl = default_ttl
    previous_name = origin
    records: list[ParsedBindRecord] = []

    for line_no, logical, blank_owner in _logical_lines(text):
        if not logical.strip():
            continue
        if logical.startswith("$"):
            origin, ttl = _apply_directive(logical, origin, ttl, line_no)
            continue
        parsed, previous_name = _parse_record_line(
            logical,
            origin=origin,
            default_ttl=ttl,
            previous_name=previous_name,
            line_no=line_no,
            blank_owner=blank_owner,
        )
        records.append(parsed)
        if len(records) > MAX_RECORDS:
            raise BindParseError(
                f"Zone file exceeds the {MAX_RECORDS} record limit."
            )
    return records


def _apply_directive(
    line: str, origin: str, ttl: int, line_no: int
) -> tuple[str, int]:
    try:
        parts = _split_tokens(line)
    except BindParseError as exc:
        raise BindParseError(exc.message, line_no) from exc
    if not parts:
        return origin, ttl
    directive = parts[0].upper()
    if directive in {"$INCLUDE", "$GENERATE"}:
        raise BindParseError(
            f"{directive} is not allowed in imported zone files.",
            line_no,
        )
    if directive == "$ORIGIN":
        if len(parts) < 2:
            raise BindParseError("$ORIGIN requires a domain name.", line_no)
        token = parts[1]
        next_origin = (
            _with_dot(token) if token.endswith(".") else qualify_name(token, origin)
        )
        return next_origin, ttl
    if directive == "$TTL":
        if len(parts) < 2:
            raise BindParseError("$TTL requires a value.", line_no)
        try:
            return origin, parse_ttl_token(parts[1])
        except BindParseError as exc:
            raise BindParseError(exc.message, line_no) from exc
    raise BindParseError(f"Unknown directive {directive}.", line_no)


def _parse_record_line(
    line: str,
    *,
    origin: str,
    default_ttl: int,
    previous_name: str,
    line_no: int,
    blank_owner: bool = False,
) -> tuple[ParsedBindRecord, str]:
    try:
        tokens = _split_tokens(line)
    except BindParseError as exc:
        raise BindParseError(exc.message, line_no) from exc
    if not tokens:
        raise BindParseError("Empty record line.", line_no)

    name = previous_name
    ttl = default_ttl
    index = 0

    first = tokens[0]
    if not blank_owner and not (
        _is_ttl_token(first)
        or first.upper() in CLASSES
        or first.upper() in KNOWN_TYPES
    ):
        try:
            name = qualify_name(first, origin)
        except BindParseError as exc:
            raise BindParseError(exc.message, line_no) from exc
        index = 1

    seen_ttl = False
    while index < len(tokens):
        token = tokens[index]
        if not seen_ttl and _is_ttl_token(token):
            try:
                ttl = parse_ttl_token(token)
            except BindParseError as exc:
                raise BindParseError(exc.message, line_no) from exc
            seen_ttl = True
            index += 1
            continue
        if token.upper() in CLASSES:
            index += 1
            continue
        break

    if index >= len(tokens):
        raise BindParseError("Record is missing a type.", line_no)

    rtype = tokens[index].upper()
    rdata_tokens = tokens[index + 1 :]
    if rtype in {"MX", "CNAME", "NS", "PTR", "SRV", "SOA"}:
        rdata_tokens = _qualify_host_tokens(rtype, rdata_tokens, origin)
    rdata = " ".join(rdata_tokens).strip()
    if rtype == "TXT":
        rdata = _join_txt(rdata_tokens)

    record = ParsedBindRecord(
        name=name,
        type=rtype,
        ttl=ttl,
        rdata=rdata,
        line=line_no,
    )
    return record, name


def _qualify_host_tokens(
    rtype: str, tokens: list[str], origin: str
) -> list[str]:
    if not tokens:
        return tokens
    out = list(tokens)
    if rtype == "MX" and len(out) >= 2:
        out[-1] = qualify_rdata_hostname(out[-1], origin)
    elif rtype in {"CNAME", "NS", "PTR"}:
        out[-1] = qualify_rdata_hostname(out[-1], origin)
    elif rtype == "SRV" and len(out) >= 4:
        out[-1] = qualify_rdata_hostname(out[-1], origin)
    elif rtype == "SOA" and len(out) >= 2:
        out[0] = qualify_rdata_hostname(out[0], origin)
        out[1] = qualify_rdata_hostname(out[1], origin)
    return out


def _join_txt(tokens: list[str]) -> str:
    if not tokens:
        return ""
    quoted = [
        token
        for token in tokens
        if len(token) >= 2 and token.startswith('"') and token.endswith('"')
    ]
    if quoted and len(quoted) == len(tokens):
        joined = "".join(_unescape_quoted(token[1:-1]) for token in tokens)
        return f'"{joined}"'
    return " ".join(tokens)


def _unescape_quoted(value: str) -> str:
    return value.replace('\\"', '"').replace("\\\\", "\\")


def _is_ttl_token(token: str) -> bool:
    return bool(re.fullmatch(r"\d+([smhdwSMHDW])?", token))


def _split_tokens(line: str) -> list[str]:
    tokens: list[str] = []
    current: list[str] = []
    in_quote = False
    i = 0
    while i < len(line):
        ch = line[i]
        if in_quote:
            if ch == "\\" and i + 1 < len(line):
                current.append(ch)
                current.append(line[i + 1])
                i += 2
                continue
            current.append(ch)
            if ch == '"':
                in_quote = False
                tokens.append("".join(current))
                current = []
            i += 1
            continue
        if ch in " \t":
            if current:
                tokens.append("".join(current))
                current = []
            i += 1
            continue
        if ch == '"':
            if current:
                tokens.append("".join(current))
                current = []
            in_quote = True
            current.append(ch)
            i += 1
            continue
        current.append(ch)
        i += 1
    if in_quote:
        raise BindParseError("Unclosed quoted string.")
    if current:
        tokens.append("".join(current))
    return tokens


def _logical_lines(text: str) -> list[tuple[int, str, bool]]:
    lines: list[tuple[int, str, bool]] = []
    buf: list[str] = []
    start_line = 1
    paren = 0
    blank_owner = False

    for line_no, raw in enumerate(text.split("\n"), start=1):
        stripped = _strip_comment(raw)
        if not buf:
            start_line = line_no
            blank_owner = bool(stripped) and stripped[0] in " \t"
        rewritten: list[str] = []
        in_quote = False
        i = 0
        while i < len(stripped):
            ch = stripped[i]
            if ch == '"' and (i == 0 or stripped[i - 1] != "\\"):
                in_quote = not in_quote
                rewritten.append(ch)
            elif ch == "(" and not in_quote:
                paren += 1
                rewritten.append(" ")
            elif ch == ")" and not in_quote:
                if paren == 0:
                    raise BindParseError("Unmatched closing parenthesis.", line_no)
                paren -= 1
                rewritten.append(" ")
            else:
                rewritten.append(ch)
            i += 1
        buf.append("".join(rewritten))
        if paren == 0:
            logical = " ".join(part.strip() for part in buf if part.strip())
            lines.append((start_line, logical, blank_owner and bool(logical)))
            buf = []

    if paren != 0:
        raise BindParseError("Unclosed parenthesis in zone file.", start_line)
    if buf:
        logical = " ".join(part.strip() for part in buf if part.strip())
        if logical:
            lines.append((start_line, logical, blank_owner))
    return lines


def _strip_comment(line: str) -> str:
    out: list[str] = []
    in_quote = False
    i = 0
    while i < len(line):
        ch = line[i]
        if ch == '"' and (i == 0 or line[i - 1] != "\\"):
            in_quote = not in_quote
            out.append(ch)
        elif ch == ";" and not in_quote:
            break
        else:
            out.append(ch)
        i += 1
    return "".join(out).rstrip()

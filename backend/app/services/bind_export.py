"""Serialize DNS records to a BIND zone file.

The writer is the inverse of ``bind_parser.parse_zone`` for supported types.
"""

from __future__ import annotations

from collections.abc import Sequence

from app.models.dns_record import DnsRecord
from app.models.hosted_zone import HostedZone

_TYPE_ORDER = {
    "SOA": 0,
    "NS": 1,
    "MX": 2,
    "A": 3,
    "AAAA": 4,
    "CNAME": 5,
    "TXT": 6,
    "SRV": 7,
    "CAA": 8,
    "PTR": 9,
}

_TXT_CHUNK = 255
_DEFAULT_TTL = 300
_SOA_TTL = 900
_DEFAULT_MNAME = "ns-1536.awsdns-00.co.uk."
_DEFAULT_RNAME = "awsdns-hostmaster.amazon.com."


def fqdn(name: str) -> str:
    cleaned = name.strip().lower()
    if not cleaned or cleaned == ".":
        return "."
    return cleaned if cleaned.endswith(".") else f"{cleaned}."


def zone_filename(zone_name: str, extension: str) -> str:
    stem = zone_name.strip().lower().rstrip(".") or "hosted-zone"
    safe = "".join(ch if ch.isalnum() or ch in ".-_" else "-" for ch in stem)
    return f"{safe}.{extension.lstrip('.')}"


def txt_logical_value(value: str) -> str:
    """Return the unquoted TXT payload, unescaping BIND quoted-string syntax."""
    text = value.strip()
    if len(text) >= 2 and text.startswith('"') and text.endswith('"'):
        return _unescape_quoted(text[1:-1])
    return text


def format_txt_rdata(value: str) -> str:
    payload = txt_logical_value(value)
    if not payload:
        return '""'
    chunks = [
        payload[index : index + _TXT_CHUNK]
        for index in range(0, len(payload), _TXT_CHUNK)
    ]
    return " ".join(_quote_txt_chunk(chunk) for chunk in chunks)


def record_rdata(record: DnsRecord) -> str:
    rtype = record.type.upper()
    if rtype == "MX":
        host = fqdn(record.value)
        priority = 0 if record.priority is None else record.priority
        return f"{priority} {host}"
    if rtype == "SRV":
        host = fqdn(record.value)
        priority = 0 if record.priority is None else record.priority
        weight = 0 if record.weight is None else record.weight
        port = 0 if record.port is None else record.port
        return f"{priority} {weight} {port} {host}"
    if rtype == "CAA":
        flag = 0 if record.caa_flag is None else record.caa_flag
        tag = record.caa_tag or "issue"
        return f"{flag} {tag} {_quote_txt_chunk(txt_logical_value(record.value))}"
    if rtype == "TXT":
        return format_txt_rdata(record.value)
    if rtype in {"CNAME", "NS", "PTR", "SOA"}:
        return _format_hostname_rdata(rtype, record.value)
    return record.value


def render_zone_file(zone: HostedZone, records: Sequence[DnsRecord]) -> str:
    origin = fqdn(zone.name)
    default_ttl = _default_ttl(records)
    lines = [
        f"$ORIGIN {origin}",
        f"$TTL {default_ttl}",
        "",
        _render_soa(origin, records),
    ]

    for record in _sorted_records(records):
        lines.append(_render_record(record, default_ttl))

    if lines[-1] != "":
        lines.append("")
    return "\n".join(lines)


def _render_record(record: DnsRecord, default_ttl: int) -> str:
    owner = fqdn(record.name)
    rdata = record_rdata(record)
    if record.ttl == default_ttl:
        return f"{owner} IN {record.type.upper()} {rdata}"
    return f"{owner} {record.ttl} IN {record.type.upper()} {rdata}"


def _render_soa(origin: str, records: Sequence[DnsRecord]) -> str:
    mname = _DEFAULT_MNAME
    for record in records:
        if record.type.upper() == "NS" and record.value.strip():
            mname = fqdn(record.value)
            break
    return (
        f"{origin} {_SOA_TTL} IN SOA {mname} {_DEFAULT_RNAME} "
        "1 7200 900 1209600 86400"
    )


def _sorted_records(records: Sequence[DnsRecord]) -> list[DnsRecord]:
    return sorted(
        records,
        key=lambda row: (
            _TYPE_ORDER.get(row.type.upper(), 50),
            fqdn(row.name),
            record_rdata(row),
            row.id,
        ),
    )


def _default_ttl(records: Sequence[DnsRecord]) -> int:
    if not records:
        return _DEFAULT_TTL
    counts: dict[int, int] = {}
    for record in records:
        counts[record.ttl] = counts.get(record.ttl, 0) + 1
    return max(counts.items(), key=lambda item: (item[1], -item[0]))[0]


def _format_hostname_rdata(rtype: str, value: str) -> str:
    tokens = value.split()
    if rtype == "SOA" and len(tokens) >= 2:
        tokens[0] = fqdn(tokens[0])
        tokens[1] = fqdn(tokens[1])
        return " ".join(tokens)
    if not tokens:
        return value
    tokens[-1] = fqdn(tokens[-1])
    return " ".join(tokens)


def _quote_txt_chunk(chunk: str) -> str:
    escaped = chunk.replace("\\", "\\\\").replace('"', '\\"')
    return f'"{escaped}"'


def _unescape_quoted(value: str) -> str:
    out: list[str] = []
    i = 0
    while i < len(value):
        if value[i] == "\\" and i + 1 < len(value):
            out.append(value[i + 1])
            i += 2
            continue
        out.append(value[i])
        i += 1
    return "".join(out)

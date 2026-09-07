"""Validate BIND-parsed records against Route 53-compatible constraints."""

from __future__ import annotations

import ipaddress
import re

from app.services.bind_parser import SUPPORTED_TYPES, ParsedBindRecord

_LABEL = r"[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?"
_HOSTNAME_RE = re.compile(
    rf"^(?:\*\.)?(?:_?[a-z0-9](?:[a-z0-9-]{{0,61}}[a-z0-9])?\.)*{_LABEL}\.?$",
    re.IGNORECASE,
)
_SRV_NAME_RE = re.compile(
    r"^(_[a-z0-9-]+\._[a-z0-9-]+\.)?[a-z0-9._-]+\.?$",
    re.IGNORECASE,
)
CAA_TAGS = frozenset({"issue", "issuewild", "iodef"})


def normalize_owner(name: str) -> str:
    return name.strip().lower().rstrip(".")


def validate_parsed_record(
    record: ParsedBindRecord,
) -> tuple[str, str | None, dict[str, object]]:
    """Return (status, reason, columns).

    status is valid, invalid, or unsupported.
    """
    if record.type not in SUPPORTED_TYPES:
        return (
            "unsupported",
            f"Unsupported record type {record.type}.",
            _base_columns(record),
        )
    if record.type == "SOA":
        columns = _base_columns(record)
        reason = _validate_soa(record.rdata)
        if reason:
            return "invalid", reason, columns
        return (
            "unsupported",
            "SOA records are managed by the hosted zone and are not imported.",
            columns,
        )

    try:
        columns = _typed_columns(record)
    except ValueError as exc:
        return "invalid", str(exc), _base_columns(record)
    return "valid", None, columns


def _base_columns(record: ParsedBindRecord) -> dict[str, object]:
    return {
        "name": normalize_owner(record.name),
        "type": record.type,
        "ttl": record.ttl,
        "value": record.rdata,
        "priority": None,
        "weight": None,
        "port": None,
        "caa_flag": None,
        "caa_tag": None,
    }


def _typed_columns(record: ParsedBindRecord) -> dict[str, object]:
    ttl = record.ttl
    if ttl < 0 or ttl > 2_147_483_647:
        raise ValueError("Invalid TTL.")
    name = normalize_owner(record.name)
    if not name or len(name) > 253:
        raise ValueError("Invalid hostname.")
    if record.type == "SRV":
        if not _SRV_NAME_RE.match(record.name.rstrip(".")):
            raise ValueError("Invalid SRV hostname.")
    elif not _HOSTNAME_RE.match(name) and name != "localhost":
        raise ValueError("Invalid hostname.")

    rdata = record.rdata.strip()
    if not rdata:
        raise ValueError("Record is missing a value.")

    columns = _base_columns(record)
    columns["name"] = name

    if record.type == "A":
        _require_ipv4(rdata)
        columns["value"] = rdata
    elif record.type == "AAAA":
        _require_ipv6(rdata)
        columns["value"] = rdata
    elif record.type in {"CNAME", "NS", "PTR"}:
        host = _require_hostname(rdata)
        columns["value"] = host
    elif record.type == "MX":
        priority, host = _parse_mx(rdata)
        columns["priority"] = priority
        columns["value"] = host
    elif record.type == "TXT":
        columns["value"] = _parse_txt(rdata)
    elif record.type == "SRV":
        priority, weight, port, target = _parse_srv(rdata)
        columns["priority"] = priority
        columns["weight"] = weight
        columns["port"] = port
        columns["value"] = target
    elif record.type == "CAA":
        flag, tag, value = _parse_caa(rdata)
        columns["caa_flag"] = flag
        columns["caa_tag"] = tag
        columns["value"] = value
    return columns


def _require_ipv4(value: str) -> None:
    try:
        ipaddress.IPv4Address(value)
    except ipaddress.AddressValueError as exc:
        raise ValueError("Invalid IPv4 address.") from exc


def _require_ipv6(value: str) -> None:
    try:
        ipaddress.IPv6Address(value)
    except ipaddress.AddressValueError as exc:
        raise ValueError("Invalid IPv6 address.") from exc


def _require_hostname(value: str) -> str:
    host = normalize_owner(value)
    if not host or not _HOSTNAME_RE.match(host):
        raise ValueError("Invalid hostname.")
    return host


def _parse_mx(rdata: str) -> tuple[int, str]:
    parts = rdata.split()
    if len(parts) < 2:
        raise ValueError("Malformed MX record. Expected: priority hostname.")
    try:
        priority = int(parts[0])
    except ValueError as exc:
        raise ValueError("Malformed MX record. Priority must be an integer.") from exc
    if priority < 0 or priority > 65535:
        raise ValueError("Malformed MX record. Priority is out of range.")
    return priority, _require_hostname(parts[1])


def _parse_txt(rdata: str) -> str:
    text = rdata.strip()
    if not text:
        raise ValueError("Malformed TXT record.")
    if text.startswith('"') and not text.endswith('"'):
        raise ValueError("Malformed TXT record.")
    if len(text) > 4096:
        raise ValueError("TXT value is too long.")
    return text


def _parse_srv(rdata: str) -> tuple[int, int, int, str]:
    parts = rdata.split()
    if len(parts) < 4:
        raise ValueError(
            "Malformed SRV record. Expected: priority weight port target."
        )
    try:
        priority = int(parts[0])
        weight = int(parts[1])
        port = int(parts[2])
    except ValueError as exc:
        raise ValueError("Malformed SRV record.") from exc
    for label, value in (
        ("priority", priority),
        ("weight", weight),
        ("port", port),
    ):
        if value < 0 or value > 65535:
            raise ValueError(f"Malformed SRV record. Invalid {label}.")
    return priority, weight, port, _require_hostname(parts[3])


def _parse_caa(rdata: str) -> tuple[int, str, str]:
    parts = rdata.split(None, 2)
    if len(parts) < 3:
        raise ValueError("Malformed CAA record. Expected: flag tag value.")
    try:
        flag = int(parts[0])
    except ValueError as exc:
        raise ValueError("Malformed CAA record. Flag must be an integer.") from exc
    if flag < 0 or flag > 255:
        raise ValueError("Malformed CAA record. Flag is out of range.")
    tag = parts[1].lower()
    if tag not in CAA_TAGS:
        raise ValueError("Malformed CAA record. Tag must be issue, issuewild, or iodef.")
    value = parts[2].strip().strip('"')
    if not value:
        raise ValueError("Malformed CAA record.")
    return flag, tag, value


def _validate_soa(rdata: str) -> str | None:
    parts = rdata.split()
    if len(parts) < 7:
        return "Malformed SOA record."
    for token in parts[2:7]:
        if not token.isdigit():
            return "Malformed SOA record."
    return None

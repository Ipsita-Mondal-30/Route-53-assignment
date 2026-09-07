"""Preview and commit BIND zone-file imports into existing DNS records."""

from __future__ import annotations

from dataclasses import dataclass

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.dns_record import DnsRecord
from app.models.hosted_zone import HostedZone
from app.models.user import User
from app.schemas.bind_import import (
    BindImportFailure,
    BindImportResultOut,
    BindPreviewCounts,
    BindPreviewOut,
    BindPreviewRecord,
    DuplicateMode,
)
from app.schemas.dns_record import dns_record_write_adapter, record_write_to_columns
from app.services import notification_service
from app.services.bind_parser import (
    BindParseError,
    ParsedBindRecord,
    ensure_text_zone_file,
    parse_zone,
)
from app.services.dns_record_validation import normalize_owner, validate_parsed_record
from app.services.hosted_zone_service import HostedZoneNotFound


@dataclass(frozen=True)
class _Prepared:
    parsed: ParsedBindRecord
    status: str
    reason: str | None
    columns: dict[str, object]


def preview(db: Session, zone_id: str, content: str, filename: str | None) -> BindPreviewOut:
    zone = db.get(HostedZone, zone_id)
    if zone is None:
        raise HostedZoneNotFound(f"Hosted zone {zone_id} not found")

    text = ensure_text_zone_file(content, filename=filename)
    if not text.strip():
        raise BindParseError("Zone file is empty.")

    parsed = parse_zone(text, zone_origin=zone.name)
    existing_keys = _existing_keys(db, zone_id)
    prepared = _prepare(parsed, existing_keys)
    records = [
        BindPreviewRecord(
            index=index,
            line=item.parsed.line,
            name=str(item.columns["name"]),
            type=str(item.columns["type"]),
            value=_display_value(item.columns),
            ttl=int(item.columns["ttl"]),
            priority=_int_or_none(item.columns.get("priority")),
            weight=_int_or_none(item.columns.get("weight")),
            port=_int_or_none(item.columns.get("port")),
            caa_flag=_int_or_none(item.columns.get("caa_flag")),
            caa_tag=(
                str(item.columns["caa_tag"])
                if item.columns.get("caa_tag") is not None
                else None
            ),
            status=item.status,  # type: ignore[arg-type]
            reason=item.reason,
        )
        for index, item in enumerate(prepared)
    ]
    counts = BindPreviewCounts(
        valid=sum(1 for item in prepared if item.status == "valid"),
        invalid=sum(1 for item in prepared if item.status == "invalid"),
        unsupported=sum(1 for item in prepared if item.status == "unsupported"),
        duplicate=sum(1 for item in prepared if item.status == "duplicate"),
    )
    return BindPreviewOut(
        origin=zone.name,
        default_ttl=3600,
        records=records,
        counts=counts,
    )


def commit(
    db: Session,
    zone_id: str,
    user: User,
    content: str,
    filename: str | None,
    duplicate_mode: DuplicateMode,
) -> BindImportResultOut:
    zone = db.get(HostedZone, zone_id)
    if zone is None:
        raise HostedZoneNotFound(f"Hosted zone {zone_id} not found")

    text = ensure_text_zone_file(content, filename=filename)
    if not text.strip():
        raise BindParseError("Zone file is empty.")

    parsed = parse_zone(text, zone_origin=zone.name)
    existing = _existing_map(db, zone_id)
    prepared = _prepare(parsed, set(existing))

    imported = 0
    skipped = 0
    failures: list[BindImportFailure] = []

    for item in prepared:
        if item.status in {"invalid", "unsupported"}:
            failures.append(
                BindImportFailure(
                    name=str(item.columns["name"]),
                    type=str(item.columns["type"]),
                    value=_display_value(item.columns),
                    reason=item.reason or "Record cannot be imported.",
                )
            )
            continue
        if item.status == "duplicate" and duplicate_mode == "skip":
            skipped += 1
            continue
        try:
            write = dns_record_write_adapter.validate_python(
                _write_payload(item.columns)
            )
        except Exception as exc:  # noqa: BLE001 — surface as a failed row
            failures.append(
                BindImportFailure(
                    name=str(item.columns["name"]),
                    type=str(item.columns["type"]),
                    value=_display_value(item.columns),
                    reason=str(exc),
                )
            )
            continue

        columns = record_write_to_columns(write)
        key = _identity(columns)
        try:
            with db.begin_nested():
                if item.status == "duplicate" and duplicate_mode == "replace":
                    current = existing.get(key)
                    if current is None:
                        skipped += 1
                        continue
                    for field, value in columns.items():
                        setattr(current, field, value)
                    db.add(current)
                    db.flush()
                    imported += 1
                    continue

                record = DnsRecord(hosted_zone_id=zone_id, **columns)
                db.add(record)
                db.flush()
                existing[key] = record
                imported += 1
        except IntegrityError:
            failures.append(
                BindImportFailure(
                    name=str(item.columns["name"]),
                    type=str(item.columns["type"]),
                    value=_display_value(item.columns),
                    reason="Record could not be stored.",
                )
            )

    if imported:
        notification_service.enqueue_activity(
            db,
            user,
            title="DNS records imported",
            body=(
                f"[Notification] Imported {imported} DNS record"
                f"{'' if imported == 1 else 's'} into hosted zone {zone.name}."
            ),
            href=f"/hosted-zones/{zone.id}",
        )
    db.commit()
    return BindImportResultOut(
        imported=imported,
        skipped=skipped,
        failed=len(failures),
        failures=failures,
    )


def _prepare(
    parsed: list[ParsedBindRecord],
    existing_keys: set[tuple[object, ...]],
) -> list[_Prepared]:
    seen: set[tuple[object, ...]] = set()
    prepared: list[_Prepared] = []
    for record in parsed:
        status, reason, columns = validate_parsed_record(record)
        key = _identity(columns)
        if status == "valid" and (key in existing_keys or key in seen):
            status = "duplicate"
            reason = "A matching record already exists."
        if status == "valid":
            seen.add(key)
        prepared.append(
            _Prepared(
                parsed=record,
                status=status,
                reason=reason,
                columns=columns,
            )
        )
    return prepared


def _existing_keys(db: Session, zone_id: str) -> set[tuple[object, ...]]:
    return set(_existing_map(db, zone_id))


def _existing_map(db: Session, zone_id: str) -> dict[tuple[object, ...], DnsRecord]:
    rows = list(
        db.scalars(select(DnsRecord).where(DnsRecord.hosted_zone_id == zone_id)).all()
    )
    return {_identity_from_orm(row): row for row in rows}


def _identity(columns: dict[str, object]) -> tuple[object, ...]:
    return (
        normalize_owner(str(columns.get("name") or "")),
        str(columns.get("type") or "").upper(),
        str(columns.get("value") or ""),
        columns.get("priority"),
        columns.get("weight"),
        columns.get("port"),
        columns.get("caa_flag"),
        columns.get("caa_tag"),
    )


def _identity_from_orm(row: DnsRecord) -> tuple[object, ...]:
    return (
        normalize_owner(row.name),
        row.type.upper(),
        row.value,
        row.priority,
        row.weight,
        row.port,
        row.caa_flag,
        row.caa_tag,
    )


def _write_payload(columns: dict[str, object]) -> dict[str, object]:
    payload: dict[str, object] = {
        "name": columns["name"],
        "type": columns["type"],
        "ttl": columns["ttl"],
        "value": columns["value"],
    }
    rtype = str(columns["type"])
    if rtype == "MX":
        payload["priority"] = columns["priority"]
    if rtype == "SRV":
        payload["priority"] = columns["priority"]
        payload["weight"] = columns["weight"]
        payload["port"] = columns["port"]
    if rtype == "CAA":
        payload["caa_flag"] = columns["caa_flag"]
        payload["caa_tag"] = columns["caa_tag"]
    return payload


def _display_value(columns: dict[str, object]) -> str:
    rtype = str(columns.get("type") or "")
    value = str(columns.get("value") or "")
    if rtype == "MX" and columns.get("priority") is not None:
        return f"{columns['priority']} {value}"
    if rtype == "SRV" and None not in (
        columns.get("priority"),
        columns.get("weight"),
        columns.get("port"),
    ):
        return (
            f"{columns['priority']} {columns['weight']} "
            f"{columns['port']} {value}"
        )
    if rtype == "CAA" and columns.get("caa_flag") is not None:
        return f"{columns['caa_flag']} {columns['caa_tag']} {value}"
    return value


def _int_or_none(value: object) -> int | None:
    if value is None:
        return None
    return int(value)

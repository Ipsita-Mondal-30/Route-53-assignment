"""Build JSON / BIND exports for one or more hosted zones."""

from __future__ import annotations

import io
import json
import zipfile
from dataclasses import dataclass

from sqlalchemy.orm import Session

from app.models.dns_record import DnsRecord
from app.models.hosted_zone import HostedZone
from app.schemas.hosted_zone_export import (
    ExportFormat,
    ExportZoneType,
    ExportedHostedZone,
    ExportedHostedZoneBundle,
    ExportedRecord,
)
from app.services.bind_export import fqdn, record_rdata, render_zone_file, zone_filename
from app.services.dns_record_service import list_all
from app.services.hosted_zone_service import HostedZoneNotFound

_JSON_MEDIA = "application/json; charset=utf-8"
_BIND_MEDIA = "text/dns; charset=utf-8"
_ZIP_MEDIA = "application/zip"


@dataclass(frozen=True)
class ExportFile:
    filename: str
    content: bytes
    media_type: str


def export_zone(db: Session, zone_id: str, fmt: ExportFormat) -> ExportFile:
    zone, records = _load_zone(db, zone_id)
    document = _to_document(zone, records)
    if fmt == "json":
        return ExportFile(
            filename=zone_filename(zone.name, "json"),
            content=_json_bytes(document.model_dump()),
            media_type=_JSON_MEDIA,
        )
    return ExportFile(
        filename=zone_filename(zone.name, "zone"),
        content=render_zone_file(zone, records).encode("utf-8"),
        media_type=_BIND_MEDIA,
    )


def export_zones(
    db: Session, zone_ids: list[str], fmt: ExportFormat
) -> ExportFile:
    unique_ids = list(dict.fromkeys(zone_ids))
    loaded = [_load_zone(db, zone_id) for zone_id in unique_ids]
    if fmt == "json":
        documents = [_to_document(zone, records) for zone, records in loaded]
        if len(documents) == 1:
            payload: object = documents[0].model_dump()
            filename = zone_filename(loaded[0][0].name, "json")
        else:
            payload = ExportedHostedZoneBundle(zones=documents).model_dump()
            filename = "hosted-zones.json"
        return ExportFile(
            filename=filename,
            content=_json_bytes(payload),
            media_type=_JSON_MEDIA,
        )

    if len(loaded) == 1:
        zone, records = loaded[0]
        return ExportFile(
            filename=zone_filename(zone.name, "zone"),
            content=render_zone_file(zone, records).encode("utf-8"),
            media_type=_BIND_MEDIA,
        )

    buffer = io.BytesIO()
    used_names: set[str] = set()
    with zipfile.ZipFile(buffer, mode="w", compression=zipfile.ZIP_DEFLATED) as archive:
        for zone, records in loaded:
            name = _unique_name(zone_filename(zone.name, "zone"), used_names)
            archive.writestr(name, render_zone_file(zone, records))
    return ExportFile(
        filename="hosted-zones.zip",
        content=buffer.getvalue(),
        media_type=_ZIP_MEDIA,
    )


def _load_zone(db: Session, zone_id: str) -> tuple[HostedZone, list[DnsRecord]]:
    zone = db.get(HostedZone, zone_id)
    if zone is None:
        raise HostedZoneNotFound(f"Hosted zone {zone_id} not found")
    return zone, list_all(db, zone_id)


def _to_document(zone: HostedZone, records: list[DnsRecord]) -> ExportedHostedZone:
    zone_type: ExportZoneType = (
        "PRIVATE" if zone.type.lower() == "private" else "PUBLIC"
    )
    return ExportedHostedZone(
        name=fqdn(zone.name),
        zoneId=zone.id,
        type=zone_type,
        description=zone.comment or "",
        records=[
            ExportedRecord(
                name=fqdn(record.name),
                type=record.type.upper(),
                ttl=record.ttl,
                value=record_rdata(record),
            )
            for record in records
        ],
        tags=[],
    )


def _json_bytes(payload: object) -> bytes:
    return (json.dumps(payload, indent=2, ensure_ascii=False) + "\n").encode("utf-8")


def _unique_name(filename: str, used: set[str]) -> str:
    if filename not in used:
        used.add(filename)
        return filename
    stem, _, ext = filename.rpartition(".")
    index = 2
    while True:
        candidate = f"{stem}-{index}.{ext}"
        if candidate not in used:
            used.add(candidate)
            return candidate
        index += 1

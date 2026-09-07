"""Stable hosted-zone export schema.

Internal database columns (record ids, timestamps, MX/SRV/CAA split fields)
are not part of the public export document. Record values use BIND-style
rdata so JSON and zone-file exports stay aligned.
"""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

ExportFormat = Literal["json", "bind"]
ExportZoneType = Literal["PUBLIC", "PRIVATE"]


class ExportedRecord(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str
    type: str
    ttl: int
    value: str


class ExportedHostedZone(BaseModel):
    """Single-zone JSON document. Tags are reserved for a later tagging API."""

    model_config = ConfigDict(extra="forbid")

    name: str
    zoneId: str
    type: ExportZoneType
    description: str
    records: list[ExportedRecord]
    tags: list[dict[str, str]] = Field(default_factory=list)


class ExportedHostedZoneBundle(BaseModel):
    """Multi-zone JSON document used when exporting a selection."""

    model_config = ConfigDict(extra="forbid")

    zones: list[ExportedHostedZone]


class HostedZoneBulkExportRequest(BaseModel):
    zone_ids: list[str] = Field(min_length=1, max_length=50)
    format: ExportFormat

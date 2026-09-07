"""DNS record request/response schemas.

Tradeoff — discriminated union vs single model + model_validator
------------------------------------------------------------------
We use a **Pydantic v2 discriminated union** on ``type`` (not one flat schema
with a ``model_validator``).

Why union wins here:
- Each variant only declares the fields that type needs, and
  ``model_config = ConfigDict(extra="forbid")`` rejects irrelevant keys
  (e.g. ``priority`` on an A record) with a clear 422 — no hand-rolled checks.
- OpenAPI / client codegen get a proper oneOf per type.
- Required fields (MX ``priority``, SRV ``port``, …) are enforced by the
  type system instead of if/elif branches that drift from the ORM model.

A single schema + ``model_validator`` is less boilerplate for tiny APIs, but
you must manually assert required fields *and* forbidden extras, and the
OpenAPI surface collapses to one baggy object with many optional fields.
"""

from __future__ import annotations

from datetime import datetime
from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field, TypeAdapter

DnsRecordType = Literal[
    "A",
    "AAAA",
    "CNAME",
    "TXT",
    "MX",
    "NS",
    "PTR",
    "SRV",
    "CAA",
]

CaaTag = Literal["issue", "issuewild", "iodef"]


class _DnsRecordWriteBase(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str = Field(min_length=1, max_length=253)
    ttl: int = Field(default=300, ge=0, le=2_147_483_647)
    value: str = Field(min_length=1, max_length=4096)


class ARecordWrite(_DnsRecordWriteBase):
    type: Literal["A"]


class AAAARecordWrite(_DnsRecordWriteBase):
    type: Literal["AAAA"]


class CnameRecordWrite(_DnsRecordWriteBase):
    type: Literal["CNAME"]


class TxtRecordWrite(_DnsRecordWriteBase):
    type: Literal["TXT"]


class NsRecordWrite(_DnsRecordWriteBase):
    type: Literal["NS"]


class PtrRecordWrite(_DnsRecordWriteBase):
    type: Literal["PTR"]


class MxRecordWrite(_DnsRecordWriteBase):
    type: Literal["MX"]
    priority: int = Field(ge=0, le=65535)


class SrvRecordWrite(_DnsRecordWriteBase):
    type: Literal["SRV"]
    priority: int = Field(ge=0, le=65535)
    weight: int = Field(ge=0, le=65535)
    port: int = Field(ge=0, le=65535)


class CaaRecordWrite(_DnsRecordWriteBase):
    type: Literal["CAA"]
    caa_flag: int = Field(ge=0, le=255)
    caa_tag: CaaTag


DnsRecordWrite = Annotated[
    ARecordWrite
    | AAAARecordWrite
    | CnameRecordWrite
    | TxtRecordWrite
    | NsRecordWrite
    | PtrRecordWrite
    | MxRecordWrite
    | SrvRecordWrite
    | CaaRecordWrite,
    Field(discriminator="type"),
]

# TypeAdapter so FastAPI / callers can validate a raw dict against the union.
dns_record_write_adapter: TypeAdapter[DnsRecordWrite] = TypeAdapter(DnsRecordWrite)


class DnsRecordOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    hosted_zone_id: str
    name: str
    type: DnsRecordType
    ttl: int
    value: str
    priority: int | None = None
    weight: int | None = None
    port: int | None = None
    caa_flag: int | None = None
    caa_tag: str | None = None
    created_at: datetime
    updated_at: datetime


class DnsRecordListOut(BaseModel):
    items: list[DnsRecordOut]
    total: int
    page: int
    page_size: int


def record_write_to_columns(data: DnsRecordWrite) -> dict[str, object]:
    """Flatten a typed write payload into DnsRecord column values.

    Type-specific fields absent from a variant are stored as NULL so updates
    that change record type do not leave stale MX/SRV/CAA columns behind.
    """
    dumped = data.model_dump()
    return {
        "name": dumped["name"],
        "type": dumped["type"],
        "ttl": dumped["ttl"],
        "value": dumped["value"],
        "priority": dumped.get("priority"),
        "weight": dumped.get("weight"),
        "port": dumped.get("port"),
        "caa_flag": dumped.get("caa_flag"),
        "caa_tag": dumped.get("caa_tag"),
    }

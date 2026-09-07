from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field

DuplicateMode = Literal["skip", "replace"]
PreviewStatus = Literal["valid", "invalid", "unsupported", "duplicate"]


class BindImportRequest(BaseModel):
    content: str = Field(min_length=0, max_length=262144)
    filename: str | None = Field(default=None, max_length=255)


class BindImportCommitRequest(BindImportRequest):
    duplicate_mode: DuplicateMode = "skip"


class BindPreviewRecord(BaseModel):
    index: int
    line: int
    name: str
    type: str
    value: str
    ttl: int
    priority: int | None = None
    weight: int | None = None
    port: int | None = None
    caa_flag: int | None = None
    caa_tag: str | None = None
    status: PreviewStatus
    reason: str | None = None


class BindPreviewCounts(BaseModel):
    valid: int
    invalid: int
    unsupported: int
    duplicate: int


class BindPreviewOut(BaseModel):
    origin: str
    default_ttl: int
    records: list[BindPreviewRecord]
    counts: BindPreviewCounts


class BindImportFailure(BaseModel):
    name: str
    type: str
    value: str
    reason: str


class BindImportResultOut(BaseModel):
    imported: int
    skipped: int
    failed: int
    failures: list[BindImportFailure]

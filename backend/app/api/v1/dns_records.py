from __future__ import annotations

from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.core.exceptions import AppError, NotFoundError
from app.models.user import User
from app.schemas.bind_import import (
    BindImportCommitRequest,
    BindImportRequest,
    BindImportResultOut,
    BindPreviewOut,
)
from app.schemas.dns_record import (
    DnsRecordListOut,
    DnsRecordOut,
    DnsRecordType,
    DnsRecordWrite,
)
from app.services import bind_import_service, dns_record_service
from app.services.bind_parser import BindParseError

router = APIRouter(tags=["records"])


@router.get(
    "/hosted-zones/{zone_id}/records",
    response_model=DnsRecordListOut,
)
def list_dns_records(
    zone_id: str,
    search: str | None = Query(default=None),
    type: DnsRecordType | None = Query(  # noqa: A002 — matches API query param
        default=None,
        description="Filter by DNS record type",
    ),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_current_user),
) -> DnsRecordListOut:
    # HostedZoneNotFound -> 404 via global exception handler.
    result = dns_record_service.list_paginated(
        db,
        zone_id,
        search=search,
        record_type=type,
        page=page,
        page_size=page_size,
    )
    return DnsRecordListOut(
        items=result.items,
        total=result.total,
        page=result.page,
        page_size=result.page_size,
    )


@router.post(
    "/hosted-zones/{zone_id}/records/import/preview",
    response_model=BindPreviewOut,
)
def preview_bind_import(
    zone_id: str,
    body: BindImportRequest,
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_current_user),
) -> BindPreviewOut:
    try:
        return bind_import_service.preview(
            db, zone_id, body.content, body.filename
        )
    except BindParseError as exc:
        raise AppError(str(exc)) from exc


@router.post(
    "/hosted-zones/{zone_id}/records/import",
    response_model=BindImportResultOut,
)
def commit_bind_import(
    zone_id: str,
    body: BindImportCommitRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> BindImportResultOut:
    try:
        return bind_import_service.commit(
            db,
            zone_id,
            current_user,
            body.content,
            body.filename,
            body.duplicate_mode,
        )
    except BindParseError as exc:
        raise AppError(str(exc)) from exc


@router.post(
    "/hosted-zones/{zone_id}/records",
    response_model=DnsRecordOut,
    status_code=status.HTTP_201_CREATED,
)
def create_dns_record(
    zone_id: str,
    body: DnsRecordWrite,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> DnsRecordOut:
    return dns_record_service.create(db, zone_id, body, current_user)


@router.get("/records/{record_id}", response_model=DnsRecordOut)
def get_dns_record(
    record_id: str,
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_current_user),
) -> DnsRecordOut:
    record = dns_record_service.get_by_id(db, record_id)
    if record is None:
        raise NotFoundError(f"DNS record {record_id} not found")
    return record


@router.put("/records/{record_id}", response_model=DnsRecordOut)
def update_dns_record(
    record_id: str,
    body: DnsRecordWrite,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> DnsRecordOut:
    return dns_record_service.update(db, record_id, body, current_user)


@router.delete(
    "/records/{record_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
)
def delete_dns_record(
    record_id: str,
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_current_user),
) -> Response:
    dns_record_service.delete(db, record_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)

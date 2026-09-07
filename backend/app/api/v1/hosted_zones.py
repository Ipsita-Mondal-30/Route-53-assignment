from __future__ import annotations

from urllib.parse import quote

from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.core.exceptions import NotFoundError
from app.models.user import User
from app.schemas.hosted_zone import (
    HostedZoneCreate,
    HostedZoneListOut,
    HostedZoneOut,
    HostedZoneUpdate,
    SortBy,
    SortOrder,
)
from app.schemas.hosted_zone_export import ExportFormat, HostedZoneBulkExportRequest
from app.services import hosted_zone_export_service, hosted_zone_service
from app.services.hosted_zone_export_service import ExportFile

router = APIRouter(prefix="/hosted-zones", tags=["hosted-zones"])


@router.get("", response_model=HostedZoneListOut)
def list_hosted_zones(
    search: str | None = Query(default=None),
    sort_by: SortBy = Query(default="name"),
    sort_order: SortOrder = Query(default="asc"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_current_user),
) -> HostedZoneListOut:
    result = hosted_zone_service.list_paginated(
        db,
        search=search,
        sort_by=sort_by,
        sort_order=sort_order,
        page=page,
        page_size=page_size,
    )
    return HostedZoneListOut(
        items=result.items,
        total=result.total,
        page=result.page,
        page_size=result.page_size,
    )


@router.post(
    "",
    response_model=HostedZoneOut,
    status_code=status.HTTP_201_CREATED,
)
def create_hosted_zone(
    body: HostedZoneCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> HostedZoneOut:
    # HostedZoneConflict -> 409 via global exception handler.
    return hosted_zone_service.create(db, current_user, body)


@router.post("/export")
def export_hosted_zones(
    body: HostedZoneBulkExportRequest,
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_current_user),
) -> Response:
    """Export one or more hosted zones as JSON, BIND, or a BIND zip."""
    payload = hosted_zone_export_service.export_zones(
        db, body.zone_ids, body.format
    )
    return _attachment_response(payload)


@router.get("/{zone_id}/export")
def export_hosted_zone(
    zone_id: str,
    format: ExportFormat = Query(default="json"),  # noqa: A002 — public query name
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_current_user),
) -> Response:
    payload = hosted_zone_export_service.export_zone(db, zone_id, format)
    return _attachment_response(payload)


def _attachment_response(payload: ExportFile) -> Response:
    ascii_name = payload.filename.encode("ascii", "replace").decode("ascii")
    disposition = (
        f'attachment; filename="{ascii_name}"; '
        f"filename*=UTF-8''{quote(payload.filename)}"
    )
    return Response(
        content=payload.content,
        media_type=payload.media_type,
        headers={
            "Content-Disposition": disposition,
            "X-Export-Filename": payload.filename,
        },
    )


@router.get("/{zone_id}", response_model=HostedZoneOut)
def get_hosted_zone(
    zone_id: str,
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_current_user),
) -> HostedZoneOut:
    zone = hosted_zone_service.get_by_id(db, zone_id)
    if zone is None:
        raise NotFoundError(f"Hosted zone {zone_id} not found")
    return zone


@router.put("/{zone_id}", response_model=HostedZoneOut)
def update_hosted_zone(
    zone_id: str,
    body: HostedZoneUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> HostedZoneOut:
    # HostedZoneNotFound -> 404 via global exception handler.
    return hosted_zone_service.update(db, zone_id, body, current_user)


@router.delete(
    "/{zone_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
)
def delete_hosted_zone(
    zone_id: str,
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_current_user),
) -> Response:
    hosted_zone_service.delete(db, zone_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)

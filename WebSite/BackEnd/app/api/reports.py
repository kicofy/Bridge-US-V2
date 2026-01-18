from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import get_admin_user, get_current_user
from app.core.database import get_db
from app.models.models import User
from app.schemas.report import ReportCreateRequest, ReportResolveRequest, ReportResponse
from app.services.report_service import create_report, list_my_reports, list_reports, resolve_report


router = APIRouter(prefix="/reports", tags=["reports"])


@router.post("", response_model=ReportResponse)
async def create(
    payload: ReportCreateRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    report = await create_report(
        db, user.id, payload.target_type, payload.target_id, payload.reason, payload.evidence
    )
    return ReportResponse(**report.__dict__)


@router.get("/me", response_model=list[ReportResponse])
async def my_reports(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    reports = await list_my_reports(db, user.id, limit, offset)
    return [ReportResponse(**report.__dict__) for report in reports]


@router.get("", response_model=list[ReportResponse])
async def all_reports(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    _: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    reports = await list_reports(db, limit, offset)
    return [ReportResponse(**report.__dict__) for report in reports]


@router.post("/{report_id}/resolve", response_model=ReportResponse)
async def resolve(
    report_id: str,
    payload: ReportResolveRequest,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    report = await resolve_report(db, report_id, admin.id, payload.action, payload.note)
    return ReportResponse(**report.__dict__)


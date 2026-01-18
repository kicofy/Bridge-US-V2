from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import get_admin_user, get_current_user
from app.core.database import get_db
from app.models.models import User
from app.schemas.verification import VerificationStatusResponse, VerificationSubmitRequest
from app.services.verification_service import (
    approve_verification,
    get_latest_verification,
    list_verification_queue,
    reject_verification,
    submit_verification,
)


router = APIRouter(prefix="/verification", tags=["verification"])


@router.post("/submit", response_model=VerificationStatusResponse)
async def submit(
    payload: VerificationSubmitRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    request = await submit_verification(db, user.id, payload.docs_url)
    return VerificationStatusResponse(request_id=request.id, status=request.status)


@router.get("/status", response_model=VerificationStatusResponse | None)
async def status(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    request = await get_latest_verification(db, user.id)
    if request is None:
        return None
    return VerificationStatusResponse(request_id=request.id, status=request.status)


@router.get("/queue")
async def queue(
    _: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    items = await list_verification_queue(db)
    return [
        {"id": item.id, "user_id": item.user_id, "status": item.status} for item in items
    ]


@router.post("/{request_id}/approve")
async def approve(
    request_id: str,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    await approve_verification(db, request_id, admin.id)
    return {"status": "ok"}


@router.post("/{request_id}/reject")
async def reject(
    request_id: str,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    await reject_verification(db, request_id, admin.id)
    return {"status": "ok"}


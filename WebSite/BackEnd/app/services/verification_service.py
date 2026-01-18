from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import AppError
from app.models.models import File, Profile, VerificationRequest
from app.services.audit_service import log_action
from app.services.notification_service import create_notification


async def submit_verification(db: AsyncSession, user_id: str, docs_url: str) -> VerificationRequest:
    file_record = File(owner_id=user_id, purpose="verification", url=docs_url)
    db.add(file_record)
    await db.flush()

    request = VerificationRequest(user_id=user_id, docs_file_id=file_record.id)
    db.add(request)
    await db.commit()
    await db.refresh(request)
    return request


async def get_latest_verification(db: AsyncSession, user_id: str) -> VerificationRequest | None:
    result = await db.execute(
        select(VerificationRequest)
        .where(VerificationRequest.user_id == user_id)
        .order_by(VerificationRequest.created_at.desc())
    )
    return result.scalars().first()


async def list_verification_queue(db: AsyncSession) -> list[VerificationRequest]:
    result = await db.execute(
        select(VerificationRequest).where(VerificationRequest.status == "pending")
    )
    return list(result.scalars().all())


async def approve_verification(db: AsyncSession, request_id: str, reviewer_id: str) -> None:
    result = await db.execute(select(VerificationRequest).where(VerificationRequest.id == request_id))
    request = result.scalar_one_or_none()
    if request is None:
        raise AppError(code="verification_not_found", message="Request not found", status_code=404)
    request.status = "approved"
    request.reviewer_id = reviewer_id
    profile_result = await db.execute(select(Profile).where(Profile.user_id == request.user_id))
    profile = profile_result.scalar_one_or_none()
    if profile is not None:
        profile.credibility_score = max(profile.credibility_score, 80)
    await create_notification(
        db,
        request.user_id,
        "verification_approved",
        {"request_id": request.id},
        dedupe_key=str(request.id),
    )
    await log_action(db, reviewer_id, "verification", request.id, "verification_approve", None)
    await db.commit()


async def reject_verification(db: AsyncSession, request_id: str, reviewer_id: str) -> None:
    result = await db.execute(select(VerificationRequest).where(VerificationRequest.id == request_id))
    request = result.scalar_one_or_none()
    if request is None:
        raise AppError(code="verification_not_found", message="Request not found", status_code=404)
    request.status = "rejected"
    request.reviewer_id = reviewer_id
    await create_notification(
        db,
        request.user_id,
        "verification_rejected",
        {"request_id": request.id},
        dedupe_key=str(request.id),
    )
    await log_action(db, reviewer_id, "verification", request.id, "verification_reject", None)
    await db.commit()


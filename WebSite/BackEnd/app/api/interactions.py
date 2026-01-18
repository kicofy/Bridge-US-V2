from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import get_current_user
from app.core.database import get_db
from app.models.models import User
from app.schemas.interaction import AccuracyFeedbackRequest, AccuracyResponse, HelpfulnessResponse
from app.services.interaction_service import (
    delete_accuracy_feedback,
    mark_helpful_post,
    mark_helpful_reply,
    submit_accuracy_feedback,
    unmark_helpful_post,
    unmark_helpful_reply,
    update_accuracy_feedback,
)


router = APIRouter(prefix="/interactions", tags=["interactions"])


@router.post("/posts/{post_id}/helpful", response_model=HelpfulnessResponse)
async def helpful_post(
    post_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await mark_helpful_post(db, user.id, post_id)
    return HelpfulnessResponse(status="ok")


@router.delete("/posts/{post_id}/helpful", response_model=HelpfulnessResponse)
async def unhelpful_post(
    post_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await unmark_helpful_post(db, user.id, post_id)
    return HelpfulnessResponse(status="ok")


@router.post("/replies/{reply_id}/helpful", response_model=HelpfulnessResponse)
async def helpful_reply(
    reply_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await mark_helpful_reply(db, user.id, reply_id)
    return HelpfulnessResponse(status="ok")


@router.delete("/replies/{reply_id}/helpful", response_model=HelpfulnessResponse)
async def unhelpful_reply(
    reply_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await unmark_helpful_reply(db, user.id, reply_id)
    return HelpfulnessResponse(status="ok")


@router.post("/posts/{post_id}/accuracy", response_model=AccuracyResponse)
async def accuracy_feedback(
    post_id: str,
    payload: AccuracyFeedbackRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await submit_accuracy_feedback(db, user.id, post_id, payload)
    return AccuracyResponse(status="ok")


@router.put("/posts/{post_id}/accuracy", response_model=AccuracyResponse)
async def update_accuracy(
    post_id: str,
    payload: AccuracyFeedbackRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await update_accuracy_feedback(db, user.id, post_id, payload)
    return AccuracyResponse(status="ok")


@router.delete("/posts/{post_id}/accuracy", response_model=AccuracyResponse)
async def delete_accuracy(
    post_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await delete_accuracy_feedback(db, user.id, post_id)
    return AccuracyResponse(status="ok")


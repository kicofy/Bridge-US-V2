from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import get_admin_user, get_current_user
from app.core.database import get_db
from app.models.models import PostTranslation, User
from app.schemas.moderation import (
    AppealCreateRequest,
    AppealResponse,
    ModerationDecisionRequest,
    ModerationLogResponse,
)
from app.services.moderation_service import (
    create_appeal,
    get_log,
    list_appeals,
    list_logs,
    list_user_appeals,
    list_user_logs,
    list_pending_posts,
    resolve_appeal,
    resolve_post_review,
)


router = APIRouter(prefix="/moderation", tags=["moderation"])


@router.get("/logs", response_model=list[ModerationLogResponse])
async def get_logs(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    _: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    logs = await list_logs(db, limit, offset)
    return [ModerationLogResponse(**log.__dict__) for log in logs]


@router.get("/logs/{log_id}", response_model=ModerationLogResponse)
async def get_log_item(
    log_id: str,
    _: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    log = await get_log(db, log_id)
    return ModerationLogResponse(**log.__dict__)


@router.get("/users/{user_id}/logs", response_model=list[ModerationLogResponse])
async def get_user_logs(
    user_id: str,
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    _: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    logs = await list_user_logs(db, user_id, limit, offset)
    return [ModerationLogResponse(**log.__dict__) for log in logs]


@router.get("/me/logs", response_model=list[ModerationLogResponse])
async def get_my_logs(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    logs = await list_user_logs(db, user.id, limit, offset)
    return [ModerationLogResponse(**log.__dict__) for log in logs]


@router.post("/appeals", response_model=AppealResponse)
async def submit_appeal(
    payload: AppealCreateRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    appeal = await create_appeal(db, user.id, payload.target_type, payload.target_id, payload.reason)
    return AppealResponse(**appeal.__dict__)


@router.get("/appeals", response_model=list[AppealResponse])
async def list_appeal_items(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    _: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    appeals = await list_appeals(db, limit, offset)
    return [AppealResponse(**appeal.__dict__) for appeal in appeals]


@router.get("/appeals/me", response_model=list[AppealResponse])
async def list_my_appeals(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    appeals = await list_user_appeals(db, user.id, limit, offset)
    return [AppealResponse(**appeal.__dict__) for appeal in appeals]


@router.post("/appeals/{appeal_id}/approve", response_model=AppealResponse)
async def approve_appeal(
    appeal_id: str,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    appeal = await resolve_appeal(db, appeal_id, admin.id, "approved")
    return AppealResponse(**appeal.__dict__)


@router.post("/appeals/{appeal_id}/reject", response_model=AppealResponse)
async def reject_appeal(
    appeal_id: str,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    appeal = await resolve_appeal(db, appeal_id, admin.id, "rejected")
    return AppealResponse(**appeal.__dict__)


@router.get("/queue/posts")
async def get_pending_posts(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    _: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    posts = await list_pending_posts(db, limit, offset)
    if not posts:
        return []

    post_ids = [post.id for post in posts]
    author_ids = {post.author_id for post in posts}

    users_by_id: dict[str, User] = {}
    if author_ids:
        result = await db.execute(select(User).where(User.id.in_(author_ids)))
        users_by_id = {user.id: user for user in result.scalars().all()}

    translations_by_post: dict[str, list[PostTranslation]] = {}
    result = await db.execute(select(PostTranslation).where(PostTranslation.post_id.in_(post_ids)))
    for translation in result.scalars().all():
        translations_by_post.setdefault(translation.post_id, []).append(translation)

    response = []
    for post in posts:
        translations = translations_by_post.get(post.id, [])
        selected = next(
            (t for t in translations if t.language == post.original_language),
            translations[0] if translations else None,
        )
        author = users_by_id.get(post.author_id)
        response.append(
            {
                "id": post.id,
                "author_id": post.author_id,
                "author_email": author.email if author else None,
                "status": post.status,
                "created_at": post.created_at,
                "original_language": post.original_language,
                "title": selected.title if selected else None,
            }
        )
    return response


@router.post("/posts/{post_id}/approve")
async def approve_post(
    post_id: str,
    payload: ModerationDecisionRequest,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    post = await resolve_post_review(db, post_id, admin.id, "approve", payload.reason)
    return {"status": "ok", "post_id": post.id, "post_status": post.status}


@router.post("/posts/{post_id}/reject")
async def reject_post(
    post_id: str,
    payload: ModerationDecisionRequest,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    post = await resolve_post_review(db, post_id, admin.id, "reject", payload.reason)
    return {"status": "ok", "post_id": post.id, "post_status": post.status}


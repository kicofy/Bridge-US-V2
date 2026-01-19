from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import get_admin_user, get_root_admin_user
from app.core.database import get_db
from app.models.models import User
from app.schemas.audit import AuditLogResponse
from app.schemas.admin_stats import AdminStatsResponse
from app.services.admin_service import (
    admin_set_post_status,
    admin_set_reply_status,
    backfill_post_categories,
    list_users,
    set_user_role,
    set_user_status,
)
from app.services.admin_stats_service import get_admin_stats
from app.services.audit_query_service import list_audit_logs


router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/users")
async def users(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    _: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    items = await list_users(db, limit, offset)
    return [
        {"id": user.id, "email": user.email, "role": user.role, "status": user.status}
        for user in items
    ]


@router.get("/stats", response_model=AdminStatsResponse)
async def stats(
    _: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    return await get_admin_stats(db)


@router.get("/audit/logs", response_model=list[AuditLogResponse])
async def audit_logs(
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    _: User = Depends(get_root_admin_user),
    db: AsyncSession = Depends(get_db),
):
    items = await list_audit_logs(db, limit, offset)
    return [AuditLogResponse(**item.__dict__) for item in items]


@router.post("/users/{user_id}/ban")
async def ban_user(
    user_id: str,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    user = await set_user_status(db, user_id, "banned", admin.id)
    return {"status": "ok", "user_id": user.id, "user_status": user.status}


@router.post("/users/{user_id}/unban")
async def unban_user(
    user_id: str,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    user = await set_user_status(db, user_id, "active", admin.id)
    return {"status": "ok", "user_id": user.id, "user_status": user.status}


@router.post("/users/{user_id}/make-admin")
async def make_admin(
    user_id: str,
    admin: User = Depends(get_root_admin_user),
    db: AsyncSession = Depends(get_db),
):
    user = await set_user_role(db, user_id, "admin", admin.id)
    return {"status": "ok", "user_id": user.id, "user_role": user.role}


@router.post("/posts/{post_id}/hide")
async def hide_post(
    post_id: str,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    post = await admin_set_post_status(db, post_id, admin.id, "hidden", "admin_hide")
    return {"status": "ok", "post_id": post.id, "post_status": post.status}


@router.post("/posts/{post_id}/restore")
async def restore_post(
    post_id: str,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    post = await admin_set_post_status(db, post_id, admin.id, "published", "admin_restore")
    return {"status": "ok", "post_id": post.id, "post_status": post.status}


@router.post("/replies/{reply_id}/hide")
async def hide_reply(
    reply_id: str,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    reply = await admin_set_reply_status(db, reply_id, admin.id, "hidden", "admin_hide")
    return {"status": "ok", "reply_id": reply.id, "reply_status": reply.status}


@router.post("/replies/{reply_id}/restore")
async def restore_reply(
    reply_id: str,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    reply = await admin_set_reply_status(db, reply_id, admin.id, "visible", "admin_restore")
    return {"status": "ok", "reply_id": reply.id, "reply_status": reply.status}


@router.post("/posts/backfill-categories")
async def backfill_categories(
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    result = await backfill_post_categories(db, admin.id)
    return {"status": "ok", **result}


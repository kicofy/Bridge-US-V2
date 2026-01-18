from fastapi import Depends, Header
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.core.errors import AppError
from app.core.security import decode_token
from app.models.models import User


async def get_current_user(
    authorization: str | None = Header(default=None),
    db: AsyncSession = Depends(get_db),
) -> User:
    if not authorization or not authorization.startswith("Bearer "):
        raise AppError(code="unauthorized", message="Missing token", status_code=401)
    token = authorization.split(" ", 1)[1]
    try:
        payload = decode_token(token)
    except ValueError as exc:
        raise AppError(code="invalid_token", message="Invalid token", status_code=401) from exc
    user_id = payload.get("sub")
    if not user_id:
        raise AppError(code="invalid_token", message="Invalid token", status_code=401)
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None:
        raise AppError(code="unauthorized", message="User not found", status_code=401)
    if user.status == "banned":
        raise AppError(code="user_banned", message="User is banned", status_code=403)
    return user


async def get_admin_user(user: User = Depends(get_current_user)) -> User:
    if user.role != "admin":
        raise AppError(code="forbidden", message="Admin only", status_code=403)
    return user


async def get_current_admin_user(user: User = Depends(get_current_user)) -> User:
    return await get_admin_user(user)


async def get_root_admin_user(user: User = Depends(get_current_user)) -> User:
    await get_admin_user(user)
    if not settings.root_account or user.email != settings.root_account:
        raise AppError(code="forbidden", message="Root admin only", status_code=403)
    return user


from datetime import datetime, timedelta, timezone
import secrets

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import AppError
from app.core.config import settings
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    hash_token,
    verify_password,
)
from app.models.models import EmailVerificationCode, Profile, User, UserSession
from app.services.email_service import send_email


async def register_user(
    db: AsyncSession, email: str, password: str, display_name: str, code: str
) -> tuple[str, str]:
    await verify_email_code(db, email, code, purpose="register")
    existing = await db.execute(select(User).where(User.email == email))
    if existing.scalar_one_or_none() is not None:
        raise AppError(code="email_exists", message="Email already registered", status_code=409)

    user = User(email=email, password_hash=hash_password(password))
    profile = Profile(user_id=user.id, display_name=display_name)

    db.add(user)
    await db.flush()
    profile.user_id = user.id
    db.add(profile)
    await db.commit()

    return await issue_tokens(db, user.id)


async def authenticate_user(db: AsyncSession, email: str, password: str) -> tuple[str, str]:
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if user is None or not verify_password(password, user.password_hash):
        raise AppError(code="invalid_credentials", message="Invalid credentials", status_code=401)
    if user.status == "banned":
        raise AppError(code="user_banned", message="User is banned", status_code=403)
    return await issue_tokens(db, user.id)


async def issue_tokens(db: AsyncSession, user_id: str) -> tuple[str, str]:
    access_token = create_access_token(user_id)
    refresh_token = create_refresh_token(user_id)
    expires_at = datetime.now(timezone.utc) + timedelta(days=settings.refresh_token_days)
    session = UserSession(
        user_id=user_id,
        refresh_token_hash=hash_token(refresh_token),
        expires_at=expires_at,
    )
    db.add(session)
    await db.commit()
    return access_token, refresh_token


async def refresh_access_token(db: AsyncSession, refresh_token: str) -> tuple[str, str]:
    try:
        payload = decode_token(refresh_token)
    except ValueError as exc:
        raise AppError(code="invalid_refresh", message="Invalid refresh token", status_code=401) from exc
    if payload.get("typ") != "refresh":
        raise AppError(code="invalid_refresh", message="Invalid refresh token", status_code=401)
    token_hash = hash_token(refresh_token)
    result = await db.execute(
        select(UserSession)
        .where(UserSession.refresh_token_hash == token_hash)
        .order_by(UserSession.created_at.desc())
    )
    session = result.scalars().first()
    if session is None or session.revoked_at is not None:
        raise AppError(code="invalid_refresh", message="Invalid refresh token", status_code=401)
    return await issue_tokens(db, session.user_id)


async def revoke_refresh_token(db: AsyncSession, refresh_token: str) -> None:
    token_hash = hash_token(refresh_token)
    result = await db.execute(select(UserSession).where(UserSession.refresh_token_hash == token_hash))
    session = result.scalar_one_or_none()
    if session is None:
        return
    session.revoked_at = datetime.now(timezone.utc)
    await db.commit()


async def reset_password(
    db: AsyncSession, user_id: str, current_password: str, new_password: str
) -> None:
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None or not verify_password(current_password, user.password_hash):
        raise AppError(code="invalid_credentials", message="Invalid credentials", status_code=401)
    user.password_hash = hash_password(new_password)
    await revoke_user_sessions(db, user.id)
    from app.services.notification_service import create_notification

    await create_notification(
        db,
        user.id,
        "password_changed",
        {"method": "current_password"},
        dedupe_key=f"password_changed:{user.id}:{datetime.utcnow().date()}",
    )
    await db.commit()


async def send_email_code(db: AsyncSession, email: str, purpose: str) -> str:
    code = f"{secrets.randbelow(1000000):06d}"
    expires_at = datetime.utcnow() + timedelta(minutes=settings.email_code_expire_minutes)
    db.add(
        EmailVerificationCode(
            email=email,
            purpose=purpose,
            code=code,
            expires_at=expires_at,
        )
    )
    await db.commit()
    if settings.smtp_host or settings.email_host:
        await send_email(
            email,
            "BridgeUS Verification Code",
            f"Your verification code is: {code}. It expires in {settings.email_code_expire_minutes} minutes.",
        )
    elif not (settings.environment == "local" and settings.email_debug_return_code):
        raise AppError(code="email_not_configured", message="Email not configured", status_code=500)
    return code


async def verify_email_code(db: AsyncSession, email: str, code: str, purpose: str) -> None:
    result = await db.execute(
        select(EmailVerificationCode)
        .where(
            EmailVerificationCode.email == email,
            EmailVerificationCode.purpose == purpose,
            EmailVerificationCode.code == code,
            EmailVerificationCode.used_at.is_(None),
        )
        .order_by(EmailVerificationCode.created_at.desc())
    )
    record = result.scalars().first()
    if record is None or record.expires_at < datetime.utcnow():
        raise AppError(code="invalid_code", message="Invalid or expired code", status_code=400)
    record.used_at = datetime.now(timezone.utc)
    await db.commit()


async def reset_password_with_code(
    db: AsyncSession, email: str, code: str, new_password: str
) -> None:
    await verify_email_code(db, email, code, purpose="reset")
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if user is None:
        raise AppError(code="user_not_found", message="User not found", status_code=404)
    user.password_hash = hash_password(new_password)
    await revoke_user_sessions(db, user.id)
    from app.services.notification_service import create_notification

    await create_notification(
        db,
        user.id,
        "password_changed",
        {"method": "email_code"},
        dedupe_key=f"password_changed:{user.id}:{datetime.utcnow().date()}",
    )
    await db.commit()


async def revoke_user_sessions(db: AsyncSession, user_id: str) -> None:
    result = await db.execute(select(UserSession).where(UserSession.user_id == user_id))
    sessions = result.scalars().all()
    if not sessions:
        return
    now = datetime.now(timezone.utc)
    for session in sessions:
        session.revoked_at = now
    await db.commit()


async def ensure_root_admin(db: AsyncSession) -> None:
    if not settings.root_account or not settings.root_password:
        return
    result = await db.execute(select(User).where(User.email == settings.root_account))
    user = result.scalar_one_or_none()
    if user is None:
        user = User(
            email=settings.root_account,
            password_hash=hash_password(settings.root_password),
            role="admin",
            status="active",
        )
        profile = Profile(user_id=user.id, display_name="Root Admin")
        db.add(user)
        await db.flush()
        profile.user_id = user.id
        db.add(profile)
        await db.commit()
        return
    if user.role != "admin":
        user.role = "admin"
        await db.commit()


from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.errors import AppError
from app.core.auth import get_current_user
from app.core.config import settings
from app.models.models import User
from app.schemas.auth import (
    ForgotPasswordRequest,
    LoginRequest,
    LogoutRequest,
    RefreshRequest,
    RegisterRequest,
    ResetPasswordRequest,
    SendEmailCodeRequest,
    SendEmailCodeResponse,
    TokenResponse,
)
from app.services.auth_service import (
    authenticate_user,
    refresh_access_token,
    register_user,
    reset_password_with_code,
    send_email_code,
    reset_password,
    revoke_refresh_token,
)


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse)
async def register(payload: RegisterRequest, db: AsyncSession = Depends(get_db)):
    access_token, refresh_token = await register_user(
        db, payload.email, payload.password, payload.display_name, payload.code
    )
    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_db)):
    access_token, refresh_token = await authenticate_user(db, payload.email, payload.password)
    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.post("/refresh", response_model=TokenResponse)
async def refresh(payload: RefreshRequest, db: AsyncSession = Depends(get_db)):
    access_token, refresh_token = await refresh_access_token(db, payload.refresh_token)
    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.post("/logout")
async def logout(payload: LogoutRequest, db: AsyncSession = Depends(get_db)):
    await revoke_refresh_token(db, payload.refresh_token)
    return {"status": "ok"}


@router.post("/send-code", response_model=SendEmailCodeResponse)
async def send_code(payload: SendEmailCodeRequest, db: AsyncSession = Depends(get_db)):
    code = await send_email_code(db, payload.email, payload.purpose)
    response = SendEmailCodeResponse(status="ok")
    if settings.environment == "local" and settings.email_debug_return_code:
        response.code = code
    return response


@router.post("/reset-password")
async def reset_password_endpoint(
    payload: ResetPasswordRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await reset_password(db, user.id, payload.current_password, payload.new_password)
    return {"status": "ok"}


@router.post("/forgot-password")
async def forgot_password(payload: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    await reset_password_with_code(db, payload.email, payload.code, payload.new_password)
    return {"status": "ok"}


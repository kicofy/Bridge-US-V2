from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.api.auth import router as auth_router
from app.api.health import router as health_router
from app.api.moderation import router as moderation_router
from app.api.categories import router as categories_router
from app.api.interactions import router as interactions_router
from app.api.ai import router as ai_router
from app.api.notifications import router as notifications_router
from app.api.posts import router as posts_router
from app.api.profile import router as profile_router
from app.api.replies import router as replies_router
from app.api.reports import router as reports_router
from app.api.search import router as search_router
from app.api.tags import router as tags_router
from app.api.verification import router as verification_router
from app.api.admin import router as admin_router
from app.core.config import settings
from app.core.database import SessionLocal
from app.core.errors import AppError, app_error_handler, http_exception_handler
from app.core.logging import setup_logging
from app.core.middleware import ProcessTimeMiddleware, RequestIdMiddleware
from app.services.auth_service import ensure_root_admin


def create_app() -> FastAPI:
    setup_logging(settings.log_level)
    app = FastAPI(title=settings.app_name)

    app.add_middleware(RequestIdMiddleware)
    app.add_middleware(ProcessTimeMiddleware)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins.split(","),
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.add_exception_handler(AppError, app_error_handler)
    app.add_exception_handler(StarletteHTTPException, http_exception_handler)

    @app.on_event("startup")
    async def _ensure_root_admin() -> None:
        async with SessionLocal() as session:
            await ensure_root_admin(session)

    app.include_router(health_router, prefix=settings.api_prefix)
    app.include_router(auth_router, prefix=settings.api_prefix)
    app.include_router(profile_router, prefix=settings.api_prefix)
    app.include_router(verification_router, prefix=settings.api_prefix)
    app.include_router(posts_router, prefix=settings.api_prefix)
    app.include_router(moderation_router, prefix=settings.api_prefix)
    app.include_router(categories_router, prefix=settings.api_prefix)
    app.include_router(tags_router, prefix=settings.api_prefix)
    app.include_router(replies_router, prefix=settings.api_prefix)
    app.include_router(interactions_router, prefix=settings.api_prefix)
    app.include_router(search_router, prefix=settings.api_prefix)
    app.include_router(reports_router, prefix=settings.api_prefix)
    app.include_router(admin_router, prefix=settings.api_prefix)
    app.include_router(ai_router, prefix=settings.api_prefix)
    app.include_router(notifications_router, prefix=settings.api_prefix)
    return app


app = create_app()


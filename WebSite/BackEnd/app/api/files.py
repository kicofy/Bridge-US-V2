import os
import uuid

from fastapi import APIRouter, Depends, Request, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import get_current_user
from app.core.config import settings
from app.core.database import get_db
from app.core.errors import AppError
from app.models.models import File, User
from app.schemas.file import FileUploadResponse


router = APIRouter(prefix="/files", tags=["files"])


def _build_public_url(request: Request, filename: str) -> str:
    base_url = str(request.base_url).rstrip("/")
    return f"{base_url}{settings.uploads_url}/{filename}"


@router.post("/upload", response_model=FileUploadResponse)
async def upload_file(
    request: Request,
    file: UploadFile,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if file.content_type is None:
        raise AppError(code="invalid_file", message="Invalid file type", status_code=400)

    allowed_types = {t.strip() for t in settings.upload_allowed_types.split(",") if t.strip()}
    if file.content_type not in allowed_types:
        raise AppError(code="invalid_file_type", message="Unsupported file type", status_code=400)

    ext = os.path.splitext(file.filename or "")[1].lower()
    if not ext:
        ext = {
            "image/jpeg": ".jpg",
            "image/png": ".png",
            "image/webp": ".webp",
            "image/gif": ".gif",
        }.get(file.content_type, "")

    os.makedirs(settings.uploads_dir, exist_ok=True)
    filename = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(settings.uploads_dir, filename)

    max_bytes = settings.upload_max_mb * 1024 * 1024
    total_size = 0

    try:
        with open(file_path, "wb") as output:
            while True:
                chunk = await file.read(1024 * 1024)
                if not chunk:
                    break
                total_size += len(chunk)
                if total_size > max_bytes:
                    raise AppError(code="file_too_large", message="File too large", status_code=413)
                output.write(chunk)
    except AppError:
        if os.path.exists(file_path):
            os.remove(file_path)
        raise

    public_url = _build_public_url(request, filename)
    record = File(
        owner_id=user.id,
        purpose="post_image",
        url=public_url,
        mime=file.content_type,
        size=total_size,
    )
    db.add(record)
    await db.commit()
    await db.refresh(record)

    return FileUploadResponse(
        id=record.id,
        url=record.url,
        mime=record.mime,
        size=record.size,
    )


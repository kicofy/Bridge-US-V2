from datetime import datetime, timedelta, timezone
import logging

from sqlalchemy import and_, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import engine
from app.models.base import Base
from app.models.models import Post, PostTranslation, Profile, Reply, ReplyTranslation, TranslationJob
from app.services.ai_service import (
    translate_content_preserving_structure_async,
    translate_post_async,
)


logger = logging.getLogger(__name__)

RETRY_DELAYS = (timedelta(minutes=1), timedelta(minutes=5), timedelta(minutes=30))


def _languages() -> list[str]:
    return [lang.strip() for lang in settings.supported_languages.split(",") if lang.strip()]


async def ensure_translation_job_schema() -> None:
    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all, tables=[TranslationJob.__table__])


async def enqueue_missing_post_translations(
    db: AsyncSession, post_id: str, reset_existing: bool = False
) -> int:
    result = await db.execute(select(Post).where(Post.id == post_id))
    post = result.scalar_one_or_none()
    if post is None or post.status != "published":
        return 0

    created = 0
    for language in _languages():
        if language == post.original_language:
            continue
        translation = await _get_post_translation(db, post_id, language)
        if translation is None:
            db.add(
                PostTranslation(
                    post_id=post_id,
                    language=language,
                    title="",
                    content="",
                    status="pending",
                    translated_by="ai",
                    model=settings.openai_model,
                )
            )
            created += 1
        elif reset_existing:
            translation.title = ""
            translation.content = ""
            translation.status = "pending"
            translation.model = settings.openai_model
            created += 1
        elif translation.status == "ready" and translation.content:
            continue

        if await _upsert_job(db, "post", post_id, language, reset=reset_existing):
            created += 1

    if created:
        await db.flush()
    return created


async def enqueue_reply_translations(
    db: AsyncSession, reply_id: str, reset_existing: bool = False
) -> int:
    reply = await _get_reply(db, reply_id)
    if reply is None or reply.status != "visible":
        return 0
    source_language = await _reply_source_language(db, reply)
    created = 0
    for language in _languages():
        if language == source_language:
            continue
        translation = await _get_reply_translation(db, reply_id, language)
        if translation is None:
            db.add(
                ReplyTranslation(
                    reply_id=reply_id,
                    language=language,
                    content="",
                    status="pending",
                    translated_by="ai",
                )
            )
            created += 1
        elif reset_existing:
            translation.content = ""
            translation.status = "pending"
            created += 1
        elif translation.status == "ready" and translation.content:
            continue

        if await _upsert_job(db, "reply", reply_id, language, reset=reset_existing):
            created += 1

    if created:
        await db.flush()
    return created


async def ensure_pending_post_translation(db: AsyncSession, post_id: str, language: str) -> None:
    if language not in _languages():
        return
    if await _get_post_translation(db, post_id, language) is None:
        await enqueue_missing_post_translations(db, post_id)
        await db.commit()


async def ensure_pending_reply_translation(db: AsyncSession, reply_id: str, language: str) -> None:
    if language not in _languages():
        return
    if await _get_reply_translation(db, reply_id, language) is None:
        await enqueue_reply_translations(db, reply_id)
        await db.commit()


async def process_next_post_translation(db: AsyncSession) -> bool:
    return await process_next_translation_job(db)


async def process_next_translation_job(db: AsyncSession) -> bool:
    now = datetime.now(timezone.utc)
    result = await db.execute(
        select(TranslationJob)
        .where(
            TranslationJob.status == "pending",
            or_(TranslationJob.next_run_at.is_(None), TranslationJob.next_run_at <= now),
        )
        .order_by(TranslationJob.created_at.asc())
        .limit(1)
    )
    job = result.scalar_one_or_none()
    if job is None:
        return False

    job.status = "processing"
    job.locked_at = now
    await db.commit()

    job_id = job.id
    try:
        result = await db.execute(select(TranslationJob).where(TranslationJob.id == job_id))
        job = result.scalar_one_or_none()
        if job is None:
            return True
        if job.target_type == "post":
            await _process_post_job(db, job)
        elif job.target_type == "reply":
            await _process_reply_job(db, job)
        else:
            raise ValueError(f"Unsupported translation target: {job.target_type}")
        if job.status == "processing":
            job.status = "completed"
            job.completed_at = datetime.now(timezone.utc)
        job.last_error = None
        await db.commit()
        return True
    except Exception as exc:
        logger.exception(
            "Translation job failed",
            extra={"job_id": job_id, "target_type": getattr(job, "target_type", None)},
        )
        await db.rollback()
        await _schedule_retry(db, job_id, exc)
        return True


async def reset_stale_processing_translations(db: AsyncSession) -> None:
    stale_before = datetime.now(timezone.utc) - timedelta(minutes=15)
    result = await db.execute(
        select(TranslationJob).where(
            TranslationJob.status == "processing",
            or_(TranslationJob.locked_at.is_(None), TranslationJob.locked_at <= stale_before),
        )
    )
    rows = result.scalars().all()
    for row in rows:
        row.status = "pending"
        row.locked_at = None
    if rows:
        await db.commit()


async def _process_post_job(db: AsyncSession, job: TranslationJob) -> None:
    result = await db.execute(select(Post).where(Post.id == job.target_id))
    post = result.scalar_one_or_none()
    if post is None or post.status != "published":
        job.status = "skipped"
        return

    source = await _get_post_translation(db, post.id, post.original_language)
    if source is None:
        raise ValueError("Source post translation missing")

    source_title = source.title
    source_content = source.content
    source_language = post.original_language
    target_language = job.language
    post_id = post.id
    await db.commit()

    translated_title, translated_content = await translate_post_async(
        source_title,
        source_content,
        source_language,
        target_language,
    )

    result = await db.execute(select(Post).where(Post.id == post_id))
    post = result.scalar_one_or_none()
    if post is None or post.status != "published":
        job.status = "skipped"
        return

    target = await _get_post_translation(db, post_id, target_language)
    if target is None:
        target = PostTranslation(
            post_id=post_id,
            language=target_language,
            title="",
            content="",
            translated_by="ai",
        )
        db.add(target)
    target.title = translated_title
    target.content = translated_content
    target.status = "ready"
    target.model = settings.openai_model
    logger.info("Translated post %s to %s", post_id, target_language)


async def _process_reply_job(db: AsyncSession, job: TranslationJob) -> None:
    reply = await _get_reply(db, job.target_id)
    if reply is None or reply.status != "visible":
        job.status = "skipped"
        return

    source_language = await _reply_source_language(db, reply)
    source_content = reply.content
    target_language = job.language
    reply_id = reply.id
    await db.commit()

    translated_content = await translate_content_preserving_structure_async(
        source_content, source_language, target_language
    )

    reply = await _get_reply(db, reply_id)
    if reply is None or reply.status != "visible":
        job.status = "skipped"
        return

    target = await _get_reply_translation(db, reply_id, target_language)
    if target is None:
        target = ReplyTranslation(
            reply_id=reply_id,
            language=target_language,
            content="",
            translated_by="ai",
        )
        db.add(target)
    target.content = translated_content
    target.status = "ready"
    logger.info("Translated reply %s to %s", reply_id, target_language)


async def _schedule_retry(db: AsyncSession, job_id: str, exc: Exception) -> None:
    result = await db.execute(select(TranslationJob).where(TranslationJob.id == job_id))
    job = result.scalar_one_or_none()
    if job is None:
        return
    job.attempts += 1
    job.last_error = str(exc)[:2000]
    job.locked_at = None
    if job.attempts >= job.max_attempts:
        job.status = "failed"
        job.next_run_at = None
        await _mark_target_failed(db, job)
    else:
        delay = RETRY_DELAYS[min(job.attempts - 1, len(RETRY_DELAYS) - 1)]
        job.status = "pending"
        job.next_run_at = datetime.now(timezone.utc) + delay
    await db.commit()


async def _mark_target_failed(db: AsyncSession, job: TranslationJob) -> None:
    if job.target_type == "post":
        translation = await _get_post_translation(db, job.target_id, job.language)
    elif job.target_type == "reply":
        translation = await _get_reply_translation(db, job.target_id, job.language)
    else:
        translation = None
    if translation is not None:
        translation.status = "failed"


async def _upsert_job(
    db: AsyncSession, target_type: str, target_id: str, language: str, reset: bool = False
) -> bool:
    result = await db.execute(
        select(TranslationJob).where(
            TranslationJob.target_type == target_type,
            TranslationJob.target_id == target_id,
            TranslationJob.language == language,
        )
    )
    job = result.scalar_one_or_none()
    if job is None:
        db.add(
            TranslationJob(
                target_type=target_type,
                target_id=target_id,
                language=language,
                status="pending",
                attempts=0,
                max_attempts=3,
            )
        )
        return True
    if reset or job.status in {"failed", "skipped"}:
        job.status = "pending"
        job.attempts = 0
        job.last_error = None
        job.locked_at = None
        job.next_run_at = None
        job.completed_at = None
        return True
    return False


async def _get_post_translation(db: AsyncSession, post_id: str, language: str) -> PostTranslation | None:
    result = await db.execute(
        select(PostTranslation).where(
            PostTranslation.post_id == post_id,
            PostTranslation.language == language,
        )
    )
    return result.scalar_one_or_none()


async def _get_reply_translation(db: AsyncSession, reply_id: str, language: str) -> ReplyTranslation | None:
    result = await db.execute(
        select(ReplyTranslation).where(
            ReplyTranslation.reply_id == reply_id,
            ReplyTranslation.language == language,
        )
    )
    return result.scalar_one_or_none()


async def _get_reply(db: AsyncSession, reply_id: str) -> Reply | None:
    result = await db.execute(select(Reply).where(Reply.id == reply_id))
    return result.scalar_one_or_none()


async def _reply_source_language(db: AsyncSession, reply: Reply) -> str:
    result = await db.execute(select(Profile.language_preference).where(Profile.user_id == reply.author_id))
    language = result.scalar_one_or_none()
    if language in _languages():
        return language
    result = await db.execute(select(Post.original_language).where(Post.id == reply.post_id))
    post_language = result.scalar_one_or_none()
    return post_language if post_language in _languages() else _languages()[0]

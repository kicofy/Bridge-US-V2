from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.errors import AppError
from app.models.models import Category, Post, PostTag, PostTranslation, Profile, Tag, User
from app.services.notification_service import create_notification
from app.schemas.post import PostCreateRequest, PostUpdateRequest
from app.services.ai_service import translate_post, translate_text
from app.services.moderation_service import screen_post


def _languages() -> list[str]:
    return [lang.strip() for lang in settings.supported_languages.split(",") if lang.strip()]


def _extract_editorjs_text(content: str) -> str:
    try:
        import json

        data = json.loads(content)
        blocks = data.get("blocks")
        if not isinstance(blocks, list):
            return content
        parts: list[str] = []
        for block in blocks:
            block_data = block.get("data", {}) if isinstance(block, dict) else {}
            if isinstance(block_data.get("text"), str):
                parts.append(block_data["text"])
            elif isinstance(block_data.get("items"), list):
                parts.append(" ".join(str(item) for item in block_data["items"]))
        return "\n".join(part for part in parts if part).strip()
    except Exception:
        return content


async def create_post(db: AsyncSession, author_id: str, payload: PostCreateRequest) -> Post:
    if payload.language not in _languages():
        raise AppError(code="invalid_language", message="Unsupported language", status_code=400)
    if payload.category_id is not None:
        await _validate_category(db, payload.category_id)
    post = Post(
        author_id=author_id,
        category_id=payload.category_id,
        original_language=payload.language,
        status="pending",
        published_at=None,
    )
    db.add(post)
    await db.flush()

    original = PostTranslation(
        post_id=post.id,
        language=payload.language,
        title=payload.title,
        content=payload.content,
        status="ready",
        translated_by="user",
    )
    db.add(original)

    if payload.tags:
        await _apply_tags(db, post.id, payload.tags)

    await db.commit()
    await db.refresh(post)
    return post


async def update_post(
    db: AsyncSession, post_id: str, author_id: str, payload: PostUpdateRequest, is_admin: bool = False
) -> Post:
    result = await db.execute(select(Post).where(Post.id == post_id))
    post = result.scalar_one_or_none()
    if post is None:
        raise AppError(code="post_not_found", message="Post not found", status_code=404)
    if post.author_id != author_id and not is_admin:
        raise AppError(code="forbidden", message="Not allowed", status_code=403)

    if payload.category_id is not None:
        await _validate_category(db, payload.category_id)
        post.category_id = payload.category_id
    if payload.status is not None:
        post.status = payload.status
        if payload.status == "published" and post.published_at is None:
            post.published_at = datetime.now(timezone.utc)

    if payload.title is not None or payload.content is not None:
        translation_result = await db.execute(
            select(PostTranslation).where(
                PostTranslation.post_id == post_id,
                PostTranslation.language == post.original_language,
            )
        )
        original = translation_result.scalar_one_or_none()
        if original is None:
            raise AppError(code="post_translation_missing", message="Original translation missing", status_code=500)
        if payload.title is not None:
            original.title = payload.title
        if payload.content is not None:
            original.content = payload.content

        if payload.tags is not None:
            await _apply_tags(db, post.id, payload.tags)

        if post.status == "published":
            content_for_ai = _extract_editorjs_text(original.content)
            await screen_post(db, post, original.title, content_for_ai)
            if post.status == "published":
                await _translate_missing(
                    db,
                    post.id,
                    post.original_language,
                    original.title,
                    content_for_ai,
                )

    await db.commit()
    await db.refresh(post)
    return post


async def delete_post(db: AsyncSession, post_id: str, author_id: str, is_admin: bool = False) -> None:
    result = await db.execute(select(Post).where(Post.id == post_id))
    post = result.scalar_one_or_none()
    if post is None:
        raise AppError(code="post_not_found", message="Post not found", status_code=404)
    if post.author_id != author_id and not is_admin:
        raise AppError(code="forbidden", message="Not allowed", status_code=403)
    await db.delete(post)
    await db.commit()


async def list_posts(
    db: AsyncSession,
    language: str,
    limit: int,
    offset: int,
    author_id: str | None = None,
    include_hidden: bool = False,
) -> list[dict]:
    stmt = select(Post)
    if not include_hidden:
        stmt = stmt.where(Post.status == "published")
    if author_id:
        stmt = stmt.where(Post.author_id == author_id)
    result = await db.execute(stmt.order_by(Post.created_at.desc()).limit(limit).offset(offset))
    posts = result.scalars().all()
    return [await _to_response(db, post, language) for post in posts]


def _can_view_post(post: Post, user: User | None) -> bool:
    if post.status == "published":
        return True
    if user and (user.id == post.author_id or user.role == "admin"):
        return True
    return False


async def list_user_posts(
    db: AsyncSession, user_id: str, language: str, limit: int, offset: int
) -> list[dict]:
    result = await db.execute(
        select(Post)
        .where(Post.author_id == user_id)
        .order_by(Post.created_at.desc())
        .limit(limit)
        .offset(offset)
    )
    posts = result.scalars().all()
    return [await _to_response(db, post, language) for post in posts]


async def get_post(db: AsyncSession, post_id: str, language: str, user: User | None = None) -> dict:
    result = await db.execute(select(Post).where(Post.id == post_id))
    post = result.scalar_one_or_none()
    if post is None:
        raise AppError(code="post_not_found", message="Post not found", status_code=404)
    if not _can_view_post(post, user):
        raise AppError(code="post_not_found", message="Post not found", status_code=404)
    return await _to_response(db, post, language)


async def set_post_visibility(
    db: AsyncSession, post_id: str, author_id: str, status: str, is_admin: bool = False
) -> Post:
    if status not in {"hidden", "published"}:
        raise AppError(code="invalid_status", message="Invalid status", status_code=400)
    result = await db.execute(select(Post).where(Post.id == post_id))
    post = result.scalar_one_or_none()
    if post is None:
        raise AppError(code="post_not_found", message="Post not found", status_code=404)
    if post.author_id != author_id and not is_admin:
        raise AppError(code="forbidden", message="Not allowed", status_code=403)
    post.status = status
    if status == "published" and post.published_at is None:
        post.published_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(post)
    return post


async def publish_post(db: AsyncSession, post_id: str) -> Post:
    result = await db.execute(select(Post).where(Post.id == post_id))
    post = result.scalar_one_or_none()
    if post is None:
        raise AppError(code="post_not_found", message="Post not found", status_code=404)
    translation_result = await db.execute(
        select(PostTranslation).where(
            PostTranslation.post_id == post_id,
            PostTranslation.language == post.original_language,
        )
    )
    original = translation_result.scalar_one_or_none()
    if original is None:
        raise AppError(code="post_translation_missing", message="Original translation missing", status_code=500)
    content_for_ai = _extract_editorjs_text(original.content)
    await screen_post(db, post, original.title, content_for_ai)
    if post.status == "published":
        await _translate_missing(db, post.id, post.original_language, original.title, content_for_ai)
    await db.commit()
    await db.refresh(post)
    return post


async def _translate_missing(
    db: AsyncSession, post_id: str, source_lang: str, title: str, content: str
) -> None:
    for lang in _languages():
        if lang == source_lang:
            continue
        result = await db.execute(
            select(PostTranslation).where(
                PostTranslation.post_id == post_id,
                PostTranslation.language == lang,
            )
        )
        exists = result.scalar_one_or_none()
        if exists is not None:
            continue
        translated_title, translated_content = translate_post(title, content, source_lang, lang)
        db.add(
            PostTranslation(
                post_id=post_id,
                language=lang,
                title=translated_title,
                content=translated_content,
                status="ready",
                translated_by="ai",
                model=settings.openai_model,
            )
        )


async def _to_response(db: AsyncSession, post: Post, language: str) -> dict:
    translation_result = await db.execute(
        select(PostTranslation).where(
            PostTranslation.post_id == post.id,
            PostTranslation.language == language,
        )
    )
    translation = translation_result.scalar_one_or_none()
    if translation is None:
        # Try to create translation on the fly if missing and language is supported
        if language in _languages() and language != post.original_language:
            source_result = await db.execute(
                select(PostTranslation).where(
                    PostTranslation.post_id == post.id,
                    PostTranslation.language == post.original_language,
                )
            )
            source_translation = source_result.scalar_one_or_none()
            if source_translation is not None:
                translated_title = translate_text(source_translation.title, post.original_language, language)
                translated_content = translate_text(source_translation.content, post.original_language, language)
                new_translation = PostTranslation(
                    post_id=post.id,
                    language=language,
                    title=translated_title,
                    content=translated_content,
                    status="ready",
                    translated_by="ai",
                    model=settings.openai_model,
                )
                db.add(new_translation)
                await db.commit()
                translation = new_translation

        if translation is None:
            fallback_result = await db.execute(
                select(PostTranslation).where(
                    PostTranslation.post_id == post.id,
                    PostTranslation.language == post.original_language,
                )
            )
            translation = fallback_result.scalar_one_or_none()
    if translation is None:
        raise AppError(code="post_translation_missing", message="Translation missing", status_code=500)
    translation_status = "ready" if translation.language == language else "pending"

    tag_result = await db.execute(
        select(Tag.slug)
        .join(PostTag, Tag.id == PostTag.tag_id)
        .where(PostTag.post_id == post.id)
    )
    tags = [row[0] for row in tag_result.all()]

    author_result = await db.execute(
        select(Profile.display_name).where(Profile.user_id == post.author_id)
    )
    author_name = author_result.scalar_one_or_none()

    return {
        "id": post.id,
        "author_id": post.author_id,
        "author_name": author_name,
        "category_id": post.category_id,
        "status": post.status,
        "translation_status": translation_status,
        "language": translation.language,
        "title": translation.title,
        "content": translation.content,
        "tags": tags,
        "helpful_count": post.helpful_count,
        "accuracy_avg": post.accuracy_avg,
        "accuracy_count": post.accuracy_count,
        "created_at": post.created_at,
        "published_at": post.published_at,
        "updated_at": post.updated_at,
    }


async def process_post_submission(db: AsyncSession, post_id: str) -> None:
    result = await db.execute(select(Post).where(Post.id == post_id))
    post = result.scalar_one_or_none()
    if post is None:
        raise AppError(code="post_not_found", message="Post not found", status_code=404)
    if post.status == "draft":
        return
    translation_result = await db.execute(
        select(PostTranslation).where(
            PostTranslation.post_id == post_id,
            PostTranslation.language == post.original_language,
        )
    )
    original = translation_result.scalar_one_or_none()
    if original is None:
        raise AppError(code="post_translation_missing", message="Original translation missing", status_code=500)

    await screen_post(db, post, original.title, original.content)
    if post.status == "published":
        await _translate_missing(db, post.id, post.original_language, original.title, original.content)
        await create_notification(
            db,
            post.author_id,
            "post_published",
            {"post_id": post.id, "post_title": original.title, "status": "published"},
            dedupe_key=f"post_published:{post.id}",
        )
    await db.commit()


async def _apply_tags(db: AsyncSession, post_id: str, tag_slugs: list[str]) -> None:
    normalized = [slug.strip().lower() for slug in tag_slugs if slug.strip()]
    if not normalized:
        return
    result = await db.execute(select(Tag).where(Tag.slug.in_(normalized)))
    tags = {tag.slug: tag for tag in result.scalars().all()}
    missing = [slug for slug in normalized if slug not in tags]
    for slug in missing:
        new_tag = Tag(name=slug, slug=slug)
        db.add(new_tag)
        await db.flush()
        tags[slug] = new_tag

    await db.execute(
        PostTag.__table__.delete().where(PostTag.post_id == post_id)
    )
    for slug in normalized:
        db.add(PostTag(post_id=post_id, tag_id=tags[slug].id))


async def _validate_category(db: AsyncSession, category_id: str) -> None:
    result = await db.execute(select(Category).where(Category.id == category_id))
    category = result.scalar_one_or_none()
    if category is None:
        raise AppError(code="category_not_found", message="Category not found", status_code=404)


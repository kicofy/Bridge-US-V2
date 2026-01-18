from __future__ import annotations

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.models import Post, PostTag, PostTranslation, Tag
from app.schemas.post import PostResponse
from app.services.post_service import _to_response


def _normalize_tags(tags: str | None) -> list[str]:
    if not tags:
        return []
    parts = [item.strip().lower() for item in tags.split(",")]
    return [item for item in parts if item]


async def search_posts(
    db: AsyncSession,
    query: str | None,
    language: str,
    category_id: str | None,
    tags: str | None,
    sort: str,
    limit: int,
    offset: int,
) -> tuple[list[PostResponse], int]:
    stmt = (
        select(Post)
        .join(PostTranslation, PostTranslation.post_id == Post.id)
        .where(PostTranslation.language == language)
        .where(Post.status == "published")
    )

    if query:
        pattern = f"%{query}%"
        stmt = stmt.where(
            or_(
                PostTranslation.title.ilike(pattern),
                PostTranslation.content.ilike(pattern),
            )
        )

    if category_id:
        stmt = stmt.where(Post.category_id == category_id)

    tag_list = _normalize_tags(tags)
    if tag_list:
        stmt = (
            stmt.join(PostTag, PostTag.post_id == Post.id)
            .join(Tag, Tag.id == PostTag.tag_id)
            .where(Tag.slug.in_(tag_list))
        )

    if sort == "helpful":
        stmt = stmt.order_by(Post.helpful_count.desc(), Post.created_at.desc())
    elif sort == "accuracy":
        stmt = stmt.order_by(Post.accuracy_avg.desc(), Post.accuracy_count.desc(), Post.created_at.desc())
    else:
        stmt = stmt.order_by(Post.created_at.desc())

    count_stmt = select(func.count()).select_from(stmt.subquery())
    total = (await db.execute(count_stmt)).scalar_one()

    result = await db.execute(stmt.limit(limit).offset(offset))
    posts = result.scalars().all()
    items = [await _to_response(db, post, language) for post in posts]
    return items, int(total or 0)


async def suggest_terms(db: AsyncSession, query: str | None, limit: int) -> list[str]:
    if not query:
        tag_stmt = select(Tag.slug).order_by(Tag.slug.asc()).limit(limit)
        result = await db.execute(tag_stmt)
        return [row[0] for row in result.all()]

    pattern = f"%{query}%"
    title_stmt = (
        select(PostTranslation.title)
        .where(PostTranslation.title.ilike(pattern))
        .distinct()
        .limit(limit)
    )
    tag_stmt = select(Tag.slug).where(Tag.slug.ilike(pattern)).limit(limit)

    titles = [row[0] for row in (await db.execute(title_stmt)).all()]
    tags = [row[0] for row in (await db.execute(tag_stmt)).all()]

    merged: list[str] = []
    for item in titles + tags:
        if item not in merged:
            merged.append(item)
        if len(merged) >= limit:
            break
    return merged


async def trending_posts(
    db: AsyncSession,
    language: str,
    limit: int,
) -> list[PostResponse]:
    stmt = (
        select(Post)
        .where(Post.status == "published")
        .order_by(Post.helpful_count.desc(), Post.accuracy_avg.desc(), Post.created_at.desc())
        .limit(limit)
    )
    result = await db.execute(stmt)
    posts = result.scalars().all()
    return [await _to_response(db, post, language) for post in posts]


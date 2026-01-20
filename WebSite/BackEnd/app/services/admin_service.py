from datetime import datetime, timezone

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import AppError
from app.core.config import settings
from app.models.models import Category, Post, PostTag, Reply, Tag, User, Report, Profile, UserSession
from app.services.audit_service import log_action
from app.services.notification_service import create_notification


async def list_users(db: AsyncSession, limit: int, offset: int) -> list[User]:
    result = await db.execute(select(User).order_by(User.created_at.desc()).limit(limit).offset(offset))
    return list(result.scalars().all())


async def get_user_detail(db: AsyncSession, user_id: str) -> dict:
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None:
        raise AppError(code="user_not_found", message="User not found", status_code=404)

    profile_result = await db.execute(select(Profile).where(Profile.user_id == user_id))
    profile = profile_result.scalar_one_or_none()

    post_count = await db.scalar(select(func.count()).select_from(Post).where(Post.author_id == user_id))
    reply_count = await db.scalar(select(func.count()).select_from(Reply).where(Reply.author_id == user_id))
    reports_filed = await db.scalar(select(func.count()).select_from(Report).where(Report.reporter_id == user_id))

    posts_subq = select(Post.id).where(Post.author_id == user_id).subquery()
    replies_subq = select(Reply.id).where(Reply.author_id == user_id).subquery()

    reports_on_posts = await db.scalar(
        select(func.count()).select_from(Report).where(Report.target_type == "post", Report.target_id.in_(posts_subq))
    )
    reports_on_replies = await db.scalar(
        select(func.count()).select_from(Report).where(
            Report.target_type == "reply", Report.target_id.in_(replies_subq)
        )
    )

    last_login = user.last_login_at
    if last_login is None:
        # fallback: latest session creation time
        last_login = await db.scalar(
            select(func.max(UserSession.created_at)).where(UserSession.user_id == user_id)
        )

    language_pref = profile.language_preference if profile else None
    if not language_pref:
        language_pref = settings.supported_languages.split(",")[0].strip() or None

    return {
        "id": user.id,
        "email": user.email,
        "role": user.role,
        "status": user.status,
        "created_at": user.created_at,
        "last_login_at": last_login,
        "display_name": profile.display_name if profile else None,
        "language_preference": language_pref,
        "posts_count": int(post_count or 0),
        "replies_count": int(reply_count or 0),
        "reports_filed": int(reports_filed or 0),
        "reports_received": int((reports_on_posts or 0) + (reports_on_replies or 0)),
    }


async def set_user_status(db: AsyncSession, user_id: str, status: str, admin_id: str) -> User:
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None:
        raise AppError(code="user_not_found", message="User not found", status_code=404)
    user.status = status
    await log_action(db, admin_id, "user", user_id, f"user_{status}", None)
    await create_notification(
        db,
        user_id,
        "account_status",
        {"status": status},
        dedupe_key=f"account_status:{user_id}:{status}",
    )
    await db.commit()
    await db.refresh(user)
    return user


async def set_user_role(db: AsyncSession, user_id: str, role: str, admin_id: str) -> User:
    if role not in {"user", "admin"}:
        raise AppError(code="invalid_role", message="Invalid role", status_code=400)
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None:
        raise AppError(code="user_not_found", message="User not found", status_code=404)
    if settings.root_account and user.email == settings.root_account and role != "admin":
        raise AppError(code="forbidden", message="Root admin cannot be demoted", status_code=403)
    if user.role != role:
        user.role = role
        await log_action(db, admin_id, "user", user_id, f"user_role_{role}", None)
        await db.commit()
        await db.refresh(user)
    return user


async def admin_set_post_status(
    db: AsyncSession, post_id: str, admin_id: str, status: str, reason: str | None
) -> Post:
    result = await db.execute(select(Post).where(Post.id == post_id))
    post = result.scalar_one_or_none()
    if post is None:
        raise AppError(code="post_not_found", message="Post not found", status_code=404)
    post.status = status
    if status == "published" and post.published_at is None:
        post.published_at = datetime.now(timezone.utc)
    await log_action(db, admin_id, "post", post_id, f"post_{status}", reason)
    await db.commit()
    await db.refresh(post)
    return post


async def admin_set_reply_status(
    db: AsyncSession, reply_id: str, admin_id: str, status: str, reason: str | None
) -> Reply:
    result = await db.execute(select(Reply).where(Reply.id == reply_id))
    reply = result.scalar_one_or_none()
    if reply is None:
        raise AppError(code="reply_not_found", message="Reply not found", status_code=404)
    reply.status = status
    await log_action(db, admin_id, "reply", reply_id, f"reply_{status}", reason)
    await db.commit()
    await db.refresh(reply)
    return reply


async def backfill_post_categories(db: AsyncSession, admin_id: str) -> dict:
    categories = (
        await db.execute(select(Category).order_by(Category.sort_order.asc(), Category.name.asc()))
    ).scalars().all()
    if not categories:
        raise AppError(code="category_not_found", message="No categories found", status_code=404)

    category_by_slug = {item.slug: item for item in categories}
    default_category = categories[0]

    result = await db.execute(select(Post).where(Post.category_id.is_(None)))
    posts = result.scalars().all()
    updated = 0

    for post in posts:
        tag_result = await db.execute(
            select(Tag.slug)
            .join(PostTag, Tag.id == PostTag.tag_id)
            .where(PostTag.post_id == post.id)
        )
        tags = [row[0] for row in tag_result.all()]
        slug = _infer_category_slug(tags)
        chosen = category_by_slug.get(slug) if slug else None
        post.category_id = (chosen or default_category).id
        updated += 1

    await log_action(db, admin_id, "post", "bulk", "post_backfill_category", None)
    await db.commit()
    return {"updated": updated}


def _infer_category_slug(tags: list[str]) -> str | None:
    keywords = {
        "visa": ["visa", "i20", "opt", "cpt"],
        "housing": ["housing", "rent", "roommate"],
        "health": ["health", "insurance", "clinic", "medical"],
        "campus": ["campus", "club", "student"],
        "work": ["work", "job", "intern", "career"],
    }
    lowered = " ".join(tags).lower()
    for slug, keys in keywords.items():
        if any(key in lowered for key in keys):
            return slug
    return None


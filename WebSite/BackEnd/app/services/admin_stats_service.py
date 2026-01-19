from __future__ import annotations

from collections import Counter, defaultdict
from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.models import Category, Post, Reply, Report, User
from app.schemas.admin_stats import (
    AdminCategoryPoint,
    AdminContentActivityPoint,
    AdminSeriesPoint,
    AdminStatsResponse,
    AdminSummaryStats,
)


def _start_of_day(dt: datetime) -> datetime:
    return dt.replace(hour=0, minute=0, second=0, microsecond=0)


async def get_admin_stats(db: AsyncSession) -> AdminStatsResponse:
    now = datetime.now(timezone.utc)
    start_today = _start_of_day(now)
    start_7_days = start_today - timedelta(days=6)

    # Summary counts
    total_users = len((await db.execute(select(User.id))).scalars().all())
    total_posts = len((await db.execute(select(Post.id))).scalars().all())
    total_replies = len((await db.execute(select(Reply.id))).scalars().all())
    pending_reports = len(
        (await db.execute(select(Report.id).where(Report.status == "pending"))).scalars().all()
    )
    resolved_reports = len(
        (await db.execute(select(Report.id).where(Report.status == "resolved"))).scalars().all()
    )

    # Active today: distinct users who posted or replied today
    post_authors = (
        await db.execute(select(Post.author_id).where(Post.created_at >= start_today))
    ).scalars().all()
    reply_authors = (
        await db.execute(select(Reply.author_id).where(Reply.created_at >= start_today))
    ).scalars().all()
    active_today = len(set(post_authors) | set(reply_authors))

    # User growth (last 6 months)
    six_months_ago = (start_today.replace(day=1) - timedelta(days=1)).replace(day=1)
    users = (await db.execute(select(User.created_at))).scalars().all()
    month_counts: dict[str, int] = defaultdict(int)
    for created_at in users:
        if created_at is None:
            continue
        created = created_at.astimezone(timezone.utc)
        if created >= six_months_ago:
            key = created.strftime("%b")
            month_counts[key] += 1
    user_growth = [AdminSeriesPoint(label=label, value=month_counts.get(label, 0)) for label in _last_six_month_labels(now)]

    # Content activity (last 7 days)
    posts = (
        await db.execute(select(Post.created_at).where(Post.created_at >= start_7_days))
    ).scalars().all()
    replies = (
        await db.execute(select(Reply.created_at).where(Reply.created_at >= start_7_days))
    ).scalars().all()
    post_counts = Counter(_date_label(ts) for ts in posts if ts)
    reply_counts = Counter(_date_label(ts) for ts in replies if ts)
    content_activity = [
        AdminContentActivityPoint(
            label=label,
            posts=post_counts.get(label, 0),
            replies=reply_counts.get(label, 0),
        )
        for label in _last_seven_day_labels(now)
    ]

    # Category distribution
    categories = (await db.execute(select(Category.id, Category.name))).all()
    posts_by_category = (
        await db.execute(select(Post.category_id))).scalars().all()
    category_counter = Counter(posts_by_category)
    category_distribution = [
        AdminCategoryPoint(name=name, value=category_counter.get(cat_id, 0))
        for cat_id, name in categories
    ]

    return AdminStatsResponse(
        summary=AdminSummaryStats(
            total_users=total_users,
            total_posts=total_posts,
            total_replies=total_replies,
            pending_reports=pending_reports,
            resolved_reports=resolved_reports,
            active_today=active_today,
        ),
        user_growth=user_growth,
        content_activity=content_activity,
        category_distribution=category_distribution,
    )


def _last_seven_day_labels(now: datetime) -> list[str]:
    labels: list[str] = []
    for i in range(6, -1, -1):
        labels.append((now - timedelta(days=i)).strftime("%a"))
    return labels


def _last_six_month_labels(now: datetime) -> list[str]:
    labels: list[str] = []
    current = now.replace(day=1)
    for i in range(5, -1, -1):
        month = current - timedelta(days=30 * i)
        labels.append(month.strftime("%b"))
    return labels


def _date_label(dt: datetime) -> str:
    return dt.astimezone(timezone.utc).strftime("%a")


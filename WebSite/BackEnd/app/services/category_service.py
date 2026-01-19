from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import AppError
from app.models.models import Category, Post
from app.services.audit_service import log_action
from app.schemas.category import CategoryCreateRequest, CategoryUpdateRequest


async def list_categories(db: AsyncSession) -> list[Category]:
    result = await db.execute(select(Category).order_by(Category.sort_order.asc(), Category.name.asc()))
    return list(result.scalars().all())


async def create_category(db: AsyncSession, payload: CategoryCreateRequest, admin_id: str) -> Category:
    existing = await db.execute(select(Category).where(Category.slug == payload.slug))
    if existing.scalar_one_or_none() is not None:
        raise AppError(code="category_exists", message="Category slug already exists", status_code=409)
    category = Category(
        name=payload.name,
        slug=payload.slug,
        sort_order=payload.sort_order,
        status=payload.status,
    )
    db.add(category)
    await db.commit()
    await db.refresh(category)
    await log_action(db, admin_id, "category", category.id, "category_create", None)
    await db.commit()
    return category


async def update_category(
    db: AsyncSession, category_id: str, payload: CategoryUpdateRequest, admin_id: str
) -> Category:
    result = await db.execute(select(Category).where(Category.id == category_id))
    category = result.scalar_one_or_none()
    if category is None:
        raise AppError(code="category_not_found", message="Category not found", status_code=404)
    data = payload.model_dump(exclude_unset=True)
    if "slug" in data and data["slug"] != category.slug:
        existing = await db.execute(select(Category).where(Category.slug == data["slug"]))
        if existing.scalar_one_or_none() is not None:
            raise AppError(code="category_exists", message="Category slug already exists", status_code=409)
    for key, value in data.items():
        setattr(category, key, value)
    await log_action(db, admin_id, "category", category.id, "category_update", None)
    await db.commit()
    await db.refresh(category)
    return category


async def delete_category(db: AsyncSession, category_id: str, admin_id: str) -> None:
    result = await db.execute(select(Category).where(Category.id == category_id))
    category = result.scalar_one_or_none()
    if category is None:
        raise AppError(code="category_not_found", message="Category not found", status_code=404)
    posts_result = await db.execute(select(Post).where(Post.category_id == category_id))
    for post in posts_result.scalars().all():
        post.category_id = None
    await log_action(db, admin_id, "category", category.id, "category_delete", None)
    await db.delete(category)
    await db.commit()


async def ensure_default_categories(db: AsyncSession) -> None:
    result = await db.execute(select(Category).limit(1))
    existing = result.scalar_one_or_none()
    if existing is not None:
        return
    defaults = [
        ("Visa & Immigration", "visa", 1),
        ("Housing", "housing", 2),
        ("Health & Wellness", "health", 3),
        ("Campus Life", "campus", 4),
        ("Work & Internships", "work", 5),
    ]
    for name, slug, order in defaults:
        db.add(Category(name=name, slug=slug, sort_order=order, status="active"))
    await db.commit()


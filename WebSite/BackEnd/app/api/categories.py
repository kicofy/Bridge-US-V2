from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import get_admin_user
from app.core.database import get_db
from app.models.models import User
from app.schemas.category import (
    CategoryCreateRequest,
    CategoryResponse,
    CategoryUpdateRequest,
)
from app.services.category_service import (
    create_category,
    delete_category,
    list_categories,
    update_category,
)


router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("", response_model=list[CategoryResponse])
async def get_categories(db: AsyncSession = Depends(get_db)):
    categories = await list_categories(db)
    return [
        CategoryResponse(
            id=item.id,
            name=item.name,
            slug=item.slug,
            sort_order=item.sort_order,
            status=item.status,
        )
        for item in categories
    ]


@router.post("", response_model=CategoryResponse)
async def create(
    payload: CategoryCreateRequest,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    item = await create_category(db, payload, admin.id)
    return CategoryResponse(
        id=item.id,
        name=item.name,
        slug=item.slug,
        sort_order=item.sort_order,
        status=item.status,
    )


@router.patch("/{category_id}", response_model=CategoryResponse)
async def update(
    category_id: str,
    payload: CategoryUpdateRequest,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    item = await update_category(db, category_id, payload, admin.id)
    return CategoryResponse(
        id=item.id,
        name=item.name,
        slug=item.slug,
        sort_order=item.sort_order,
        status=item.status,
    )


@router.delete("/{category_id}")
async def remove(
    category_id: str,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    await delete_category(db, category_id, admin.id)
    return {"status": "ok"}


from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.search import SearchResponse, SuggestionResponse, TrendingResponse
from app.services.search_service import search_posts, suggest_terms, trending_posts


router = APIRouter(prefix="/search", tags=["search"])


@router.get("", response_model=SearchResponse)
async def search(
    q: str | None = None,
    language: str = Query(default="en"),
    category_id: str | None = None,
    tags: str | None = None,
    sort: str = Query(default="newest"),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    items, total = await search_posts(db, q, language, category_id, tags, sort, limit, offset)
    return SearchResponse(items=items, total=total)


@router.get("/suggestions", response_model=SuggestionResponse)
async def suggestions(
    q: str | None = None,
    limit: int = Query(default=10, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    items = await suggest_terms(db, q, limit)
    return SuggestionResponse(items=items)


@router.get("/trending", response_model=TrendingResponse)
async def trending(
    language: str = Query(default="en"),
    limit: int = Query(default=10, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    items = await trending_posts(db, language, limit)
    return TrendingResponse(items=items)


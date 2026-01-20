from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import get_current_user
from app.core.database import get_db
from app.models.models import User
from app.schemas.ai import (
    AIAskRequest,
    AIAskResponse,
    AIModerateRequest,
    AIModerateResponse,
    AITranslateRequest,
    AITranslateResponse,
)
from app.services.ai_service import ask_question, ask_question_stream, moderate_text, translate_text
from app.services.ai_usage_service import enforce_ai_limit


router = APIRouter(prefix="/ai", tags=["ai"])


@router.post("/ask", response_model=AIAskResponse)
async def ask(
    payload: AIAskRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await enforce_ai_limit(db, user.id)
    answer = ask_question(payload.question)
    return AIAskResponse(answer=answer)


@router.post("/ask-stream")
async def ask_stream(
    payload: AIAskRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await enforce_ai_limit(db, user.id)
    stream = ask_question_stream(payload.question)
    return StreamingResponse(stream, media_type="text/plain")


@router.post("/translate", response_model=AITranslateResponse)
async def translate(
    payload: AITranslateRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await enforce_ai_limit(db, user.id)
    text = translate_text(payload.text, payload.source_lang, payload.target_lang)
    return AITranslateResponse(text=text)


@router.post("/moderate", response_model=AIModerateResponse)
async def moderate(
    payload: AIModerateRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await enforce_ai_limit(db, user.id)
    result = moderate_text(payload.title, payload.content)
    return AIModerateResponse(
        risk_score=int(result.get("risk_score", 0)),
        labels=list(result.get("labels", [])),
        decision=str(result.get("decision", "pass")),
        reason=str(result.get("reason", "")),
    )


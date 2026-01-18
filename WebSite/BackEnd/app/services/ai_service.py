from openai import BadRequestError, OpenAI

from app.core.config import settings
from app.core.errors import AppError


def _get_client() -> OpenAI:
    if not settings.openai_api_key:
        raise AppError(code="ai_not_configured", message="AI not configured", status_code=500)
    return OpenAI(api_key=settings.openai_api_key)


def translate_text(text: str, source_lang: str, target_lang: str) -> str:
    client = _get_client()
    prompt = (
        f"Translate the following text from {source_lang} to {target_lang}. "
        "Keep the meaning and tone. Output only the translated text."
    )
    response = _chat_complete(
        client,
        [
            {"role": "system", "content": "You are a precise translator."},
            {"role": "user", "content": prompt},
            {"role": "user", "content": text},
        ],
    )
    output_text = (response.choices[0].message.content or "").strip()
    if not output_text:
        raise AppError(code="ai_translation_failed", message="Translation failed", status_code=500)
    return output_text


def moderate_text(title: str, content: str) -> dict:
    client = _get_client()
    prompt = (
        "Review the content for ads, promotions, scams, harassment, or policy-violating content. "
        "Return JSON with fields: risk_score (0-100), labels (array of strings), decision "
        "(pass|review|reject), reason (short string)."
    )
    response = _chat_complete(
        client,
        [
            {"role": "system", "content": "You are a strict moderation classifier."},
            {"role": "user", "content": prompt},
            {"role": "user", "content": f"Title: {title}\nContent: {content}"},
        ],
    )
    output_text = (response.choices[0].message.content or "").strip()
    if not output_text:
        raise AppError(code="ai_moderation_failed", message="Moderation failed", status_code=500)
    try:
        import json

        return json.loads(output_text)
    except Exception:
        return {"risk_score": 0, "labels": [], "decision": "pass", "reason": "default"}


def ask_question(question: str) -> str:
    client = _get_client()
    response = _chat_complete(
        client,
        [
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": question},
        ],
    )
    output_text = (response.choices[0].message.content or "").strip()
    if not output_text:
        raise AppError(code="ai_answer_failed", message="AI answer failed", status_code=500)
    return output_text


def _chat_complete(client: OpenAI, messages: list[dict]) -> object:
    model = settings.openai_model
    try:
        return client.chat.completions.create(model=model, messages=messages)
    except BadRequestError as exc:
        message = str(exc)
        fallback_model = "gpt-4o-mini"
        if "invalid model" in message.lower() and model != fallback_model:
            return client.chat.completions.create(model=fallback_model, messages=messages)
        raise


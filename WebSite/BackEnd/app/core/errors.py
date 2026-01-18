from typing import Any

from fastapi import Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from starlette.exceptions import HTTPException as StarletteHTTPException


class ErrorResponse(BaseModel):
    code: str
    message: str
    detail: Any | None = None


class AppError(Exception):
    def __init__(self, code: str, message: str, status_code: int = 400, detail: Any | None = None):
        self.code = code
        self.message = message
        self.status_code = status_code
        self.detail = detail


async def app_error_handler(_: Request, exc: AppError) -> JSONResponse:
    payload = ErrorResponse(code=exc.code, message=exc.message, detail=exc.detail)
    return JSONResponse(status_code=exc.status_code, content=payload.model_dump())


async def http_exception_handler(_: Request, exc: StarletteHTTPException) -> JSONResponse:
    payload = ErrorResponse(code="http_error", message=exc.detail, detail=None)
    return JSONResponse(status_code=exc.status_code, content=payload.model_dump())


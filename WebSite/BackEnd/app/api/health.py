from fastapi import APIRouter, Request


router = APIRouter()


@router.get("/health")
def health(request: Request):
    return {
        "status": "ok",
        "service": "bridgeus-backend",
        "request_id": getattr(request.state, "request_id", None),
    }


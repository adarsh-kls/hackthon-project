from fastapi import APIRouter

from app.schemas.health import HealthResponse

router = APIRouter()


@router.get("/health", response_model=HealthResponse, tags=["health"])
def get_health() -> HealthResponse:
    """Report API-process liveness; this does not check dependencies."""
    return HealthResponse(status="ok")

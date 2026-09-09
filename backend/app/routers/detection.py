from typing import Annotated

from fastapi import APIRouter, Depends

from app.core.database import session_dep
from app.routers.auth import get_current_user
from app.schemas.detection import DetectionResponse
from app.services.detection import DetectionService

router = APIRouter(
    prefix='/detections',
    tags=['detections']
)

@router.get(
    '/video/{video_id}',
    response_model=list[DetectionResponse]
)
async def get_video_detections(
    video_id: int,
    db: session_dep,
    current_user: Annotated[dict, Depends(get_current_user)]
):
    return await DetectionService.get_all(
        session=db,
        video_id=video_id,
        current_user_id=current_user['id']
    )
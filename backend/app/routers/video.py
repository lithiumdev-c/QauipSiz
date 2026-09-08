from typing import Annotated

from fastapi import APIRouter, Depends, UploadFile, File

from app.core.database import session_dep
from app.routers.auth import get_current_user
from app.schemas.video import VideoResponse
from app.services.video import VideoService

router = APIRouter(
    prefix='/videos',
    tags=['videos']
)

@router.post(
    '/case/{case_id}',
    status_code=201,
    response_model=VideoResponse
)
async def upload_video(
    case_id: int,
    video: Annotated[UploadFile, File(...)],
    db: session_dep,
    current_user: Annotated[dict, Depends(get_current_user)]
):
    return await VideoService.create(
        session=db,
        file=video,
        case_id=case_id,
        current_user_id=current_user['id']
    )

@router.get(
    '/case/{case_id}',
    response_model=list[VideoResponse]
)
async def get_videos(
    case_id: int,
    db: session_dep,
    current_user: Annotated[dict, Depends(get_current_user)]
):
    return await VideoService.get_all(
        session=db,
        case_id=case_id,
        current_user_id=current_user['id']
    )

@router.get(
    '/{video_id}',
    response_model=VideoResponse
)
async def get_video(
    video_id: int,
    db: session_dep,    
    current_user: Annotated[dict, Depends(get_current_user)]
):
    return await VideoService.get_by_id(
        session=db,
        video_id=video_id,
        current_user_id=current_user['id']
    )

@router.delete(
    '/{video_id}'
)
async def delete_video(
    video_id: int,
    db: session_dep,
    current_user: Annotated[dict, Depends(get_current_user)]
):
    await VideoService.delete(
        session=db,
        video_id=video_id,
        current_user_id=current_user['id']
    )

    return {'msg': 'Video deleted!'}

@router.get('/{video_id}/url')
async def get_video_url(
    video_id: int,
    db: session_dep,
    current_user: Annotated[dict, Depends(get_current_user)]
):
    return await VideoService.get_url(
        session=db,
        video_id=video_id,
        current_user_id=current_user['id']
    )

@router.post('/{video_id}/process')
async def process_video(
    video_id: int,
    db: session_dep,
    current_user: Annotated[dict, Depends(get_current_user)]
):
    return await VideoService.process(
        session=db,
        video_id=video_id,
        current_user_id=current_user['id']
    )
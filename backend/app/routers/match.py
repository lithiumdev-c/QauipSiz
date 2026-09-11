from typing import Annotated

from fastapi import APIRouter, Depends

from app.core.database import session_dep
from app.routers.auth import get_current_user
from app.schemas.match import MatchCreate, MatchResponse, MatchStatusUpdate
from app.services.match import MatchService

router = APIRouter(
    prefix='/matches',
    tags=['matches']
)

@router.post(
    '',
    response_model=MatchResponse,
    status_code=201
)
async def create_match(
    payload: MatchCreate,
    db: session_dep,
    current_user: Annotated[dict, Depends(get_current_user)]
):
    return await MatchService.create(
        session=db,
        video_id=payload.video_id,
        person_id=payload.person_id,
        timestamp=payload.timestamp,
        similarity=payload.similarity,
        frame_url=payload.frame_url,
        current_user_id=current_user["id"],
    )

@router.get(
    '/video/{video_id}',
    response_model=list[MatchResponse]
)
async def get_video_matches(
    video_id: int,
    db: session_dep,
    current_user: Annotated[dict, Depends(get_current_user)]
):
    return await MatchService.get_by_video(
        session=db,
        video_id=video_id,
        current_user_id=current_user['id']
    )

@router.get(
    '/organization/{organization_id}',
    response_model=list[MatchResponse]
)
async def get_organization_matches(
    organization_id: int,
    db: session_dep,
    current_user: Annotated[dict, Depends(get_current_user)]
):
    return await MatchService.get_by_organization(
        session=db,
        organization_id=organization_id,
        current_user_id=current_user['id']
    )

@router.get(
    '/{match_id}/frame/url'
)
async def get_match_frame_url(
    match_id: int,
    db: session_dep,
    current_user: Annotated[dict, Depends(get_current_user)]
):
    return await MatchService.get_frame_url(
        session=db,
        match_id=match_id,
        current_user_id=current_user['id']
    )

@router.patch(
    '/{match_id}/status',
    response_model=MatchResponse
)
async def update_match_status(
    match_id: int,
    payload: MatchStatusUpdate,
    db: session_dep,
    current_user: Annotated[dict, Depends(get_current_user)]
):
    return await MatchService.update_status(
        session=db,
        match_id=match_id,
        status=payload.status,
        current_user_id=current_user['id']
    )
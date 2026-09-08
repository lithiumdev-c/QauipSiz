from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.detection import DetectionRepository
from app.repositories.video import VideoRepository
from app.repositories.case import CaseRepository
from app.services.organization_member import OrganizationMemberService

class DetectionService:
    @classmethod
    async def get_all(
        cls,
        session: AsyncSession,
        video_id: int,
        current_user_id: int,
    ):
        video = await VideoRepository.get_video(
            session=session,
            video_id=video_id
        )

        if not video:
            raise HTTPException(
                status_code=404,
                detail='Video not found!'
            )

        case = await CaseRepository.get_case(
            session=session,
            case_id=video.case_id
        )

        if not case:
            raise HTTPException(
                status_code=404,
                detail='Case not found!'
            )

        member = await OrganizationMemberService.get_member_by_user(
            session=session,
            user_id=current_user_id,
            organization_id=case.organization_id
        )

        if not member:
            raise HTTPException(
                status_code=403,
                detail='You are not a member of this organization!'
            )

        return await DetectionRepository.get_detections(
            session=session,
            video_id=video_id
        )
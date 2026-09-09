from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.match import MatchRepository
from app.repositories.video import VideoRepository
from app.repositories.person import PersonRepository
from app.repositories.case import CaseRepository
from app.services.organization_member import OrganizationMemberService

class MatchService:
    @classmethod
    async def create(
        cls,
        session: AsyncSession,
        video_id: int,
        person_id: int,
        timestamp: float,
        similarity: float,
        frame_url: str,
        current_user_id: int
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

        person = await PersonRepository.get_person(
            session=session,
            person_id=person_id
        )

        if not person:
            raise HTTPException(
                status_code=404,
                detail='Person not found!'
            )

        case = await CaseRepository.get_case(
            session=session,
            case_id=video.case_id
        )

        if not case:
            raise HTTPException(
                status_code=404,
                detail='Case not found'
            )

        member = await OrganizationMemberService.get_member_by_user(
            session=session,
            user_id=current_user_id,
            organization_id=case.organization_id
        )

        if not member:
            raise HTTPException(
                status_code=403,
                detail='You are not a member of this organization'
            )

        if person.case_id != case.id:
            raise HTTPException(
                status_code=400,
                detail='Person does not belong to this case!'
            )

        return await MatchRepository.create(
            session=session,
            video_id=video_id,
            person_id=person_id,
            timestamp=timestamp,
            similarity=similarity,
            frame_url=frame_url
        )

    @classmethod
    async def get_by_video(
        cls,
        session: AsyncSession,
        video_id: int,
        current_user_id: int
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

        return await MatchRepository.get_by_video(
            session=session,
            video_id=video_id
        )

    @classmethod
    async def update_status(
        cls,
        session: AsyncSession,
        match_id: int,
        status: str,
        current_user_id: int,
    ):
        match = await MatchRepository.get_by_id(
            session=session,
            match_id=match_id
        )

        if not match:
            raise HTTPException(
                status_code=404,
                detail='Match not found!'
            )

        video = await VideoRepository.get_video(
            session=session,
            video_id=match.video_id
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
            organization_id=case.organization_id,
        )

        if not member:
            raise HTTPException(
                status_code=403,
                detail="You are not a member of this organization!",
            )

        if member.role != "admin":
            raise HTTPException(
                status_code=403,
                detail="Only admins can update match status!",
            )

        if status not in ["pending_review", "confirmed", "rejected"]:
            raise HTTPException(
                status_code=400,
                detail="Invalid match status!",
            )

        return await MatchRepository.update_status(
            session=session,
            match_id=match_id,
            status=status
        )

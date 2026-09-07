from fastapi import HTTPException, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.video import VideoRepository
from app.repositories.case import CaseRepository
from app.services.organization_member import OrganizationMemberService
from app.utils.storage import upload_video, delete_video, get_video_url
from app.utils.video_processing import get_video_info

class VideoService:
    @classmethod
    async def create(
        cls,
        session: AsyncSession,
        file: UploadFile,
        case_id: int,
        current_user_id: int,
    ):
        if file.content_type not in {
            "video/mp4",
            "video/webm",
            "video/quicktime",
        }:
            raise HTTPException(
                status_code=400,
                detail="Unsupported video format!",
            )

        case = await CaseRepository.get_case(
            session=session,
            case_id=case_id,
        )

        if not case:
            raise HTTPException(
                status_code=404,
                detail="Case not found!",
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

        file_path = await upload_video(
            file=file,
            case_id=case_id,
        )

        try:
            video_url = get_video_url(file_path)

            video_info = await get_video_info(video_url)

            return await VideoRepository.create_video(
                session=session,
                case_id=case_id,
                uploaded_by=current_user_id,
                file_path=file_path,
                duration=video_info["duration"],
            )

        except Exception:
            delete_video(file_path)
            raise
    
    @classmethod
    async def get_all(
        cls,
        session: AsyncSession,
        case_id: int,
        current_user_id: int,
    ):
        case = await CaseRepository.get_case(
            session=session,
            case_id=case_id,
        )

        if not case:
            raise HTTPException(
                status_code=404,
                detail="Case not found!",
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

        return await VideoRepository.get_videos(
            session=session,
            case_id=case_id,
        )

    @classmethod
    async def get_by_id(
        cls,
        session: AsyncSession,
        video_id: int,
        current_user_id: int,
    ):
        video = await VideoRepository.get_video(
            session=session,
            video_id=video_id,
        )

        if not video:
            raise HTTPException(
                status_code=404,
                detail="Video not found!",
            )

        case = await CaseRepository.get_case(
            session=session,
            case_id=video.case_id,
        )

        if not case:
            raise HTTPException(
                status_code=404,
                detail="Case not found!",
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

        return video

    @classmethod
    async def delete(
        cls,
        session: AsyncSession,
        video_id: int,
        current_user_id: int,
    ):
        video = await VideoRepository.get_video(
            session=session,
            video_id=video_id,
        )

        if not video:
            raise HTTPException(
                status_code=404,
                detail="Video not found!",
            )

        case = await CaseRepository.get_case(
            session=session,
            case_id=video.case_id,
        )

        if not case:
            raise HTTPException(
                status_code=404,
                detail="Case not found!",
            )

        await OrganizationMemberService.check_admin(
            session=session,
            user_id=current_user_id,
            organization_id=case.organization_id,
        )

        delete_video(video.file_path)

        await VideoRepository.delete_video(
            session=session,
            video_id=video_id,
        )

    @classmethod
    async def get_url(
        cls,
        session: AsyncSession,
        video_id: int,
        current_user_id: int,
    ):
        video = await VideoRepository.get_video(
            session=session,
            video_id=video_id,
        )

        if not video:
            raise HTTPException(
                status_code=404,
                detail="Video not found!",
            )

        case = await CaseRepository.get_case(
            session=session,
            case_id=video.case_id,
        )

        if not case:
            raise HTTPException(
                status_code=404,
                detail="Case not found!",
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

        return {
            "url": get_video_url(video.file_path),
        }
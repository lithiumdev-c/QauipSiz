from fastapi import HTTPException, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.video import VideoRepository
from app.repositories.case import CaseRepository
from app.repositories.person import PersonRepository
from app.repositories.match import MatchRepository
from app.services.organization_member import OrganizationMemberService
from app.utils.storage import upload_video, delete_video, get_video_url, get_person_photo_url, upload_match_frame, get_match_frame_url
from app.utils.video_processing import get_video_info, process_video, load_image_from_url
from app.utils.matching import get_reference_embedding
from app.repositories.detection import DetectionRepository

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

    @classmethod
    async def process(
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

        # Получаем всех людей из дела
        persons = await PersonRepository.get_by_case(
            session=session,
            case_id=case.id,
        )

        # Готовим embeddings фотографий
        reference_embeddings = {}

        for person in persons:
            if not person.photo_url:
                continue

            photo_url = get_person_photo_url(
                person.photo_url
            )

            reference_image = await load_image_from_url(
                photo_url
            )

            reference_embeddings[person.id] = (
                get_reference_embedding(reference_image)
            )

        if not reference_embeddings:
            raise HTTPException(
                status_code=400,
                detail="No persons with reference photos found in this case!",
            )

        video_url = get_video_url(video.file_path)

        video.status = "processing"
        await session.commit()

        try:
            statistics = await process_video(
                video_url=video_url,
                reference_embeddings=reference_embeddings,
            )

            await DetectionRepository.create_many(
                session=session,
                video_id=video.id,
                detections=statistics["detections"],
            )

            for match in statistics["matches"]:
                frame_path = await upload_match_frame(
                    frame_bytes=match["frame_bytes"],
                    video_id=video.id,
                )

                frame_url = get_match_frame_url(frame_path)

                await MatchRepository.create(
                    session=session,
                    video_id=video.id,
                    person_id=match["person_id"],
                    timestamp=match["timestamp"],
                    similarity=match["similarity"],
                    frame_url=frame_url,
                )

            video.status = "completed"
            await session.commit()

            return statistics

        except Exception:
            video.status = "failed"
            await session.commit()
            raise
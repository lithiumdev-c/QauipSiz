from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.video import Video

class VideoRepository:
    @classmethod
    async def create_video(
        cls,
        session: AsyncSession,
        case_id: int,
        uploaded_by: int,
        file_path:str,
        duration: float | None = None
    ):
        new_video = Video(
            case_id=case_id,
            uploaded_by=uploaded_by,
            file_path=file_path,
            duration=duration,
        )

        session.add(new_video)

        await session.commit()
        await session.refresh(new_video)

        return new_video

    @classmethod
    async def get_videos(
        cls,
        session: AsyncSession,
        case_id: int
    ):
        query = await session.execute(
            select(Video)
            .where(Video.case_id == case_id)
        )

        return query.scalars().all()

    @classmethod
    async def get_video(
        cls,
        session: AsyncSession,
        video_id: int
    ):
        query = await session.execute(
            select(Video).where(
                Video.id == video_id
            )
        )

        return query.scalar_one_or_none()

    @classmethod
    async def delete_video(
        cls,
        session: AsyncSession,
        video_id: int
    ):
        query = await session.execute(
            select(Video).where(
                Video.id == video_id
            )
        )

        video = query.scalar_one_or_none()

        if not video:
            return None

        await session.delete(video)
        await session.commit()
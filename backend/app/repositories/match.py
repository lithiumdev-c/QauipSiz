from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.match import Match

class MatchRepository:
    @classmethod
    async def create(
        cls,
        session: AsyncSession,
        video_id: int,
        person_id: int,
        timestamp: float,
        similarity: float,
        frame_url: str
    ):
        match = Match(
            video_id=video_id,
            person_id=person_id,
            timestamp=timestamp,
            similarity=similarity,
            frame_url=frame_url,
            status='pending_review'
        )

        session.add(match)

        await session.commit()
        await session.refresh(match)

        return match

    @classmethod
    async def get_by_id(
        cls,
        session: AsyncSession,
        match_id: int
    ):
        result = await session.execute(
            select(Match)
            .where(Match.id == match_id)
        )

        return result.scalar_one_or_none()

    @classmethod
    async def get_by_video(
        cls,
        session: AsyncSession,
        video_id: int
    ):
        result = await session.execute(
            select(Match)
            .where(Match.video_id == video_id)
            .order_by(Match.timestamp)
        )

        return result.scalars().all()

    @classmethod
    async def update_status(
        cls,
        session: AsyncSession,
        match_id: int,
        status: str
    ):
        match = await cls.get_by_id(
            session=session,
            match_id=match_id
        )

        if not match:
            return None

        match.status = status

        await session.commit()
        await session.refresh(match)

        return match

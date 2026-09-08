from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.detection import Detection


class DetectionRepository:

    @classmethod
    async def create_many(
        cls,
        session: AsyncSession,
        video_id: int,
        detections: list[dict],
    ):
        objects = []

        for detection in detections:
            bbox = detection["bbox"]

            objects.append(
                Detection(
                    video_id=video_id,
                    timestamp=detection["timestamp"],
                    confidence=detection["confidence"],
                    x1=bbox[0],
                    y1=bbox[1],
                    x2=bbox[2],
                    y2=bbox[3],
                )
            )

        session.add_all(objects)
        await session.commit()

        return objects

    @classmethod
    async def get_detections(
        cls,
        session: AsyncSession,
        video_id: int,
    ):
        result = await session.execute(
            select(Detection)
            .where(Detection.video_id == video_id)
            .order_by(Detection.timestamp)
        )

        return result.scalars().all()
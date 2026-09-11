from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.organization_request import OrganizationRequest


class OrganizationRequestRepository:

    @classmethod
    async def create(
        cls,
        session: AsyncSession,
        user_id: int,
        name: str,
        country: str,
        description: str | None,
    ):
        request = OrganizationRequest(
            user_id=user_id,
            name=name,
            country=country,
            description=description,
            status="pending",
        )

        session.add(request)

        await session.commit()
        await session.refresh(request)

        return request

    @classmethod
    async def get_by_id(
        cls,
        session: AsyncSession,
        request_id: int,
    ):
        result = await session.execute(
            select(OrganizationRequest)
            .where(
                OrganizationRequest.id == request_id
            )
        )

        return result.scalar_one_or_none()

    @classmethod
    async def get_all(
        cls,
        session: AsyncSession,
    ):
        result = await session.execute(
            select(OrganizationRequest)
            .order_by(
                OrganizationRequest.created_at.desc()
            )
        )

        return result.scalars().all()

    @classmethod
    async def update_status(
        cls,
        session: AsyncSession,
        request_id: int,
        status: str,
    ):
        request = await cls.get_by_id(
            session=session,
            request_id=request_id,
        )

        if not request:
            return None

        request.status = status

        await session.commit()
        await session.refresh(request)

        return request

    @classmethod
    async def get_by_user(
        cls,
        session: AsyncSession,
        user_id: int,
    ):
        result = await session.execute(
            select(OrganizationRequest)
            .where(
                OrganizationRequest.user_id == user_id
            )
            .order_by(
                OrganizationRequest.created_at.desc()
            )
        )

        return result.scalars().all()
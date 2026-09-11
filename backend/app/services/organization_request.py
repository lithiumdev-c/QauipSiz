from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User

from app.repositories.organization_request import (
    OrganizationRequestRepository,
)
from app.repositories.organization import OrganizationRepository
from app.repositories.organization_member import (
    OrganizationMemberRepository,
)
from app.schemas.organization import OrganizationCreate
from app.schemas.organization_request import (
    OrganizationRequestCreate,
)


class OrganizationRequestService:

    @classmethod
    async def create(
        cls,
        session: AsyncSession,
        data: OrganizationRequestCreate,
        user_id: int,
    ):
        return await OrganizationRequestRepository.create(
            session=session,
            user_id=user_id,
            name=data.name,
            country=data.country,
            description=data.description,
        )

    @classmethod
    async def get_all(
        cls,
        session: AsyncSession,
    ):
        requests = await OrganizationRequestRepository.get_all(
            session=session,
        )

        user_ids = list({request.user_id for request in requests})

        users_by_id = {}

        if user_ids:
            result = await session.execute(
                select(User).where(User.id.in_(user_ids))
            )

            for user in result.scalars().all():
                users_by_id[user.id] = user

        return [
            {
                'id': request.id,
                'user_id': request.user_id,
                'name': request.name,
                'country': request.country,
                'description': request.description,
                'status': request.status,
                'created_at': request.created_at,
                'user': (
                    {
                        'id': users_by_id[request.user_id].id,
                        'username': users_by_id[request.user_id].username,
                        'email': users_by_id[request.user_id].email,
                    }
                    if request.user_id in users_by_id
                    else None
                ),
            }
            for request in requests
        ]

    @classmethod
    async def approve(
        cls,
        session: AsyncSession,
        request_id: int,
    ):
        request = await OrganizationRequestRepository.get_by_id(
            session=session,
            request_id=request_id,
        )

        if not request:
            raise HTTPException(
                status_code=404,
                detail="Organization request not found!",
            )

        if request.status != "pending":
            raise HTTPException(
                status_code=400,
                detail="Request has already been processed!",
            )

        organization = await OrganizationRepository.create_organization(
            session=session,
            data=OrganizationCreate(
                name=request.name,
                country=request.country,
            ),
        )

        await OrganizationMemberRepository.create_member(
            session=session,
            user_id=request.user_id,
            organization_id=organization.id,
            role="admin",
        )

        request.status = "approved"

        await session.commit()
        await session.refresh(request)

        return request

    @classmethod
    async def reject(
        cls,
        session: AsyncSession,
        request_id: int,
    ):
        request = await OrganizationRequestRepository.get_by_id(
            session=session,
            request_id=request_id,
        )

        if not request:
            raise HTTPException(
                status_code=404,
                detail="Organization request not found!",
            )

        if request.status != "pending":
            raise HTTPException(
                status_code=400,
                detail="Request has already been processed!",
            )

        request.status = "rejected"

        await session.commit()
        await session.refresh(request)

        return request

    @classmethod
    async def get_my_requests(
        cls,
        session: AsyncSession,
        user_id: int,
    ):
        return await OrganizationRequestRepository.get_by_user(
            session=session,
            user_id=user_id,
        )
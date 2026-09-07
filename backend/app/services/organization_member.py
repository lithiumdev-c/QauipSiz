from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException

from app.repositories.organization_member import OrganizationMemberRepository
from app.schemas.organization_member import OrganizationMemberCreate, OrganizationMemberUpdate
from app.models.organization_member import OrganizationMember

class OrganizationMemberService:

    @classmethod
    async def get_member_by_user(
        cls,
        session: AsyncSession,
        user_id: int,
        organization_id: int
    ):
        return await OrganizationMemberRepository.get_member_by_user(
            session=session,
            user_id=user_id,
            organization_id=organization_id
        )

    @classmethod
    async def check_admin(cls, session: AsyncSession, user_id: int, organization_id: int):
        member = await OrganizationMemberRepository.get_member_by_user(
            session=session,
            user_id=user_id,
            organization_id=organization_id
        )

        if not member:
            raise HTTPException(
                status_code=403,
                detail='You are not a member of this organization!' 
            )

        if member.role != "admin":
            raise HTTPException(
                status_code=403,
                detail='Admin permissions required!'
            )

        return member

        

    @classmethod
    async def create(cls, session: AsyncSession, data: OrganizationMemberCreate):
        member = await OrganizationMemberRepository.create_member(
            session=session,
            user_id=data.user_id,
            organization_id=data.organization_id,
            department_id=data.department_id
        )

        return member

    @classmethod
    async def get_all(cls, session: AsyncSession, organization_id: int):
        return await OrganizationMemberRepository.get_members(
            session=session,
            organization_id=organization_id
        )

    @classmethod
    async def get_by_id(cls, session: AsyncSession, member_id: int):
        member = await OrganizationMemberRepository.get_member(
            session=session,
            member_id=member_id
        )

        if member is None:
            raise HTTPException(
                status_code=404, detail='Organization member not found!'
            )

        return member

    @classmethod
    async def delete(cls, session: AsyncSession, member_id: int):
        member = await OrganizationMemberRepository.get_member(
            session=session,
            member_id=member_id
        )

        if member is None:
            raise HTTPException(
                status_code=404,
                detail='Organization member not found!'
            )

        await OrganizationMemberRepository.delete_member(
            session=session,
            member=member
        )

    @classmethod
    async def patch_member(
        cls,
        session:AsyncSession,
        data: OrganizationMemberUpdate,
        member_id: int,
        current_user_id: int
    ):
        member = await OrganizationMemberRepository.get_member(
            session=session,
            member_id=member_id
        )

        if member is None:
            raise HTTPException(
                status_code=404,
                detail='Organization member not found!'
            )

        await cls.check_admin(
            session=session,
            user_id=current_user_id,
            organization_id=member.organization_id
        )

        return await OrganizationMemberRepository.update_member(
            session=session,
            data=data,
            member_id=member_id
        )
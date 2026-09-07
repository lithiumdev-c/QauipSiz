from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.organization import Organization
from app.models.organization_member import OrganizationMember
from app.schemas.organization_member import OrganizationMemberUpdate

class OrganizationMemberRepository:
    @classmethod
    async def create_member(cls, session: AsyncSession, user_id: int, organization_id: int, department_id: int | None = None, role: str = 'viewer'):
        new_member = OrganizationMember(
            user_id=user_id,
            organization_id=organization_id,
            department_id = department_id,
            role=role
        )

        session.add(new_member)

        await session.commit()
        await session.refresh(new_member)

        return new_member

    @classmethod
    async def get_members(cls, session:AsyncSession, organization_id: int):
        query = await session.execute(
            select(OrganizationMember)
            .where(
                OrganizationMember.id == organization_id
            )
        )

        return query.scalars().all()

    @classmethod
    async def get_member(cls, session: AsyncSession, member_id: int):
        query = await session.execute(
            select(OrganizationMember)
            .where(OrganizationMember.id==member_id)
        )

        return query.scalar_one_or_none()

    @classmethod
    async def delete_member(cls, session: AsyncSession, member: OrganizationMember):
        await session.delete(member)
        await session.commit()

    @classmethod
    async def get_member_by_user(
        cls,
        session: AsyncSession,
        user_id: int,
        organization_id: int
    ):
        query = await session.execute(
            select(OrganizationMember).where(
                OrganizationMember.user_id == user_id,
                OrganizationMember.organization_id == organization_id
            )
        )

        return query.scalar_one_or_none()

    @classmethod
    async def update_member(
        cls,
        session: AsyncSession,
        data: OrganizationMemberUpdate,
        member_id: int
    ):
        query = await session.execute(select(OrganizationMember).where(OrganizationMember.id == member_id))
        org_member = query.scalar_one_or_none()

        if org_member is None:
            return None

        data_dict = data.model_dump(exclude_unset=True)
        for key, val in data_dict.items():
            setattr(org_member, key, val)

        await session.commit()
        await session.refresh(org_member)

        return org_member
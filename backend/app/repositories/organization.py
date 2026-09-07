from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.organization import Organization
from app.schemas.organization import OrganizationCreate

class OrganizationRepository:
    @classmethod
    async def create_organization(cls, session:AsyncSession, data: OrganizationCreate):
        new_org = Organization(
            **data.model_dump()
        )

        session.add(new_org)

        await session.commit()
        await session.refresh(new_org)

        return new_org

    @classmethod
    async def show_organizations(cls, session: AsyncSession):
        query = await session.execute(select(Organization))
        orgs = query.scalars().all()

        return orgs

    @classmethod
    async def show_organization(cls, session:AsyncSession, org_id: int):
        query = await session.execute(select(Organization).where(Organization.id == org_id))
        org = query.scalar_one_or_none()

        return org
    
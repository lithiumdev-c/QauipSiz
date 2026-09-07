from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.organization import OrganizationRepository
from app.repositories.organization_member import OrganizationMemberRepository
from app.schemas.organization import OrganizationCreate

from fastapi import HTTPException

class OrganizationService:
    @classmethod
    async def create(cls, session: AsyncSession, data:OrganizationCreate, user_id: int):
        organization = await OrganizationRepository.create_organization(session=session, data=data)
        await OrganizationMemberRepository.create_member(session=session, user_id=user_id, organization_id=organization.id, role="admin")
        return organization

    @classmethod
    async def get_all(cls, session: AsyncSession):
        return await OrganizationRepository.show_organizations(session=session)

    @classmethod
    async def get_by_id(cls, session:AsyncSession, org_id: int):
        org = await OrganizationRepository.show_organization(session=session, org_id=org_id)

        if org is None:
            raise HTTPException(status_code=404, detail="Organization not found")

        return org
        
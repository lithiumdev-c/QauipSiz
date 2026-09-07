from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException

from app.repositories.case import CaseRepository
from app.schemas.case import CaseCreate, CaseUpdate
from app.services.organization_member import OrganizationMemberService
from app.repositories.department import DepartmentRepository

class CaseService:
    @classmethod
    async def create(
        cls, 
        session: AsyncSession,
        data: CaseCreate,
        organization_id: int,
        department_id: int,
        current_user_id: int
    ):
        await OrganizationMemberService.check_admin(
            session=session,
            user_id=current_user_id,
            organization_id=organization_id
        )

        department = await DepartmentRepository.get_department(
            session=session,
            department_id=department_id
        )

        if not department:
            raise HTTPException(
                status_code=404,
                detail='Department not found!'
            )

        if department.organization_id != organization_id:
            raise HTTPException(
                status_code=400,
                detail='Department does not belong to this organization!'
            )

        return await CaseRepository.create_case(
            session=session,
            data=data,
            organization_id=organization_id,
            department_id=department_id,
            created_by=current_user_id
        )

    @classmethod
    async def get_all(
        cls,
        session: AsyncSession,
        organization_id: int,
        current_user_id: int,
    ):
        member = await OrganizationMemberService.get_member_by_user(
            session=session,
            user_id=current_user_id,
            organization_id=organization_id
        )

        if not member:
            raise HTTPException(
                status_code=403,
                detail='You are not a member of this organization!'
            )

        return await CaseRepository.get_cases(
            session=session,
            organization_id=organization_id
        )

    @classmethod
    async def get_by_id(
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
                detail='Case not found!'
            )

        member = await OrganizationMemberService.get_member_by_user(
            session=session,
            user_id=current_user_id,
            organization_id=case.organization_id
        )

        if not member:
            raise HTTPException(
                status_code=403,
                detail='You are not a member of this organization!',
            )

        return case

    @classmethod
    async def update(
        cls,
        session: AsyncSession,
        case_id: int,
        data: CaseUpdate,
        current_user_id: int
    ):
        case = await CaseRepository.get_case(
            session=session,
            case_id=case_id
        )

        if not case:
            raise HTTPException(
                status_code=404,
                detail='Case not found!'
            )

        await OrganizationMemberService.check_admin(
            session=session,
            user_id=current_user_id,
            organization_id=case.organization_id
        )

        return await CaseRepository.update_case(
            session=session,
            case_id=case_id,
            data=data
        )

    @classmethod
    async def delete(
        cls,
        session: AsyncSession,
        case_id: int,
        current_user_id: int
    ):
        case = await CaseRepository.get_case(
            session=session,
            case_id=case_id
        )

        if not case:
            raise HTTPException(
                status_code=404,
                detail='Case not found!'
            )

        await OrganizationMemberService.check_admin(
            session=session,
            user_id=current_user_id,
            organization_id=case.organization_id
        )

        await CaseRepository.delete_case(
            session=session,
            case_id=case_id
        )
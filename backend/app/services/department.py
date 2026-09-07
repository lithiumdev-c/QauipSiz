from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException

from app.repositories.department import DepartmentRepository
from app.schemas.department import DepartmentCreate, DepartmentUpdate
from app.services.organization_member import OrganizationMemberService


class DepartmentService:
    @classmethod
    async def create(
        cls,
        session: AsyncSession,
        payload: DepartmentCreate,
        organization_id: int,
        current_user_id: int
    ):
        await OrganizationMemberService.check_admin(
            session=session,
            user_id=current_user_id,
            organization_id=organization_id
        )

        return await DepartmentRepository.create_department(
            session=session,
            data=payload,
            organization_id=organization_id
        )

    @classmethod
    async def get_all(
        cls,
        session: AsyncSession,
        organization_id: int,
        current_user_id: int
    ):
        member = await OrganizationMemberService.get_member_by_user(
            session=session,
            user_id=current_user_id,
            organization_id=organization_id
        )

        if not member:
            raise HTTPException(
                status_code=403,
                detail="You are not a member of this organization!"
            )

        return await DepartmentRepository.get_departments(
            session=session,
            organization_id=organization_id
        )

    @classmethod
    async def get_by_id(
        cls,
        session: AsyncSession,
        department_id: int,
        current_user_id: int
    ):
        department = await DepartmentRepository.get_department(
            session=session,
            department_id=department_id
        )

        if not department:
            raise HTTPException(
                status_code=404,
                detail="Department not found!"
            )
        member = await OrganizationMemberService.get_member_by_user(
            session=session,
            user_id=current_user_id,
            organization_id=department.organization_id
        )

        if not member:
            raise HTTPException(
                status_code=403,
                detail="You are not a member of this organization!"
            )

        return department

    @classmethod
    async def update(
        cls,
        session: AsyncSession,
        payload: DepartmentUpdate,
        department_id: int,
        current_user_id: int
    ):
        department = await DepartmentRepository.get_department(
            session=session,
            department_id=department_id
        )

        if not department:
            raise HTTPException(
                status_code=404,
                detail="Department not found!"
            )

        await OrganizationMemberService.check_admin(
            session=session,
            user_id=current_user_id,
            organization_id=department.organization_id
        )

        return await DepartmentRepository.update_department(
            session=session,
            data=payload,
            department_id=department_id
        )

    @classmethod
    async def delete(
        cls,
        session: AsyncSession,
        department_id: int,
        current_user_id: int
    ):
        department = await DepartmentRepository.get_department(
            session=session,
            department_id=department_id
        )

        if not department:
            raise HTTPException(
                status_code=404,
                detail="Department not found!"
            )

        await OrganizationMemberService.check_admin(
            session=session,
            user_id=current_user_id,
            organization_id=department.organization_id
        )

        await DepartmentRepository.delete_department(
            session=session,
            department_id=department_id
        )
    
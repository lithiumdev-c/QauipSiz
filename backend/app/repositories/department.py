from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.department import Department
from app.schemas.department import DepartmentCreate, DepartmentUpdate

class DepartmentRepository:

    @classmethod
    async def create_department(
        cls,
        session: AsyncSession,
        data: DepartmentCreate,
        organization_id: int
    ):
        new_department = Department(
            name=data.name,
            organization_id=organization_id
        )

        session.add(new_department)

        await session.commit()
        await session.refresh(new_department)

        return new_department

    @classmethod
    async def get_departments(
        cls,
        session: AsyncSession,
        organization_id: int
    ):
        query = await session.execute(
            select(Department).where(
                Department.organization_id == organization_id
            )
        )

        return query.scalars().all()

    @classmethod
    async def get_department(
        cls,
        session: AsyncSession,
        department_id: int
    ):
        query = await session.execute(
            select(Department).where(
                Department.id == department_id
            )
        )

        return query.scalar_one_or_none()

    @classmethod
    async def delete_department(
        cls,
        session: AsyncSession,
        department_id: int
    ):
        query = await session.execute(
            select(Department).where(
                Department.id == department_id
            )
        )

        department = query.scalar_one_or_none()

        if not department:
            return None

        await session.delete(department)
        await session.commit()

    @classmethod
    async def update_department(
        cls,
        session: AsyncSession,
        department_id: int,
        data: DepartmentUpdate
    ):
        query = await session.execute(
            select(Department).where(
                Department.id == department_id
            )
        )

        department = query.scalar_one_or_none()

        if not department:
            return None

        data_dict = data.model_dump(exclude_unset=True)

        for key, val in data_dict.items():
            setattr(department, key, val)

        await session.commit()
        await session.refresh(department)

        return department

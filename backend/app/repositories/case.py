from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.case import Case
from app.schemas.case import CaseCreate, CaseUpdate


class CaseRepository:

    @classmethod
    async def create_case(
        cls,
        session: AsyncSession,
        data: CaseCreate,
        organization_id: int,
        department_id: int,
        created_by: int,
    ):
        new_case = Case(
            **data.model_dump(),
            organization_id=organization_id,
            department_id=department_id,
            created_by=created_by,
        )

        session.add(new_case)

        await session.commit()
        await session.refresh(new_case)

        return new_case

    @classmethod
    async def get_cases(
        cls,
        session: AsyncSession,
        organization_id: int,
    ):
        query = await session.execute(
            select(Case).where(
                Case.organization_id == organization_id
            )
        )

        return query.scalars().all()

    @classmethod
    async def get_case(
        cls,
        session: AsyncSession,
        case_id: int,
    ):
        query = await session.execute(
            select(Case).where(
                Case.id == case_id
            )
        )

        return query.scalar_one_or_none()

    @classmethod
    async def update_case(
        cls,
        session: AsyncSession,
        case_id: int,
        data: CaseUpdate,
    ):
        query = await session.execute(
            select(Case).where(
                Case.id == case_id
            )
        )

        case = query.scalar_one_or_none()

        if not case:
            return None

        data_dict = data.model_dump(exclude_unset=True)

        for key, val in data_dict.items():
            setattr(case, key, val)

        await session.commit()
        await session.refresh(case)

        return case

    @classmethod
    async def delete_case(
        cls,
        session: AsyncSession,
        case_id: int,
    ):
        query = await session.execute(
            select(Case).where(
                Case.id == case_id
            )
        )

        case = query.scalar_one_or_none()

        if not case:
            return None

        await session.delete(case)
        await session.commit()
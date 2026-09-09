from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.person import Person
from app.schemas.person import PersonCreate, PersonUpdate

class PersonRepository:
    @classmethod
    async def create_person(cls, session: AsyncSession, data: PersonCreate, case_id: int):
        new_person = Person(**data.model_dump(), case_id=case_id)

        session.add(new_person)

        await session.commit()
        await session.refresh(new_person)

        return new_person

    @classmethod
    async def get_persons(cls, session: AsyncSession, case_id: int):
        query = await session.execute(
            select(Person)
            .where(Person.case_id == case_id)
        )

        return query.scalars().all()

    @classmethod
    async def get_person(cls, session: AsyncSession, person_id: int):
        query = await session.execute(
            select(Person)
            .where(Person.id == person_id)
        )

        return query.scalar_one_or_none()

    @classmethod
    async def update_person(cls, session: AsyncSession, person_id: int, data: PersonUpdate):
        query = await session.execute(
            select(Person)
            .where(Person.id == person_id)
        )

        person = query.scalar_one_or_none()

        if not person:
            return None

        data_dict = data.model_dump(exclude_unset=True)

        for key, val in data_dict.items():
            setattr(person, key, val)

        await session.commit()
        await session.refresh(person)

        return person

    @classmethod
    async def delete_person(cls, session: AsyncSession, person_id: int):
        query = await session.execute(
            select(Person)
            .where(Person.id == person_id)
        )

        person = query.scalar_one_or_none()

        if not person:
            return None

        await session.delete(person)
        await session.commit()

    @classmethod
    async def update_photo(cls, session: AsyncSession, person_id: int, photo_url: str):
        query = await session.execute(
            select(Person)
            .where(Person.id == person_id)
        )

        person = query.scalar_one_or_none()

        if not person:
            return None

        person.photo_url = photo_url

        await session.commit()
        await session.refresh(person)

        return person
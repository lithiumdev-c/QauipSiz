from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException

from app.repositories.person import PersonRepository
from app.repositories.case import CaseRepository
from app.schemas.person import PersonUpdate, PersonCreate
from app.services.organization_member import OrganizationMemberService

class PersonService:
    @classmethod
    async def create(
        cls,
        session: AsyncSession,
        payload: PersonCreate,
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

        member = await OrganizationMemberService.get_member_by_user(
            session=session,
            user_id=current_user_id,
            organization_id=case.organization_id
        )

        if not member:
            raise HTTPException(
                status_code=403,
                detail='You are not a member of this organization!'
            )

        return await PersonRepository.create_person(
            session=session,
            data=payload,
            case_id=case_id
        )

    @classmethod
    async def get_all(
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

        member = await OrganizationMemberService.get_member_by_user(
            session=session,
            user_id=current_user_id,
            organization_id=case.organization_id
        )

        if not member:
            raise HTTPException(
                status_code=403,
                detail='You are not a member of this organization!'
            )

        return await PersonRepository.get_persons(
            session=session,
            case_id=case_id
        )

    @classmethod
    async def get_by_id(
        cls,
        session: AsyncSession,
        person_id: int,
        current_user_id: int
    ):
        person = await PersonRepository.get_person(
            session=session,
            person_id=person_id
        )

        if not person:
            raise HTTPException(
                status_code=404,
                detail='Person not found!'
            )

        case = await CaseRepository.get_case(
            session=session,
            case_id=person.case_id
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
                detail='You are not a member of this organization!'
            )

        return person

    @classmethod
    async def update(
        cls,
        session: AsyncSession,
        person_id: int,
        payload: PersonUpdate,
        current_user_id: int
    ):
        person = await PersonRepository.get_person(
            session=session,
            person_id=person_id
        )

        if not person:
            raise HTTPException(
                status_code=404,
                detail='Person not found!'
            )

        case = await CaseRepository.get_case(
            session=session,
            case_id=person.case_id
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

        return await PersonRepository.update_person(
            session=session,
            person_id=person_id,
            data=payload
        )

    @classmethod
    async def delete(
        cls,
        session: AsyncSession,
        person_id: int,
        current_user_id: int
    ):
        person = await PersonRepository.get_person(
            session=session,
            person_id=person_id
        )

        if not person:
            raise HTTPException(
                status_code=404,
                detail='Person not found!'
            )

        case = await CaseRepository.get_case(
            session=session,
            case_id=person.case_id
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

        await PersonRepository.delete_person(
            session=session,
            person_id=person_id
        )
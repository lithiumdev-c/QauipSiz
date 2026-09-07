from typing import Annotated

from fastapi import APIRouter, Depends

from app.core.database import session_dep
from app.routers.auth import get_current_user
from app.schemas.person import PersonCreate, PersonUpdate, PersonResponse
from app.services.person import PersonService

router = APIRouter(
    prefix='/persons',
    tags=['persons']
)

@router.post(
    '/case/{case_id}',
    status_code=201,
    response_model=PersonResponse
)
async def create_person(
    case_id: int,
    payload: PersonCreate,
    db: session_dep,
    current_user: Annotated[dict, Depends(get_current_user)]
):
    return await PersonService.create(
        session=db,
        payload=payload,
        case_id=case_id,
        current_user_id=current_user['id']
    )

@router.get(
    '/case/{case_id}',
    response_model=list[PersonResponse]
)
async def get_persons(
    case_id: int,
    db: session_dep,
    current_user: Annotated[dict, Depends(get_current_user)]
):
    return await PersonService.get_all(
        session=db,
        case_id=case_id,
        current_user_id=current_user['id']
    )

@router.get(
    '/{person_id}',
    response_model=PersonResponse
)
async def get_person(
    person_id: int,
    db: session_dep,
    current_user: Annotated[dict, Depends(get_current_user)]
):
    return await PersonService.get_by_id(
        session=db,
        person_id=person_id,
        current_user_id=current_user['id']
    )

@router.patch(
    '/{person_id}',
    response_model=PersonResponse
)
async def update_person(
    person_id: int,
    payload: PersonUpdate,
    db:session_dep,
    current_user: Annotated[dict, Depends(get_current_user)]
):
    return await PersonService.update(
        session=db,
        person_id=person_id,
        payload=payload,
        current_user_id=current_user['id']
    )

@router.delete(
    "/{person_id}",
)
async def delete_person(
    person_id: int,
    db: session_dep,
    current_user: Annotated[dict, Depends(get_current_user)],
):
    await PersonService.delete(
        session=db,
        person_id=person_id,
        current_user_id=current_user["id"],
    )

    return {"msg": "Person deleted!"}
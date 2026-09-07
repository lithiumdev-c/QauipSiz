from typing import Annotated

from fastapi import APIRouter, Depends

from app.core.database import session_dep
from app.routers.auth import get_current_user
from app.schemas.case import CaseCreate, CaseUpdate, CaseResponse
from app.services.case import CaseService

router = APIRouter(
    prefix='/cases',
    tags=['cases']
)

@router.post(
    '/organization/{organization_id}/department/{department_id}',
    status_code=201,
    response_model=CaseResponse
)
async def create_case(
    organization_id: int,
    department_id: int,
    payload: CaseCreate,
    db: session_dep,
    current_user: Annotated[dict, Depends(get_current_user)]
):
    return await CaseService.create(
        session=db,
        data=payload,
        organization_id=organization_id,
        department_id=department_id,
        current_user_id=current_user['id']
    )

@router.get(
    '/organization/{organization_id}',
    response_model=list[CaseResponse]
)
async def get_cases(
    organization_id: int,
    db: session_dep,
    current_user: Annotated[dict, Depends(get_current_user)],
):
    return await CaseService.get_all(
        session=db,
        organization_id=organization_id,
        current_user_id=current_user['id']
    )

@router.get(
    '/{case_id}',
    response_model=CaseResponse
)
async def get_case(
    case_id: int,
    db: session_dep,
    current_user: Annotated[dict, Depends(get_current_user)]
):
    return await CaseService.get_by_id(
        session=db,
        case_id=case_id,
        current_user_id=current_user['id']
    )

@router.patch(
    '/{case_id}',
    response_model=CaseResponse
)
async def update_case(
    case_id: int,
    payload: CaseUpdate,
    db: session_dep,
    current_user: Annotated[dict, Depends(get_current_user)]
):
    return await CaseService.update(
        session=db,
        case_id=case_id,
        data=payload,
        current_user_id=current_user['id']
    )

@router.delete(
    '/{case_id}'
)
async def delete_case(
    case_id: int,
    db: session_dep,
    current_user: Annotated[dict, Depends(get_current_user)]
):
    await CaseService.delete(
        session=db,
        case_id=case_id,
        current_user_id=current_user['id']
    )

    return {'msg': 'Case deleted!'}
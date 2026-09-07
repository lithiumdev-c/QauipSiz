from fastapi import APIRouter, HTTPException, Depends

from typing import Annotated

from app.core.database import session_dep
from app.routers.auth import get_current_user
from app.schemas.department import DepartmentUpdate, DepartmentCreate
from app.services.department import DepartmentService

router = APIRouter(
    prefix='/departments',
    tags = ['departments']
)

@router.post('/organization/{organization_id}')
async def create_department(
    organization_id: int,
    payload: DepartmentCreate,
    db: session_dep,
    current_user: Annotated[dict, Depends(get_current_user)]
):
    return await DepartmentService.create(
        session=db,
        payload=payload,
        organization_id=organization_id,
        current_user_id=current_user['id']
    )

@router.get('/organization/{organization_id}')
async def get_departments(
    organization_id: int,
    db: session_dep,
    current_user: Annotated[dict, Depends(get_current_user)]
):
    return await DepartmentService.get_all(
        session=db,
        organization_id=organization_id,
        current_user_id=current_user['id']
    )

@router.get('/{department_id}')
async def get_department(
    department_id:int,
    payload: DepartmentUpdate,
    db: session_dep,
    current_user: Annotated[dict, Depends(get_current_user)]
):
    return await DepartmentService.get_by_id(
        session=db,
        department_id=department_id,
        current_user_id=current_user['id']
    )

@router.patch('/{department_id}')
async def update_department(
    department_id: int,
    payload: DepartmentUpdate,
    db:session_dep,
    current_user: Annotated[dict, Depends(get_current_user)]
):
    return await DepartmentService.update(
        session=db,
        payload=payload,
        department_id=department_id,
        current_user_id=current_user['id']
    )

@router.delete('/{department_id}')
async def delete_department(
    department_id: int, 
    db: session_dep,
    current_user: Annotated[dict, Depends(get_current_user)]
):
    await DepartmentService.delete(
        session=db,
        department_id=department_id,
        current_user_id=current_user['id']
    )

    return {'msg': 'Department deleted!'}
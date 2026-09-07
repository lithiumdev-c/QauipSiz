from fastapi import APIRouter, Depends

from typing import Annotated

from app.core.database import session_dep
from app.services.organization import OrganizationService
from app.schemas.organization import OrganizationCreate, OrganizationResponse
from app.routers.auth import get_current_user

router = APIRouter(
    prefix='/organization',
    tags=['organization']
)

@router.post('', status_code=201, response_model=OrganizationResponse)
async def add_organization(db: session_dep, payload: OrganizationCreate, current_user: Annotated[dict, Depends(get_current_user)]):
    return await OrganizationService.create(session=db, data=payload, user_id=current_user['id'])

@router.get('', status_code=200, response_model=list[OrganizationResponse])
async def get_organizations(db: session_dep, current_user: Annotated[dict, Depends(get_current_user)]):
    return await OrganizationService.get_all(session=db)

@router.get('/{org_id}', status_code=200, response_model=OrganizationResponse)
async def get_organization(db: session_dep, org_id: int, current_user: Annotated[dict, Depends(get_current_user)]):
    return await OrganizationService.get_by_id(session=db, org_id=org_id)


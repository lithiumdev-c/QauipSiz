from fastapi import APIRouter, Depends

from typing import Annotated

from app.core.database import session_dep
from app.routers.auth import get_current_user
from app.services.organization_member import OrganizationMemberService
from app.schemas.organization_member import OrganizationMemberCreate, OrganizationMemberResponse, OrganizationMemberUpdate

router = APIRouter(
    prefix='/organization-members',
    tags=['organization members']
)

@router.get('/{organization_id}')
async def get_members(
    organization_id: int,
    db: session_dep,
    current_user: Annotated[dict, Depends(get_current_user)]
):
    return await OrganizationMemberService.get_all(
        session=db,
        organization_id=organization_id
    )

@router.post('')
async def add_organization_member(
    payload: OrganizationMemberCreate,
    db: session_dep,
    current_user: Annotated[dict, Depends(get_current_user)]
):
    await OrganizationMemberService.check_admin(
        session=db,
        user_id=current_user['id'],
        organization_id=payload.organization_id
    )
    
    return await OrganizationMemberService.create(
        session=db,
        data=payload
    )

@router.get('/member/{member_id}')
async def get_member(
    db: session_dep,
    member_id: int,
    current_user: Annotated[dict, Depends(get_current_user)]
):
    return await OrganizationMemberService.get_by_id(
        session=db,
        member_id=member_id
    )

@router.delete('/member/{member_id}')
async def delete_member(
    db: session_dep,
    member_id: int,
    current_user: Annotated[dict, Depends(get_current_user)]
):
    member = await OrganizationMemberService.get_by_id(
        session=db,
        member_id=member_id
    )

    await OrganizationMemberService.check_admin(
        session=db,
        user_id=current_user['id'],
        organization_id=member.organization_id
    )
    
    await OrganizationMemberService.delete(
        session=db,
        member_id=member_id
    )

    return {'msg': 'Member deleted'}

@router.patch('/member/{member_id}', response_model=OrganizationMemberResponse)
async def update_member(
    member_id: int,
    payload: OrganizationMemberUpdate,
    db: session_dep,
    current_user: Annotated[dict, Depends(get_current_user)]
):
    return await OrganizationMemberService.patch_member(
        session=db,
        data=payload,
        member_id=member_id,
        current_user_id=current_user['id']
    )
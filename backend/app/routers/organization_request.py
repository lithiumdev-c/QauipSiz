from typing import Annotated

from fastapi import APIRouter, Depends

from app.core.database import session_dep
from app.core.admin import get_current_platform_admin
from app.routers.auth import get_current_user

from app.schemas.organization_request import (
    OrganizationRequestCreate,
    OrganizationRequestResponse,
)

from app.services.organization_request import (
    OrganizationRequestService,
)


router = APIRouter(
    prefix="/organization-requests",
    tags=["organization requests"],
)


@router.post(
    "",
    response_model=OrganizationRequestResponse,
    status_code=201,
)
async def create_organization_request(
    payload: OrganizationRequestCreate,
    db: session_dep,
    current_user: Annotated[
        dict,
        Depends(get_current_user),
    ],
):
    return await OrganizationRequestService.create(
        session=db,
        data=payload,
        user_id=current_user["id"],
    )


@router.get(
    "",
    response_model=list[OrganizationRequestResponse],
)
async def get_organization_requests(
    db: session_dep,
    current_admin=Depends(get_current_platform_admin),
):
    return await OrganizationRequestService.get_all(
        session=db,
    )


@router.get(
    "/my",
    response_model=list[OrganizationRequestResponse],
)
async def get_my_organization_requests(
    db: session_dep,
    current_user: Annotated[
        dict,
        Depends(get_current_user),
    ],
):
    return await OrganizationRequestService.get_my_requests(
        session=db,
        user_id=current_user["id"],
    )


@router.post(
    "/{request_id}/approve",
    response_model=OrganizationRequestResponse,
)
async def approve_organization_request(
    request_id: int,
    db: session_dep,
    current_admin=Depends(get_current_platform_admin),
):
    return await OrganizationRequestService.approve(
        session=db,
        request_id=request_id,
    )


@router.post(
    "/{request_id}/reject",
    response_model=OrganizationRequestResponse,
)
async def reject_organization_request(
    request_id: int,
    db: session_dep,
    current_admin=Depends(get_current_platform_admin),
):
    return await OrganizationRequestService.reject(
        session=db,
        request_id=request_id,
    )
from fastapi import APIRouter, Depends

from app.core.database import session_dep
from app.core.admin import get_current_platform_admin
from app.schemas.user import AdminUserResponse
from app.services.users import UserService

router = APIRouter(
    prefix='/users',
    tags=['users']
)

@router.get('', response_model=list[AdminUserResponse])
async def get_users(
    db: session_dep,
    current_admin=Depends(get_current_platform_admin),
):
    return await UserService.get_all(session=db)

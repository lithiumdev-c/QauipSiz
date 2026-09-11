from fastapi import Depends, HTTPException
from typing import Annotated

from app.core.database import session_dep
from app.repositories.user import UserRepository
from app.routers.auth import get_current_user


async def get_current_platform_admin(
    db: session_dep,
    current_user: Annotated[
        dict,
        Depends(get_current_user),
    ],
):
    user = await UserRepository.get_by_id(
        session=db,
        user_id=current_user["id"],
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="User not found!",
        )

    if user.role != "platform_admin":
        raise HTTPException(
            status_code=403,
            detail="Platform admin access required!",
        )

    return user
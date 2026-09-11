from sqlalchemy import select

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.models.organization_member import OrganizationMember
from app.models.organization import Organization
from app.models.department import Department
from app.repositories.user import UserRepository
from app.schemas.user import UserCreate

from datetime import timedelta, timezone, datetime

from fastapi import HTTPException

from pwdlib import PasswordHash
from pwdlib.hashers.bcrypt import BcryptHasher
from jose import jwt

import os
from dotenv import load_dotenv
load_dotenv()

SECRET_KEY = os.getenv('SECRET_KEY')
ALGORITHM = 'HS256'
bcrypt_context = PasswordHash((BcryptHasher(),))

def create_access_token(username: str, user_id: int, expires_delta: timedelta):
    expires = datetime.now(timezone.utc) + expires_delta
    encode = {'sub': username, 'id': user_id, 'exp': expires}
    return jwt.encode(encode, SECRET_KEY, algorithm=ALGORITHM) #type: ignore

class AuthService:
    @classmethod
    async def register(cls, data:UserCreate, session:AsyncSession):
        user = await UserRepository.create_user_model(
            data=data,
            session=session
        )

        return user

    @classmethod
    async def login(cls, username: str, password: str, session:AsyncSession):
        user = await UserRepository.authenticate_user(
            session=session,
            username=username,
            password=password
        )

        if not user:
            raise HTTPException(
                status_code=401,
                headers={'WWW-Authenticate': 'Bearer'}
            )

        token = create_access_token(user.username, user.id, timedelta(minutes=20))

        return {'access_token': token, 'token_type': 'bearer'}

    @classmethod
    async def get_me(cls, session: AsyncSession, user_id: int):
        user = await UserRepository.get_by_id(
            session=session,
            user_id=user_id,
        )

        if not user:
            raise HTTPException(
                status_code=401,
                detail='User not found!',
            )

        result = await session.execute(
            select(OrganizationMember)
            .where(OrganizationMember.user_id == user.id)
            .order_by(OrganizationMember.created_at.desc())
        )

        membership = result.scalars().first()

        organization = None
        membership_data = None

        if membership:
            org_result = await session.execute(
                select(Organization).where(Organization.id == membership.organization_id)
            )
            organization = org_result.scalar_one_or_none()

            department = None

            if membership.department_id:
                dept_result = await session.execute(
                    select(Department).where(Department.id == membership.department_id)
                )
                department = dept_result.scalar_one_or_none()

            membership_data = {
                'id': membership.id,
                'role': membership.role,
                'status': membership.status,
                'department': (
                    {'id': department.id, 'name': department.name}
                    if department else None
                ),
            }

            organization_data = (
                {'id': organization.id, 'name': organization.name, 'country': organization.country}
                if organization else None
            )
        else:
            organization_data = None

        return {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': user.role,
            'organization': organization_data,
            'membership': membership_data,
            'created_at': user.created_at,
        }

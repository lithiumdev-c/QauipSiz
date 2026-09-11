from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession

from fastapi import HTTPException

from datetime import datetime, timezone

from app.models.user import User
from app.schemas.user import UserCreate

from pwdlib import PasswordHash
from pwdlib.hashers.bcrypt import BcryptHasher

bcrypt_context = PasswordHash((BcryptHasher(),))

class UserRepository:

    @classmethod
    async def create_user_model(cls, data:UserCreate, session:AsyncSession):
        query = await session.execute(select(User).where(or_(User.username == data.username, User.email == data.email)))
        exist_user = query.scalar_one_or_none()

        if exist_user:
            raise HTTPException(status_code=409, detail="Error! User exists.")

        create_user_model = User(
            username = data.username,
            email = data.email,
            password_hash = bcrypt_context.hash(data.password),
        )

        session.add(create_user_model)

        await session.commit()
        await session.refresh(create_user_model)

        return create_user_model

    @classmethod
    async def authenticate_user(cls, username:str, password: str, session:AsyncSession):
        query = await session.execute(select(User).where(User.username == username))
        user = query.scalar_one_or_none()

        if not user:
            return False
        if not bcrypt_context.verify(password, user.password_hash):
            return False

        return user

    @classmethod
    async def get_by_id(
        cls,
        session: AsyncSession,
        user_id: int,
    ):
        result = await session.execute(
            select(User).where(User.id == user_id)
        )

        return result.scalar_one_or_none()

    @classmethod
    async def get_all(
        cls,
        session: AsyncSession,
    ):
        result = await session.execute(
            select(User).order_by(User.created_at.desc())
        )

        return list(result.scalars().all())
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.user import UserRepository
from app.schemas.user import UserCreate

from datetime import timedelta, timezone, datetime

from fastapi import HTTPException

from pwdlib import PasswordHash
from pwdlib.hashers.bcrypt import BcryptHasher
from jose import jwt, JWTError

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


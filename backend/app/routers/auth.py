from fastapi import APIRouter, Depends, HTTPException

from typing import Annotated

from app.core.database import session_dep
from app.schemas.user import UserCreate, UserResponse, MeResponse
from app.services.auth import AuthService

from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import jwt, JWTError

from dotenv import load_dotenv
import os

load_dotenv()

router = APIRouter(
    prefix='/auth',
    tags=['auth']
)

SECRET_KEY = os.getenv('SECRET_KEY')
ALGORITHM = 'HS256'

oauth2_bearer = OAuth2PasswordBearer(tokenUrl='/auth/login')

async def get_current_user(token: Annotated[str, Depends(oauth2_bearer)]):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM]) #type: ignore
        username: str | None = payload.get('sub')
        user_id: int | None = payload.get('id')
        if username is None or user_id is None:
            raise HTTPException(status_code=401)
        return {'username': username, 'id': user_id}
    except JWTError:
        raise HTTPException(status_code=401, detail='Could not validate user.')

@router.post('/register', status_code=201, response_model=UserResponse)
async def create_user(db: session_dep, payload: UserCreate):
    return await AuthService.register(data=payload, session=db)

@router.post('/login')
async def login(db: session_dep, form_data: Annotated[OAuth2PasswordRequestForm, Depends()]):
    return await AuthService.login(session=db, username=form_data.username, password=form_data.password)

@router.get('/me', response_model=MeResponse)
async def get_me(
    db: session_dep,
    current_user: Annotated[dict, Depends(get_current_user)],
):
    return await AuthService.get_me(session=db, user_id=current_user['id'])

@router.get('/profile')
async def get_profile(current_user: Annotated[dict, Depends(get_current_user)]):
    return {"Your profile": current_user}

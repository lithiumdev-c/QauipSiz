from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from typing import AsyncContextManager, cast

from app.core.config import settings
from app.core.database import engine, Base
from app.routers import auth, department, organization, organization_members, case, person, video, detection, match, organization_request, users

@asynccontextmanager
async def lifespan(app: FastAPI):
    async with cast(AsyncContextManager, engine.begin()) as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield 
    await engine.dispose()

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(organization.router)
app.include_router(organization_members.router)
app.include_router(department.router)
app.include_router(case.router)
app.include_router(person.router)
app.include_router(video.router)
app.include_router(detection.router)
app.include_router(match.router)
app.include_router(organization_request.router)
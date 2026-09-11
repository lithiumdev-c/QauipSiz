
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr


class UserBase(BaseModel):
    email: EmailStr
    username: str


class UserCreate(UserBase):
    password: str


class UserResponse(UserBase):
    id: int

    model_config = ConfigDict(
        from_attributes=True,
    )


class AdminUserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    role: str
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )


class MeDepartment(BaseModel):
    id: int
    name: str

    model_config = ConfigDict(from_attributes=True)


class MeOrganization(BaseModel):
    id: int
    name: str
    country: str

    model_config = ConfigDict(from_attributes=True)


class MeMembership(BaseModel):
    id: int
    role: str
    status: str
    department: MeDepartment | None

    model_config = ConfigDict(from_attributes=True)


class MeResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    role: str
    organization: MeOrganization | None
    membership: MeMembership | None
    created_at: datetime

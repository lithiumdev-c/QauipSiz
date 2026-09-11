from datetime import datetime

from pydantic import BaseModel, ConfigDict


class OrganizationRequestUser(BaseModel):
    id: int
    username: str
    email: str


class OrganizationRequestCreate(BaseModel):
    name: str
    country: str
    description: str | None = None


class OrganizationRequestResponse(BaseModel):
    id: int
    user_id: int
    name: str
    country: str
    description: str | None
    status: str
    created_at: datetime
    user: OrganizationRequestUser | None = None

    model_config = ConfigDict(
        from_attributes=True,
    )

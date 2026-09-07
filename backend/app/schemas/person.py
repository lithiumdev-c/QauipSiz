from datetime import date

from pydantic import BaseModel, ConfigDict


class PersonCreate(BaseModel):
    name: str
    date_of_birth: date | None = None
    description: str | None = None


class PersonUpdate(BaseModel):
    name: str | None = None
    date_of_birth: date | None = None
    description: str | None = None


class PersonResponse(BaseModel):
    id: int
    case_id: int
    name: str
    date_of_birth: date | None
    description: str | None
    photo_url: str | None

    model_config = ConfigDict(
        from_attributes=True,
    )
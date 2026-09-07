from pydantic import BaseModel, ConfigDict


class CaseCreate(BaseModel):
    title: str
    description: str | None = None

class CaseUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    type: str | None = None
    status: str | None = None


class CaseResponse(BaseModel):
    id: int
    organization_id: int
    department_id: int
    created_by: int

    title: str
    description: str | None

    type: str
    status: str

    model_config = ConfigDict(
        from_attributes=True,
    )
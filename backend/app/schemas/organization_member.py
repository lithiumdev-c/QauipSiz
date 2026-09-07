from pydantic import BaseModel, ConfigDict


class OrganizationMemberCreate(BaseModel):
    user_id: int
    organization_id: int
    department_id: int | None = None

class OrganizationMemberUpdate(BaseModel):
    user_id: int | None = None
    organization_id: int | None = None
    department_id: int | None = None


class OrganizationMemberResponse(BaseModel):
    id: int
    user_id: int
    organization_id: int
    department_id: int | None
    role: str
    status: str

    model_config = ConfigDict(from_attributes=True)

from pydantic import BaseModel, ConfigDict

class OrganizationBase(BaseModel):
    name: str
    country: str

class OrganizationCreate(OrganizationBase):
    pass

class OrganizationResponse(OrganizationBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
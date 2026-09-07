from pydantic import BaseModel, ConfigDict


class VideoResponse(BaseModel):
    id: int
    case_id: int
    uploaded_by: int
    file_path: str
    status: str
    duration: float | None

    model_config = ConfigDict(
        from_attributes=True,
    )
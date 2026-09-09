from pydantic import BaseModel, ConfigDict


class MatchCreate(BaseModel):
    video_id: int
    person_id: int
    timestamp: float
    similarity: float
    frame_url: str


class MatchStatusUpdate(BaseModel):
    status: str


class MatchResponse(BaseModel):
    id: int
    video_id: int
    person_id: int
    timestamp: float
    similarity: float
    frame_url: str
    status: str

    model_config = ConfigDict(
        from_attributes=True,
    )
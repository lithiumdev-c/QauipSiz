from pydantic import BaseModel, ConfigDict


class DetectionResponse(BaseModel):
    id: int
    video_id: int

    timestamp: float
    confidence: float

    x1: int
    y1: int
    x2: int
    y2: int

    model_config = ConfigDict(
        from_attributes=True,
    )
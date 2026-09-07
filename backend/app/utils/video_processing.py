import os
import tempfile

import cv2
import httpx


async def get_video_info(video_url: str) -> dict:
    with tempfile.NamedTemporaryFile(
        suffix=".mp4",
        delete=False,
    ) as temp_file:
        temp_path = temp_file.name

    cap = None

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(video_url)
            response.raise_for_status()

            with open(temp_path, "wb") as file:
                file.write(response.content)

        cap = cv2.VideoCapture(temp_path)

        if not cap.isOpened():
            raise RuntimeError("Could not open video")

        fps = cap.get(cv2.CAP_PROP_FPS)
        frames = cap.get(cv2.CAP_PROP_FRAME_COUNT)

        if fps <= 0:
            raise RuntimeError("Invalid video FPS")

        duration = frames / fps

        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

        return {
            "fps": fps,
            "frames": int(frames),
            "duration": duration,
            "width": width,
            "height": height,
        }

    finally:
        if cap is not None:
            cap.release()

        if os.path.exists(temp_path):
            os.remove(temp_path)
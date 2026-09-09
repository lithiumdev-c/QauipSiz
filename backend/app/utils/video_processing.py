import os
import tempfile

import cv2
import httpx
import time

from app.utils.detection import detect_people

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


async def process_video(video_url: str) -> dict:
    start_time = time.perf_counter()

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

        if fps <= 0:
            raise RuntimeError("Invalid video FPS")

        total_frames = int(
            cap.get(cv2.CAP_PROP_FRAME_COUNT)
        )

        processed_frames = 0
        detections = []

        while True:
            ret, frame = cap.read()

            if not ret:
                break

            people = detect_people(frame)

            timestamp = processed_frames / fps

            for person in people:
                detections.append({
                    'timestamp': timestamp,
                    'confidence': person['confidence'],
                    'bbox': person['bbox']
                })

        processing_time = time.perf_counter() - start_time

        confidences = [
            detection["confidence"]
            for detection in detections
        ]

        people_detected = len(detections)

        avg_confidence = (
            sum(confidences) / people_detected
            if people_detected
            else 0
        )

        max_confidence = (
            max(confidences)
            if confidences
            else 0
        )

        statistics = {
            "status": "completed",
            "frames_processed": processed_frames,
            "total_frames": total_frames,
            "people_detected": people_detected,
            "avg_confidence": avg_confidence,
            "max_confidence": max_confidence,
            "processing_time": processing_time,
        }

        print()
        print("╭────────────────────────────────────╮")
        print("│          VIDEO PROCESSING          │")
        print("├────────────────────────────────────┤")
        print(f"│ Frames processed : {processed_frames:<12} │")
        print(f"│ Total frames     : {total_frames:<12} │")
        print(f"│ People detected  : {people_detected:<12} │")
        print(f"│ Avg confidence   : {avg_confidence * 100:>10.2f}% │")
        print(f"│ Max confidence   : {max_confidence * 100:>10.2f}% │")
        print(f"│ Processing time   : {processing_time:>10.2f}s │")
        print("╰────────────────────────────────────╯")
        print()

        return {
            **statistics,
            'detections': detections
        }

    finally:
        if cap is not None:
            cap.release()

        if os.path.exists(temp_path):
            os.remove(temp_path)
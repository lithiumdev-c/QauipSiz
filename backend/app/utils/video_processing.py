import os
import tempfile

import cv2
import httpx
import time
import torch

from io import BytesIO

from PIL import Image

from app.utils.matching import calculate_person_similarity, get_reference_embedding
from app.utils.detection import detect_people

MATCH_THRESHOLD = 0.75

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

async def process_video(
    video_url: str,
    reference_embeddings: dict[int, torch.Tensor],
) -> dict:
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
        best_matches = {}

        while True:
            ret, frame = cap.read()

            if not ret:
                break

            timestamp = processed_frames / fps

            people = detect_people(frame)

            for person in people:
                x1, y1, x2, y2 = person["bbox"]

                crop = frame[y1:y2, x1:x2]

                if crop.size == 0:
                    continue

                crop_image = Image.fromarray(
                    cv2.cvtColor(crop, cv2.COLOR_BGR2RGB)
                )

                best_person_id = None
                best_similarity = -1.0

                for person_id, reference_embedding in (
                    reference_embeddings.items()
                ):
                    similarity = calculate_person_similarity(
                        reference_embedding,
                        crop_image,
                    )

                    if similarity > best_similarity:
                        best_similarity = similarity
                        best_person_id = person_id

                detections.append({
                    "timestamp": timestamp,
                    "confidence": person["confidence"],
                    "bbox": person["bbox"],
                })

                if (
                    best_person_id is not None
                    and best_similarity >= MATCH_THRESHOLD
                ):
                    print(
                        f"[POTENTIAL MATCH] "
                        f"person_id={best_person_id} "
                        f"time={timestamp:.2f}s "
                        f"similarity={best_similarity:.4f}"
                    )

                    current_match = {
                        "person_id": best_person_id,
                        "timestamp": timestamp,
                        "similarity": best_similarity,
                        "bbox": person["bbox"],
                    }

                    previous_match = best_matches.get(
                        best_person_id
                    )

                    if (
                        previous_match is None
                        or best_similarity
                        > previous_match["similarity"]
                    ):
                        best_matches[best_person_id] = current_match

            processed_frames += 1

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
            "detections": detections,
            "matches": list(best_matches.values()),
        }

        print()
        print("╭────────────────────────────────────╮")
        print("│          VIDEO PROCESSING          │")
        print("├────────────────────────────────────┤")
        print(
            f"│ Frames processed : "
            f"{processed_frames:<12} │"
        )
        print(
            f"│ Total frames     : "
            f"{total_frames:<12} │"
        )
        print(
            f"│ People detected  : "
            f"{people_detected:<12} │"
        )
        print(
            f"│ Potential matches: "
            f"{len(best_matches):<12} │"
        )
        print(
            f"│ Avg confidence   : "
            f"{avg_confidence * 100:>10.2f}% │"
        )
        print(
            f"│ Max confidence   : "
            f"{max_confidence * 100:>10.2f}% │"
        )
        print(
            f"│ Processing time  : "
            f"{processing_time:>10.2f}s │"
        )
        print("╰────────────────────────────────────╯")
        print()

        return statistics

    finally:
        if cap is not None:
            cap.release()

        if os.path.exists(temp_path):
            os.remove(temp_path)

async def load_image_from_url(url: str) -> Image.Image:
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        response.raise_for_status()

    return Image.open(
        BytesIO(response.content)
    ).convert("RGB")
from typing import cast

from ultralytics import YOLO
from ultralytics.engine.results import Results


model = YOLO("yolo11n.pt")

CONFIDENCE_THRESHOLD = 0.5


def detect_people(frame):
    results = model.predict(
        source=frame,
        verbose=False,
    )

    detections = []

    for result in results:
        result = cast(Results, result)

        if result.boxes is None:
            continue

        for box in result.boxes:
            class_id = int(box.cls.item())
            confidence = float(box.conf.item())

            if class_id != 0 or confidence < CONFIDENCE_THRESHOLD:
                continue

            x1, y1, x2, y2 = map(
                int,
                box.xyxy[0].tolist(),
            )

            detections.append({
                "confidence": confidence,
                "bbox": [x1, y1, x2, y2],
            })

    return detections
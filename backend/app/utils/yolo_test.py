import cv2

from app.utils.detection import detect_people


cap = cv2.VideoCapture("test2.mp4")

if not cap.isOpened():
    raise RuntimeError("Could not open video")

total_frames = 0
frames_with_people = 0
frames_without_people = 0
total_detections = 0

confidences = []


while True:
    ret, frame = cap.read()

    if not ret:
        break

    total_frames += 1

    detections = detect_people(frame)

    if detections:
        frames_with_people += 1

        for detection in detections:
            confidence = detection["confidence"]

            total_detections += 1
            confidences.append(confidence)

    else:
        frames_without_people += 1


cap.release()


print("\n========== YOLO STATISTICS ==========")

print(f"Total frames: {total_frames}")
print(f"Frames with people: {frames_with_people}")
print(f"Frames without people: {frames_without_people}")

print(f"Total detections: {total_detections}")

if confidences:
    average_confidence = sum(confidences) / len(confidences)

    print(f"Average confidence: {average_confidence:.2f}")
    print(f"Minimum confidence: {min(confidences):.2f}")
    print(f"Maximum confidence: {max(confidences):.2f}")
else:
    print("No people detected.")

print("=====================================")
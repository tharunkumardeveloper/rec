import cv2
import mediapipe as mp
import numpy as np
import pandas as pd
from collections import deque
import os

# ================= UTILITIES =================
def angle(a, b, c):
    ba = np.array([a[0] - b[0], a[1] - b[1]])
    bc = np.array([c[0] - b[0], c[1] - b[1]])
    cosang = np.clip(
        np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc) + 1e-9),
        -1.0, 1.0
    )
    return np.degrees(np.arccos(cosang))

def lm_xy(lm, w, h):
    return (int(lm.x * w), int(lm.y * h))

# ================= THRESHOLDS =================
GREEN_ANGLE = 110     # sitting up (liberal)
SMOOTH_N = 5          # smoothing for stability

# ================= CAMERA =================
cap = cv2.VideoCapture(0)
if not cap.isOpened():
    raise RuntimeError("Cannot access camera")

fps = cap.get(cv2.CAP_PROP_FPS) or 30
width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

os.makedirs("output", exist_ok=True)
out = cv2.VideoWriter(
    "output/situp_annotated.mp4",
    cv2.VideoWriter_fourcc(*"mp4v"),
    fps,
    (width, height)
)

# ================= MEDIAPIPE =================
mp_pose = mp.solutions.pose
pose = mp_pose.Pose(
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
)
draw = mp.solutions.drawing_utils

# ================= STATE =================
angle_hist = deque(maxlen=SMOOTH_N)
prev_color = "RED"
reps = []

# ================= MAIN LOOP =================
while True:
    ret, frame = cap.read()
    if not ret:
        break

    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    result = pose.process(rgb)

    smooth_angle = None
    curr_color = prev_color

    if result.pose_landmarks:
        draw.draw_landmarks(
            frame,
            result.pose_landmarks,
            mp_pose.POSE_CONNECTIONS
        )

        lm = result.pose_landmarks.landmark

        try:
            shoulder = lm_xy(lm[mp_pose.PoseLandmark.LEFT_SHOULDER], width, height)
            hip = lm_xy(lm[mp_pose.PoseLandmark.LEFT_HIP], width, height)
            knee = lm_xy(lm[mp_pose.PoseLandmark.LEFT_KNEE], width, height)

            torso_angle = angle(shoulder, hip, knee)
            angle_hist.append(torso_angle)
            smooth_angle = sum(angle_hist) / len(angle_hist)

            # RED / GREEN state
            curr_color = "GREEN" if smooth_angle <= GREEN_ANGLE else "RED"

            # -------- REP COUNT (RED → GREEN) --------
            if prev_color == "RED" and curr_color == "GREEN":
                reps.append({
                    "rep": len(reps) + 1,
                    "angle": round(smooth_angle, 2)
                })

            prev_color = curr_color

        except:
            pass

    # ================= HUD =================
    cv2.putText(
        frame, f"Sit-Ups: {len(reps)}",
        (20, 40),
        cv2.FONT_HERSHEY_SIMPLEX,
        1.0, (0, 255, 255), 2
    )

    if smooth_angle is not None:
        color = (0, 255, 0) if curr_color == "GREEN" else (0, 0, 255)
        cv2.putText(
            frame,
            f"Torso Angle: {int(smooth_angle)}",
            (20, 90),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.8, color, 2
        )

    cv2.putText(
        frame, f"State: {curr_color}",
        (20, 130),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.8, (200, 200, 200), 2
    )

    cv2.imshow("Sit-Up Counter (Live)", frame)
    out.write(frame)

    if cv2.waitKey(1) & 0xFF in [27, ord("q")]:
        break

# ================= CLEANUP =================
cap.release()
out.release()
cv2.destroyAllWindows()
pose.close()

pd.DataFrame(reps).to_csv("output/situp_log.csv", index=False)

print("Done.")
print("Saved: output/situp_annotated.mp4")
print("Saved: output/situp_log.csv")
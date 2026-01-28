import cv2
import mediapipe as mp
import numpy as np
import pandas as pd
from collections import deque
import os

# -------------------- Utilities --------------------
def angle(a, b, c):
    ba = np.array([a[0]-b[0], a[1]-b[1]])
    bc = np.array([c[0]-b[0], c[1]-b[1]])
    cosang = np.clip(
        np.dot(ba, bc) / ((np.linalg.norm(ba)*np.linalg.norm(bc)) + 1e-9),
        -1.0, 1.0
    )
    return float(np.degrees(np.arccos(cosang)))

def lm_xy(lm, w, h):
    return (int(lm.x * w), int(lm.y * h))

# -------------------- Thresholds --------------------
DOWN_ANGLE = 75
UP_ANGLE = 110
PLANK_MIN_ANGLE = 165
CHEST_DEPTH_MIN = 40
MIN_DIP_DURATION = 0.2
SMOOTH_N = 3
PROCESS_SCALE = 0.5

# -------------------- Camera --------------------
cap = cv2.VideoCapture(0)
assert cap.isOpened(), "Camera not accessible"

width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
fps = cap.get(cv2.CAP_PROP_FPS) or 30

os.makedirs("output", exist_ok=True)
out_vid = cv2.VideoWriter(
    "output/pushup_annotated.mp4",
    cv2.VideoWriter_fourcc(*"mp4v"),
    fps,
    (width, height)
)

# -------------------- MediaPipe --------------------
mp_pose = mp.solutions.pose
pose = mp_pose.Pose(
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5,
    model_complexity=1
)
mp_draw = mp.solutions.drawing_utils

# -------------------- State --------------------
angle_history = deque(maxlen=SMOOTH_N)
state = "up"
in_dip = False
dip_start_time = None
current_dip_min_angle = 180
reps = []
frame_idx = 0

# -------------------- Main Loop --------------------
while True:
    ret, frame = cap.read()
    if not ret:
        break

    frame_idx += 1
    t = frame_idx / fps

    small = cv2.resize(frame, (0, 0), fx=PROCESS_SCALE, fy=PROCESS_SCALE)
    rgb = cv2.cvtColor(small, cv2.COLOR_BGR2RGB)
    results = pose.process(rgb)

    elbow_angle = None
    plank_angle = None
    chest_depth = None

    if results.pose_landmarks:
        mp_draw.draw_landmarks(frame, results.pose_landmarks, mp_pose.POSE_CONNECTIONS)
        lm = results.pose_landmarks.landmark

        try:
            ls = lm_xy(lm[mp_pose.PoseLandmark.LEFT_SHOULDER], width, height)
            le = lm_xy(lm[mp_pose.PoseLandmark.LEFT_ELBOW], width, height)
            lw = lm_xy(lm[mp_pose.PoseLandmark.LEFT_WRIST], width, height)

            rs = lm_xy(lm[mp_pose.PoseLandmark.RIGHT_SHOULDER], width, height)
            re = lm_xy(lm[mp_pose.PoseLandmark.RIGHT_ELBOW], width, height)
            rw = lm_xy(lm[mp_pose.PoseLandmark.RIGHT_WRIST], width, height)

            lh = lm_xy(lm[mp_pose.PoseLandmark.LEFT_HIP], width, height)
            la = lm_xy(lm[mp_pose.PoseLandmark.LEFT_ANKLE], width, height)

            ang_l = angle(ls, le, lw)
            ang_r = angle(rs, re, rw)
            elbow_angle = (ang_l + ang_r) / 2

            plank_angle = angle(ls, lh, la)
            chest_depth = lw[1] - ls[1]

        except:
            pass

    # -------------------- Rep Logic --------------------
    if elbow_angle is not None:
        angle_history.append(elbow_angle)
        elbow_sm = sum(angle_history) / len(angle_history)

        if state == "up" and elbow_sm <= DOWN_ANGLE:
            state = "down"
            in_dip = True
            dip_start_time = t
            current_dip_min_angle = elbow_sm

        elif state == "down" and elbow_sm >= UP_ANGLE:
            state = "up"
            if in_dip:
                dip_duration = t - dip_start_time

                is_correct = (
                    current_dip_min_angle <= DOWN_ANGLE and
                    dip_duration >= MIN_DIP_DURATION and
                    plank_angle is not None and plank_angle >= PLANK_MIN_ANGLE and
                    chest_depth is not None and chest_depth >= CHEST_DEPTH_MIN
                )

                reps.append({
                    "rep": len(reps) + 1,
                    "duration": round(dip_duration, 3),
                    "min_elbow": round(current_dip_min_angle, 2),
                    "plank_angle": round(plank_angle or 0, 2),
                    "chest_depth": round(chest_depth or 0, 2),
                    "correct": is_correct
                })

                in_dip = False
                dip_start_time = None
                current_dip_min_angle = 180

        if in_dip:
            current_dip_min_angle = min(current_dip_min_angle, elbow_sm)

    # -------------------- HUD --------------------
    y = 30
    def draw(text, ok=True):
        nonlocal_y = None
        cv2.putText(
            frame, text, (10, y),
            cv2.FONT_HERSHEY_SIMPLEX, 0.7,
            (0, 255, 0) if ok else (0, 0, 255), 2
        )
        return y + 30

    draw_y = 30
    cv2.putText(frame, f"Reps: {len(reps)}", (10, draw_y),
                cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255,255,0), 2)
    draw_y += 30

    if elbow_angle:
        cv2.putText(frame, f"Elbow: {int(elbow_sm)}", (10, draw_y),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7,
                    (0,255,0) if elbow_sm <= DOWN_ANGLE else (0,0,255), 2)
        draw_y += 30

    if plank_angle:
        cv2.putText(frame, f"Plank: {int(plank_angle)}", (10, draw_y),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7,
                    (0,255,0) if plank_angle >= PLANK_MIN_ANGLE else (0,0,255), 2)
        draw_y += 30

    if chest_depth:
        cv2.putText(frame, f"Depth: {int(chest_depth)}", (10, draw_y),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7,
                    (0,255,0) if chest_depth >= CHEST_DEPTH_MIN else (0,0,255), 2)
        draw_y += 30

    cv2.putText(frame, f"State: {state}", (10, draw_y),
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (200,200,200), 2)

    cv2.imshow("Pushup Counter", frame)
    out_vid.write(frame)

    if cv2.waitKey(1) & 0xFF in [27, ord("q")]:
        break

# -------------------- Cleanup --------------------
cap.release()
out_vid.release()
cv2.destroyAllWindows()
pose.close()

pd.DataFrame(reps).to_csv("output/pushup_log.csv", index=False)

print("Done.")
print("Saved: output/pushup_annotated.mp4")
print("Saved: output/pushup_log.csv")

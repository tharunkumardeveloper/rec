import cv2
import mediapipe as mp
import numpy as np
import pandas as pd
from collections import deque
import os

def angle(a, b, c):
    ba = np.array([a[0]-b[0], a[1]-b[1]])
    bc = np.array([c[0]-b[0], c[1]-b[1]])
    cosang = np.clip(np.dot(ba, bc)/((np.linalg.norm(ba)*np.linalg.norm(bc))+1e-9), -1.0, 1.0)
    return float(np.degrees(np.arccos(cosang)))

def lm_xy(lm, w, h):
    return (lm.x*w, lm.y*h)

# -------- Camera Setup --------
cap = cv2.VideoCapture(0)
filename = "camera_situp"
output_folder = filename
os.makedirs(output_folder, exist_ok=True)
width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
fps = cap.get(cv2.CAP_PROP_FPS) or 30
fourcc = cv2.VideoWriter_fourcc(*'mp4v')
out_vid = cv2.VideoWriter(os.path.join(output_folder, f"{filename}_annotated.mp4"), fourcc, fps, (width, height))
csv_path = os.path.join(output_folder, f"{filename}_situp_log.csv")

mp_pose = mp.solutions.pose
pose = mp_pose.Pose(min_detection_confidence=0.5, model_complexity=1)
mp_draw = mp.solutions.drawing_utils

angle_history = deque(maxlen=5)
state='up'
reps=[]
MIN_DIP_CHANGE = 15
last_extreme_angle=None
dip_start_time=None
frame_idx=0
PROCESS_SCALE = 0.5

while True:
    ret, frame = cap.read()
    if not ret: continue
    frame_idx += 1
    t = frame_idx/fps

    small_frame = cv2.resize(frame,(0,0),fx=PROCESS_SCALE,fy=PROCESS_SCALE)
    img_rgb = cv2.cvtColor(small_frame, cv2.COLOR_BGR2RGB)
    results = pose.process(img_rgb)

    elbow_angle = None
    if results.pose_landmarks:
        lm = results.pose_landmarks.landmark
        try:
            ls = lm_xy(lm[mp_pose.PoseLandmark.LEFT_SHOULDER], width, height)
            le = lm_xy(lm[mp_pose.PoseLandmark.LEFT_ELBOW], width, height)
            lw = lm_xy(lm[mp_pose.PoseLandmark.LEFT_WRIST], width, height)
            rs = lm_xy(lm[mp_pose.PoseLandmark.RIGHT_SHOULDER], width, height)
            re = lm_xy(lm[mp_pose.PoseLandmark.RIGHT_ELBOW], width, height)
            rw = lm_xy(lm[mp_pose.PoseLandmark.RIGHT_WRIST], width, height)
            elbow_angle = (angle(ls, le, lw) + angle(rs, re, rw))/2
        except: pass

        # Draw skeleton
        for id,l in enumerate(lm):
            cx,cy = int(l.x*width), int(l.y*height)
            cv2.circle(frame,(cx,cy),4,(0,255,255),-1)
        for s,e in mp_pose.POSE_CONNECTIONS:
            x1,y1 = int(lm[s].x*width), int(lm[s].y*height)
            x2,y2 = int(lm[e].x*width), int(lm[e].y*height)
            cv2.line(frame,(x1,y1),(x2,y2),(0,0,255),2)

    # -------- Rep Counting --------
    if elbow_angle is not None:
        angle_history.append(elbow_angle)
        elbow_angle_sm = sum(angle_history)/len(angle_history)

        if last_extreme_angle is None:
            last_extreme_angle = elbow_angle_sm

        if state=='up' and last_extreme_angle - elbow_angle_sm >= MIN_DIP_CHANGE:
            state='down'
            dip_start_time = t
            last_extreme_angle = elbow_angle_sm
        elif state=='down' and elbow_angle_sm - last_extreme_angle >= MIN_DIP_CHANGE:
            state='up'
            rep = {
                'count': len(reps)+1,
                'down_time': round(dip_start_time,3) if dip_start_time else 0,
                'up_time': round(t,3),
                'angle_change': round(elbow_angle_sm - last_extreme_angle,2)
            }
            reps.append(rep)
            dip_start_time=None
            last_extreme_angle=elbow_angle_sm

    dip_time_display = (t-dip_start_time) if state=='down' and dip_start_time else 0.0

    # -------- Display --------
    if elbow_angle is not None:
        cv2.putText(frame, f'Elbow: {int(elbow_angle_sm)}', (10,30), cv2.FONT_HERSHEY_SIMPLEX,0.8,(0,255,0),2)
    cv2.putText(frame, f'Sit-ups: {len(reps)}', (10,60), cv2.FONT_HERSHEY_SIMPLEX,0.9,(0,255,255),2)
    cv2.putText(frame, f'State: {state}', (10,95), cv2.FONT_HERSHEY_SIMPLEX,0.8,(200,200,0),2)
    cv2.putText(frame, f'Dip: {dip_time_display:.3f}s', (10,130), cv2.FONT_HERSHEY_SIMPLEX,0.8,(255,0,0),2)
    cv2.putText(frame, f'Time: {t:.1f}s', (10,160), cv2.FONT_HERSHEY_SIMPLEX,0.8,(255,255,0),2)

    cv2.imshow('Sit-up Counter', frame)
    out_vid.write(frame)
    if cv2.waitKey(1) & 0xFF in [27, ord('q')]:
        break

# -------- Cleanup --------
cap.release()
out_vid.release()
cv2.destroyAllWindows()
pose.close()

# -------- Save CSV --------
if reps:
    pd.DataFrame(reps).to_csv(csv_path,index=False)
    print(f"Saved {csv_path} with {len(reps)} reps.")
else:
    print("No reps detected.")

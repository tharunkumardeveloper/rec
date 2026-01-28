import cv2
import mediapipe as mp
import numpy as np

# ---------------- Utility Functions ---------------- #

def calculate_angle(a, b, c):
    a, b, c = np.array(a), np.array(b), np.array(c)
    ba = a - b
    bc = c - b
    cosine = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc))
    cosine = np.clip(cosine, -1.0, 1.0)
    return np.degrees(np.arccos(cosine))


def full_body_visible(landmarks, visibility_threshold=0.6):
    required = [
        mp_pose.PoseLandmark.NOSE,
        mp_pose.PoseLandmark.LEFT_SHOULDER,
        mp_pose.PoseLandmark.RIGHT_SHOULDER,
        mp_pose.PoseLandmark.LEFT_HIP,
        mp_pose.PoseLandmark.RIGHT_HIP,
        mp_pose.PoseLandmark.LEFT_KNEE,
        mp_pose.PoseLandmark.RIGHT_KNEE,
        mp_pose.PoseLandmark.LEFT_ANKLE,
        mp_pose.PoseLandmark.RIGHT_ANKLE,
    ]

    for lm in required:
        if landmarks[lm.value].visibility < visibility_threshold:
            return False
    return True


# ---------------- MediaPipe Setup ---------------- #

mp_pose = mp.solutions.pose
mp_drawing = mp.solutions.drawing_utils

cap = cv2.VideoCapture(0)

with mp_pose.Pose(
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
) as pose:

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        image_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = pose.process(image_rgb)
        image = cv2.cvtColor(image_rgb, cv2.COLOR_RGB2BGR)

        status_text = "NO PERSON"
        color = (0, 0, 255)

        if results.pose_landmarks:
            landmarks = results.pose_landmarks.landmark

            if not full_body_visible(landmarks):
                status_text = "FULL BODY NOT VISIBLE"
                color = (0, 165, 255)

            else:
                # Extract joints
                lh = [landmarks[mp_pose.PoseLandmark.LEFT_HIP].x,
                      landmarks[mp_pose.PoseLandmark.LEFT_HIP].y]
                lk = [landmarks[mp_pose.PoseLandmark.LEFT_KNEE].x,
                      landmarks[mp_pose.PoseLandmark.LEFT_KNEE].y]
                la = [landmarks[mp_pose.PoseLandmark.LEFT_ANKLE].x,
                      landmarks[mp_pose.PoseLandmark.LEFT_ANKLE].y]

                rh = [landmarks[mp_pose.PoseLandmark.RIGHT_HIP].x,
                      landmarks[mp_pose.PoseLandmark.RIGHT_HIP].y]
                rk = [landmarks[mp_pose.PoseLandmark.RIGHT_KNEE].x,
                      landmarks[mp_pose.PoseLandmark.RIGHT_KNEE].y]
                ra = [landmarks[mp_pose.PoseLandmark.RIGHT_ANKLE].x,
                      landmarks[mp_pose.PoseLandmark.RIGHT_ANKLE].y]

                left_knee_angle = calculate_angle(lh, lk, la)
                right_knee_angle = calculate_angle(rh, rk, ra)

                if left_knee_angle > 165 and right_knee_angle > 165:
                    status_text = "STANDING"
                    color = (0, 255, 0)
                else:
                    status_text = "NOT STANDING"
                    color = (0, 0, 255)

            mp_drawing.draw_landmarks(
                image, results.pose_landmarks, mp_pose.POSE_CONNECTIONS
            )

        cv2.putText(image, status_text, (20, 40),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, color, 2)

        cv2.imshow("Posture Detection", image)

        if cv2.waitKey(10) & 0xFF == ord('q'):
            break

cap.release()
cv2.destroyAllWindows()

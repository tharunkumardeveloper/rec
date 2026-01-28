// Service for checking full body visibility and standing posture before workouts
import { PoseLandmark } from './mediapipeProcessor';

export interface PostureCheckResult {
  isFullBodyVisible: boolean;
  isStanding: boolean;
  status: 'NO_PERSON' | 'FULL_BODY_NOT_VISIBLE' | 'NOT_STANDING' | 'STANDING';
  message: string;
  color: string;
  leftKneeAngle?: number;
  rightKneeAngle?: number;
}

// MediaPipe Pose Landmark indices
const POSE_LANDMARKS = {
  NOSE: 0,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
};

export class PostureChecker {
  private visibilityThreshold = 0.6;
  private standingAngleThreshold = 165;

  calculateAngle(a: PoseLandmark, b: PoseLandmark, c: PoseLandmark): number {
    const ba = { x: a.x - b.x, y: a.y - b.y };
    const bc = { x: c.x - b.x, y: c.y - b.y };
    
    const dotProduct = ba.x * bc.x + ba.y * bc.y;
    const magnitudeBA = Math.sqrt(ba.x * ba.x + ba.y * ba.y);
    const magnitudeBC = Math.sqrt(bc.x * bc.x + bc.y * bc.y);
    
    const cosine = Math.max(-1, Math.min(1, dotProduct / (magnitudeBA * magnitudeBC)));
    return Math.acos(cosine) * (180 / Math.PI);
  }

  checkFullBodyVisible(landmarks: PoseLandmark[]): boolean {
    const requiredLandmarks = [
      POSE_LANDMARKS.NOSE,
      POSE_LANDMARKS.LEFT_SHOULDER,
      POSE_LANDMARKS.RIGHT_SHOULDER,
      POSE_LANDMARKS.LEFT_HIP,
      POSE_LANDMARKS.RIGHT_HIP,
      POSE_LANDMARKS.LEFT_KNEE,
      POSE_LANDMARKS.RIGHT_KNEE,
      POSE_LANDMARKS.LEFT_ANKLE,
      POSE_LANDMARKS.RIGHT_ANKLE,
    ];

    for (const landmarkIndex of requiredLandmarks) {
      if (!landmarks[landmarkIndex] || landmarks[landmarkIndex].visibility < this.visibilityThreshold) {
        return false;
      }
    }
    return true;
  }

  checkPosture(landmarks: PoseLandmark[] | null): PostureCheckResult {
    // No person detected
    if (!landmarks || landmarks.length === 0) {
      return {
        isFullBodyVisible: false,
        isStanding: false,
        status: 'NO_PERSON',
        message: 'No person detected',
        color: '#EF4444', // red
      };
    }

    // Check full body visibility
    const isFullBodyVisible = this.checkFullBodyVisible(landmarks);
    if (!isFullBodyVisible) {
      return {
        isFullBodyVisible: false,
        isStanding: false,
        status: 'FULL_BODY_NOT_VISIBLE',
        message: 'Please step back - Full body must be visible',
        color: '#F59E0B', // orange
      };
    }

    // Check standing posture (knee angles)
    const leftHip = landmarks[POSE_LANDMARKS.LEFT_HIP];
    const leftKnee = landmarks[POSE_LANDMARKS.LEFT_KNEE];
    const leftAnkle = landmarks[POSE_LANDMARKS.LEFT_ANKLE];
    
    const rightHip = landmarks[POSE_LANDMARKS.RIGHT_HIP];
    const rightKnee = landmarks[POSE_LANDMARKS.RIGHT_KNEE];
    const rightAnkle = landmarks[POSE_LANDMARKS.RIGHT_ANKLE];

    const leftKneeAngle = this.calculateAngle(leftHip, leftKnee, leftAnkle);
    const rightKneeAngle = this.calculateAngle(rightHip, rightKnee, rightAnkle);

    const isStanding = leftKneeAngle > this.standingAngleThreshold && 
                       rightKneeAngle > this.standingAngleThreshold;

    if (isStanding) {
      return {
        isFullBodyVisible: true,
        isStanding: true,
        status: 'STANDING',
        message: 'Perfect! Ready to start',
        color: '#10B981', // green
        leftKneeAngle,
        rightKneeAngle,
      };
    } else {
      return {
        isFullBodyVisible: true,
        isStanding: false,
        status: 'NOT_STANDING',
        message: 'Please stand straight with legs extended',
        color: '#EF4444', // red
        leftKneeAngle,
        rightKneeAngle,
      };
    }
  }
}

export const postureChecker = new PostureChecker();

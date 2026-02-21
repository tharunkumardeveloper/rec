// Ghost Mode Keyframe Data
// Defines ideal pose sequences for each exercise type

export interface Landmark3D {
  x: number;  // Normalized 0-1
  y: number;  // Normalized 0-1
  z: number;  // Depth (relative)
  visibility: number;  // 0-1
}

export interface KeyframeData {
  landmarks: Landmark3D[];  // 33 MediaPipe pose landmarks
  duration: number;         // Milliseconds to hold this pose
  repPhase: 'start' | 'down' | 'up' | 'peak';  // Rep tracking
}

export interface ExerciseKeyframes {
  exerciseType: string;
  keyframes: KeyframeData[];
  targetReps: number;
  targetTime: number;  // seconds
  targetFormScore: number;  // percentage
}

export interface GhostTarget {
  targetReps: number;
  targetTime: number;  // seconds
  targetFormScore: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

// MediaPipe Pose landmark indices
const POSE_LANDMARKS = {
  NOSE: 0,
  LEFT_EYE_INNER: 1,
  LEFT_EYE: 2,
  LEFT_EYE_OUTER: 3,
  RIGHT_EYE_INNER: 4,
  RIGHT_EYE: 5,
  RIGHT_EYE_OUTER: 6,
  LEFT_EAR: 7,
  RIGHT_EAR: 8,
  MOUTH_LEFT: 9,
  MOUTH_RIGHT: 10,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_PINKY: 17,
  RIGHT_PINKY: 18,
  LEFT_INDEX: 19,
  RIGHT_INDEX: 20,
  LEFT_THUMB: 21,
  RIGHT_THUMB: 22,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
  LEFT_HEEL: 29,
  RIGHT_HEEL: 30,
  LEFT_FOOT_INDEX: 31,
  RIGHT_FOOT_INDEX: 32
};

// Helper function to create a landmark
export const createLandmark = (x: number, y: number, z: number = 0, visibility: number = 1): Landmark3D => ({
  x, y, z, visibility
});

// Push-ups keyframes (4 keyframes: plank → down → up → plank)
const PUSHUP_KEYFRAMES: KeyframeData[] = [
  {
    // Start position - High plank
    landmarks: [
      createLandmark(0.5, 0.3),   // 0: NOSE
      createLandmark(0.48, 0.28), // 1: LEFT_EYE_INNER
      createLandmark(0.47, 0.28), // 2: LEFT_EYE
      createLandmark(0.46, 0.28), // 3: LEFT_EYE_OUTER
      createLandmark(0.52, 0.28), // 4: RIGHT_EYE_INNER
      createLandmark(0.53, 0.28), // 5: RIGHT_EYE
      createLandmark(0.54, 0.28), // 6: RIGHT_EYE_OUTER
      createLandmark(0.44, 0.3),  // 7: LEFT_EAR
      createLandmark(0.56, 0.3),  // 8: RIGHT_EAR
      createLandmark(0.48, 0.32), // 9: MOUTH_LEFT
      createLandmark(0.52, 0.32), // 10: MOUTH_RIGHT
      createLandmark(0.35, 0.4),  // 11: LEFT_SHOULDER
      createLandmark(0.65, 0.4),  // 12: RIGHT_SHOULDER
      createLandmark(0.3, 0.5),   // 13: LEFT_ELBOW
      createLandmark(0.7, 0.5),   // 14: RIGHT_ELBOW
      createLandmark(0.25, 0.6),  // 15: LEFT_WRIST
      createLandmark(0.75, 0.6),  // 16: RIGHT_WRIST
      createLandmark(0.23, 0.62), // 17: LEFT_PINKY
      createLandmark(0.77, 0.62), // 18: RIGHT_PINKY
      createLandmark(0.24, 0.61), // 19: LEFT_INDEX
      createLandmark(0.76, 0.61), // 20: RIGHT_INDEX
      createLandmark(0.26, 0.6),  // 21: LEFT_THUMB
      createLandmark(0.74, 0.6),  // 22: RIGHT_THUMB
      createLandmark(0.4, 0.5),   // 23: LEFT_HIP
      createLandmark(0.6, 0.5),   // 24: RIGHT_HIP
      createLandmark(0.4, 0.65),  // 25: LEFT_KNEE
      createLandmark(0.6, 0.65),  // 26: RIGHT_KNEE
      createLandmark(0.4, 0.8),   // 27: LEFT_ANKLE
      createLandmark(0.6, 0.8),   // 28: RIGHT_ANKLE
      createLandmark(0.39, 0.82), // 29: LEFT_HEEL
      createLandmark(0.61, 0.82), // 30: RIGHT_HEEL
      createLandmark(0.41, 0.81), // 31: LEFT_FOOT_INDEX
      createLandmark(0.59, 0.81), // 32: RIGHT_FOOT_INDEX
    ],
    duration: 500,
    repPhase: 'start'
  },
  {
    // Down position - Lowered
    landmarks: [
      createLandmark(0.5, 0.45),  // 0: NOSE (lower)
      createLandmark(0.48, 0.43), // 1: LEFT_EYE_INNER
      createLandmark(0.47, 0.43), // 2: LEFT_EYE
      createLandmark(0.46, 0.43), // 3: LEFT_EYE_OUTER
      createLandmark(0.52, 0.43), // 4: RIGHT_EYE_INNER
      createLandmark(0.53, 0.43), // 5: RIGHT_EYE
      createLandmark(0.54, 0.43), // 6: RIGHT_EYE_OUTER
      createLandmark(0.44, 0.45), // 7: LEFT_EAR
      createLandmark(0.56, 0.45), // 8: RIGHT_EAR
      createLandmark(0.48, 0.47), // 9: MOUTH_LEFT
      createLandmark(0.52, 0.47), // 10: MOUTH_RIGHT
      createLandmark(0.35, 0.5),  // 11: LEFT_SHOULDER
      createLandmark(0.65, 0.5),  // 12: RIGHT_SHOULDER
      createLandmark(0.3, 0.55),  // 13: LEFT_ELBOW (bent more)
      createLandmark(0.7, 0.55),  // 14: RIGHT_ELBOW
      createLandmark(0.25, 0.6),  // 15: LEFT_WRIST
      createLandmark(0.75, 0.6),  // 16: RIGHT_WRIST
      createLandmark(0.23, 0.62), // 17: LEFT_PINKY
      createLandmark(0.77, 0.62), // 18: RIGHT_PINKY
      createLandmark(0.24, 0.61), // 19: LEFT_INDEX
      createLandmark(0.76, 0.61), // 20: RIGHT_INDEX
      createLandmark(0.26, 0.6),  // 21: LEFT_THUMB
      createLandmark(0.74, 0.6),  // 22: RIGHT_THUMB
      createLandmark(0.4, 0.55),  // 23: LEFT_HIP
      createLandmark(0.6, 0.55),  // 24: RIGHT_HIP
      createLandmark(0.4, 0.68),  // 25: LEFT_KNEE
      createLandmark(0.6, 0.68),  // 26: RIGHT_KNEE
      createLandmark(0.4, 0.8),   // 27: LEFT_ANKLE
      createLandmark(0.6, 0.8),   // 28: RIGHT_ANKLE
      createLandmark(0.39, 0.82), // 29: LEFT_HEEL
      createLandmark(0.61, 0.82), // 30: RIGHT_HEEL
      createLandmark(0.41, 0.81), // 31: LEFT_FOOT_INDEX
      createLandmark(0.59, 0.81), // 32: RIGHT_FOOT_INDEX
    ],
    duration: 800,
    repPhase: 'down'
  },
  {
    // Up position - Pushing up
    landmarks: [
      createLandmark(0.5, 0.35),  // 0: NOSE (rising)
      createLandmark(0.48, 0.33), // 1: LEFT_EYE_INNER
      createLandmark(0.47, 0.33), // 2: LEFT_EYE
      createLandmark(0.46, 0.33), // 3: LEFT_EYE_OUTER
      createLandmark(0.52, 0.33), // 4: RIGHT_EYE_INNER
      createLandmark(0.53, 0.33), // 5: RIGHT_EYE
      createLandmark(0.54, 0.33), // 6: RIGHT_EYE_OUTER
      createLandmark(0.44, 0.35), // 7: LEFT_EAR
      createLandmark(0.56, 0.35), // 8: RIGHT_EAR
      createLandmark(0.48, 0.37), // 9: MOUTH_LEFT
      createLandmark(0.52, 0.37), // 10: MOUTH_RIGHT
      createLandmark(0.35, 0.42),  // 11: LEFT_SHOULDER
      createLandmark(0.65, 0.42),  // 12: RIGHT_SHOULDER
      createLandmark(0.3, 0.52),   // 13: LEFT_ELBOW
      createLandmark(0.7, 0.52),   // 14: RIGHT_ELBOW
      createLandmark(0.25, 0.6),  // 15: LEFT_WRIST
      createLandmark(0.75, 0.6),  // 16: RIGHT_WRIST
      createLandmark(0.23, 0.62), // 17: LEFT_PINKY
      createLandmark(0.77, 0.62), // 18: RIGHT_PINKY
      createLandmark(0.24, 0.61), // 19: LEFT_INDEX
      createLandmark(0.76, 0.61), // 20: RIGHT_INDEX
      createLandmark(0.26, 0.6),  // 21: LEFT_THUMB
      createLandmark(0.74, 0.6),  // 22: RIGHT_THUMB
      createLandmark(0.4, 0.52),  // 23: LEFT_HIP
      createLandmark(0.6, 0.52),  // 24: RIGHT_HIP
      createLandmark(0.4, 0.66),  // 25: LEFT_KNEE
      createLandmark(0.6, 0.66),  // 26: RIGHT_KNEE
      createLandmark(0.4, 0.8),   // 27: LEFT_ANKLE
      createLandmark(0.6, 0.8),   // 28: RIGHT_ANKLE
      createLandmark(0.39, 0.82), // 29: LEFT_HEEL
      createLandmark(0.61, 0.82), // 30: RIGHT_HEEL
      createLandmark(0.41, 0.81), // 31: LEFT_FOOT_INDEX
      createLandmark(0.59, 0.81), // 32: RIGHT_FOOT_INDEX
    ],
    duration: 600,
    repPhase: 'up'
  },
  {
    // Return to start - High plank
    landmarks: [
      createLandmark(0.5, 0.3),   // 0: NOSE
      createLandmark(0.48, 0.28), // 1: LEFT_EYE_INNER
      createLandmark(0.47, 0.28), // 2: LEFT_EYE
      createLandmark(0.46, 0.28), // 3: LEFT_EYE_OUTER
      createLandmark(0.52, 0.28), // 4: RIGHT_EYE_INNER
      createLandmark(0.53, 0.28), // 5: RIGHT_EYE
      createLandmark(0.54, 0.28), // 6: RIGHT_EYE_OUTER
      createLandmark(0.44, 0.3),  // 7: LEFT_EAR
      createLandmark(0.56, 0.3),  // 8: RIGHT_EAR
      createLandmark(0.48, 0.32), // 9: MOUTH_LEFT
      createLandmark(0.52, 0.32), // 10: MOUTH_RIGHT
      createLandmark(0.35, 0.4),  // 11: LEFT_SHOULDER
      createLandmark(0.65, 0.4),  // 12: RIGHT_SHOULDER
      createLandmark(0.3, 0.5),   // 13: LEFT_ELBOW
      createLandmark(0.7, 0.5),   // 14: RIGHT_ELBOW
      createLandmark(0.25, 0.6),  // 15: LEFT_WRIST
      createLandmark(0.75, 0.6),  // 16: RIGHT_WRIST
      createLandmark(0.23, 0.62), // 17: LEFT_PINKY
      createLandmark(0.77, 0.62), // 18: RIGHT_PINKY
      createLandmark(0.24, 0.61), // 19: LEFT_INDEX
      createLandmark(0.76, 0.61), // 20: RIGHT_INDEX
      createLandmark(0.26, 0.6),  // 21: LEFT_THUMB
      createLandmark(0.74, 0.6),  // 22: RIGHT_THUMB
      createLandmark(0.4, 0.5),   // 23: LEFT_HIP
      createLandmark(0.6, 0.5),   // 24: RIGHT_HIP
      createLandmark(0.4, 0.65),  // 25: LEFT_KNEE
      createLandmark(0.6, 0.65),  // 26: RIGHT_KNEE
      createLandmark(0.4, 0.8),   // 27: LEFT_ANKLE
      createLandmark(0.6, 0.8),   // 28: RIGHT_ANKLE
      createLandmark(0.39, 0.82), // 29: LEFT_HEEL
      createLandmark(0.61, 0.82), // 30: RIGHT_HEEL
      createLandmark(0.41, 0.81), // 31: LEFT_FOOT_INDEX
      createLandmark(0.59, 0.81), // 32: RIGHT_FOOT_INDEX
    ],
    duration: 400,
    repPhase: 'start'
  }
];

// Pull-ups keyframes (3 keyframes: hang → pull → hang)
const PULLUP_KEYFRAMES: KeyframeData[] = [
  {
    // Dead hang position
    landmarks: [
      createLandmark(0.5, 0.25),  // 0: NOSE
      createLandmark(0.48, 0.23), // 1: LEFT_EYE_INNER
      createLandmark(0.47, 0.23), // 2: LEFT_EYE
      createLandmark(0.46, 0.23), // 3: LEFT_EYE_OUTER
      createLandmark(0.52, 0.23), // 4: RIGHT_EYE_INNER
      createLandmark(0.53, 0.23), // 5: RIGHT_EYE
      createLandmark(0.54, 0.23), // 6: RIGHT_EYE_OUTER
      createLandmark(0.44, 0.25), // 7: LEFT_EAR
      createLandmark(0.56, 0.25), // 8: RIGHT_EAR
      createLandmark(0.48, 0.27), // 9: MOUTH_LEFT
      createLandmark(0.52, 0.27), // 10: MOUTH_RIGHT
      createLandmark(0.35, 0.3),  // 11: LEFT_SHOULDER
      createLandmark(0.65, 0.3),  // 12: RIGHT_SHOULDER
      createLandmark(0.32, 0.22), // 13: LEFT_ELBOW (arms up)
      createLandmark(0.68, 0.22), // 14: RIGHT_ELBOW
      createLandmark(0.3, 0.15),  // 15: LEFT_WRIST (gripping bar)
      createLandmark(0.7, 0.15),  // 16: RIGHT_WRIST
      createLandmark(0.29, 0.14), // 17: LEFT_PINKY
      createLandmark(0.71, 0.14), // 18: RIGHT_PINKY
      createLandmark(0.3, 0.145), // 19: LEFT_INDEX
      createLandmark(0.7, 0.145), // 20: RIGHT_INDEX
      createLandmark(0.31, 0.15), // 21: LEFT_THUMB
      createLandmark(0.69, 0.15), // 22: RIGHT_THUMB
      createLandmark(0.42, 0.45), // 23: LEFT_HIP
      createLandmark(0.58, 0.45), // 24: RIGHT_HIP
      createLandmark(0.42, 0.6),  // 25: LEFT_KNEE
      createLandmark(0.58, 0.6),  // 26: RIGHT_KNEE
      createLandmark(0.42, 0.75), // 27: LEFT_ANKLE
      createLandmark(0.58, 0.75), // 28: RIGHT_ANKLE
      createLandmark(0.41, 0.77), // 29: LEFT_HEEL
      createLandmark(0.59, 0.77), // 30: RIGHT_HEEL
      createLandmark(0.43, 0.76), // 31: LEFT_FOOT_INDEX
      createLandmark(0.57, 0.76), // 32: RIGHT_FOOT_INDEX
    ],
    duration: 600,
    repPhase: 'start'
  },
  {
    // Pull up - chin above bar
    landmarks: [
      createLandmark(0.5, 0.12),  // 0: NOSE (at bar level)
      createLandmark(0.48, 0.1),  // 1: LEFT_EYE_INNER
      createLandmark(0.47, 0.1),  // 2: LEFT_EYE
      createLandmark(0.46, 0.1),  // 3: LEFT_EYE_OUTER
      createLandmark(0.52, 0.1),  // 4: RIGHT_EYE_INNER
      createLandmark(0.53, 0.1),  // 5: RIGHT_EYE
      createLandmark(0.54, 0.1),  // 6: RIGHT_EYE_OUTER
      createLandmark(0.44, 0.12), // 7: LEFT_EAR
      createLandmark(0.56, 0.12), // 8: RIGHT_EAR
      createLandmark(0.48, 0.14), // 9: MOUTH_LEFT
      createLandmark(0.52, 0.14), // 10: MOUTH_RIGHT
      createLandmark(0.35, 0.18), // 11: LEFT_SHOULDER (pulled up)
      createLandmark(0.65, 0.18), // 12: RIGHT_SHOULDER
      createLandmark(0.32, 0.15), // 13: LEFT_ELBOW (bent)
      createLandmark(0.68, 0.15), // 14: RIGHT_ELBOW
      createLandmark(0.3, 0.15),  // 15: LEFT_WRIST
      createLandmark(0.7, 0.15),  // 16: RIGHT_WRIST
      createLandmark(0.29, 0.14), // 17: LEFT_PINKY
      createLandmark(0.71, 0.14), // 18: RIGHT_PINKY
      createLandmark(0.3, 0.145), // 19: LEFT_INDEX
      createLandmark(0.7, 0.145), // 20: RIGHT_INDEX
      createLandmark(0.31, 0.15), // 21: LEFT_THUMB
      createLandmark(0.69, 0.15), // 22: RIGHT_THUMB
      createLandmark(0.42, 0.35), // 23: LEFT_HIP (pulled up)
      createLandmark(0.58, 0.35), // 24: RIGHT_HIP
      createLandmark(0.42, 0.5),  // 25: LEFT_KNEE
      createLandmark(0.58, 0.5),  // 26: RIGHT_KNEE
      createLandmark(0.42, 0.65), // 27: LEFT_ANKLE
      createLandmark(0.58, 0.65), // 28: RIGHT_ANKLE
      createLandmark(0.41, 0.67), // 29: LEFT_HEEL
      createLandmark(0.59, 0.67), // 30: RIGHT_HEEL
      createLandmark(0.43, 0.66), // 31: LEFT_FOOT_INDEX
      createLandmark(0.57, 0.66), // 32: RIGHT_FOOT_INDEX
    ],
    duration: 1000,
    repPhase: 'up'
  },
  {
    // Return to hang
    landmarks: [
      createLandmark(0.5, 0.25),  // 0: NOSE
      createLandmark(0.48, 0.23), // 1: LEFT_EYE_INNER
      createLandmark(0.47, 0.23), // 2: LEFT_EYE
      createLandmark(0.46, 0.23), // 3: LEFT_EYE_OUTER
      createLandmark(0.52, 0.23), // 4: RIGHT_EYE_INNER
      createLandmark(0.53, 0.23), // 5: RIGHT_EYE
      createLandmark(0.54, 0.23), // 6: RIGHT_EYE_OUTER
      createLandmark(0.44, 0.25), // 7: LEFT_EAR
      createLandmark(0.56, 0.25), // 8: RIGHT_EAR
      createLandmark(0.48, 0.27), // 9: MOUTH_LEFT
      createLandmark(0.52, 0.27), // 10: MOUTH_RIGHT
      createLandmark(0.35, 0.3),  // 11: LEFT_SHOULDER
      createLandmark(0.65, 0.3),  // 12: RIGHT_SHOULDER
      createLandmark(0.32, 0.22), // 13: LEFT_ELBOW
      createLandmark(0.68, 0.22), // 14: RIGHT_ELBOW
      createLandmark(0.3, 0.15),  // 15: LEFT_WRIST
      createLandmark(0.7, 0.15),  // 16: RIGHT_WRIST
      createLandmark(0.29, 0.14), // 17: LEFT_PINKY
      createLandmark(0.71, 0.14), // 18: RIGHT_PINKY
      createLandmark(0.3, 0.145), // 19: LEFT_INDEX
      createLandmark(0.7, 0.145), // 20: RIGHT_INDEX
      createLandmark(0.31, 0.15), // 21: LEFT_THUMB
      createLandmark(0.69, 0.15), // 22: RIGHT_THUMB
      createLandmark(0.42, 0.45), // 23: LEFT_HIP
      createLandmark(0.58, 0.45), // 24: RIGHT_HIP
      createLandmark(0.42, 0.6),  // 25: LEFT_KNEE
      createLandmark(0.58, 0.6),  // 26: RIGHT_KNEE
      createLandmark(0.42, 0.75), // 27: LEFT_ANKLE
      createLandmark(0.58, 0.75), // 28: RIGHT_ANKLE
      createLandmark(0.41, 0.77), // 29: LEFT_HEEL
      createLandmark(0.59, 0.77), // 30: RIGHT_HEEL
      createLandmark(0.43, 0.76), // 31: LEFT_FOOT_INDEX
      createLandmark(0.57, 0.76), // 32: RIGHT_FOOT_INDEX
    ],
    duration: 700,
    repPhase: 'down'
  }
];

// Sit-ups keyframes (3 keyframes: lying → crunch → lying)
const SITUP_KEYFRAMES: KeyframeData[] = [
  {
    // Lying position
    landmarks: [
      createLandmark(0.5, 0.6),   // 0: NOSE
      createLandmark(0.48, 0.58), // 1: LEFT_EYE_INNER
      createLandmark(0.47, 0.58), // 2: LEFT_EYE
      createLandmark(0.46, 0.58), // 3: LEFT_EYE_OUTER
      createLandmark(0.52, 0.58), // 4: RIGHT_EYE_INNER
      createLandmark(0.53, 0.58), // 5: RIGHT_EYE
      createLandmark(0.54, 0.58), // 6: RIGHT_EYE_OUTER
      createLandmark(0.44, 0.6),  // 7: LEFT_EAR
      createLandmark(0.56, 0.6),  // 8: RIGHT_EAR
      createLandmark(0.48, 0.62), // 9: MOUTH_LEFT
      createLandmark(0.52, 0.62), // 10: MOUTH_RIGHT
      createLandmark(0.35, 0.65), // 11: LEFT_SHOULDER
      createLandmark(0.65, 0.65), // 12: RIGHT_SHOULDER
      createLandmark(0.3, 0.62),  // 13: LEFT_ELBOW
      createLandmark(0.7, 0.62),  // 14: RIGHT_ELBOW
      createLandmark(0.28, 0.58), // 15: LEFT_WRIST
      createLandmark(0.72, 0.58), // 16: RIGHT_WRIST
      createLandmark(0.27, 0.57), // 17: LEFT_PINKY
      createLandmark(0.73, 0.57), // 18: RIGHT_PINKY
      createLandmark(0.28, 0.575),// 19: LEFT_INDEX
      createLandmark(0.72, 0.575),// 20: RIGHT_INDEX
      createLandmark(0.29, 0.58), // 21: LEFT_THUMB
      createLandmark(0.71, 0.58), // 22: RIGHT_THUMB
      createLandmark(0.42, 0.7),  // 23: LEFT_HIP
      createLandmark(0.58, 0.7),  // 24: RIGHT_HIP
      createLandmark(0.4, 0.55),  // 25: LEFT_KNEE (bent)
      createLandmark(0.6, 0.55),  // 26: RIGHT_KNEE
      createLandmark(0.38, 0.75), // 27: LEFT_ANKLE
      createLandmark(0.62, 0.75), // 28: RIGHT_ANKLE
      createLandmark(0.37, 0.76), // 29: LEFT_HEEL
      createLandmark(0.63, 0.76), // 30: RIGHT_HEEL
      createLandmark(0.39, 0.75), // 31: LEFT_FOOT_INDEX
      createLandmark(0.61, 0.75), // 32: RIGHT_FOOT_INDEX
    ],
    duration: 500,
    repPhase: 'start'
  },
  {
    // Crunch position - torso up
    landmarks: [
      createLandmark(0.5, 0.35),  // 0: NOSE (up)
      createLandmark(0.48, 0.33), // 1: LEFT_EYE_INNER
      createLandmark(0.47, 0.33), // 2: LEFT_EYE
      createLandmark(0.46, 0.33), // 3: LEFT_EYE_OUTER
      createLandmark(0.52, 0.33), // 4: RIGHT_EYE_INNER
      createLandmark(0.53, 0.33), // 5: RIGHT_EYE
      createLandmark(0.54, 0.33), // 6: RIGHT_EYE_OUTER
      createLandmark(0.44, 0.35), // 7: LEFT_EAR
      createLandmark(0.56, 0.35), // 8: RIGHT_EAR
      createLandmark(0.48, 0.37), // 9: MOUTH_LEFT
      createLandmark(0.52, 0.37), // 10: MOUTH_RIGHT
      createLandmark(0.35, 0.42), // 11: LEFT_SHOULDER (up)
      createLandmark(0.65, 0.42), // 12: RIGHT_SHOULDER
      createLandmark(0.3, 0.4),   // 13: LEFT_ELBOW
      createLandmark(0.7, 0.4),   // 14: RIGHT_ELBOW
      createLandmark(0.28, 0.36), // 15: LEFT_WRIST
      createLandmark(0.72, 0.36), // 16: RIGHT_WRIST
      createLandmark(0.27, 0.35), // 17: LEFT_PINKY
      createLandmark(0.73, 0.35), // 18: RIGHT_PINKY
      createLandmark(0.28, 0.355),// 19: LEFT_INDEX
      createLandmark(0.72, 0.355),// 20: RIGHT_INDEX
      createLandmark(0.29, 0.36), // 21: LEFT_THUMB
      createLandmark(0.71, 0.36), // 22: RIGHT_THUMB
      createLandmark(0.42, 0.52), // 23: LEFT_HIP (bent)
      createLandmark(0.58, 0.52), // 24: RIGHT_HIP
      createLandmark(0.4, 0.48),  // 25: LEFT_KNEE
      createLandmark(0.6, 0.48),  // 26: RIGHT_KNEE
      createLandmark(0.38, 0.7),  // 27: LEFT_ANKLE
      createLandmark(0.62, 0.7),  // 28: RIGHT_ANKLE
      createLandmark(0.37, 0.71), // 29: LEFT_HEEL
      createLandmark(0.63, 0.71), // 30: RIGHT_HEEL
      createLandmark(0.39, 0.7),  // 31: LEFT_FOOT_INDEX
      createLandmark(0.61, 0.7),  // 32: RIGHT_FOOT_INDEX
    ],
    duration: 900,
    repPhase: 'up'
  },
  {
    // Return to lying
    landmarks: [
      createLandmark(0.5, 0.6),   // 0: NOSE
      createLandmark(0.48, 0.58), // 1: LEFT_EYE_INNER
      createLandmark(0.47, 0.58), // 2: LEFT_EYE
      createLandmark(0.46, 0.58), // 3: LEFT_EYE_OUTER
      createLandmark(0.52, 0.58), // 4: RIGHT_EYE_INNER
      createLandmark(0.53, 0.58), // 5: RIGHT_EYE
      createLandmark(0.54, 0.58), // 6: RIGHT_EYE_OUTER
      createLandmark(0.44, 0.6),  // 7: LEFT_EAR
      createLandmark(0.56, 0.6),  // 8: RIGHT_EAR
      createLandmark(0.48, 0.62), // 9: MOUTH_LEFT
      createLandmark(0.52, 0.62), // 10: MOUTH_RIGHT
      createLandmark(0.35, 0.65), // 11: LEFT_SHOULDER
      createLandmark(0.65, 0.65), // 12: RIGHT_SHOULDER
      createLandmark(0.3, 0.62),  // 13: LEFT_ELBOW
      createLandmark(0.7, 0.62),  // 14: RIGHT_ELBOW
      createLandmark(0.28, 0.58), // 15: LEFT_WRIST
      createLandmark(0.72, 0.58), // 16: RIGHT_WRIST
      createLandmark(0.27, 0.57), // 17: LEFT_PINKY
      createLandmark(0.73, 0.57), // 18: RIGHT_PINKY
      createLandmark(0.28, 0.575),// 19: LEFT_INDEX
      createLandmark(0.72, 0.575),// 20: RIGHT_INDEX
      createLandmark(0.29, 0.58), // 21: LEFT_THUMB
      createLandmark(0.71, 0.58), // 22: RIGHT_THUMB
      createLandmark(0.42, 0.7),  // 23: LEFT_HIP
      createLandmark(0.58, 0.7),  // 24: RIGHT_HIP
      createLandmark(0.4, 0.55),  // 25: LEFT_KNEE
      createLandmark(0.6, 0.55),  // 26: RIGHT_KNEE
      createLandmark(0.38, 0.75), // 27: LEFT_ANKLE
      createLandmark(0.62, 0.75), // 28: RIGHT_ANKLE
      createLandmark(0.37, 0.76), // 29: LEFT_HEEL
      createLandmark(0.63, 0.76), // 30: RIGHT_HEEL
      createLandmark(0.39, 0.75), // 31: LEFT_FOOT_INDEX
      createLandmark(0.61, 0.75), // 32: RIGHT_FOOT_INDEX
    ],
    duration: 600,
    repPhase: 'down'
  }
];

// Export all keyframe arrays
export { PUSHUP_KEYFRAMES, PULLUP_KEYFRAMES, SITUP_KEYFRAMES };

// Export combined keyframes with targets
export const ALL_EXERCISE_KEYFRAMES = {
  'Push-ups': PUSHUP_KEYFRAMES,
  'Pull-ups': PULLUP_KEYFRAMES,
  'Sit-ups': SITUP_KEYFRAMES
};

// Extended keyframes for remaining exercises
import { KeyframeData, createLandmark } from './ghostKeyframes';

// Vertical Jump keyframes (4 keyframes: stand → crouch → jump → land)
export const VERTICAL_JUMP_KEYFRAMES: KeyframeData[] = [
  {
    // Standing position
    landmarks: Array(33).fill(null).map((_, i) => {
      if (i === 0) return createLandmark(0.5, 0.2);  // NOSE
      if (i >= 11 && i <= 12) return createLandmark(i === 11 ? 0.4 : 0.6, 0.35);  // SHOULDERS
      if (i >= 23 && i <= 24) return createLandmark(i === 23 ? 0.42 : 0.58, 0.5);  // HIPS
      if (i >= 25 && i <= 26) return createLandmark(i === 25 ? 0.42 : 0.58, 0.65);  // KNEES
      if (i >= 27 && i <= 28) return createLandmark(i === 27 ? 0.42 : 0.58, 0.8);  // ANKLES
      return createLandmark(0.5, 0.5);
    }),
    duration: 400,
    repPhase: 'start'
  },
  {
    // Crouch position
    landmarks: Array(33).fill(null).map((_, i) => {
      if (i === 0) return createLandmark(0.5, 0.4);  // NOSE (lower)
      if (i >= 11 && i <= 12) return createLandmark(i === 11 ? 0.4 : 0.6, 0.5);  // SHOULDERS
      if (i >= 23 && i <= 24) return createLandmark(i === 23 ? 0.42 : 0.58, 0.6);  // HIPS
      if (i >= 25 && i <= 26) return createLandmark(i === 25 ? 0.42 : 0.58, 0.65);  // KNEES (bent)
      if (i >= 27 && i <= 28) return createLandmark(i === 27 ? 0.42 : 0.58, 0.75);  // ANKLES
      return createLandmark(0.5, 0.5);
    }),
    duration: 500,
    repPhase: 'down'
  },
  {
    // Jump peak
    landmarks: Array(33).fill(null).map((_, i) => {
      if (i === 0) return createLandmark(0.5, 0.15);  // NOSE (high)
      if (i >= 11 && i <= 12) return createLandmark(i === 11 ? 0.4 : 0.6, 0.25);  // SHOULDERS
      if (i >= 23 && i <= 24) return createLandmark(i === 23 ? 0.42 : 0.58, 0.4);  // HIPS
      if (i >= 25 && i <= 26) return createLandmark(i === 25 ? 0.42 : 0.58, 0.55);  // KNEES
      if (i >= 27 && i <= 28) return createLandmark(i === 27 ? 0.42 : 0.58, 0.7);  // ANKLES
      return createLandmark(0.5, 0.4);
    }),
    duration: 600,
    repPhase: 'peak'
  },
  {
    // Landing
    landmarks: Array(33).fill(null).map((_, i) => {
      if (i === 0) return createLandmark(0.5, 0.2);  // NOSE
      if (i >= 11 && i <= 12) return createLandmark(i === 11 ? 0.4 : 0.6, 0.35);  // SHOULDERS
      if (i >= 23 && i <= 24) return createLandmark(i === 23 ? 0.42 : 0.58, 0.5);  // HIPS
      if (i >= 25 && i <= 26) return createLandmark(i === 25 ? 0.42 : 0.58, 0.65);  // KNEES
      if (i >= 27 && i <= 28) return createLandmark(i === 27 ? 0.42 : 0.58, 0.8);  // ANKLES
      return createLandmark(0.5, 0.5);
    }),
    duration: 400,
    repPhase: 'start'
  }
];

// Shuttle Run keyframes (6 keyframes: start → sprint → turn → sprint → turn → finish)
export const SHUTTLE_RUN_KEYFRAMES: KeyframeData[] = [
  {
    // Start position
    landmarks: Array(33).fill(null).map((_, i) => {
      if (i === 0) return createLandmark(0.3, 0.25);  // NOSE (left side)
      if (i >= 11 && i <= 12) return createLandmark(i === 11 ? 0.25 : 0.35, 0.4);  // SHOULDERS
      if (i >= 23 && i <= 24) return createLandmark(i === 23 ? 0.27 : 0.33, 0.55);  // HIPS
      if (i >= 25 && i <= 26) return createLandmark(i === 25 ? 0.25 : 0.35, 0.7);  // KNEES
      if (i >= 27 && i <= 28) return createLandmark(i === 27 ? 0.25 : 0.35, 0.8);  // ANKLES
      return createLandmark(0.3, 0.5);
    }),
    duration: 300,
    repPhase: 'start'
  },
  {
    // Sprint right
    landmarks: Array(33).fill(null).map((_, i) => {
      if (i === 0) return createLandmark(0.5, 0.3);  // NOSE (center, leaning)
      if (i >= 11 && i <= 12) return createLandmark(i === 11 ? 0.45 : 0.55, 0.42);  // SHOULDERS
      if (i >= 23 && i <= 24) return createLandmark(i === 23 ? 0.47 : 0.53, 0.55);  // HIPS
      if (i >= 25 && i <= 26) return createLandmark(i === 25 ? 0.45 : 0.55, 0.7);  // KNEES
      if (i >= 27 && i <= 28) return createLandmark(i === 27 ? 0.45 : 0.55, 0.8);  // ANKLES
      return createLandmark(0.5, 0.5);
    }),
    duration: 800,
    repPhase: 'up'
  },
  {
    // Turn at right cone
    landmarks: Array(33).fill(null).map((_, i) => {
      if (i === 0) return createLandmark(0.7, 0.3);  // NOSE (right side)
      if (i >= 11 && i <= 12) return createLandmark(i === 11 ? 0.65 : 0.75, 0.45);  // SHOULDERS
      if (i >= 23 && i <= 24) return createLandmark(i === 23 ? 0.67 : 0.73, 0.58);  // HIPS
      if (i >= 25 && i <= 26) return createLandmark(i === 25 ? 0.65 : 0.75, 0.7);  // KNEES
      if (i >= 27 && i <= 28) return createLandmark(i === 27 ? 0.65 : 0.75, 0.8);  // ANKLES
      return createLandmark(0.7, 0.5);
    }),
    duration: 400,
    repPhase: 'peak'
  },
  {
    // Sprint left
    landmarks: Array(33).fill(null).map((_, i) => {
      if (i === 0) return createLandmark(0.5, 0.3);  // NOSE (center, leaning)
      if (i >= 11 && i <= 12) return createLandmark(i === 11 ? 0.45 : 0.55, 0.42);  // SHOULDERS
      if (i >= 23 && i <= 24) return createLandmark(i === 23 ? 0.47 : 0.53, 0.55);  // HIPS
      if (i >= 25 && i <= 26) return createLandmark(i === 25 ? 0.45 : 0.55, 0.7);  // KNEES
      if (i >= 27 && i <= 28) return createLandmark(i === 27 ? 0.45 : 0.55, 0.8);  // ANKLES
      return createLandmark(0.5, 0.5);
    }),
    duration: 800,
    repPhase: 'down'
  },
  {
    // Turn at left cone
    landmarks: Array(33).fill(null).map((_, i) => {
      if (i === 0) return createLandmark(0.3, 0.3);  // NOSE (left side)
      if (i >= 11 && i <= 12) return createLandmark(i === 11 ? 0.25 : 0.35, 0.45);  // SHOULDERS
      if (i >= 23 && i <= 24) return createLandmark(i === 23 ? 0.27 : 0.33, 0.58);  // HIPS
      if (i >= 25 && i <= 26) return createLandmark(i === 25 ? 0.25 : 0.35, 0.7);  // KNEES
      if (i >= 27 && i <= 28) return createLandmark(i === 27 ? 0.25 : 0.35, 0.8);  // ANKLES
      return createLandmark(0.3, 0.5);
    }),
    duration: 400,
    repPhase: 'peak'
  },
  {
    // Finish
    landmarks: Array(33).fill(null).map((_, i) => {
      if (i === 0) return createLandmark(0.5, 0.25);  // NOSE (center)
      if (i >= 11 && i <= 12) return createLandmark(i === 11 ? 0.4 : 0.6, 0.4);  // SHOULDERS
      if (i >= 23 && i <= 24) return createLandmark(i === 23 ? 0.42 : 0.58, 0.55);  // HIPS
      if (i >= 25 && i <= 26) return createLandmark(i === 25 ? 0.42 : 0.58, 0.7);  // KNEES
      if (i >= 27 && i <= 28) return createLandmark(i === 27 ? 0.42 : 0.58, 0.8);  // ANKLES
      return createLandmark(0.5, 0.5);
    }),
    duration: 300,
    repPhase: 'start'
  }
];

// Sit Reach keyframes (3 keyframes: sit → reach → hold)
export const SIT_REACH_KEYFRAMES: KeyframeData[] = [
  {
    // Sitting upright
    landmarks: Array(33).fill(null).map((_, i) => {
      if (i === 0) return createLandmark(0.5, 0.3);  // NOSE
      if (i >= 11 && i <= 12) return createLandmark(i === 11 ? 0.4 : 0.6, 0.4);  // SHOULDERS
      if (i >= 13 && i <= 14) return createLandmark(i === 13 ? 0.38 : 0.62, 0.5);  // ELBOWS
      if (i >= 15 && i <= 16) return createLandmark(i === 15 ? 0.36 : 0.64, 0.6);  // WRISTS
      if (i >= 23 && i <= 24) return createLandmark(i === 23 ? 0.42 : 0.58, 0.55);  // HIPS
      if (i >= 25 && i <= 26) return createLandmark(i === 25 ? 0.42 : 0.58, 0.7);  // KNEES (straight)
      if (i >= 27 && i <= 28) return createLandmark(i === 27 ? 0.42 : 0.58, 0.8);  // ANKLES
      return createLandmark(0.5, 0.5);
    }),
    duration: 500,
    repPhase: 'start'
  },
  {
    // Reaching forward
    landmarks: Array(33).fill(null).map((_, i) => {
      if (i === 0) return createLandmark(0.5, 0.45);  // NOSE (forward)
      if (i >= 11 && i <= 12) return createLandmark(i === 11 ? 0.4 : 0.6, 0.5);  // SHOULDERS
      if (i >= 13 && i <= 14) return createLandmark(i === 13 ? 0.42 : 0.58, 0.6);  // ELBOWS
      if (i >= 15 && i <= 16) return createLandmark(i === 15 ? 0.44 : 0.56, 0.75);  // WRISTS (reaching)
      if (i >= 23 && i <= 24) return createLandmark(i === 23 ? 0.42 : 0.58, 0.55);  // HIPS
      if (i >= 25 && i <= 26) return createLandmark(i === 25 ? 0.42 : 0.58, 0.7);  // KNEES
      if (i >= 27 && i <= 28) return createLandmark(i === 27 ? 0.42 : 0.58, 0.8);  // ANKLES
      return createLandmark(0.5, 0.6);
    }),
    duration: 1200,
    repPhase: 'up'
  },
  {
    // Hold position
    landmarks: Array(33).fill(null).map((_, i) => {
      if (i === 0) return createLandmark(0.5, 0.45);  // NOSE
      if (i >= 11 && i <= 12) return createLandmark(i === 11 ? 0.4 : 0.6, 0.5);  // SHOULDERS
      if (i >= 13 && i <= 14) return createLandmark(i === 13 ? 0.42 : 0.58, 0.6);  // ELBOWS
      if (i >= 15 && i <= 16) return createLandmark(i === 15 ? 0.44 : 0.56, 0.75);  // WRISTS
      if (i >= 23 && i <= 24) return createLandmark(i === 23 ? 0.42 : 0.58, 0.55);  // HIPS
      if (i >= 25 && i <= 26) return createLandmark(i === 25 ? 0.42 : 0.58, 0.7);  // KNEES
      if (i >= 27 && i <= 28) return createLandmark(i === 27 ? 0.42 : 0.58, 0.8);  // ANKLES
      return createLandmark(0.5, 0.6);
    }),
    duration: 2000,
    repPhase: 'peak'
  }
];

// Main export file for all ghost keyframes
import { ExerciseKeyframes, GhostTarget, PUSHUP_KEYFRAMES, PULLUP_KEYFRAMES, SITUP_KEYFRAMES } from './ghostKeyframes';
import { VERTICAL_JUMP_KEYFRAMES, SHUTTLE_RUN_KEYFRAMES, SIT_REACH_KEYFRAMES } from './ghostKeyframesExtended';

// Ghost performance targets for each exercise
export const GHOST_TARGETS: Record<string, GhostTarget> = {
  'Push-ups': {
    targetReps: 25,
    targetTime: 150,  // 2:30
    targetFormScore: 95,
    difficulty: 'medium'
  },
  'Pull-ups': {
    targetReps: 15,
    targetTime: 120,  // 2:00
    targetFormScore: 90,
    difficulty: 'hard'
  },
  'Sit-ups': {
    targetReps: 30,
    targetTime: 120,  // 2:00
    targetFormScore: 92,
    difficulty: 'medium'
  },
  'Vertical Jump': {
    targetReps: 10,
    targetTime: 60,  // 1:00
    targetFormScore: 88,
    difficulty: 'easy'
  },
  'Shuttle Run': {
    targetReps: 8,  // 8 complete shuttles
    targetTime: 180,  // 3:00
    targetFormScore: 90,
    difficulty: 'hard'
  },
  'Sit Reach': {
    targetReps: 3,  // 3 holds
    targetTime: 90,  // 1:30
    targetFormScore: 85,
    difficulty: 'easy'
  }
};

// Exercise keyframes mapping
export const EXERCISE_KEYFRAMES: Record<string, ExerciseKeyframes> = {
  'Push-ups': {
    exerciseType: 'Push-ups',
    keyframes: PUSHUP_KEYFRAMES,
    targetReps: GHOST_TARGETS['Push-ups'].targetReps,
    targetTime: GHOST_TARGETS['Push-ups'].targetTime,
    targetFormScore: GHOST_TARGETS['Push-ups'].targetFormScore
  },
  'Pull-ups': {
    exerciseType: 'Pull-ups',
    keyframes: PULLUP_KEYFRAMES,
    targetReps: GHOST_TARGETS['Pull-ups'].targetReps,
    targetTime: GHOST_TARGETS['Pull-ups'].targetTime,
    targetFormScore: GHOST_TARGETS['Pull-ups'].targetFormScore
  },
  'Sit-ups': {
    exerciseType: 'Sit-ups',
    keyframes: SITUP_KEYFRAMES,
    targetReps: GHOST_TARGETS['Sit-ups'].targetReps,
    targetTime: GHOST_TARGETS['Sit-ups'].targetTime,
    targetFormScore: GHOST_TARGETS['Sit-ups'].targetFormScore
  },
  'Vertical Jump': {
    exerciseType: 'Vertical Jump',
    keyframes: VERTICAL_JUMP_KEYFRAMES,
    targetReps: GHOST_TARGETS['Vertical Jump'].targetReps,
    targetTime: GHOST_TARGETS['Vertical Jump'].targetTime,
    targetFormScore: GHOST_TARGETS['Vertical Jump'].targetFormScore
  },
  'Shuttle Run': {
    exerciseType: 'Shuttle Run',
    keyframes: SHUTTLE_RUN_KEYFRAMES,
    targetReps: GHOST_TARGETS['Shuttle Run'].targetReps,
    targetTime: GHOST_TARGETS['Shuttle Run'].targetTime,
    targetFormScore: GHOST_TARGETS['Shuttle Run'].targetFormScore
  },
  'Sit Reach': {
    exerciseType: 'Sit Reach',
    keyframes: SIT_REACH_KEYFRAMES,
    targetReps: GHOST_TARGETS['Sit Reach'].targetReps,
    targetTime: GHOST_TARGETS['Sit Reach'].targetTime,
    targetFormScore: GHOST_TARGETS['Sit Reach'].targetFormScore
  }
};

// Helper function to load keyframes for a specific exercise
export const loadKeyframes = (exerciseType: string): ExerciseKeyframes => {
  const keyframeData = EXERCISE_KEYFRAMES[exerciseType];
  
  if (!keyframeData) {
    throw new Error(`No keyframes found for exercise: ${exerciseType}`);
  }
  
  return keyframeData;
};

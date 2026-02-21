// Ghost Beat Calculation Logic

import { GhostTarget } from '@/data/ghostKeyframes';

export interface BadgeData {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  color: string;
  glowColor: string;
}

export interface BeatGhostResult {
  didBeat: boolean;
  repsDiff: number;  // positive if user beat ghost
  timeDiff: number;  // negative if user was faster
  formDiff: number;  // positive if user had better form
  badge: BadgeData | null;
}

export interface WorkoutMetrics {
  reps: number;
  time: number;  // seconds
  formScore: number;  // percentage
}

// Ghost Slayer Badge
export const GHOST_SLAYER_BADGE: BadgeData = {
  id: 'ghost_slayer',
  name: 'Ghost Slayer',
  description: 'Beat the ghost in a workout challenge',
  icon: '👻💀',
  rarity: 'epic',
  color: '#A855F7',  // Purple
  glowColor: '#FFD700'  // Gold
};

// Calculate if user beat the ghost
export const calculateBeatGhost = (
  userMetrics: WorkoutMetrics,
  ghostTarget: GhostTarget
): BeatGhostResult => {
  // User beats ghost if:
  // 1. Reps >= target reps
  // 2. Form score >= 85% (minimum threshold)
  const didBeat = 
    userMetrics.reps >= ghostTarget.targetReps &&
    userMetrics.formScore >= 85;

  return {
    didBeat,
    repsDiff: userMetrics.reps - ghostTarget.targetReps,
    timeDiff: userMetrics.time - ghostTarget.targetTime,
    formDiff: userMetrics.formScore - ghostTarget.targetFormScore,
    badge: didBeat ? GHOST_SLAYER_BADGE : null
  };
};

// Get performance message based on results
export const getPerformanceMessage = (result: BeatGhostResult): string => {
  if (result.didBeat) {
    const messages = [
      '🎉 Amazing! Ghost Slayed!',
      '💪 Legendary Performance!',
      '🔥 You Crushed It!',
      '⚡ Unstoppable!',
      '👑 Champion Status!'
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  } else {
    return '💪 Great Effort! Keep Pushing!';
  }
};

// Get specific improvement suggestions
export const getImprovementSuggestions = (result: BeatGhostResult): string[] => {
  const suggestions: string[] = [];

  if (result.repsDiff < 0) {
    suggestions.push(`Complete ${Math.abs(result.repsDiff)} more reps to match the ghost`);
  }

  if (result.formDiff < 0) {
    suggestions.push(`Improve form by ${Math.abs(result.formDiff).toFixed(1)}% for better technique`);
  }

  if (result.timeDiff > 0) {
    const extraSeconds = Math.abs(result.timeDiff);
    suggestions.push(`Try to complete the workout ${extraSeconds}s faster`);
  }

  if (suggestions.length === 0) {
    suggestions.push('You\'re very close! Just maintain good form (85%+) to beat the ghost!');
  }

  return suggestions;
};

import { Ghost, User, Trophy } from 'lucide-react';

export interface MetricsOverlayProps {
  reps: number;
  targetReps: number;
  time: number;  // seconds
  formScore: number;  // percentage
  isGhost: boolean;
  beatTarget?: boolean;
}

const MetricsOverlay = ({
  reps,
  targetReps,
  time,
  formScore,
  isGhost,
  beatTarget = false
}: MetricsOverlayProps) => {
  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get form score color
  const getFormScoreColor = (): string => {
    if (formScore >= 85) return 'text-green-400';
    if (formScore >= 70) return 'text-orange-400';
    return 'text-red-400';
  };

  // Get rep color based on whether target is beat
  const getRepColor = (): string => {
    if (isGhost) return 'text-purple-300';
    if (beatTarget) return 'text-green-400';
    return 'text-white';
  };

  return (
    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm rounded-lg p-3 border border-purple-500/30 min-w-[140px]">
      {/* Header with icon */}
      <div className="flex items-center space-x-2 mb-2 pb-2 border-b border-purple-500/20">
        {isGhost ? (
          <Ghost className="w-4 h-4 text-purple-400" />
        ) : (
          <User className="w-4 h-4 text-blue-400" />
        )}
        <span className="text-xs font-semibold text-purple-200">
          {isGhost ? 'Ghost' : 'You'}
        </span>
        {beatTarget && !isGhost && (
          <Trophy className="w-3 h-3 text-yellow-400 animate-pulse" />
        )}
      </div>

      {/* Metrics */}
      <div className="space-y-2">
        {/* Reps */}
        <div className="flex justify-between items-center">
          <span className="text-xs text-purple-300">Reps:</span>
          <span
            className={`text-sm font-bold ${getRepColor()} ${
              beatTarget && !isGhost ? 'animate-pulse' : ''
            }`}
          >
            {reps}/{targetReps}
          </span>
        </div>

        {/* Time */}
        <div className="flex justify-between items-center">
          <span className="text-xs text-purple-300">Time:</span>
          <span className="text-sm font-bold text-cyan-400">
            {formatTime(time)}
          </span>
        </div>

        {/* Form Score */}
        <div className="flex justify-between items-center">
          <span className="text-xs text-purple-300">Form:</span>
          <span className={`text-sm font-bold ${getFormScoreColor()}`}>
            {formScore}%
          </span>
        </div>
      </div>

      {/* Beat target glow effect */}
      {beatTarget && !isGhost && (
        <div className="absolute inset-0 rounded-lg border-2 border-green-400 animate-pulse pointer-events-none" />
      )}
    </div>
  );
};

export default MetricsOverlay;

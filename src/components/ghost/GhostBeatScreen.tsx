import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trophy, TrendingUp, RotateCcw, ArrowRight } from 'lucide-react';
import { BadgeData, WorkoutMetrics, getPerformanceMessage, getImprovementSuggestions } from '@/utils/ghostBeatCalculator';

export interface GhostBeatScreenProps {
  userMetrics: WorkoutMetrics;
  ghostMetrics: WorkoutMetrics;
  exerciseType: string;
  badge: BadgeData | null;
  onContinue: () => void;
  onRetry: () => void;
}

const GhostBeatScreen = ({
  userMetrics,
  ghostMetrics,
  exerciseType,
  badge,
  onContinue,
  onRetry
}: GhostBeatScreenProps) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [badgeAnimated, setBadgeAnimated] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const didBeatGhost = badge !== null;
  const performanceMessage = getPerformanceMessage({
    didBeat: didBeatGhost,
    repsDiff: userMetrics.reps - ghostMetrics.reps,
    timeDiff: userMetrics.time - ghostMetrics.time,
    formDiff: userMetrics.formScore - ghostMetrics.formScore,
    badge
  });

  const suggestions = !didBeatGhost ? getImprovementSuggestions({
    didBeat: false,
    repsDiff: userMetrics.reps - ghostMetrics.reps,
    timeDiff: userMetrics.time - ghostMetrics.time,
    formDiff: userMetrics.formScore - ghostMetrics.formScore,
    badge: null
  }) : [];

  // Trigger animations on mount
  useEffect(() => {
    if (didBeatGhost) {
      setShowConfetti(true);
      setTimeout(() => setBadgeAnimated(true), 300);
      setTimeout(() => setShowConfetti(false), 5000);
    }
  }, [didBeatGhost]);

  // Confetti animation
  useEffect(() => {
    if (!showConfetti) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      color: string;
      size: number;
      rotation: number;
      rotationSpeed: number;
    }

    const particles: Particle[] = [];
    const colors = ['#A855F7', '#FFD700', '#00FFFF', '#FF6B6B', '#4ECDC4'];

    // Create particles
    for (let i = 0; i < 150; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: -20 - Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 3,
        vy: Math.random() * 3 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10
      });
    }

    let animationId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(particle => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.1; // Gravity
        particle.rotation += particle.rotationSpeed;

        // Draw particle
        ctx.save();
        ctx.translate(particle.x, particle.y);
        ctx.rotate((particle.rotation * Math.PI) / 180);
        ctx.fillStyle = particle.color;
        ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
        ctx.restore();

        // Reset if off screen
        if (particle.y > canvas.height) {
          particle.y = -20;
          particle.x = Math.random() * canvas.width;
        }
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [showConfetti]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-950 via-gray-900 to-black relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-1/4 right-10 w-64 h-64 bg-purple-600/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 left-10 w-96 h-96 bg-purple-800/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Confetti Canvas */}
      {showConfetti && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none z-50"
        />
      )}

      {/* Content */}
      <div className="relative z-10 max-w-2xl w-full">
        {didBeatGhost ? (
          // Beat Ghost Success Screen
          <div className="text-center space-y-6">
            {/* Badge Display */}
            <div className={`transform transition-all duration-700 ${badgeAnimated ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-yellow-500 rounded-full blur-2xl opacity-50 animate-pulse" />
                <div className="relative bg-gradient-to-br from-purple-900 to-purple-700 rounded-full p-8 border-4 border-yellow-400">
                  <Trophy className="w-24 h-24 text-yellow-400" />
                </div>
              </div>
            </div>

            {/* Performance Message */}
            <h1 className="text-4xl font-bold text-white mb-2">
              {performanceMessage}
            </h1>
            <p className="text-xl text-purple-200">
              You beat the ghost in {exerciseType}!
            </p>

            {/* Badge Info */}
            {badge && (
              <div className="bg-purple-900/50 border-2 border-yellow-400/50 rounded-xl p-4">
                <div className="flex items-center justify-center space-x-3">
                  <span className="text-3xl">{badge.icon}</span>
                  <div className="text-left">
                    <h3 className="text-lg font-bold text-yellow-400">{badge.name}</h3>
                    <p className="text-sm text-purple-200">{badge.description}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Comparison Table */}
            <div className="bg-purple-900/30 border border-purple-500/30 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-purple-100 mb-4">Performance Comparison</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-purple-300">Reps:</span>
                  <div className="flex items-center space-x-4">
                    <span className="text-white font-bold">{userMetrics.reps}</span>
                    <span className="text-purple-400">vs</span>
                    <span className="text-purple-300">{ghostMetrics.reps}</span>
                    {userMetrics.reps >= ghostMetrics.reps && (
                      <span className="text-green-400 text-sm">✓</span>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-purple-300">Form Score:</span>
                  <div className="flex items-center space-x-4">
                    <span className="text-white font-bold">{userMetrics.formScore}%</span>
                    <span className="text-purple-400">vs</span>
                    <span className="text-purple-300">{ghostMetrics.formScore}%</span>
                    {userMetrics.formScore >= ghostMetrics.formScore && (
                      <span className="text-green-400 text-sm">✓</span>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-purple-300">Time:</span>
                  <div className="flex items-center space-x-4">
                    <span className="text-white font-bold">{Math.floor(userMetrics.time / 60)}:{(userMetrics.time % 60).toString().padStart(2, '0')}</span>
                    <span className="text-purple-400">vs</span>
                    <span className="text-purple-300">{Math.floor(ghostMetrics.time / 60)}:{(ghostMetrics.time % 60).toString().padStart(2, '0')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <Button
                onClick={onRetry}
                variant="outline"
                className="flex-1 h-14 text-base font-semibold border-2 border-purple-500/50 hover:border-purple-400 hover:bg-purple-900/50 transition-all duration-300 hover:scale-105 group"
                size="lg"
              >
                <RotateCcw className="w-5 h-5 mr-2 group-hover:rotate-180 transition-transform duration-500" />
                Try Again
              </Button>
              <Button
                onClick={onContinue}
                className="flex-1 h-14 text-base font-semibold bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 transition-all duration-300 hover:scale-105 group"
                size="lg"
              >
                Continue
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        ) : (
          // Didn't Beat Ghost - Encouragement Screen
          <div className="text-center space-y-6">
            {/* Icon */}
            <div className="relative inline-block">
              <div className="bg-gradient-to-br from-orange-900 to-orange-700 rounded-full p-8 border-4 border-orange-400">
                <TrendingUp className="w-24 h-24 text-orange-400" />
              </div>
            </div>

            {/* Message */}
            <h1 className="text-4xl font-bold text-white mb-2">
              {performanceMessage}
            </h1>
            <p className="text-xl text-purple-200">
              You're getting closer to beating the ghost!
            </p>

            {/* Comparison Table */}
            <div className="bg-purple-900/30 border border-purple-500/30 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-purple-100 mb-4">How Close Were You?</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-purple-300">Reps:</span>
                  <div className="flex items-center space-x-4">
                    <span className="text-white font-bold">{userMetrics.reps}</span>
                    <span className="text-purple-400">vs</span>
                    <span className="text-purple-300">{ghostMetrics.reps}</span>
                    {userMetrics.reps < ghostMetrics.reps && (
                      <span className="text-orange-400 text-sm">-{ghostMetrics.reps - userMetrics.reps}</span>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-purple-300">Form Score:</span>
                  <div className="flex items-center space-x-4">
                    <span className="text-white font-bold">{userMetrics.formScore}%</span>
                    <span className="text-purple-400">vs</span>
                    <span className="text-purple-300">{ghostMetrics.formScore}%</span>
                    {userMetrics.formScore < 85 && (
                      <span className="text-orange-400 text-sm">Need 85%+</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Improvement Suggestions */}
            <div className="bg-orange-900/20 border-2 border-orange-500/30 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-orange-300 mb-3">Tips to Beat the Ghost:</h3>
              <ul className="space-y-2 text-left">
                {suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start space-x-2 text-purple-200">
                    <span className="text-orange-400 mt-1">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <Button
                onClick={onContinue}
                variant="outline"
                className="flex-1 h-14 text-base font-semibold border-2 border-purple-500/50 hover:border-purple-400 hover:bg-purple-900/50 transition-all duration-300 hover:scale-105"
                size="lg"
              >
                Continue
              </Button>
              <Button
                onClick={onRetry}
                className="flex-1 h-14 text-base font-semibold bg-gradient-to-r from-orange-600 to-orange-800 hover:from-orange-700 hover:to-orange-900 transition-all duration-300 hover:scale-105 group"
                size="lg"
              >
                <RotateCcw className="w-5 h-5 mr-2 group-hover:rotate-180 transition-transform duration-500" />
                Retry Challenge
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GhostBeatScreen;

import { useRef, useEffect } from 'react';

export interface PoseLandmark {
  x: number;
  y: number;
  z: number;
  visibility: number;
}

interface GhostSkeletonCanvasProps {
  poseLandmarks: PoseLandmark[][];
  videoDuration: number;
  currentTime: number;
  isPlaying: boolean;
  ghostMetrics: {
    reps: number;
    time: number;
    formScore: number;
  };
}

const GhostSkeletonCanvas = ({
  poseLandmarks,
  videoDuration,
  currentTime,
  isPlaying,
  ghostMetrics
}: GhostSkeletonCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !poseLandmarks || poseLandmarks.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match container
    const updateCanvasSize = () => {
      const container = canvas.parentElement;
      if (container) {
        const rect = container.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    const render = () => {
      if (isPlaying) {
        // Clear canvas with black background
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Calculate frame index
        const actualFPS = poseLandmarks.length / videoDuration;
        const frameIndex = Math.round(currentTime * actualFPS);
        const clampedIndex = Math.max(0, Math.min(frameIndex, poseLandmarks.length - 1));

        // Draw spooky ghost skeleton
        if (poseLandmarks[clampedIndex]) {
          drawSpookyGhostSkeleton(ctx, poseLandmarks[clampedIndex], canvas.width, canvas.height);
        }

        // Draw ghost metrics
        drawGhostMetrics(ctx, ghostMetrics, currentTime);
      }

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, [isPlaying, poseLandmarks, videoDuration, ghostMetrics, currentTime]);

  const drawSpookyGhostSkeleton = (
    ctx: CanvasRenderingContext2D,
    landmarks: PoseLandmark[],
    width: number,
    height: number
  ) => {
    const POSE_CONNECTIONS = [
      [11, 12], [11, 23], [12, 24], [23, 24],
      [11, 13], [13, 15], [15, 17], [15, 19], [15, 21], [17, 19],
      [12, 14], [14, 16], [16, 18], [16, 20], [16, 22], [18, 20],
      [23, 25], [25, 27], [27, 29], [27, 31], [29, 31],
      [24, 26], [26, 28], [28, 30], [28, 32], [30, 32]
    ];

    const glowIntensity = Math.sin(Date.now() * 0.002) * 0.3 + 0.7;

    // Draw connections with purple glow
    ctx.strokeStyle = '#A855F7';
    ctx.lineWidth = 4;
    ctx.shadowBlur = 25 * glowIntensity;
    ctx.shadowColor = '#A855F7';

    POSE_CONNECTIONS.forEach(([startIdx, endIdx]) => {
      const start = landmarks[startIdx];
      const end = landmarks[endIdx];
      if (start && end && start.visibility > 0.5 && end.visibility > 0.5) {
        ctx.beginPath();
        ctx.moveTo(start.x * width, start.y * height);
        ctx.lineTo(end.x * width, end.y * height);
        ctx.stroke();
      }
    });

    // Draw joints with cyan glow
    ctx.shadowBlur = 20 * glowIntensity;
    ctx.shadowColor = '#00FFFF';

    landmarks.forEach((landmark, index) => {
      if (landmark && landmark.visibility > 0.5) {
        if (index === 0) return; // Skip head

        const x = landmark.x * width;
        const y = landmark.y * height;

        // Outer glow
        const jointGlow = ctx.createRadialGradient(x, y, 0, x, y, 10);
        jointGlow.addColorStop(0, 'rgba(0, 255, 255, 0.8)');
        jointGlow.addColorStop(1, 'rgba(0, 255, 255, 0)');
        ctx.fillStyle = jointGlow;
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, Math.PI * 2);
        ctx.fill();

        // Core joint
        ctx.fillStyle = '#00FFFF';
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  };

  const drawGhostMetrics = (
    ctx: CanvasRenderingContext2D,
    metrics: { reps: number; time: number; formScore: number },
    currentTime: number
  ) => {
    const padding = 20;
    const boxWidth = 180;
    const boxHeight = 120;
    const x = ctx.canvas.width - boxWidth - padding;
    const y = padding;

    // Draw background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(x, y, boxWidth, boxHeight);

    // Draw border
    ctx.strokeStyle = '#A855F7';
    ctx.lineWidth = 2;
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#A855F7';
    ctx.strokeRect(x, y, boxWidth, boxHeight);

    // Draw text
    ctx.shadowBlur = 0;
    ctx.font = 'bold 14px Arial';
    ctx.fillStyle = '#A855F7';
    ctx.fillText('Ghost Stats', x + 10, y + 25);

    ctx.font = '12px Arial';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(`Reps: ${metrics.reps}`, x + 10, y + 50);
    ctx.fillText(`Time: ${Math.floor(currentTime / 60)}:${(currentTime % 60).toString().padStart(2, '0')}`, x + 10, y + 70);
    ctx.fillStyle = '#A855F7';
    ctx.fillText(`Form: ${metrics.formScore}%`, x + 10, y + 90);
  };

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full object-contain"
    />
  );
};

export default GhostSkeletonCanvas;

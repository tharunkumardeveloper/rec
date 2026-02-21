import { useRef, useEffect, useState } from 'react';
import { Landmark3D } from '@/data/ghostKeyframes';

export interface GhostSkeletonRendererProps {
  exerciseType: string;
  isPlaying: boolean;
  speed?: number;
  poseLandmarks?: Landmark3D[];
  onRepComplete?: () => void;
  className?: string;
}

// MediaPipe Pose connections for drawing skeleton
const POSE_CONNECTIONS = [
  // Face
  [0, 1], [1, 2], [2, 3], [3, 7],
  [0, 4], [4, 5], [5, 6], [6, 8],
  [9, 10],
  // Torso
  [11, 12], [11, 23], [12, 24], [23, 24],
  // Left arm
  [11, 13], [13, 15], [15, 17], [15, 19], [15, 21], [17, 19],
  // Right arm
  [12, 14], [14, 16], [16, 18], [16, 20], [16, 22], [18, 20],
  // Left leg
  [23, 25], [25, 27], [27, 29], [27, 31], [29, 31],
  // Right leg
  [24, 26], [26, 28], [28, 30], [28, 32], [30, 32]
];

// Draw spooky skull at head position
const drawSpookySkull = (
  ctx: CanvasRenderingContext2D,
  headLandmark: Landmark3D,
  canvasWidth: number,
  canvasHeight: number,
  timestamp: number
) => {
  const x = headLandmark.x * canvasWidth;
  const y = headLandmark.y * canvasHeight;
  
  // Pulsing effect for haunting appearance
  const pulse = Math.sin(timestamp * 0.003) * 0.15 + 1;
  const size = 18 * pulse;

  ctx.save();

  // Outer ghostly aura
  const outerGlow = ctx.createRadialGradient(x, y, 0, x, y, size * 2.5);
  outerGlow.addColorStop(0, 'rgba(168, 85, 247, 0.5)');
  outerGlow.addColorStop(0.5, 'rgba(168, 85, 247, 0.2)');
  outerGlow.addColorStop(1, 'rgba(168, 85, 247, 0)');
  ctx.fillStyle = outerGlow;
  ctx.beginPath();
  ctx.arc(x, y, size * 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Skull cranium with glow
  ctx.fillStyle = '#A855F7';
  ctx.shadowBlur = 30;
  ctx.shadowColor = '#A855F7';
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.1, size * 0.9, size, 0, 0, Math.PI * 2);
  ctx.fill();

  // Jaw bone
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.6, size * 0.7, size * 0.5, 0, 0, Math.PI);
  ctx.fill();

  // Dark eye sockets
  ctx.fillStyle = '#000000';
  ctx.shadowBlur = 15;
  ctx.shadowColor = '#00FFFF';
  ctx.beginPath();
  ctx.arc(x - size * 0.35, y - size * 0.15, size * 0.25, 0, Math.PI * 2);
  ctx.arc(x + size * 0.35, y - size * 0.15, size * 0.25, 0, Math.PI * 2);
  ctx.fill();

  // Glowing cyan eyes with flicker effect
  const flicker = Math.sin(timestamp * 0.01) * 0.3 + 0.7;
  const eyeGlow = ctx.createRadialGradient(x - size * 0.35, y - size * 0.15, 0, x - size * 0.35, y - size * 0.15, size * 0.2);
  eyeGlow.addColorStop(0, `rgba(0, 255, 255, ${flicker})`);
  eyeGlow.addColorStop(1, 'rgba(0, 255, 255, 0)');
  ctx.fillStyle = eyeGlow;
  ctx.shadowBlur = 20;
  ctx.shadowColor = '#00FFFF';
  ctx.beginPath();
  ctx.arc(x - size * 0.35, y - size * 0.15, size * 0.2, 0, Math.PI * 2);
  ctx.fill();

  const eyeGlow2 = ctx.createRadialGradient(x + size * 0.35, y - size * 0.15, 0, x + size * 0.35, y - size * 0.15, size * 0.2);
  eyeGlow2.addColorStop(0, `rgba(0, 255, 255, ${flicker})`);
  eyeGlow2.addColorStop(1, 'rgba(0, 255, 255, 0)');
  ctx.fillStyle = eyeGlow2;
  ctx.beginPath();
  ctx.arc(x + size * 0.35, y - size * 0.15, size * 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Nose cavity
  ctx.fillStyle = '#000000';
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.moveTo(x, y + size * 0.1);
  ctx.lineTo(x - size * 0.15, y + size * 0.4);
  ctx.lineTo(x + size * 0.15, y + size * 0.4);
  ctx.closePath();
  ctx.fill();

  // Ghostly teeth
  ctx.fillStyle = '#FFFFFF';
  ctx.shadowBlur = 5;
  ctx.shadowColor = '#A855F7';
  const teethY = y + size * 0.55;
  const teethSpacing = size * 0.25;
  for (let i = -2; i <= 2; i++) {
    ctx.fillRect(x + i * teethSpacing - size * 0.08, teethY, size * 0.12, size * 0.25);
  }

  ctx.restore();
};

// Draw haunting skeleton with glowing effects
const drawHauntingSkeleton = (
  ctx: CanvasRenderingContext2D,
  landmarks: Landmark3D[],
  canvasWidth: number,
  canvasHeight: number,
  timestamp: number
) => {
  if (!landmarks || landmarks.length < 33) return;

  ctx.save();

  // Pulsing glow effect
  const glowIntensity = Math.sin(timestamp * 0.002) * 0.3 + 0.7;

  // Draw connections (bones) with purple glow
  ctx.strokeStyle = '#A855F7';
  ctx.lineWidth = 3;
  ctx.shadowBlur = 25 * glowIntensity;
  ctx.shadowColor = '#A855F7';

  POSE_CONNECTIONS.forEach(([startIdx, endIdx]) => {
    const start = landmarks[startIdx];
    const end = landmarks[endIdx];

    if (start && end && start.visibility > 0.5 && end.visibility > 0.5) {
      ctx.beginPath();
      ctx.moveTo(start.x * canvasWidth, start.y * canvasHeight);
      ctx.lineTo(end.x * canvasWidth, end.y * canvasHeight);
      ctx.stroke();
    }
  });

  // Draw joints with cyan glow
  ctx.fillStyle = '#00FFFF';
  ctx.shadowBlur = 20 * glowIntensity;
  ctx.shadowColor = '#00FFFF';

  landmarks.forEach((landmark, index) => {
    if (landmark && landmark.visibility > 0.5) {
      if (index === 0) return; // Skip head, we'll draw skull

      const x = landmark.x * canvasWidth;
      const y = landmark.y * canvasHeight;

      // Outer glow
      const jointGlow = ctx.createRadialGradient(x, y, 0, x, y, 8);
      jointGlow.addColorStop(0, 'rgba(0, 255, 255, 0.8)');
      jointGlow.addColorStop(1, 'rgba(0, 255, 255, 0)');
      ctx.fillStyle = jointGlow;
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fill();

      // Core joint
      ctx.fillStyle = '#00FFFF';
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  // Draw spooky skull at head position
  if (landmarks[0]) {
    drawSpookySkull(ctx, landmarks[0], canvasWidth, canvasHeight, timestamp);
  }

  ctx.restore();
};

const GhostSkeletonRenderer = ({
  exerciseType,
  isPlaying,
  speed = 1.0,
  poseLandmarks,
  onRepComplete,
  className = ''
}: GhostSkeletonRendererProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [renderError, setRenderError] = useState(false);
  const animationFrameRef = useRef<number>();
  const lastRenderTimeRef = useRef<number>(0);
  const frameTimesRef = useRef<number[]>([]);

  // Log when pose landmarks are received
  useEffect(() => {
    if (poseLandmarks && poseLandmarks.length > 0) {
      console.log('👻 Ghost received landmarks:', poseLandmarks.length, 'points');
    } else if (poseLandmarks === undefined) {
      console.log('⚠️ Ghost has no landmarks to render (undefined)');
    } else {
      console.log('⚠️ Ghost has empty landmarks array');
    }
  }, [poseLandmarks]);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.error('❌ Ghost canvas element not found');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('❌ Failed to get 2D context for ghost canvas');
      setRenderError(true);
      return;
    }

    console.log('✅ Ghost canvas initialized successfully');

    // Handle responsive canvas sizing
    const updateCanvasSize = () => {
      const container = canvas.parentElement;
      if (container) {
        const rect = container.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        console.log('📐 Ghost canvas sized:', canvas.width, 'x', canvas.height);
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, []);

  // Render with animation for pulsing/glowing effects
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const render = (timestamp: number) => {
      try {
        // Clear with black background
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw haunting skeleton if we have valid pose data
        if (poseLandmarks && poseLandmarks.length >= 33) {
          drawHauntingSkeleton(ctx, poseLandmarks, canvas.width, canvas.height, timestamp);
          
          // Track frame times for FPS calculation
          if (lastRenderTimeRef.current > 0) {
            const frameTime = timestamp - lastRenderTimeRef.current;
            frameTimesRef.current.push(frameTime);
            
            // Keep only last 60 frames
            if (frameTimesRef.current.length > 60) {
              frameTimesRef.current.shift();
            }
            
            // Calculate average FPS every second
            if (frameTimesRef.current.length >= 30) {
              const avgFrameTime = frameTimesRef.current.reduce((a, b) => a + b, 0) / frameTimesRef.current.length;
              const fps = Math.round(1000 / avgFrameTime);
              
              // Log FPS
              console.log('👻 Ghost rendering at', fps, 'fps');
              
              // Warn if FPS drops below 30
              if (fps < 30) {
                console.warn('⚠️ Ghost rendering performance degraded:', fps, 'fps (target: 60fps)');
              }
              
              // Reset for next measurement
              frameTimesRef.current = [];
            }
          }
          
          lastRenderTimeRef.current = timestamp;
        } else {
          // Show "waiting" message when no data
          ctx.fillStyle = '#A855F7';
          ctx.font = '16px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('Waiting for pose data...', canvas.width / 2, canvas.height / 2);
        }

        // Continue animation loop for pulsing/glowing effects
        animationFrameRef.current = requestAnimationFrame(render);
      } catch (error) {
        console.error('❌ Ghost render error:', error);
      }
    };

    // Start render loop
    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [poseLandmarks]);

  if (renderError) {
    return (
      <div className={`flex items-center justify-center bg-black ${className}`}>
        <p className="text-purple-300 text-sm">Failed to initialize ghost renderer</p>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full ${className}`}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />
    </div>
  );
};

export default GhostSkeletonRenderer;

import { useRef, useEffect, useState } from 'react';
import { Landmark3D } from '@/data/ghostKeyframes';

export interface SkeletonRendererProps {
  exerciseType: string;
  isPlaying: boolean;
  speed?: number;
  poseLandmarks?: Landmark3D[]; // Real-time pose data from MediaPipe
  onRepComplete?: () => void;
  className?: string;
  transparent?: boolean; // If true, don't draw black background (for overlay mode)
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

// Draw skeleton with connections - matching normal MediaPipe appearance
const drawSkeleton = (
  ctx: CanvasRenderingContext2D,
  landmarks: Landmark3D[],
  canvasWidth: number,
  canvasHeight: number
) => {
  if (!landmarks || landmarks.length < 33) return;

  // Save context state
  ctx.save();

  // Draw connections (bones) - cyan color like normal MediaPipe
  ctx.strokeStyle = '#00FFFF';
  ctx.lineWidth = 3; // Increased for better visibility
  ctx.shadowBlur = 0; // No glow for cleaner appearance

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

  // Draw landmarks (joints) - white with cyan fill like normal MediaPipe
  landmarks.forEach((landmark, index) => {
    if (landmark && landmark.visibility > 0.5) {
      const x = landmark.x * canvasWidth;
      const y = landmark.y * canvasHeight;

      // Draw filled circle with cyan fill
      ctx.fillStyle = '#00FFFF';
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2); // Increased size for visibility
      ctx.fill();

      // Draw white outline
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.stroke();
    }
  });

  ctx.restore();
};

const SkeletonRendererNew = ({
  exerciseType,
  isPlaying,
  speed = 1.0,
  poseLandmarks,
  onRepComplete,
  className = '',
  transparent = false
}: SkeletonRendererProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [renderError, setRenderError] = useState(false);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.error('Canvas element not found');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Failed to get 2D context');
      setRenderError(true);
      return;
    }

    // Handle responsive canvas sizing
    const updateCanvasSize = () => {
      const container = canvas.parentElement;
      if (container) {
        const rect = container.getBoundingClientRect();
        
        // Ensure canvas has valid dimensions
        if (rect.width > 0 && rect.height > 0) {
          canvas.width = rect.width;
          canvas.height = rect.height;
          
          console.log('✅ Canvas sized:', canvas.width, 'x', canvas.height);
          
          // Redraw after resize
          if (transparent) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
          } else {
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }
        } else {
          console.warn('⚠️ Container has zero dimensions');
        }
      }
    };

    // Initial size with slight delay to ensure container is rendered
    setTimeout(updateCanvasSize, 100);
    window.addEventListener('resize', updateCanvasSize);

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, [transparent]);

  // Render pose landmarks - optimized for performance
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) {
      console.warn('⚠️ SkeletonRenderer: No canvas or context');
      return;
    }

    // Clear canvas - transparent for overlay mode, black for standalone
    if (transparent) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    } else {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Draw skeleton if we have pose data
    if (poseLandmarks && poseLandmarks.length > 0) {
      drawSkeleton(ctx, poseLandmarks, canvas.width, canvas.height);
    }
  }, [poseLandmarks, transparent]);

  if (renderError) {
    return (
      <div className={`flex items-center justify-center bg-black ${className}`}>
        <p className="text-purple-300 text-sm">Failed to initialize skeleton renderer</p>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full ${className}`}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ 
          pointerEvents: 'none'
        }}
      />
    </div>
  );
};

export default SkeletonRendererNew;

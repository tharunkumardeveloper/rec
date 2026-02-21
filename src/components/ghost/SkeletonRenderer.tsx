import { useRef, useEffect, useState } from 'react';
import { Landmark3D } from '@/data/ghostKeyframes';

export interface SkeletonRendererProps {
  exerciseType: string;
  isPlaying: boolean;
  speed?: number;
  poseLandmarks?: Landmark3D[]; // Real-time pose data from MediaPipe
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

// Draw custom skull at head position
const drawSkullHead = (
  ctx: CanvasRenderingContext2D,
  headLandmark: Landmark3D,
  canvasWidth: number,
  canvasHeight: number
) => {
  const x = headLandmark.x * canvasWidth;
  const y = headLandmark.y * canvasHeight;
  const size = 20; // Base size

  // Save context state
  ctx.save();

  // Skull outline (oval)
  ctx.fillStyle = '#A855F7'; // Purple
  ctx.shadowBlur = 20;
  ctx.shadowColor = '#A855F7';
  ctx.beginPath();
  ctx.ellipse(x, y, size, size * 1.2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eye sockets (dark circles)
  ctx.fillStyle = '#000000';
  ctx.shadowBlur = 0;
  ctx.beginPath();
  ctx.arc(x - size / 3, y - size / 4, size / 4, 0, Math.PI * 2);
  ctx.arc(x + size / 3, y - size / 4, size / 4, 0, Math.PI * 2);
  ctx.fill();

  // Nose triangle
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x - size / 5, y + size / 3);
  ctx.lineTo(x + size / 5, y + size / 3);
  ctx.closePath();
  ctx.fill();

  // Teeth (small rectangles)
  ctx.fillStyle = '#FFFFFF';
  for (let i = -2; i <= 2; i++) {
    ctx.fillRect(x + i * (size / 5), y + size / 2, size / 6, size / 4);
  }

  // Restore context state
  ctx.restore();
};

// Draw skeleton with connections
const drawSkeleton = (
  ctx: CanvasRenderingContext2D,
  landmarks: Landmark3D[],
  canvasWidth: number,
  canvasHeight: number
) => {
  if (!landmarks || landmarks.length < 33) return;

  // Draw connections (bones)
  ctx.strokeStyle = '#A855F7'; // Purple
  ctx.lineWidth = 3;
  ctx.shadowBlur = 20;
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

  // Draw joints (cyan circles)
  ctx.fillStyle = '#00FFFF'; // Cyan
  ctx.shadowBlur = 15;
  ctx.shadowColor = '#00FFFF';

  landmarks.forEach((landmark, index) => {
    if (landmark && landmark.visibility > 0.5) {
      // Skip head landmark (we'll draw skull instead)
      if (index === 0) return;

      ctx.beginPath();
      ctx.arc(
        landmark.x * canvasWidth,
        landmark.y * canvasHeight,
        5,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  });

  // Draw skull at head position
  if (landmarks[0]) {
    drawSkullHead(ctx, landmarks[0], canvasWidth, canvasHeight);
  }
};

// Interpolate between two landmarks
const interpolateLandmark = (
  start: Landmark3D,
  end: Landmark3D,
  alpha: number
): Landmark3D => {
  return {
    x: start.x + (end.x - start.x) * alpha,
    y: start.y + (end.y - start.y) * alpha,
    z: start.z + (end.z - start.z) * alpha,
    visibility: start.visibility + (end.visibility - start.visibility) * alpha
  };
};

// Interpolate between two keyframes
const interpolatePose = (
  frame1: Landmark3D[],
  frame2: Landmark3D[],
  alpha: number
): Landmark3D[] => {
  return frame1.map((landmark, index) =>
    interpolateLandmark(landmark, frame2[index], alpha)
  );
};

const SkeletonRenderer = ({
  exerciseType,
  isPlaying,
  speed = 1.0,
  poseLandmarks,
  onRepComplete,
  className = ''
}: SkeletonRendererProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [renderError, setRenderError] = useState(false);
  const animationFrameRef = useRef<number>();
  const [canvasSize, setCanvasSize] = useState({ width: 640, height: 480 });
  const [keyframesData, setKeyframesData] = useState<any>(null);
  const [currentKeyframeIndex, setCurrentKeyframeIndex] = useState(0);
  const [animationProgress, setAnimationProgress] = useState(0);
  const lastTimestampRef = useRef<number>(0);
  const repCountRef = useRef(0);
  const [useRealPose, setUseRealPose] = useState(false);

  // Determine if we should use real pose data or keyframes
  useEffect(() => {
    setUseRealPose(!!poseLandmarks && poseLandmarks.length > 0);
  }, [poseLandmarks]);

  // Load keyframes for the exercise (fallback if no real pose data)
  useEffect(() => {
    if (useRealPose) return; // Skip loading keyframes if we have real pose data

    const loadExerciseKeyframes = async () => {
      try {
        const { loadKeyframes } = await import('@/data/ghostKeyframesIndex');
        const data = loadKeyframes(exerciseType);
        setKeyframesData(data);
      } catch (error) {
        console.error('Failed to load keyframes:', error);
        setRenderError(true);
      }
    };

    loadExerciseKeyframes();
  }, [exerciseType, useRealPose]);

  // Initialize canvas and set up responsive sizing
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
        const width = container.clientWidth;
        const height = Math.floor(width * (9 / 16)); // 16:9 aspect ratio
        setCanvasSize({ width, height });
        canvas.width = width;
        canvas.height = height;
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    // Initial black background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, []);

  // Animation loop
  useEffect(() => {
    if (!isPlaying || !keyframesData || !keyframesData.keyframes.length) {
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const animate = (timestamp: number) => {
      if (!lastTimestampRef.current) {
        lastTimestampRef.current = timestamp;
      }

      const deltaTime = (timestamp - lastTimestampRef.current) * speed;
      lastTimestampRef.current = timestamp;

      const keyframes = keyframesData.keyframes;
      const currentKeyframe = keyframes[currentKeyframeIndex];
      const nextKeyframeIndex = (currentKeyframeIndex + 1) % keyframes.length;
      const nextKeyframe = keyframes[nextKeyframeIndex];

      // Update animation progress
      const newProgress = animationProgress + deltaTime;
      
      if (newProgress >= currentKeyframe.duration) {
        // Move to next keyframe
        setCurrentKeyframeIndex(nextKeyframeIndex);
        setAnimationProgress(0);

        // Check if we completed a rep (returned to start)
        if (nextKeyframeIndex === 0) {
          repCountRef.current += 1;
          if (onRepComplete) {
            onRepComplete();
          }
        }
      } else {
        setAnimationProgress(newProgress);
      }

      // Calculate interpolation alpha
      const alpha = newProgress / currentKeyframe.duration;

      // Interpolate between current and next keyframe
      const interpolatedLandmarks = interpolatePose(
        currentKeyframe.landmarks,
        nextKeyframe.landmarks,
        alpha
      );

      // Clear canvas with black background
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw skeleton
      drawSkeleton(ctx, interpolatedLandmarks, canvas.width, canvas.height);

      // Continue animation
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      lastTimestampRef.current = 0;
    };
  }, [isPlaying, keyframesData, currentKeyframeIndex, animationProgress, speed, onRepComplete]);

  if (renderError) {
    return (
      <div className={`flex items-center justify-center bg-black ${className}`}>
        <p className="text-purple-300 text-sm">Failed to initialize skeleton renderer</p>
      </div>
    );
  }

  return (
    <div className={`relative w-full ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ aspectRatio: '16/9' }}
      />
    </div>
  );
};

export default SkeletonRenderer;

import { useEffect, useRef } from 'react';

interface PoseLandmark {
  x: number;
  y: number;
  z: number;
  visibility: number;
}

interface TestSkeletonRendererProps {
  landmarks: PoseLandmark[];
  videoWidth: number;
  videoHeight: number;
  theme: 'red';
}

// MediaPipe Pose landmark connections
const POSE_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 7], // Face
  [0, 4], [4, 5], [5, 6], [6, 8], // Face
  [9, 10], // Mouth
  [11, 12], // Shoulders
  [11, 13], [13, 15], [15, 17], [15, 19], [15, 21], [17, 19], // Left arm
  [12, 14], [14, 16], [16, 18], [16, 20], [16, 22], [18, 20], // Right arm
  [11, 23], [12, 24], [23, 24], // Torso
  [23, 25], [25, 27], [27, 29], [27, 31], [29, 31], // Left leg
  [24, 26], [26, 28], [28, 30], [28, 32], [30, 32], // Right leg
];

const TestSkeletonRenderer = ({ landmarks, videoWidth, videoHeight, theme }: TestSkeletonRendererProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !landmarks || landmarks.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set red theme colors
    const lineColor = theme === 'red' ? 'rgba(239, 68, 68, 0.8)' : 'rgba(139, 92, 246, 0.8)'; // red-500
    const jointColor = theme === 'red' ? 'rgba(248, 113, 113, 1)' : 'rgba(167, 139, 250, 1)'; // red-400
    const highlightColor = theme === 'red' ? 'rgba(252, 165, 165, 1)' : 'rgba(196, 181, 253, 1)'; // red-300

    // Draw connections
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 3;
    
    POSE_CONNECTIONS.forEach(([start, end]) => {
      const startLandmark = landmarks[start];
      const endLandmark = landmarks[end];

      if (startLandmark && endLandmark && 
          startLandmark.visibility > 0.5 && endLandmark.visibility > 0.5) {
        ctx.beginPath();
        ctx.moveTo(startLandmark.x * canvas.width, startLandmark.y * canvas.height);
        ctx.lineTo(endLandmark.x * canvas.width, endLandmark.y * canvas.height);
        ctx.stroke();
      }
    });

    // Draw landmarks
    landmarks.forEach((landmark, index) => {
      if (landmark.visibility > 0.5) {
        const x = landmark.x * canvas.width;
        const y = landmark.y * canvas.height;

        // Key joints (shoulders, elbows, wrists, hips, knees, ankles)
        const keyJoints = [11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28];
        const isKeyJoint = keyJoints.includes(index);

        ctx.beginPath();
        ctx.arc(x, y, isKeyJoint ? 6 : 4, 0, 2 * Math.PI);
        ctx.fillStyle = isKeyJoint ? highlightColor : jointColor;
        ctx.fill();

        // Add glow effect for key joints
        if (isKeyJoint) {
          ctx.shadowBlur = 10;
          ctx.shadowColor = highlightColor;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }
    });
  }, [landmarks, videoWidth, videoHeight, theme]);

  return (
    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden border-2 border-red-500/50">
      <canvas
        ref={canvasRef}
        width={videoWidth}
        height={videoHeight}
        className="w-full h-full object-contain"
      />
      {(!landmarks || landmarks.length === 0) && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-red-400 text-sm">No pose data available</p>
        </div>
      )}
    </div>
  );
};

export default TestSkeletonRenderer;

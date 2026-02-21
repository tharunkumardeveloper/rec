import { useRef, useEffect } from 'react';

interface Landmark {
  x: number;
  y: number;
  z: number;
  visibility: number;
}

interface SimpleGhostRendererProps {
  landmarks?: Landmark[];
  className?: string;
}

// MediaPipe Pose connections
const CONNECTIONS = [
  [11, 12], [11, 13], [13, 15], [12, 14], [14, 16], // Arms
  [11, 23], [12, 24], [23, 24], // Torso
  [23, 25], [25, 27], [27, 29], [27, 31], // Left leg
  [24, 26], [26, 28], [28, 30], [28, 32], // Right leg
  [0, 1], [1, 2], [2, 3], [3, 7], [0, 4], [4, 5], [5, 6], [6, 8] // Face
];

const SimpleGhostRenderer = ({ landmarks, className = '' }: SimpleGhostRendererProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const updateSize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);

    const draw = (timestamp: number) => {
      // Clear canvas
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (landmarks && landmarks.length >= 33) {
        const w = canvas.width;
        const h = canvas.height;
        
        // Pulsing effect
        const pulse = Math.sin(timestamp * 0.003) * 0.2 + 0.8;

        // Draw connections (bones)
        ctx.strokeStyle = '#A855F7';
        ctx.lineWidth = 3;
        ctx.shadowBlur = 20 * pulse;
        ctx.shadowColor = '#A855F7';

        CONNECTIONS.forEach(([start, end]) => {
          const p1 = landmarks[start];
          const p2 = landmarks[end];
          
          if (p1 && p2 && p1.visibility > 0.5 && p2.visibility > 0.5) {
            ctx.beginPath();
            ctx.moveTo(p1.x * w, p1.y * h);
            ctx.lineTo(p2.x * w, p2.y * h);
            ctx.stroke();
          }
        });

        // Draw joints
        ctx.shadowBlur = 15 * pulse;
        ctx.shadowColor = '#00FFFF';
        
        landmarks.forEach((lm, i) => {
          if (lm && lm.visibility > 0.5) {
            const x = lm.x * w;
            const y = lm.y * h;
            
            // Glow
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, 8);
            gradient.addColorStop(0, 'rgba(0, 255, 255, 0.8)');
            gradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x, y, 8, 0, Math.PI * 2);
            ctx.fill();
            
            // Core
            ctx.fillStyle = '#00FFFF';
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fill();
          }
        });

        // Draw skull at head
        if (landmarks[0] && landmarks[0].visibility > 0.5) {
          const head = landmarks[0];
          const x = head.x * w;
          const y = head.y * h;
          const size = 20 * pulse;

          ctx.fillStyle = '#A855F7';
          ctx.shadowBlur = 30;
          ctx.shadowColor = '#A855F7';
          
          // Skull
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
          
          // Eyes
          ctx.fillStyle = '#00FFFF';
          ctx.shadowColor = '#00FFFF';
          ctx.beginPath();
          ctx.arc(x - size * 0.3, y - size * 0.2, size * 0.15, 0, Math.PI * 2);
          ctx.arc(x + size * 0.3, y - size * 0.2, size * 0.15, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        // No data message
        ctx.fillStyle = '#A855F7';
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Waiting for pose data...', canvas.width / 2, canvas.height / 2);
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    animationRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', updateSize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [landmarks]);

  return (
    <div className={`relative w-full h-full ${className}`}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
};

export default SimpleGhostRenderer;

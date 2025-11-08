import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, SkipBack, SkipForward } from 'lucide-react';

interface FramePlayerProps {
  outputId: string;
  baseUrl: string;
}

const FramePlayer = ({ outputId, baseUrl }: FramePlayerProps) => {
  const [frames, setFrames] = useState<string[]>([]);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Fetch frames list
    fetch(`${baseUrl}/api/frames/${outputId}`)
      .then(res => res.json())
      .then(data => {
        if (data.frames) {
          setFrames(data.frames.map((f: string) => `${baseUrl}${f}`));
          setLoading(false);
        }
      })
      .catch(err => {
        console.error('Failed to load frames:', err);
        setLoading(false);
      });
  }, [outputId, baseUrl]);

  useEffect(() => {
    if (isPlaying && frames.length > 0) {
      intervalRef.current = setInterval(() => {
        setCurrentFrame(prev => {
          if (prev >= frames.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 100); // 10 FPS playback
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, frames.length]);

  const togglePlay = () => {
    if (currentFrame >= frames.length - 1) {
      setCurrentFrame(0);
    }
    setIsPlaying(!isPlaying);
  };

  const restart = () => {
    setCurrentFrame(0);
    setIsPlaying(true);
  };

  const previousFrame = () => {
    setIsPlaying(false);
    setCurrentFrame(prev => Math.max(0, prev - 1));
  };

  const nextFrame = () => {
    setIsPlaying(false);
    setCurrentFrame(prev => Math.min(frames.length - 1, prev + 1));
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black rounded-lg">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading annotated video...</p>
        </div>
      </div>
    );
  }

  if (frames.length === 0) {
    // Fallback to regular video player
    const videoUrl = `${baseUrl}/api/video/${outputId}/${outputId}_annotated.mp4`;
    return (
      <div className="w-full h-full bg-black rounded-lg">
        <video
          src={videoUrl}
          controls
          className="w-full h-full object-contain"
          playsInline
          preload="auto"
        >
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-black rounded-lg">
      {/* Frame Display */}
      <img
        src={frames[currentFrame]}
        alt={`Frame ${currentFrame + 1}`}
        className="w-full h-full object-contain"
      />

      {/* Controls Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4">
        <div className="flex items-center gap-2 mb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={restart}
            className="text-white hover:bg-white/20"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={previousFrame}
            className="text-white hover:bg-white/20"
          >
            <SkipBack className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={togglePlay}
            className="text-white hover:bg-white/20"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={nextFrame}
            className="text-white hover:bg-white/20"
          >
            <SkipForward className="w-4 h-4" />
          </Button>

          <div className="flex-1 mx-2">
            <input
              type="range"
              min="0"
              max={frames.length - 1}
              value={currentFrame}
              onChange={(e) => {
                setIsPlaying(false);
                setCurrentFrame(parseInt(e.target.value));
              }}
              className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #fff 0%, #fff ${(currentFrame / (frames.length - 1)) * 100}%, rgba(255,255,255,0.3) ${(currentFrame / (frames.length - 1)) * 100}%, rgba(255,255,255,0.3) 100%)`
              }}
            />
          </div>

          <span className="text-white text-xs font-mono whitespace-nowrap">
            {currentFrame + 1} / {frames.length}
          </span>
        </div>
      </div>
    </div>
  );
};

export default FramePlayer;

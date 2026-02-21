import { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Maximize, Minimize } from 'lucide-react';

interface VideoPlayerProps {
  src: string;
  className?: string;
}

const VideoPlayer = ({ src, className = '' }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Reset state when src changes
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setError(null);
    
    // Force video to reload with proper buffer settings
    video.load();
    video.preload = 'auto';

    const handleLoadedMetadata = () => {
      console.log('Video metadata loaded:', {
        duration: video.duration,
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight
      });
      setDuration(video.duration);
      setError(null);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    const handleError = (e: Event) => {
      console.error('Video error:', e, video.error);
      setError('Video format not supported in browser. Please download to view.');
    };
    
    const handleCanPlay = () => {
      console.log('Video can play');
    };
    
    const handleWaiting = () => {
      console.log('Video waiting for data...');
    };
    
    const handleStalled = () => {
      console.log('Video stalled');
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('stalled', handleStalled);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('stalled', handleStalled);
    };
  }, [src]);

  const togglePlay = async () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      try {
        // Force load if needed
        if (video.readyState < 2) {
          video.load();
          await new Promise(resolve => {
            video.addEventListener('loadeddata', resolve, { once: true });
          });
        }
        await video.play();
        setIsPlaying(true);
      } catch (err) {
        console.error('Play error:', err);
        setError('Cannot play video. Please download to view.');
      }
    }
  };

  const restart = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    video.play();
    setIsPlaying(true);
  };

  const toggleFullscreen = async () => {
    const container = containerRef.current;
    if (!container) return;

    try {
      if (!isFullscreen) {
        // Enter fullscreen
        if (container.requestFullscreen) {
          await container.requestFullscreen();
        } else if ((container as any).webkitRequestFullscreen) {
          await (container as any).webkitRequestFullscreen(); // Safari
        } else if ((container as any).mozRequestFullScreen) {
          await (container as any).mozRequestFullScreen(); // Firefox
        } else if ((container as any).msRequestFullscreen) {
          await (container as any).msRequestFullscreen(); // IE/Edge
        }
      } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        } else if ((document as any).mozCancelFullScreen) {
          await (document as any).mozCancelFullScreen();
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen();
        }
      }
    } catch (err) {
      console.error('Fullscreen error:', err);
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );
      setIsFullscreen(isCurrentlyFullscreen);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds) || isNaN(seconds)) {
      return '0:00';
    }
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div ref={containerRef} className={`relative ${className} ${isFullscreen ? 'bg-black' : ''}`}>
      <video
        ref={videoRef}
        src={src}
        className={`w-full h-full object-contain bg-black ${isFullscreen ? '' : 'rounded-lg'}`}
        playsInline
        preload="auto"
        crossOrigin="anonymous"
        controls={false}
        muted={false}
        autoPlay={false}
        style={{ 
          imageRendering: 'crisp-edges',
          WebkitTransform: 'translateZ(0)', // Hardware acceleration
          transform: 'translateZ(0)'
        }}
      />
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 rounded-lg">
          <div className="text-center text-white p-4">
            <p className="text-sm mb-2">⚠️ {error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(src, '_blank')}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              Open in New Tab
            </Button>
          </div>
        </div>
      )}

      {!error && (
        <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 ${isFullscreen ? '' : 'rounded-b-lg'}`}>
          <div className="flex items-center gap-2 mb-2">
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
              onClick={restart}
              className="text-white hover:bg-white/20"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>

            <div className="flex-1 mx-2">
              <input
                type="range"
                min="0"
                max={isFinite(duration) && duration > 0 ? duration : currentTime + 10}
                value={currentTime}
                onChange={(e) => {
                  const video = videoRef.current;
                  if (video) {
                    video.currentTime = parseFloat(e.target.value);
                  }
                }}
                className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #fff 0%, #fff ${isFinite(duration) && duration > 0 ? (currentTime / duration) * 100 : 50}%, rgba(255,255,255,0.3) ${isFinite(duration) && duration > 0 ? (currentTime / duration) * 100 : 50}%, rgba(255,255,255,0.3) 100%)`
                }}
              />
            </div>

            <span className="text-white text-xs font-mono whitespace-nowrap">
              {formatTime(currentTime)} / {isFinite(duration) && duration > 0 ? formatTime(duration) : formatTime(currentTime)}
            </span>

            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className="text-white hover:bg-white/20"
              title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;

import { useRef, useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Video, Download, Ghost, User } from 'lucide-react';
import GhostSkeletonRenderer from './GhostSkeletonRenderer';
import MetricsOverlay from './MetricsOverlay';

export interface WorkoutMetrics {
  reps: number;
  time: number;  // seconds
  formScore: number;  // percentage
  currentPhase: string;
}

export interface PoseLandmark {
  x: number;
  y: number;
  z: number;
  visibility: number;
}

export interface DualVideoDisplayProps {
  userVideo: File | Blob | string;
  exerciseType: string;
  userMetrics: WorkoutMetrics;
  ghostMetrics: WorkoutMetrics;
  poseLandmarks?: PoseLandmark[][];
  videoDuration?: number;
  onPlaybackComplete?: () => void;
}

const DualVideoDisplay = ({
  userVideo,
  exerciseType,
  userMetrics,
  ghostMetrics,
  poseLandmarks,
  videoDuration,
  onPlaybackComplete
}: DualVideoDisplayProps) => {
  const userVideoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [beatTarget, setBeatTarget] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  // Debug logging when metrics or landmarks change
  useEffect(() => {
    console.log('🎬 DualVideoDisplay Updated:', {
      userVideo: userVideo ? (typeof userVideo === 'string' ? 'URL' : 'File/Blob') : 'Missing',
      exerciseType,
      userMetrics,
      ghostMetrics,
      poseLandmarksCount: poseLandmarks?.length || 0,
      videoDuration
    });
  }, [userMetrics, ghostMetrics, poseLandmarks]); // Log when key props change

  // Create video URL from File/Blob
  useEffect(() => {
    if (userVideo instanceof File || userVideo instanceof Blob) {
      const url = URL.createObjectURL(userVideo);
      setVideoUrl(url);
      return () => URL.revokeObjectURL(url);
    } else if (typeof userVideo === 'string') {
      setVideoUrl(userVideo);
    }
  }, [userVideo]);

  // Check if user beat target
  useEffect(() => {
    const didBeat = userMetrics.reps >= ghostMetrics.reps && userMetrics.formScore >= 85;
    setBeatTarget(didBeat);
  }, [userMetrics.reps, userMetrics.formScore, ghostMetrics.reps]);

  // Frame synchronization system using requestAnimationFrame for smooth 60fps updates
  useEffect(() => {
    const video = userVideoRef.current;
    if (!video || !poseLandmarks || poseLandmarks.length === 0) {
      console.log('⚠️ Frame sync not initialized:', {
        hasVideo: !!video,
        hasLandmarks: !!poseLandmarks,
        landmarkCount: poseLandmarks?.length || 0
      });
      return;
    }

    let animationFrameId: number;
    let lastLogTime = 0;

    console.log('✅ Frame synchronization initialized:', {
      totalFrames: poseLandmarks.length,
      videoDuration: videoDuration || video.duration,
      calculatedFPS: poseLandmarks.length / (videoDuration || video.duration)
    });

    const updateFrame = () => {
      if (!video.paused && !video.ended) {
        // Update current time for metrics display
        const newTime = Math.floor(video.currentTime);
        setCurrentTime(newTime);
        
        // Calculate actual FPS based on video duration and number of frames
        const actualDuration = videoDuration || video.duration;
        const actualFPS = poseLandmarks.length / actualDuration;
        
        // Calculate frame index based on current video time
        // Use Math.round for smoother interpolation between frames
        const frameIndex = Math.round(video.currentTime * actualFPS);
        // Clamp to valid bounds to prevent array access errors
        const clampedIndex = Math.max(0, Math.min(frameIndex, poseLandmarks.length - 1));
        
        setCurrentFrameIndex(clampedIndex);
        
        // Debug log every second showing synchronization status
        const currentLogTime = Math.floor(video.currentTime);
        if (currentLogTime !== lastLogTime) {
          console.log(`🎬 Sync Status - Time: ${video.currentTime.toFixed(2)}s, Frame: ${clampedIndex}/${poseLandmarks.length}, FPS: ${actualFPS.toFixed(2)}`);
          lastLogTime = currentLogTime;
        }
      }

      // Continue animation loop for smooth 60fps updates
      animationFrameId = requestAnimationFrame(updateFrame);
    };

    // Start animation loop
    updateFrame();

    // Also listen to timeupdate as fallback
    const handleTimeUpdate = () => {
      setCurrentTime(Math.floor(video.currentTime));
    };

    video.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      video.removeEventListener('timeupdate', handleTimeUpdate);
      console.log('🛑 Frame synchronization stopped');
    };
  }, [videoUrl, poseLandmarks, videoDuration]);

  // Handle video playback
  useEffect(() => {
    const video = userVideoRef.current;
    if (!video || !videoUrl) return;

    const handlePlay = () => {
      setIsPlaying(true);
      setIsLoading(false);
    };
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      setIsPlaying(false);
      // Don't auto-close - let users view the results
    };
    const handleError = () => {
      console.error('Video failed to load');
      setVideoError(true);
      setIsLoading(false);
    };
    const handleLoadedData = () => {
      setIsLoading(false);
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);
    video.addEventListener('loadeddata', handleLoadedData);

    // Auto-play video
    video.play().catch(err => {
      console.error('Video play failed:', err);
      setVideoError(true);
      setIsLoading(false);
    });

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
      video.removeEventListener('loadeddata', handleLoadedData);
    };
  }, [videoUrl, onPlaybackComplete]);

  const [isRecordingGhost, setIsRecordingGhost] = useState(false);
  const ghostCanvasRef = useRef<HTMLCanvasElement>(null);

  const handleDownloadUserVideo = () => {
    if (videoUrl) {
      const a = document.createElement('a');
      a.href = videoUrl;
      a.download = `user-performance-${exerciseType}-${Date.now()}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleDownloadGhostVideo = async () => {
    if (!poseLandmarks || poseLandmarks.length === 0 || !userVideoRef.current) {
      alert('Ghost performance data not available');
      return;
    }

    setIsRecordingGhost(true);

    try {
      // Create an offscreen canvas for recording
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }

      // Setup MediaRecorder
      const stream = canvas.captureStream(30); // 30 fps
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 2500000
      });

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ghost-performance-${exerciseType}-${Date.now()}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setIsRecordingGhost(false);
      };

      mediaRecorder.start();

      // Get video duration
      const duration = videoDuration || userVideoRef.current.duration;
      const fps = poseLandmarks.length / duration;
      const frameDuration = 1000 / 30; // 30 fps for recording

      // Render each frame
      let frameIndex = 0;
      const totalFrames = poseLandmarks.length;

      const renderFrame = () => {
        if (frameIndex >= totalFrames) {
          mediaRecorder.stop();
          return;
        }

        // Clear canvas
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw ghost skeleton
        const landmarks = poseLandmarks[frameIndex];
        if (landmarks && landmarks.length > 0) {
          drawGhostSkeleton(ctx, landmarks, canvas.width, canvas.height);
        }

        frameIndex++;
        setTimeout(renderFrame, frameDuration);
      };

      renderFrame();

    } catch (error) {
      console.error('Failed to record ghost video:', error);
      alert('Failed to download ghost video. Please try again.');
      setIsRecordingGhost(false);
    }
  };

  // Helper function to draw ghost skeleton on canvas
  const drawGhostSkeleton = (
    ctx: CanvasRenderingContext2D,
    landmarks: PoseLandmark[],
    width: number,
    height: number
  ) => {
    // Define skeleton connections
    const connections = [
      [11, 12], [11, 13], [13, 15], [12, 14], [14, 16], // Arms
      [11, 23], [12, 24], [23, 24], // Torso
      [23, 25], [25, 27], [27, 29], [29, 31], // Left leg
      [24, 26], [26, 28], [28, 30], [30, 32], // Right leg
    ];

    // Draw connections
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.8)'; // Purple
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';

    connections.forEach(([start, end]) => {
      const startPoint = landmarks[start];
      const endPoint = landmarks[end];

      if (startPoint && endPoint && 
          startPoint.visibility > 0.5 && endPoint.visibility > 0.5) {
        ctx.beginPath();
        ctx.moveTo(startPoint.x * width, startPoint.y * height);
        ctx.lineTo(endPoint.x * width, endPoint.y * height);
        ctx.stroke();
      }
    });

    // Draw joints
    ctx.fillStyle = 'rgba(168, 85, 247, 1)'; // Purple
    landmarks.forEach((landmark) => {
      if (landmark.visibility > 0.5) {
        ctx.beginPath();
        ctx.arc(
          landmark.x * width,
          landmark.y * height,
          5,
          0,
          2 * Math.PI
        );
        ctx.fill();
      }
    });

    // Add glow effect
    ctx.shadowBlur = 15;
    ctx.shadowColor = 'rgba(168, 85, 247, 0.8)';
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-4 md:space-y-6">
      {/* Competition Header */}
      <div className="bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg md:rounded-xl p-3 md:p-4 border border-purple-500/30 text-center">
        <h2 className="text-xl md:text-3xl font-bold text-purple-100 mb-1">Ghost Challenge</h2>
        <p className="text-purple-300 text-xs md:text-base">Watch your performance vs the ghost competitor</p>
      </div>

      {/* Video Comparison - Side by side on PC, stacked on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* User Video Panel */}
        <div className="relative">
          <div className="flex items-center justify-between mb-2 md:mb-3">
            <div className="flex items-center space-x-1 md:space-x-2">
              <User className="w-4 h-4 md:w-5 md:h-5 text-cyan-300" />
              <span className="text-base md:text-lg font-semibold text-cyan-300">Your Performance</span>
            </div>
            <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 px-2 md:px-3 py-0.5 md:py-1 text-xs md:text-sm">
              You
            </Badge>
          </div>
          <div className={`relative aspect-video bg-black rounded-lg md:rounded-xl overflow-hidden border-2 md:border-3 transition-all duration-300 ${
            beatTarget ? 'border-green-500 shadow-lg md:shadow-2xl shadow-green-500/50' : 'border-cyan-500/50'
          }`}>
            {videoError ? (
              <div className="flex flex-col items-center justify-center h-full space-y-2">
                <Video className="w-12 h-12 text-red-400" />
                <p className="text-sm text-red-300">Failed to load video</p>
              </div>
            ) : videoUrl ? (
              <>
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                    <div className="flex flex-col items-center space-y-2">
                      <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                      <p className="text-sm text-purple-300">Loading video...</p>
                    </div>
                  </div>
                )}
                <video
                  ref={userVideoRef}
                  src={videoUrl}
                  className="w-full h-full object-contain"
                  controls
                />
                <div className="relative z-30">
                  <MetricsOverlay
                    reps={userMetrics.reps}
                    targetReps={ghostMetrics.reps}
                    time={currentTime}
                    formScore={userMetrics.formScore}
                    isGhost={false}
                    beatTarget={beatTarget}
                  />
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <Video className="w-12 h-12 text-blue-400 animate-pulse" />
              </div>
            )}
          </div>
          {/* Download Button for User Video */}
          <Button
            onClick={handleDownloadUserVideo}
            className="w-full mt-3 bg-cyan-600 hover:bg-cyan-700 text-white"
            disabled={!videoUrl}
          >
            <Download className="w-4 h-4 mr-2" />
            Download Your Performance
          </Button>
        </div>

        {/* Ghost Skeleton Panel */}
        <div className="relative">
          <div className="flex items-center justify-between mb-2 md:mb-3">
            <div className="flex items-center space-x-1 md:space-x-2">
              <Ghost className="w-4 h-4 md:w-5 md:h-5 text-purple-300" />
              <span className="text-base md:text-lg font-semibold text-purple-300">Ghost Performance</span>
            </div>
            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 px-2 md:px-3 py-0.5 md:py-1 text-xs md:text-sm">
              Ghost
            </Badge>
          </div>
          <div className={`relative aspect-video bg-black rounded-lg md:rounded-xl overflow-hidden border-2 md:border-3 transition-all duration-300 ${
            !beatTarget && userMetrics.reps > 0 ? 'border-purple-500 shadow-lg md:shadow-2xl shadow-purple-500/50' : 'border-purple-500/50'
          }`}>
            <GhostSkeletonRenderer
              exerciseType={exerciseType}
              isPlaying={isPlaying}
              speed={1.0}
              poseLandmarks={
                poseLandmarks && 
                currentFrameIndex >= 0 && 
                currentFrameIndex < poseLandmarks.length 
                  ? poseLandmarks[currentFrameIndex] 
                  : undefined
              }
              className="w-full h-full"
            />
            <div className="relative z-30">
              <MetricsOverlay
                reps={ghostMetrics.reps}
                targetReps={ghostMetrics.reps}
                time={currentTime}
                formScore={ghostMetrics.formScore}
                isGhost={true}
              />
            </div>
          </div>
          {/* Download Button for Ghost Video */}
          <Button
            onClick={handleDownloadGhostVideo}
            className="w-full mt-3 bg-purple-600 hover:bg-purple-700 text-white"
            disabled={isRecordingGhost || !poseLandmarks || poseLandmarks.length === 0}
          >
            {isRecordingGhost ? (
              <>
                <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Recording Ghost Video...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Download Ghost Performance
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Victory/Result Banner with Enhanced Animation */}
      {userMetrics.reps > 0 && (
        <div className={`rounded-lg md:rounded-xl p-4 md:p-6 border text-center transition-all duration-500 ${
          beatTarget 
            ? 'bg-gradient-to-r from-green-900/50 via-emerald-900/50 to-green-900/50 border-green-500/50 animate-pulse' 
            : 'bg-gradient-to-r from-purple-900/50 to-cyan-900/50 border-purple-500/30'
        }`}>
          {beatTarget ? (
            <div className="space-y-3 md:space-y-4">
              {/* Confetti-like celebration */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-6xl md:text-8xl animate-bounce">🎉</div>
                </div>
                <div className="flex items-center justify-center space-x-3 md:space-x-4 relative z-10">
                  <span className="text-5xl md:text-7xl animate-pulse">🏆</span>
                  <div>
                    <h3 className="text-3xl md:text-5xl font-black text-green-300 animate-pulse drop-shadow-lg">
                      VICTORY!
                    </h3>
                    <p className="text-green-400 text-sm md:text-lg font-semibold mt-1">
                      You crushed the ghost competitor!
                    </p>
                  </div>
                  <span className="text-5xl md:text-7xl animate-pulse">🏆</span>
                </div>
              </div>
              <div className="flex justify-center items-center space-x-6 md:space-x-12 text-sm md:text-base">
                <div className="bg-cyan-900/50 rounded-lg p-3 md:p-4 border border-cyan-500/30">
                  <p className="text-cyan-300 font-semibold mb-1">Your Reps</p>
                  <p className="text-3xl md:text-4xl font-black text-cyan-200">{userMetrics.reps}</p>
                </div>
                <div className="text-green-400 text-2xl md:text-3xl font-black">WIN</div>
                <div className="bg-purple-900/50 rounded-lg p-3 md:p-4 border border-purple-500/30">
                  <p className="text-purple-300 font-semibold mb-1">Ghost Reps</p>
                  <p className="text-3xl md:text-4xl font-black text-purple-200">{ghostMetrics.reps}</p>
                </div>
              </div>
              <div className="flex items-center justify-center space-x-2 text-green-300 text-sm md:text-base">
                <span className="text-2xl">⭐</span>
                <span className="font-semibold">+50 Bonus Coins Earned!</span>
                <span className="text-2xl">⭐</span>
              </div>
            </div>
          ) : (
            <div className="space-y-2 md:space-y-3">
              <div className="flex items-center justify-center space-x-2 md:space-x-3">
                <span className="text-4xl md:text-6xl animate-bounce">👻</span>
                <div>
                  <h3 className="text-2xl md:text-3xl font-black text-purple-300">GHOST WINS!</h3>
                  <p className="text-purple-400 text-xs md:text-sm">The ghost was too strong this time!</p>
                </div>
                <span className="text-4xl md:text-6xl animate-bounce">👻</span>
              </div>
              <div className="flex justify-center items-center space-x-4 md:space-x-8 text-xs md:text-sm">
                <div className="bg-cyan-900/50 rounded-lg p-2 md:p-3 border border-cyan-500/30">
                  <p className="text-cyan-300 font-semibold">Your Reps</p>
                  <p className="text-xl md:text-2xl font-bold text-cyan-200">{userMetrics.reps}</p>
                </div>
                <div className="text-purple-400 text-lg md:text-2xl">vs</div>
                <div className="bg-purple-900/50 rounded-lg p-2 md:p-3 border border-purple-500/30">
                  <p className="text-purple-300 font-semibold">Ghost Reps</p>
                  <p className="text-xl md:text-2xl font-bold text-purple-200">{ghostMetrics.reps}</p>
                </div>
              </div>
              <p className="text-purple-300 text-sm">Try again to beat the ghost!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DualVideoDisplay;

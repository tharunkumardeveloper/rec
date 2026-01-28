import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, AlertCircle, Camera, SwitchCamera } from 'lucide-react';
import { postureChecker, PostureCheckResult } from '@/services/postureChecker';

interface PostureCheckScreenProps {
  onPostureConfirmed: () => void;
  onBack: () => void;
  activityName: string;
}

const PostureCheckScreen = ({ onPostureConfirmed, onBack, activityName }: PostureCheckScreenProps) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [pose, setPose] = useState<any>(null);
  const [postureResult, setPostureResult] = useState<PostureCheckResult | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [autoStartTriggered, setAutoStartTriggered] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const countdownIntervalRef = useRef<number | null>(null);

  // Auto-start countdown when posture becomes ready
  useEffect(() => {
    if (isReady && !autoStartTriggered && countdown === null) {
      console.log('✅ Perfect posture detected! Auto-starting countdown...');
      setAutoStartTriggered(true);
      
      // Start countdown from 3
      setCountdown(3);
      
      // Clear any existing interval
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
      
      // Create new countdown interval
      let currentCount = 3;
      countdownIntervalRef.current = window.setInterval(() => {
        currentCount--;
        console.log('⏱️ Countdown:', currentCount);
        
        if (currentCount <= 0) {
          // Countdown finished
          console.log('✅ Countdown complete! Proceeding to workout...');
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
          }
          setCountdown(null);
          cleanup();
          onPostureConfirmed();
        } else {
          setCountdown(currentCount);
        }
      }, 1000);
    }
    
    // Reset auto-start trigger if posture is lost
    if (!isReady && autoStartTriggered && countdown === null) {
      console.log('⚠️ Posture lost, resetting auto-start trigger');
      setAutoStartTriggered(false);
    }
  }, [isReady, autoStartTriggered, countdown]);

  // Initialize camera on mount and when facing mode changes
  useEffect(() => {
    initializeCamera();
    return () => {
      cleanup();
    };
  }, [facingMode]);

  const initializeCamera = async () => {
    try {
      // Stop existing stream if any
      if (stream) {
        stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: facingMode }
      });
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      // Initialize MediaPipe Pose
      await initializeMediaPipe();
    } catch (error) {
      console.error('Camera access error:', error);
    }
  };

  const toggleCamera = () => {
    if (countdown !== null) return; // Don't allow switching during countdown
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    setAutoStartTriggered(false); // Reset auto-start when switching cameras
  };

  const initializeMediaPipe = async () => {
    try {
      // Wait for MediaPipe to be available
      if (typeof window !== 'undefined' && !window.Pose) {
        await new Promise((resolve) => {
          const checkInterval = setInterval(() => {
            if (window.Pose) {
              clearInterval(checkInterval);
              resolve(true);
            }
          }, 100);
          setTimeout(() => clearInterval(checkInterval), 10000);
        });
      }

      const poseInstance = new window.Pose({
        locateFile: (file: string) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
        }
      });

      poseInstance.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      poseInstance.onResults(onPoseResults);
      setPose(poseInstance);

      // Start processing
      processFrame(poseInstance);
    } catch (error) {
      console.error('MediaPipe initialization error:', error);
    }
  };

  const processFrame = async (poseInstance: any) => {
    if (!videoRef.current || !poseInstance) return;

    const video = videoRef.current;
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      await poseInstance.send({ image: video });
    }

    requestAnimationFrame(() => processFrame(poseInstance));
  };

  const onPoseResults = (results: any) => {
    // Draw on canvas
    if (canvasRef.current && videoRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d')!;
      
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;

      // Draw video frame
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

      // Check posture
      const landmarks = results.poseLandmarks?.map((lm: any) => ({
        x: lm.x,
        y: lm.y,
        z: lm.z || 0,
        visibility: lm.visibility || 1
      })) || null;

      const result = postureChecker.checkPosture(landmarks);
      setPostureResult(result);
      const ready = result.status === 'STANDING';
      setIsReady(ready);

      // Draw pose skeleton with themed colors (NO TEXT)
      if (results.poseLandmarks && window.drawConnectors && window.drawLandmarks) {
        // Determine color based on posture status
        let connectionColor = '#8B5CF6'; // Primary purple
        let landmarkColor = '#A78BFA'; // Lighter purple
        
        if (result.status === 'STANDING') {
          connectionColor = '#10B981'; // Green when ready
          landmarkColor = '#34D399'; // Lighter green
        } else if (result.status === 'FULL_BODY_NOT_VISIBLE') {
          connectionColor = '#F59E0B'; // Orange warning
          landmarkColor = '#FBBF24'; // Lighter orange
        } else if (result.status === 'NOT_STANDING') {
          connectionColor = '#EF4444'; // Red
          landmarkColor = '#F87171'; // Lighter red
        }

        // Draw connections (skeleton lines)
        window.drawConnectors(ctx, results.poseLandmarks, window.POSE_CONNECTIONS, {
          color: connectionColor,
          lineWidth: 5
        });
        
        // Draw landmarks (joint points)
        window.drawLandmarks(ctx, results.poseLandmarks, {
          color: landmarkColor,
          lineWidth: 3,
          radius: 8,
          fillColor: landmarkColor
        });
      }
    }
  };

  const cleanup = () => {
    console.log('🧹 Cleaning up...');
    
    // Clear countdown interval
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    
    // Stop camera stream
    if (stream) {
      stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
    }
    
    // Close MediaPipe
    if (pose) {
      pose.close();
    }
  };

  const getStatusIcon = () => {
    if (!postureResult) return <Camera className="w-8 h-8 text-gray-400" />;
    
    switch (postureResult.status) {
      case 'STANDING':
        return <CheckCircle2 className="w-8 h-8 text-green-500" />;
      case 'FULL_BODY_NOT_VISIBLE':
        return <AlertCircle className="w-8 h-8 text-orange-500" />;
      default:
        return <XCircle className="w-8 h-8 text-red-500" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black flex flex-col">
      {/* Video - Full Screen */}
      <div className="relative flex-1">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover opacity-0"
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        {/* Countdown Overlay */}
        {countdown !== null && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-50">
            <div className="text-white text-9xl font-bold animate-pulse">
              {countdown}
            </div>
          </div>
        )}

        {/* Header Overlay */}
        <div className="absolute top-0 left-0 right-0 z-40 bg-gradient-to-b from-black/80 to-transparent safe-top">
          <div className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg font-semibold text-white">Posture Check</h1>
                <p className="text-sm text-white/80">{activityName}</p>
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={toggleCamera} 
                  className="text-white hover:bg-white/20"
                  disabled={countdown !== null}
                  title="Switch Camera"
                >
                  <SwitchCamera className="w-5 h-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onBack} 
                  className="text-white hover:bg-white/20"
                  disabled={countdown !== null}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Status Overlay - Bottom */}
        <div className="absolute bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-black/90 via-black/70 to-transparent safe-bottom">
          <div className="px-4 py-6 space-y-4">
            {/* Status Message */}
            <div className="flex items-center space-x-3 bg-black/50 backdrop-blur-sm rounded-lg p-4">
              <div className="flex-shrink-0">
                {getStatusIcon()}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-1">
                  {postureResult?.status === 'STANDING' ? 'Perfect! Starting...' : 'Position Yourself'}
                </h3>
                <p className="text-sm text-white/80">
                  {postureResult?.message || 'Initializing camera...'}
                </p>
              </div>
            </div>

            {/* Requirements Checklist */}
            <div className="flex items-center justify-center space-x-6 text-sm text-white">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full transition-colors ${postureResult?.isFullBodyVisible ? 'bg-green-500' : 'bg-gray-500'}`} />
                <span>Full Body Visible</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full transition-colors ${postureResult?.isStanding ? 'bg-green-500' : 'bg-gray-500'}`} />
                <span>Standing Straight</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostureCheckScreen;

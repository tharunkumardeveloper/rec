import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle2, XCircle, AlertCircle, Camera } from 'lucide-react';
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    initializeCamera();
    return () => {
      cleanup();
    };
  }, []);

  const initializeCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' }
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

      // Draw pose landmarks
      if (results.poseLandmarks && window.drawConnectors && window.drawLandmarks) {
        window.drawConnectors(ctx, results.poseLandmarks, window.POSE_CONNECTIONS, {
          color: '#00FF00',
          lineWidth: 4
        });
        window.drawLandmarks(ctx, results.poseLandmarks, {
          color: '#FF0000',
          lineWidth: 2,
          radius: 6
        });
      }

      // Check posture
      const landmarks = results.poseLandmarks?.map((lm: any) => ({
        x: lm.x,
        y: lm.y,
        z: lm.z || 0,
        visibility: lm.visibility || 1
      })) || null;

      const result = postureChecker.checkPosture(landmarks);
      setPostureResult(result);
      setIsReady(result.status === 'STANDING');

      // Draw status text
      ctx.font = 'bold 32px Arial';
      ctx.fillStyle = result.color;
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.strokeText(result.message, 20, 50);
      ctx.fillText(result.message, 20, 50);

      // Draw knee angles if available
      if (result.leftKneeAngle && result.rightKneeAngle) {
        ctx.font = '20px Arial';
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        const angleText = `L: ${result.leftKneeAngle.toFixed(0)}° | R: ${result.rightKneeAngle.toFixed(0)}°`;
        ctx.strokeText(angleText, 20, 90);
        ctx.fillText(angleText, 20, 90);
      }
    }
  };

  const handleContinue = () => {
    if (!isReady) return;

    // Start countdown
    setCountdown(3);
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(countdownInterval);
          cleanup();
          onPostureConfirmed();
          return null;
        }
        return prev! - 1;
      });
    }, 1000);
  };

  const cleanup = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-primary border-b border-primary-dark safe-top">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div>
              <h1 className="text-lg font-semibold text-white">Posture Check</h1>
              <p className="text-sm text-white/80">{activityName}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onBack} className="text-white hover:bg-white/20">
              Cancel
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 space-y-6">
        {/* Video Preview */}
        <Card className="relative w-full max-w-2xl aspect-video bg-black overflow-hidden">
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
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="text-white text-9xl font-bold animate-pulse">
                {countdown}
              </div>
            </div>
          )}
        </Card>

        {/* Status Card */}
        <Card className="w-full max-w-2xl p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 mt-1">
              {getStatusIcon()}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">
                {postureResult?.status === 'STANDING' ? 'Ready to Start!' : 'Position Yourself'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {postureResult?.message || 'Initializing camera...'}
              </p>
              
              {/* Instructions */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${postureResult?.isFullBodyVisible ? 'bg-green-500' : 'bg-gray-400'}`} />
                  <span>Full body visible (head to feet)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${postureResult?.isStanding ? 'bg-green-500' : 'bg-gray-400'}`} />
                  <span>Standing straight with legs extended</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Action Button */}
        <Button
          size="lg"
          onClick={handleContinue}
          disabled={!isReady || countdown !== null}
          className="w-full max-w-2xl"
        >
          {countdown !== null ? 'Starting...' : isReady ? 'Continue to Workout' : 'Adjust Your Position'}
        </Button>
      </div>
    </div>
  );
};

export default PostureCheckScreen;

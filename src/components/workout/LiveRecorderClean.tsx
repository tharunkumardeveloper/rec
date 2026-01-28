import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { StopCircle, SwitchCamera, Play } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { PushupLiveDetector } from '@/services/workoutDetectors/PushupLiveDetector';

interface LiveRecorderCleanProps {
  activityName: string;
  onBack: () => void;
  onComplete: (results: any) => void;
}

const LiveRecorderClean = ({ activityName, onBack, onComplete }: LiveRecorderCleanProps) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [pose, setPose] = useState<any>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [repCount, setRepCount] = useState(0);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const detectorRef = useRef<PushupLiveDetector | null>(null);
  const recordingStartTimeRef = useRef<number>(0);
  const timerIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    initializeCamera();
    return () => {
      cleanup();
    };
  }, [facingMode]);

  const initializeCamera = async () => {
    try {
      if (stream) {
        stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: facingMode },
        audio: false
      });
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      await initializeMediaPipe();
    } catch (error) {
      console.error('Camera access error:', error);
      toast.error('Camera access denied');
    }
  };

  const initializeMediaPipe = async () => {
    try {
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

      // Initialize push-up detector
      if (activityName === 'Push-ups') {
        detectorRef.current = new PushupLiveDetector();
      }

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
    if (canvasRef.current && videoRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d')!;
      
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;

      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

      // Always show debug info on screen (not just when recording)
      if (results.poseLandmarks) {
        // Show detector status
        ctx.font = 'bold 16px Arial';
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        
        const statusY = canvas.height - 100;
        const statusText = isRecording ? '🔴 RECORDING' : '⚪ PREVIEW';
        ctx.strokeText(statusText, 15, statusY);
        ctx.fillText(statusText, 15, statusY);
        
        const detectorText = detectorRef.current ? '✅ Detector Ready' : '❌ No Detector';
        ctx.strokeText(detectorText, 15, statusY + 25);
        ctx.fillText(detectorText, 15, statusY + 25);
      }

      // Process with detector during recording
      if (isRecording && detectorRef.current && results.poseLandmarks) {
        // Set canvas dimensions for detector
        detectorRef.current.setDimensions(canvas.width, canvas.height);
        
        const currentTime = (Date.now() - recordingStartTimeRef.current) / 1000;
        const newRepCount = detectorRef.current.process(results.poseLandmarks, currentTime);
        setRepCount(newRepCount);
        
        // Get current metrics for display
        const metrics = detectorRef.current.getCurrentMetrics();
        
        // Draw metrics on canvas (Python HUD style)
        ctx.font = 'bold 24px Arial';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        
        let y = 40;
        const drawText = (text: string, color: string) => {
          ctx.fillStyle = color;
          ctx.strokeText(text, 15, y);
          ctx.fillText(text, 15, y);
          y += 35;
        };
        
        // Python: cv2.putText(frame, f"Reps: {len(reps)}", (10, draw_y), ...)
        drawText(`Reps: ${metrics.repCount}`, '#FFFF00');
        
        // Python: if elbow_angle: cv2.putText(frame, f"Elbow: {int(elbow_sm)}", ...)
        if (metrics.elbowAngle > 0) {
          const elbowColor = metrics.elbowAngle <= 75 ? '#00FF00' : '#FF0000';
          drawText(`Elbow: ${metrics.elbowAngle}°`, elbowColor);
        }
        
        // Python: if plank_angle: cv2.putText(frame, f"Plank: {int(plank_angle)}", ...)
        if (metrics.plankAngle > 0) {
          const plankColor = metrics.plankAngle >= 165 ? '#00FF00' : '#FF0000';
          drawText(`Plank: ${metrics.plankAngle}°`, plankColor);
        }
        
        // Python: if chest_depth: cv2.putText(frame, f"Depth: {int(chest_depth)}", ...)
        if (metrics.chestDepth !== 0) {
          const depthColor = metrics.chestDepth >= 40 ? '#00FF00' : '#FF0000';
          drawText(`Depth: ${metrics.chestDepth}`, depthColor);
        }
        
        // Python: cv2.putText(frame, f"State: {state}", ...)
        drawText(`State: ${metrics.state}`, '#C8C8C8');
      } else if (isRecording && !detectorRef.current) {
        // Detector not initialized
        ctx.font = 'bold 20px Arial';
        ctx.fillStyle = '#FF0000';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.strokeText('⚠️ Detector not initialized', 15, 40);
        ctx.fillText('⚠️ Detector not initialized', 15, 40);
      } else if (isRecording && !results.poseLandmarks) {
        // No pose detected
        ctx.font = 'bold 20px Arial';
        ctx.fillStyle = '#FFA500';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.strokeText('⚠️ No pose detected', 15, 40);
        ctx.fillText('⚠️ No pose detected', 15, 40);
      }

      if (results.poseLandmarks && window.drawConnectors && window.drawLandmarks) {
        const connectionColor = isRecording ? '#10B981' : '#8B5CF6';
        const landmarkColor = isRecording ? '#34D399' : '#A78BFA';

        window.drawConnectors(ctx, results.poseLandmarks, window.POSE_CONNECTIONS, {
          color: connectionColor,
          lineWidth: 5
        });
        
        window.drawLandmarks(ctx, results.poseLandmarks, {
          color: landmarkColor,
          lineWidth: 3,
          radius: 8,
          fillColor: landmarkColor
        });
      }
    }
  };

  const startRecording = () => {
    if (!stream || !canvasRef.current) return;

    try {
      const canvasStream = canvasRef.current.captureStream(30);
      mediaRecorderRef.current = new MediaRecorder(canvasStream, {
        mimeType: 'video/webm;codecs=vp8',
        videoBitsPerSecond: 2500000
      });

      chunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (e: BlobEvent) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      recordingStartTimeRef.current = Date.now();
      
      timerIntervalRef.current = window.setInterval(() => {
        setRecordingTime(Math.floor((Date.now() - recordingStartTimeRef.current) / 1000));
      }, 1000);

      // Reset detector
      if (detectorRef.current) {
        detectorRef.current.reset();
      }
      setRepCount(0);

      toast.success('Recording started');
    } catch (error) {
      console.error('Recording start error:', error);
      toast.error('Failed to start recording');
    }
  };

  const stopRecording = () => {
    if (!mediaRecorderRef.current || !isRecording) return;

    setIsProcessing(true);

    mediaRecorderRef.current.onstop = async () => {
      const videoBlob = new Blob(chunksRef.current, { type: 'video/webm' });
      
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }

      // Get results from detector
      const reps = detectorRef.current ? detectorRef.current.getReps() : [];
      const correctReps = reps.filter((r: any) => r.correct === true).length;
      
      const results = {
        videoBlob,
        reps: reps.length,
        setsCompleted: reps.length,
        correctReps,
        badSets: reps.length - correctReps,
        duration: recordingTime,
        posture: correctReps >= reps.length * 0.7 ? 'Good' : 'Bad',
        stats: {
          totalReps: reps.length,
          correctReps,
          incorrectReps: reps.length - correctReps
        },
        repDetails: reps,
        activityName
      };

      console.log('Recording complete:', results);
      cleanup();
      setIsProcessing(false);
      onComplete(results);
    };

    mediaRecorderRef.current.stop();
    setIsRecording(false);
  };

  const toggleCamera = () => {
    if (isRecording) return;
    setFacingMode((prev: string) => prev === 'user' ? 'environment' : 'user');
  };

  const cleanup = () => {
    if (stream) {
      stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
    }
    if (pose) {
      pose.close();
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black flex flex-col">
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

        <div className="absolute top-0 left-0 right-0 z-40 bg-gradient-to-b from-black/80 to-transparent safe-top">
          <div className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg font-semibold text-white">{activityName}</h1>
                <p className="text-sm text-white/80">
                  {isRecording ? 'Recording...' : 'Ready to record'}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={toggleCamera} 
                  className="text-white hover:bg-white/20"
                  disabled={isRecording}
                  title="Switch Camera"
                >
                  <SwitchCamera className="w-5 h-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onBack} 
                  className="text-white hover:bg-white/20"
                  disabled={isRecording}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-black/90 via-black/70 to-transparent safe-bottom">
          <div className="px-4 py-6 space-y-4">
            <div className="flex items-center justify-center space-x-8 text-white">
              <div className="text-center">
                <div className="text-4xl font-bold">{repCount}</div>
                <div className="text-sm text-white/80">Reps</div>
              </div>
              {isRecording && (
                <div className="text-center">
                  <div className="text-4xl font-bold">{formatTime(recordingTime)}</div>
                  <div className="text-sm text-white/80">Time</div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-center">
              {!isRecording ? (
                <Button
                  size="lg"
                  onClick={startRecording}
                  className="bg-green-600 hover:bg-green-700 px-8"
                  disabled={isProcessing}
                >
                  <Play className="w-5 h-5 mr-2" />
                  Start Recording
                </Button>
              ) : (
                <Button
                  size="lg"
                  onClick={stopRecording}
                  className="bg-red-600 hover:bg-red-700 px-8"
                >
                  <StopCircle className="w-5 h-5 mr-2" />
                  Stop Recording
                </Button>
              )}
            </div>
          </div>
        </div>

        {isRecording && (
          <div className="absolute top-20 left-4 z-40 flex items-center space-x-2 bg-red-600 px-3 py-2 rounded-full">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
            <span className="text-white text-sm font-semibold">REC</span>
          </div>
        )}

        {isProcessing && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-50">
            <div className="text-white text-center">
              <div className="text-2xl font-bold mb-2">Processing...</div>
              <div className="text-sm text-white/80">Please wait</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveRecorderClean;

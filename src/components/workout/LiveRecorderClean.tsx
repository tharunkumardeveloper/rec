import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { StopCircle, SwitchCamera } from 'lucide-react';
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
  const [countdown, setCountdown] = useState<number | null>(3); // Start with countdown
  const [isInitialized, setIsInitialized] = useState(false);
  const [showInstructionOverlay, setShowInstructionOverlay] = useState(true); // Show instruction first
  const [bodyDepthPercent, setBodyDepthPercent] = useState(50); // 0-100, 50 is middle
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const detectorRef = useRef<PushupLiveDetector | null>(null);
  const recordingStartTimeRef = useRef<number>(0);
  const timerIntervalRef = useRef<number | null>(null);
  const isRecordingRef = useRef<boolean>(false);
  const countdownIntervalRef = useRef<number | null>(null);
  const autoStartTriggeredRef = useRef<boolean>(false);

  useEffect(() => {
    initializeCamera();
    return () => {
      cleanup();
    };
  }, [facingMode]);

  // Auto-start countdown after initialization and instruction display
  useEffect(() => {
    if (isInitialized && !autoStartTriggeredRef.current && !showInstructionOverlay && countdown !== null && !isRecording) {
      autoStartTriggeredRef.current = true;
      
      let currentCount = 3;
      setCountdown(currentCount);
      
      countdownIntervalRef.current = window.setInterval(() => {
        currentCount--;
        
        if (currentCount <= 0) {
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
          }
          setCountdown(null);
          // Auto-start recording
          setTimeout(() => {
            startRecording();
          }, 100);
        } else {
          setCountdown(currentCount);
        }
      }, 1000);
    }
  }, [isInitialized, showInstructionOverlay]);

  // Auto-hide instruction overlay after 3 seconds
  useEffect(() => {
    if (isInitialized && showInstructionOverlay) {
      const timer = setTimeout(() => {
        setShowInstructionOverlay(false);
      }, 3000); // Show instruction for 3 seconds
      
      return () => clearTimeout(timer);
    }
  }, [isInitialized, showInstructionOverlay]);

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
      
      // Mark as initialized to trigger countdown
      setIsInitialized(true);
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

      // Process with detector during recording - USE REF NOT STATE
      if (isRecordingRef.current && detectorRef.current && results.poseLandmarks) {
        // Set canvas dimensions for detector
        detectorRef.current.setDimensions(canvas.width, canvas.height);
        
        const currentTime = (Date.now() - recordingStartTimeRef.current) / 1000;
        const newRepCount = detectorRef.current.process(results.poseLandmarks, currentTime);
        setRepCount(newRepCount);
        
        // Only show rep count on canvas - removed distracting metrics
        const metrics = detectorRef.current.getCurrentMetrics();
        
        ctx.font = 'bold 32px Arial';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 4;
        ctx.fillStyle = '#FFFF00';
        ctx.strokeText(`Reps: ${metrics.repCount}`, 20, 50);
        ctx.fillText(`Reps: ${metrics.repCount}`, 20, 50);
      }

      // Track body depth for visual indicator (during recording)
      if (isRecordingRef.current && results.poseLandmarks) {
        // Use shoulder midpoint Y position to track depth
        const leftShoulder = results.poseLandmarks[11];
        const rightShoulder = results.poseLandmarks[12];
        
        if (leftShoulder && rightShoulder) {
          const shoulderY = (leftShoulder.y + rightShoulder.y) / 2;
          // Convert Y position (0-1) to depth percentage (0-100)
          // Lower Y value = higher on screen = more dipped
          const depthPercent = Math.max(0, Math.min(100, shoulderY * 100));
          setBodyDepthPercent(depthPercent);
        }
      }

      if (results.poseLandmarks && window.drawConnectors && window.drawLandmarks) {
        // Change color based on recording state - USE REF
        const connectionColor = isRecordingRef.current ? '#10B981' : '#8B5CF6';
        const landmarkColor = isRecordingRef.current ? '#34D399' : '#A78BFA';

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
      isRecordingRef.current = true; // Update ref
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
    isRecordingRef.current = false; // Update ref
  };

  const toggleCamera = () => {
    if (isRecording) return;
    setFacingMode((prev: string) => prev === 'user' ? 'environment' : 'user');
  };

  const cleanup = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
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

        {/* Instruction Overlay - Shows pushup image */}
        {showInstructionOverlay && activityName === 'Push-ups' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-50">
            <div className="text-center space-y-6 px-6">
              <h2 className="text-3xl font-bold text-white mb-4">Get Into Position</h2>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border-2 border-white/20">
                <img 
                  src="/overlay/pushup.png"
                  alt="Push-up form" 
                  className="w-full max-w-md mx-auto rounded-xl shadow-2xl"
                />
              </div>
              <p className="text-xl text-white/90 font-semibold">
                Position yourself for push-ups
              </p>
              <p className="text-sm text-white/70">
                Recording will start automatically in a moment...
              </p>
            </div>
          </div>
        )}

        {/* Countdown Overlay */}
        {!showInstructionOverlay && countdown !== null && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-50">
            <div className="text-white text-9xl font-bold animate-pulse">
              {countdown}
            </div>
          </div>
        )}

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
                  disabled={isRecording || countdown !== null || showInstructionOverlay}
                  title="Switch Camera"
                >
                  <SwitchCamera className="w-5 h-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onBack} 
                  className="text-white hover:bg-white/20"
                  disabled={isRecording || countdown !== null || showInstructionOverlay}
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
              {isRecording ? (
                <Button
                  size="lg"
                  onClick={stopRecording}
                  className="bg-red-600 hover:bg-red-700 px-8"
                >
                  <StopCircle className="w-5 h-5 mr-2" />
                  Stop Recording
                </Button>
              ) : countdown !== null ? (
                <div className="text-white text-center">
                  <div className="text-lg font-semibold">Get Ready...</div>
                  <div className="text-sm text-white/80 mt-1">Starting in {countdown}</div>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {isRecording && (
          <div className="absolute top-20 left-4 z-40 flex items-center space-x-2 bg-red-600 px-3 py-2 rounded-full">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
            <span className="text-white text-sm font-semibold">REC</span>
          </div>
        )}

        {/* Depth Indicator - Right side center */}
        {isRecording && (
          <div className="absolute right-8 top-1/2 -translate-y-1/2 z-40">
            <div className="relative w-16 h-48 bg-black/40 backdrop-blur-sm rounded-full border-2 border-white/30 p-2">
              {/* Top reference line */}
              <div className="absolute left-2 right-2 top-8 h-1 bg-white/50 rounded-full" />
              
              {/* Middle reference line (target) */}
              <div className="absolute left-2 right-2 top-1/2 -translate-y-1/2 h-1.5 bg-green-400 rounded-full" />
              
              {/* Bottom reference line */}
              <div className="absolute left-2 right-2 bottom-8 h-1 bg-white/50 rounded-full" />
              
              {/* Moving indicator (user's position) */}
              <div 
                className="absolute left-1/2 -translate-x-1/2 w-10 h-3 bg-yellow-400 rounded-full transition-all duration-100 shadow-lg"
                style={{
                  top: `${bodyDepthPercent}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              />
              
              {/* Labels */}
              <div className="absolute -left-12 top-6 text-xs text-white/70 font-semibold">UP</div>
              <div className="absolute -left-16 bottom-6 text-xs text-white/70 font-semibold">DOWN</div>
            </div>
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

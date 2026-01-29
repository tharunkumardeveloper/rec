import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { StopCircle, SwitchCamera } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { PushupLiveDetector } from '@/services/workoutDetectors/PushupLiveDetector';
import { PullupLiveDetector } from '@/services/workoutDetectors/PullupLiveDetector';
import { SitupLiveDetector } from '@/services/workoutDetectors/SitupLiveDetector';
import { SquatLiveDetector } from '@/services/workoutDetectors/SquatLiveDetector';
import { VerticalJumpLiveDetector } from '@/services/workoutDetectors/VerticalJumpLiveDetector';
import { ShuttleRunLiveDetector } from '@/services/workoutDetectors/ShuttleRunLiveDetector';
import { SitReachLiveDetector } from '@/services/workoutDetectors/SitReachLiveDetector';
import { ttsCoach } from '@/services/ttsCoach';

type WorkoutDetector = PushupLiveDetector | PullupLiveDetector | SitupLiveDetector | SquatLiveDetector | VerticalJumpLiveDetector | ShuttleRunLiveDetector | SitReachLiveDetector;

interface LiveRecorderCleanProps {
  activityName: string;
  onBack: () => void;
  onComplete: (results: any) => void;
  initialFacingMode?: 'user' | 'environment';
}

const LiveRecorderClean = ({ activityName, onBack, onComplete, initialFacingMode = 'user' }: LiveRecorderCleanProps) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [pose, setPose] = useState<any>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [repCount, setRepCount] = useState(0);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>(initialFacingMode);
  const [isProcessing, setIsProcessing] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(3); // Start with countdown
  const [isInitialized, setIsInitialized] = useState(false);
  const [showInstructionOverlay, setShowInstructionOverlay] = useState(true); // Show instruction first
  const [bodyDepthPercent, setBodyDepthPercent] = useState(50); // 0-100, 50 is middle
  const [previousRepCount, setPreviousRepCount] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const detectorRef = useRef<WorkoutDetector | null>(null);
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
      console.log('📷 Initializing camera...');
      
      if (stream) {
        stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 640 }, 
          height: { ideal: 480 }, 
          facingMode: facingMode 
        },
        audio: false
      });
      
      console.log('✅ Camera stream obtained');
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        
        // Wait for video to be ready before initializing MediaPipe
        await new Promise<void>((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = () => {
              console.log('✅ Video metadata loaded');
              videoRef.current?.play().then(() => {
                console.log('✅ Video playing');
                resolve();
              }).catch(err => {
                console.error('Video play error:', err);
                resolve();
              });
            };
          }
        });
      }

      // Initialize MediaPipe after video is ready
      await initializeMediaPipe();
    } catch (error) {
      console.error('Camera access error:', error);
      toast.error('Camera access denied');
    }
  };

  const initializeMediaPipe = async () => {
    try {
      console.log('🔧 Initializing MediaPipe...');
      
      if (typeof window !== 'undefined' && !window.Pose) {
        console.log('⏳ Waiting for MediaPipe Pose to load...');
        await new Promise((resolve, reject) => {
          const checkInterval = setInterval(() => {
            if (window.Pose) {
              clearInterval(checkInterval);
              console.log('✅ MediaPipe Pose loaded');
              resolve(true);
            }
          }, 100);
          setTimeout(() => {
            clearInterval(checkInterval);
            reject(new Error('MediaPipe Pose load timeout'));
          }, 10000);
        });
      }

      console.log('🎯 Creating Pose instance...');
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

      // Initialize workout detector based on activity type
      console.log(`🏋️ Initializing detector for ${activityName}...`);
      switch (activityName) {
        case 'Push-ups':
          detectorRef.current = new PushupLiveDetector();
          break;
        case 'Pull-ups':
          detectorRef.current = new PullupLiveDetector();
          break;
        case 'Sit-ups':
          detectorRef.current = new SitupLiveDetector();
          break;
        case 'Squats':
          detectorRef.current = new SquatLiveDetector();
          break;
        case 'Vertical Jump':
          detectorRef.current = new VerticalJumpLiveDetector();
          break;
        case 'Shuttle Run':
        case 'Modified Shuttle Run':
          detectorRef.current = new ShuttleRunLiveDetector();
          break;
        case 'Sit Reach':
          detectorRef.current = new SitReachLiveDetector();
          break;
        default:
          console.warn(`No detector available for ${activityName}, using push-up detector as fallback`);
          detectorRef.current = new PushupLiveDetector();
      }

      console.log('🎬 Starting frame processing...');
      // Start processing immediately
      processFrame(poseInstance);

      // Mark as initialized to trigger countdown
      console.log('✅ Initialization complete!');
      setIsInitialized(true);
    } catch (error) {
      console.error('MediaPipe initialization error:', error);
      toast.error('Failed to initialize pose detection');
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

        // Update rep count and trigger TTS
        if (newRepCount > previousRepCount) {
          const reps = detectorRef.current.getReps();
          const lastRep = reps[reps.length - 1];
          const isCorrect = lastRep?.correct === true;
          ttsCoach.onRepCompleted(newRepCount, activityName, isCorrect);
          setPreviousRepCount(newRepCount);
        }

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
      setPreviousRepCount(0);

      // Announce workout start
      setTimeout(() => {
        ttsCoach.onWorkoutStart(activityName);
      }, 500);

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

      // Announce workout completion
      ttsCoach.onWorkoutEnd(reps.length, correctReps);

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
    // Stop TTS
    ttsCoach.stop();
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
          className="absolute inset-0 w-full h-full object-contain opacity-0"
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-contain"
        />

        {/* Instruction Overlay - Shows workout-specific image */}
        {showInstructionOverlay && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-50">
            <div className="text-center space-y-6 px-6 max-w-2xl">
              <h2 className="text-4xl font-bold text-white mb-4">Get Into Position</h2>
              <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10">
                <img
                  src={
                    activityName === 'Push-ups' ? '/pushup.gif' :
                      activityName === 'Squats' ? '/squat.webp' :
                        activityName === 'Pull-ups' ? '/pullup.gif' :
                          activityName === 'Sit-ups' ? '/situp.gif' :
                            '/pushup.gif' // fallback
                  }
                  alt={`${activityName} form demonstration`}
                  className="w-full h-auto mx-auto rounded-2xl"
                  style={{ maxHeight: '400px', objectFit: 'contain' }}
                  onError={(e) => {
                    console.error(`Failed to load ${activityName} image`);
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
              <p className="text-2xl text-white font-semibold">
                Position yourself for {activityName.toLowerCase()}
              </p>
              <p className="text-base text-white/80">
                Get into position • Recording starts automatically
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
          <div className="absolute right-6 top-1/2 -translate-y-1/2 z-40">
            <div className="relative w-1.5 h-64 bg-gradient-to-b from-purple-500/30 via-purple-500/20 to-purple-500/30 rounded-full backdrop-blur-sm">
              {/* Top marker */}
              <div className="absolute -left-2 top-0 w-5 h-0.5 bg-purple-400/60 rounded-full" />

              {/* Middle target line - Green theme */}
              <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-7 h-1 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full shadow-lg shadow-green-400/50" />

              {/* Bottom marker */}
              <div className="absolute -left-2 bottom-0 w-5 h-0.5 bg-purple-400/60 rounded-full" />

              {/* Moving position indicator - Purple theme */}
              <div
                className="absolute left-1/2 -translate-x-1/2 w-4 h-4 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full shadow-lg shadow-purple-500/50 transition-all duration-100 border-2 border-white/80"
                style={{
                  top: `${bodyDepthPercent}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <div className="absolute inset-0.5 bg-white/20 rounded-full" />
              </div>
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

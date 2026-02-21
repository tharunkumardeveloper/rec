import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { StopCircle, SwitchCamera, Play, Activity, Zap, Target } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { PushupLiveDetector } from '@/services/workoutDetectors/PushupLiveDetector';

interface LiveRecorderProProps {
  activityName: string;
  onBack: () => void;
  onComplete: (results: any) => void;
}

const LiveRecorderPro = ({ activityName, onBack, onComplete }: LiveRecorderProProps) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [pose, setPose] = useState<any>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [repCount, setRepCount] = useState(0);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentMetrics, setCurrentMetrics] = useState({
    elbowAngle: 0,
    plankAngle: 0,
    chestDepth: 0,
    state: 'IDLE'
  });
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const detectorRef = useRef<PushupLiveDetector | null>(null);
  const recordingStartTimeRef = useRef<number>(0);
  const timerIntervalRef = useRef<number | null>(null);
  const isRecordingRef = useRef<boolean>(false);

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
        video: { width: 1280, height: 720, facingMode: facingMode },
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

      if (isRecordingRef.current && detectorRef.current && results.poseLandmarks) {
        detectorRef.current.setDimensions(canvas.width, canvas.height);
        
        const currentTime = (Date.now() - recordingStartTimeRef.current) / 1000;
        const newRepCount = detectorRef.current.process(results.poseLandmarks, currentTime);
        setRepCount(newRepCount);
        
        const metrics = detectorRef.current.getCurrentMetrics();
        setCurrentMetrics(metrics);
      }

      if (results.poseLandmarks && window.drawConnectors && window.drawLandmarks) {
        const connectionColor = isRecordingRef.current ? '#10B981' : '#8B5CF6';
        const landmarkColor = isRecordingRef.current ? '#34D399' : '#A78BFA';

        window.drawConnectors(ctx, results.poseLandmarks, window.POSE_CONNECTIONS, {
          color: connectionColor,
          lineWidth: 4
        });
        
        window.drawLandmarks(ctx, results.poseLandmarks, {
          color: landmarkColor,
          lineWidth: 2,
          radius: 6,
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
      isRecordingRef.current = true;
      recordingStartTimeRef.current = Date.now();
      
      timerIntervalRef.current = window.setInterval(() => {
        setRecordingTime(Math.floor((Date.now() - recordingStartTimeRef.current) / 1000));
      }, 1000);

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
    isRecordingRef.current = false;
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

  const getMetricColor = (metric: string, value: number) => {
    if (metric === 'elbow') {
      return value > 0 && value <= 75 ? 'text-green-400' : 'text-red-400';
    }
    if (metric === 'plank') {
      return value >= 165 ? 'text-green-400' : 'text-red-400';
    }
    if (metric === 'depth') {
      return value >= 40 ? 'text-green-400' : 'text-red-400';
    }
    return 'text-gray-400';
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col">
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

        {/* Glassmorphic Header */}
        <div className="absolute top-0 left-0 right-0 z-40 bg-gradient-to-b from-black/60 via-black/40 to-transparent backdrop-blur-md border-b border-white/10">
          <div className="px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white tracking-tight">{activityName}</h1>
                  <p className="text-xs text-gray-300 font-medium">
                    {isRecording ? '🔴 Live Recording' : '⚡ Ready to Start'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={toggleCamera} 
                  className="text-white hover:bg-white/20 rounded-xl backdrop-blur-sm border border-white/10"
                  disabled={isRecording}
                  title="Switch Camera"
                >
                  <SwitchCamera className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onBack} 
                  className="text-white hover:bg-white/20 rounded-xl backdrop-blur-sm border border-white/10 px-4"
                  disabled={isRecording}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Live Metrics Overlay - Only during recording */}
        {isRecording && activityName === 'Push-ups' && (
          <div className="absolute top-24 left-6 z-40 space-y-3">
            {/* Rep Counter - Large and prominent */}
            <div className="bg-gradient-to-br from-purple-600/90 to-indigo-600/90 backdrop-blur-xl rounded-2xl px-6 py-4 shadow-2xl border border-white/20">
              <div className="flex items-center space-x-3">
                <Target className="w-6 h-6 text-white" />
                <div>
                  <div className="text-4xl font-black text-white">{repCount}</div>
                  <div className="text-xs font-semibold text-purple-200 uppercase tracking-wider">Reps</div>
                </div>
              </div>
            </div>

            {/* Form Metrics */}
            <div className="bg-black/60 backdrop-blur-xl rounded-2xl p-4 shadow-2xl border border-white/10 space-y-2">
              <div className="flex items-center space-x-2 mb-3">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">Form Analysis</span>
              </div>
              
              {currentMetrics.elbowAngle > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-300 font-medium">Elbow Angle</span>
                  <span className={`text-lg font-bold ${getMetricColor('elbow', currentMetrics.elbowAngle)}`}>
                    {currentMetrics.elbowAngle}°
                  </span>
                </div>
              )}
              
              {currentMetrics.plankAngle > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-300 font-medium">Body Alignment</span>
                  <span className={`text-lg font-bold ${getMetricColor('plank', currentMetrics.plankAngle)}`}>
                    {currentMetrics.plankAngle}°
                  </span>
                </div>
              )}
              
              {currentMetrics.chestDepth !== 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-300 font-medium">Depth Score</span>
                  <span className={`text-lg font-bold ${getMetricColor('depth', currentMetrics.chestDepth)}`}>
                    {currentMetrics.chestDepth}
                  </span>
                </div>
              )}
              
              <div className="pt-2 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400 font-medium">Status</span>
                  <span className="text-xs font-bold text-cyan-400 uppercase tracking-wide">
                    {currentMetrics.state}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recording Indicator */}
        {isRecording && (
          <div className="absolute top-24 right-6 z-40">
            <div className="bg-red-600/90 backdrop-blur-xl px-4 py-2 rounded-full shadow-2xl border border-red-400/30 flex items-center space-x-2">
              <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse" />
              <span className="text-white text-sm font-bold">REC</span>
              <span className="text-white/90 text-sm font-mono">{formatTime(recordingTime)}</span>
            </div>
          </div>
        )}

        {/* Bottom Control Panel */}
        <div className="absolute bottom-0 left-0 right-0 z-40">
          <div className="bg-gradient-to-t from-black/80 via-black/60 to-transparent backdrop-blur-xl border-t border-white/10">
            <div className="px-6 py-8 space-y-6">
              {/* Stats Display - Only when not recording or minimal when recording */}
              {!isRecording && (
                <div className="flex items-center justify-center space-x-6">
                  <div className="text-center px-6 py-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
                    <div className="text-3xl font-black text-white mb-1">{repCount}</div>
                    <div className="text-xs text-gray-300 font-semibold uppercase tracking-wider">Reps</div>
                  </div>
                  <div className="text-center px-6 py-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
                    <div className="text-3xl font-black text-white mb-1">{formatTime(recordingTime)}</div>
                    <div className="text-xs text-gray-300 font-semibold uppercase tracking-wider">Time</div>
                  </div>
                </div>
              )}

              {/* Control Button */}
              <div className="flex items-center justify-center">
                {!isRecording ? (
                  <Button
                    size="lg"
                    onClick={startRecording}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-12 py-7 rounded-2xl text-lg font-bold shadow-2xl border-2 border-green-400/30 transition-all duration-200 hover:scale-105"
                    disabled={isProcessing}
                  >
                    <Play className="w-6 h-6 mr-3 fill-current" />
                    Start Workout
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    onClick={stopRecording}
                    className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white px-12 py-7 rounded-2xl text-lg font-bold shadow-2xl border-2 border-red-400/30 transition-all duration-200 hover:scale-105"
                  >
                    <StopCircle className="w-6 h-6 mr-3 fill-current" />
                    Finish Workout
                  </Button>
                )}
              </div>

              {/* Helper Text */}
              {!isRecording && (
                <p className="text-center text-sm text-gray-400 font-medium">
                  Position yourself in frame and press start when ready
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Processing Overlay */}
        {isProcessing && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/90 backdrop-blur-sm z-50">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <div>
                <div className="text-2xl font-bold text-white mb-2">Processing Your Workout</div>
                <div className="text-sm text-gray-400">Analyzing performance data...</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveRecorderPro;

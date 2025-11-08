import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Video, StopCircle, Camera } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { mediapipeProcessor } from '@/services/mediapipeProcessor';

interface LiveRecorderProps {
  activityName: string;
  onBack: () => void;
  onComplete: (results: any) => void;
}

const LiveRecorder = ({ activityName, onBack, onComplete }: LiveRecorderProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(true);
  const [currentReps, setCurrentReps] = useState(0);
  const [currentMetrics, setCurrentMetrics] = useState<any>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [allReps, setAllReps] = useState<any[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const processedFramesRef = useRef<ImageData[]>([]);
  const startTimeRef = useRef<number>(0);

  // Start camera preview
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: false
      });
      
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
      
      toast.success('Camera ready!');
    } catch (error) {
      console.error('Camera error:', error);
      toast.error('Failed to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
    }
  };

  const startRecording = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsPreviewing(false);
    setIsRecording(true);
    setRecordingTime(0);
    setCurrentReps(0);
    setAllReps([]);
    recordedChunksRef.current = [];
    processedFramesRef.current = [];
    startTimeRef.current = Date.now();

    // Setup canvas dimensions
    canvasRef.current.width = 1280;
    canvasRef.current.height = 720;

    // Setup MediaRecorder to record the canvas
    const canvasStream = canvasRef.current.captureStream(30);
    const recorder = new MediaRecorder(canvasStream, {
      mimeType: 'video/webm;codecs=vp9',
      videoBitsPerSecond: 2500000
    });

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        recordedChunksRef.current.push(e.data);
      }
    };

    recorder.start();
    mediaRecorderRef.current = recorder;

    // Start recording timer
    recordingIntervalRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);

    try {
      // Start MediaPipe live processing
      await mediapipeProcessor.processLiveCamera(
        videoRef.current,
        activityName,
        (canvas, reps, stats) => {
          // Draw processed frame to canvas (with skeleton overlay)
          if (canvasRef.current && canvas) {
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) {
              ctx.drawImage(canvas, 0, 0, canvasRef.current.width, canvasRef.current.height);
            }
          }
          
          // Store all reps data
          setAllReps(reps);
          
          // Update metrics
          setCurrentReps(reps.length);
          setCurrentMetrics(stats);
        },
        () => {
          // On complete callback
          console.log('Live processing complete');
        }
      );
    } catch (error) {
      console.error('Recording error:', error);
      toast.error('Failed to start recording');
      setIsRecording(false);
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
    }

    // Stop MediaPipe processing
    if ((window as any).stopLiveProcessing) {
      (window as any).stopLiveProcessing();
    }

    // Stop MediaRecorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      
      // Wait for final data
      await new Promise<void>((resolve) => {
        if (mediaRecorderRef.current) {
          mediaRecorderRef.current.onstop = () => {
            resolve();
          };
        }
        setTimeout(() => resolve(), 1000);
      });
    }

    toast.success('Processing recording...');
    
    // Create video blob from recorded chunks
    const videoBlob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
    console.log('Created recording blob:', videoBlob.size, 'bytes');
    
    if (videoBlob.size === 0) {
      toast.error('Recording failed - no data captured');
      return;
    }

    // Create video URL
    const videoUrl = URL.createObjectURL(videoBlob);
    
    // Calculate stats from live recording
    const correctReps = allReps.filter(r => r.correct === true || r.correct === 'True').length;
    const incorrectReps = allReps.length - correctReps;
    const posture: 'Good' | 'Bad' = correctReps >= allReps.length * 0.7 ? 'Good' : 'Bad';

    const formatDuration = (seconds: number): string => {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Build complete results object (same format as VideoProcessor)
    const results = {
      type: posture === 'Good' ? 'good' : 'bad',
      posture,
      setsCompleted: allReps.length,
      badSets: incorrectReps,
      duration: formatDuration(recordingTime),
      videoUrl,
      stats: {
        totalReps: allReps.length,
        correctReps,
        incorrectReps,
        csvData: allReps,
        totalTime: recordingTime
      }
    };

    console.log('Live recording results:', results);
    onComplete(results);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-subtle border-b safe-top">
        <div className="px-4 py-4">
          <div className="flex items-center space-x-3 max-w-4xl mx-auto">
            <Button variant="ghost" size="sm" onClick={onBack} className="tap-target">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-lg font-semibold">
                {isPreviewing ? 'Camera Preview' : 'Recording'} - {activityName}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isPreviewing ? 'Check your position' : 'Live AI Analysis'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pb-20 max-w-4xl mx-auto pt-6 space-y-6">
        {/* Camera/Canvas Display */}
        <Card className="card-elevated">
          <CardContent className="p-4">
            <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
              {/* Video preview (hidden during recording) */}
              <video
                ref={videoRef}
                className={`w-full h-full object-contain ${isPreviewing ? '' : 'hidden'}`}
                playsInline
                muted
              />
              
              {/* Canvas for live analysis */}
              <canvas
                ref={canvasRef}
                className={`w-full h-full object-contain ${isPreviewing ? 'hidden' : ''}`}
                width={1280}
                height={720}
              />

              {/* Recording indicator */}
              {isRecording && (
                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-2">
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                  <span>REC {formatTime(recordingTime)}</span>
                </div>
              )}

              {/* Preview indicator */}
              {isPreviewing && (
                <div className="absolute top-4 left-4 bg-primary/90 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-2">
                  <Camera className="w-4 h-4" />
                  <span>Preview</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Live Metrics (only during recording) */}
        {isRecording && (
          <Card className="card-elevated">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Live Metrics</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 rounded-lg bg-secondary/30">
                  <div className="text-2xl font-bold mb-1">{currentReps}</div>
                  <p className="text-xs text-muted-foreground">
                    {activityName.includes('Jump') ? 'Jumps' : 'Reps'}
                  </p>
                </div>
                
                <div className="text-center p-3 rounded-lg bg-secondary/30">
                  <div className="text-2xl font-bold mb-1">
                    {currentMetrics?.correctCount || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Correct Form</p>
                </div>
                
                {currentMetrics?.minAngle && (
                  <div className="text-center p-3 rounded-lg bg-secondary/30">
                    <div className="text-2xl font-bold mb-1">
                      {Math.round(currentMetrics.minAngle)}°
                    </div>
                    <p className="text-xs text-muted-foreground">Current Angle</p>
                  </div>
                )}
                
                <div className="text-center p-3 rounded-lg bg-secondary/30">
                  <div className="text-2xl font-bold mb-1">{formatTime(recordingTime)}</div>
                  <p className="text-xs text-muted-foreground">Duration</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        {isPreviewing && (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4">
              <p className="text-sm text-center mb-2 font-semibold">
                📹 Position yourself in frame
              </p>
              <p className="text-xs text-center text-muted-foreground">
                Make sure your full body is visible. When ready, click "Start Recording" to begin your workout with real-time AI analysis.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Control Buttons */}
        <div className="flex gap-3">
          {isPreviewing ? (
            <Button
              onClick={startRecording}
              className="flex-1 btn-hero"
              size="lg"
            >
              <Video className="w-5 h-5 mr-2" />
              Start Recording
            </Button>
          ) : (
            <Button
              onClick={stopRecording}
              variant="destructive"
              className="flex-1"
              size="lg"
            >
              <StopCircle className="w-5 h-5 mr-2" />
              Stop & Finish
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveRecorder;

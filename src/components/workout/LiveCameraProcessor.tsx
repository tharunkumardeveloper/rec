import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Square, Play } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { mediapipeProcessor } from '@/services/mediapipeProcessor';

interface LiveCameraProcessorProps {
  activityName: string;
  onBack: () => void;
  onComplete: (videoFile: File) => void;
}

const LiveCameraProcessor = ({ activityName, onBack, onComplete }: LiveCameraProcessorProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [currentReps, setCurrentReps] = useState(0);
  const [correctReps, setCorrectReps] = useState(0);
  const [incorrectReps, setIncorrectReps] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isCleaningUpRef = useRef(false);

  useEffect(() => {
    let mounted = true;
    
    const init = async () => {
      if (mounted) {
        await startCamera();
      }
    };
    
    init();
    
    return () => {
      mounted = false;
      cleanup();
    };
  }, []);

  const startCamera = async () => {
    try {
      setIsInitializing(true);
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: false
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Wait for video to be ready
        await new Promise<void>((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = async () => {
              try {
                await videoRef.current?.play();
                resolve();
              } catch (err) {
                console.error('Error playing video:', err);
                resolve();
              }
            };
          }
        });
        
        // Small delay to ensure video is playing
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Start live processing preview
        await startLivePreview();
        
        setIsInitializing(false);
        toast.success('Live analysis ready! 🎯');
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setIsInitializing(false);
      toast.error('Unable to access camera. Please check permissions.');
      setTimeout(() => onBack(), 2000);
    }
  };

  const startLivePreview = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    // Wait for video to be ready
    await new Promise<void>((resolve) => {
      if (videoRef.current!.readyState >= 2) {
        resolve();
      } else {
        videoRef.current!.onloadeddata = () => resolve();
      }
    });

    // Set canvas size to match video
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    try {
      await mediapipeProcessor.processLiveCamera(
        video,
        activityName,
        (processedCanvas, reps, stats) => {
          // Copy the processed canvas (with skeleton) to display canvas
          const ctx = canvas.getContext('2d');
          if (ctx && processedCanvas) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(processedCanvas, 0, 0, canvas.width, canvas.height);
          }
          
          // Update stats
          setCurrentReps(reps.length);
          setCorrectReps(stats.correctCount);
          setIncorrectReps(stats.incorrectCount);
        },
        () => {
          // Processing stopped
        }
      );
    } catch (error) {
      console.error('Error starting live preview:', error);
      toast.error('Failed to start live analysis');
    }
  };

  const startRecording = () => {
    if (!streamRef.current || !canvasRef.current || isRecording || isInitializing) {
      return;
    }

    try {
      // Record from canvas (with skeleton overlay)
      const canvasStream = canvasRef.current.captureStream(30);
      
      // Try different codecs for better compatibility
      let options: MediaRecorderOptions;
      if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
        options = { mimeType: 'video/webm;codecs=vp9', videoBitsPerSecond: 2500000 };
      } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
        options = { mimeType: 'video/webm;codecs=vp8', videoBitsPerSecond: 2500000 };
      } else {
        options = { mimeType: 'video/webm', videoBitsPerSecond: 2500000 };
      }
      
      mediaRecorderRef.current = new MediaRecorder(canvasStream, options);
      recordedChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        if (isCleaningUpRef.current) return;
        
        setIsProcessing(true);
        
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const file = new File([blob], `${activityName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.webm`, {
          type: 'video/webm'
        });
        
        // Save to localStorage
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result as string;
          localStorage.setItem(`recorded_video_${Date.now()}`, base64data);
        };
        reader.readAsDataURL(blob);
        
        // Small delay before completing
        setTimeout(() => {
          onComplete(file);
        }, 300);
      };

      mediaRecorderRef.current.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        toast.error('Recording error occurred');
        setIsRecording(false);
      };

      mediaRecorderRef.current.start(100); // Collect data every 100ms
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      toast.success('🔴 Recording started!');
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start recording');
    }
  };

  const stopRecording = () => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state !== 'recording' || !isRecording) {
      return;
    }

    try {
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      mediaRecorderRef.current.stop();
      
      toast.success('✅ Recording complete! Processing...');
      
      // Cleanup after a delay
      setTimeout(() => {
        cleanup();
      }, 1000);
    } catch (error) {
      console.error('Error stopping recording:', error);
      toast.error('Error stopping recording');
    }
  };

  const cleanup = () => {
    if (isCleaningUpRef.current) return;
    isCleaningUpRef.current = true;
    
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          try {
            track.stop();
          } catch (e) {
            console.error('Error stopping track:', e);
          }
        });
        streamRef.current = null;
      }
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        try {
          mediaRecorderRef.current.stop();
        } catch (e) {
          console.error('Error stopping recorder:', e);
        }
      }
      
      mediapipeProcessor.cleanup();
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <div className="p-4 bg-black/80 backdrop-blur-sm">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
          <div className="text-white text-center">
            <h2 className="font-semibold">{activityName}</h2>
            <p className="text-xs opacity-80">Live Analysis</p>
          </div>
          <div className="w-20" /> {/* Spacer */}
        </div>
      </div>

      {/* Camera View with Overlay */}
      <div className="flex-1 relative bg-black flex items-center justify-center">
        {/* Hidden video element */}
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="hidden"
        />
        
        {/* Canvas with skeleton overlay - this is what user sees */}
        <canvas
          ref={canvasRef}
          className="max-w-full max-h-full object-contain"
          style={{ display: 'block' }}
        />

        {/* Recording Indicator */}
        {isRecording && (
          <div className="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 rounded-full flex items-center space-x-2 animate-pulse">
            <div className="w-3 h-3 bg-white rounded-full"></div>
            <span className="font-mono font-bold">{formatTime(recordingTime)}</span>
          </div>
        )}

        {/* Stats Overlay */}
        <div className="absolute top-4 right-4 bg-black/70 text-white p-4 rounded-lg space-y-2 min-w-[200px]">
          <div className="text-center">
            <div className="text-3xl font-bold text-cyan-400">{currentReps}</div>
            <div className="text-xs opacity-80">Total Reps</div>
          </div>
          <div className="flex justify-between text-sm">
            <div>
              <div className="text-green-400 font-bold">{correctReps}</div>
              <div className="text-xs opacity-80">Correct</div>
            </div>
            <div>
              <div className="text-red-400 font-bold">{incorrectReps}</div>
              <div className="text-xs opacity-80">Incorrect</div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        {!isRecording && !isInitializing && !isProcessing && (
          <div className="absolute bottom-24 left-0 right-0 text-center px-4">
            <Card className="mx-auto max-w-md bg-black/70 border-white/20 backdrop-blur-sm">
              <CardContent className="p-4 text-white">
                <p className="text-sm mb-2">✨ Live skeleton tracking active</p>
                <p className="text-xs opacity-80">Position yourself and click Record to start</p>
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* Initializing Overlay */}
        {isInitializing && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
            <Card className="bg-black/80 border-white/20">
              <CardContent className="p-6 text-center text-white">
                <div className="w-16 h-16 mx-auto mb-4 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                <p className="text-lg font-semibold mb-2">Initializing Camera</p>
                <p className="text-sm opacity-80">Setting up AI analysis...</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-6 bg-black/80 backdrop-blur-sm safe-bottom">
        <div className="flex justify-center items-center space-x-4 max-w-4xl mx-auto">
          {isInitializing ? (
            <Button
              size="lg"
              disabled
              className="bg-gray-500 text-white px-12 py-6 text-lg rounded-full cursor-not-allowed"
            >
              <div className="w-6 h-6 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Initializing...
            </Button>
          ) : isProcessing ? (
            <Button
              size="lg"
              disabled
              className="bg-blue-500 text-white px-12 py-6 text-lg rounded-full cursor-not-allowed"
            >
              <div className="w-6 h-6 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Processing...
            </Button>
          ) : !isRecording ? (
            <Button
              size="lg"
              onClick={startRecording}
              disabled={isInitializing}
              className="bg-red-500 hover:bg-red-600 active:bg-red-700 text-white px-12 py-6 text-lg rounded-full transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="w-6 h-6 mr-2" />
              Start Recording
            </Button>
          ) : (
            <Button
              size="lg"
              onClick={stopRecording}
              disabled={isProcessing}
              className="bg-red-600 hover:bg-red-700 active:bg-red-800 text-white px-12 py-6 text-lg rounded-full transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Square className="w-6 h-6 mr-2" />
              Stop & Save
            </Button>
          )}
        </div>
        
        <p className="text-center text-white/60 text-xs mt-4">
          {isInitializing 
            ? '⏳ Setting up camera and AI analysis...'
            : isProcessing
            ? '⚙️ Saving your workout video...'
            : '💡 The skeleton overlay will be included in your recorded video'
          }
        </p>
      </div>
    </div>
  );
};

export default LiveCameraProcessor;

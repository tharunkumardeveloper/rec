import { useState, useRef, useEffect } from 'react';
import { Camera, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface FaceVerificationScreenProps {
  onVerified: () => void;
  onFailed: () => void;
  athleteId: string;
  athleteName: string;
}

type VerificationStep = 'init' | 'detecting' | 'liveness' | 'comparing' | 'success' | 'failed';

export default function FaceVerificationScreen({
  onVerified,
  onFailed,
  athleteId,
  athleteName
}: FaceVerificationScreenProps) {
  const [step, setStep] = useState<VerificationStep>('init');
  const [blinkCount, setBlinkCount] = useState(0);
  const [confidence, setConfidence] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [retryCountdown, setRetryCountdown] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    startVerification();
    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    if (retryCountdown > 0) {
      const timer = setTimeout(() => setRetryCountdown(retryCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [retryCountdown]);

  const startVerification = async () => {
    try {
      setStep('detecting');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        await videoRef.current.play();
        
        // Wait for face detection
        setTimeout(() => {
          setStep('liveness');
        }, 1000);
      }
    } catch (error) {
      console.error('Camera access error:', error);
      setErrorMessage('Camera access denied');
      handleFailure();
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const captureFaceImage = (): string | null => {
    if (!videoRef.current || !canvasRef.current) return null;
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    
    ctx.drawImage(video, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.8);
  };

  const performLivenessCheck = () => {
    // Simulate blink detection (in production, use ML Kit)
    const checkInterval = setInterval(() => {
      setBlinkCount(prev => {
        const newCount = prev + 1;
        if (newCount >= 2) {
          clearInterval(checkInterval);
          performFaceComparison();
        }
        return newCount;
      });
    }, 1500);
  };

  useEffect(() => {
    if (step === 'liveness') {
      performLivenessCheck();
    }
  }, [step]);

  const performFaceComparison = async () => {
    setStep('comparing');
    
    const faceImage = captureFaceImage();
    if (!faceImage) {
      setErrorMessage('Failed to capture face image');
      handleFailure();
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/verify-face`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          athleteId,
          liveImage: faceImage
        })
      });

      const result = await response.json();

      if (result.verified && result.confidence >= 0.85) {
        setConfidence(result.confidence * 100);
        setStep('success');
        stopCamera();
        
        // Auto-proceed after 2 seconds
        setTimeout(() => {
          onVerified();
        }, 2000);
      } else {
        setErrorMessage(result.message || 'Face verification failed');
        handleFailure();
      }
    } catch (error) {
      console.error('Verification error:', error);
      setErrorMessage('Verification service unavailable');
      handleFailure();
    }
  };

  const handleFailure = () => {
    setStep('failed');
    stopCamera();
    setRetryCountdown(10);
    
    setTimeout(() => {
      onFailed();
    }, 10000);
  };

  const handleRetry = () => {
    setStep('init');
    setBlinkCount(0);
    setConfidence(0);
    setErrorMessage('');
    setRetryCountdown(0);
    startVerification();
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-violet-950 via-purple-900 to-indigo-950 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-black/40 backdrop-blur-xl border-violet-500/30 p-8">
        <div className="text-center space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-white">Identity Verification</h1>
            <p className="text-violet-300">Athlete: {athleteName}</p>
          </div>

          {/* Video Feed */}
          <div className="relative mx-auto w-full max-w-md aspect-video bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
            />
            <canvas ref={canvasRef} className="hidden" />
            
            {/* Face Scanner Overlay */}
            {(step === 'detecting' || step === 'liveness' || step === 'comparing') && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-64 h-64">
                  <div className="absolute inset-0 border-4 border-violet-500 rounded-full animate-pulse" />
                  <div className="absolute inset-4 border-4 border-purple-400 rounded-full animate-ping" />
                  <div className="absolute inset-8 border-4 border-indigo-300 rounded-full animate-pulse" />
                </div>
              </div>
            )}
          </div>

          {/* Status Messages */}
          <div className="space-y-4">
            {step === 'detecting' && (
              <div className="flex items-center justify-center gap-3 text-violet-300">
                <Camera className="w-6 h-6 animate-pulse" />
                <p className="text-lg">Detecting face...</p>
              </div>
            )}

            {step === 'liveness' && (
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-3 text-yellow-300">
                  <AlertTriangle className="w-6 h-6" />
                  <p className="text-lg font-semibold">Please blink twice</p>
                </div>
                <div className="flex justify-center gap-2">
                  {[1, 2].map(i => (
                    <div
                      key={i}
                      className={`w-4 h-4 rounded-full ${
                        blinkCount >= i ? 'bg-green-500' : 'bg-gray-600'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {step === 'comparing' && (
              <div className="flex items-center justify-center gap-3 text-blue-300">
                <div className="w-6 h-6 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
                <p className="text-lg">Verifying identity...</p>
              </div>
            )}

            {step === 'success' && (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-3 text-green-400">
                  <CheckCircle className="w-12 h-12" />
                  <p className="text-2xl font-bold">Identity Verified!</p>
                </div>
                <div className="text-green-300">
                  <p className="text-lg">Confidence: {confidence.toFixed(1)}%</p>
                  <p className="text-sm mt-2">Proceeding to workout...</p>
                </div>
              </div>
            )}

            {step === 'failed' && (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-3 text-red-400">
                  <XCircle className="w-12 h-12" />
                  <p className="text-2xl font-bold">Verification Failed</p>
                </div>
                <div className="text-red-300 space-y-2">
                  <p className="text-lg font-semibold">⚠️ Substitution Detected</p>
                  <p className="text-sm">{errorMessage}</p>
                  {retryCountdown > 0 && (
                    <p className="text-sm">Retry available in {retryCountdown}s</p>
                  )}
                </div>
                {retryCountdown === 0 && (
                  <Button
                    onClick={handleRetry}
                    className="bg-violet-600 hover:bg-violet-700"
                  >
                    Try Again
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Security Notice */}
          <div className="text-xs text-violet-400/60 border-t border-violet-500/20 pt-4">
            <p>🔒 This verification ensures fair competition and prevents substitution</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

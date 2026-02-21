import { useState, useEffect, memo } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Target, CheckCircle, XCircle, Play, Download, ExternalLink } from 'lucide-react';
import { mediapipeProcessor } from '@/services/mediapipeProcessor';
import { toast } from '@/components/ui/sonner';
import TestSkeletonRenderer from '@/components/test/TestSkeletonRenderer';

// Memoized Metric Box Component for better performance
interface TestMetricBoxProps {
  value: string | number;
  label: string;
  color?: string;
}

const TestMetricBox = memo(({ value, label, color }: TestMetricBoxProps) => (
  <div className="bg-gray-900/50 border border-red-500/30 rounded-xl p-4 lg:p-6 text-center shadow-sm">
    <div className={`text-3xl lg:text-4xl font-bold ${color || 'text-red-100'}`}>
      {value}
    </div>
    <div className="text-xs lg:text-sm text-red-200 mt-2 font-medium">
      {label}
    </div>
  </div>
));

TestMetricBox.displayName = 'TestMetricBox';

interface TestVideoProcessorProps {
  videoElement: HTMLVideoElement;
  activityName: string;
  onBack: () => void;
  onComplete: (results: any) => void;
}

const TestVideoProcessor = ({ 
  videoElement, 
  activityName, 
  onBack, 
  onComplete 
}: TestVideoProcessorProps) => {
  const [isProcessing, setIsProcessing] = useState(true);
  const [progress, setProgress] = useState(0);
  const [processedData, setProcessedData] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (!videoElement) {
      toast.error('No video element found');
      onBack();
      return;
    }

    processVideo();
  }, []);

  const processVideo = async () => {
    try {
      console.log('🎯 Starting Test Mode processing...');
      
      // Create a blob from the video element's source
      const videoUrl = videoElement.src;
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      const file = new File([blob], `${activityName}.mp4`, { type: 'video/mp4' });

      // Process video with MediaPipe in TEST MODE
      const processingResult = await mediapipeProcessor.processVideo(
        file,
        activityName,
        (prog) => {
          setProgress(Math.floor(prog));
        },
        true  // isTestMode = true for optimized processing
      );

      console.log('✅ Processing complete');
      
      // Get landmarks from processing result
      const poseLandmarks = processingResult.poseLandmarks || [];
      console.log('📊 Received', poseLandmarks.length, 'landmark frames');
      const framesWithPose = poseLandmarks.filter((f: any[]) => f.length > 0).length;
      console.log('📊 Frames with valid pose data:', framesWithPose);

      // Validate that we have landmarks
      if (poseLandmarks.length === 0) {
        console.error('❌ No pose landmarks captured during processing');
        toast.error('Failed to extract pose data. Please try again.');
        onBack();
        return;
      }

      // Extract metrics
      const reps = processingResult.reps?.length || 0;
      const time = processingResult.totalTime || 0;
      const correctReps = processingResult.correctReps || reps;
      const totalReps = processingResult.reps?.length || reps;
      const badReps = totalReps - correctReps;
      const formScore = totalReps > 0 ? Math.round((correctReps / totalReps) * 100) : 0;
      const posture = formScore >= 70 ? 'Good' : 'Needs Improvement';

      const results = {
        activityName,
        totalReps,
        correctReps,
        badReps,
        duration: `${Math.floor(time / 60)}:${(time % 60).toString().padStart(2, '0')}`,
        posture,
        formScore,
        timestamp: Date.now(),
        isTestMode: true,
        poseLandmarks,
        videoBlob: blob,
        setsCompleted: totalReps
      };

      setProcessedData(results);
      setIsProcessing(false);
      setShowResults(true);
    } catch (error) {
      console.error('❌ Processing error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Processing failed: ${errorMessage}`);
      onBack();
    }
  };

  const handleComplete = () => {
    if (processedData) {
      onComplete(processedData);
    }
  };

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-950 via-gray-900 to-black">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-red-950/90 backdrop-blur-xl border-b border-red-500/30 transform-gpu">
          <div className="px-4 py-4">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onBack}
                className="text-red-300 hover:text-red-100 hover:bg-red-900/50"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-red-400" />
                <h1 className="text-lg lg:text-xl font-semibold text-red-100">Processing {activityName}</h1>
              </div>
              <div className="w-10" />
            </div>
          </div>
        </div>

        <div className="px-4 pb-20 lg:pb-8 max-w-7xl mx-auto pt-6 space-y-6">
          {/* Mobile: Vertical Stack, Desktop: Centered Layout */}
          <div className="flex flex-col gap-6">
            {/* 1. Live Processing Section - TOP (Mobile Order 1) - BRIGHT RED GRADIENT WITH BLACK TEXT */}
            <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-xl p-6 shadow-sm order-1">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-black rounded-full animate-pulse"></div>
                  <h3 className="text-base lg:text-lg font-semibold text-black">Live Processing</h3>
                </div>
              </div>
              <div className="aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center">
                <div className="text-center">
                  <div className="text-7xl mb-4">🎯</div>
                  <p className="text-black text-sm font-semibold bg-white/90 px-3 py-1 rounded">Real-time skeleton tracking and rep counting</p>
                </div>
              </div>
            </div>

            {/* 2. Processing Progress Section - SECOND (Mobile Order 2) - BRIGHT RED GRADIENT WITH BLACK BOLD TEXT, WHITE PROGRESS */}
            <div className="bg-gradient-to-r from-red-600 via-red-500 to-red-600 rounded-xl p-6 shadow-sm order-2" style={{ background: 'linear-gradient(to right, #dc2626, #ef4444, #dc2626)' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-base lg:text-lg font-bold" style={{ color: '#000000' }}>Processing Progress</h3>
                  <p className="text-sm font-bold mt-1" style={{ color: '#000000' }}>
                    {progress < 30 && "Analyzing your workout..."}
                    {progress >= 30 && progress < 60 && "Extracting pose data..."}
                    {progress >= 60 && progress < 90 && "Calculating metrics..."}
                    {progress >= 90 && "Almost ready..."}
                  </p>
                </div>
                <div className="text-3xl lg:text-4xl font-bold ml-4" style={{ color: '#ffffff' }}>{progress}%</div>
              </div>
              <div 
                className="h-3 rounded-full overflow-hidden border-2"
                style={{ backgroundColor: '#ffffff', borderColor: '#000000' }}
              >
                <div 
                  className="h-full transition-all duration-300 ease-out"
                  style={{ 
                    width: `${progress}%`, 
                    backgroundColor: '#000000',
                    minHeight: '100%'
                  }}
                />
              </div>
              
              {/* Processing Steps - BLACK BOLD TEXT */}
              <div className="space-y-2 text-sm lg:text-base mt-4">
                <div className="flex items-center space-x-2 font-bold" style={{ color: '#000000' }}>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#000000' }}></div>
                  <p>Detecting body landmarks with MediaPipe</p>
                </div>
                <div className="flex items-center space-x-2 font-bold" style={{ color: '#000000' }}>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#000000' }}></div>
                  <p>Tracking joint angles and movements</p>
                </div>
                <div className="flex items-center space-x-2 font-bold" style={{ color: '#000000' }}>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#000000' }}></div>
                  <p>Counting reps and validating form</p>
                </div>
                <div className="flex items-center space-x-2 font-bold" style={{ color: '#000000' }}>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#000000' }}></div>
                  <p>Generating annotated video with skeleton overlay</p>
                </div>
              </div>
            </div>

            {/* 3. Live Metrics Section - THIRD (Mobile Order 3) - BRIGHT RED GRADIENT OUTER, WHITE INNER WITH DARKER COLORS */}
            <div className="bg-gradient-to-r from-red-600 via-red-500 to-red-600 rounded-xl p-6 shadow-sm order-3 lg:mx-auto lg:max-w-4xl lg:w-full">
              <div className="flex items-center space-x-2 mb-4">
                <Target className="w-5 h-5 text-black animate-pulse" />
                <h3 className="text-base lg:text-lg font-semibold text-black">Live Metrics</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="text-2xl lg:text-3xl font-bold text-red-700">...</div>
                  <p className="text-xs lg:text-sm text-gray-800 mt-2 font-semibold">Reps Detected</p>
                </div>
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="text-2xl lg:text-3xl font-bold text-green-700">...</div>
                  <p className="text-xs lg:text-sm text-gray-800 mt-2 font-semibold">Correct Form</p>
                </div>
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="text-2xl lg:text-3xl font-bold text-orange-700">...</div>
                  <p className="text-xs lg:text-sm text-gray-800 mt-2 font-semibold">Bad Form</p>
                </div>
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="text-2xl lg:text-3xl font-bold text-blue-700">...</div>
                  <p className="text-xs lg:text-sm text-gray-800 mt-2 font-semibold">Min Angle</p>
                </div>
                <div className="bg-white rounded-lg p-4 text-center col-span-2">
                  <div className="text-2xl lg:text-3xl font-bold text-purple-700">...</div>
                  <p className="text-xs lg:text-sm text-gray-800 mt-2 font-semibold">Duration</p>
                </div>
              </div>
              <p className="text-xs lg:text-sm text-center text-black font-medium mt-4">
                ⏳ Metrics updating in real-time...
              </p>
            </div>

            {/* 4. Privacy Text - BOTTOM (Mobile Order 4) - WHITE BACKGROUND WITH BLACK TEXT */}
            <div className="bg-white rounded-xl p-4 lg:p-6 order-4 border-2 border-red-500/30">
              <p className="text-sm lg:text-base text-center text-black font-semibold">
                💡 Processing happens entirely in your browser - no data is sent to any server!
              </p>
              <p className="text-xs lg:text-sm text-center text-black font-medium mt-2">
                ⚡ Processing continues even when this tab is minimized or inactive
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showResults && processedData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-950 via-gray-900 to-black relative overflow-hidden">
        {/* Animated Background - reduced opacity */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
          <div className="absolute top-1/4 right-10 w-64 h-64 bg-red-600/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-10 w-96 h-96 bg-red-800/20 rounded-full blur-3xl" />
        </div>

        {/* Header */}
        <div className="sticky top-0 z-50 bg-red-950/90 backdrop-blur-xl border-b border-red-500/30 transform-gpu">
          <div className="px-4 py-4">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onBack}
                className="text-red-300 hover:text-red-100 hover:bg-red-900/50"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-red-400" />
                <h1 className="text-lg lg:text-xl font-semibold text-red-100">Test Results</h1>
              </div>
              <div className="w-10" />
            </div>
          </div>
        </div>

        {/* Results Content */}
        <div className="px-4 py-6 lg:py-8 max-w-7xl mx-auto relative z-10">
          {/* Status Banner - BRIGHT RED GRADIENT */}
          <div className="mb-6 rounded-2xl p-6 lg:p-8 border-2 border-red-500/50 shadow-xl bg-gradient-to-r from-red-600 via-red-500 to-red-600">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-3">
                {processedData.posture === 'Good' ? (
                  <CheckCircle className="w-12 h-12 lg:w-16 lg:h-16 text-black" />
                ) : (
                  <XCircle className="w-12 h-12 lg:w-16 lg:h-16 text-black" />
                )}
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold text-black mb-2">
                {processedData.posture === 'Good' ? 'Excellent Performance!' : 'Good Effort!'}
              </h2>
              <p className="text-sm lg:text-base text-black font-medium">
                {processedData.posture === 'Good' 
                  ? 'Great form and execution detected'
                  : 'Room for improvement in form and technique'}
              </p>
            </div>
          </div>

          {/* Annotated Video Preview - RED THEME */}
          {processedData.videoBlob && (
            <div className="mb-6 bg-gradient-to-r from-red-600 via-red-500 to-red-600 rounded-xl p-6 border-2 border-red-500/50 shadow-xl">
              <div className="flex items-center space-x-2 mb-4">
                <Play className="w-5 h-5 text-black" />
                <h3 className="text-lg font-bold text-black">Annotated Analysis Video</h3>
              </div>
              <div className="bg-white rounded-lg p-2">
                <div className="aspect-video bg-black rounded-lg overflow-hidden relative w-full max-w-5xl mx-auto max-h-[50vh] lg:max-h-[60vh] xl:max-h-[65vh]">
                  <video
                    src={URL.createObjectURL(processedData.videoBlob)}
                    controls
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute top-2 right-2 bg-red-600/90 text-black px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1 pointer-events-none z-10">
                    <div className="w-2 h-2 bg-black rounded-full animate-pulse"></div>
                    <span>TEST MODE</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <p className="text-xs text-center font-medium test-mode-info-text-black">
                  Video shows MediaPipe skeleton tracking and rep counting
                </p>
                <p className="text-xs text-center font-medium test-mode-info-text-black">
                  💡 If video doesn't play, click "Download Video" and open in VLC
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const url = URL.createObjectURL(processedData.videoBlob);
                      window.open(url, '_blank');
                    }}
                    className="flex-1 bg-white hover:bg-gray-100 border-black/20"
                  >
                    <ExternalLink className="w-4 h-4 mr-2 test-mode-info-text-black" />
                    <span className="test-mode-info-text-black">Open in New Tab</span>
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => {
                      const url = URL.createObjectURL(processedData.videoBlob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${activityName.replace(/\s+/g, '_')}_test_analyzed.mp4`;
                      a.click();
                    }}
                    className="flex-1 bg-black hover:bg-gray-900"
                  >
                    <Download className="w-4 h-4 mr-2 test-mode-button-text-white" />
                    <span className="test-mode-button-text-white">Download Video</span>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Metrics Grid - BRIGHT RED GRADIENT OUTER, WHITE INNER WITH BOLD DARK COLORS */}
          <div className="bg-gradient-to-r from-red-600 via-red-500 to-red-600 rounded-xl p-6 mb-6 lg:mx-auto lg:max-w-5xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
              <div className="bg-white rounded-xl p-4 lg:p-6 text-center shadow-sm">
                <div className="text-3xl lg:text-4xl font-extrabold text-blue-700">{processedData.totalReps}</div>
                <div className="text-xs lg:text-sm text-gray-800 mt-2 font-semibold uppercase tracking-wide">Total Reps</div>
              </div>
              <div className="bg-white rounded-xl p-4 lg:p-6 text-center shadow-sm">
                <div className="text-3xl lg:text-4xl font-extrabold text-green-700">{processedData.correctReps}</div>
                <div className="text-xs lg:text-sm text-gray-800 mt-2 font-semibold uppercase tracking-wide">Correct Reps</div>
              </div>
              <div className="bg-white rounded-xl p-4 lg:p-6 text-center shadow-sm">
                <div className="text-3xl lg:text-4xl font-extrabold text-orange-700">{processedData.badReps}</div>
                <div className="text-xs lg:text-sm text-gray-800 mt-2 font-semibold uppercase tracking-wide">Bad Reps</div>
              </div>
              <div className="bg-white rounded-xl p-4 lg:p-6 text-center shadow-sm">
                <div className="text-3xl lg:text-4xl font-extrabold text-red-700">{processedData.duration}</div>
                <div className="text-xs lg:text-sm text-gray-800 mt-2 font-semibold uppercase tracking-wide">Duration</div>
              </div>
            </div>
          </div>

          {/* Form Score - BRIGHT RED GRADIENT */}
          <div className="bg-gradient-to-r from-red-600 via-red-500 to-red-600 rounded-xl p-6 lg:p-8 mb-6 shadow-sm">
            <h3 className="text-lg lg:text-xl font-semibold text-black mb-4">Form Quality</h3>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="h-4 lg:h-5 bg-red-900 rounded-full overflow-hidden border border-black/20">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      processedData.formScore >= 80 ? 'bg-green-700' :
                      processedData.formScore >= 60 ? 'bg-yellow-600' :
                      'bg-black/40'
                    }`}
                    style={{ width: `${processedData.formScore}%` }}
                  />
                </div>
              </div>
              <div className="text-2xl lg:text-3xl font-bold text-black">{processedData.formScore}%</div>
            </div>
          </div>

          {/* Pose Visualization - BRIGHT RED GRADIENT */}
          {processedData.poseLandmarks && processedData.poseLandmarks.length > 0 && (
            <div className="bg-gradient-to-r from-red-600 via-red-500 to-red-600 rounded-xl p-6 lg:p-8 mb-6 shadow-sm">
              <h3 className="text-lg lg:text-xl font-semibold text-black mb-4">Pose Analysis</h3>
              <div className="bg-white rounded-lg p-4">
                <TestSkeletonRenderer 
                  landmarks={processedData.poseLandmarks[Math.floor(processedData.poseLandmarks.length / 2)]}
                  videoWidth={640}
                  videoHeight={480}
                  theme="red"
                />
              </div>
            </div>
          )}

          {/* Action Button - BRIGHT RED GRADIENT */}
          <Button
            onClick={handleComplete}
            className="w-full h-14 lg:h-16 text-lg lg:text-xl font-bold bg-gradient-to-r from-red-600 via-red-500 to-red-600 hover:from-red-700 hover:via-red-600 hover:to-red-700 transition-all"
          >
            <span className="test-mode-button-text-white">Submit Workout</span>
          </Button>
        </div>
      </div>
    );
  }

  return null;
};

export default TestVideoProcessor;

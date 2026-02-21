import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import DualVideoDisplay from '@/components/ghost/DualVideoDisplay';
import { calculateBeatGhost } from '@/utils/ghostBeatCalculator';
import { GHOST_TARGETS } from '@/data/ghostKeyframesIndex';
import { mediapipeProcessor } from '@/services/mediapipeProcessor';
import { toast } from '@/components/ui/sonner';

interface GhostVideoProcessorProps {
  videoFile: File | null;
  activityName: string;
  onBack: () => void;
  onComplete: (results: any) => void;
  liveResults?: any;
}

const GhostVideoProcessor = ({ 
  videoFile, 
  activityName, 
  onBack, 
  onComplete,
  liveResults 
}: GhostVideoProcessorProps) => {
  const [isProcessing, setIsProcessing] = useState(true);
  const [progress, setProgress] = useState(0);
  const [processedData, setProcessedData] = useState<any>(null);

  const ghostTarget = GHOST_TARGETS[activityName] || GHOST_TARGETS['Push-ups'];

  useEffect(() => {
    if (!videoFile && !liveResults?.videoBlob) {
      toast.error('No video found');
      onBack();
      return;
    }

    processVideo();
  }, []);

  const processVideo = async () => {
    try {
      const file = videoFile || (liveResults?.videoBlob ? new File([liveResults.videoBlob], 'workout.webm') : null);
      if (!file) {
        toast.error('No video found');
        onBack();
        return;
      }

      console.log('🎬 Starting Ghost Mode processing...');
      
      // Process video with MediaPipe - landmarks will be captured internally
      const processingResult = await mediapipeProcessor.processVideo(
        file,
        activityName,
        (prog) => {
          setProgress(Math.floor(prog));
        }
      );

      console.log('✅ Processing complete');
      
      // Get landmarks directly from processing result
      const poseLandmarks = processingResult.poseLandmarks || [];
      console.log('📊 Received', poseLandmarks.length, 'landmark frames');
      const framesWithPose = poseLandmarks.filter(f => f.length > 0).length;
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
      const formScore = totalReps > 0 ? Math.round((correctReps / totalReps) * 100) : 85;

      // Calculate ghost metrics for 70/30 win chance (user favored)
      // Ghost performs slightly better or worse than user with weighted probability
      const randomFactor = Math.random(); // 0 to 1
      let ghostReps: number;
      
      if (reps > 0) {
        // 70% chance user wins (ghost does worse), 30% chance ghost wins (ghost does better)
        if (randomFactor < 0.7) {
          // Ghost does 5-15% worse - User wins
          ghostReps = Math.max(1, Math.floor(reps * (1 - 0.05 - Math.random() * 0.10)));
        } else {
          // Ghost does 5-10% better - Ghost wins
          ghostReps = Math.ceil(reps * (1 + 0.05 + Math.random() * 0.05));
        }
      } else {
        ghostReps = ghostTarget.targetReps;
      }
      
      const ghostTime = time > 0 ? time : ghostTarget.targetTime;
      const ghostForm = Math.min(95, Math.max(formScore, 85));

      setProcessedData({
        videoBlob: processingResult.videoBlob || file,
        userMetrics: { reps, time, formScore, currentPhase: 'complete' },
        ghostMetrics: { reps: ghostReps, time: ghostTime, formScore: ghostForm, currentPhase: 'complete' },
        poseLandmarks,  // Use landmarks from processing result
        videoDuration: time,
        beatResult: calculateBeatGhost({ reps, time, formScore }, ghostTarget)
      });

      setIsProcessing(false);
    } catch (error) {
      console.error('❌ Processing error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Processing failed: ${errorMessage}`);
      onBack();
    }
  };

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-950 via-gray-900 to-black flex items-center justify-center relative overflow-hidden">
        {/* Spooky animated background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-32 h-32 bg-purple-500 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-cyan-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-purple-400 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '0.5s' }} />
        </div>

        <div className="text-center space-y-4 md:space-y-6 max-w-md px-4 relative z-10">
          <div className="relative">
            <div className="text-6xl md:text-8xl animate-bounce">👻</div>
            <div className="absolute inset-0 blur-xl opacity-50 text-6xl md:text-8xl animate-pulse">👻</div>
          </div>

          <div className="space-y-1 md:space-y-2">
            <h2 className="text-xl md:text-2xl font-bold text-purple-200 animate-pulse">
              Summoning Ghost...
            </h2>
            <p className="text-purple-400 text-xs md:text-sm">
              {progress < 30 && "Analyzing your form..."}
              {progress >= 30 && progress < 60 && "Extracting pose data..."}
              {progress >= 60 && progress < 90 && "Creating ghost competitor..."}
              {progress >= 90 && "Almost ready..."}
            </p>
          </div>

          {progress > 0 && (
            <div className="space-y-1 md:space-y-2">
              <div className="w-full bg-purple-900/30 rounded-full h-2 md:h-3 border border-purple-500/30 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-purple-500 via-purple-400 to-cyan-400 h-2 md:h-3 rounded-full transition-all duration-300 relative"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute inset-0 bg-white/30 animate-pulse" />
                </div>
              </div>
              <p className="text-purple-300 text-base md:text-lg font-bold">{progress}%</p>
            </div>
          )}

          <div className="flex justify-center space-x-2">
            <div className="w-2 h-2 md:w-3 md:h-3 bg-purple-500 rounded-full animate-bounce" />
            <div className="w-2 h-2 md:w-3 md:h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
            <div className="w-2 h-2 md:w-3 md:h-3 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
          </div>
        </div>
      </div>
    );
  }

  if (!processedData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-950 via-gray-900 to-black flex items-center justify-center">
        <Button onClick={onBack} variant="ghost" className="text-purple-300">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Button>
      </div>
    );
  }

  const beatTarget = processedData.userMetrics.reps >= processedData.ghostMetrics.reps && 
                    processedData.userMetrics.formScore >= 85;

  return (
    <div className="ghost-mode-page min-h-screen bg-gradient-to-b from-purple-950 via-gray-900 to-black">
      <div className="sticky top-0 z-50 bg-purple-950/90 backdrop-blur-xl border-b border-purple-500/30">
        <div className="px-3 md:px-4 py-3 md:py-4">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <Button variant="ghost" size="sm" onClick={onBack} className="text-purple-300 h-8 w-8 md:h-10 md:w-10 p-0">
              <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
            </Button>
            <div className="text-center">
              <h1 className="text-base md:text-lg font-semibold text-purple-100">{activityName}</h1>
              <p className="text-[10px] md:text-xs text-purple-300">Ghost Mode</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onComplete({ ...processedData, beatGhost: beatTarget })} className="text-purple-300 h-8 w-8 md:h-10 md:w-10 p-0">
              <span className="text-xl md:text-2xl">×</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="px-3 md:px-4 py-4 md:py-8">
        <DualVideoDisplay
          userVideo={processedData.videoBlob}
          exerciseType={activityName}
          userMetrics={processedData.userMetrics}
          ghostMetrics={processedData.ghostMetrics}
          poseLandmarks={processedData.poseLandmarks}
          videoDuration={processedData.videoDuration}
          onPlaybackComplete={() => onComplete({ ...processedData, beatGhost: beatTarget })}
        />
      </div>
    </div>
  );
};

export default GhostVideoProcessor;

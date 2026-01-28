import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Clock, TrendingUp, Home, Play } from 'lucide-react';
import { PushupRepData } from '@/services/workoutDetectors/PushupLiveDetector';
import { useState, useRef, useEffect } from 'react';

interface WorkoutResultsScreenProps {
  activityName: string;
  totalReps: number;
  correctReps: number;
  incorrectReps: number;
  duration: number;
  repDetails?: PushupRepData[];
  videoBlob?: Blob;
  onHome: () => void;
}

const WorkoutResultsScreen = ({
  activityName,
  totalReps,
  correctReps,
  incorrectReps,
  duration,
  repDetails = [],
  videoBlob,
  onHome
}: WorkoutResultsScreenProps) => {
  const [videoUrl, setVideoUrl] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    if (videoBlob) {
      const url = URL.createObjectURL(videoBlob);
      setVideoUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [videoBlob]);

  const accuracy = totalReps > 0 ? Math.round((correctReps / totalReps) * 100) : 0;
  const formScore = accuracy >= 80 ? 'Excellent' : accuracy >= 60 ? 'Good' : 'Needs Work';

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 text-white overflow-y-auto">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500 rounded-full mb-4">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h1 className="text-3xl font-bold">Workout Complete!</h1>
          <p className="text-purple-200">{activityName}</p>
        </div>

        {/* Annotated Video */}
        {videoUrl && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-semibold">Your Performance</h2>
              <Play className="w-5 h-5 text-purple-300" />
            </div>
            <div className="relative rounded-lg overflow-hidden bg-black">
              <video
                ref={videoRef}
                src={videoUrl}
                controls
                className="w-full"
                playsInline
              >
                Your browser does not support the video tag.
              </video>
            </div>
            <p className="text-sm text-purple-200 mt-3">
              📹 Watch your workout with real-time metrics and form analysis
            </p>
          </div>
        )}

        {/* Main Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="text-4xl font-bold mb-2">{totalReps}</div>
            <div className="text-purple-200 text-sm">Total Reps</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="text-4xl font-bold mb-2 text-green-400">{correctReps}</div>
            <div className="text-purple-200 text-sm">Correct</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="text-4xl font-bold mb-2 text-red-400">{incorrectReps}</div>
            <div className="text-purple-200 text-sm">Incorrect</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="text-4xl font-bold mb-2">{formatTime(duration)}</div>
            <div className="text-purple-200 text-sm">Duration</div>
          </div>
        </div>

        {/* Accuracy */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Form Accuracy</h2>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              accuracy >= 80 ? 'bg-green-500' : accuracy >= 60 ? 'bg-yellow-500' : 'bg-red-500'
            }`}>
              {formScore}
            </span>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <span>Correct Reps</span>
              </div>
              <span className="text-2xl font-bold">{correctReps}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <XCircle className="w-5 h-5 text-red-400" />
                <span>Incorrect Reps</span>
              </div>
              <span className="text-2xl font-bold">{incorrectReps}</span>
            </div>

            <div className="mt-4 bg-white/5 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-green-500 h-full transition-all duration-500"
                style={{ width: `${accuracy}%` }}
              />
            </div>
            <div className="text-center text-sm text-purple-200">{accuracy}% Accuracy</div>
          </div>
        </div>

        {/* Rep Details for Push-ups */}
        {activityName === 'Push-ups' && repDetails.length > 0 && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Rep Breakdown</h2>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {repDetails.map((rep) => (
                <div 
                  key={rep.rep}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    rep.correct ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {rep.correct ? (
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400" />
                    )}
                    <span className="font-semibold">Rep {rep.rep}</span>
                  </div>
                  <div className="text-sm text-right">
                    <div>Elbow: {rep.min_elbow}°</div>
                    <div>Plank: {rep.plank_angle}°</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Performance Insights */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="w-5 h-5" />
            <h2 className="text-xl font-semibold">Performance Insights</h2>
          </div>
          <div className="space-y-2 text-purple-200">
            {accuracy >= 80 && (
              <p>🎉 Excellent form! Keep up the great work!</p>
            )}
            {accuracy >= 60 && accuracy < 80 && (
              <p>👍 Good effort! Focus on maintaining proper form throughout each rep.</p>
            )}
            {accuracy < 60 && (
              <p>💪 Keep practicing! Pay attention to elbow angle and body alignment.</p>
            )}
            {activityName === 'Push-ups' && repDetails.length > 0 && (
              <>
                {repDetails.some(r => !r.correct && r.min_elbow > 75) && (
                  <p>• Try to lower your chest closer to the ground (elbow angle below 75°)</p>
                )}
                {repDetails.some(r => !r.correct && r.plank_angle < 165) && (
                  <p>• Keep your body straight - avoid sagging hips or pike position</p>
                )}
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            onClick={onHome}
            className="flex-1 bg-white text-purple-900 hover:bg-purple-100 py-6 text-lg"
          >
            <Home className="w-5 h-5 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WorkoutResultsScreen;

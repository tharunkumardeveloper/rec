import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Clock, TrendingUp, Home, Play, Award, Zap, Target, Activity } from 'lucide-react';
import { PushupRepData } from '@/services/workoutDetectors/PushupLiveDetector';
import { useState, useRef, useEffect } from 'react';

interface WorkoutResultsScreenProProps {
  activityName: string;
  totalReps: number;
  correctReps: number;
  incorrectReps: number;
  duration: number;
  repDetails?: PushupRepData[];
  videoBlob?: Blob;
  onHome: () => void;
}

const WorkoutResultsScreenPro = ({
  activityName,
  totalReps,
  correctReps,
  incorrectReps,
  duration,
  repDetails = [],
  videoBlob,
  onHome
}: WorkoutResultsScreenProProps) => {
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
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
  const scoreColor = accuracy >= 80 ? 'from-green-500 to-emerald-500' : accuracy >= 60 ? 'from-yellow-500 to-orange-500' : 'from-red-500 to-rose-500';

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVideoClick = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-y-auto">
      <div className="max-w-5xl mx-auto p-6 space-y-6 pb-24">
        {/* Success Header */}
        <div className="text-center space-y-4 pt-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl mb-4 shadow-2xl animate-bounce-slow">
            <CheckCircle2 className="w-14 h-14 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Workout Complete!
          </h1>
          <div className="flex items-center justify-center space-x-2">
            <Activity className="w-5 h-5 text-purple-400" />
            <p className="text-xl text-gray-300 font-semibold">{activityName}</p>
          </div>
        </div>

        {/* Performance Score Card */}
        <div className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 backdrop-blur-xl rounded-3xl p-8 border border-purple-500/20 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Award className="w-7 h-7 text-yellow-400" />
              <h2 className="text-2xl font-bold">Performance Score</h2>
            </div>
            <div className={`px-5 py-2 rounded-full bg-gradient-to-r ${scoreColor} text-white text-lg font-black shadow-lg`}>
              {formScore}
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 text-center border border-white/10">
              <Target className="w-6 h-6 text-purple-400 mx-auto mb-2" />
              <div className="text-4xl font-black mb-1">{totalReps}</div>
              <div className="text-sm text-gray-400 font-semibold">Total Reps</div>
            </div>
            <div className="bg-green-500/10 backdrop-blur-sm rounded-2xl p-5 text-center border border-green-500/30">
              <CheckCircle2 className="w-6 h-6 text-green-400 mx-auto mb-2" />
              <div className="text-4xl font-black text-green-400 mb-1">{correctReps}</div>
              <div className="text-sm text-gray-400 font-semibold">Correct</div>
            </div>
            <div className="bg-red-500/10 backdrop-blur-sm rounded-2xl p-5 text-center border border-red-500/30">
              <XCircle className="w-6 h-6 text-red-400 mx-auto mb-2" />
              <div className="text-4xl font-black text-red-400 mb-1">{incorrectReps}</div>
              <div className="text-sm text-gray-400 font-semibold">Incorrect</div>
            </div>
            <div className="bg-blue-500/10 backdrop-blur-sm rounded-2xl p-5 text-center border border-blue-500/30">
              <Clock className="w-6 h-6 text-blue-400 mx-auto mb-2" />
              <div className="text-4xl font-black text-blue-400 mb-1">{formatTime(duration)}</div>
              <div className="text-sm text-gray-400 font-semibold">Duration</div>
            </div>
          </div>

          {/* Accuracy Progress Bar */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400 font-semibold">Form Accuracy</span>
              <span className="text-2xl font-black">{accuracy}%</span>
            </div>
            <div className="relative h-4 bg-white/5 rounded-full overflow-hidden border border-white/10">
              <div 
                className={`absolute inset-y-0 left-0 bg-gradient-to-r ${scoreColor} transition-all duration-1000 ease-out rounded-full`}
                style={{ width: `${accuracy}%` }}
              />
            </div>
          </div>
        </div>

        {/* Video Playback */}
        {videoUrl && (
          <div className="bg-gradient-to-br from-slate-900/60 to-slate-800/60 backdrop-blur-xl rounded-3xl p-6 border border-slate-700/50 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Play className="w-6 h-6 text-purple-400" />
                <h2 className="text-2xl font-bold">Your Performance</h2>
              </div>
              <div className="px-4 py-1.5 bg-purple-600/20 rounded-full border border-purple-500/30">
                <span className="text-sm font-semibold text-purple-300">With Live Metrics</span>
              </div>
            </div>
            <div 
              className="relative rounded-2xl overflow-hidden bg-black cursor-pointer group shadow-2xl"
              onClick={handleVideoClick}
            >
              <video
                ref={videoRef}
                src={videoUrl}
                className="w-full"
                playsInline
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              >
                Your browser does not support the video tag.
              </video>
              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/60 transition-colors">
                  <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                    <Play className="w-10 h-10 text-black ml-1" fill="currentColor" />
                  </div>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-400 mt-4 flex items-center">
              <Zap className="w-4 h-4 mr-2 text-yellow-400" />
              Watch your workout with real-time form analysis and metrics
            </p>
          </div>
        )}

        {/* Rep Breakdown */}
        {activityName === 'Push-ups' && repDetails.length > 0 && (
          <div className="bg-gradient-to-br from-slate-900/60 to-slate-800/60 backdrop-blur-xl rounded-3xl p-6 border border-slate-700/50 shadow-2xl">
            <div className="flex items-center space-x-3 mb-5">
              <TrendingUp className="w-6 h-6 text-cyan-400" />
              <h2 className="text-2xl font-bold">Rep-by-Rep Analysis</h2>
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
              {repDetails.map((rep) => (
                <div 
                  key={rep.rep}
                  className={`flex items-center justify-between p-4 rounded-xl transition-all hover:scale-[1.02] ${
                    rep.correct 
                      ? 'bg-green-500/10 border border-green-500/30 hover:bg-green-500/20' 
                      : 'bg-red-500/10 border border-red-500/30 hover:bg-red-500/20'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      rep.correct ? 'bg-green-500/20' : 'bg-red-500/20'
                    }`}>
                      {rep.correct ? (
                        <CheckCircle2 className="w-6 h-6 text-green-400" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-400" />
                      )}
                    </div>
                    <div>
                      <span className="font-bold text-lg">Rep {rep.rep}</span>
                      <div className="text-xs text-gray-400 font-medium">
                        {rep.correct ? 'Perfect form' : 'Form needs work'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">Elbow:</span>
                      <span className={`text-sm font-bold ${rep.min_elbow <= 75 ? 'text-green-400' : 'text-red-400'}`}>
                        {rep.min_elbow}°
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">Plank:</span>
                      <span className={`text-sm font-bold ${rep.plank_angle >= 165 ? 'text-green-400' : 'text-red-400'}`}>
                        {rep.plank_angle}°
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Performance Insights */}
        <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 backdrop-blur-xl rounded-3xl p-6 border border-indigo-500/20 shadow-2xl">
          <div className="flex items-center space-x-3 mb-4">
            <TrendingUp className="w-6 h-6 text-indigo-400" />
            <h2 className="text-2xl font-bold">Performance Insights</h2>
          </div>
          <div className="space-y-3">
            {accuracy >= 80 && (
              <div className="flex items-start space-x-3 p-4 bg-green-500/10 rounded-xl border border-green-500/20">
                <div className="text-2xl">🎉</div>
                <div>
                  <p className="font-semibold text-green-300">Outstanding Performance!</p>
                  <p className="text-sm text-gray-400 mt-1">Your form is excellent. Keep up the great work!</p>
                </div>
              </div>
            )}
            {accuracy >= 60 && accuracy < 80 && (
              <div className="flex items-start space-x-3 p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                <div className="text-2xl">👍</div>
                <div>
                  <p className="font-semibold text-yellow-300">Good Effort!</p>
                  <p className="text-sm text-gray-400 mt-1">Focus on maintaining proper form throughout each rep.</p>
                </div>
              </div>
            )}
            {accuracy < 60 && (
              <div className="flex items-start space-x-3 p-4 bg-orange-500/10 rounded-xl border border-orange-500/20">
                <div className="text-2xl">💪</div>
                <div>
                  <p className="font-semibold text-orange-300">Keep Practicing!</p>
                  <p className="text-sm text-gray-400 mt-1">Pay attention to elbow angle and body alignment.</p>
                </div>
              </div>
            )}
            {activityName === 'Push-ups' && repDetails.length > 0 && (
              <>
                {repDetails.some(r => !r.correct && r.min_elbow > 75) && (
                  <div className="flex items-start space-x-3 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                    <div className="text-xl">💡</div>
                    <p className="text-sm text-gray-300">
                      <span className="font-semibold text-blue-300">Tip:</span> Lower your chest closer to the ground (elbow angle below 75°)
                    </p>
                  </div>
                )}
                {repDetails.some(r => !r.correct && r.plank_angle < 165) && (
                  <div className="flex items-start space-x-3 p-4 bg-purple-500/10 rounded-xl border border-purple-500/20">
                    <div className="text-xl">💡</div>
                    <p className="text-sm text-gray-300">
                      <span className="font-semibold text-purple-300">Tip:</span> Keep your body straight - avoid sagging hips or pike position
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4">
          <Button
            onClick={onHome}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-7 text-lg font-bold rounded-2xl shadow-2xl border-2 border-purple-400/30 transition-all duration-200 hover:scale-[1.02]"
          >
            <Home className="w-6 h-6 mr-3" />
            Back to Home
          </Button>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.7);
        }
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default WorkoutResultsScreenPro;

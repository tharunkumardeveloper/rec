import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Clock, Download, Home, Play, Pause, TrendingUp, Award, Target } from 'lucide-react';
import { PushupRepData } from '@/services/workoutDetectors/PushupLiveDetector';
import { useState, useRef, useEffect } from 'react';

interface WorkoutResultsScreenLightProps {
  activityName: string;
  totalReps: number;
  correctReps: number;
  incorrectReps: number;
  duration: number;
  repDetails?: PushupRepData[];
  videoBlob?: Blob;
  onHome: () => void;
}

const WorkoutResultsScreenLight = ({
  activityName,
  totalReps,
  correctReps,
  incorrectReps,
  duration,
  repDetails = [],
  videoBlob,
  onHome
}: WorkoutResultsScreenLightProps) => {
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
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
    // Handle invalid or infinite values
    if (!isFinite(seconds) || isNaN(seconds)) {
      return '0:00';
    }
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current && isFinite(videoRef.current.duration)) {
      setVideoDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: any) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleDownload = () => {
    if (videoUrl) {
      const a = document.createElement('a');
      a.href = videoUrl;
      a.download = `${activityName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const progress = videoDuration > 0 ? (currentTime / videoDuration) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-y-auto">
      <div className="max-w-6xl mx-auto p-6 space-y-6 pb-24">
        {/* Header */}
        <div className="text-center pt-6 pb-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500 rounded-full mb-4 shadow-lg">
            <CheckCircle2 className="w-12 h-12 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Workout Complete!</h1>
          <p className="text-xl text-gray-600">{activityName}</p>
        </div>

        {/* Video Player Section */}
        {videoUrl && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Your Performance Video</h2>
                <Button
                  onClick={handleDownload}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Save Video</span>
                </Button>
              </div>
              
              {/* Video */}
              <div className="relative rounded-xl overflow-hidden bg-black mb-4">
                <video
                  ref={videoRef}
                  src={videoUrl}
                  className="w-full"
                  playsInline
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => setIsPlaying(false)}
                >
                  Your browser does not support the video tag.
                </video>
              </div>

              {/* Video Controls */}
              <div className="space-y-3">
                {/* Timeline */}
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-700 w-12">
                    {formatTime(currentTime)}
                  </span>
                  <div className="flex-1 relative">
                    <input
                      type="range"
                      min="0"
                      max={videoDuration || 0}
                      value={currentTime}
                      onChange={handleSeek}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      style={{
                        background: `linear-gradient(to right, #2563eb 0%, #2563eb ${progress}%, #e5e7eb ${progress}%, #e5e7eb 100%)`
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700 w-12">
                    {formatTime(videoDuration)}
                  </span>
                </div>

                {/* Play/Pause Button */}
                <div className="flex justify-center">
                  <Button
                    onClick={handlePlayPause}
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-5 h-5 mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5 mr-2" />
                        Play
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Performance Summary */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Award className="w-7 h-7 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Performance Summary</h2>
            </div>
            <div className={`px-4 py-2 rounded-full font-bold text-white ${
              accuracy >= 80 ? 'bg-green-500' : accuracy >= 60 ? 'bg-yellow-500' : 'bg-red-500'
            }`}>
              {formScore}
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200">
              <div className="flex items-center justify-center mb-2">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">{totalReps}</div>
                <div className="text-sm text-gray-600 font-medium mt-1">Total Reps</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border border-green-200">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-700">{correctReps}</div>
                <div className="text-sm text-gray-600 font-medium mt-1">Correct Form</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-5 border border-red-200">
              <div className="flex items-center justify-center mb-2">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-700">{incorrectReps}</div>
                <div className="text-sm text-gray-600 font-medium mt-1">Needs Work</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border border-purple-200">
              <div className="flex items-center justify-center mb-2">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">{formatTime(duration)}</div>
                <div className="text-sm text-gray-600 font-medium mt-1">Duration</div>
              </div>
            </div>
          </div>

          {/* Accuracy Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Form Accuracy</span>
              <span className="text-2xl font-bold text-gray-900">{accuracy}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div 
                className={`h-full transition-all duration-1000 ${
                  accuracy >= 80 ? 'bg-green-500' : accuracy >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${accuracy}%` }}
              />
            </div>
          </div>
        </div>

        {/* Rep Details */}
        {activityName === 'Push-ups' && repDetails.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center space-x-3 mb-5">
              <TrendingUp className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Detailed Rep Analysis</h2>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {repDetails.map((rep) => (
                <div 
                  key={rep.rep}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all hover:shadow-md ${
                    rep.correct 
                      ? 'bg-green-50 border-green-200 hover:border-green-300' 
                      : 'bg-red-50 border-red-200 hover:border-red-300'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      rep.correct ? 'bg-green-500' : 'bg-red-500'
                    }`}>
                      {rep.correct ? (
                        <CheckCircle2 className="w-7 h-7 text-white" />
                      ) : (
                        <XCircle className="w-7 h-7 text-white" />
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-lg text-gray-900">Rep {rep.rep}</div>
                      <div className="text-sm text-gray-600">
                        {rep.correct ? 'Perfect form ✓' : 'Form needs improvement'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="flex items-center justify-end space-x-2">
                      <span className="text-xs text-gray-500 font-medium">Elbow:</span>
                      <span className={`text-base font-bold px-2 py-1 rounded ${
                        rep.min_elbow <= 75 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {rep.min_elbow}°
                      </span>
                    </div>
                    <div className="flex items-center justify-end space-x-2">
                      <span className="text-xs text-gray-500 font-medium">Plank:</span>
                      <span className={`text-base font-bold px-2 py-1 rounded ${
                        rep.plank_angle >= 165 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
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
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-6 border border-blue-200">
          <div className="flex items-center space-x-3 mb-4">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Performance Insights</h2>
          </div>
          <div className="space-y-3">
            {accuracy >= 80 && (
              <div className="flex items-start space-x-3 p-4 bg-white rounded-xl border border-green-200">
                <div className="text-2xl">🎉</div>
                <div>
                  <p className="font-semibold text-green-700">Outstanding Performance!</p>
                  <p className="text-sm text-gray-600 mt-1">Your form is excellent. Keep up the great work!</p>
                </div>
              </div>
            )}
            {accuracy >= 60 && accuracy < 80 && (
              <div className="flex items-start space-x-3 p-4 bg-white rounded-xl border border-yellow-200">
                <div className="text-2xl">👍</div>
                <div>
                  <p className="font-semibold text-yellow-700">Good Effort!</p>
                  <p className="text-sm text-gray-600 mt-1">Focus on maintaining proper form throughout each rep.</p>
                </div>
              </div>
            )}
            {accuracy < 60 && (
              <div className="flex items-start space-x-3 p-4 bg-white rounded-xl border border-orange-200">
                <div className="text-2xl">💪</div>
                <div>
                  <p className="font-semibold text-orange-700">Keep Practicing!</p>
                  <p className="text-sm text-gray-600 mt-1">Pay attention to elbow angle and body alignment.</p>
                </div>
              </div>
            )}
            {activityName === 'Push-ups' && repDetails.length > 0 && (
              <>
                {repDetails.some(r => !r.correct && r.min_elbow > 75) && (
                  <div className="flex items-start space-x-3 p-4 bg-white rounded-xl border border-blue-200">
                    <div className="text-xl">💡</div>
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold text-blue-700">Tip:</span> Lower your chest closer to the ground (elbow angle below 75°)
                    </p>
                  </div>
                )}
                {repDetails.some(r => !r.correct && r.plank_angle < 165) && (
                  <div className="flex items-start space-x-3 p-4 bg-white rounded-xl border border-purple-200">
                    <div className="text-xl">💡</div>
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold text-purple-700">Tip:</span> Keep your body straight - avoid sagging hips or pike position
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
            size="lg"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg font-semibold rounded-xl shadow-lg"
          >
            <Home className="w-5 h-5 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WorkoutResultsScreenLight;

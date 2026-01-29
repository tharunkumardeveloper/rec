import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Play, FileText, Calendar, TrendingUp, CheckCircle, XCircle } from 'lucide-react';
import workoutStorageService, { StoredWorkout } from '@/services/workoutStorageService';

const AthleteDetailPage = () => {
  const { athleteName } = useParams<{ athleteName: string }>();
  const navigate = useNavigate();
  const [workouts, setWorkouts] = useState<StoredWorkout[]>([]);
  const [selectedWorkout, setSelectedWorkout] = useState<StoredWorkout | null>(null);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);

  useEffect(() => {
    if (athleteName) {
      loadWorkouts();
    }
  }, [athleteName]);

  const loadWorkouts = () => {
    if (!athleteName) return;
    const decodedName = decodeURIComponent(athleteName);
    const athleteWorkouts = workoutStorageService.getWorkoutsByAthlete(decodedName);
    setWorkouts(athleteWorkouts);
    
    // Auto-select the most recent workout
    if (athleteWorkouts.length > 0 && !selectedWorkout) {
      setSelectedWorkout(athleteWorkouts[0]);
    }
  };

  const handleDownloadPDF = () => {
    if (!selectedWorkout?.pdfDataUrl) return;
    
    const link = document.createElement('a');
    link.href = selectedWorkout.pdfDataUrl;
    link.download = `${selectedWorkout.athleteName}_${selectedWorkout.activityName}_Report.pdf`;
    link.click();
  };

  const handleDownloadVideo = () => {
    if (!selectedWorkout?.videoDataUrl) return;
    
    const link = document.createElement('a');
    link.href = selectedWorkout.videoDataUrl;
    link.download = `${selectedWorkout.athleteName}_${selectedWorkout.activityName}_Video.webm`;
    link.click();
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!athleteName) {
    return <div>Athlete not found</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/coach')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">
              {decodeURIComponent(athleteName)}
            </h1>
            <p className="text-gray-600 mt-1">{workouts.length} total workouts</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Workout List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Workout History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {workouts.map((workout) => (
                  <div
                    key={workout.id}
                    onClick={() => setSelectedWorkout(workout)}
                    className={`p-4 rounded-lg cursor-pointer transition-all ${
                      selectedWorkout?.id === workout.id
                        ? 'bg-blue-100 border-2 border-blue-500'
                        : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{workout.activityName}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          {formatDate(workout.timestamp)}
                        </p>
                        <div className="flex items-center space-x-3 mt-2">
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                            {workout.correctReps} correct
                          </span>
                          <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                            {workout.accuracy}% accuracy
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Workout Details */}
          <div className="lg:col-span-2 space-y-6">
            {selectedWorkout ? (
              <>
                {/* Performance Summary */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Performance Summary</CardTitle>
                      <div className="flex items-center space-x-2">
                        {selectedWorkout.pdfDataUrl && (
                          <Button size="sm" variant="outline" onClick={handleDownloadPDF}>
                            <FileText className="w-4 h-4 mr-2" />
                            PDF Report
                          </Button>
                        )}
                        {selectedWorkout.videoDataUrl && (
                          <Button size="sm" variant="outline" onClick={handleDownloadVideo}>
                            <Download className="w-4 h-4 mr-2" />
                            Video
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Total Reps</p>
                        <p className="text-3xl font-bold text-gray-900">{selectedWorkout.totalReps}</p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Correct</p>
                        <p className="text-3xl font-bold text-green-600">{selectedWorkout.correctReps}</p>
                      </div>
                      <div className="bg-red-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Incorrect</p>
                        <p className="text-3xl font-bold text-red-600">{selectedWorkout.incorrectReps}</p>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Duration</p>
                        <p className="text-3xl font-bold text-purple-600">
                          {formatDuration(selectedWorkout.duration)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-700">Form Accuracy</span>
                        <span className="text-2xl font-bold text-gray-900">{selectedWorkout.accuracy}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-4">
                        <div
                          className={`h-full rounded-full ${
                            selectedWorkout.accuracy >= 80
                              ? 'bg-green-500'
                              : selectedWorkout.accuracy >= 60
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${selectedWorkout.accuracy}%` }}
                        />
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        Form Score: <span className="font-semibold">{selectedWorkout.formScore}</span>
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Video Player */}
                {selectedWorkout.videoDataUrl && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Play className="w-5 h-5 mr-2" />
                        Workout Video
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="relative rounded-lg overflow-hidden bg-black">
                        <video
                          src={selectedWorkout.videoDataUrl}
                          controls
                          className="w-full"
                          onPlay={() => setIsPlayingVideo(true)}
                          onPause={() => setIsPlayingVideo(false)}
                        >
                          Your browser does not support the video tag.
                        </video>
                      </div>
                      <p className="text-sm text-gray-600 mt-3">
                        📹 Video includes MediaPipe pose tracking and real-time form analysis
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Screenshots */}
                {selectedWorkout.screenshots && selectedWorkout.screenshots.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Workout Screenshots</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {selectedWorkout.screenshots.map((screenshot, index) => (
                          <div key={index} className="relative rounded-lg overflow-hidden bg-black">
                            <img
                              src={screenshot}
                              alt={`Screenshot ${index + 1}`}
                              className="w-full h-auto"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-2 py-1 text-xs text-white text-center">
                              Frame {index + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Rep Details */}
                {selectedWorkout.repDetails && selectedWorkout.repDetails.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Rep-by-Rep Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {selectedWorkout.repDetails.map((rep: any, index: number) => (
                          <div
                            key={index}
                            className={`flex items-center justify-between p-3 rounded-lg ${
                              rep.correct
                                ? 'bg-green-50 border border-green-200'
                                : 'bg-red-50 border border-red-200'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              {rep.correct ? (
                                <CheckCircle className="w-5 h-5 text-green-600" />
                              ) : (
                                <XCircle className="w-5 h-5 text-red-600" />
                              )}
                              <span className="font-semibold">Rep {rep.rep || index + 1}</span>
                            </div>
                            <div className="text-sm text-right">
                              {rep.min_elbow !== undefined && (
                                <div>Elbow: {rep.min_elbow}°</div>
                              )}
                              {rep.plank_angle !== undefined && (
                                <div>Plank: {rep.plank_angle}°</div>
                              )}
                              {rep.angle !== undefined && (
                                <div>Angle: {rep.angle}°</div>
                              )}
                              {rep.knee_angle !== undefined && (
                                <div>Knee: {rep.knee_angle}°</div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Select a workout to view details</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AthleteDetailPage;

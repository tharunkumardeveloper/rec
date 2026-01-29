import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Play, FileText, TrendingUp, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import workoutStorageService, { StoredWorkout } from '@/services/workoutStorageService';
import PDFViewer from '@/components/coach/PDFViewer';

const SAIAthleteDetailPage = () => {
  const { athleteName } = useParams<{ athleteName: string }>();
  const navigate = useNavigate();
  const [workouts, setWorkouts] = useState<StoredWorkout[]>([]);
  const [selectedWorkout, setSelectedWorkout] = useState<StoredWorkout | null>(null);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [showPDFViewer, setShowPDFViewer] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (athleteName) {
      loadWorkouts();
      
      // Auto-refresh every 30 seconds
      const interval = setInterval(() => {
        loadWorkouts(true); // Silent refresh
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [athleteName]);

  const loadWorkouts = async (silent = false) => {
    if (!athleteName) return;
    if (!silent) {
      setIsRefreshing(true);
    }
    try {
      const decodedName = decodeURIComponent(athleteName);
      const athleteWorkouts = await workoutStorageService.getWorkoutsByAthlete(decodedName);
      setWorkouts(athleteWorkouts);
      
      if (athleteWorkouts.length > 0 && !selectedWorkout) {
        setSelectedWorkout(athleteWorkouts[0]);
      }
    } catch (error) {
      console.error('Error loading workouts:', error);
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  };

  const handleViewPDF = () => {
    if (!selectedWorkout?.pdfDataUrl && !selectedWorkout?.pdfUrl) return;
    setShowPDFViewer(true);
  };

  const handleDownloadVideo = () => {
    if (!selectedWorkout?.videoDataUrl && !selectedWorkout?.videoUrl) return;
    
    const videoUrl = selectedWorkout.videoUrl || selectedWorkout.videoDataUrl;
    const link = document.createElement('a');
    link.href = videoUrl;
    link.download = `${selectedWorkout.athleteName}_${selectedWorkout.activityName}_Video.webm`;
    link.target = '_blank';
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/sai-workouts')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-gray-900">
              {decodeURIComponent(athleteName)}
            </h1>
            <p className="text-gray-600 mt-1">{workouts.length} total workouts</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadWorkouts()}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
          </Button>
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
                        ? 'bg-purple-100 border-2 border-purple-500'
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
                        {(selectedWorkout.pdfDataUrl || selectedWorkout.pdfUrl) && (
                          <Button size="sm" variant="outline" onClick={handleViewPDF}>
                            <FileText className="w-4 h-4 mr-2" />
                            View Report
                          </Button>
                        )}
                        {(selectedWorkout.videoDataUrl || selectedWorkout.videoUrl) && (
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
                {(selectedWorkout.videoDataUrl || selectedWorkout.videoUrl) && (
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
                          src={selectedWorkout.videoUrl || selectedWorkout.videoDataUrl}
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

                {/* Rep Screenshots - Individual frames for each rep */}
                {selectedWorkout.screenshots && selectedWorkout.screenshots.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Rep Screenshots</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">Individual frame captured for each rep</p>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {selectedWorkout.screenshots.map((screenshot, index) => {
                          const repDetail = selectedWorkout.repDetails?.[index];
                          const isCorrect = repDetail?.correct ?? true;
                          
                          return (
                            <div 
                              key={index} 
                              className={`relative rounded-lg overflow-hidden border-2 ${
                                isCorrect ? 'border-green-500' : 'border-red-500'
                              }`}
                            >
                              <img
                                src={screenshot}
                                alt={`Rep ${index + 1}`}
                                className="w-full h-auto"
                              />
                              <div className={`absolute top-2 right-2 ${
                                isCorrect ? 'bg-green-500' : 'bg-red-500'
                              } text-white px-2 py-1 rounded-full text-xs font-bold`}>
                                {isCorrect ? '✓' : '✗'}
                              </div>
                              <div className="absolute bottom-0 left-0 right-0 bg-black/80 px-2 py-2 text-white">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-bold">Rep {index + 1}</span>
                                  <span className="text-xs">
                                    {isCorrect ? 'Correct' : 'Incorrect'}
                                  </span>
                                </div>
                                {repDetail && (
                                  <div className="text-xs text-gray-300 mt-1">
                                    {repDetail.min_elbow && `Elbow: ${repDetail.min_elbow}°`}
                                    {repDetail.angle && `Angle: ${repDetail.angle}°`}
                                    {repDetail.knee_angle && `Knee: ${repDetail.knee_angle}°`}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
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

      {/* PDF Viewer Modal */}
      {showPDFViewer && (selectedWorkout?.pdfDataUrl || selectedWorkout?.pdfUrl) && (
        <PDFViewer
          pdfUrl={selectedWorkout.pdfUrl || selectedWorkout.pdfDataUrl || ''}
          athleteName={selectedWorkout.athleteName}
          activityName={selectedWorkout.activityName}
          onClose={() => setShowPDFViewer(false)}
        />
      )}
    </div>
  );
};

export default SAIAthleteDetailPage;

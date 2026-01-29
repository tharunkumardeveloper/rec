import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Play, FileText, Image as ImageIcon, X } from 'lucide-react';
import { StoredWorkout } from '@/services/workoutStorageService';
import PDFViewer from './PDFViewer';

interface AthleteWorkoutDetailProps {
  athleteName: string;
  coachName?: string; // For SAI admin view
  workouts: StoredWorkout[];
  selectedWorkout: StoredWorkout;
  onBack: () => void;
  onWorkoutSelect: (workout: StoredWorkout) => void;
  isSAIAdmin?: boolean;
}

const AthleteWorkoutDetail = ({
  athleteName,
  coachName,
  workouts,
  selectedWorkout,
  onBack,
  onWorkoutSelect,
  isSAIAdmin = false
}: AthleteWorkoutDetailProps) => {
  const [showPDFViewer, setShowPDFViewer] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h2 className="text-lg font-bold">{athleteName}</h2>
            {isSAIAdmin && coachName && (
              <p className="text-sm text-muted-foreground">Coach: {coachName}</p>
            )}
          </div>
        </div>

        {/* Workout Selector */}
        <div className="flex overflow-x-auto gap-2 pb-2 -mx-4 px-4">
          {workouts.map((workout) => (
            <button
              key={workout.id}
              onClick={() => onWorkoutSelect(workout)}
              className={`flex-shrink-0 p-3 rounded-lg border-2 transition-all min-w-[140px] ${
                selectedWorkout.id === workout.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-card hover:border-primary/50'
              }`}
            >
              <p className="font-semibold text-sm truncate">{workout.activityName}</p>
              <p className="text-xs text-muted-foreground">{formatDate(workout.timestamp)}</p>
              <Badge 
                className={`mt-1 ${workout.accuracy >= 80 ? 'bg-green-500' : 'bg-yellow-500'}`}
                variant="secondary"
              >
                {workout.accuracy}%
              </Badge>
            </button>
          ))}
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-blue-600">{selectedWorkout.totalReps}</div>
              <div className="text-xs text-blue-600/80 font-medium">Total Reps</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-green-600">{selectedWorkout.correctReps}</div>
              <div className="text-xs text-green-600/80 font-medium">Correct</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-red-600">{selectedWorkout.incorrectReps}</div>
              <div className="text-xs text-red-600/80 font-medium">Incorrect</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-purple-600">{formatDuration(selectedWorkout.duration)}</div>
              <div className="text-xs text-purple-600/80 font-medium">Duration</div>
            </CardContent>
          </Card>
        </div>

        {/* Accuracy Progress */}
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold">Form Accuracy</span>
              <span className="text-lg font-bold">{selectedWorkout.accuracy}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  selectedWorkout.accuracy >= 80 ? 'bg-green-500' : 
                  selectedWorkout.accuracy >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${selectedWorkout.accuracy}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Form Score: {selectedWorkout.formScore}
            </p>
          </CardContent>
        </Card>

        {/* Video Player */}
        {(selectedWorkout.videoUrl || selectedWorkout.videoDataUrl) && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center">
                <Play className="w-4 h-4 mr-2" />
                Workout Video
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="relative w-full bg-black" style={{ paddingBottom: '56.25%' }}>
                <video
                  src={selectedWorkout.videoUrl || selectedWorkout.videoDataUrl}
                  controls
                  playsInline
                  crossOrigin="anonymous"
                  className="absolute top-0 left-0 w-full h-full"
                  controlsList="nodownload"
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            </CardContent>
          </Card>
        )}

        {/* PDF Report */}
        {(selectedWorkout.pdfUrl || selectedWorkout.pdfDataUrl) && (
          <Card>
            <CardContent className="p-4">
              <Button 
                onClick={() => setShowPDFViewer(true)}
                className="w-full"
                variant="outline"
              >
                <FileText className="w-4 h-4 mr-2" />
                View PDF Report
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Screenshots Gallery */}
        {selectedWorkout.screenshots && selectedWorkout.screenshots.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center">
                <ImageIcon className="w-4 h-4 mr-2" />
                Screenshots ({selectedWorkout.screenshots.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {selectedWorkout.screenshots.map((screenshot, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(screenshot)}
                    className="relative aspect-video rounded-lg overflow-hidden bg-black hover:opacity-90 transition-opacity"
                  >
                    <img
                      src={screenshot}
                      alt={`Screenshot ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* PDF Viewer Modal */}
      {showPDFViewer && (selectedWorkout.pdfUrl || selectedWorkout.pdfDataUrl) && (
        <PDFViewer
          pdfUrl={selectedWorkout.pdfUrl || selectedWorkout.pdfDataUrl!}
          athleteName={selectedWorkout.athleteName}
          activityName={selectedWorkout.activityName}
          onClose={() => setShowPDFViewer(false)}
        />
      )}

      {/* Image Zoom Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <img
            src={selectedImage}
            alt="Zoomed screenshot"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
};

export default AthleteWorkoutDetail;

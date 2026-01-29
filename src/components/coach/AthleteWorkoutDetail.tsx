import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Play, FileText, Image as ImageIcon, X, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  const screenshots = selectedWorkout.screenshots || [];

  // Handle keyboard navigation for image zoom
  useEffect(() => {
    if (selectedImageIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        navigateImage('prev');
      } else if (e.key === 'ArrowRight') {
        navigateImage('next');
      } else if (e.key === 'Escape') {
        setSelectedImageIndex(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImageIndex, screenshots.length]);

  // Handle touch swipe for image navigation
  useEffect(() => {
    if (selectedImageIndex === null) return;

    let touchStartX = 0;
    let touchEndX = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.changedTouches[0].screenX;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    };

    const handleSwipe = () => {
      const swipeThreshold = 50;
      if (touchStartX - touchEndX > swipeThreshold) {
        navigateImage('next');
      } else if (touchEndX - touchStartX > swipeThreshold) {
        navigateImage('prev');
      }
    };

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [selectedImageIndex, screenshots.length]);

  const navigateImage = (direction: 'prev' | 'next') => {
    if (selectedImageIndex === null) return;

    if (direction === 'prev') {
      setSelectedImageIndex(selectedImageIndex > 0 ? selectedImageIndex - 1 : screenshots.length - 1);
    } else {
      setSelectedImageIndex(selectedImageIndex < screenshots.length - 1 ? selectedImageIndex + 1 : 0);
    }
  };

  const getRepCountForScreenshot = (index: number): string => {
    // Calculate which rep this screenshot represents
    const totalScreenshots = screenshots.length;
    const totalReps = selectedWorkout.totalReps;
    
    if (totalScreenshots === 0 || totalReps === 0) return '';
    
    // Distribute reps evenly across screenshots
    const repNumber = Math.floor((index / totalScreenshots) * totalReps) + 1;
    return `Rep ${repNumber}`;
  };

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
            <p className="text-sm text-muted-foreground">{selectedWorkout.activityName}</p>
          </div>
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
        {screenshots.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center">
                <ImageIcon className="w-4 h-4 mr-2" />
                Screenshots ({screenshots.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {screenshots.map((screenshot, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className="relative aspect-video rounded-lg overflow-hidden bg-black hover:opacity-90 transition-opacity group"
                  >
                    <img
                      src={screenshot}
                      alt={`Screenshot ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                      <p className="text-white text-xs font-semibold">
                        {getRepCountForScreenshot(index)}
                      </p>
                    </div>
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

      {/* Image Zoom Modal with Swipe Navigation */}
      {selectedImageIndex !== null && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setSelectedImageIndex(null)}
        >
          {/* Close Button */}
          <button
            onClick={() => setSelectedImageIndex(null)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {/* Image Counter */}
          <div className="absolute top-4 left-4 bg-black/50 px-3 py-1 rounded-full z-10">
            <p className="text-white text-sm font-medium">
              {selectedImageIndex + 1} / {screenshots.length}
            </p>
          </div>

          {/* Rep Counter */}
          <div className="absolute top-14 left-4 bg-black/50 px-3 py-1 rounded-full z-10">
            <p className="text-white text-sm font-medium">
              {getRepCountForScreenshot(selectedImageIndex)}
            </p>
          </div>

          {/* Previous Button */}
          {screenshots.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigateImage('prev');
              }}
              className="absolute left-4 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
          )}

          {/* Image */}
          <img
            src={screenshots[selectedImageIndex]}
            alt={`Screenshot ${selectedImageIndex + 1}`}
            className="max-w-full max-h-full object-contain px-16"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Next Button */}
          {screenshots.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigateImage('next');
              }}
              className="absolute right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          )}

          {/* Swipe Hint */}
          {screenshots.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 px-4 py-2 rounded-full z-10">
              <p className="text-white text-xs">
                Swipe or use arrow keys to navigate
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default AthleteWorkoutDetail;

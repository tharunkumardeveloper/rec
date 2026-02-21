import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Clock, Activity, CheckCircle, XCircle, FileText, Video, Image as ImageIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { format } from 'date-fns';

export default function WorkoutDetailPage() {
    const { workoutId } = useParams();
    const navigate = useNavigate();
    const [workout, setWorkout] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
    const [showPDF, setShowPDF] = useState(false);
    const [showVideo, setShowVideo] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || 'https://rec-backend-yi7u.onrender.com';

    useEffect(() => {
        loadWorkout();
    }, [workoutId]);

    const loadWorkout = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/sessions/${workoutId}`);
            if (response.ok) {
                const data = await response.json();
                setWorkout(data);
            } else {
                console.error('Failed to load workout');
            }
        } catch (error) {
            console.error('Error loading workout:', error);
        } finally {
            setLoading(false);
        }
    };

    const navigateImage = (direction: 'prev' | 'next') => {
        if (selectedImageIndex === null || !workout?.screenshots) return;

        if (direction === 'prev') {
            setSelectedImageIndex(selectedImageIndex > 0 ? selectedImageIndex - 1 : workout.screenshots.length - 1);
        } else {
            setSelectedImageIndex(selectedImageIndex < workout.screenshots.length - 1 ? selectedImageIndex + 1 : 0);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-purple-300 mt-4">Loading workout...</p>
                </div>
            </div>
        );
    }

    if (!workout) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 flex items-center justify-center">
                <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20 max-w-md">
                    <CardContent className="p-8 text-center">
                        <Activity className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">Workout Not Found</h3>
                        <p className="text-purple-300 mb-6">This workout may have been deleted or doesn't exist.</p>
                        <Button onClick={() => navigate(-1)} className="bg-purple-600">
                            Go Back
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const screenshots = workout.screenshots || [];
    const repDetails = workout.repDetails || [];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 pb-20">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-black/60 backdrop-blur-xl border-b border-purple-500/20">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-3">
                        <Button
                            onClick={() => navigate(-1)}
                            variant="ghost"
                            size="sm"
                            className="text-white hover:bg-white/10"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-white">Workout Report</h1>
                            <p className="text-purple-300 text-sm">{workout.athleteName}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
                {/* Workout Summary */}
                <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="w-6 h-6 text-purple-400" />
                            {workout.activityName}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-4 bg-purple-900/30 rounded-lg">
                                <p className="text-3xl font-bold text-white">{workout.totalReps || 0}</p>
                                <p className="text-sm text-purple-300">Total Reps</p>
                            </div>
                            <div className="text-center p-4 bg-green-900/30 rounded-lg">
                                <p className="text-3xl font-bold text-white">{workout.correctReps || 0}</p>
                                <p className="text-sm text-green-300">Correct</p>
                            </div>
                            <div className="text-center p-4 bg-red-900/30 rounded-lg">
                                <p className="text-3xl font-bold text-white">{workout.incorrectReps || 0}</p>
                                <p className="text-sm text-red-300">Incorrect</p>
                            </div>
                            <div className="text-center p-4 bg-blue-900/30 rounded-lg">
                                <p className="text-3xl font-bold text-white">{workout.accuracy || 0}%</p>
                                <p className="text-sm text-blue-300">Accuracy</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-purple-300">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                {format(new Date(workout.timestamp), 'MMM dd, yyyy')}
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                {workout.duration || 0}s
                            </div>
                            <Badge className="bg-purple-600">
                                {workout.formScore || 'N/A'}
                            </Badge>
                        </div>

                        {/* Media Buttons */}
                        <div className="flex gap-2">
                            {workout.pdfUrl && (
                                <Button
                                    onClick={() => setShowPDF(true)}
                                    variant="outline"
                                    className="flex-1 border-purple-500/50"
                                >
                                    <FileText className="w-4 h-4 mr-2" />
                                    View PDF Report
                                </Button>
                            )}
                            {workout.videoUrl && (
                                <Button
                                    onClick={() => setShowVideo(true)}
                                    variant="outline"
                                    className="flex-1 border-purple-500/50"
                                >
                                    <Video className="w-4 h-4 mr-2" />
                                    Watch Video
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Rep Details */}
                {repDetails.length > 0 && (
                    <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
                        <CardHeader>
                            <CardTitle>Rep-by-Rep Analysis</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {repDetails.map((rep: any, idx: number) => (
                                    <div
                                        key={idx}
                                        className="flex items-center justify-between p-3 bg-purple-900/20 rounded-lg"
                                    >
                                        <div className="flex items-center gap-3">
                                            {rep.correct ? (
                                                <CheckCircle className="w-5 h-5 text-green-400" />
                                            ) : (
                                                <XCircle className="w-5 h-5 text-red-400" />
                                            )}
                                            <span className="text-white font-medium">Rep {rep.rep}</span>
                                        </div>
                                        <Badge variant={rep.correct ? 'default' : 'destructive'}>
                                            {rep.correct ? 'Correct' : 'Incorrect'}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Screenshots */}
                {screenshots.length > 0 && (
                    <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ImageIcon className="w-5 h-5" />
                                Screenshots ({screenshots.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {screenshots.map((screenshot: string, idx: number) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImageIndex(idx)}
                                        className="relative aspect-video rounded-lg overflow-hidden bg-purple-900/20 hover:ring-2 hover:ring-purple-500 transition-all"
                                    >
                                        <img
                                            src={screenshot}
                                            alt={`Rep ${idx + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-2">
                                            <p className="text-xs text-white text-center">Rep {idx + 1}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Image Viewer Modal */}
            {selectedImageIndex !== null && (
                <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
                    <button
                        onClick={() => setSelectedImageIndex(null)}
                        className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6 text-white" />
                    </button>

                    <button
                        onClick={() => navigateImage('prev')}
                        className="absolute left-4 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <ChevronLeft className="w-6 h-6 text-white" />
                    </button>

                    <button
                        onClick={() => navigateImage('next')}
                        className="absolute right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <ChevronRight className="w-6 h-6 text-white" />
                    </button>

                    <div className="max-w-4xl w-full">
                        <img
                            src={screenshots[selectedImageIndex]}
                            alt={`Rep ${selectedImageIndex + 1}`}
                            className="w-full h-auto rounded-lg"
                        />
                        <p className="text-white text-center mt-4">
                            Rep {selectedImageIndex + 1} of {screenshots.length}
                        </p>
                    </div>
                </div>
            )}

            {/* PDF Viewer Modal */}
            {showPDF && workout.pdfUrl && (
                <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="max-w-4xl w-full h-[90vh] bg-white rounded-lg overflow-hidden">
                        <div className="flex items-center justify-between p-4 bg-purple-600">
                            <h3 className="text-white font-bold">PDF Report</h3>
                            <button
                                onClick={() => setShowPDF(false)}
                                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-white" />
                            </button>
                        </div>
                        <iframe
                            src={workout.pdfUrl}
                            className="w-full h-full"
                            title="Workout PDF Report"
                        />
                    </div>
                </div>
            )}

            {/* Video Viewer Modal */}
            {showVideo && workout.videoUrl && (
                <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="max-w-4xl w-full">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-white font-bold text-xl">Workout Video</h3>
                            <button
                                onClick={() => setShowVideo(false)}
                                className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <X className="w-6 h-6 text-white" />
                            </button>
                        </div>
                        <video
                            src={workout.videoUrl}
                            controls
                            autoPlay
                            className="w-full rounded-lg"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

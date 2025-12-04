import { useState, useEffect } from 'react';
import { Target } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import VideoProcessor from '@/components/workout/VideoProcessor';
import '@/styles/test-mode-theme.css';

interface Workout {
    name: string;
    image: string;
    description: string;
    muscles: string[];
    category: string;
    steps: string[];
    mistakes: string[];
}

interface TestWorkoutInterfaceProps {
    activity: Workout;
    onComplete: (results: any) => void;
    onBack: () => void;
}

// Video mapping for test videos
const testVideoMap: Record<string, string> = {
    'Push-ups': '/test-videos/pushup.mp4',
    'Pull-ups': '/test-videos/pullup.mp4',
    'Sit-ups': '/test-videos/situp.mp4',
    'Shuttle Run': '/test-videos/shuttlerun.mp4',
    'Sit Reach': '/test-videos/sit&reach.mp4',
    'Vertical Jump': '/test-videos/vertical.mp4'
};

const TestWorkoutInterface = ({ activity, onComplete, onBack }: TestWorkoutInterfaceProps) => {
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Fetch test video and convert to File object
        const loadTestVideo = async () => {
            try {
                setIsLoading(true);
                const videoPath = testVideoMap[activity.name];

                if (!videoPath) {
                    throw new Error(`No test video found for ${activity.name}`);
                }

                console.log('🎯 Loading test video:', videoPath);

                // Fetch the video from public directory
                const response = await fetch(videoPath);

                if (!response.ok) {
                    throw new Error(`Failed to load test video: ${response.statusText}`);
                }

                const blob = await response.blob();

                // Convert blob to File object
                const file = new File([blob], `${activity.name.replace(/\s+/g, '_')}_test.mp4`, {
                    type: 'video/mp4'
                });

                console.log('✅ Test video loaded:', file.name, file.size, 'bytes');
                setVideoFile(file);
                setIsLoading(false);

            } catch (err) {
                console.error('❌ Error loading test video:', err);
                const errorMessage = err instanceof Error ? err.message : 'Failed to load test video';
                setError(errorMessage);
                toast.error(errorMessage);
                setIsLoading(false);
            }
        };

        loadTestVideo();
    }, [activity.name]);

    const handleComplete = (results: any) => {
        // Add isTestMode flag to results
        const testModeResults = {
            ...results,
            isTestMode: true,
            activityName: activity.name
        };

        console.log('🎯 Test Mode workout complete:', testModeResults);
        onComplete(testModeResults);
    };

    const handleRetry = () => {
        // Reload the video
        setVideoFile(null);
        setIsLoading(true);
        setError(null);

        // Trigger reload
        const loadTestVideo = async () => {
            try {
                const videoPath = testVideoMap[activity.name];
                const response = await fetch(videoPath);
                const blob = await response.blob();
                const file = new File([blob], `${activity.name.replace(/\s+/g, '_')}_test.mp4`, {
                    type: 'video/mp4'
                });
                setVideoFile(file);
                setIsLoading(false);
            } catch (err) {
                console.error('Error reloading test video:', err);
                toast.error('Failed to reload test video');
                setIsLoading(false);
            }
        };

        loadTestVideo();
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-red-950 via-gray-900 to-black flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Target className="w-16 h-16 text-red-400 animate-spin mx-auto" />
                    <h2 className="text-xl font-bold text-red-200">Loading Test Video...</h2>
                    <p className="text-red-400 text-sm">{activity.name}</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !videoFile) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-red-950 via-gray-900 to-black flex items-center justify-center p-4">
                <div className="bg-red-900/50 border-2 border-red-500/50 rounded-xl p-6 text-center max-w-md">
                    <Target className="w-16 h-16 text-red-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-red-100 mb-2">Video Load Error</h3>
                    <p className="text-red-300 mb-4">{error || 'Failed to load test video'}</p>
                    <button
                        onClick={onBack}
                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    // Render VideoProcessor with red theme wrapper
    return (
        <div className="test-mode-wrapper">
            <VideoProcessor
                videoFile={videoFile}
                activityName={activity.name}
                onBack={onBack}
                onRetry={handleRetry}
                onComplete={handleComplete}
            />
        </div>
    );
};

export default TestWorkoutInterface;

import { useState } from 'react';
import { toast } from '@/components/ui/sonner';
import GhostWorkoutUploadScreen from '@/components/workout/GhostWorkoutUploadScreen';
import GhostVideoProcessor from '@/components/workout/GhostVideoProcessor';
import GhostLiveRecorder from '@/components/workout/GhostLiveRecorder';
import HowToPerformScreen from './HowToPerformScreen';
import PostureCheckScreen from './PostureCheckScreen';
import { BADGES, checkBadgeUnlock, updateUserStats } from '@/utils/badgeSystem';
import { getUserStats, saveUserStats, getUnlockedBadges, unlockBadge } from '@/utils/workoutStorage';

interface GhostWorkoutInterfaceProps {
    activity: {
        name: string;
        rating: number;
        muscles: string;
    };
    mode: 'upload' | 'live';
    ghostGif: string;
    onBack: () => void;
}

const GhostWorkoutInterface = ({ activity, mode, ghostGif, onBack }: GhostWorkoutInterfaceProps) => {
    const [stage, setStage] = useState<'upload' | 'processing' | 'howToPerform' | 'postureCheck' | 'liveRecording' | 'liveResults'>(
        mode === 'live' ? 'howToPerform' : 'upload'
    );
    const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
    const [liveResults, setLiveResults] = useState<any>(null);

    console.log('GhostWorkoutInterface - Stage:', stage, 'Mode:', mode, 'GhostGif:', ghostGif);

    const handleVideoSelected = (file: File) => {
        console.log('Video selected:', file.name);
        setSelectedVideo(file);
        setStage('processing');
    };

    const handleRetry = () => {
        console.log('Retrying upload');
        setSelectedVideo(null);
        setStage('upload');
    };

    const handleHowToPerformContinue = () => {
        setStage('postureCheck');
    };

    const handlePostureConfirmed = () => {
        setStage('liveRecording');
    };

    const handleWorkoutComplete = async (results: any) => {
        // Get current stats and badges
        const currentStats = getUserStats();
        const previouslyUnlocked = getUnlockedBadges();

        // Update stats
        const updatedStats = updateUserStats(currentStats, {
            activityName: activity.name,
            reps: results.setsCompleted || results.stats?.totalReps || 0,
            correctReps: results.stats?.correctReps || results.setsCompleted || 0,
            duration: results.duration || 0,
            posture: results.posture
        });

        saveUserStats(updatedStats);

        // Check for newly unlocked badges
        const newlyUnlocked: string[] = [];
        let challengeBadgeUnlocked = false;

        BADGES.forEach(badge => {
            if (!previouslyUnlocked.includes(badge.id)) {
                if (checkBadgeUnlock(badge, updatedStats)) {
                    newlyUnlocked.push(badge.id);
                    unlockBadge(badge.id); // Actually unlock the badge
                }
            }
        });

        // Check if this workout is part of an active challenge
        const activeChallengeData = localStorage.getItem('active_challenge');
        if (activeChallengeData) {
            try {
                const { challengeId, workoutIndex } = JSON.parse(activeChallengeData);
                const { updateChallengeProgress, FEATURED_CHALLENGES } = await import('@/utils/challengeSystem');

                const isCompleted = updateChallengeProgress(challengeId, workoutIndex);

                if (isCompleted) {
                    const challenge = FEATURED_CHALLENGES.find(c => c.id === challengeId);
                    if (challenge) {
                        if (!previouslyUnlocked.includes(challenge.badge.id)) {
                            unlockBadge(challenge.badge.id);
                            newlyUnlocked.push(challenge.badge.id);
                            challengeBadgeUnlocked = true;
                        }

                        toast.success('🎉 Challenge Completed!', {
                            description: `You earned ${challenge.rewards.coins} coins and the ${challenge.badge.name} badge!`,
                            duration: 6000,
                        });
                    }

                    localStorage.removeItem('active_challenge');
                } else {
                    toast.success('Workout completed!', {
                        description: 'Keep going to complete the challenge',
                        duration: 3000,
                    });
                }
            } catch (error) {
                console.error('Error processing challenge:', error);
            }
        }

        if (newlyUnlocked.length > 0 && !challengeBadgeUnlocked) {
            const badgeNames = newlyUnlocked
                .map(id => BADGES.find(b => b.id === id)?.name)
                .filter(Boolean)
                .join(', ');

            toast.success(`🏆 Badge${newlyUnlocked.length > 1 ? 's' : ''} Unlocked!`, {
                description: badgeNames,
                duration: 5000,
            });
        }

        const workoutData = {
            id: Date.now(),
            activityName: activity.name,
            posture: results.posture,
            setsCompleted: results.setsCompleted,
            badSets: results.badSets,
            duration: results.duration,
            timestamp: new Date().toISOString(),
            videoUrl: results.videoUrl,
            badgesEarned: newlyUnlocked,
            coinsEarned: results.posture === 'Good' ? 75 : 40, // Ghost mode gives more coins
            correctReps: results.stats?.correctReps || 0,
            totalReps: results.stats?.totalReps || results.setsCompleted,
            isGhostMode: true, // Mark as ghost mode workout
            mode: mode, // Track if it was live or upload
            ...results
        };

        const { addWorkoutToHistory } = await import('@/utils/workoutStorage');
        const videoSource = results.videoBlob || selectedVideo || results.videoUrl;
        await addWorkoutToHistory(workoutData, videoSource);

        onBack();
    };

    if (stage === 'howToPerform') {
        return (
            <HowToPerformScreen
                activityName={activity.name}
                onContinue={handleHowToPerformContinue}
                onBack={onBack}
            />
        );
    }

    if (stage === 'postureCheck') {
        return (
            <PostureCheckScreen
                activityName={activity.name}
                onPostureConfirmed={handlePostureConfirmed}
                onBack={onBack}
            />
        );
    }

    if (stage === 'processing') {
        return (
            <GhostVideoProcessor
                videoFile={selectedVideo}
                activityName={activity.name}
                onBack={onBack}
                onComplete={handleWorkoutComplete}
            />
        );
    }

    if (stage === 'liveRecording') {
        return (
            <GhostLiveRecorder
                activityName={activity.name}
                ghostGif={ghostGif}
                onBack={onBack}
                onComplete={(results) => {
                    setLiveResults(results);
                    setStage('liveResults');
                }}
            />
        );
    }

    if (stage === 'liveResults') {
        return (
            <GhostVideoProcessor
                videoFile={null}
                activityName={activity.name}
                onBack={onBack}
                onComplete={handleWorkoutComplete}
                liveResults={liveResults}
            />
        );
    }

    if (stage === 'upload') {
        console.log('Rendering GhostWorkoutUploadScreen');
        return (
            <GhostWorkoutUploadScreen
                activityName={activity.name}
                ghostGif={ghostGif}
                onBack={onBack}
                onVideoSelected={handleVideoSelected}
            />
        );
    }

    // Fallback - should never reach here
    console.error('GhostWorkoutInterface - Invalid stage:', stage);
    return (
        <div className="ghost-mode-page min-h-screen bg-gradient-to-b from-purple-950 via-gray-900 to-black flex items-center justify-center">
            <div className="text-purple-100 text-center">
                <p>Something went wrong</p>
                <button onClick={onBack} className="mt-4 px-4 py-2 bg-purple-600 rounded">
                    Go Back
                </button>
            </div>
        </div>
    );
};

export default GhostWorkoutInterface;

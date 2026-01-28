import { useState } from 'react';
import { toast } from '@/components/ui/sonner';
import WorkoutUploadScreen from './WorkoutUploadScreen';
import VideoProcessor from './VideoProcessor';
import LiveCameraProcessor from './LiveCameraProcessor';
import LiveRecorderClean from './LiveRecorderClean';
import HowToPerformScreen from './HowToPerformScreen';
import PostureCheckScreen from './PostureCheckScreen';
import WorkoutResultsScreen from './WorkoutResultsScreen';
import { BADGES, checkBadgeUnlock, updateUserStats } from '@/utils/badgeSystem';
import { getUserStats, saveUserStats, getUnlockedBadges, unlockBadge } from '@/utils/workoutStorage';

interface WorkoutInterfaceProps {
  activity: {
    name: string;
    rating: number;
    muscles: string;
  };
  mode: 'upload' | 'live';
  onBack: () => void;
}

const WorkoutInterface = ({ activity, mode, onBack }: WorkoutInterfaceProps) => {
  const [stage, setStage] = useState<'upload' | 'processing' | 'live' | 'howToPerform' | 'postureCheck' | 'liveRecording' | 'liveResults'>(
    mode === 'live' ? 'howToPerform' : 'upload'
  );
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [liveResults, setLiveResults] = useState<any>(null);

  // Activities with available Python scripts
  const supportedActivities = [
    'Push-ups',
    'Pull-ups',
    'Sit-ups',
    'Vertical Jump',
    'Shuttle Run',
    'Modified Shuttle Run',
    'Sit Reach',
    'Vertical Broad Jump',
    'Standing Broad Jump'
  ];
  const isSupported = supportedActivities.includes(activity.name);

  // Activities with live recording support
  const liveRecordingSupported = [
    'Push-ups',
    'Pull-ups',
    'Sit-ups',
    'Vertical Jump',
    'Shuttle Run',
    'Modified Shuttle Run'
  ];
  const hasLiveRecording = liveRecordingSupported.includes(activity.name);

  const handleVideoSelected = (file: File) => {
    setSelectedVideo(file);
    setStage('processing');
  };

  const handleLiveRecordingStart = () => {
    setStage('live');
  };

  const handleLiveRecordingComplete = (file: File) => {
    setSelectedVideo(file);
    setStage('processing');
  };

  const handleRetry = () => {
    setSelectedVideo(null);
    setLiveResults(null);
    setStage(mode === 'live' ? 'howToPerform' : 'upload');
  };

  const handleHowToPerformContinue = () => {
    setStage('postureCheck');
  };

  const handlePostureConfirmed = () => {
    setStage('liveRecording');
  };

  const handleWorkoutComplete = async (results: any) => {
    // Update user stats
    const currentStats = getUserStats();
    const updatedStats = updateUserStats(currentStats, {
      activityName: activity.name,
      setsCompleted: results.setsCompleted,
      badSets: results.badSets,
      posture: results.posture
    });
    saveUserStats(updatedStats);

    // Check for newly unlocked badges
    const previouslyUnlocked = getUnlockedBadges();
    const newlyUnlocked: string[] = [];

    BADGES.forEach(badge => {
      if (!previouslyUnlocked.includes(badge.id) && checkBadgeUnlock(badge, updatedStats)) {
        unlockBadge(badge.id);
        newlyUnlocked.push(badge.id);
      }
    });

    // Check for challenge completion
    const activeChallengeData = localStorage.getItem('active_challenge');
    let challengeBadgeUnlocked = false;

    if (activeChallengeData) {
      try {
        const { challengeId, workoutIndex } = JSON.parse(activeChallengeData);
        const { updateChallengeProgress, FEATURED_CHALLENGES } = await import('@/utils/challengeSystem');

        const isCompleted = updateChallengeProgress(challengeId, workoutIndex);

        if (isCompleted) {
          const challenge = FEATURED_CHALLENGES.find(c => c.id === challengeId);
          if (challenge) {
            // Unlock challenge badge
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

          // Clear active challenge
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

    // Show toast for newly unlocked badges (non-challenge)
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

    // Save workout to localStorage for Reports tab
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
      coinsEarned: results.posture === 'Good' ? 50 : 25,
      correctReps: results.stats?.correctReps || 0,
      totalReps: results.stats?.totalReps || results.setsCompleted,
      isGhostMode: false, // Mark as normal mode workout
      mode: mode, // Track if it was live or upload
      ...results
    };

    // Use utility function to add workout with thumbnail generation
    const { addWorkoutToHistory } = await import('@/utils/workoutStorage');

    // Pass video blob, file, or URL for thumbnail generation (in order of preference)
    const videoSource = results.videoBlob || selectedVideo || results.videoUrl;
    await addWorkoutToHistory(workoutData, videoSource);

    // Return to home/training tab
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
      <VideoProcessor
        videoFile={selectedVideo}
        activityName={activity.name}
        onBack={onBack}
        onRetry={handleRetry}
        onComplete={handleWorkoutComplete}
      />
    );
  }

  if (stage === 'live') {
    return (
      <LiveCameraProcessor
        activityName={activity.name}
        onBack={() => setStage('upload')}
        onComplete={handleLiveRecordingComplete}
      />
    );
  }

  if (stage === 'liveRecording') {
    return (
      <LiveRecorderClean
        activityName={activity.name}
        onBack={onBack}
        onComplete={(results) => {
          // Store live recording results
          setLiveResults(results);
          setStage('liveResults');
        }}
      />
    );
  }

  if (stage === 'liveResults') {
    // Show results screen for live recording
    if (liveResults) {
      return (
        <WorkoutResultsScreen
          activityName={activity.name}
          totalReps={liveResults.reps || 0}
          correctReps={liveResults.correctReps || 0}
          incorrectReps={(liveResults.reps || 0) - (liveResults.correctReps || 0)}
          duration={liveResults.duration || 0}
          repDetails={liveResults.repDetails}
          videoBlob={liveResults.videoBlob}
          onHome={async () => {
            // Process and save workout before going home
            await handleWorkoutComplete(liveResults);
          }}
        />
      );
    }
    
    // Fallback to VideoProcessor if no results
    return (
      <VideoProcessor
        videoFile={null}
        activityName={activity.name}
        onBack={onBack}
        onRetry={() => setStage('howToPerform')}
        onComplete={handleWorkoutComplete}
        liveResults={liveResults}
      />
    );
  }

  if (stage === 'upload') {
    return (
      <WorkoutUploadScreen
        activityName={activity.name}
        onBack={onBack}
        onVideoSelected={handleVideoSelected}
        onLiveRecordingStart={handleLiveRecordingStart}
        hasLiveRecording={hasLiveRecording}
      />
    );
  }

  return null;
};

export default WorkoutInterface;
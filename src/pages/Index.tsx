import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Trophy, Coins } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import LoadingScreen from '@/components/LoadingScreen';
import AuthFlow from '@/components/auth/AuthFlow';
import SetupFlow from '@/components/setup/SetupFlow';
import HomeScreen from '@/components/home/HomeScreen';
import CoachDashboard from '@/components/home/CoachDashboard';
import SAIAdminDashboard from '@/components/home/SAIAdminDashboard';
import GhostModeScreen from '@/components/ghost/GhostModeScreen';
import GhostWorkoutDetail from '@/components/ghost/GhostWorkoutDetail';
import GhostWorkoutInterface from '@/components/workout/GhostWorkoutInterface';
import TestModeTab from '@/components/test/TestModeTab';
import TestWorkoutDetail from '@/components/test/TestWorkoutDetail';
import TestWorkoutInterface from '@/components/test/TestWorkoutInterface';
import DiscoverTab from '@/components/tabs/DiscoverTab';
import ReportTab from '@/components/tabs/ReportTab';
import RoadmapTab from '@/components/tabs/RoadmapTab';
import ChallengesTab from '@/components/tabs/ChallengesTab';
import ChallengeDetail from '@/components/challenges/ChallengeDetail';
import ActivityDetail from '@/components/activities/ActivityDetail';
import WorkoutInterface from '@/components/workout/WorkoutInterface';
import ProfilePage from '@/components/profile/ProfilePage';
import SettingsPage from '@/components/settings/SettingsPage';
import BadgesScreen from '@/components/badges/BadgesScreen';
import { preloadAllAssets } from '@/utils/imagePreloader';
import { scrollToTop, scrollToTopInstant } from '@/utils/scrollToTop';

type AppState = 'loading' | 'auth' | 'setup' | 'home' | 'profile' | 'settings' | 'badges' | 'challenges' | 'challenge-detail' | 'ghost-mode' | 'ghost-workout-detail' | 'test-mode' | 'test-workout-detail' | 'test-workout-interface';
type UserRole = 'athlete' | 'coach' | 'admin';

const Index = () => {
  const [appState, setAppState] = useState<AppState>('loading');
  const [userRole, setUserRole] = useState<UserRole>('athlete');
  const [userName, setUserName] = useState('');
  const [activeTab, setActiveTab] = useState('training');
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [showWorkout, setShowWorkout] = useState(false);
  const [workoutMode, setWorkoutMode] = useState<'upload' | 'live'>('upload');
  const [ghostGif, setGhostGif] = useState<string | undefined>(undefined);
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [userSetupData, setUserSetupData] = useState<any>(null);
  const [selectedChallengeId, setSelectedChallengeId] = useState<string | null>(null);
  const [showGhostAnimation, setShowGhostAnimation] = useState(false);

  // Simulate checking for returning user and preload assets
  useEffect(() => {
    const isReturningUser = localStorage.getItem('talenttrack_user');
    if (isReturningUser) {
      const userData = JSON.parse(isReturningUser);
      setUserRole(userData.role);
      setUserName(userData.name);
      setIsFirstTime(false);
    }



    // Register service worker for offline support
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('✅ Service Worker registered:', registration.scope);
        })
        .catch((error) => {
          console.warn('⚠️ Service Worker registration failed:', error);
        });
    }

    // Preload critical images immediately (high priority)
    import('@/utils/imagePreloader').then(({ preloadCriticalAssets, preloadAllAssets }) => {
      // Load critical assets first
      preloadCriticalAssets().then(() => {
        console.log('✅ Critical assets loaded');
        // Then load remaining assets in background
        preloadAllAssets().catch(err => {
          console.warn('⚠️ Failed to preload some assets:', err);
        });
      });
    });
  }, []);

  const handleLoadingComplete = () => {
    scrollToTopInstant();
    // If returning user, skip to home
    if (!isFirstTime) {
      setAppState('home');
    } else {
      setAppState('auth');
    }
  };

  const handleLogin = (role: UserRole) => {
    scrollToTopInstant();
    setUserRole(role);
    // Set demo names based on role
    const names = {
      athlete: 'Ratheesh',
      coach: 'Rajesh Menon',
      admin: 'Arjun Krishnan'
    };
    setUserName(names[role]);

    // Check if user needs setup (simulate first-time login)
    if (isFirstTime) {
      setAppState('setup');
    } else {
      setAppState('home');
    }
  };

  const handleSetupComplete = (userData: any) => {
    scrollToTopInstant();
    // Save user data
    setUserSetupData(userData);
    localStorage.setItem('talenttrack_user', JSON.stringify({
      role: userRole,
      name: userName,
      setupComplete: true,
      ...userData
    }));
    setIsFirstTime(false);
    setAppState('home');
  };

  const handleActivitySelect = (activity: any) => {
    scrollToTop();
    // Handle both string (exercise name) and object (activity)
    if (typeof activity === 'string') {
      setSelectedActivity({ name: activity });
    } else {
      setSelectedActivity(activity);
    }
  };

  const handleActivityBack = () => {
    scrollToTop();
    setSelectedActivity(null);
    setShowWorkout(false);
    // Return to appropriate screen based on where we came from
    if (appState === 'ghost-workout-detail') {
      setAppState('ghost-mode');
    } else {
      setActiveTab('training');
    }
  };

  const handleStartWorkout = (mode: 'upload' | 'live') => {
    scrollToTop();
    setWorkoutMode(mode);
    setShowWorkout(true);
  };

  const handleProfileOpen = () => {
    scrollToTop();
    setAppState('profile');
  };

  const handleSettingsOpen = () => {
    scrollToTop();
    setAppState('settings');
  };

  const handleBadgesOpen = () => {
    scrollToTop();
    setAppState('badges');
  };

  const handleBackToHome = () => {
    scrollToTop();
    setAppState('home');
    setShowGhostAnimation(false); // No animation when going back
    setSelectedActivity(null); // Clear selected activity to prevent showing ActivityDetail
    setGhostGif(undefined); // Clear ghost gif
    setShowWorkout(false); // Clear workout state
  };

  const handleTabChange = (tab: string) => {
    scrollToTop();
    
    // Handle special modes that need their own app state
    if (tab === 'ghost-mode') {
      setAppState('ghost-mode');
      setShowGhostAnimation(true);
    } else if (tab === 'test-mode') {
      setAppState('test-mode');
    } else {
      setActiveTab(tab);
    }
  };

  const handleChallengeRedirect = (challengeId: string) => {
    scrollToTop();
    // Navigate to specific challenge detail page
    setSelectedChallengeId(challengeId);
    setAppState('challenge-detail');
  };

  const handleStartChallengeWorkout = (workoutName: string) => {
    scrollToTop();
    // Find the activity by name
    const activity = { name: workoutName };
    setSelectedActivity(activity);
    // Don't auto-start, let user choose mode
    setShowWorkout(false);
  };

  const renderTabContent = () => {
    // For coach and admin, use different content structure
    if (userRole === 'coach' || userRole === 'admin') {
      return null; // CoachDashboard handles its own content
    }

    switch (activeTab) {
      case 'discover':
        return <DiscoverTab onStartWorkout={handleActivitySelect} />;
      case 'report':
        return <ReportTab userSetupData={userSetupData} />;
      case 'roadmap':
        return <RoadmapTab onViewAllBadges={handleBadgesOpen} />;
      default:
        return null; // Training tab is handled separately
    }
  };

  // Show special pages first (before activity detail check)
  if (appState === 'profile') {
    return <ProfilePage userName={userName} userRole={userRole} onBack={handleBackToHome} onLogout={() => setAppState('auth')} />;
  }

  if (appState === 'settings') {
    return <SettingsPage onBack={handleBackToHome} userName={userName} userRole={userRole} />;
  }

  if (appState === 'badges') {
    return <BadgesScreen onBack={handleBackToHome} />;
  }

  if (appState === 'ghost-mode') {
    return (
      <GhostModeScreen
        onBack={handleBackToHome}
        onSelectActivity={(activity) => {
          setSelectedActivity(activity);
          setAppState('ghost-workout-detail');
          setShowGhostAnimation(false); // No animation when going to detail
        }}
        showAnimation={showGhostAnimation}
      />
    );
  }

  if (appState === 'test-mode') {
    return (
      <TestModeTab
        onBack={handleBackToHome}
        onWorkoutSelect={(workout) => {
          setSelectedActivity(workout);
          setAppState('test-workout-detail');
        }}
      />
    );
  }

  if (appState === 'test-workout-detail' && selectedActivity) {
    return (
      <TestWorkoutDetail
        activity={selectedActivity}
        onBack={() => {
          setAppState('test-mode');
          setSelectedActivity(null);
        }}
        onStartWorkout={() => {
          setAppState('test-workout-interface');
        }}
      />
    );
  }

  if (appState === 'test-workout-interface' && selectedActivity) {
    return (
      <TestWorkoutInterface
        activity={selectedActivity}
        onBack={() => {
          setAppState('test-workout-detail');
        }}
        onComplete={(results) => {
          console.log('Test Mode workout complete:', results);
          // Save results to workout history
          import('@/utils/workoutStorage').then(({ addWorkoutToHistory }) => {
            addWorkoutToHistory(results, results.videoBlob);
          });
          toast.success('Test evaluation complete!');
          setAppState('test-mode');
          setSelectedActivity(null);
        }}
      />
    );
  }

  // Show workout interface when workout is active (check this first)
  if (selectedActivity && showWorkout) {
    // Use GhostWorkoutInterface if ghostGif is provided (Ghost Mode)
    if (ghostGif) {
      return (
        <GhostWorkoutInterface
          activity={selectedActivity}
          mode={workoutMode}
          ghostGif={ghostGif}
          onBack={() => {
            console.log('GhostWorkoutInterface onBack called');
            setShowWorkout(false);
            setGhostGif(undefined);
            // Stay on ghost-workout-detail to show the detail screen again
          }}
        />
      );
    }
    
    // Use regular WorkoutInterface for normal mode
    return (
      <WorkoutInterface
        activity={selectedActivity}
        mode={workoutMode}
        onBack={() => {
          setShowWorkout(false);
          // Return to activity detail if we came from there
          if (appState === 'home') {
            // Stay on home, activity detail will show
          }
        }}
      />
    );
  }

  if (appState === 'ghost-workout-detail' && selectedActivity) {
    return (
      <GhostWorkoutDetail
        activity={selectedActivity}
        onBack={() => {
          setAppState('ghost-mode');
          setShowGhostAnimation(false); // No animation when going back
          setSelectedActivity(null); // Clear selected activity
        }}
        onStartWorkout={(mode, ghostGifUrl) => {
          console.log('Ghost Mode - Starting workout:', mode, ghostGifUrl);
          setWorkoutMode(mode);
          setGhostGif(ghostGifUrl);
          setShowWorkout(true);
        }}
      />
    );
  }

  // Show activity detail if selected (for normal training mode only)
  if (selectedActivity && appState === 'home') {
    return (
      <ActivityDetail
        activity={selectedActivity}
        onBack={handleActivityBack}
        onStartWorkout={handleStartWorkout}
      />
    );
  }

  if (appState === 'challenge-detail' && selectedChallengeId) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-primary border-b border-primary-dark safe-top">
          <div className="px-4 py-4">
            <div className="flex items-center space-x-3 max-w-7xl mx-auto">
              <Button variant="ghost" size="sm" onClick={handleBackToHome} className="text-white hover:bg-white/20">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex-1">
                <h1 className="text-lg md:text-xl font-semibold text-white">Challenge</h1>
                <p className="text-sm text-white/80">Complete all workouts to earn badge</p>
              </div>
            </div>
          </div>
        </div>
        <div className="px-4 py-6 max-w-7xl mx-auto">
          <ChallengeDetail
            challengeId={selectedChallengeId}
            onBack={handleBackToHome}
            onStartWorkout={handleStartChallengeWorkout}
          />
        </div>
      </div>
    );
  }

  // Main app state rendering
  switch (appState) {
    case 'loading':
      return <LoadingScreen onComplete={handleLoadingComplete} />;

    case 'auth':
      return <AuthFlow onLogin={handleLogin} />;

    case 'setup':
      return <SetupFlow onComplete={handleSetupComplete} onSkip={() => setAppState('home')} />;

    case 'home':
      return (
        <div className="min-h-screen bg-background lg:flex">
          {/* Desktop Sidebar Navigation */}
          <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:border-r lg:bg-card">
            <div className="flex flex-col flex-1 overflow-y-auto">
              {/* Logo/Brand */}
              <div className="flex items-center h-16 px-6 border-b bg-primary">
                <h1 className="text-xl font-bold text-white">TalentTrack</h1>
              </div>
              
              {/* Navigation Items */}
              <nav className="flex-1 px-4 py-6 space-y-2">
                {[
                  { id: 'training', label: 'Training', icon: '⚡' },
                  { id: 'discover', label: 'Discover', icon: '🔍' },
                  { id: 'report', label: 'Report', icon: '📊' },
                  { id: 'roadmap', label: 'Roadmap', icon: '🗺️' }
                ].map(({ id, label, icon }) => (
                  <button
                    key={id}
                    onClick={() => {
                      scrollToTop();
                      setActiveTab(id);
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      activeTab === id 
                        ? 'bg-primary text-primary-foreground font-semibold' 
                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                    }`}
                  >
                    <span className="text-2xl">{icon}</span>
                    <span className="text-sm">{label}</span>
                  </button>
                ))}
              </nav>

              {/* User Section */}
              <div className="p-4 border-t">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    {userName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{userName}</p>
                    <p className="text-xs text-muted-foreground capitalize">{userRole}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <button
                    onClick={handleProfileOpen}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm rounded-lg hover:bg-secondary transition-colors"
                  >
                    <span>👤</span>
                    <span>Profile</span>
                  </button>
                  <button
                    onClick={handleSettingsOpen}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm rounded-lg hover:bg-secondary transition-colors"
                  >
                    <span>⚙️</span>
                    <span>Settings</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:ml-64 flex-1">
            {userRole === 'coach' ? (
            <CoachDashboard
              userName={userName}
              onTabChange={handleTabChange}
              activeTab={activeTab}
              onProfileOpen={handleProfileOpen}
              onSettingsOpen={handleSettingsOpen}
            />
          ) : userRole === 'admin' ? (
            <SAIAdminDashboard
              userName={userName}
              onTabChange={setActiveTab}
              activeTab={activeTab}
              onProfileOpen={handleProfileOpen}
              onSettingsOpen={handleSettingsOpen}
            />
            ) : (
              <div className="min-h-screen bg-background">
                {/* Top Bar for all athlete tabs - Mobile Only */}
                <div className="sticky top-0 z-50 bg-primary border-b border-primary-dark safe-top lg:hidden">
                  <div className="px-4 py-4">
                    <div className="flex items-center justify-between max-w-7xl mx-auto">
                      <div>
                        <h1 className="text-lg font-semibold text-white">Welcome, {userName}</h1>
                        <p className="text-sm text-white/80 capitalize">{userRole}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={handleSettingsOpen}
                          className="tap-target p-2 rounded-lg hover:bg-white/20 transition-colors text-white text-lg"
                        >
                          ⚙️
                        </button>
                        <button
                          onClick={handleProfileOpen}
                          className="tap-target p-2 rounded-lg hover:bg-white/20 transition-colors text-white text-lg"
                        >
                          👤
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tab Content */}
                <div className="pb-20 lg:pb-8">
                  {activeTab === 'training' ? (
                    <HomeScreen
                      userRole={userRole}
                      userName={userName}
                      onTabChange={handleTabChange}
                      activeTab={activeTab}
                      onProfileOpen={handleProfileOpen}
                      onSettingsOpen={handleSettingsOpen}
                      onChallengeRedirect={handleChallengeRedirect}
                      onActivitySelect={handleActivitySelect}
                    />
                  ) : (
                    <div className="px-4 max-w-7xl mx-auto pt-6">
                      {renderTabContent()}
                    </div>
                  )}
                </div>

                {/* Bottom Navigation - Hidden on large screens */}
                <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-subtle border-t safe-bottom lg:hidden">
                  <div className="max-w-md mx-auto px-4 py-2">
                    <div className="flex justify-around">
                      {[
                        { id: 'training', label: 'Training', icon: '⚡' },
                        { id: 'discover', label: 'Discover', icon: '🔍' },
                        { id: 'report', label: 'Report', icon: '📊' },
                        { id: 'roadmap', label: 'Roadmap', icon: '🗺️' }
                      ].map(({ id, label, icon }) => (
                        <button
                          key={id}
                          onClick={() => {
                            scrollToTop();
                            setActiveTab(id);
                          }}
                          className={`flex flex-col items-center space-y-1 tap-target p-2 rounded-lg transition-colors ${activeTab === id ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                          <span className="text-lg">{icon}</span>
                          <span className="text-xs font-medium">{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      );

    default:
      return <LoadingScreen onComplete={handleLoadingComplete} />;
  }
};

export default Index;

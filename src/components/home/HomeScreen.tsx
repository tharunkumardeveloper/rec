import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Settings,
  User,
  Zap,
  Star,
  Ghost,
  ChevronRight,
  Trophy,
  Target
} from 'lucide-react';
import ChatWidget from '@/components/chat/ChatWidget';

// Import challenge images from root challenges folder
const pushupPowerImage = '/challenges/pushup-power.webp';
const pullupProgressionImage = '/challenges/pullup-progression.jpg';
const coreCrusherImage = '/challenges/core-crusher.avif';
const sprintMasterImage = '/challenges/sprint-master.jpg';
const flexibilityFoundationImage = '/challenges/flexibility-foundation.webp';
const jumpPowerImage = '/challenges/jump-power.jpg';
const adaptiveStrengthImage = '/challenges/adaptive-strength.jpg';

// Import activity images
import modifiedShuttleRunImage from '@/assets/activities/modified-shuttle-run.jpg';
import wideArmPushupImage from '@/assets/activities/wide-arm-pushup.jpg';
import kneePushupImage from '@/assets/activities/knee-pushup.jpg';
import inclinedPushupImage from '@/assets/activities/inclined-pushup.jpg';
import sitReachImage from '@/assets/activities/sit-reach.jpg';
import sitUpsImage from '@/assets/activities/sit-ups.jpg';
import shuttleRunGeneralImage from '@/assets/activities/shuttle-run.jpg';
import verticalJumpImage from '@/assets/activities/vertical-jump.jpg';
import pushupImage from '@/assets/activities/pushup.jpg';
import pullupImage from '@/assets/activities/pullup.webp';

// Squat image from public folder
const squatImage = '/squat.webp';

interface HomeScreenProps {
  userRole: 'athlete' | 'coach' | 'admin';
  userName: string;
  onTabChange: (tab: string) => void;
  activeTab: string;
  onProfileOpen?: () => void;
  onSettingsOpen?: () => void;
  onChallengeRedirect?: (challengeId: string) => void;
  onActivitySelect?: (activity: any) => void;
}

const HomeScreen = ({ userRole, userName, onTabChange, activeTab, onProfileOpen, onSettingsOpen, onChallengeRedirect, onActivitySelect }: HomeScreenProps) => {

  const getChallengeImage = (challengeId: string) => {
    switch (challengeId) {
      case 'push-up-power': return pushupPowerImage;
      case 'pull-up-progression': return pullupProgressionImage;
      case 'core-crusher': return coreCrusherImage;
      case 'sprint-master': return sprintMasterImage;
      case 'flexibility-foundation': return flexibilityFoundationImage;
      case 'jump-power': return jumpPowerImage;
      case 'adaptive-strength': return adaptiveStrengthImage;
      default: return pushupPowerImage;
    }
  };

  const challenges = [
    {
      id: 'push-up-power',
      title: 'Push-up Power',
      type: 'challenge-blue',
      difficulty: 'Beginner',
      duration: '5 workouts',
      participants: 2340,
      category: 'Strength'
    },
    {
      id: 'pull-up-progression',
      title: 'Pull-up Progression',
      type: 'challenge-purple',
      difficulty: 'Intermediate',
      duration: '5 workouts',
      participants: 1876,
      category: 'Strength'
    },
    {
      id: 'core-crusher',
      title: 'Core Crusher',
      type: 'challenge-blue',
      difficulty: 'Beginner',
      duration: '5 workouts',
      participants: 3210,
      category: 'Strength'
    },
    {
      id: 'sprint-master',
      title: 'Sprint Master',
      type: 'challenge-purple',
      difficulty: 'Intermediate',
      duration: '5 workouts',
      participants: 1543,
      category: 'Endurance'
    },
    {
      id: 'flexibility-foundation',
      title: 'Flexibility Foundation',
      type: 'challenge-light-blue',
      difficulty: 'Beginner',
      duration: '5 workouts',
      participants: 2890,
      category: 'Flexibility'
    },
    {
      id: 'jump-power',
      title: 'Jump Power',
      type: 'challenge-gray',
      difficulty: 'Intermediate',
      duration: '5 workouts',
      participants: 1234,
      category: 'Calisthenics'
    },
    {
      id: 'adaptive-strength',
      title: 'Adaptive Strength',
      type: 'challenge-maroon',
      difficulty: 'Beginner',
      duration: '5 workouts',
      participants: 987,
      category: 'Para-Athlete'
    }
  ];

  const getFilteredChallenges = () => {
    return challenges;
  };

  const activityTags = [
    'Flexibility', 'Endurance', 'Arm', 'Chest', 'Leg', 'Para-Athlete'
  ];

  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const allActivities = [
    // Arm exercises
    { name: 'Push-ups', rating: 4.8, image: pushupImage, muscles: 'Chest, Arms', tags: ['Arm', 'Chest'] },
    { name: 'Pull-ups', rating: 4.9, image: pullupImage, muscles: 'Back, Arms', tags: ['Arm'] },
    { name: 'Inclined Push-up', rating: 4.5, image: inclinedPushupImage, muscles: 'Chest, Arms', tags: ['Arm', 'Chest'] },
    { name: 'Knee Push-up', rating: 4.3, image: kneePushupImage, muscles: 'Chest, Arms', tags: ['Arm', 'Chest', 'Para-Athlete'] },
    { name: 'Wide Arm Push-up', rating: 4.6, image: wideArmPushupImage, muscles: 'Chest, Arms', tags: ['Arm', 'Chest'] },

    // Leg exercises
    { name: 'Squats', rating: 4.9, image: squatImage, muscles: 'Quads, Glutes, Hamstrings', tags: ['Leg'] },
    { name: 'Vertical Jump', rating: 4.6, image: verticalJumpImage, muscles: 'Legs', tags: ['Leg'] },

    // Endurance exercises
    { name: 'Shuttle Run', rating: 4.8, image: shuttleRunGeneralImage, muscles: 'Full Body', tags: ['Endurance', 'Leg'] },
    { name: 'Modified Shuttle Run', rating: 4.2, image: modifiedShuttleRunImage, muscles: 'Full Body', tags: ['Endurance', 'Para-Athlete'] },

    // Flexibility exercises
    { name: 'Sit Reach', rating: 4.5, image: sitReachImage, muscles: 'Hamstrings & Lower Back', tags: ['Flexibility'] },
    { name: 'Sit-ups', rating: 4.7, image: sitUpsImage, muscles: 'Core', tags: ['Flexibility'] }
  ];

  const getFilteredActivities = () => {
    if (selectedTags.length === 0) return allActivities;
    return allActivities.filter(activity =>
      selectedTags.some(tag => activity.tags.includes(tag))
    );
  };

  const activities = getFilteredActivities();

  return (
    <>
      {/* Content - No top bar, it's handled by Index.tsx wrapper */}
      <div className="px-4 pb-20 lg:pb-8 max-w-7xl mx-auto pt-6">

        {/* Weekly Progress & Ghost Mode - Side by Side on Desktop */}
        <div className="mb-6 max-w-2xl mx-auto lg:max-w-full lg:grid lg:grid-cols-2 lg:gap-6">
          {/* Weekly Goal Progress */}
          <Card className="animate-fade-in mb-6 lg:mb-0">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Weekly Progress</CardTitle>
                <Badge variant="secondary" className="bg-success/20 text-success">
                  🔥 5 day streak
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between mb-3">
                {['M', 'T', 'W', 'Th', 'F', 'Sa', 'Su'].map((day, index) => {
                  // Get current day (0 = Sunday, 1 = Monday, etc.)
                  const today = new Date().getDay();
                  // Convert to Monday-first (0 = Monday, 6 = Sunday)
                  const currentDayIndex = today === 0 ? 6 : today - 1;
                  const isToday = index === currentDayIndex;

                  return (
                    <div
                      key={`${day}-${index}`}
                      className="relative"
                    >
                      {isToday && (
                        <>
                          <div className="absolute inset-0 rounded-full bg-primary/20 animate-[ping_2s_ease-in-out_infinite]" />
                          <div className="absolute inset-0 rounded-full bg-primary/30 animate-[ping_2s_ease-in-out_infinite_0.5s]" />
                        </>
                      )}
                      <div
                        className={`relative w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${isToday
                          ? 'bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground scale-110 shadow-lg shadow-primary/50'
                          : 'bg-secondary text-muted-foreground'
                          }`}
                      >
                        {day}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">5/7 days this week</span>
                <span className="text-primary font-medium">71% complete</span>
              </div>
            </CardContent>
          </Card>

          {/* Ghost Mode Banner */}
          <Card
            className="overflow-hidden cursor-pointer hover:scale-[1.02] active:scale-95 transition-all duration-300 bg-gradient-to-r from-purple-950 via-gray-900 to-purple-950 border-purple-500/50 hover:border-purple-400/80 shadow-xl shadow-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/50 group mb-6 lg:mb-0 lg:flex lg:items-center"
            onClick={() => onTabChange?.('ghost-mode')}
          >
            <CardContent className="p-6 lg:p-8 relative w-full">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-purple-600/10 to-purple-600/0 animate-pulse" />
              {/* Floating ghosts - always visible with white color */}
              <div className="absolute inset-0 opacity-40 group-hover:opacity-70 transition-opacity duration-500 pointer-events-none">
                <Ghost className="absolute top-4 right-12 w-5 h-5 text-white drop-shadow-lg animate-ghost-float" />
                <Ghost className="absolute bottom-4 right-24 w-4 h-4 text-white drop-shadow-lg animate-ghost-float" style={{ animationDelay: '0.3s' }} />
                <Ghost className="absolute top-1/2 right-32 w-6 h-6 text-white drop-shadow-lg animate-ghost-float" style={{ animationDelay: '0.6s' }} />
              </div>
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-full bg-purple-900/60 flex items-center justify-center border-2 border-purple-500/50 group-hover:border-purple-400/80 group-hover:bg-purple-800/70 transition-all duration-300 group-hover:scale-110 shadow-lg shadow-purple-500/20">
                    <Ghost className="w-7 h-7 lg:w-8 lg:h-8 text-purple-400 animate-pulse group-hover:animate-bounce" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg lg:text-xl text-purple-100 flex items-center space-x-2 group-hover:text-white transition-colors mb-1">
                      <span>Ghost Mode</span>
                      <Badge className="bg-purple-800/50 text-purple-200 border-purple-600/30 group-hover:bg-purple-700/70 group-hover:text-purple-100 transition-all text-xs">NEW</Badge>
                    </h3>
                    <p className="text-sm lg:text-base text-purple-300 group-hover:text-purple-200 transition-colors">Train in the shadows 👻</p>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-purple-400 group-hover:text-purple-300 group-hover:translate-x-1 transition-all flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Focus - Full Width Below */}
        <div className="mb-6 max-w-2xl mx-auto lg:max-w-full">
          <h2 className="text-xl font-bold mb-4">Activity Focus</h2>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {activityTags.map((tag) => (
              <Button
                key={tag}
                variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setSelectedTags(prev =>
                    prev.includes(tag)
                      ? [] // Deselect if already selected
                      : [tag] // Select only this tag, deselect others
                  );
                }}
                className="rounded-full h-8 text-xs"
              >
                {tag}
              </Button>
            ))}
          </div>

          {/* Activities - Responsive Grid: 2 cols (mobile), 2 cols (tablet), 5 cols (desktop) */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6">
            {activities.slice(0, 16).map((activity) => (
              <Card
                key={activity.name}
                className="overflow-hidden cursor-pointer hover:scale-105 transition-transform active:scale-95 group"
                onClick={() => {
                  onActivitySelect?.(activity);
                }}
              >
                {activity.image ? (
                  <div
                    className={`aspect-[4/3] bg-cover relative ${activity.name === 'Push-ups' ? 'bg-[center_right_30%]' :
                      activity.name === 'Inclined Push-up' ? 'bg-[center_left_30%]' :
                        'bg-center'
                      }`}
                    style={{
                      backgroundImage: `url(${activity.image})`
                    }}
                  >
                    {/* Quick Start Button - Desktop Only */}
                    <div className="hidden lg:flex absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity items-center justify-center">
                      <Button size="sm" className="bg-primary hover:bg-primary/90">
                        <Zap className="w-4 h-4 mr-2" />
                        Quick Start
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-[4/3] bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white text-3xl">
                    💪
                  </div>
                )}
                <CardContent className="p-3 lg:p-4 bg-card text-card-foreground">
                  <h3 className="font-semibold text-sm lg:text-base mb-1 line-clamp-2">{activity.name}</h3>
                  <p className="text-xs lg:text-sm text-muted-foreground mb-2 line-clamp-1">{activity.muscles}</p>
                  <div className="flex items-center justify-between text-xs lg:text-sm">
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3 lg:w-4 lg:h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{activity.rating}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Test Mode Banner */}
        <div className="mb-6 max-w-2xl mx-auto lg:max-w-full">
          <Card
            className="overflow-hidden cursor-pointer hover:scale-[1.02] active:scale-95 transition-all duration-300 bg-gradient-to-r from-red-900 via-gray-800 to-red-900 border-red-500/50 hover:border-red-400/80 shadow-xl shadow-red-500/30 hover:shadow-2xl hover:shadow-red-500/50 group"
            onClick={() => onTabChange?.('test-mode')}
          >
            <CardContent className="p-6 lg:p-8 relative w-full">
              <div className="absolute inset-0 bg-gradient-to-r from-red-600/0 via-red-600/10 to-red-600/0 animate-pulse" />
              {/* Floating icons - always visible with white color */}
              <div className="absolute inset-0 opacity-40 group-hover:opacity-70 transition-opacity duration-500 pointer-events-none">
                <Trophy className="absolute top-4 right-12 w-5 h-5 text-white drop-shadow-lg animate-bounce" />
                <Target className="absolute bottom-4 right-24 w-4 h-4 text-white drop-shadow-lg animate-bounce" style={{ animationDelay: '0.3s' }} />
                <Zap className="absolute top-1/2 right-32 w-6 h-6 text-white drop-shadow-lg animate-bounce" style={{ animationDelay: '0.6s' }} />
              </div>
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-full bg-red-800/60 flex items-center justify-center border-2 border-red-500/50 group-hover:border-red-400/80 group-hover:bg-red-700/70 transition-all duration-300 group-hover:scale-110 shadow-lg shadow-red-500/20">
                    <Target className="w-7 h-7 lg:w-8 lg:h-8 text-red-400 animate-pulse group-hover:animate-spin" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg lg:text-xl text-red-100 flex items-center space-x-2 group-hover:text-white transition-colors mb-1">
                      <span>Test Mode</span>
                      <Badge className="bg-red-700/50 text-red-200 border-red-500/30 group-hover:bg-red-600/70 group-hover:text-red-100 transition-all text-xs">BETA</Badge>
                    </h3>
                    <p className="text-sm lg:text-base text-red-300 group-hover:text-red-200 transition-colors">Challenge yourself 🎯</p>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-red-400 group-hover:text-red-300 group-hover:translate-x-1 transition-all flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Challenges Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Challenges</h2>
          </div>


          {/* Horizontal Scrollable Challenge Cards - Grid on larger screens */}
          <div className="flex lg:grid lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 space-x-4 lg:space-x-0 lg:gap-4 overflow-x-auto lg:overflow-visible pb-3 scrollbar-hide">
            {getFilteredChallenges().map((challenge) => (
              <Card
                key={challenge.id}
                className={`flex-shrink-0 w-48 overflow-hidden cursor-pointer hover:scale-105 transition-transform relative`}
                onClick={() => onChallengeRedirect?.(challenge.id)}
              >
                <div
                  className="h-24 bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${getChallengeImage(challenge.id)})`
                  }}
                >
                </div>
                <CardContent className={`p-3 ${challenge.type} text-white`}>
                  <h3 className="font-semibold text-sm text-white leading-tight mb-2">
                    {challenge.title}
                  </h3>
                  <p className="text-xs opacity-90 mb-2">{challenge.difficulty}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span>{challenge.duration}</span>
                    <Badge variant="outline" className="text-xs bg-white/20 text-white border-white/30">
                      {challenge.participants}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <Card className="mb-6 animate-fade-in max-w-2xl mx-auto lg:max-w-full">
          <CardContent className="p-4">
            <div className="grid grid-cols-3 lg:grid-cols-6 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">24</div>
                <div className="text-xs text-muted-foreground">Workouts</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-success">1,240</div>
                <div className="text-xs text-muted-foreground">Calories</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-warning">45m</div>
                <div className="text-xs text-muted-foreground">Today</div>
              </div>
              <div className="hidden lg:block">
                <div className="text-2xl font-bold text-info">12</div>
                <div className="text-xs text-muted-foreground">Badges</div>
              </div>
              <div className="hidden lg:block">
                <div className="text-2xl font-bold text-purple-500">5</div>
                <div className="text-xs text-muted-foreground">Streak</div>
              </div>
              <div className="hidden lg:block">
                <div className="text-2xl font-bold text-orange-500">87%</div>
                <div className="text-xs text-muted-foreground">Goal</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* FitFranken Chat Widget */}
      <ChatWidget
        currentTab={activeTab as 'training' | 'discover' | 'report' | 'roadmap'}
        userContext={{
          userName,
          userRole,
          recentWorkouts: [], // TODO: Load from workout history
          currentStats: {
            totalWorkouts: 24,
            weeklyStreak: 5,
            badges: 12
          }
        }}
        onNavigate={(destination, payload) => {
          console.log('🤖 ChatWidget navigation triggered:', { destination, payload });
          
          if (destination === 'ghost-mode' || destination === 'test-mode') {
            console.log('🎯 Navigating to special mode:', destination);
            onTabChange(destination);
          } else if (destination === 'workout' && payload?.workoutId) {
            // Map workout IDs to proper activity names
            const workoutNameMap: Record<string, string> = {
              'push-ups': 'Push-ups',
              'pull-ups': 'Pull-ups',
              'sit-ups': 'Sit-ups',
              'vertical-jump': 'Vertical Jump',
              'shuttle-run': 'Shuttle Run',
              'sit-reach': 'Sit & Reach',
              'broad-jump': 'Broad Jump'
            };
            const activityName = workoutNameMap[payload.workoutId];
            console.log('🏋️ Mapped workout ID to activity name:', { workoutId: payload.workoutId, activityName });
            
            if (activityName) {
              // First switch to training tab
              console.log('📍 Step 1: Switching to training tab');
              onTabChange('training');
              
              // Then trigger activity selection after a short delay
              setTimeout(() => {
                console.log('📍 Step 2: Selecting activity:', activityName);
                if (onActivitySelect) {
                  onActivitySelect(activityName);
                  console.log('✅ Activity selection triggered');
                } else {
                  console.error('❌ onActivitySelect is not defined');
                }
              }, 150);
            } else {
              console.error('❌ Could not map workout ID:', payload.workoutId);
            }
          } else if (['training', 'discover', 'report', 'roadmap'].includes(destination)) {
            console.log('📑 Navigating to tab:', destination);
            onTabChange(destination);
          } else {
            console.warn('⚠️ Unknown navigation destination:', destination);
          }
        }}
      />

      {/* Bottom Navigation - Hidden on large screens */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-subtle border-t safe-bottom lg:hidden">
        <div className="max-w-md mx-auto px-4 py-2">
          <div className="flex justify-around">
            {[
              { id: 'training', label: 'Training', emoji: '⚡' },
              { id: 'discover', label: 'Discover', emoji: '🔍' },
              { id: 'report', label: 'Report', emoji: '📊' },
              { id: 'roadmap', label: 'Roadmap', emoji: '🗺️' }
            ].map(({ id, label, emoji }) => (
              <Button
                key={id}
                variant="ghost"
                size="sm"
                onClick={() => onTabChange(id)}
                className={`flex flex-col items-center space-y-1 tap-target transition-all duration-200 ${activeTab === id
                  ? 'scale-110 font-semibold'
                  : 'opacity-60 hover:opacity-100'
                  }`}
              >
                <span className="text-2xl">{emoji}</span>
                <span className={`text-xs ${activeTab === id ? 'text-primary' : 'text-muted-foreground'}`}>
                  {label}
                </span>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default HomeScreen;
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Ghost, Upload, Video, Skull, Flame, Zap, Target, Trophy, TrendingUp, BarChart3 } from 'lucide-react';
import { getWorkoutHistory } from '@/utils/workoutStorage';

interface GhostWorkoutDetailProps {
  activity: any;
  onBack: () => void;
  onStartWorkout: (mode: 'upload' | 'live', ghostGif?: string) => void;
}

// Activity content database (same as ActivityDetail)
const activityContent: { [key: string]: any } = {
  'Push-ups': {
    description: 'Standard chest-dominant pressing exercise used to assess upper-body strength and endurance.',
    muscles: ['Pectoralis Major', 'Triceps', 'Anterior Deltoid'],
    category: 'Strength Training',
    steps: [
      'Start in high plank with hands under shoulders.',
      'Lower chest to 2–3 inches above ground keeping a straight body line.',
      'Press up through palms until elbows lock.',
      'Control descent and keep core braced.'
    ],
    mistakes: [
      'Flaring elbows',
      'Sagging hips',
      'Partial range of motion'
    ]
  },
  'Pull-ups': {
    description: 'Vertical pulling assessment for upper back and biceps strength.',
    muscles: ['Latissimus Dorsi', 'Biceps Brachii', 'Rhomboids'],
    category: 'Strength Training',
    steps: [
      'Start dead-hang with shoulder-width grip.',
      'Pull until chin clears bar with chest slightly up.',
      'Lower under control to full hang.'
    ],
    mistakes: [
      'Kipping (if testing strict)',
      'Partial pull',
      'Swinging body'
    ]
  },
  'Sit-ups': {
    description: 'Core endurance and trunk flexion assessment.',
    muscles: ['Rectus Abdominis', 'Hip Flexors', 'External Obliques'],
    category: 'Core Training',
    steps: [
      'Start supine knees bent, arms across chest.',
      'Curl torso to touch knees or reach knees.',
      'Lower with control to start position.'
    ],
    mistakes: [
      'Using momentum',
      'Neck strain',
      'Incomplete reps'
    ]
  },
  'Vertical Jump': {
    description: 'Measures explosive lower-body power by evaluating maximal vertical displacement.',
    muscles: ['Quadriceps', 'Glutes', 'Calves'],
    category: 'Power Assessment',
    steps: [
      'Stand with feet hip-width, perform counter-movement, swing arms.',
      'Explode upward as high as possible.',
      'Land softly, knees slightly bent.'
    ],
    mistakes: [
      'Stiff knees on landing',
      'Reduced arm swing',
      'Shallow countermovement'
    ]
  },
  'Shuttle Run': {
    description: 'Short shuttle run to test acceleration, deceleration and change-of-direction agility.',
    muscles: ['Hamstrings', 'Glutes', 'Calves'],
    category: 'Agility Test',
    steps: [
      'Start at start line; sprint to cone 10 m away and back (four times).',
      'Turn explosively at each cone and maintain low posture.'
    ],
    mistakes: [
      'Inefficient turns',
      'Upright posture',
      'Slow acceleration out of turn'
    ]
  },
  'Sit Reach': {
    description: 'Classic flexibility test measuring hamstring and lower back flexibility.',
    muscles: ['Hamstrings', 'Lower Back', 'Erector Spinae'],
    category: 'Flexibility',
    steps: [
      'Sit on floor with legs straight and feet against a box or wall.',
      'Place hands together and reach forward slowly.',
      'Hold the maximum reach position for 2 seconds.',
      'Measure the distance reached past your toes.'
    ],
    mistakes: [
      'Bending knees during reach',
      'Bouncing or jerking movements',
      'Not keeping back straight'
    ]
  }
};

// Normal workout GIF mapping for "Your Performance" preview
const normalGifs: { [key: string]: string } = {
  'Push-ups': '/pushup.gif',
  'Pull-ups': '/pullup.gif',
  'Sit-ups': '/situp.gif',
  'Vertical Jump': '/verticaljump.gif',
  'Shuttle Run': '/shuttlerun.gif',
  'Sit Reach': '/sit&reach.gif',
  'Knee Push-ups': '/kneepushup.gif'
};

// Ghost GIF mapping for "Ghost Performance" preview - Using ghost skeleton GIFs
const ghostGifs: { [key: string]: string } = {
  'Push-ups': '/ghost/pushup.gif?v=2',
  'Pull-ups': '/ghost/pullup.gif?v=2',
  'Sit-ups': '/ghost/situp.gif?v=2',
  'Vertical Jump': '/ghost/verticaljump.gif?v=2',
  'Shuttle Run': '/ghost/shuttlerun.gif?v=2',
  'Sit Reach': '/ghost/sit&reach.gif?v=2',
  'Sit & Reach': '/ghost/sit&reach.gif?v=2',
  'Knee Push-ups': '/ghost/kneepushup.gif?v=2'
};

const GhostWorkoutDetail = ({ activity, onBack, onStartWorkout }: GhostWorkoutDetailProps) => {
  const content = activityContent[activity.name] || activityContent['Push-ups'];
  const normalGif = normalGifs[activity.name];
  const ghostGif = ghostGifs[activity.name];

  // Get the most recent workout for this activity from history
  const [latestWorkout, setLatestWorkout] = useState<any>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Load the most recent workout for this activity
    const history = getWorkoutHistory();
    const activityWorkouts = history.filter(w => w.activityName === activity.name && w.isGhostMode);
    if (activityWorkouts.length > 0) {
      // Get the most recent one
      setLatestWorkout(activityWorkouts[activityWorkouts.length - 1]);
    }
  }, [activity.name]);

  return (
    <div className="ghost-mode-page min-h-screen bg-gradient-to-b from-purple-950 via-gray-900 to-black relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-1/4 right-10 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 left-10 w-96 h-96 bg-purple-800/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Header */}
      <div className="sticky top-0 z-50 bg-purple-950/90 backdrop-blur-xl border-b border-purple-500/30">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between max-w-md mx-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-purple-300 hover:text-purple-100 hover:bg-purple-900/50 transition-all duration-300 hover:scale-110 active:scale-95 group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </Button>
            <div className="flex items-center space-x-2">
              <Skull className="w-5 h-5 text-purple-400 animate-pulse" />
              <h1 className="text-lg font-semibold text-purple-100">{activity.name}</h1>
            </div>
            <div className="w-10" />
          </div>
        </div>
      </div>

      {/* Cover Image - Mobile Only */}
      <div className="aspect-video bg-gradient-to-br from-purple-900/50 to-gray-900/50 relative lg:hidden">
        {activity.image ? (
          <img
            src={activity.image}
            alt={activity.name}
            className="w-full h-full object-cover"
            loading="eager"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Ghost className="w-16 h-16 text-purple-400 animate-pulse" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      {/* Challenge Banner - Mobile Only */}
      <div className="px-4 py-6 max-w-md mx-auto relative z-10 lg:hidden">
        <div className="bg-gradient-to-r from-purple-900/80 via-purple-800/80 to-purple-900/80 rounded-2xl p-6 border-2 border-purple-500/50 shadow-2xl shadow-purple-500/30 relative overflow-hidden">
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-400/10 to-transparent animate-pulse" />

          {/* Content */}
          <div className="relative z-10 text-center">
            <div className="flex items-center justify-center space-x-2 mb-3">
              <Skull className="w-8 h-8 text-purple-300 animate-pulse" />
              <h2 className="text-2xl font-bold text-white">Beat the Ghost</h2>
              <Ghost className="w-8 h-8 text-purple-300 animate-pulse" style={{ animationDelay: '0.5s' }} />
            </div>
            <p className="text-purple-200 text-sm mb-4">
              Race against the ghost's perfect form. Can you match or beat their performance?
            </p>

            {/* Challenge Stats */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-purple-950/50 rounded-lg p-2 border border-purple-500/30">
                <div className="text-lg font-bold text-purple-300">25</div>
                <div className="text-xs text-purple-400">Target Reps</div>
              </div>
              <div className="bg-purple-950/50 rounded-lg p-2 border border-purple-500/30">
                <div className="text-lg font-bold text-purple-300">95%</div>
                <div className="text-xs text-purple-400">Form Goal</div>
              </div>
              <div className="bg-purple-950/50 rounded-lg p-2 border border-purple-500/30">
                <div className="text-lg font-bold text-purple-300">2:30</div>
                <div className="text-xs text-purple-400">Time Limit</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <Button
            onClick={() => onStartWorkout('upload', ghostGif)}
            className="h-16 text-base font-semibold flex flex-col items-center justify-center bg-purple-900/50 hover:bg-purple-900/70 text-purple-100 border-2 border-purple-500/50 hover:border-purple-400 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/50 active:scale-95 group relative overflow-hidden"
            variant="outline"
            size="lg"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-400/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            <Upload className="w-6 h-6 mb-1 group-hover:animate-bounce group-hover:scale-110 transition-transform relative z-10" />
            <span className="relative z-10">Upload Video</span>
            <Ghost className="absolute top-1 right-1 w-4 h-4 text-purple-400/30 group-hover:text-purple-300 group-hover:animate-pulse group-hover:scale-125 transition-all" />
          </Button>
          <Button
            onClick={() => onStartWorkout('live', ghostGif)}
            className="h-16 text-base font-semibold flex flex-col items-center justify-center bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/70 active:scale-95 group relative overflow-hidden"
            size="lg"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            <Video className="w-6 h-6 mb-1 group-hover:animate-pulse group-hover:scale-110 transition-transform relative z-10" />
            <span className="relative z-10">Live Challenge</span>
            <Flame className="absolute top-1 right-1 w-4 h-4 text-orange-400/50 group-hover:text-orange-300 group-hover:animate-bounce group-hover:scale-125 transition-all" />
          </Button>
        </div>
        <p className="text-xs text-center text-purple-300 mt-3 flex items-center justify-center space-x-1">
          <Target className="w-3 h-3 animate-pulse" />
          <span>Choose your challenge mode</span>
          <Zap className="w-3 h-3 animate-pulse" style={{ animationDelay: '0.5s' }} />
        </p>
      </div>

      {/* Content - Optimized for PC */}
      <div className="px-4 pb-20 lg:pb-8 max-w-[1400px] mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-[45%_55%] gap-6 lg:gap-10 xl:gap-12">
          {/* Left Column (45%) - Workout Metadata */}
          <div className="space-y-6 lg:space-y-8 lg:order-1">
            {/* Title and Category */}
            <div className="py-6 lg:py-8 border-b border-purple-500/30">
              <h1 className="text-2xl lg:text-4xl xl:text-5xl font-bold mb-3 lg:mb-4 text-purple-100 leading-tight">{activity.name}</h1>
              <Badge className="mb-4 lg:mb-6 bg-purple-800/50 text-purple-200 border-purple-600/30 text-sm lg:text-base px-3 py-1">{content.category}</Badge>
              <p className="text-purple-200 text-sm lg:text-lg leading-relaxed mb-6 lg:mb-8">{content.description}</p>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
                <Button
                  onClick={() => onStartWorkout('live', ghostGif)}
                  className="h-12 lg:h-14 text-base lg:text-lg font-semibold bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 transition-all duration-300 hover:scale-105 hover:shadow-2xl group relative overflow-hidden"
                  size="lg"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  <Video className="w-5 h-5 lg:w-6 lg:h-6 mr-2 relative z-10" />
                  <span className="relative z-10">Start Live Challenge</span>
                  <Flame className="w-5 h-5 lg:w-6 lg:h-6 ml-2 relative z-10 group-hover:animate-bounce" />
                </Button>
                <Button
                  onClick={() => onStartWorkout('upload', ghostGif)}
                  className="h-12 lg:h-14 text-base lg:text-lg font-semibold border-2 border-purple-500/50 hover:border-purple-400 hover:bg-purple-900/50 transition-all duration-300 hover:scale-105 hover:shadow-xl group"
                  variant="outline"
                  size="lg"
                >
                  <Upload className="w-5 h-5 lg:w-6 lg:h-6 mr-2 group-hover:animate-bounce" />
                  Upload Video Challenge
                </Button>
              </div>
            </div>

            {/* Ghost Preview GIF - Mobile Only (shown after description) */}
            {ghostGif && (
              <div className="py-6 border-b border-purple-500/30 lg:hidden">
                <div className="flex items-center space-x-2 mb-3">
                  <Ghost className="w-5 h-5 text-purple-400 animate-pulse" />
                  <h3 className="font-semibold text-purple-100 text-lg">Ghost Demonstration</h3>
                </div>
                <div className="aspect-video bg-black rounded-xl overflow-hidden flex items-center justify-center border-2 border-purple-500/50">
                  <img
                    src={ghostGif}
                    alt={`${activity.name} ghost demonstration`}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="mt-3 p-3 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                  <p className="text-xs text-purple-200 text-center">
                    👻 Train alongside the ghost to match or beat their performance
                  </p>
                </div>
              </div>
            )}

            {/* Muscles */}
            <div className="py-6 border-b border-purple-500/30">
              <div className="flex items-center space-x-2 mb-3">
                <Flame className="w-5 h-5 text-orange-400 animate-pulse" />
                <h3 className="font-semibold text-purple-100 text-lg">Primary Muscles</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {content.muscles.map((muscle: string) => (
                  <Button
                    key={muscle}
                    variant="outline"
                    size="sm"
                    className="rounded-full bg-purple-800/30 border-purple-600/50 text-purple-200 hover:bg-purple-700/50 transition-all duration-300 hover:scale-105 hover:shadow-md hover:shadow-purple-500/30 active:scale-95"
                  >
                    {muscle}
                  </Button>
                ))}
              </div>
            </div>

            {/* Challenge Banner - Desktop Only */}
            <div className="py-6 hidden lg:block">
              <div className="bg-gradient-to-r from-purple-900/80 via-purple-800/80 to-purple-900/80 rounded-2xl p-6 border-2 border-purple-500/50 shadow-2xl shadow-purple-500/30 relative overflow-hidden mb-4">
                {/* Animated background */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-400/10 to-transparent animate-pulse" />

                {/* Content */}
                <div className="relative z-10 text-center">
                  <div className="flex items-center justify-center space-x-2 mb-3">
                    <Skull className="w-8 h-8 text-purple-300 animate-pulse" />
                    <h2 className="text-2xl font-bold text-white">Beat the Ghost</h2>
                    <Ghost className="w-8 h-8 text-purple-300 animate-pulse" style={{ animationDelay: '0.5s' }} />
                  </div>
                  <p className="text-purple-200 text-sm mb-4">
                    Race against the ghost's perfect form. Can you match or beat their performance?
                  </p>

                  {/* Challenge Stats */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-purple-950/50 rounded-lg p-3 border border-purple-500/30">
                      <div className="text-2xl font-bold text-purple-300">25</div>
                      <div className="text-xs text-purple-400">Target Reps</div>
                    </div>
                    <div className="bg-purple-950/50 rounded-lg p-3 border border-purple-500/30">
                      <div className="text-2xl font-bold text-purple-300">95%</div>
                      <div className="text-xs text-purple-400">Form Goal</div>
                    </div>
                    <div className="bg-purple-950/50 rounded-lg p-3 border border-purple-500/30">
                      <div className="text-2xl font-bold text-purple-300">2:30</div>
                      <div className="text-xs text-purple-400">Time Limit</div>
                    </div>
                  </div>
                </div>
              </div>


            </div>
          </div>

          {/* Right Column (60%) - Ghost Preview & Instructions */}
          <div className="space-y-6 lg:order-2">
            {/* Video Comparison Section - Desktop Only */}
            {normalGif && ghostGif && (
              <div className="py-6 border-b border-purple-500/30 hidden lg:block">
                <div className="flex items-center space-x-2 mb-4">
                  <Ghost className="w-5 h-5 text-purple-400 animate-pulse" />
                  <h3 className="font-semibold text-purple-100 text-lg">Ghost Mode Preview</h3>
                </div>

                {/* Desktop: Side-by-side */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Your Performance (Normal GIF) */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-purple-200">Your Performance</span>
                      <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">Live</Badge>
                    </div>
                    <div className="aspect-video bg-black rounded-xl overflow-hidden flex items-center justify-center border-2 border-blue-500/50">
                      <img
                        src={normalGif}
                        alt={`${activity.name} demonstration`}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>

                  {/* Ghost Performance (Ghost GIF) */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-purple-200">Ghost Performance</span>
                      <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">Reference</Badge>
                    </div>
                    <div className="aspect-video bg-black rounded-xl overflow-hidden flex items-center justify-center border-2 border-purple-500/50">
                      <img
                        src={ghostGif}
                        alt={`${activity.name} ghost demonstration`}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                </div>

                {/* Comparison Info */}
                <div className="mt-4 p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                  <p className="text-sm text-purple-200 text-center">
                    👻 Train alongside the ghost to match or beat their performance
                  </p>
                </div>
              </div>
            )}

            {/* How to do */}
            <div className="py-6 border-b border-purple-500/30">
              <div className="flex items-center space-x-2 mb-3">
                <Zap className="w-5 h-5 text-yellow-400 animate-pulse" />
                <h3 className="font-semibold text-purple-100">How to do</h3>
              </div>
              <div className="space-y-3">
                {content.steps.map((step: string, index: number) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                      {index + 1}
                    </div>
                    <p className="text-sm text-purple-200">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Common Mistakes */}
            <div className="py-6 border-b border-purple-500/30">
              <div className="flex items-center space-x-2 mb-3">
                <Skull className="w-5 h-5 text-red-400 animate-pulse" />
                <h3 className="font-semibold text-purple-100">Common Mistakes</h3>
              </div>
              <div className="space-y-2">
                {content.mistakes.map((mistake: string, index: number) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                    <p className="text-sm text-purple-300">{mistake}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Latest Performance Section - Only show if workout history exists */}
            {latestWorkout ? (
              <div className="py-6 border-b border-purple-500/30">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Trophy className="w-5 h-5 text-yellow-400 animate-pulse" />
                    <h3 className="font-semibold text-purple-100 text-lg">Your Latest Performance</h3>
                  </div>
                  <Badge className={`${latestWorkout.posture === 'Good' ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-orange-500/20 text-orange-300 border-orange-500/30'}`}>
                    {latestWorkout.posture === 'Good' ? '✓ Beat the Ghost!' : '⚡ Try Again'}
                  </Badge>
                </div>

                {/* Performance Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  <div className="p-4 bg-purple-900/30 rounded-lg border border-purple-500/30 text-center">
                    <div className="text-2xl font-bold text-blue-400">{latestWorkout.setsCompleted || latestWorkout.totalReps || 0}</div>
                    <div className="text-xs text-purple-300 mt-1">Total Reps</div>
                  </div>
                  <div className="p-4 bg-purple-900/30 rounded-lg border border-purple-500/30 text-center">
                    <div className="text-2xl font-bold text-green-400">{latestWorkout.correctReps || 0}</div>
                    <div className="text-xs text-purple-300 mt-1">Correct Reps</div>
                  </div>
                  <div className="p-4 bg-purple-900/30 rounded-lg border border-purple-500/30 text-center">
                    <div className="text-2xl font-bold text-orange-400">{latestWorkout.badSets || 0}</div>
                    <div className="text-xs text-purple-300 mt-1">Bad Reps</div>
                  </div>
                  <div className="p-4 bg-purple-900/30 rounded-lg border border-purple-500/30 text-center">
                    <div className="text-2xl font-bold text-purple-400">{latestWorkout.duration || '--'}</div>
                    <div className="text-xs text-purple-300 mt-1">Duration</div>
                  </div>
                </div>

                {/* Performance Summary */}
                <div className={`p-4 rounded-lg border-2 ${latestWorkout.posture === 'Good' ? 'bg-green-900/20 border-green-500/30' : 'bg-orange-900/20 border-orange-500/30'}`}>
                  <div className="flex items-center space-x-3">
                    {latestWorkout.posture === 'Good' ? (
                      <>
                        <Trophy className="w-8 h-8 text-green-400" />
                        <div>
                          <h4 className="font-semibold text-green-300">Excellent Work!</h4>
                          <p className="text-sm text-green-200/80">You matched or beat the ghost's performance. Keep it up!</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <TrendingUp className="w-8 h-8 text-orange-400" />
                        <div>
                          <h4 className="font-semibold text-orange-300">Room for Improvement</h4>
                          <p className="text-sm text-orange-200/80">Focus on form and try again to beat the ghost!</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <p className="text-xs text-purple-400 text-center mt-3">
                  Completed on {new Date(latestWorkout.timestamp).toLocaleDateString()} at {new Date(latestWorkout.timestamp).toLocaleTimeString()}
                </p>
              </div>
            ) : (
              <div className="py-6 border-b border-purple-500/30">
                <div className="flex items-center space-x-2 mb-4">
                  <Target className="w-5 h-5 text-purple-400 animate-pulse" />
                  <h3 className="font-semibold text-purple-100 text-lg">No Performance History Yet</h3>
                </div>

                <div className="p-6 bg-purple-900/20 border-2 border-purple-500/30 rounded-xl text-center">
                  <Ghost className="w-16 h-16 text-purple-400 mx-auto mb-3 animate-bounce" />
                  <h4 className="font-semibold text-purple-200 mb-2">Ready to Challenge the Ghost?</h4>
                  <p className="text-sm text-purple-300 mb-4">
                    Complete your first workout to see your performance metrics and compare with the ghost!
                  </p>
                  <div className="flex items-center justify-center space-x-2 text-xs text-purple-400">
                    <BarChart3 className="w-4 h-4" />
                    <span>Your stats will appear here after your first workout</span>
                  </div>
                </div>
              </div>
            )}
          </div>




        </div>
      </div>
    </div>
  );
};

export default GhostWorkoutDetail;

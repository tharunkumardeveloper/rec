import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Target, Zap, Trophy } from 'lucide-react';

// Import activity images
import pushupImage from '@/assets/activities/pushup.jpg';
import pullupImage from '@/assets/activities/pullup.webp';
import sitUpsImage from '@/assets/activities/sit-ups.jpg';
import shuttleRunImage from '@/assets/activities/shuttle-run.jpg';
import sitReachImage from '@/assets/activities/sit-reach.jpg';
import verticalJumpImage from '@/assets/activities/vertical-jump.jpg';

interface Workout {
  name: string;
  image: string;
  description: string;
  muscles: string[];
  category: string;
  steps: string[];
  mistakes: string[];
}

interface TestModeTabProps {
  onWorkoutSelect: (workout: Workout) => void;
  onBack: () => void;
}

const TestModeTab = ({ onWorkoutSelect, onBack }: TestModeTabProps) => {
  const workouts: Workout[] = [
    {
      name: 'Push-ups',
      image: pushupImage,
      description: 'Standard chest-dominant pressing exercise used to assess upper-body strength and endurance.',
      muscles: ['Pectoralis Major', 'Triceps', 'Anterior Deltoid'],
      category: 'Strength Training',
      steps: [
        'Start in high plank with hands under shoulders.',
        'Lower chest to 2–3 inches above ground keeping a straight body line.',
        'Press up through palms until elbows lock.',
        'Control descent and keep core braced.'
      ],
      mistakes: ['Flaring elbows', 'Sagging hips', 'Partial range of motion']
    },
    {
      name: 'Pull-ups',
      image: pullupImage,
      description: 'Vertical pulling assessment for upper back and biceps strength.',
      muscles: ['Latissimus Dorsi', 'Biceps Brachii', 'Rhomboids'],
      category: 'Strength Training',
      steps: [
        'Start dead-hang with shoulder-width grip.',
        'Pull until chin clears bar with chest slightly up.',
        'Lower under control to full hang.'
      ],
      mistakes: ['Kipping (if testing strict)', 'Partial pull', 'Swinging body']
    },
    {
      name: 'Sit-ups',
      image: sitUpsImage,
      description: 'Core endurance and trunk flexion assessment.',
      muscles: ['Rectus Abdominis', 'Hip Flexors', 'External Obliques'],
      category: 'Core Training',
      steps: [
        'Start supine knees bent, arms across chest.',
        'Curl torso to touch knees or reach knees.',
        'Lower with control to start position.'
      ],
      mistakes: ['Using momentum', 'Neck strain', 'Incomplete reps']
    },
    {
      name: 'Squats',
      image: '/squat.webp',
      description: 'Lower body strength and endurance assessment measuring quad, glute, and hamstring power.',
      muscles: ['Quadriceps', 'Glutes', 'Hamstrings', 'Core'],
      category: 'Strength Training',
      steps: [
        'Stand with feet shoulder-width apart, toes slightly out.',
        'Lower hips back and down until thighs are parallel to ground.',
        'Keep chest up, knees tracking over toes.',
        'Drive through heels to return to standing position.'
      ],
      mistakes: ['Knees caving inward', 'Heels lifting off ground', 'Leaning too far forward', 'Not reaching parallel depth']
    },
    {
      name: 'Shuttle Run',
      image: shuttleRunImage,
      description: 'Short shuttle run to test acceleration, deceleration and change-of-direction agility.',
      muscles: ['Hamstrings', 'Glutes', 'Calves'],
      category: 'Agility Test',
      steps: [
        'Start at start line; sprint to cone 10 m away and back (four times).',
        'Turn explosively at each cone and maintain low posture.'
      ],
      mistakes: ['Inefficient turns', 'Upright posture', 'Slow acceleration out of turn']
    },
    {
      name: 'Sit Reach',
      image: sitReachImage,
      description: 'Classic flexibility test measuring hamstring and lower back flexibility.',
      muscles: ['Hamstrings', 'Lower Back', 'Erector Spinae'],
      category: 'Flexibility',
      steps: [
        'Sit on floor with legs straight and feet against a box or wall.',
        'Place hands together and reach forward slowly.',
        'Hold the maximum reach position for 2 seconds.',
        'Measure the distance reached past your toes.'
      ],
      mistakes: ['Bending knees during reach', 'Bouncing or jerking movements', 'Not keeping back straight']
    },
    {
      name: 'Vertical Jump',
      image: verticalJumpImage,
      description: 'Measures explosive lower-body power by evaluating maximal vertical displacement.',
      muscles: ['Quadriceps', 'Glutes', 'Calves'],
      category: 'Power Assessment',
      steps: [
        'Stand with feet hip-width, perform counter-movement, swing arms.',
        'Explode upward as high as possible.',
        'Land softly, knees slightly bent.'
      ],
      mistakes: ['Stiff knees on landing', 'Reduced arm swing', 'Shallow countermovement']
    }
  ];

  return (
    <div className="test-mode-page min-h-screen bg-gradient-to-b from-red-950 via-gray-900 to-black relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-1/4 right-10 w-64 h-64 bg-red-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 left-10 w-96 h-96 bg-red-800/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Header */}
      <div className="sticky top-0 z-50 bg-red-950/90 backdrop-blur-xl border-b border-red-500/30">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack}
              className="text-red-300 hover:text-red-100 hover:bg-red-900/50 transition-all duration-300 hover:scale-110 active:scale-95 group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </Button>
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-red-400 animate-pulse" />
              <h1 className="text-lg font-semibold text-red-100">Test Mode</h1>
              <Badge className="bg-red-700/50 text-red-200 border-red-500/30 text-xs">EVALUATOR</Badge>
            </div>
            <div className="w-10" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 pb-20 lg:pb-8 max-w-7xl mx-auto relative z-10">
        {/* Info Banner - BRIGHT RED GRADIENT */}
        <div className="mb-6 bg-gradient-to-r from-red-600 via-red-500 to-red-600 rounded-2xl p-6 lg:p-8 border-2 border-red-500/50 shadow-2xl shadow-red-500/30 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
          <div className="relative z-10 text-center">
            <div className="flex items-center justify-center space-x-2 mb-3">
              <Trophy className="w-6 h-6 lg:w-8 lg:h-8 text-black animate-pulse" />
              <h2 className="text-xl lg:text-2xl font-bold text-black">Talent Track Evaluation</h2>
              <Target className="w-6 h-6 lg:w-8 lg:h-8 text-black animate-pulse" style={{ animationDelay: '0.5s' }} />
            </div>
            <p className="text-black text-sm lg:text-base font-medium">
              Select a workout to evaluate using pre-recorded test videos. All videos are automatically loaded for consistent assessment.
            </p>
          </div>
        </div>

        {/* Workouts Grid - 2 per row on Mobile */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          {workouts.map((workout) => (
            <Card
              key={workout.name}
              className="overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 active:scale-95 group bg-gray-900/50 border-red-500/30 hover:border-red-400/80 hover:shadow-xl hover:shadow-red-500/30"
              onClick={() => onWorkoutSelect(workout)}
            >
              <div className="aspect-video bg-gradient-to-br from-red-900/50 to-gray-900/50 relative">
                <img 
                  src={workout.image} 
                  alt={workout.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <Badge className="absolute top-2 right-2 lg:top-3 lg:right-3 bg-red-700/80 text-red-100 border-red-500/50 text-xs">
                  {workout.category}
                </Badge>
              </div>
              <CardContent className="p-3 sm:p-4 bg-gray-900/80">
                <h3 className="font-bold text-sm sm:text-base lg:text-lg text-red-100 mb-1 sm:mb-2">{workout.name}</h3>
                <p className="text-xs lg:text-sm text-red-300/80 mb-2 sm:mb-3 lg:mb-4 line-clamp-2 hidden sm:block">{workout.description}</p>
                <Button 
                  className="w-full bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white transition-all duration-300 group-hover:scale-105 h-8 sm:h-9 lg:h-10 text-xs sm:text-sm"
                  size="sm"
                >
                  <Zap className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Start Test</span>
                  <span className="sm:hidden">Start</span>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TestModeTab;

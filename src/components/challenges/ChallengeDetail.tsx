import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Trophy, Target, CheckCircle, Star, ArrowRight } from 'lucide-react';

// Challenge cover images
const CHALLENGE_IMAGES: Record<string, string> = {
  'push-up-power': '/challenges/pushup-power.webp',
  'strength-pushup-master': '/challenges/pushup-power.webp',
  'pull-up-progression': '/challenges/pullup-progression.jpg',
  'strength-pullup-power': '/challenges/pullup-progression.jpg',
  'core-crusher': '/challenges/core-crusher.avif',
  'strength-core-crusher': '/challenges/core-crusher.avif',
  'sprint-master': '/challenges/sprint-master.jpg',
  'endurance-sprint-master': '/challenges/sprint-master.jpg',
  'flexibility-foundation': '/challenges/flexibility-foundation.webp',
  'jump-power': '/challenges/jump-power.jpg',
  'endurance-jump-power': '/challenges/jump-power.jpg',
  'adaptive-strength': '/challenges/adaptive-strength.jpg',
  'para-adaptive-strength': '/challenges/adaptive-strength.jpg',
  'calisthenics-bodyweight': '/challenges/pushup-power.webp',
  'elite-century-club': '/challenges/pushup-power.webp',
  'elite-perfect-form': '/challenges/pushup-power.webp',
};

interface Workout {
  name: string;
  targetReps: number;
  completed: boolean;
  currentReps: number;
}

interface ChallengeDetailProps {
  challengeId: string;
  onBack: () => void;
  onStartWorkout: (workoutName: string) => void;
}

const CHALLENGES: Record<string, {
  name: string;
  description: string;
  category: string;
  difficulty: string;
  workouts: Workout[];
  badge: {
    name: string;
    icon: string;
    description: string;
  };
  participants: number;
}> = {
  'push-up-power': {
    name: 'Push-up Power',
    description: 'Master the fundamental push-up with perfect form',
    category: 'Strength',
    difficulty: 'Beginner',
    workouts: [
      { name: 'Push-ups', targetReps: 10, completed: false, currentReps: 0 },
      { name: 'Push-ups', targetReps: 15, completed: false, currentReps: 0 },
      { name: 'Push-ups', targetReps: 20, completed: false, currentReps: 0 },
      { name: 'Push-ups', targetReps: 25, completed: false, currentReps: 0 },
      { name: 'Push-ups', targetReps: 30, completed: false, currentReps: 0 },
    ],
    badge: {
      name: 'Push-up Master',
      icon: '💪',
      description: 'Completed 100 total push-ups with perfect form'
    },
    participants: 2340
  },
  'pull-up-progression': {
    name: 'Pull-up Progression',
    description: 'Build upper body strength with pull-ups',
    category: 'Strength',
    difficulty: 'Intermediate',
    workouts: [
      { name: 'Pull-ups', targetReps: 5, completed: false, currentReps: 0 },
      { name: 'Pull-ups', targetReps: 8, completed: false, currentReps: 0 },
      { name: 'Pull-ups', targetReps: 10, completed: false, currentReps: 0 },
      { name: 'Pull-ups', targetReps: 12, completed: false, currentReps: 0 },
      { name: 'Pull-ups', targetReps: 15, completed: false, currentReps: 0 },
    ],
    badge: {
      name: 'Pull-up Pro',
      icon: '🏋️',
      description: 'Achieved 50 total pull-ups'
    },
    participants: 1876
  },
  'core-crusher': {
    name: 'Core Crusher',
    description: 'Strengthen your core with sit-ups',
    category: 'Strength',
    difficulty: 'Beginner',
    workouts: [
      { name: 'Sit-ups', targetReps: 15, completed: false, currentReps: 0 },
      { name: 'Sit-ups', targetReps: 20, completed: false, currentReps: 0 },
      { name: 'Sit-ups', targetReps: 25, completed: false, currentReps: 0 },
      { name: 'Sit-ups', targetReps: 30, completed: false, currentReps: 0 },
      { name: 'Sit-ups', targetReps: 40, completed: false, currentReps: 0 },
    ],
    badge: {
      name: 'Core Champion',
      icon: '🔥',
      description: 'Completed 130 total sit-ups'
    },
    participants: 3210
  },
  'sprint-master': {
    name: 'Sprint Master',
    description: 'Improve your speed and agility',
    category: 'Endurance',
    difficulty: 'Intermediate',
    workouts: [
      { name: 'Shuttle Run', targetReps: 5, completed: false, currentReps: 0 },
      { name: 'Shuttle Run', targetReps: 8, completed: false, currentReps: 0 },
      { name: 'Shuttle Run', targetReps: 10, completed: false, currentReps: 0 },
      { name: 'Shuttle Run', targetReps: 12, completed: false, currentReps: 0 },
      { name: 'Shuttle Run', targetReps: 15, completed: false, currentReps: 0 },
    ],
    badge: {
      name: 'Speed Demon',
      icon: '⚡',
      description: 'Completed 50 shuttle runs'
    },
    participants: 1543
  },
  'flexibility-foundation': {
    name: 'Flexibility Foundation',
    description: 'Improve your flexibility and range of motion',
    category: 'Flexibility',
    difficulty: 'Beginner',
    workouts: [
      { name: 'Sit Reach', targetReps: 5, completed: false, currentReps: 0 },
      { name: 'Sit Reach', targetReps: 8, completed: false, currentReps: 0 },
      { name: 'Sit Reach', targetReps: 10, completed: false, currentReps: 0 },
      { name: 'Sit Reach', targetReps: 12, completed: false, currentReps: 0 },
      { name: 'Sit Reach', targetReps: 15, completed: false, currentReps: 0 },
    ],
    badge: {
      name: 'Flexibility Master',
      icon: '🤸',
      description: 'Achieved 50 sit-and-reach exercises'
    },
    participants: 2890
  },
  'jump-power': {
    name: 'Jump Power',
    description: 'Develop explosive power with vertical jumps',
    category: 'Calisthenics',
    difficulty: 'Intermediate',
    workouts: [
      { name: 'Vertical Jump', targetReps: 10, completed: false, currentReps: 0 },
      { name: 'Vertical Jump', targetReps: 15, completed: false, currentReps: 0 },
      { name: 'Vertical Jump', targetReps: 20, completed: false, currentReps: 0 },
      { name: 'Vertical Jump', targetReps: 25, completed: false, currentReps: 0 },
      { name: 'Vertical Jump', targetReps: 30, completed: false, currentReps: 0 },
    ],
    badge: {
      name: 'Jump Master',
      icon: '🦘',
      description: 'Completed 100 vertical jumps'
    },
    participants: 1234
  },
  'adaptive-strength': {
    name: 'Adaptive Strength',
    description: 'Build strength with modified exercises',
    category: 'Para-Athlete',
    difficulty: 'Beginner',
    workouts: [
      { name: 'Push-ups', targetReps: 8, completed: false, currentReps: 0 },
      { name: 'Push-ups', targetReps: 12, completed: false, currentReps: 0 },
      { name: 'Push-ups', targetReps: 15, completed: false, currentReps: 0 },
      { name: 'Push-ups', targetReps: 20, completed: false, currentReps: 0 },
      { name: 'Push-ups', targetReps: 25, completed: false, currentReps: 0 },
    ],
    badge: {
      name: 'Para Warrior',
      icon: '♿',
      description: 'Completed adaptive strength challenge'
    },
    participants: 987
  },
};

const ChallengeDetail = ({ challengeId, onBack, onStartWorkout }: ChallengeDetailProps) => {
  const challenge = CHALLENGES[challengeId];

  if (!challenge) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-bold mb-2">Challenge not found</h2>
        <Button onClick={() => {
          window.scrollTo(0, 0);
          onBack();
        }}>Go Back</Button>
      </div>
    );
  }

  const getChallengeImage = () => {
    return CHALLENGE_IMAGES[challengeId] || '/challenges/pushup-power.webp';
  };

  const calculateProgress = () => {
    const completed = challenge.workouts.filter(w => w.completed).length;
    return (completed / challenge.workouts.length) * 100;
  };

  const progress = calculateProgress();
  const completedWorkouts = challenge.workouts.filter(w => w.completed).length;
  const totalWorkouts = challenge.workouts.length;

  const getCategoryColor = () => {
    const colors: Record<string, string> = {
      'Strength': 'bg-blue-500',
      'Endurance': 'bg-purple-500',
      'Flexibility': 'bg-cyan-500',
      'Calisthenics': 'bg-orange-500',
      'Para-Athlete': 'bg-red-500',
    };
    return colors[challenge.category] || 'bg-gray-500';
  };

  const getDifficultyColor = () => {
    const colors: Record<string, string> = {
      'Beginner': 'bg-green-500',
      'Intermediate': 'bg-yellow-500',
      'Advanced': 'bg-red-500',
    };
    return colors[challenge.difficulty] || 'bg-gray-500';
  };

  return (
    <div className="space-y-6 w-full">
      {/* Challenge Cover Image - Hero Section */}
      <Card className="overflow-hidden card-elevated">
        <div className="h-64 md:h-80 lg:h-96 relative bg-gradient-to-br from-primary/20 to-primary/5">
          <img
            src={getChallengeImage()}
            alt={challenge.name}
            className="absolute inset-0 w-full h-full object-cover"
            loading="eager"
            onError={(e) => {
              // Hide image on error, show gradient background instead
              e.currentTarget.style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          
          {/* Badges overlay */}
          <div className="absolute top-6 right-6 z-20 flex gap-3">
            <Badge className={`${getCategoryColor()} text-white shadow-lg text-base px-4 py-1.5`}>
              {challenge.category}
            </Badge>
            <Badge className={`${getDifficultyColor()} text-white shadow-lg text-base px-4 py-1.5`}>
              {challenge.difficulty}
            </Badge>
          </div>

          {/* Title Section */}
          <div className="absolute bottom-0 left-0 right-0 z-10 p-8">
            <div className="flex items-center gap-5">
              <div className="text-6xl md:text-7xl">{challenge.badge.icon}</div>
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2">{challenge.name}</h1>
                <p className="text-white/90 text-base md:text-lg mb-3">{challenge.description}</p>
                <div className="flex items-center gap-4 text-white/80">
                  <span className="text-sm md:text-base">👥 {challenge.participants.toLocaleString()} participants</span>
                  <span className="text-sm md:text-base">🎯 {totalWorkouts} workouts</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Progress Section */}
      <Card className="card-elevated">
        <CardContent className="p-6 md:p-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl md:text-2xl font-bold mb-1">Your Progress</h2>
              <p className="text-muted-foreground">
                {completedWorkouts} of {totalWorkouts} workouts completed
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl md:text-4xl font-bold text-primary">
                {Math.round(progress)}%
              </div>
              <p className="text-sm text-muted-foreground">Complete</p>
            </div>
          </div>
          <Progress value={progress} className="h-3 md:h-4" />
        </CardContent>
      </Card>

      {/* Workouts Section - Enhanced Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
            <Target className="w-6 h-6 md:w-7 md:h-7" />
            Workout Plan
          </h2>
          <Badge variant="outline" className="text-base px-3 py-1">
            {completedWorkouts}/{totalWorkouts}
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {challenge.workouts.map((workout, index) => (
            <Card
              key={index}
              className={`transition-all duration-300 hover:shadow-lg ${
                workout.completed
                  ? 'bg-success/10 border-success/30 shadow-success/20'
                  : 'bg-card hover:border-primary/50'
              }`}
            >
              <CardContent className="p-5">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {workout.completed ? (
                        <CheckCircle className="w-7 h-7 text-success flex-shrink-0" />
                      ) : (
                        <div className="w-7 h-7 rounded-full border-2 border-primary flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                          {index + 1}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-base md:text-lg">
                          {workout.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Target: {workout.targetReps} reps
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {workout.currentReps > 0 && !workout.completed && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Progress</span>
                        <span>{workout.currentReps}/{workout.targetReps}</span>
                      </div>
                      <Progress 
                        value={(workout.currentReps / workout.targetReps) * 100} 
                        className="h-2"
                      />
                    </div>
                  )}
                  
                  {!workout.completed && (
                    <Button
                      className="w-full"
                      size="default"
                      onClick={() => {
                        window.scrollTo(0, 0);
                        onStartWorkout(workout.name);
                      }}
                    >
                      Start Workout
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                  
                  {workout.completed && (
                    <div className="flex items-center justify-center gap-2 text-success font-medium">
                      <CheckCircle className="w-4 h-4" />
                      <span>Completed</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Badge Reward - Enhanced */}
      <Card className="bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-yellow-500/10 border-2 border-yellow-500/30 card-elevated">
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="text-6xl md:text-7xl">{challenge.badge.icon}</div>
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                <Trophy className="w-6 h-6 text-yellow-500" />
                <h2 className="font-bold text-xl md:text-2xl">Reward Badge</h2>
              </div>
              <p className="font-semibold text-lg md:text-xl mb-2">{challenge.badge.name}</p>
              <p className="text-base text-muted-foreground">{challenge.badge.description}</p>
            </div>
            {progress === 100 ? (
              <div className="flex flex-col items-center gap-2">
                <Star className="w-12 h-12 md:w-16 md:h-16 text-yellow-500 fill-yellow-500 animate-pulse" />
                <Badge className="bg-yellow-500 text-white text-sm px-3 py-1">
                  Earned!
                </Badge>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 opacity-50">
                <Star className="w-12 h-12 md:w-16 md:h-16 text-muted-foreground" />
                <Badge variant="outline" className="text-sm px-3 py-1">
                  Locked
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChallengeDetail;

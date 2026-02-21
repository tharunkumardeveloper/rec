import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Ghost, Flame, Zap } from 'lucide-react';

// Import activity images
import pushupImage from '@/assets/activities/pushup.jpg';
import pullupImage from '@/assets/activities/pullup.webp';
import sitUpsImage from '@/assets/activities/sit-ups.jpg';
import verticalJumpImage from '@/assets/activities/vertical-jump.jpg';
import shuttleRunImage from '@/assets/activities/shuttle-run.jpg';
import sitReachImage from '@/assets/activities/sit-reach.jpg';

// Activity data with images
const ACTIVITIES: { [key: string]: any } = {
  'Push-ups': {
    description: 'Standard chest-dominant pressing exercise',
    muscles: ['Pectoralis Major', 'Triceps', 'Anterior Deltoid'],
    category: 'Strength Training',
    image: pushupImage
  },
  'Pull-ups': {
    description: 'Vertical pulling assessment for upper back',
    muscles: ['Latissimus Dorsi', 'Biceps', 'Rhomboids'],
    category: 'Strength Training',
    image: pullupImage
  },
  'Sit-ups': {
    description: 'Core strength and endurance test',
    muscles: ['Rectus Abdominis', 'Hip Flexors'],
    category: 'Core Training',
    image: sitUpsImage
  },
  'Vertical Jump': {
    description: 'Explosive power assessment',
    muscles: ['Quadriceps', 'Glutes', 'Calves'],
    category: 'Power Test',
    image: verticalJumpImage
  },
  'Shuttle Run': {
    description: 'Agility and speed test',
    muscles: ['Hamstrings', 'Glutes', 'Calves'],
    category: 'Agility Test',
    image: shuttleRunImage
  },
  'Sit Reach': {
    description: 'Flexibility test for hamstrings',
    muscles: ['Hamstrings', 'Lower Back'],
    category: 'Flexibility',
    image: sitReachImage
  }
};

interface GhostModeScreenProps {
  onBack: () => void;
  onSelectActivity: (activity: any) => void;
  showAnimation?: boolean;
}

const GhostModeScreen = ({ onBack, onSelectActivity, showAnimation = false }: GhostModeScreenProps) => {
  const [hoveredActivity, setHoveredActivity] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(showAnimation);

  // Scroll to top and handle entrance animation
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    
    // Only show animation if showAnimation prop is true
    if (showAnimation) {
      setIsTransitioning(true);
      // Trigger entrance animation - longer duration for slower effect
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, 2000);

      return () => clearTimeout(timer);
    } else {
      setIsTransitioning(false);
    }
  }, [showAnimation]);

  // Handle back without exit animation
  const handleBack = () => {
    onBack();
  };

  return (
    <div className="ghost-mode-page min-h-screen bg-gradient-to-b from-purple-950 via-gray-900 to-black relative">
      {/* Ghost Mode Transition */}
      {isTransitioning && (
        <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden bg-black">
          {/* Gradient backdrop */}
          <div className="absolute inset-0 bg-gradient-to-b from-purple-950/80 via-black to-black animate-simple-fade" />
          
          {/* Ambient glow */}
          <div className="absolute inset-0 animate-simple-fade">
            <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px]" />
            <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-purple-500/15 rounded-full blur-[100px]" />
          </div>

          {/* Floating ghosts - scattered pattern */}
          <div className="absolute inset-0">
            {/* Top row */}
            <div className="absolute top-[15%] left-[20%] animate-ghost-float-1">
              <Ghost className="w-12 h-12 text-purple-400/40" />
            </div>
            <div className="absolute top-[20%] left-[45%] animate-ghost-float-2">
              <Ghost className="w-10 h-10 text-purple-300/35" />
            </div>
            <div className="absolute top-[18%] right-[25%] animate-ghost-float-3">
              <Ghost className="w-14 h-14 text-purple-500/40" />
            </div>

            {/* Middle row */}
            <div className="absolute top-[45%] left-[15%] animate-ghost-float-4">
              <Ghost className="w-11 h-11 text-purple-400/35" />
            </div>
            <div className="absolute top-[50%] right-[20%] animate-ghost-float-5">
              <Ghost className="w-13 h-13 text-purple-300/40" />
            </div>

            {/* Bottom row */}
            <div className="absolute bottom-[25%] left-[30%] animate-ghost-float-6">
              <Ghost className="w-12 h-12 text-purple-500/35" />
            </div>
            <div className="absolute bottom-[20%] right-[35%] animate-ghost-float-7">
              <Ghost className="w-10 h-10 text-purple-400/40" />
            </div>
            <div className="absolute bottom-[30%] left-[55%] animate-ghost-float-8">
              <Ghost className="w-11 h-11 text-purple-300/35" />
            </div>
          </div>
          
          {/* Center main ghost - large and prominent */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-ghost-center">
              {/* Large glow behind */}
              <div className="absolute inset-0 -m-20">
                <div className="w-80 h-80 bg-purple-500/40 rounded-full blur-[100px]" />
              </div>
              <Ghost className="w-48 h-48 text-purple-400 relative z-10" />
            </div>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="sticky top-0 z-50 bg-purple-950/80 backdrop-blur-lg border-b border-purple-500/30">
        <div className="px-4 py-4">
          <div className="flex items-center space-x-3 max-w-4xl mx-auto">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleBack}
              className="text-purple-300 hover:text-purple-100 hover:bg-purple-900/50 transition-all duration-300 hover:scale-110 active:scale-95 group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </Button>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <Ghost className="w-6 h-6 text-purple-400 animate-pulse" />
                <h1 className="text-xl font-bold text-purple-100">Ghost Mode</h1>
              </div>
              <p className="text-sm text-purple-300">Train in the shadows 👻</p>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="px-4 py-8 max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 bg-purple-900/50 px-4 py-2 rounded-full border border-purple-500/30 mb-4">
            <Flame className="w-4 h-4 text-orange-400 animate-pulse" />
            <span className="text-sm text-purple-200">Unleash Your Inner Beast</span>
            <Zap className="w-4 h-4 text-yellow-400 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-purple-100 mb-2">
            Choose Your Challenge
          </h2>
          <p className="text-purple-300 text-sm">
            Same workouts, darker vibes. Push your limits in Ghost Mode.
          </p>
        </div>

        {/* Activities Grid - Responsive */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 md:gap-4">
          {Object.entries(ACTIVITIES).map(([name, activity]) => (
            <Card
              key={name}
              className={`
                overflow-hidden cursor-pointer transition-all duration-300
                border-purple-500/30 hover:border-purple-400/60
                hover:shadow-xl hover:shadow-purple-500/50
                active:scale-95
                ${hoveredActivity === name ? 'scale-105' : 'scale-100'}
                group bg-gray-900/50
              `}
              onMouseEnter={() => setHoveredActivity(name)}
              onMouseLeave={() => setHoveredActivity(null)}
              onClick={() => onSelectActivity({ name, ...activity })}
            >
              {/* Image Section */}
              <div className="relative h-32 sm:h-36 md:h-40 overflow-hidden">
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                  style={{
                    backgroundImage: `url(${activity.image})`,
                  }}
                />
                
                {/* Dark overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                
                {/* Spooky glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-transparent to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Floating Ghost on Hover */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-500">
                  <Ghost className="w-5 h-5 text-purple-300 animate-bounce drop-shadow-glow" />
                </div>

                {/* Category Badge */}
                <div className="absolute top-2 left-2">
                  <span className="text-xs px-2 py-1 rounded-full bg-black/60 text-purple-200 border border-purple-500/50 backdrop-blur-sm">
                    {activity.category}
                  </span>
                </div>
              </div>
              
              {/* Content Section */}
              <CardContent className="p-3 bg-gray-900/80 border-t border-purple-500/20">
                <h3 className="font-semibold text-sm mb-2 text-purple-100 line-clamp-1 flex items-center space-x-1">
                  <Ghost className="w-3 h-3 text-purple-400 flex-shrink-0" />
                  <span>{name}</span>
                </h3>
                
                <p className="text-xs text-purple-300 mb-2 line-clamp-1">
                  {activity.muscles[0]}
                </p>
                
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-1 text-purple-400">
                    <Flame className="w-3 h-3" />
                    <span className="font-medium">Ready</span>
                  </div>
                  <div className="flex items-center space-x-1 text-purple-400 group-hover:text-purple-300 transition-colors">
                    <Zap className="w-3 h-3 group-hover:animate-pulse" />
                    <span>Start</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Info Card */}
        <Card className="mt-8 bg-purple-900/30 border-purple-500/30 max-w-2xl mx-auto">
          <CardContent className="p-4 text-center">
            <Ghost className="w-8 h-8 text-purple-400 mx-auto mb-2 animate-bounce" />
            <p className="text-sm text-purple-200 mb-1">
              👻 Ghost Mode: Same powerful tracking, darker aesthetic
            </p>
            <p className="text-xs text-purple-400">
              All workouts use the same AI-powered form analysis
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GhostModeScreen;

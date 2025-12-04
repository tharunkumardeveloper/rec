import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Target, Flame, Zap, AlertCircle, Play } from 'lucide-react';

interface Workout {
  name: string;
  image: string;
  description: string;
  muscles: string[];
  category: string;
  steps: string[];
  mistakes: string[];
}

interface TestWorkoutDetailProps {
  activity: Workout;
  onBack: () => void;
  onStartWorkout: () => void;
}

// Test GIF mapping for workout demonstrations (using original workout detail GIFs)
const testGifs: Record<string, string> = {
  'Push-ups': '/pushup.gif',
  'Pull-ups': '/pullup.gif',
  'Sit-ups': '/situp.gif',
  'Shuttle Run': '/shuttlerun.gif',
  'Sit Reach': '/sit&reach.gif',
  'Sit & Reach': '/sit&reach.gif',
  'Vertical Jump': '/verticaljump.gif',
  'Knee Push-ups': '/kneepushup.gif'
};

const TestWorkoutDetail = ({ activity, onBack, onStartWorkout }: TestWorkoutDetailProps) => {
  const testGif = testGifs[activity.name];
  
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Add scroll performance optimization
    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      document.body.classList.add('scrolling');
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        document.body.classList.remove('scrolling');
      }, 150);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

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
          <div className="flex items-center justify-between max-w-md mx-auto">
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
              <h1 className="text-lg font-semibold text-red-100">{activity.name}</h1>
            </div>
            <div className="w-10" />
          </div>
        </div>
      </div>

      {/* Cover Image - Mobile Only */}
      <div className="aspect-video bg-gradient-to-br from-red-900/50 to-gray-900/50 relative lg:hidden">
        {activity.image ? (
          <img 
            src={activity.image} 
            alt={activity.name}
            className="w-full h-full object-cover"
            loading="eager"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Target className="w-16 h-16 text-red-400 animate-pulse" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      {/* Evaluation Banner - Mobile Only */}
      <div className="px-4 py-6 max-w-md mx-auto relative z-10 lg:hidden">
        <div className="bg-gradient-to-r from-red-900/80 via-red-800/80 to-red-900/80 rounded-2xl p-6 border-2 border-red-500/50 shadow-2xl shadow-red-500/30 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-400/10 to-transparent animate-pulse" />
          
          <div className="relative z-10 text-center">
            <div className="flex items-center justify-center space-x-2 mb-3">
              <Target className="w-8 h-8 text-red-300 animate-pulse" />
              <h2 className="text-2xl font-bold text-white">Test Evaluation</h2>
            </div>
            <p className="text-red-200 text-sm mb-4">
              Pre-recorded test video will be automatically loaded for evaluation
            </p>
          </div>
        </div>

        {/* Start Button */}
        <Button 
          onClick={onStartWorkout}
          className="w-full h-16 text-lg font-semibold mt-4 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-red-500/70 active:scale-95 group relative overflow-hidden"
          size="lg"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          <Play className="w-6 h-6 mr-2 relative z-10" />
          <span className="relative z-10">Start Workout</span>
          <Zap className="w-6 h-6 ml-2 relative z-10 group-hover:animate-bounce" />
        </Button>
        <p className="text-xs text-center text-red-300 mt-3 flex items-center justify-center space-x-1">
          <Target className="w-3 h-3 animate-pulse" />
          <span>Test video will load automatically</span>
        </p>
      </div>

      {/* Content - Optimized for PC */}
      <div className="px-4 pb-20 lg:pb-8 max-w-[1400px] mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-[45%_55%] gap-6 lg:gap-10 xl:gap-12">
          {/* Left Column (45%) - Workout Metadata */}
          <div className="space-y-6 lg:space-y-8 lg:order-1">
            {/* Title and Category */}
            <div className="py-6 lg:py-8 border-b border-red-500/30">
              <h1 className="text-2xl lg:text-4xl xl:text-5xl font-bold mb-3 lg:mb-4 text-red-100 leading-tight">{activity.name}</h1>
              <Badge className="mb-4 lg:mb-6 bg-red-800/50 text-red-200 border-red-600/30 text-sm lg:text-base px-3 py-1">{activity.category}</Badge>
              <p className="text-red-200 text-sm lg:text-lg leading-relaxed mb-6 lg:mb-8">{activity.description}</p>
              
              {/* Start Button */}
              <Button 
                onClick={onStartWorkout}
                className="w-full h-12 lg:h-14 text-base lg:text-lg font-semibold bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 transition-all duration-300 hover:scale-105 hover:shadow-2xl group relative overflow-hidden"
                size="lg"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <Play className="w-5 h-5 lg:w-6 lg:h-6 mr-2 relative z-10" />
                <span className="relative z-10">Start Workout</span>
                <Flame className="w-5 h-5 lg:w-6 lg:h-6 ml-2 relative z-10 group-hover:animate-bounce" />
              </Button>
            </div>

            {/* Muscles */}
            <div className="py-6 border-b border-red-500/30">
              <div className="flex items-center space-x-2 mb-3">
                <Flame className="w-5 h-5 text-orange-400 animate-pulse" />
                <h3 className="font-semibold text-red-100 text-lg">Primary Muscles</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {activity.muscles.map((muscle: string) => (
                  <Button
                    key={muscle}
                    variant="outline"
                    size="sm"
                    className="rounded-full bg-red-800/30 border-red-600/50 text-red-200 hover:bg-red-700/50 transition-all duration-300 hover:scale-105 hover:shadow-md hover:shadow-red-500/30 active:scale-95"
                  >
                    {muscle}
                  </Button>
                ))}
              </div>
            </div>

            {/* Test GIF Display - Mobile Only */}
            {testGif && (
              <div className="py-6 border-b border-red-500/30 lg:hidden">
                <div className="flex items-center space-x-2 mb-3">
                  <Target className="w-5 h-5 text-red-400 animate-pulse" />
                  <h3 className="font-semibold text-red-100 text-lg">Test Demonstration</h3>
                </div>
                <div className="aspect-video bg-black rounded-xl overflow-hidden flex items-center justify-center border-2 border-red-500/50 shadow-lg">
                  <img 
                    src={testGif}
                    alt={`${activity.name} test demonstration`}
                    className="w-full h-full object-contain"
                    loading="eager"
                  />
                </div>
                <div className="mt-3 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                  <p className="text-xs text-red-200 text-center flex items-center justify-center space-x-2">
                    <Target className="w-4 h-4" />
                    <span>Pre-recorded test video for evaluation</span>
                  </p>
                </div>
              </div>
            )}

            {/* Evaluation Banner - Desktop Only */}
            <div className="py-6 hidden lg:block">
              <div className="bg-gradient-to-r from-red-900/80 via-red-800/80 to-red-900/80 rounded-2xl p-6 border-2 border-red-500/50 shadow-2xl shadow-red-500/30 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-400/10 to-transparent animate-pulse" />
                
                <div className="relative z-10 text-center">
                  <div className="flex items-center justify-center space-x-2 mb-3">
                    <Target className="w-8 h-8 text-red-300 animate-pulse" />
                    <h2 className="text-2xl font-bold text-white">Test Evaluation Mode</h2>
                  </div>
                  <p className="text-red-200 text-sm mb-4">
                    Pre-recorded test video will be automatically loaded for consistent evaluation
                  </p>
                  
                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-red-950/50 rounded-lg p-3 border border-red-500/30">
                      <div className="text-2xl font-bold text-red-300">Auto</div>
                      <div className="text-xs text-red-400">Video Load</div>
                    </div>
                    <div className="bg-red-950/50 rounded-lg p-3 border border-red-500/30">
                      <div className="text-2xl font-bold text-red-300">AI</div>
                      <div className="text-xs text-red-400">Analysis</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (55%) - GIF and Instructions */}
          <div className="space-y-6 lg:order-2">
            {/* Test GIF Display - Desktop Only */}
            {testGif && (
              <div className="py-6 border-b border-red-500/30 hidden lg:block">
                <div className="flex items-center space-x-2 mb-4">
                  <Target className="w-5 h-5 text-red-400 animate-pulse" />
                  <h3 className="font-semibold text-red-100 text-lg">Test Demonstration</h3>
                </div>
                <div className="aspect-video bg-black rounded-xl overflow-hidden flex items-center justify-center border-2 border-red-500/50 shadow-xl">
                  <img 
                    src={testGif}
                    alt={`${activity.name} test demonstration`}
                    className="w-full h-full object-contain"
                    loading="eager"
                  />
                </div>
                <div className="mt-4 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                  <p className="text-sm text-red-200 text-center flex items-center justify-center space-x-2">
                    <Target className="w-4 h-4" />
                    <span>Pre-recorded test video will be automatically loaded for evaluation</span>
                  </p>
                </div>
              </div>
            )}

            {/* How to do */}
            <div className="py-6 border-b border-red-500/30">
              <div className="flex items-center space-x-2 mb-3">
                <Zap className="w-5 h-5 text-yellow-400 animate-pulse" />
                <h3 className="font-semibold text-red-100">How to do</h3>
              </div>
              <div className="space-y-3">
                {activity.steps.map((step: string, index: number) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                      {index + 1}
                    </div>
                    <p className="text-sm text-red-200">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Common Mistakes */}
            <div className="py-6 border-b border-red-500/30">
              <div className="flex items-center space-x-2 mb-3">
                <AlertCircle className="w-5 h-5 text-red-400 animate-pulse" />
                <h3 className="font-semibold text-red-100">Common Mistakes</h3>
              </div>
              <div className="space-y-2">
                {activity.mistakes.map((mistake: string, index: number) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                    <p className="text-sm text-red-300">{mistake}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Test Video Info */}
            <div className="py-6">
              <div className="p-6 bg-red-900/20 border-2 border-red-500/30 rounded-xl">
                <div className="flex items-start space-x-3">
                  <Target className="w-8 h-8 text-red-400 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-red-200 mb-2">About Test Mode</h4>
                    <p className="text-sm text-red-300/80 mb-3">
                      This mode uses pre-recorded test videos for consistent evaluation. The video will automatically load when you start the workout, and AI-powered pose detection will analyze the performance in real-time.
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-red-400">
                      <Zap className="w-4 h-4" />
                      <span>No camera or video upload required</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestWorkoutDetail;

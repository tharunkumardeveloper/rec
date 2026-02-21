import { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Upload, Target, Zap, Skull, Ghost, Flame, Trophy, Clock } from 'lucide-react';

interface GhostWorkoutUploadScreenProps {
  activityName: string;
  ghostGif: string;
  onBack: () => void;
  onVideoSelected: (file: File) => void;
}

const GhostWorkoutUploadScreen = ({ 
  activityName, 
  ghostGif, 
  onBack, 
  onVideoSelected 
}: GhostWorkoutUploadScreenProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto-trigger file selection on mount
    const timer = setTimeout(() => {
      fileInputRef.current?.click();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      onVideoSelected(file);
    } else if (!file) {
      // User cancelled, go back
      onBack();
    }
  };

  return (
    <div className="ghost-mode-page min-h-screen bg-gradient-to-b from-purple-950 via-gray-900 to-black relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-1/4 right-10 w-64 h-64 bg-purple-600/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 left-10 w-96 h-96 bg-purple-800/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
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
              <h1 className="text-lg font-semibold text-purple-100">{activityName}</h1>
            </div>
            <div className="w-10" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-8 max-w-md mx-auto relative z-10">
        {/* Challenge Banner */}
        <Card className="bg-gradient-to-r from-purple-900/80 via-purple-800/80 to-purple-900/80 border-2 border-purple-500/50 shadow-2xl shadow-purple-500/30 mb-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-400/10 to-transparent animate-pulse" />
          <CardContent className="p-6 text-center relative z-10">
            <div className="flex items-center justify-center space-x-2 mb-3">
              <Skull className="w-8 h-8 text-purple-300 animate-pulse" />
              <h2 className="text-2xl font-bold text-white">Beat the Ghost</h2>
              <Ghost className="w-8 h-8 text-purple-300 animate-pulse" style={{ animationDelay: '0.5s' }} />
            </div>
            <p className="text-purple-200 text-sm mb-4">
              Upload your workout video and compete against the ghost's performance
            </p>
            
            {/* Challenge Stats */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-purple-950/50 rounded-lg p-2 border border-purple-500/30">
                <Target className="w-5 h-5 mx-auto mb-1 text-purple-300" />
                <div className="text-xs text-purple-400">Form Analysis</div>
              </div>
              <div className="bg-purple-950/50 rounded-lg p-2 border border-purple-500/30">
                <Zap className="w-5 h-5 mx-auto mb-1 text-yellow-400" />
                <div className="text-xs text-purple-400">Rep Tracking</div>
              </div>
              <div className="bg-purple-950/50 rounded-lg p-2 border border-purple-500/30">
                <Trophy className="w-5 h-5 mx-auto mb-1 text-orange-400" />
                <div className="text-xs text-purple-400">Score Comparison</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upload Card */}
        <Card className="bg-purple-900/30 border-2 border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/30">
          <CardContent className="p-8 text-center">
            {/* Upload Icon */}
            <div className="mb-6 relative">
              <div className="w-24 h-24 mx-auto bg-purple-800/30 rounded-full flex items-center justify-center border-2 border-purple-500/50 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-400/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <Upload className="w-12 h-12 text-purple-300 relative z-10 group-hover:scale-110 transition-transform" />
              </div>
              <div className="absolute -top-2 -right-2">
                <Flame className="w-6 h-6 text-orange-400 animate-bounce" />
              </div>
            </div>
            
            <h2 className="text-xl font-bold text-purple-100 mb-2">Upload Your Challenge Video</h2>
            <p className="text-purple-300 text-sm mb-6">
              Select your workout video to analyze and compare with the ghost
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileUpload}
              className="hidden"
            />

            <Button
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-14 text-base font-semibold bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/50 active:scale-95 group relative overflow-hidden"
              size="lg"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <Upload className="w-5 h-5 mr-2 relative z-10 group-hover:animate-bounce" />
              <span className="relative z-10">Choose Video File</span>
            </Button>

            <p className="text-xs text-purple-400 mt-4 flex items-center justify-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>Supported formats: MP4, MOV, AVI, WebM</span>
            </p>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="mt-6 bg-purple-900/20 border border-purple-500/30">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-purple-800/30 rounded-lg">
                <Target className="w-5 h-5 text-purple-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-purple-100 mb-1">What happens next?</h3>
                <ul className="text-xs text-purple-300 space-y-1">
                  <li className="flex items-center space-x-2">
                    <div className="w-1 h-1 bg-purple-400 rounded-full" />
                    <span>AI analyzes your form and technique</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1 h-1 bg-purple-400 rounded-full" />
                    <span>Compare your performance with the ghost</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1 h-1 bg-purple-400 rounded-full" />
                    <span>Get detailed rep-by-rep breakdown</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1 h-1 bg-purple-400 rounded-full" />
                    <span>See if you beat the ghost's score!</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GhostWorkoutUploadScreen;

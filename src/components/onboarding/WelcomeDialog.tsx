import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sparkles, User } from 'lucide-react';
import { userProfileService } from '@/services/userProfileService';

const WelcomeDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');

  useEffect(() => {
    // Check if user has completed onboarding
    const hasCompletedOnboarding = localStorage.getItem('onboarding_completed');
    
    // Check user role - skip dialog for coaches and SAI admins
    const profile = userProfileService.getProfile();
    const userRole = profile?.role;
    
    // Only show dialog for athletes who haven't completed onboarding
    if (!hasCompletedOnboarding && userRole !== 'COACH' && userRole !== 'SAI_ADMIN') {
      setIsOpen(true);
    } else if (userRole === 'COACH' || userRole === 'SAI_ADMIN') {
      // Auto-complete onboarding for coaches and admins
      localStorage.setItem('onboarding_completed', 'true');
    }
  }, []);

  const handleContinue = () => {
    if (name.trim()) {
      localStorage.setItem('user_name', name.trim());
    }
    localStorage.setItem('onboarding_completed', 'true');
    setIsOpen(false);
  };

  const handleSkip = () => {
    localStorage.setItem('onboarding_completed', 'true');
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">
            Welcome to TalentTrack!
          </DialogTitle>
          <DialogDescription className="text-center">
            Let's personalize your workout experience
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="welcome-name" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              What's your name? (Optional)
            </Label>
            <Input
              id="welcome-name"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleContinue();
                }
              }}
            />
            <p className="text-xs text-muted-foreground">
              Our AI voice coach will use your name for personalized encouragement during workouts!
            </p>
          </div>

          {name && (
            <div className="p-3 bg-primary/5 rounded-md border border-primary/10">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Preview:</span> "Great work {name}! You're crushing it!"
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleSkip}
            className="flex-1"
          >
            Skip
          </Button>
          <Button
            onClick={handleContinue}
            className="flex-1"
          >
            {name ? "Let's Go!" : 'Continue'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeDialog;

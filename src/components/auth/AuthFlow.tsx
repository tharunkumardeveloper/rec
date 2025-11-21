import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { User, Users, Shield } from 'lucide-react';

interface AuthFlowProps {
  onLogin: (role: 'athlete' | 'coach' | 'admin') => void;
}

const AuthFlow = ({ onLogin }: AuthFlowProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'athlete' | 'coach' | 'admin' | null>(null);

  const roles = [
    { 
      role: 'athlete' as const, 
      label: 'Athlete',
      icon: User,
      description: 'Track your fitness journey',
      color: 'from-blue-500 to-blue-600'
    },
    { 
      role: 'coach' as const, 
      label: 'Coach',
      icon: Users,
      description: 'Manage and guide athletes',
      color: 'from-green-500 to-green-600'
    },
    { 
      role: 'admin' as const, 
      label: 'SAI Admin',
      icon: Shield,
      description: 'Oversee all operations',
      color: 'from-purple-500 to-purple-600'
    },
  ];

  const handleRoleSelect = (role: 'athlete' | 'coach' | 'admin') => {
    setSelectedRole(role);
    setIsLoading(true);
    // Simulate loading
    setTimeout(() => {
      onLogin(role);
    }, 800);
  };

  return (
    <div className="h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 flex flex-col items-center justify-center p-3 sm:p-6 safe-top safe-bottom overflow-hidden">
      <div className="w-full max-w-sm sm:max-w-2xl lg:max-w-4xl flex flex-col h-full justify-center py-4">
        {/* Header - Compact on mobile */}
        <div className="text-center mb-4 sm:mb-10 lg:mb-12 animate-fade-in flex-shrink-0">
          <h1 className="text-2xl sm:text-4xl lg:text-6xl font-bold text-white mb-1 sm:mb-4 text-shadow">
            TalentTrack
          </h1>
          <p className="text-white/90 text-base sm:text-xl lg:text-2xl mb-0.5 sm:mb-2">
            Track. Train. Transform.
          </p>
          <p className="text-white/70 text-xs sm:text-base lg:text-lg">
            Select your role to continue
          </p>
        </div>

        {/* Role Selection Cards - Optimized for mobile viewport */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5 lg:gap-6 animate-slide-up max-w-sm sm:max-w-none mx-auto w-full flex-shrink-0">
          {roles.map((roleData) => {
            const Icon = roleData.icon;
            const isSelected = selectedRole === roleData.role;
            const isDisabled = isLoading && !isSelected;
            
            return (
              <Card
                key={roleData.role}
                className={`backdrop-blur-subtle bg-white/10 border-white/20 active:scale-95 sm:hover:bg-white/20 transition-all duration-300 cursor-pointer group ${
                  isSelected ? 'ring-4 ring-white/50 scale-[1.02] sm:scale-105' : ''
                } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => !isLoading && handleRoleSelect(roleData.role)}
              >
                <CardContent className="p-4 sm:p-7 lg:p-8 text-center">
                  {/* Icon with gradient background - Smaller on mobile */}
                  <div className={`w-12 h-12 sm:w-18 sm:h-18 lg:w-20 lg:h-20 mx-auto mb-2 sm:mb-5 lg:mb-6 rounded-full bg-gradient-to-br ${roleData.color} flex items-center justify-center transform sm:group-hover:scale-110 transition-transform duration-300 ${
                    isSelected ? 'animate-pulse' : ''
                  }`}>
                    <Icon className="w-6 h-6 sm:w-9 sm:h-9 lg:w-10 lg:h-10 text-white" />
                  </div>
                  
                  {/* Role Label - Smaller on mobile */}
                  <h3 className="text-lg sm:text-2xl font-bold text-white mb-1 sm:mb-3">
                    {roleData.label}
                  </h3>
                  
                  {/* Description - Hidden on very small screens, visible on slightly larger */}
                  <p className="text-white/80 text-[10px] sm:text-sm mb-3 sm:mb-6 leading-tight sm:leading-normal hidden xs:block sm:block">
                    {roleData.description}
                  </p>
                  
                  {/* Button - Compact on mobile */}
                  <Button
                    className={`w-full h-10 sm:h-12 bg-white text-purple-900 hover:bg-gray-100 font-semibold transition-all duration-300 text-sm sm:text-base tap-target ${
                      isSelected ? 'bg-green-500 text-white hover:bg-green-600' : ''
                    }`}
                    disabled={isLoading}
                  >
                    {isSelected && isLoading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Loading...
                      </span>
                    ) : (
                      'Continue'
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AuthFlow;
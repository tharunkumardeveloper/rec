import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { User, Users, Shield, Zap, ChevronRight } from 'lucide-react';

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
      gradient: 'from-purple-600 to-purple-800'
    },
    { 
      role: 'coach' as const, 
      label: 'Coach',
      icon: Users,
      description: 'Manage and guide athletes',
      gradient: 'from-purple-700 to-purple-900'
    },
    { 
      role: 'admin' as const, 
      label: 'SAI Admin',
      icon: Shield,
      description: 'Oversee all operations',
      gradient: 'from-purple-800 to-purple-950'
    },
  ];

  const handleRoleSelect = (role: 'athlete' | 'coach' | 'admin') => {
    setSelectedRole(role);
    setIsLoading(true);
    setTimeout(() => {
      onLogin(role);
    }, 800);
  };

  return (
    <>
      {/* Desktop View - Keep original design */}
      <div className="hidden sm:flex h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 items-center justify-center p-6 safe-top safe-bottom overflow-hidden">
        <div className="w-full max-w-3xl lg:max-w-5xl">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-block mb-6">
              <Zap className="w-16 h-16 text-white mx-auto" />
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-3">
              TalentTrack
            </h1>
            <p className="text-white/90 text-xl lg:text-2xl mb-2">
              Track. Train. Transform.
            </p>
            <p className="text-white/70 text-base">
              Select your role to continue
            </p>
          </div>

          {/* Role Cards */}
          <div className="grid grid-cols-3 gap-6 animate-slide-up">
            {roles.map((roleData, index) => {
              const Icon = roleData.icon;
              const isSelected = selectedRole === roleData.role;
              const isDisabled = isLoading && !isSelected;
              
              return (
                <Card
                  key={roleData.role}
                  className={`relative backdrop-blur-sm bg-white/10 border-2 transition-all duration-300 cursor-pointer group ${
                    isSelected 
                      ? 'border-white/50 bg-white/20 scale-105 shadow-2xl' 
                      : 'border-white/20 hover:border-white/40 hover:bg-white/15'
                  } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => !isLoading && handleRoleSelect(roleData.role)}
                >
                  <CardContent className="p-8 text-center">
                    <div className={`w-20 h-20 mx-auto mb-6 rounded-full bg-white/20 flex items-center justify-center transition-transform duration-300 ${
                      isSelected ? 'scale-110' : 'group-hover:scale-105'
                    }`}>
                      <Icon className="w-10 h-10 text-white" />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-white mb-3">
                      {roleData.label}
                    </h3>
                    
                    <p className="text-white/80 text-base mb-6">
                      {roleData.description}
                    </p>
                    
                    <Button
                      className={`w-full h-12 font-semibold transition-all duration-300 text-base ${
                        isSelected 
                          ? 'bg-white text-purple-900 hover:bg-white/90' 
                          : 'bg-white/20 text-white hover:bg-white/30 border-2 border-white/30'
                      }`}
                      disabled={isLoading}
                    >
                      {isSelected && isLoading ? (
                        <span className="flex items-center justify-center gap-1.5">
                          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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

          {/* Footer */}
          <div className="text-center mt-10 text-white/50 text-sm animate-fade-in" style={{ animationDelay: '300ms' }}>
            <p>Powered by AI • Trusted by Athletes</p>
          </div>
        </div>
      </div>

      {/* Mobile View - New Modern Design */}
      <div className="sm:hidden h-screen bg-gradient-to-b from-purple-900 via-purple-800 to-purple-950 flex flex-col safe-top safe-bottom overflow-hidden">
        {/* Top Section with Logo and Title */}
        <div className="flex-shrink-0 pt-12 pb-6 px-6 text-center animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm mb-4 shadow-lg">
            <Zap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
            TalentTrack
          </h1>
          <p className="text-white/80 text-sm font-medium">
            Track. Train. Transform.
          </p>
        </div>

        {/* Role Selection Cards - Scrollable */}
        <div className="flex-1 px-5 pb-6 overflow-y-auto">
          <p className="text-white/70 text-xs font-medium mb-4 text-center uppercase tracking-wider">
            Choose Your Role
          </p>
          
          <div className="space-y-3 animate-slide-up">
            {roles.map((roleData, index) => {
              const Icon = roleData.icon;
              const isSelected = selectedRole === roleData.role;
              const isDisabled = isLoading && !isSelected;
              
              return (
                <div
                  key={roleData.role}
                  className={`relative overflow-hidden rounded-2xl transition-all duration-300 ${
                    isSelected ? 'scale-[1.02]' : 'active:scale-[0.98]'
                  } ${isDisabled ? 'opacity-50' : ''}`}
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => !isLoading && handleRoleSelect(roleData.role)}
                >
                  {/* Gradient Background */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${roleData.gradient} opacity-90`} />
                  
                  {/* Glass Effect Overlay */}
                  <div className="absolute inset-0 backdrop-blur-sm bg-white/5" />
                  
                  {/* Content */}
                  <div className="relative p-5 flex items-center gap-4">
                    {/* Icon Circle */}
                    <div className={`flex-shrink-0 w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center transition-transform duration-300 ${
                      isSelected ? 'scale-110 bg-white/30' : ''
                    }`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    
                    {/* Text Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-white mb-0.5">
                        {roleData.label}
                      </h3>
                      <p className="text-white/90 text-xs leading-relaxed">
                        {roleData.description}
                      </p>
                    </div>
                    
                    {/* Arrow or Loading */}
                    <div className="flex-shrink-0">
                      {isSelected && isLoading ? (
                        <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <ChevronRight className={`w-6 h-6 text-white transition-transform duration-300 ${
                          isSelected ? 'translate-x-1' : ''
                        }`} />
                      )}
                    </div>
                  </div>
                  
                  {/* Selection Indicator */}
                  {isSelected && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white animate-pulse" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="flex-shrink-0 pb-6 px-6 text-center animate-fade-in" style={{ animationDelay: '300ms' }}>
          <div className="inline-flex items-center gap-2 text-white/50 text-xs">
            <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
            <span>Powered by AI</span>
            <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
            <span>Trusted by Athletes</span>
            <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
          </div>
        </div>
      </div>
    </>
  );
};

export default AuthFlow;
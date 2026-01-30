import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';
import { authService } from '@/services/authService';
import { UserProfile } from '@/services/userProfileService';
import { Zap, Mail, User, Phone, Camera, ArrowLeft, Loader2, Lock, Eye, EyeOff } from 'lucide-react';

interface LoginSignupProps {
  onSuccess: (profile: UserProfile) => void;
}

type Step = 'role' | 'choice' | 'login' | 'signup';
type Role = 'ATHLETE' | 'COACH' | 'SAI_ADMIN';

const LoginSignup = ({ onSuccess }: LoginSignupProps) => {
  const [step, setStep] = useState<Step>('role');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [profilePic, setProfilePic] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const roles = [
    { value: 'ATHLETE' as Role, label: 'Athlete', icon: '🏃', description: 'Track your fitness journey' },
    { value: 'COACH' as Role, label: 'Coach', icon: '👨‍🏫', description: 'Manage and guide athletes' },
    { value: 'SAI_ADMIN' as Role, label: 'SAI Admin', icon: '🛡️', description: 'Oversee all operations' }
  ];

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    setStep('choice');
  };

  const handleLogin = async () => {
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email');
      return;
    }
    if (!password) {
      toast.error('Please enter your password');
      return;
    }

    setIsLoading(true);
    try {
      const profile = await authService.login({ email, password });
      
      // Check if role matches
      if (profile.role !== selectedRole) {
        toast.error(`This account is registered as ${profile.role.toLowerCase()}, not ${selectedRole?.toLowerCase()}`);
        setIsLoading(false);
        return;
      }
      
      toast.success('Login successful!');
      onSuccess(profile);
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email');
      return;
    }
    if (!password || password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      const profile = await authService.signup({
        name: name.trim(),
        email,
        password,
        phone,
        role: selectedRole!,
        profilePic
      });
      toast.success('Account created successfully!');
      onSuccess(profile);
    } catch (error: any) {
      toast.error(error.message || 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePic(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleBack = () => {
    if (step === 'choice') {
      setStep('role');
      setSelectedRole(null);
    } else if (step === 'login' || step === 'signup') {
      setStep('choice');
      setEmail('');
      setPassword('');
      setName('');
      setPhone('');
      setProfilePic('');
    }
  };

  const selectedRoleData = roles.find(r => r.value === selectedRole);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 flex items-center justify-center p-4 safe-top safe-bottom">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-block mb-4">
            <Zap className="w-16 h-16 text-white mx-auto" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">TalentTrack</h1>
          <p className="text-white/80 text-lg">Track. Train. Transform.</p>
        </div>

        {/* Role Selection */}
        {step === 'role' && (
          <Card className="backdrop-blur-sm bg-white/10 border-2 border-white/20 animate-slide-up">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-white mb-4 text-center">Choose Your Role</h2>
              <div className="space-y-3">
                {roles.map((role) => (
                  <button
                    key={role.value}
                    onClick={() => handleRoleSelect(role.value)}
                    className="w-full p-4 rounded-lg bg-white/10 hover:bg-white/20 border-2 border-white/20 hover:border-white/40 transition-all duration-200 text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{role.icon}</span>
                      <div className="flex-1">
                        <div className="text-white font-semibold text-lg">{role.label}</div>
                        <div className="text-white/90 text-sm">{role.description}</div>
                      </div>
                      <div className="text-white/70 group-hover:text-white transition-colors text-xl">→</div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Login or Signup Choice */}
        {step === 'choice' && (
          <Card className="backdrop-blur-sm bg-white/10 border-2 border-white/20 animate-slide-up">
            <CardContent className="p-6">
              <button onClick={handleBack} className="text-white/70 hover:text-white mb-4 flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">{selectedRoleData?.icon}</div>
                <h2 className="text-2xl font-bold text-white mb-2">{selectedRoleData?.label}</h2>
                <p className="text-white/70">Choose an option to continue</p>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() => setStep('login')}
                  className="w-full h-14 bg-white text-purple-900 hover:bg-white/90 font-semibold text-lg"
                >
                  Login to Existing Account
                </Button>
                <Button
                  onClick={() => setStep('signup')}
                  className="w-full h-14 bg-white/20 text-white hover:bg-white/30 border-2 border-white/30 font-semibold text-lg"
                >
                  Create New Account
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Login Form */}
        {step === 'login' && (
          <Card className="backdrop-blur-sm bg-white/10 border-2 border-white/20 animate-slide-up">
            <CardContent className="p-6">
              <button onClick={handleBack} className="text-white/70 hover:text-white mb-4 flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">{selectedRoleData?.icon}</div>
                <h2 className="text-xl font-bold text-white mb-1">Login as {selectedRoleData?.label}</h2>
                <p className="text-white/70 text-sm">Enter your credentials</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-white mb-2 block">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                      placeholder="your@email.com"
                      className="pl-11 bg-white/10 border-white/20 text-white placeholder:text-white/50 h-12"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="password" className="text-white mb-2 block">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                      placeholder="Enter your password"
                      className="pl-11 pr-11 bg-white/10 border-white/20 text-white placeholder:text-white/50 h-12"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <Button
                  onClick={handleLogin}
                  disabled={isLoading}
                  className="w-full h-12 bg-white text-purple-900 hover:bg-white/90 font-semibold"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    'Login'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Signup Form */}
        {step === 'signup' && (
          <Card className="backdrop-blur-sm bg-white/10 border-2 border-white/20 animate-slide-up max-h-[85vh] overflow-y-auto">
            <CardContent className="p-6">
              <button onClick={handleBack} className="text-white/70 hover:text-white mb-4 flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">{selectedRoleData?.icon}</div>
                <h2 className="text-xl font-bold text-white mb-1">Create {selectedRoleData?.label} Account</h2>
                <p className="text-white/70 text-sm">Fill in your details</p>
              </div>

              <div className="space-y-4">
                {/* Profile Picture */}
                <div className="flex flex-col items-center mb-2">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-24 h-24 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center cursor-pointer hover:bg-white/20 transition-all overflow-hidden"
                  >
                    {profilePic ? (
                      <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-8 h-8 text-white/50" />
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <p className="text-white/70 text-xs mt-2">Upload profile picture (optional)</p>
                </div>

                <div>
                  <Label htmlFor="name" className="text-white mb-2 block">Full Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      className="pl-11 bg-white/10 border-white/20 text-white placeholder:text-white/50 h-12"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="signup-email" className="text-white mb-2 block">Email Address *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
                    <Input
                      id="signup-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="pl-11 bg-white/10 border-white/20 text-white placeholder:text-white/50 h-12"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="signup-password" className="text-white mb-2 block">Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
                    <Input
                      id="signup-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="pl-11 pr-11 bg-white/10 border-white/20 text-white placeholder:text-white/50 h-12"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-white/50 text-xs mt-1">Minimum 6 characters</p>
                </div>

                <div>
                  <Label htmlFor="phone" className="text-white mb-2 block">Phone Number (Optional)</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      className="pl-11 bg-white/10 border-white/20 text-white placeholder:text-white/50 h-12"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <Button
                  onClick={handleSignup}
                  disabled={isLoading}
                  className="w-full h-12 bg-white text-purple-900 hover:bg-white/90 font-semibold"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center mt-6 text-white/50 text-sm">
          <p>Powered by AI • Trusted by Athletes</p>
        </div>
      </div>
    </div>
  );
};

export default LoginSignup;

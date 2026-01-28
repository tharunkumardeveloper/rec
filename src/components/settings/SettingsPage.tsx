import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft, 
  Bell, 
  Moon, 
  Info,
  Shield,
  HelpCircle
} from 'lucide-react';

interface SettingsPageProps {
  onBack: () => void;
  userName?: string;
  userRole?: 'athlete' | 'coach' | 'admin';
}

const SettingsPage = ({ onBack, userName = 'User', userRole = 'athlete' }: SettingsPageProps) => {
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    emailUpdates: true,
    workoutReminders: true,
    achievementAlerts: true
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-primary border-b border-primary-dark safe-top">
        <div className="px-4 py-4">
          <div className="flex items-center max-w-md mx-auto">
            <Button variant="ghost" size="sm" onClick={() => {
              window.scrollTo(0, 0);
              onBack();
            }} className="mr-3 text-white hover:bg-white/20">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold text-white">Settings</h1>
          </div>
        </div>
      </div>

      <div className="px-4 pb-8 max-w-4xl mx-auto pt-6">
        {/* User Profile Section */}
        <Card className="card-elevated mb-6">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold">
                {userName.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold">{userName}</h2>
                <div className="flex items-center space-x-2">
                  <p className="text-sm text-muted-foreground capitalize">{userRole}</p>
                  {userRole === 'admin' && (
                    <Shield className="w-4 h-4 text-primary" />
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Two Column Layout on Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Notifications */}
            <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="w-5 h-5 mr-2" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notifications">Push Notifications</Label>
                <p className="text-sm text-muted-foreground">Get notified about workouts and challenges</p>
              </div>
              <Switch
                id="notifications"
                checked={settings.notifications}
                onCheckedChange={() => toggleSetting('notifications')}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="workout-reminders">Workout Reminders</Label>
                <p className="text-sm text-muted-foreground">Daily workout reminders</p>
              </div>
              <Switch
                id="workout-reminders"
                checked={settings.workoutReminders}
                onCheckedChange={() => toggleSetting('workoutReminders')}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="achievement-alerts">Achievement Alerts</Label>
                <p className="text-sm text-muted-foreground">Get notified when you earn badges</p>
              </div>
              <Switch
                id="achievement-alerts"
                checked={settings.achievementAlerts}
                onCheckedChange={() => toggleSetting('achievementAlerts')}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-updates">Email Updates</Label>
                <p className="text-sm text-muted-foreground">Weekly progress reports via email</p>
              </div>
              <Switch
                id="email-updates"
                checked={settings.emailUpdates}
                onCheckedChange={() => toggleSetting('emailUpdates')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Moon className="w-5 h-5 mr-2" />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="dark-mode">Dark Mode</Label>
                <p className="text-sm text-muted-foreground">Switch to dark theme</p>
              </div>
              <Switch
                id="dark-mode"
                checked={settings.darkMode}
                onCheckedChange={() => toggleSetting('darkMode')}
              />
            </div>
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Moon className="w-5 h-5 mr-2" />
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="dark-mode">Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">Switch to dark theme</p>
                </div>
                <Switch
                  id="dark-mode"
                  checked={settings.darkMode}
                  onCheckedChange={() => toggleSetting('darkMode')}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Support */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center">
              <HelpCircle className="w-5 h-5 mr-2" />
              Support
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <HelpCircle className="w-4 h-4 mr-3" />
              Help Center
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Info className="w-4 h-4 mr-3" />
              Privacy Policy
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Info className="w-4 h-4 mr-3" />
              Terms of Service
            </Button>
            </CardContent>
          </Card>

          {/* App Info */}
          <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Info className="w-5 h-5 mr-2" />
              App Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Version</span>
                <span className="font-medium">2.1.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Build</span>
                <span className="font-medium">2024.09.28</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Credits</span>
                <span className="font-medium">TalentTrack Team</span>
              </div>
            </div>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </div>
  );
};

export default SettingsPage;
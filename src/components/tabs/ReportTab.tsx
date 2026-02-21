import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChartBar as BarChart3, Calendar, Target, TrendingUp, Download, Award, Clock, Zap, Scale, Ruler, Activity, Play, ChevronDown, ChevronUp } from 'lucide-react';
import { getWorkoutHistory, getRecentWorkouts, getStorageInfo } from '@/utils/workoutStorage';
import WeeklyProgress from '@/components/dashboard/WeeklyProgress';

interface ReportTabProps {
  userSetupData?: any;
}

const ReportTab = ({ userSetupData }: ReportTabProps) => {
  // Get workout history from localStorage
  const workoutHistory = getWorkoutHistory();
  const recentWorkouts = getRecentWorkouts(2); // Get last 2 workouts
  const storageInfo = getStorageInfo();

  // Collapsible sections state - persisted in localStorage
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('reportCollapsedSections');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('reportCollapsedSections', JSON.stringify(collapsedSections));
  }, [collapsedSections]);

  const toggleSection = (sectionId: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };
  
  // Get current day
  const today = new Date().toLocaleDateString('en-US', { weekday: 'short' });
  
  const weeklyStats = [
    { day: 'Mon', value: 85 },
    { day: 'Tue', value: 92 },
    { day: 'Wed', value: 78 },
    { day: 'Thu', value: 95 },
    { day: 'Fri', value: 88 },
    { day: 'Sat', value: 76 },
    { day: 'Sun', value: 82 }
  ];

  const achievements = [
    { 
      title: '5-Day Streak',
      description: 'Completed workouts 5 days in a row',
      icon: '🔥',
      date: '2 days ago'
    },
    {
      title: 'Push-up Master',
      description: 'Completed 100 push-ups in one session',
      icon: '💪',
      date: '1 week ago'
    },
    {
      title: 'First Challenge',
      description: 'Completed your first fitness challenge',
      icon: '🏆',
      date: '2 weeks ago'
    }
  ];

  // Calculate BMI from setup data
  const calculateBMI = () => {
    if (userSetupData?.height && userSetupData?.weight) {
      const heightM = userSetupData.height / 100; // Convert cm to m
      const bmi = userSetupData.weight / (heightM * heightM);
      return bmi.toFixed(1);
    }
    return "22.9"; // Default value
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: "Underweight", color: "info" };
    if (bmi < 25) return { category: "Normal Weight", color: "success" };
    if (bmi < 30) return { category: "Overweight", color: "warning" };
    return { category: "Obese", color: "destructive" };
  };

  const bmiValue = parseFloat(calculateBMI());
  const bmiInfo = getBMICategory(bmiValue);

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header - Enhanced for desktop */}
      <div className="text-center max-w-4xl mx-auto">
        <h1 className="text-2xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          Performance Report
        </h1>
        <p className="text-muted-foreground text-sm md:text-base">Track your fitness journey with AI-powered insights</p>
      </div>

      {/* Dashboard Grid - Enhanced for desktop: 2 columns on tablet, 3 columns on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-[1800px] mx-auto">
        {/* Left Column - BMI & Body Metrics */}
        <div className="space-y-4 md:space-y-6 md:col-span-1 lg:col-span-1">
          {/* BMI Tracker */}
          <Card className="card-elevated hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="pb-3 cursor-pointer" onClick={() => toggleSection('bmi')}>
              <CardTitle className="flex items-center justify-between text-base md:text-lg">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Scale className="w-5 h-5 text-primary" />
                  </div>
                  <span>BMI Tracker</span>
                </div>
                {collapsedSections['bmi'] ? (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                )}
              </CardTitle>
            </CardHeader>
            {!collapsedSections['bmi'] && (
            <CardContent className="transition-all duration-300">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Ruler className="w-4 h-4 text-muted-foreground mr-1" />
                  </div>
                  <div className="text-sm font-medium">{userSetupData?.height || "175"} cm</div>
                  <div className="text-xs text-muted-foreground">Height</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Scale className="w-4 h-4 text-muted-foreground mr-1" />
                  </div>
                  <div className="text-sm font-medium">{userSetupData?.weight || "70"} kg</div>
                  <div className="text-xs text-muted-foreground">Weight</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary mb-1">{calculateBMI()}</div>
                  <div className="text-xs text-muted-foreground">BMI</div>
                </div>
              </div>
              <div className={`p-3 rounded-lg bg-${bmiInfo.color}/10 border border-${bmiInfo.color}/20`}>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Category</span>
                  <Badge variant="outline" className={`text-${bmiInfo.color}`}>
                    {bmiInfo.category}
                  </Badge>
                </div>
              </div>
            </CardContent>
            )}
          </Card>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <Card className="card-elevated hover:shadow-lg transition-all duration-300 hover:scale-105">
              <CardContent className="p-4 md:p-6 text-center">
                <div className="flex flex-col items-center justify-center mb-2">
                  <div className="p-3 bg-primary/10 rounded-full mb-3">
                    <Zap className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                  </div>
                  <span className="text-2xl md:text-3xl font-bold text-primary">{workoutHistory.length > 0 ? '92%' : '87%'}</span>
                </div>
                <p className="text-xs md:text-sm text-muted-foreground font-medium">Weekly Goal</p>
              </CardContent>
            </Card>

            <Card className="card-elevated hover:shadow-lg transition-all duration-300 hover:scale-105">
              <CardContent className="p-4 md:p-6 text-center">
                <div className="flex flex-col items-center justify-center mb-2">
                  <div className="p-3 bg-success/10 rounded-full mb-3">
                    <Clock className="w-6 h-6 md:w-8 md:h-8 text-success" />
                  </div>
                  <span className="text-2xl md:text-3xl font-bold text-success">{workoutHistory.length > 0 ? '9.2h' : '8.5h'}</span>
                </div>
                <p className="text-xs md:text-sm text-muted-foreground font-medium">This Week</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Center Column - Charts & Progress */}
        <div className="space-y-4 md:space-y-6 md:col-span-2 lg:col-span-1">
          {/* Weekly Progress - New Horizontal Component */}
          <WeeklyProgress />

          {/* Performance Insights */}
          <Card className="card-elevated hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="pb-3 cursor-pointer" onClick={() => toggleSection('insights')}>
              <CardTitle className="flex items-center justify-between text-base md:text-lg">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-success/10 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-success" />
                  </div>
                  <span>Performance Insights</span>
                </div>
                {collapsedSections['insights'] ? (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                )}
              </CardTitle>
            </CardHeader>
            {!collapsedSections['insights'] && (
            <CardContent className="space-y-4 transition-all duration-300">
              {workoutHistory.length > 0 && (
                <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                    <div>
                      <p className="text-sm font-medium text-primary">Recent Activity</p>
                      <p className="text-xs text-muted-foreground">You've completed {workoutHistory.length} workout{workoutHistory.length !== 1 ? 's' : ''} with AI analysis</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="p-3 bg-success/10 rounded-lg border border-success/20">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-success rounded-full mt-2" />
                  <div>
                    <p className="text-sm font-medium text-success">Strength Improving</p>
                    <p className="text-xs text-muted-foreground">Your push-up performance increased by 15% this week</p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-warning/10 rounded-lg border border-warning/20">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-warning rounded-full mt-2" />
                  <div>
                    <p className="text-sm font-medium text-warning">Flexibility Focus</p>
                    <p className="text-xs text-muted-foreground">Consider adding more stretching to your routine</p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-info/10 rounded-lg border border-info/20">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-info rounded-full mt-2" />
                  <div>
                    <p className="text-sm font-medium text-info">Consistency Bonus</p>
                    <p className="text-xs text-muted-foreground">You're on track for your monthly goal!</p>
                  </div>
                </div>
              </div>
            </CardContent>
            )}
          </Card>
        </div>

        {/* Right Column - Recent Activity & Achievements */}
        <div className="space-y-4 md:space-y-6 md:col-span-2 lg:col-span-1">
          {/* Recent Workouts - Last 2 Only */}
          {recentWorkouts.length > 0 && (
            <Card className="card-elevated hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="pb-3 cursor-pointer" onClick={() => toggleSection('workouts')}>
            <CardTitle className="flex items-center justify-between text-base md:text-lg">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Activity className="w-5 h-5 text-primary" />
                </div>
                <span>Recent Workouts</span>
                <Badge variant="outline" className="text-xs">
                  Last {recentWorkouts.length}
                </Badge>
              </div>
              {collapsedSections['workouts'] ? (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              )}
            </CardTitle>
          </CardHeader>
          {!collapsedSections['workouts'] && (
          <CardContent className="transition-all duration-300">
            <div className="space-y-3">
              {recentWorkouts.reverse().map((workout, index) => (
                <Card key={workout.id || index} className="border">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4 mb-3">
                      {/* Workout Thumbnail */}
                      <div className="w-16 h-12 bg-black rounded overflow-hidden relative flex-shrink-0">
                        {workout.thumbnailUrl ? (
                          <img 
                            src={workout.thumbnailUrl} 
                            alt={`${workout.activityName} thumbnail`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                            <Play className="w-4 h-4 text-primary" />
                          </div>
                        )}
                      </div>
                      
                      {/* Workout Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm">{workout.activityName}</h4>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(workout.timestamp)}
                        </p>
                      </div>
                    </div>
                    
                    {/* Stats Grid */}
                    <div className="grid grid-cols-4 gap-3 text-center">
                      <div>
                        <div className="text-sm font-medium">{workout.setsCompleted}</div>
                        <div className="text-xs text-muted-foreground">Sets</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium">{workout.badSets}</div>
                        <div className="text-xs text-muted-foreground">Bad Sets</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium">{workout.duration}</div>
                        <div className="text-xs text-muted-foreground">Duration</div>
                      </div>
                      <div>
                        <Badge 
                          className={`text-xs ${workout.posture === 'Good' ? 'bg-success/10 text-success border-success' : 'bg-warning/10 text-warning border-warning'}`}
                          variant="outline"
                        >
                          {workout.posture}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Storage Info */}
            <div className="mt-4 p-3 bg-secondary/30 rounded-lg">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Total workouts: {storageInfo.workoutCount}</span>
                <span>Thumbnails: {storageInfo.thumbnailCount}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Older workout thumbnails are automatically removed to save space
              </p>
            </div>
          </CardContent>
          )}
        </Card>
      )}

          {/* Recent Achievements */}
          <Card className="card-elevated hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="pb-3 cursor-pointer" onClick={() => toggleSection('achievements')}>
              <CardTitle className="flex items-center justify-between text-base md:text-lg">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-warning/10 rounded-lg">
                    <Award className="w-5 h-5 text-warning" />
                  </div>
                  <span>Recent Achievements</span>
                </div>
                {collapsedSections['achievements'] ? (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                )}
              </CardTitle>
            </CardHeader>
            {!collapsedSections['achievements'] && (
            <CardContent className="transition-all duration-300">
              <div className="space-y-3">
                {achievements.map((achievement, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-secondary/30">
                    <div className="text-2xl">{achievement.icon}</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm">{achievement.title}</h3>
                      <p className="text-xs text-muted-foreground">{achievement.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">{achievement.date}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      New
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
            )}
          </Card>
        </div>
      </div>

      {/* Bottom Section - Full Width on Desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-[1800px] mx-auto">
        {/* Export Options */}
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h3 className="font-medium text-base md:text-lg flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Download className="w-5 h-5 text-primary" />
                  </div>
                  Export Data
                </h3>
                <p className="text-sm text-muted-foreground mt-1">Download your fitness reports and analytics</p>
              </div>
              <Button variant="outline" size="sm" className="md:size-default w-full md:w-auto">
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Placeholder */}
        <Card className="hover:shadow-lg transition-shadow duration-300 bg-gradient-to-br from-primary/5 to-purple-500/5">
          <CardContent className="p-6 md:p-8 text-center">
            <div className="inline-flex p-3 bg-primary/10 rounded-full mb-4">
              <BarChart3 className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-semibold text-base md:text-lg mb-2">Advanced Analytics Coming Soon</h3>
            <p className="text-sm text-muted-foreground">
              Detailed performance analysis, comparison charts, and AI-powered personalized recommendations.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportTab;
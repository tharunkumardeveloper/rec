import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import workoutStorageService, { StoredWorkout } from '@/services/workoutStorageService';
import AthleteWorkoutDetail from '@/components/coach/AthleteWorkoutDetail';
import { userProfileService } from '@/services/userProfileService';
import { 
  Search, 
  Settings, 
  User, 
  Target, 
  Trophy, 
  Calendar,
  Zap,
  Star,
  Users,
  Activity,
  BookOpen,
  MessageSquare,
  Plus,
  Filter,
  Download,
  Eye,
  Send,
  Play,
  FileText
} from 'lucide-react';

interface CoachDashboardProps {
  userName: string;
  onTabChange: (tab: string) => void;
  activeTab: string;
  onProfileOpen?: () => void;
  onSettingsOpen?: () => void;
}

const CoachDashboard = ({ userName, onTabChange, activeTab, onProfileOpen, onSettingsOpen }: CoachDashboardProps) => {
  const [searchFocus, setSearchFocus] = useState(false);
  const [athleteWorkouts, setAthleteWorkouts] = useState<Array<{ name: string; workoutCount: number; lastWorkout: string; workouts: StoredWorkout[] }>>([]);
  const [selectedAthlete, setSelectedAthlete] = useState<string | null>(null);
  const [selectedWorkout, setSelectedWorkout] = useState<StoredWorkout | null>(null);
  const [userProfilePic, setUserProfilePic] = useState<string>('');
  const navigate = useNavigate();

  // Load user profile photo
  useEffect(() => {
    const profile = userProfileService.getProfile();
    if (profile?.profilePic) {
      setUserProfilePic(profile.profilePic);
    }
  }, []);

  // Load athlete workout data
  useEffect(() => {
    loadAthleteData();
    // Refresh when Athletes tab becomes active
  }, []);

  // Refresh data when tab changes to discover (Athletes)
  useEffect(() => {
    if (activeTab === 'discover') {
      loadAthleteData();
    }
  }, [activeTab]);

  const loadAthleteData = async () => {
    console.log('🔄 Loading athlete data from MongoDB...');
    try {
      const athletes = await workoutStorageService.getAllAthletes();
      console.log('📊 Found athletes:', athletes);
      
      if (!athletes || athletes.length === 0) {
        console.log('⚠️ No athletes found');
        setAthleteWorkouts([]);
        return;
      }
      
      const athleteData = await Promise.all(
        athletes.map(async (athlete) => {
          try {
            const workouts = await workoutStorageService.getWorkoutsByAthlete(athlete.name);
            return {
              name: athlete.name,
              workoutCount: athlete.workoutCount,
              lastWorkout: athlete.lastWorkout,
              workouts
            };
          } catch (error) {
            console.error(`Error loading workouts for ${athlete.name}:`, error);
            return {
              name: athlete.name,
              workoutCount: 0,
              lastWorkout: athlete.lastWorkout,
              workouts: []
            };
          }
        })
      );
      
      setAthleteWorkouts(athleteData);
      console.log('✅ Loaded', athleteData.length, 'athletes with workouts');
      
      if (athleteData.length > 0) {
        console.log('✅ Athletes:', athleteData.map(a => a.name).join(', '));
      }
    } catch (error) {
      console.error('❌ Error loading athletes:', error);
      setAthleteWorkouts([]);
    }
  };

  const handleViewWorkouts = async (athleteName: string) => {
    setSelectedAthlete(athleteName);
    const workouts = await workoutStorageService.getWorkoutsByAthlete(athleteName);
    if (workouts.length > 0) {
      setSelectedWorkout(workouts[0]); // Select most recent workout
    }
  };

  const handleBackToList = () => {
    setSelectedAthlete(null);
    setSelectedWorkout(null);
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate real stats from athlete data
  const overviewStats = {
    totalAthletes: athleteWorkouts.length,
    totalWorkouts: athleteWorkouts.reduce((sum, a) => sum + a.workoutCount, 0),
    activeToday: athleteWorkouts.filter(a => {
      const lastWorkoutDate = new Date(a.lastWorkout);
      const today = new Date();
      return lastWorkoutDate.toDateString() === today.toDateString();
    }).length,
    avgAccuracy: athleteWorkouts.length > 0 
      ? Math.round(
          athleteWorkouts.reduce((sum, a) => {
            const avgAcc = a.workouts.reduce((s, w) => s + w.accuracy, 0) / (a.workouts.length || 1);
            return sum + avgAcc;
          }, 0) / athleteWorkouts.length
        )
      : 0
  };

  const renderDashboardContent = () => {
    // Calculate workout type distribution
    const workoutTypes: { [key: string]: number } = {};
    athleteWorkouts.forEach(athlete => {
      athlete.workouts.forEach(workout => {
        workoutTypes[workout.activityName] = (workoutTypes[workout.activityName] || 0) + 1;
      });
    });

    const topWorkouts = Object.entries(workoutTypes)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    // Calculate performance trends
    const highPerformers = athleteWorkouts.filter(athlete => {
      const avgAcc = athlete.workouts.reduce((sum, w) => sum + w.accuracy, 0) / athlete.workouts.length;
      return avgAcc >= 80;
    }).length;

    return (
      <div className="space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="border-2 border-primary bg-gradient-to-br from-primary/10 to-primary/5">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="w-5 h-5 text-primary mr-2" />
                <span className="text-2xl font-bold text-primary">{overviewStats.totalAthletes}</span>
              </div>
              <p className="text-sm text-foreground font-medium">Total Athletes</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-success bg-gradient-to-br from-success/10 to-success/5">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Activity className="w-5 h-5 text-success mr-2" />
                <span className="text-2xl font-bold text-success">{overviewStats.activeToday}</span>
              </div>
              <p className="text-sm text-foreground font-medium">Active Today</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-info bg-gradient-to-br from-info/10 to-info/5">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Target className="w-5 h-5 text-info mr-2" />
                <span className="text-2xl font-bold text-info">{overviewStats.totalWorkouts}</span>
              </div>
              <p className="text-sm text-foreground font-medium">Total Workouts</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-warning bg-gradient-to-br from-warning/10 to-warning/5">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Trophy className="w-5 h-5 text-warning mr-2" />
                <span className="text-2xl font-bold text-warning">{overviewStats.avgAccuracy}%</span>
              </div>
              <p className="text-sm text-foreground font-medium">Avg Accuracy</p>
            </CardContent>
          </Card>
        </div>

        {/* Performance Insights */}
        {athleteWorkouts.length > 0 && (
          <Card className="card-elevated">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center">
                <Star className="w-5 h-5 mr-2 text-primary" />
                Performance Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
                  <div className="text-2xl font-bold text-green-600">{highPerformers}</div>
                  <p className="text-xs text-green-600/80 font-medium">High Performers (≥80%)</p>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
                  <div className="text-2xl font-bold text-blue-600">{athleteWorkouts.length - highPerformers}</div>
                  <p className="text-xs text-blue-600/80 font-medium">Need Attention (&lt;80%)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Popular Workouts */}
        {topWorkouts.length > 0 && (
          <Card className="card-elevated">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center">
                <Activity className="w-5 h-5 mr-2 text-primary" />
                Popular Workouts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topWorkouts.map(([name, count], index) => (
                  <div key={name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">{index + 1}</span>
                      </div>
                      <span className="font-medium">{name}</span>
                    </div>
                    <Badge variant="secondary">{count} sessions</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderAthletesContent = () => {
    // If viewing specific athlete's workouts
    if (selectedAthlete && selectedWorkout) {
      const athleteData = athleteWorkouts.find(a => a.name === selectedAthlete);
      if (!athleteData) return null;

      return (
        <AthleteWorkoutDetail
          athleteName={selectedAthlete}
          workouts={athleteData.workouts}
          selectedWorkout={selectedWorkout}
          onBack={handleBackToList}
          onWorkoutSelect={setSelectedWorkout}
          isSAIAdmin={false}
        />
      );
    }

    // Default: Show athletes list
    return (
      <div className="space-y-6">
        {/* Header with count and refresh */}
        {athleteWorkouts.length > 0 && (
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              {athleteWorkouts.length} Athlete{athleteWorkouts.length !== 1 ? 's' : ''}
            </h3>
            <Button 
              onClick={loadAthleteData}
              variant="outline"
              size="sm"
            >
              <Activity className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        )}

        {/* Real Athletes with Workouts */}
        {athleteWorkouts.length > 0 ? (
          <div className="space-y-3">
            {athleteWorkouts.map((athlete) => {
              // Calculate athlete stats
              const totalReps = athlete.workouts.reduce((sum, w) => sum + w.totalReps, 0);
              const avgAccuracy = Math.round(
                athlete.workouts.reduce((sum, w) => sum + w.accuracy, 0) / athlete.workouts.length
              );

              return (
                <Card key={athlete.name} className="card-elevated hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 rounded-full bg-gradient-to-br from-primary to-primary/70 text-white flex items-center justify-center font-bold text-sm">
                          {athlete.name ? athlete.name.split(' ').map(n => n[0]).join('') : '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm sm:text-base truncate">{athlete.name}</h3>
                          <div className="flex items-center flex-wrap gap-2 mt-1">
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {athlete.workoutCount} workout{athlete.workoutCount !== 1 ? 's' : ''}
                            </span>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {totalReps} reps
                            </span>
                            <span className="text-xs text-muted-foreground">•</span>
                            <Badge className={`${avgAccuracy >= 80 ? 'bg-green-500' : 'bg-yellow-500'} text-white text-xs`}>
                              {avgAccuracy}%
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        className="w-full sm:w-auto bg-gradient-to-r from-primary to-primary/80 flex-shrink-0"
                        onClick={() => handleViewWorkouts(athlete.name)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="card-elevated">
            <CardContent className="p-6 text-center space-y-4">
              <Users className="w-16 h-16 text-gray-300 mx-auto" />
              <h3 className="text-lg font-semibold">No Athlete Workouts Yet</h3>
              <p className="text-sm text-muted-foreground">
                Athlete workout data will appear here after they complete workouts and click "Download PDF Report".
              </p>
              <Button 
                onClick={loadAthleteData}
                variant="outline"
                size="sm"
                className="mx-auto"
              >
                <Activity className="w-4 h-4 mr-2" />
                Refresh Data
              </Button>
              <Button 
                onClick={() => {
                  const data = localStorage.getItem('athlete_workouts');
                  if (data) {
                    const workouts = JSON.parse(data);
                    alert(`✅ Found ${workouts.length} workouts in storage!\n\nAthletes: ${workouts.map((w: any) => w.athleteName).join(', ')}`);
                    console.log('📦 localStorage data:', workouts);
                  } else {
                    alert('❌ No data in localStorage!\n\nKey "athlete_workouts" is empty.');
                  }
                }}
                variant="outline"
                size="sm"
                className="mx-auto"
              >
                <FileText className="w-4 h-4 mr-2" />
                Check Storage
              </Button>
              <div className="mt-4 p-4 bg-blue-50 rounded-lg text-left text-xs">
                <p className="font-semibold text-blue-900 mb-2">📝 How to see workouts:</p>
                <ol className="text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Complete workout as athlete</li>
                  <li>Click "Download PDF Report"</li>
                  <li>Logout → Login as coach</li>
                  <li>Go to Athletes tab</li>
                  <li>Click "Refresh Data"</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const getTabContent = () => {
    switch (activeTab) {
      case 'training':
        return renderDashboardContent();
      case 'discover':
        return renderAthletesContent();
      default:
        return renderDashboardContent();
    }
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case 'training':
        return 'Dashboard';
      case 'discover':
        return 'Athletes';
      default:
        return 'Dashboard';
    }
  };

  return (
    <>
      {/* Mobile Header - Only visible on mobile */}
      <div className="sticky top-0 z-50 bg-primary border-b border-primary-dark safe-top lg:hidden">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold overflow-hidden border-2 border-white/30">
                {userProfilePic ? (
                  <img src={userProfilePic} alt={userName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white">{userName.split(' ').map(n => n[0]).join('')}</span>
                )}
              </div>
              <div>
                <h1 className="text-lg font-semibold text-white">Welcome, {userName}</h1>
                <p className="text-sm text-white/80">Coach</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={onSettingsOpen}
                className="tap-target p-2 rounded-lg hover:bg-white/20 transition-colors text-white"
              >
                <Settings className="w-5 h-5" />
              </button>
              <button
                onClick={onProfileOpen}
                className="tap-target rounded-full hover:bg-white/20 transition-colors overflow-hidden border-2 border-white/30"
              >
                {userProfilePic ? (
                  <img src={userProfilePic} alt={userName} className="w-10 h-10 object-cover" />
                ) : (
                  <div className="w-10 h-10 flex items-center justify-center bg-white/20 text-white font-bold">
                    {userName.split(' ').map(n => n[0]).join('')}
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-20 lg:pb-8 max-w-2xl lg:max-w-7xl mx-auto pt-6">
        {/* Search Bar */}
        <div className="mb-6 relative">
          <div className={`relative transition-all duration-300 ${
            searchFocus ? 'transform scale-105' : ''
          }`}>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 lg:w-5 lg:h-5" />
            <Input
              placeholder="Search athletes, challenges..."
              className="pl-10 lg:pl-12 h-12 lg:h-14 rounded-xl border-2 text-base lg:text-lg"
              onFocus={() => setSearchFocus(true)}
              onBlur={() => setSearchFocus(false)}
            />
          </div>
          {searchFocus && (
            <Card className="absolute top-full mt-2 w-full z-10 animate-slide-up">
              <CardContent className="p-3">
                <p className="text-sm text-muted-foreground">Search recommendations will appear here</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Tab Content */}
        <div className="mb-6">
          <h2 className="text-xl lg:text-2xl font-bold mb-4 lg:mb-6">{getTabTitle()}</h2>
          {getTabContent()}
        </div>
      </div>

      {/* Bottom Navigation - Hidden on large screens */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t-2 border-primary/10 safe-bottom lg:hidden shadow-lg">
        <div className="max-w-md mx-auto px-4 py-2">
          <div className="flex justify-around">
            {[
              { id: 'training', label: 'Dashboard', icon: Zap, color: 'text-blue-600' },
              { id: 'discover', label: 'Athletes', icon: Users, color: 'text-green-600' }
            ].map(({ id, label, icon: Icon, color }) => (
              <Button
                key={id}
                variant="ghost"
                size="sm"
                onClick={() => onTabChange(id)}
                className={`flex flex-col items-center space-y-1 tap-target transition-all duration-300 ${
                  activeTab === id 
                    ? `${color} scale-110 font-semibold` 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className={`p-2 rounded-xl transition-all duration-300 ${
                  activeTab === id ? 'bg-gradient-to-br from-primary/20 to-primary/10 shadow-md' : ''
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs">{label}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default CoachDashboard;
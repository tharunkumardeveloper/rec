import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import workoutStorageService, { StoredWorkout } from '@/services/workoutStorageService';
import AthleteWorkoutDetail from '@/components/coach/AthleteWorkoutDetail';
import SAICoachesDashboard from './SAICoachesDashboard';
import SAINationalLeaderboard from './SAINationalLeaderboard';
import SAIEventsScheduler from './SAIEventsScheduler';
import SAIScoutingDashboard from './SAIScoutingDashboard';
import { userProfileService } from '@/services/userProfileService';
import { 
  getMockCoachesWithRealData, 
  getMockAthletesWithRealData, 
  getMockWorkoutsForAthlete,
  isMockAthlete,
  type MockCoach
} from '@/services/mockSAIData';
import { 
  Search, 
  Settings, 
  Target, 
  Trophy, 
  Zap, 
  Users, 
  Activity, 
  Eye,
  UserCheck,
  GraduationCap,
  Calendar,
  Medal,
  Binoculars,
  Star,
  TrendingUp,
  Award,
  Plus,
  BarChart3,
  Home
} from 'lucide-react';

interface SAIAdminDashboardProps {
  userName: string;
  onTabChange: (tab: string) => void;
  activeTab: string;
  onProfileOpen?: () => void;
  onSettingsOpen?: () => void;
  onViewUserProfile?: (userId: string) => void;
}

const SAIAdminDashboard = ({ userName, onTabChange, activeTab, onProfileOpen, onSettingsOpen, onViewUserProfile }: SAIAdminDashboardProps) => {
  const [searchFocus, setSearchFocus] = useState(false);
  const [athleteWorkouts, setAthleteWorkouts] = useState<Array<{ 
    name: string; 
    workoutCount: number; 
    lastWorkout: string; 
    workouts: StoredWorkout[]; 
    coach?: string;
    profilePic?: string;
  }>>([]);
  const [selectedAthlete, setSelectedAthlete] = useState<string | null>(null);
  const [selectedWorkout, setSelectedWorkout] = useState<StoredWorkout | null>(null);
  const [userProfilePic, setUserProfilePic] = useState<string>('');
  const [coaches, setCoaches] = useState<MockCoach[]>([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showScoutingModal, setShowScoutingModal] = useState(false);

  // Load user profile photo
  useEffect(() => {
    const profile = userProfileService.getProfile();
    if (profile?.profilePic) {
      setUserProfilePic(profile.profilePic);
    }
  }, []);

  useEffect(() => {
    loadAthleteData();
  }, []);

  useEffect(() => {
    if (activeTab === 'discover') {
      loadAthleteData();
    }
  }, [activeTab]);

  const loadAthleteData = async () => {
    try {
      // Get real athletes from MongoDB
      const realAthletes = await workoutStorageService.getAllAthletes();
      
      // Get mock athletes merged with real data
      const allMockAthletes = getMockAthletesWithRealData(realAthletes);
      
      // Get coaches with real data
      const coachesData = getMockCoachesWithRealData(realAthletes);
      setCoaches(coachesData);
      
      // Load workouts for each athlete
      const athleteData = await Promise.all(
        allMockAthletes.map(async (athlete) => {
          try {
            let workouts: StoredWorkout[];
            
            // Check if this is a mock athlete or real athlete
            if (isMockAthlete(athlete.name)) {
              // Mock athlete - use mock workouts
              workouts = getMockWorkoutsForAthlete(athlete.name) as StoredWorkout[];
            } else {
              // Real athlete - fetch from MongoDB
              workouts = await workoutStorageService.getWorkoutsByAthlete(athlete.name);
            }
            
            return {
              name: athlete.name,
              workoutCount: athlete.workoutCount,
              lastWorkout: athlete.lastWorkout,
              workouts,
              coach: athlete.coachName,
              profilePic: athlete.profilePic
            };
          } catch (error) {
            return {
              name: athlete.name,
              workoutCount: 0,
              lastWorkout: athlete.lastWorkout,
              workouts: [],
              coach: athlete.coachName,
              profilePic: athlete.profilePic
            };
          }
        })
      );
      
      setAthleteWorkouts(athleteData);
    } catch (error) {
      console.error('Error loading athletes:', error);
      setAthleteWorkouts([]);
    }
  };

  const handleViewWorkouts = async (athleteName: string) => {
    setSelectedAthlete(athleteName);
    const workouts = await workoutStorageService.getWorkoutsByAthlete(athleteName);
    if (workouts.length > 0) {
      setSelectedWorkout(workouts[0]);
    }
  };

  const handleBackToList = () => {
    setSelectedAthlete(null);
    setSelectedWorkout(null);
  };

  const overviewStats = {
    totalAthletes: athleteWorkouts.length,
    totalCoaches: 3, // Gautham Vasudev Menon, Rahul Dravid, Manish Paul
    totalWorkouts: athleteWorkouts.reduce((sum, a) => sum + a.workoutCount, 0),
    avgAccuracy: athleteWorkouts.length > 0 
      ? Math.round(
          athleteWorkouts.reduce((sum, a) => {
            const avgAcc = a.workouts.reduce((s, w) => s + w.accuracy, 0) / (a.workouts.length || 1);
            return sum + avgAcc;
          }, 0) / athleteWorkouts.length
        )
      : 0
  };

  const renderDashboardContent = () => (
    <div className="space-y-6">
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
              <UserCheck className="w-5 h-5 text-success mr-2" />
              <span className="text-2xl font-bold text-success">{overviewStats.totalCoaches}</span>
            </div>
            <p className="text-sm text-foreground font-medium">Total Coaches</p>
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

      {/* SAI Scouting Info Banner */}
      <Card className="border-2 border-purple-500 bg-gradient-to-br from-purple-50 to-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-purple-500 rounded-lg">
              <Binoculars className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-purple-900 mb-1">SAI Talent Scouting & Analytics</h3>
              <p className="text-sm text-purple-700 mb-3">
                Identify and nurture promising athletes across India. Monitor performance metrics, track progress, and discover future champions.
              </p>
              <Button 
                onClick={() => onTabChange('analytics')} 
                size="sm" 
                className="bg-purple-600 hover:bg-purple-700"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                View Analytics Dashboard
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Recent Activity</h3>
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Activity className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">System Active</p>
                <p className="text-xs text-muted-foreground">
                  {overviewStats.totalAthletes} athletes tracked • {overviewStats.totalWorkouts} workouts recorded
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Coaches Preview Section */}
      {coaches.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Top Coaches</h3>
            <Button onClick={() => onTabChange('analytics')} variant="outline" size="sm">
              <Eye className="w-4 h-4 mr-2" />
              View All
            </Button>
          </div>
          
          <div className="space-y-2">
            {coaches.slice(0, 3).map((coach) => (
              <Card key={coach.id} className="card-elevated hover:shadow-md transition-all border-l-4 border-l-success">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-success/30 flex-shrink-0">
                      <img src={coach.profilePic} alt={coach.name} className="w-full h-full object-cover" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm truncate">{coach.name}</h4>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{coach.athleteCount} athletes</span>
                        <span>•</span>
                        <span>{coach.totalWorkouts} workouts</span>
                      </div>
                    </div>
                    
                    <Badge className="bg-success text-white text-xs flex-shrink-0">
                      {coach.athleteCount > 0 ? Math.round(coach.totalWorkouts / coach.athleteCount) : 0} avg
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderAnalyticsContent = () => {
    if (selectedAthlete && selectedWorkout) {
      const athleteData = athleteWorkouts.find(a => a.name === selectedAthlete);
      if (!athleteData) return null;

      return (
        <AthleteWorkoutDetail
          athleteName={selectedAthlete}
          coachName={athleteData.coach}
          workouts={athleteData.workouts}
          selectedWorkout={selectedWorkout}
          onBack={handleBackToList}
          onWorkoutSelect={setSelectedWorkout}
          isSAIAdmin={true}
        />
      );
    }

    return (
      <div className="space-y-6">
        {/* Tab Selector */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Button
            size="sm"
            variant={showScoutingModal ? 'default' : 'outline'}
            onClick={() => setShowScoutingModal(true)}
          >
            <Star className="w-4 h-4 mr-2" />
            Talent Scouting
          </Button>
          <Button
            size="sm"
            variant={!showScoutingModal ? 'default' : 'outline'}
            onClick={() => setShowScoutingModal(false)}
          >
            <Users className="w-4 h-4 mr-2" />
            Athletes & Coaches
          </Button>
        </div>

        {showScoutingModal ? (
          <SAIScoutingDashboard 
            onBack={() => setShowScoutingModal(false)} 
            onViewUserProfile={onViewUserProfile}
          />
        ) : (
          <>
            {/* Athletes Section */}
            {athleteWorkouts.length > 0 && (
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  {athleteWorkouts.length} Athlete{athleteWorkouts.length !== 1 ? 's' : ''}
                </h3>
                <Button onClick={loadAthleteData} variant="outline" size="sm">
                  <Activity className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            )}

            {athleteWorkouts.length > 0 ? (
              <div className="space-y-3">
                {athleteWorkouts.map((athlete) => {
                  const totalReps = athlete.workouts.reduce((sum, w) => sum + w.totalReps, 0);
                  const avgAccuracy = Math.round(
                    athlete.workouts.reduce((sum, w) => sum + w.accuracy, 0) / athlete.workouts.length
                  );

                  return (
                    <Card key={athlete.name} className="card-elevated hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary">
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 rounded-full overflow-hidden border-2 border-primary/30">
                              {athlete.profilePic ? (
                                <img src={athlete.profilePic} alt={athlete.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-primary to-primary/70 text-white flex items-center justify-center font-bold text-sm">
                                  {athlete.name ? athlete.name.split(' ').map(n => n[0]).join('') : '?'}
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-sm sm:text-base truncate">{athlete.name}</h3>
                              <p className="text-xs text-muted-foreground truncate">Coach: {athlete.coach}</p>
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
                    Athlete workout data will appear here after they complete workouts.
                  </p>
                  <Button onClick={loadAthleteData} variant="outline" size="sm">
                    <Activity className="w-4 h-4 mr-2" />
                    Refresh Data
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Coaches Section */}
            {coaches.length > 0 && (
              <>
                <div className="flex items-center justify-between mt-8">
                  <h3 className="text-lg font-semibold">All Coaches</h3>
                </div>
                
                <div className="space-y-2">
                  {coaches.map((coach) => (
                    <Card key={coach.id} className="card-elevated hover:shadow-md transition-all border-l-4 border-l-success">
                      <CardContent className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-success/30 flex-shrink-0">
                            <img src={coach.profilePic} alt={coach.name} className="w-full h-full object-cover" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm truncate">{coach.name}</h4>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{coach.athleteCount} athletes</span>
                              <span>•</span>
                              <span>{coach.totalWorkouts} workouts</span>
                            </div>
                          </div>
                          
                          <Badge className="bg-success text-white text-xs flex-shrink-0">
                            {coach.athleteCount > 0 ? Math.round(coach.totalWorkouts / coach.athleteCount) : 0} avg
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    );
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case 'training':
        return 'Dashboard';
      case 'leaderboard':
        return 'National Leaderboard';
      case 'events':
        return 'Events & Scheduling';
      case 'analytics':
        return 'Analytics & Scouting';
      default:
        return 'Dashboard';
    }
  };

  const getTabContent = () => {
    switch (activeTab) {
      case 'training':
        return renderDashboardContent();
      case 'leaderboard':
        return <SAINationalLeaderboard onBack={() => onTabChange('training')} />;
      case 'events':
        return <SAIEventsScheduler onBack={() => onTabChange('training')} />;
      case 'analytics':
        return renderAnalyticsContent();
      default:
        return renderDashboardContent();
    }
  };

  return (
    <>
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
                <p className="text-sm text-white/80">SAI Admin</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button onClick={onSettingsOpen} className="tap-target p-2 rounded-lg hover:bg-white/20 transition-colors text-white">
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

      <div className="px-4 pb-20 lg:pb-8 max-w-2xl lg:max-w-7xl mx-auto pt-6">
        <div className="mb-6 relative">
          <div className={`relative transition-all duration-300 ${searchFocus ? 'transform scale-105' : ''}`}>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 lg:w-5 lg:h-5" />
            <Input
              placeholder="Search athletes, coaches..."
              className="pl-10 lg:pl-12 h-12 lg:h-14 rounded-xl border-2 text-base lg:text-lg"
              onFocus={() => setSearchFocus(true)}
              onBlur={() => setSearchFocus(false)}
            />
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl lg:text-2xl font-bold mb-4 lg:mb-6">{getTabTitle()}</h2>
          {getTabContent()}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t-2 border-primary/10 safe-bottom lg:hidden shadow-lg">
        <div className="max-w-md mx-auto px-4 py-2">
          <div className="flex justify-around">
            {[
              { id: 'training', label: 'Dashboard', icon: Home, color: 'text-blue-600' },
              { id: 'leaderboard', label: 'Leaderboard', icon: Medal, color: 'text-yellow-600' },
              { id: 'events', label: 'Events', icon: Calendar, color: 'text-purple-600' },
              { id: 'analytics', label: 'Analytics', icon: BarChart3, color: 'text-green-600' }
            ].map(({ id, label, icon: Icon, color }) => (
              <Button
                key={id}
                variant="ghost"
                size="sm"
                onClick={() => onTabChange(id)}
                className={`flex flex-col items-center space-y-1 tap-target transition-all duration-300 ${
                  activeTab === id ? `${color} scale-110 font-semibold` : 'text-muted-foreground hover:text-foreground'
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

export default SAIAdminDashboard;

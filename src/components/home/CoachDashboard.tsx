import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import workoutStorageService, { StoredWorkout } from '@/services/workoutStorageService';
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
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [athleteWorkouts, setAthleteWorkouts] = useState<Array<{ name: string; workoutCount: number; lastWorkout: string; workouts: StoredWorkout[] }>>([]);
  const [selectedAthlete, setSelectedAthlete] = useState<string | null>(null);
  const [selectedWorkout, setSelectedWorkout] = useState<StoredWorkout | null>(null);

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
    console.log('🔄 Loading athlete data from localStorage...');
    const athletes = await workoutStorageService.getAllAthletes();
    console.log('📊 Found athletes:', athletes);
    
    const athleteData = await Promise.all(
      athletes.map(async (athlete) => ({
        name: athlete.name,
        workoutCount: athlete.workoutCount,
        lastWorkout: athlete.lastWorkout,
        workouts: await workoutStorageService.getWorkoutsByAthlete(athlete.name)
      }))
    );
    
    setAthleteWorkouts(athleteData);
    console.log('✅ Loaded', athleteData.length, 'athletes with workouts');
    
    // Show alert if data found
    if (athleteData.length > 0) {
      console.log('✅ Athletes:', athleteData.map(a => a.name).join(', '));
    } else {
      console.log('⚠️ No athlete workouts found in localStorage');
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

  const handleDownloadPDF = (workout: StoredWorkout) => {
    if (!workout.pdfDataUrl) return;
    const link = document.createElement('a');
    link.href = workout.pdfDataUrl;
    link.download = `${workout.athleteName}_${workout.activityName}_Report.pdf`;
    link.click();
  };

  const handleDownloadVideo = (workout: StoredWorkout) => {
    if (!workout.videoDataUrl) return;
    const link = document.createElement('a');
    link.href = workout.videoDataUrl;
    link.download = `${workout.athleteName}_${workout.activityName}_Video.webm`;
    link.click();
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

  // Mock coach data
  const overviewStats = {
    totalAthletes: 28,
    activeToday: 22,
    challengesCompleted: 189,
    totalBadges: 412
  };

  const weeklyActivity = [
    { day: 'Mon', value: 85 },
    { day: 'Tue', value: 92 },
    { day: 'Wed', value: 78 },
    { day: 'Thu', value: 95 },
    { day: 'Fri', value: 88 },
    { day: 'Sat', value: 76 },
    { day: 'Sun', value: 82 }
  ];

  const challengeDistribution = [
    { domain: 'Strength', count: 52, color: 'bg-gradient-to-r from-blue-500 to-blue-600', textColor: 'text-white', iconColor: 'text-blue-500' },
    { domain: 'Endurance', count: 44, color: 'bg-gradient-to-r from-green-500 to-green-600', textColor: 'text-white', iconColor: 'text-green-500' },
    { domain: 'Flexibility', count: 38, color: 'bg-gradient-to-r from-purple-500 to-purple-600', textColor: 'text-white', iconColor: 'text-purple-500' },
    { domain: 'Calisthenics', count: 34, color: 'bg-gradient-to-r from-orange-500 to-orange-600', textColor: 'text-white', iconColor: 'text-orange-500' },
    { domain: 'Para-Athlete', count: 21, color: 'bg-gradient-to-r from-pink-500 to-pink-600', textColor: 'text-white', iconColor: 'text-pink-500' }
  ];

  const athletes = [
    { id: 1, name: 'Athlete Kumar', email: 'athlete@sai.gov.in', level: 8, lastActivity: '2 hours ago', challenges: 12, badges: 28 },
    { id: 2, name: 'Priya Sharma', email: 'priya@sai.gov.in', level: 6, lastActivity: '1 day ago', challenges: 8, badges: 19 },
    { id: 3, name: 'Akash Patel', email: 'akash@sai.gov.in', level: 10, lastActivity: '30 min ago', challenges: 15, badges: 35 },
    { id: 4, name: 'Rohan Singh', email: 'rohan@sai.gov.in', level: 4, lastActivity: '3 hours ago', challenges: 6, badges: 14 },
    { id: 5, name: 'Kavya Nair', email: 'kavya@sai.gov.in', level: 7, lastActivity: '1 hour ago', challenges: 10, badges: 22 },
    { id: 6, name: 'Arjun Reddy', email: 'arjun@sai.gov.in', level: 9, lastActivity: '45 min ago', challenges: 14, badges: 31 },
    { id: 7, name: 'Sneha Gupta', email: 'sneha@sai.gov.in', level: 5, lastActivity: '4 hours ago', challenges: 7, badges: 16 },
    { id: 8, name: 'Vikram Joshi', email: 'vikram@sai.gov.in', level: 11, lastActivity: '1 hour ago', challenges: 18, badges: 42 }
  ];

  const filterTags = ['All Levels', 'Beginner', 'Intermediate', 'Advanced', 'Active Today', 'Inactive'];

  const renderDashboardContent = () => (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
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
              <span className="text-2xl font-bold text-info">{overviewStats.challengesCompleted}</span>
            </div>
            <p className="text-sm text-foreground font-medium">Challenges Done</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-warning bg-gradient-to-br from-warning/10 to-warning/5">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Trophy className="w-5 h-5 text-warning mr-2" />
              <span className="text-2xl font-bold text-warning">{overviewStats.totalBadges}</span>
            </div>
            <p className="text-sm text-foreground font-medium">Badges Earned</p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Activity Chart */}
      <Card className="card-elevated">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-primary" />
            <span>Weekly Athlete Activity</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {weeklyActivity.map((stat, index) => (
              <div key={stat.day} className="flex items-center space-x-3 group">
                <span className="text-sm font-semibold w-10 text-foreground">{stat.day}</span>
                <div className="flex-1 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${
                      stat.value >= 90 ? 'from-green-400 to-green-600' :
                      stat.value >= 80 ? 'from-blue-400 to-blue-600' :
                      stat.value >= 70 ? 'from-yellow-400 to-yellow-600' :
                      'from-orange-400 to-orange-600'
                    } shadow-md group-hover:shadow-lg`}
                    style={{ width: `${stat.value}%` }}
                  />
                </div>
                <span className="text-sm font-bold w-10 text-right text-foreground">{stat.value}%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Challenge Distribution */}
      <Card className="card-elevated">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center">
            <Target className="w-5 h-5 mr-2 text-primary" />
            Challenge Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {challengeDistribution.map((item) => (
              <div key={item.domain} className={`flex items-center justify-between p-4 rounded-xl ${item.color} shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-[1.02]`}>
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center`}>
                    <Target className={`w-5 h-5 text-white`} />
                  </div>
                  <span className={`font-semibold ${item.textColor}`}>{item.domain}</span>
                </div>
                <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">{item.count} completed</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAthletesContent = () => {
    // If viewing specific athlete's workouts
    if (selectedAthlete && selectedWorkout) {
      const athleteData = athleteWorkouts.find(a => a.name === selectedAthlete);
      if (!athleteData) return null;

      return (
        <div className="space-y-6">
          {/* Back Button */}
          <Button
            variant="outline"
            onClick={handleBackToList}
            className="mb-4"
          >
            <Eye className="w-4 h-4 mr-2" />
            Back to Athletes
          </Button>

          {/* Athlete Header */}
          <Card className="card-elevated border-l-4 border-l-primary">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/70 text-white flex items-center justify-center font-bold">
                    {selectedAthlete.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{selectedAthlete}</h2>
                    <p className="text-sm text-muted-foreground">Latest Workout</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Workout List */}
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle>Latest Workout</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {athleteData.workouts.map((workout) => (
                  <div
                    key={workout.id}
                    onClick={() => setSelectedWorkout(workout)}
                    className={`p-3 rounded-lg cursor-pointer transition-all ${
                      selectedWorkout.id === workout.id
                        ? 'bg-primary/10 border-2 border-primary'
                        : 'bg-secondary/30 hover:bg-secondary/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{workout.activityName}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(workout.timestamp)}</p>
                      </div>
                      <Badge className={workout.accuracy >= 80 ? 'bg-green-500' : 'bg-yellow-500'}>
                        {workout.accuracy}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Selected Workout Details */}
          <Card className="card-elevated">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Workout Details</CardTitle>
                <div className="flex space-x-2">
                  {selectedWorkout.pdfDataUrl && (
                    <Button size="sm" variant="outline" onClick={() => handleDownloadPDF(selectedWorkout)}>
                      <FileText className="w-4 h-4 mr-1" />
                      PDF
                    </Button>
                  )}
                  {selectedWorkout.videoDataUrl && (
                    <Button size="sm" variant="outline" onClick={() => handleDownloadVideo(selectedWorkout)}>
                      <Download className="w-4 h-4 mr-1" />
                      Video
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Performance Metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-blue-50 text-center">
                  <div className="text-2xl font-bold text-blue-600">{selectedWorkout.totalReps}</div>
                  <div className="text-xs text-blue-600/70">Total Reps</div>
                </div>
                <div className="p-3 rounded-lg bg-green-50 text-center">
                  <div className="text-2xl font-bold text-green-600">{selectedWorkout.correctReps}</div>
                  <div className="text-xs text-green-600/70">Correct</div>
                </div>
                <div className="p-3 rounded-lg bg-red-50 text-center">
                  <div className="text-2xl font-bold text-red-600">{selectedWorkout.incorrectReps}</div>
                  <div className="text-xs text-red-600/70">Incorrect</div>
                </div>
                <div className="p-3 rounded-lg bg-purple-50 text-center">
                  <div className="text-2xl font-bold text-purple-600">{formatDuration(selectedWorkout.duration)}</div>
                  <div className="text-xs text-purple-600/70">Duration</div>
                </div>
              </div>

              {/* Accuracy Bar */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-semibold">Form Accuracy</span>
                  <span className="font-bold">{selectedWorkout.accuracy}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-full rounded-full ${
                      selectedWorkout.accuracy >= 80 ? 'bg-green-500' : 
                      selectedWorkout.accuracy >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${selectedWorkout.accuracy}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Form Score: {selectedWorkout.formScore}
                </p>
              </div>

              {/* Video Player */}
              {selectedWorkout.videoDataUrl && (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center">
                    <Play className="w-4 h-4 mr-2" />
                    Workout Video
                  </h4>
                  <div className="relative rounded-lg overflow-hidden bg-black">
                    <video
                      src={selectedWorkout.videoDataUrl}
                      controls
                      className="w-full"
                      playsInline
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </div>
              )}

              {/* Screenshots */}
              {selectedWorkout.screenshots && selectedWorkout.screenshots.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Workout Screenshots</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedWorkout.screenshots.slice(0, 6).map((screenshot, index) => (
                      <div key={index} className="relative rounded-lg overflow-hidden bg-black">
                        <img
                          src={screenshot}
                          alt={`Screenshot ${index + 1}`}
                          className="w-full h-auto"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
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

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {filterTags.map((tag) => (
            <Button
              key={tag}
              variant={selectedFilter === tag ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFilter(selectedFilter === tag ? null : tag)}
              className={`rounded-full h-9 text-xs font-medium transition-all duration-300 ${
                selectedFilter === tag 
                  ? 'bg-gradient-to-r from-primary to-primary/80 text-white shadow-md hover:shadow-lg scale-105' 
                  : 'bg-white text-foreground border-2 border-primary/20 hover:border-primary hover:bg-primary/5'
              }`}
            >
              {tag}
            </Button>
          ))}
        </div>

        {/* Real Athletes with Workouts */}
        {athleteWorkouts.length > 0 ? (
          <div className="space-y-3">
            {athleteWorkouts.map((athlete) => (
              <Card key={athlete.name} className="card-elevated hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/70 text-white flex items-center justify-center font-bold text-sm">
                        {athlete.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h3 className="font-semibold">{athlete.name}</h3>
                        <p className="text-sm text-muted-foreground">{formatDate(athlete.lastWorkout)}</p>
                      </div>
                    </div>
                    <Badge className="bg-gradient-to-r from-primary to-primary/80 text-white shadow-sm">
                      Latest
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-3 text-center">
                    {athlete.workouts.slice(0, 3).map((workout, idx) => (
                      <div key={idx} className="p-2 rounded-lg bg-blue-50">
                        <div className="text-xs font-bold text-blue-600">{workout.activityName}</div>
                        <div className="text-xs text-blue-600/70">{workout.accuracy}%</div>
                      </div>
                    ))}
                  </div>

                  <Button 
                    size="sm" 
                    className="w-full bg-gradient-to-r from-primary to-primary/80"
                    onClick={() => handleViewWorkouts(athlete.name)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View All Workouts
                  </Button>
                </CardContent>
              </Card>
            ))}
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

  const renderChallengesContent = () => (
    <div className="space-y-6">
      {/* Add Challenge Button */}
      <Button className="w-full bg-gradient-to-r from-primary via-primary/90 to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]" size="lg">
        <Plus className="w-5 h-5 mr-2" />
        Create New Challenge
      </Button>

      {/* Content Library */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <span>Content Library</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-24 flex flex-col items-center justify-center border-2 border-blue-200 hover:bg-blue-50 hover:border-blue-400 transition-all duration-300 hover:scale-105">
              <div className="text-3xl mb-2">🎥</div>
              <span className="text-xs font-medium text-blue-600">Exercise Videos</span>
            </Button>
            <Button variant="outline" className="h-24 flex flex-col items-center justify-center border-2 border-green-200 hover:bg-green-50 hover:border-green-400 transition-all duration-300 hover:scale-105">
              <div className="text-3xl mb-2">📋</div>
              <span className="text-xs font-medium text-green-600">Workout Plans</span>
            </Button>
            <Button variant="outline" className="h-24 flex flex-col items-center justify-center border-2 border-purple-200 hover:bg-purple-50 hover:border-purple-400 transition-all duration-300 hover:scale-105">
              <div className="text-3xl mb-2">📊</div>
              <span className="text-xs font-medium text-purple-600">Progress Templates</span>
            </Button>
            <Button variant="outline" className="h-24 flex flex-col items-center justify-center border-2 border-orange-200 hover:bg-orange-50 hover:border-orange-400 transition-all duration-300 hover:scale-105">
              <div className="text-3xl mb-2">📚</div>
              <span className="text-xs font-medium text-orange-600">Training Guides</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Challenges */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-primary" />
            Recent Challenges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: 'Upper Body Strength', count: 12, color: 'from-blue-500 to-blue-600' },
              { name: 'Cardio Endurance', count: 10, color: 'from-green-500 to-green-600' },
              { name: 'Flexibility Focus', count: 8, color: 'from-purple-500 to-purple-600' }
            ].map((challenge) => (
              <div key={challenge.name} className={`flex items-center justify-between p-4 rounded-xl bg-gradient-to-r ${challenge.color} shadow-md hover:shadow-lg transition-all duration-300`}>
                <div>
                  <h4 className="font-semibold text-white">{challenge.name}</h4>
                  <p className="text-sm text-white/80">{challenge.count} athletes assigned</p>
                </div>
                <Button size="sm" className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm">Edit</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderReportsContent = () => (
    <div className="space-y-6">
      {/* Export Options */}
      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" size="lg" className="border-2 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-400 transition-all duration-300">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
        <Button variant="outline" size="lg" className="border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-400 transition-all duration-300">
          <Download className="w-4 h-4 mr-2" />
          Export PDF
        </Button>
      </div>

      {/* Performance Overview */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Trophy className="w-5 h-5 mr-2 text-primary" />
            Performance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-6 rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="text-3xl font-bold text-white mb-1">87%</div>
                <p className="text-sm text-white/90 font-medium">Avg Completion Rate</p>
              </div>
              <div className="text-center p-6 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="text-3xl font-bold text-white mb-1">6.2</div>
                <p className="text-sm text-white/90 font-medium">Avg Level</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Domain Strengths */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="w-5 h-5 mr-2 text-primary" />
            Domain Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {challengeDistribution.map((domain) => (
              <div key={domain.domain} className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${domain.color}`} />
                    <span>{domain.domain}</span>
                  </span>
                  <span className="font-bold">{Math.round((domain.count / 156) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                  <div 
                    className={`h-full rounded-full ${domain.color} shadow-md transition-all duration-500`}
                    style={{ width: `${(domain.count / 156) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderNotificationsContent = () => (
    <div className="space-y-6">
      {/* Send Announcement */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            <span>Send Announcement</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Announcement title..." />
          <textarea 
            className="w-full p-3 border rounded-lg resize-none h-24"
            placeholder="Write your message to athletes..."
          />
          <Button className="w-full btn-hero">
            <Send className="w-4 h-4 mr-2" />
            Send to All Athletes
          </Button>
        </CardContent>
      </Card>

      {/* Recent Announcements */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle>Recent Announcements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { title: 'New Challenge Available', date: '2 hours ago', recipients: 24 },
              { title: 'Weekly Progress Update', date: '1 day ago', recipients: 24 },
              { title: 'Training Schedule Change', date: '3 days ago', recipients: 18 }
            ].map((announcement, index) => (
              <div key={index} className="p-3 rounded-lg bg-secondary/30">
                <h4 className="font-medium">{announcement.title}</h4>
                <div className="flex justify-between text-sm text-muted-foreground mt-1">
                  <span>{announcement.date}</span>
                  <span>{announcement.recipients} recipients</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const getTabContent = () => {
    switch (activeTab) {
      case 'training':
        return renderDashboardContent();
      case 'discover':
        return renderAthletesContent();
      case 'report':
        return renderReportsContent();
      case 'roadmap':
        return renderChallengesContent();
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
      case 'report':
        return 'Reports';
      case 'roadmap':
        return 'Challenges';
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
            <div>
              <h1 className="text-lg font-semibold text-white">Welcome, {userName}</h1>
              <p className="text-sm text-white/80">Coach</p>
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
                className="tap-target p-2 rounded-lg hover:bg-white/20 transition-colors text-white"
              >
                <User className="w-5 h-5" />
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
              { id: 'discover', label: 'Athletes', icon: Users, color: 'text-green-600' },
              { id: 'report', label: 'Reports', icon: Target, color: 'text-purple-600' },
              { id: 'roadmap', label: 'Challenges', icon: Calendar, color: 'text-orange-600' }
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
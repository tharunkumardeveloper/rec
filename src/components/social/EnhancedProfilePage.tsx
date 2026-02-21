import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MapPin, Award, TrendingUp, Calendar, Video, 
  UserPlus, UserCheck, ArrowLeft,
  Trophy, Target, Activity
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

export default function EnhancedProfilePage({ userId, onBack }: { userId?: string; onBack?: () => void }) {
  const { userId: paramUserId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [connectionStatus, setConnectionStatus] = useState<'none' | 'pending' | 'connected'>('none');
  const [loading, setLoading] = useState(true);

  // Get userId from auth session
  const getSessionUserId = () => {
    try {
      const sessionStr = localStorage.getItem('auth_session');
      if (sessionStr) {
        const session = JSON.parse(sessionStr);
        return session.userId || '';
      }
    } catch (error) {
      console.error('Error reading session:', error);
    }
    return '';
  };

  const currentUserId = getSessionUserId();
  const profileUserId = userId || paramUserId || currentUserId;
  const isOwnProfile = profileUserId === currentUserId;
  const isCoach = currentUserProfile?.role === 'COACH';
  const canViewWorkouts = isOwnProfile || isCoach || connectionStatus === 'connected';
  const API_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || 'https://rec-backend-yi7u.onrender.com';

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  useEffect(() => {
    loadCurrentUserProfile();
    loadProfile();
  }, [profileUserId]);

  const loadCurrentUserProfile = async () => {
    try {
      const response = await fetch(`${API_URL}/api/users/${currentUserId}`);
      if (response.ok) {
        const data = await response.json();
        setCurrentUserProfile(data);
      }
    } catch (error) {
      console.error('Error loading current user profile:', error);
    }
  };

  const loadProfile = async () => {
    try {
      console.log('📊 Loading profile for:', profileUserId);
      const [profileRes, workoutsRes, statsRes, connectionRes] = await Promise.all([
        fetch(`${API_URL}/api/users/${profileUserId}`),
        fetch(`${API_URL}/api/sessions/user/${profileUserId}`),
        fetch(`${API_URL}/api/users/${profileUserId}/stats`),
        !isOwnProfile ? fetch(`${API_URL}/api/connections/status/${currentUserId}/${profileUserId}`) : Promise.resolve(null)
      ]);

      const profileData = await profileRes.json();
      const workoutsData = await workoutsRes.json();
      const statsData = await statsRes.json();
      const connectionData = connectionRes ? await connectionRes.json() : null;

      setProfile(profileData);
      // Handle both array and object response formats
      setWorkouts(Array.isArray(workoutsData) ? workoutsData : (workoutsData.workouts || []));
      setStats(statsData);
      
      // Set connection status
      if (connectionData) {
        if (connectionData.connected) {
          setConnectionStatus('connected');
        } else if (connectionData.status === 'pending') {
          setConnectionStatus('pending');
        } else {
          setConnectionStatus('none');
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setWorkouts([]); // Set empty array on error
    }
    setLoading(false);
  };

  const sendConnectionRequest = async () => {
    try {
      const response = await fetch(`${API_URL}/api/connections/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromUserId: currentUserId, toUserId: profileUserId })
      });
      
      if (response.ok) {
        setConnectionStatus('pending');
      } else {
        const error = await response.json();
        console.error('Connection request failed:', error);
        // If already exists, reload to get current status
        if (error.error?.includes('already exists')) {
          loadProfile();
        }
      }
    } catch (error) {
      console.error('Error sending request:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-950 via-purple-900 to-indigo-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-950 via-purple-900 to-indigo-950 flex items-center justify-center">
        <div className="text-white text-xl">Profile not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-950 via-purple-900 to-indigo-950">
      {/* Header with Cover */}
      <div className="relative h-48 md:h-64 bg-gradient-to-r from-violet-600 to-purple-600">
        <Button
          onClick={handleBack}
          variant="ghost"
          className="absolute top-4 left-4 text-white"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Button>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 -mt-20 md:-mt-24 pb-8">
        {/* Profile Header Card */}
        <Card className="bg-black/40 backdrop-blur-xl border-violet-500/30 p-6 md:p-8 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <div className="flex justify-center md:justify-start">
              <Avatar className="w-32 h-32 md:w-40 md:h-40 border-4 border-violet-500">
                <AvatarImage src={profile.profilePic} />
                <AvatarFallback className="bg-violet-600 text-white text-4xl">
                  {profile.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left space-y-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white">{profile.name}</h1>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-2">
                  <Badge variant={profile.role === 'COACH' ? 'default' : 'secondary'} className="text-sm">
                    {profile.role}
                  </Badge>
                  {profile.district && (
                    <span className="text-violet-300 flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {profile.district}
                    </span>
                  )}
                </div>
              </div>

              {/* Skills/Specializations */}
              {profile.skills && profile.skills.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-violet-300">
                    {profile.role === 'COACH' ? 'Specializations' : 'Top Skills'}
                  </h3>
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    {profile.skills.map((skill: string, idx: number) => (
                      <Badge key={idx} variant="outline" className="bg-violet-600/20">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {!isOwnProfile && (
                <div className="flex gap-3 justify-center md:justify-start">
                  {connectionStatus === 'none' && (
                    <Button
                      onClick={sendConnectionRequest}
                      className="bg-violet-600 hover:bg-violet-700"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Connect
                    </Button>
                  )}
                  {connectionStatus === 'pending' && (
                    <Button variant="outline" disabled>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Request Pending
                    </Button>
                  )}
                  {connectionStatus === 'connected' && (
                    <Button variant="outline" disabled>
                      <UserCheck className="w-4 h-4 mr-2" />
                      Connected
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Stats Cards (Desktop) */}
            <div className="hidden lg:flex flex-col gap-3">
              <StatCard icon={Activity} label="Total Workouts" value={stats?.totalWorkouts || 0} />
              <StatCard icon={Trophy} label="Best Score" value={stats?.bestScore || 0} />
              <StatCard icon={TrendingUp} label="Avg Accuracy" value={`${stats?.avgAccuracy || 0}%`} />
            </div>
          </div>

          {/* Stats Cards (Mobile) */}
          <div className="grid grid-cols-3 gap-3 mt-6 lg:hidden">
            <StatCard icon={Activity} label="Workouts" value={stats?.totalWorkouts || 0} compact />
            <StatCard icon={Trophy} label="Best" value={stats?.bestScore || 0} compact />
            <StatCard icon={TrendingUp} label="Accuracy" value={`${stats?.avgAccuracy || 0}%`} compact />
          </div>
        </Card>

        {/* Content Tabs */}
        <Tabs defaultValue="workouts" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-black/40">
            <TabsTrigger value="workouts">
              <Video className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Workouts</span>
            </TabsTrigger>
            <TabsTrigger value="stats">
              <TrendingUp className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Statistics</span>
            </TabsTrigger>
            <TabsTrigger value="achievements">
              <Award className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Achievements</span>
            </TabsTrigger>
          </TabsList>

          {/* Workouts Tab */}
          <TabsContent value="workouts" className="space-y-4 mt-6">
            {canViewWorkouts ? (
              workouts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {workouts.map(workout => (
                    <WorkoutCard key={workout._id} workout={workout} />
                  ))}
                </div>
              ) : (
                <Card className="bg-black/40 backdrop-blur-xl border-violet-500/30 p-12 text-center">
                  <Activity className="w-16 h-16 text-violet-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">No Workouts Yet</h3>
                  <p className="text-violet-300">
                    This {profile.role.toLowerCase()} hasn't recorded any workouts yet.
                  </p>
                </Card>
              )
            ) : (
              <Card className="bg-black/40 backdrop-blur-xl border-violet-500/30 p-12 text-center">
                <UserPlus className="w-16 h-16 text-violet-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">
                  {connectionStatus === 'pending' ? 'Connection Request Pending' : 'Connect to View Workouts'}
                </h3>
                <p className="text-violet-300 mb-6">
                  {connectionStatus === 'pending' 
                    ? 'Your connection request is pending approval'
                    : `Send a connection request to view this ${profile.role.toLowerCase()}'s workout history`
                  }
                </p>
                {connectionStatus === 'none' && (
                  <Button onClick={sendConnectionRequest} className="bg-violet-600 hover:bg-violet-700">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Send Connection Request
                  </Button>
                )}
              </Card>
            )}
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StatsCard stats={stats} />
              <ActivityBreakdown workouts={workouts} />
            </div>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-4 mt-6">
            <AchievementsGrid stats={stats} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, compact }: any) {
  return (
    <div className={`bg-violet-600/20 rounded-lg ${compact ? 'p-3' : 'p-4'} text-center`}>
      <Icon className={`${compact ? 'w-5 h-5' : 'w-6 h-6'} text-violet-400 mx-auto mb-2`} />
      <div className={`${compact ? 'text-lg' : 'text-2xl'} font-bold text-white`}>{value}</div>
      <div className={`${compact ? 'text-xs' : 'text-sm'} text-violet-300`}>{label}</div>
    </div>
  );
}

function WorkoutCard({ workout }: any) {
  return (
    <Card className="bg-black/40 backdrop-blur-xl border-violet-500/30 p-4 hover:border-violet-400 transition-all">
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-bold text-white">{workout.activityName}</h3>
            <p className="text-sm text-violet-300">
              {new Date(workout.timestamp).toLocaleDateString()}
            </p>
          </div>
          {workout.face_verified && (
            <Badge variant="outline" className="text-green-400 border-green-400">
              ✓ Verified
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-violet-300">Reps:</span>
            <span className="text-white font-bold ml-2">{workout.totalReps}</span>
          </div>
          <div>
            <span className="text-violet-300">Accuracy:</span>
            <span className="text-white font-bold ml-2">{workout.accuracy}%</span>
          </div>
        </div>

        {workout.videoDataUrl && (
          <Button variant="outline" size="sm" className="w-full">
            <Video className="w-4 h-4 mr-2" />
            View Video
          </Button>
        )}
      </div>
    </Card>
  );
}

function StatsCard({ stats }: any) {
  return (
    <Card className="bg-black/40 backdrop-blur-xl border-violet-500/30 p-6">
      <h3 className="text-xl font-bold text-white mb-4">Performance Overview</h3>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-violet-300">Average Accuracy</span>
            <span className="text-white font-bold">{stats?.avgAccuracy || 0}%</span>
          </div>
          <Progress value={stats?.avgAccuracy || 0} className="h-2" />
        </div>
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-violet-300">Form Quality</span>
            <span className="text-white font-bold">{stats?.formQuality || 0}%</span>
          </div>
          <Progress value={stats?.formQuality || 0} className="h-2" />
        </div>
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-violet-300">Consistency</span>
            <span className="text-white font-bold">{stats?.consistency || 0}%</span>
          </div>
          <Progress value={stats?.consistency || 0} className="h-2" />
        </div>
      </div>
    </Card>
  );
}

function ActivityBreakdown({ workouts }: any) {
  const breakdown = workouts.reduce((acc: any, workout: any) => {
    acc[workout.activityName] = (acc[workout.activityName] || 0) + 1;
    return acc;
  }, {});

  return (
    <Card className="bg-black/40 backdrop-blur-xl border-violet-500/30 p-6">
      <h3 className="text-xl font-bold text-white mb-4">Activity Breakdown</h3>
      <div className="space-y-3">
        {Object.entries(breakdown).map(([activity, count]: any) => (
          <div key={activity} className="flex items-center justify-between">
            <span className="text-violet-300">{activity}</span>
            <Badge variant="secondary">{count} sessions</Badge>
          </div>
        ))}
      </div>
    </Card>
  );
}

function AchievementsGrid({ stats }: any) {
  const achievements = [
    { icon: Trophy, title: 'First Workout', unlocked: stats?.totalWorkouts > 0 },
    { icon: Target, title: '10 Workouts', unlocked: stats?.totalWorkouts >= 10 },
    { icon: Award, title: '90% Accuracy', unlocked: stats?.avgAccuracy >= 90 },
    { icon: TrendingUp, title: 'Consistency King', unlocked: stats?.consistency >= 80 },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {achievements.map((achievement, idx) => (
        <Card
          key={idx}
          className={`p-6 text-center ${
            achievement.unlocked
              ? 'bg-violet-600/20 border-violet-500'
              : 'bg-black/20 border-gray-700 opacity-50'
          }`}
        >
          <achievement.icon className={`w-12 h-12 mx-auto mb-3 ${
            achievement.unlocked ? 'text-yellow-400' : 'text-gray-600'
          }`} />
          <h4 className="text-sm font-bold text-white">{achievement.title}</h4>
        </Card>
      ))}
    </div>
  );
}

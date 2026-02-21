import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MapPin, Award, TrendingUp, Video, 
  UserPlus, UserCheck, ArrowLeft,
  Trophy, Activity, Calendar
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BottomNav from '@/components/navigation/BottomNav';

export default function EnhancedProfilePageNew() {
  const { userId: paramUserId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [connectionStatus, setConnectionStatus] = useState<'none' | 'pending' | 'connected'>('none');
  const [loading, setLoading] = useState(true);

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
  const profileUserId = paramUserId || currentUserId;
  const isOwnProfile = profileUserId === currentUserId;
  const isCoach = currentUserProfile?.role === 'COACH';
  const canViewWorkouts = isOwnProfile || isCoach || connectionStatus === 'connected';
  const API_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || 'https://rec-backend-yi7u.onrender.com';

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
      setWorkouts(Array.isArray(workoutsData) ? workoutsData : (workoutsData.workouts || []));
      setStats(statsData);
      
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
      setWorkouts([]);
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
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Profile not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/60 backdrop-blur-xl border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => navigate(-1)}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-white">{profile.name}</h1>
              <p className="text-purple-300 text-sm">{profile.role}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Profile Card */}
        <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar */}
              <div className="flex justify-center md:justify-start">
                <Avatar className="w-32 h-32 border-4 border-purple-500">
                  <AvatarImage src={profile.profilePic} />
                  <AvatarFallback className="bg-purple-600 text-white text-4xl">
                    {profile.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left space-y-4">
                <div>
                  <h2 className="text-3xl font-bold text-white">{profile.name}</h2>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-2">
                    <Badge variant={profile.role === 'COACH' ? 'default' : 'secondary'} className="bg-purple-600">
                      {profile.role}
                    </Badge>
                    {profile.district && (
                      <span className="text-purple-300 flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {profile.district}
                      </span>
                    )}
                  </div>
                </div>

                {/* Skills */}
                {profile.skills && profile.skills.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-purple-300">
                      {profile.role === 'COACH' ? 'Specializations' : 'Top Skills'}
                    </h3>
                    <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                      {profile.skills.map((skill: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="bg-purple-600/20 border-purple-500/50">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Button */}
                {!isOwnProfile && (
                  <div className="flex gap-3 justify-center md:justify-start">
                    {connectionStatus === 'none' && (
                      <Button
                        onClick={sendConnectionRequest}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Connect
                      </Button>
                    )}
                    {connectionStatus === 'pending' && (
                      <Button variant="outline" disabled className="border-purple-500/50">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Request Pending
                      </Button>
                    )}
                    {connectionStatus === 'connected' && (
                      <Button variant="outline" disabled className="border-green-500/50 text-green-400">
                        <UserCheck className="w-4 h-4 mr-2" />
                        Connected
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 md:grid-cols-1 gap-3">
                <StatCard icon={Activity} label="Workouts" value={stats?.totalWorkouts || 0} />
                <StatCard icon={Trophy} label="Best" value={stats?.bestScore || 0} />
                <StatCard icon={TrendingUp} label="Accuracy" value={`${stats?.avgAccuracy || 0}%`} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Tabs */}
        <Tabs defaultValue="workouts" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-black/40 border border-purple-500/20">
            <TabsTrigger value="workouts" className="data-[state=active]:bg-purple-600">
              <Video className="w-4 h-4 mr-2" />
              Workouts
            </TabsTrigger>
            <TabsTrigger value="stats" className="data-[state=active]:bg-purple-600">
              <TrendingUp className="w-4 h-4 mr-2" />
              Statistics
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
                <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20 p-12 text-center">
                  <Activity className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">No Workouts Yet</h3>
                  <p className="text-purple-300">
                    This {profile.role.toLowerCase()} hasn't recorded any workouts yet.
                  </p>
                </Card>
              )
            ) : (
              <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20 p-12 text-center">
                <UserPlus className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">
                  {connectionStatus === 'pending' ? 'Connection Request Pending' : 'Connect to View Workouts'}
                </h3>
                <p className="text-purple-300 mb-6">
                  {connectionStatus === 'pending' 
                    ? 'Your connection request is pending approval'
                    : `Send a connection request to view this ${profile.role.toLowerCase()}'s workout history`
                  }
                </p>
                {connectionStatus === 'none' && (
                  <Button onClick={sendConnectionRequest} className="bg-purple-600 hover:bg-purple-700">
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
              <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-purple-600/20 flex items-center justify-center">
                      <Activity className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm text-purple-300">Total Workouts</p>
                      <p className="text-2xl font-bold text-white">{stats?.totalWorkouts || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-yellow-600/20 flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-sm text-purple-300">Best Score</p>
                      <p className="text-2xl font-bold text-white">{stats?.bestScore || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-600/20 flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-purple-300">Avg Accuracy</p>
                      <p className="text-2xl font-bold text-white">{stats?.avgAccuracy || 0}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-600/20 flex items-center justify-center">
                      <Award className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-purple-300">Form Quality</p>
                      <p className="text-2xl font-bold text-white">{stats?.formQuality || 0}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav />
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: any) {
  return (
    <div className="bg-purple-900/20 rounded-lg p-3 text-center">
      <Icon className="w-5 h-5 text-purple-400 mx-auto mb-1" />
      <p className="text-xs text-purple-300">{label}</p>
      <p className="text-lg font-bold text-white">{value}</p>
    </div>
  );
}

function WorkoutCard({ workout }: any) {
  return (
    <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20 hover:border-purple-400 transition-all">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Workout Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-bold text-white line-clamp-1">{workout.activityName}</h3>
              <p className="text-xs text-purple-300 flex items-center gap-1 mt-1">
                <Calendar className="w-3 h-3" />
                {new Date(workout.timestamp).toLocaleDateString()}
              </p>
            </div>
            <Badge className="bg-purple-600">{workout.totalReps || 0} reps</Badge>
          </div>

          {/* Workout Stats */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-purple-900/30 rounded p-2">
              <p className="text-xs text-purple-300">Accuracy</p>
              <p className="text-sm font-bold text-white">{workout.accuracy || 0}%</p>
            </div>
            <div className="bg-purple-900/30 rounded p-2">
              <p className="text-xs text-purple-300">Form</p>
              <p className="text-sm font-bold text-white">{workout.formScore || 'N/A'}</p>
            </div>
          </div>

          {/* Workout Image */}
          {workout.screenshots && workout.screenshots[0] && (
            <div className="relative aspect-video rounded-lg overflow-hidden bg-purple-900/20">
              <img 
                src={workout.screenshots[0]} 
                alt="Workout" 
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

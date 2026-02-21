import { useState, useEffect } from 'react';
import { Users, UserPlus, UserCheck, Search, MapPin, ArrowLeft, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import BottomNav from '@/components/navigation/BottomNav';
import { MOCK_ATHLETES, MOCK_COACHES } from '@/services/mockSAIData';

interface ConnectionRequest {
  _id: string;
  fromUserId: string;
  fromUserName: string;
  fromUserRole: string;
  fromUserProfilePic?: string;
  fromUserRegion?: string;
  fromUserSkills?: string[];
  toUserId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export default function ConnectionsPageNew() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('discover');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'ATHLETE' | 'COACH'>('all');

  const [discoverUsers, setDiscoverUsers] = useState<any[]>([]);
  const [myConnections, setMyConnections] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<ConnectionRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<ConnectionRequest[]>([]);
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

  const getSessionUserRole = () => {
    try {
      const sessionStr = localStorage.getItem('auth_session');
      if (sessionStr) {
        const session = JSON.parse(sessionStr);
        return session.role || '';
      }
    } catch (error) {
      console.error('Error reading session:', error);
    }
    return '';
  };

  const currentUserId = getSessionUserId();
  const userRole = getSessionUserRole();
  const isAthlete = userRole === 'ATHLETE';
  const API_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || 'https://rec-backend-yi7u.onrender.com';

  useEffect(() => {
    if (currentUserId) {
      loadData();
    }
  }, [activeTab, currentUserId]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'discover') {
        await loadDiscoverUsers();
      } else if (activeTab === 'connections') {
        await loadMyConnections();
      } else if (activeTab === 'requests') {
        await loadRequests();
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setLoading(false);
  };

  const loadDiscoverUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/api/users/discover?userId=${currentUserId}`);
      if (response.ok) {
        const data = await response.json();
        
        // Convert mock data to user format
        const mockUsers = [
          ...MOCK_ATHLETES.map(athlete => ({
            userId: athlete.id,
            name: athlete.name,
            profilePic: athlete.profilePic,
            role: 'ATHLETE',
            district: 'Demo User',
            skills: ['Push-ups', 'Squats', 'Sit-ups'],
            workoutCount: athlete.workoutCount,
            isMock: true
          })),
          ...MOCK_COACHES.map(coach => ({
            userId: coach.id,
            name: coach.name,
            profilePic: coach.profilePic,
            role: 'COACH',
            district: 'Demo Coach',
            skills: ['Strength Training', 'Endurance', 'Flexibility'],
            workoutCount: coach.totalWorkouts,
            isMock: true
          }))
        ];
        
        // Filter out duplicates by name
        const realUserNames = new Set(data.map((u: any) => u.name.toLowerCase()));
        const uniqueMockUsers = mockUsers.filter(m => !realUserNames.has(m.name.toLowerCase()));
        
        // Combine real and mock users
        const combinedUsers = [...data, ...uniqueMockUsers];
        
        // Load workout count for real users only
        const usersWithWorkouts = await Promise.all(
          combinedUsers.map(async (user: any) => {
            if (user.isMock) {
              return user; // Mock users already have workout count
            }
            try {
              const workoutsRes = await fetch(`${API_URL}/api/sessions/user/${user.userId}`);
              if (workoutsRes.ok) {
                const workoutsData = await workoutsRes.json();
                const workouts = Array.isArray(workoutsData) ? workoutsData : (workoutsData.workouts || []);
                return { ...user, workoutCount: workouts.length, recentWorkouts: workouts.slice(0, 2) };
              }
            } catch (err) {
              console.error('Error loading workouts for', user.userId);
            }
            return { ...user, workoutCount: 0, recentWorkouts: [] };
          })
        );
        
        setDiscoverUsers(usersWithWorkouts || []);
      }
    } catch (error) {
      console.error('Error loading discover users:', error);
    }
  };

  const loadMyConnections = async () => {
    try {
      console.log('📊 Loading connections for user:', currentUserId);
      const response = await fetch(`${API_URL}/api/connections/${currentUserId}`);
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Found connections:', data.length);
        
        // Load workouts for each connection
        const connectionsWithWorkouts = await Promise.all(
          data.map(async (connection: any) => {
            try {
              console.log('🏋️ Loading workouts for:', connection.name);
              const workoutsRes = await fetch(`${API_URL}/api/sessions/user/${connection.userId}`);
              if (workoutsRes.ok) {
                const workoutsData = await workoutsRes.json();
                const workouts = Array.isArray(workoutsData) ? workoutsData : (workoutsData.workouts || []);
                console.log(`✅ Found ${workouts.length} workouts for ${connection.name}`);
                console.log('📋 First workout:', workouts[0]);
                return { ...connection, workouts }; // Get ALL workouts
              }
            } catch (err) {
              console.error('Error loading workouts for', connection.userId);
            }
            return { ...connection, workouts: [] };
          })
        );
        setMyConnections(connectionsWithWorkouts);
      }
    } catch (error) {
      console.error('Error loading connections:', error);
    }
  };

  const loadRequests = async () => {
    try {
      const [pendingRes, sentRes] = await Promise.all([
        fetch(`${API_URL}/api/connections/requests/pending/${currentUserId}`),
        fetch(`${API_URL}/api/connections/requests/sent/${currentUserId}`)
      ]);

      const pending = pendingRes.ok ? await pendingRes.json() : [];
      const sent = sentRes.ok ? await sentRes.json() : [];

      setPendingRequests(pending || []);
      setSentRequests(sent || []);
    } catch (error) {
      console.error('Error loading requests:', error);
    }
  };

  const handleRequest = async (requestId: string, action: 'accept' | 'reject') => {
    try {
      await fetch(`${API_URL}/api/connections/request/${requestId}/${action}`, {
        method: 'POST'
      });
      loadRequests();
    } catch (error) {
      console.error('Error handling request:', error);
    }
  };

  const filteredUsers = discoverUsers.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.district?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/60 backdrop-blur-xl border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => navigate('/')}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Users className="w-6 h-6" />
                Connections
              </h1>
              <p className="text-purple-300 text-sm">Connect with athletes and coaches</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-black/40 backdrop-blur-xl border border-purple-500/20 mb-6">
            <TabsTrigger value="discover" className="data-[state=active]:bg-purple-600">
              Discover
            </TabsTrigger>
            <TabsTrigger value="connections" className="data-[state=active]:bg-purple-600">
              My Network
              {myConnections.length > 0 && (
                <Badge className="ml-2 bg-purple-700">{myConnections.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="requests" className="data-[state=active]:bg-purple-600">
              Requests
              {pendingRequests.length > 0 && (
                <Badge className="ml-2 bg-red-600">{pendingRequests.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Discover Tab */}
          <TabsContent value="discover" className="space-y-4">
            {/* Search and Filter */}
            <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
                    <Input
                      placeholder="Search by name or region..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-black/20 border-purple-500/20 text-white"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={filterRole === 'all' ? 'default' : 'outline'}
                      onClick={() => setFilterRole('all')}
                      size="sm"
                    >
                      All
                    </Button>
                    <Button
                      variant={filterRole === 'ATHLETE' ? 'default' : 'outline'}
                      onClick={() => setFilterRole('ATHLETE')}
                      size="sm"
                    >
                      Athletes
                    </Button>
                    <Button
                      variant={filterRole === 'COACH' ? 'default' : 'outline'}
                      onClick={() => setFilterRole('COACH')}
                      size="sm"
                    >
                      Coaches
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* User Grid */}
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-purple-300 mt-4">Loading...</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {filteredUsers.map(user => (
                  <UserCard
                    key={user._id || user.userId}
                    user={user}
                    onViewProfile={() => navigate(`/profile/${user.userId}`)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* My Connections Tab */}
          <TabsContent value="connections" className="space-y-4">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : myConnections.length === 0 ? (
              <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
                <CardContent className="p-12 text-center">
                  <Users className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">No connections yet</h3>
                  <p className="text-purple-300 mb-6">Start connecting with athletes and coaches</p>
                  <Button onClick={() => setActiveTab('discover')} className="bg-purple-600">
                    Discover People
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {myConnections.map(connection => (
                  <ConnectionCard
                    key={connection._id || connection.userId}
                    connection={connection}
                    onViewProfile={() => navigate(`/profile/${connection.userId}`)}
                    navigate={navigate}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Requests Tab */}
          <TabsContent value="requests" className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-4">Pending Requests</h3>
              {pendingRequests.length === 0 ? (
                <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
                  <CardContent className="p-8 text-center">
                    <p className="text-purple-300">No pending requests</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {pendingRequests.map(request => (
                    <RequestCard
                      key={request._id}
                      request={request}
                      onAccept={() => handleRequest(request._id, 'accept')}
                      onReject={() => handleRequest(request._id, 'reject')}
                    />
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="text-xl font-bold text-white mb-4">Sent Requests</h3>
              {sentRequests.length === 0 ? (
                <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
                  <CardContent className="p-8 text-center">
                    <p className="text-purple-300">No sent requests</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {sentRequests.map(request => (
                    <RequestCard key={request._id} request={request} isSent />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Show BottomNav only for athletes */}
      {isAthlete && <BottomNav />}
    </div>
  );
}

function UserCard({ user, onViewProfile }: any) {
  return (
    <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20 hover:border-purple-400 transition-all hover:scale-[1.02]">
      <CardContent className="p-3">
        <div className="flex flex-col items-center text-center space-y-2">
          <Avatar className="w-16 h-16 border-2 border-purple-500">
            <AvatarImage src={user.profilePic} />
            <AvatarFallback className="bg-purple-600 text-white text-lg">
              {user.name?.charAt(0) || '?'}
            </AvatarFallback>
          </Avatar>

          <div className="space-y-1 w-full">
            <h3 className="text-sm font-bold text-white line-clamp-1">{user.name}</h3>
            <Badge variant={user.role === 'COACH' ? 'default' : 'secondary'} className="bg-purple-600 text-xs">
              {user.role}
            </Badge>
            {user.isMock && (
              <Badge variant="outline" className="text-xs border-yellow-500/50 text-yellow-300">
                Demo
              </Badge>
            )}
          </div>

          {user.district && (
            <p className="text-xs text-purple-300 flex items-center gap-1 line-clamp-1">
              <MapPin className="w-3 h-3" />
              {user.district}
            </p>
          )}

          {/* Show workout stats */}
          {user.workoutCount !== undefined && user.workoutCount > 0 && (
            <div className="w-full bg-purple-900/30 rounded p-2 space-y-1">
              <p className="text-xs text-purple-300 flex items-center justify-center gap-1">
                <Activity className="w-3 h-3" />
                {user.workoutCount} workout{user.workoutCount !== 1 ? 's' : ''}
              </p>
              {user.role === 'ATHLETE' && (
                <p className="text-xs text-green-300">
                  Active athlete
                </p>
              )}
            </div>
          )}

          <Button
            onClick={onViewProfile}
            variant="outline"
            className="w-full border-purple-500/50 hover:bg-purple-600/20 text-xs h-8"
            disabled={user.isMock}
          >
            {user.isMock ? 'Demo User' : 'View Profile'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ConnectionCard({ connection, onViewProfile, navigate }: any) {
  return (
    <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
      <CardContent className="p-4">
        <div className="flex gap-4">
          <Avatar className="w-16 h-16 border-2 border-purple-500">
            <AvatarImage src={connection.profilePic} />
            <AvatarFallback className="bg-purple-600 text-white">
              {connection.name?.charAt(0) || '?'}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <h3 className="font-bold text-white">{connection.name}</h3>
                <Badge variant="secondary" className="text-xs bg-purple-600/50 mt-1">
                  {connection.role}
                </Badge>
              </div>
              <Button onClick={onViewProfile} size="sm" variant="outline">
                View
              </Button>
            </div>

            {connection.workouts && connection.workouts.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="text-xs text-purple-300 font-semibold">Activity Stats</p>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-purple-900/30 rounded p-2 text-center">
                    <Activity className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                    <p className="text-xs text-white font-semibold">{connection.workouts.length}</p>
                    <p className="text-xs text-purple-300">Workouts</p>
                  </div>
                  <div className="bg-green-900/30 rounded p-2 text-center">
                    <p className="text-xs text-white font-semibold">
                      {Math.round(connection.workouts.reduce((sum: number, w: any) => sum + (w.accuracy || 0), 0) / connection.workouts.length) || 0}%
                    </p>
                    <p className="text-xs text-green-300">Avg Accuracy</p>
                  </div>
                  <div className="bg-blue-900/30 rounded p-2 text-center">
                    <p className="text-xs text-white font-semibold">
                      {Math.max(...connection.workouts.map((w: any) => w.totalReps || 0), 0)}
                    </p>
                    <p className="text-xs text-blue-300">Best Reps</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RequestCard({ request, isSent, onAccept, onReject }: any) {
  return (
    <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <Avatar className="w-12 h-12 border-2 border-purple-500">
            <AvatarImage src={request.fromUserProfilePic} />
            <AvatarFallback className="bg-purple-600 text-white">
              {request.fromUserName?.charAt(0) || '?'}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <h4 className="font-bold text-white">{request.fromUserName}</h4>
            <Badge variant="secondary" className="text-xs bg-purple-600/50 mt-1">
              {request.fromUserRole}
            </Badge>
          </div>

          {!isSent && (
            <div className="flex gap-2">
              <Button onClick={onAccept} size="sm" className="bg-green-600 hover:bg-green-700">
                <UserCheck className="w-4 h-4" />
              </Button>
              <Button onClick={onReject} size="sm" variant="outline" className="border-red-500 text-red-500">
                <UserPlus className="w-4 h-4 rotate-45" />
              </Button>
            </div>
          )}
          {isSent && (
            <Badge variant="outline" className="border-purple-500/50 text-purple-300">
              Pending
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

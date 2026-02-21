import { useState, useEffect } from 'react';
import { Users, UserPlus, UserCheck, Search, MapPin, ArrowLeft, Activity, TrendingUp, Award } from 'lucide-react';
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
        const realUsers = await response.json();
        
        // Convert mock data to user format
        const mockUsers = [
          ...MOCK_ATHLETES.map(athlete => ({
            userId: athlete.id,
            name: athlete.name,
            profilePic: athlete.profilePic,
            role: 'ATHLETE',
            district: 'Demo User',
            skills: ['Push-ups', 'Squats', 'Sit-ups'],
            isMock: true,
            stats: {
              workouts: athlete.workoutCount,
              avgAccuracy: Math.floor(Math.random() * 20) + 80,
              bestReps: Math.floor(Math.random() * 30) + 20
            }
          })),
          ...MOCK_COACHES.map(coach => ({
            userId: coach.id,
            name: coach.name,
            profilePic: coach.profilePic,
            role: 'COACH',
            district: 'Demo Coach',
            skills: ['Strength Training', 'Endurance', 'Flexibility'],
            isMock: true,
            stats: {
              athletes: coach.athleteCount,
              workouts: coach.totalWorkouts,
              experience: '5+ years'
            }
          }))
        ];
        
        // Filter out duplicates by name
        const realUserNames = new Set(realUsers.map((u: any) => u.name.toLowerCase()));
        const uniqueMockUsers = mockUsers.filter(m => !realUserNames.has(m.name.toLowerCase()));
        
        // Add stats to real users
        const realUsersWithStats = await Promise.all(
          realUsers.map(async (user: any) => {
            try {
              const workoutsRes = await fetch(`${API_URL}/api/sessions/user/${user.userId}`);
              if (workoutsRes.ok) {
                const workoutsData = await workoutsRes.json();
                const workouts = Array.isArray(workoutsData) ? workoutsData : (workoutsData.workouts || []);
                
                const avgAccuracy = workouts.length > 0
                  ? Math.round(workouts.reduce((sum: number, w: any) => sum + (w.accuracy || 0), 0) / workouts.length)
                  : 0;
                
                const bestReps = workouts.length > 0
                  ? Math.max(...workouts.map((w: any) => w.totalReps || 0))
                  : 0;
                
                return {
                  ...user,
                  stats: {
                    workouts: workouts.length,
                    avgAccuracy,
                    bestReps
                  }
                };
              }
            } catch (err) {
              console.error('Error loading workouts for', user.userId);
            }
            return { ...user, stats: { workouts: 0, avgAccuracy: 0, bestReps: 0 } };
          })
        );
        
        setDiscoverUsers([...realUsersWithStats, ...uniqueMockUsers]);
      }
    } catch (error) {
      console.error('Error loading discover users:', error);
    }
  };

  const loadMyConnections = async () => {
    try {
      const response = await fetch(`${API_URL}/api/connections/${currentUserId}`);
      if (response.ok) {
        const data = await response.json();
        
        // Load stats for each connection
        const connectionsWithStats = await Promise.all(
          data.map(async (connection: any) => {
            try {
              const workoutsRes = await fetch(`${API_URL}/api/sessions/user/${connection.userId}`);
              if (workoutsRes.ok) {
                const workoutsData = await workoutsRes.json();
                const workouts = Array.isArray(workoutsData) ? workoutsData : (workoutsData.workouts || []);
                
                const avgAccuracy = workouts.length > 0
                  ? Math.round(workouts.reduce((sum: number, w: any) => sum + (w.accuracy || 0), 0) / workouts.length)
                  : 0;
                
                const bestReps = workouts.length > 0
                  ? Math.max(...workouts.map((w: any) => w.totalReps || 0))
                  : 0;
                
                return {
                  ...connection,
                  stats: {
                    workouts: workouts.length,
                    avgAccuracy,
                    bestReps
                  }
                };
              }
            } catch (err) {
              console.error('Error loading stats for', connection.userId);
            }
            return { ...connection, stats: { workouts: 0, avgAccuracy: 0, bestReps: 0 } };
          })
        );
        setMyConnections(connectionsWithStats);
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
      if (action === 'accept') {
        loadMyConnections();
      }
    } catch (error) {
      console.error('Error handling request:', error);
    }
  };

  const sendConnectionRequest = async (toUserId: string) => {
    try {
      await fetch(`${API_URL}/api/connections/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromUserId: currentUserId, toUserId })
      });
      loadData();
    } catch (error) {
      console.error('Error sending request:', error);
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
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => navigate('/')}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10 p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-white">Network</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-black/40 backdrop-blur-xl border border-purple-500/20 mb-4">
            <TabsTrigger value="discover" className="data-[state=active]:bg-purple-600 text-xs sm:text-sm">
              Discover
            </TabsTrigger>
            <TabsTrigger value="connections" className="data-[state=active]:bg-purple-600 text-xs sm:text-sm">
              Connected
              {myConnections.length > 0 && (
                <Badge className="ml-1 bg-purple-700 text-xs">{myConnections.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="requests" className="data-[state=active]:bg-purple-600 text-xs sm:text-sm">
              Requests
              {pendingRequests.length > 0 && (
                <Badge className="ml-1 bg-red-600 text-xs">{pendingRequests.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Discover Tab */}
          <TabsContent value="discover" className="space-y-3">
            {/* Search and Filter */}
            <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
              <CardContent className="p-3">
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
                    <Input
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-black/20 border-purple-500/20 text-white h-9"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={filterRole === 'all' ? 'default' : 'outline'}
                      onClick={() => setFilterRole('all')}
                      size="sm"
                      className="flex-1 h-8 text-xs"
                    >
                      All
                    </Button>
                    <Button
                      variant={filterRole === 'ATHLETE' ? 'default' : 'outline'}
                      onClick={() => setFilterRole('ATHLETE')}
                      size="sm"
                      className="flex-1 h-8 text-xs"
                    >
                      Athletes
                    </Button>
                    <Button
                      variant={filterRole === 'COACH' ? 'default' : 'outline'}
                      onClick={() => setFilterRole('COACH')}
                      size="sm"
                      className="flex-1 h-8 text-xs"
                    >
                      Coaches
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* User List */}
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredUsers.map(user => (
                  <UserCard
                    key={user.userId}
                    user={user}
                    onViewProfile={() => !user.isMock && navigate(`/profile/${user.userId}`)}
                    onConnect={() => !user.isMock && sendConnectionRequest(user.userId)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* My Connections Tab */}
          <TabsContent value="connections" className="space-y-2">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : myConnections.length === 0 ? (
              <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
                <CardContent className="p-8 text-center">
                  <Users className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-white mb-2">No connections yet</h3>
                  <p className="text-purple-300 text-sm mb-4">Start connecting with others</p>
                  <Button onClick={() => setActiveTab('discover')} className="bg-purple-600" size="sm">
                    Discover People
                  </Button>
                </CardContent>
              </Card>
            ) : (
              myConnections.map(connection => (
                <ConnectionCard
                  key={connection.userId}
                  connection={connection}
                  onViewProfile={() => navigate(`/profile/${connection.userId}`)}
                />
              ))
            )}
          </TabsContent>

          {/* Requests Tab */}
          <TabsContent value="requests" className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white mb-2">Pending Requests</h3>
              {pendingRequests.length === 0 ? (
                <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
                  <CardContent className="p-6 text-center">
                    <p className="text-purple-300 text-sm">No pending requests</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-2">
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
              <h3 className="text-sm font-bold text-white mb-2">Sent Requests</h3>
              {sentRequests.length === 0 ? (
                <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
                  <CardContent className="p-6 text-center">
                    <p className="text-purple-300 text-sm">No sent requests</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-2">
                  {sentRequests.map(request => (
                    <RequestCard key={request._id} request={request} isSent />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {isAthlete && <BottomNav />}
    </div>
  );
}

function UserCard({ user, onViewProfile, onConnect }: any) {
  return (
    <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20 hover:border-purple-400 transition-all">
      <CardContent className="p-3">
        <div className="flex gap-3">
          <Avatar className="w-12 h-12 border-2 border-purple-500 flex-shrink-0">
            <AvatarImage src={user.profilePic} />
            <AvatarFallback className="bg-purple-600 text-white">
              {user.name?.charAt(0) || '?'}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-white truncate">{user.name}</h3>
                <div className="flex items-center gap-1 flex-wrap">
                  <Badge variant={user.role === 'COACH' ? 'default' : 'secondary'} className="bg-purple-600 text-xs h-5">
                    {user.role}
                  </Badge>
                  {user.isMock && (
                    <Badge variant="outline" className="text-xs border-yellow-500/50 text-yellow-300 h-5">
                      Demo
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {user.district && (
              <p className="text-xs text-purple-300 flex items-center gap-1 mb-2">
                <MapPin className="w-3 h-3" />
                {user.district}
              </p>
            )}

            {/* Stats */}
            {user.stats && (
              <div className="grid grid-cols-3 gap-1 mb-2">
                <div className="bg-purple-900/30 rounded p-1.5 text-center">
                  <Activity className="w-3 h-3 text-purple-400 mx-auto mb-0.5" />
                  <p className="text-xs text-white font-semibold">{user.stats.workouts || 0}</p>
                  <p className="text-xs text-purple-300">Workouts</p>
                </div>
                {user.role === 'ATHLETE' && (
                  <>
                    <div className="bg-green-900/30 rounded p-1.5 text-center">
                      <TrendingUp className="w-3 h-3 text-green-400 mx-auto mb-0.5" />
                      <p className="text-xs text-white font-semibold">{user.stats.avgAccuracy || 0}%</p>
                      <p className="text-xs text-green-300">Accuracy</p>
                    </div>
                    <div className="bg-blue-900/30 rounded p-1.5 text-center">
                      <Award className="w-3 h-3 text-blue-400 mx-auto mb-0.5" />
                      <p className="text-xs text-white font-semibold">{user.stats.bestReps || 0}</p>
                      <p className="text-xs text-blue-300">Best</p>
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={onViewProfile}
                variant="outline"
                size="sm"
                className="flex-1 border-purple-500/50 hover:bg-purple-600/20 h-7 text-xs"
                disabled={user.isMock}
              >
                {user.isMock ? 'Demo' : 'View'}
              </Button>
              {!user.isMock && (
                <Button
                  onClick={onConnect}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700 h-7 text-xs px-3"
                >
                  <UserPlus className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ConnectionCard({ connection, onViewProfile }: any) {
  return (
    <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
      <CardContent className="p-3">
        <div className="flex gap-3">
          <Avatar className="w-12 h-12 border-2 border-purple-500 flex-shrink-0">
            <AvatarImage src={connection.profilePic} />
            <AvatarFallback className="bg-purple-600 text-white">
              {connection.name?.charAt(0) || '?'}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-white truncate">{connection.name}</h3>
                <Badge variant="secondary" className="text-xs bg-purple-600/50 h-5">
                  {connection.role}
                </Badge>
              </div>
              <Button onClick={onViewProfile} size="sm" variant="outline" className="h-7 text-xs">
                View
              </Button>
            </div>

            {connection.stats && (
              <div className="grid grid-cols-3 gap-1 mt-2">
                <div className="bg-purple-900/30 rounded p-1.5 text-center">
                  <p className="text-xs text-white font-semibold">{connection.stats.workouts || 0}</p>
                  <p className="text-xs text-purple-300">Workouts</p>
                </div>
                <div className="bg-green-900/30 rounded p-1.5 text-center">
                  <p className="text-xs text-white font-semibold">{connection.stats.avgAccuracy || 0}%</p>
                  <p className="text-xs text-green-300">Accuracy</p>
                </div>
                <div className="bg-blue-900/30 rounded p-1.5 text-center">
                  <p className="text-xs text-white font-semibold">{connection.stats.bestReps || 0}</p>
                  <p className="text-xs text-blue-300">Best</p>
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
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10 border-2 border-purple-500 flex-shrink-0">
            <AvatarImage src={request.fromUserProfilePic} />
            <AvatarFallback className="bg-purple-600 text-white text-sm">
              {request.fromUserName?.charAt(0) || '?'}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-white truncate">{request.fromUserName}</h4>
            <Badge variant="secondary" className="text-xs bg-purple-600/50 h-5">
              {request.fromUserRole}
            </Badge>
          </div>

          {!isSent && (
            <div className="flex gap-1">
              <Button onClick={onAccept} size="sm" className="bg-green-600 hover:bg-green-700 h-7 px-2">
                <UserCheck className="w-3 h-3" />
              </Button>
              <Button onClick={onReject} size="sm" variant="outline" className="border-red-500 text-red-500 h-7 px-2">
                <UserPlus className="w-3 h-3 rotate-45" />
              </Button>
            </div>
          )}
          {isSent && (
            <Badge variant="outline" className="border-purple-500/50 text-purple-300 text-xs">
              Pending
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

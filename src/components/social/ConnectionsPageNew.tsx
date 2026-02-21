import { useState } from 'react';
import { Users, UserPlus, UserCheck, Search, MapPin, ArrowLeft, Activity, TrendingUp, Award, Star, Calendar, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import BottomNav from '@/components/navigation/BottomNav';

// Comprehensive mock data with detailed profiles
const MOCK_USERS = [
  // Athletes
  {
    id: 'athlete-1',
    name: 'Aryan Sharma',
    profilePic: '/ppl/aryan.webp',
    role: 'ATHLETE',
    district: 'Mumbai, Maharashtra',
    bio: 'Passionate about fitness and pushing limits',
    skills: ['Push-ups', 'Squats', 'Running'],
    stats: { workouts: 45, avgAccuracy: 92, bestReps: 50, streak: 12 },
    achievements: ['30-Day Streak', 'Top Performer', '100 Workouts'],
    joined: '2 months ago',
    isConnected: false
  },
  {
    id: 'athlete-2',
    name: 'Dev Patel',
    profilePic: '/ppl/dev%20patel.jpg',
    role: 'ATHLETE',
    district: 'Delhi, NCR',
    bio: 'Training for national championships',
    skills: ['Pull-ups', 'Sit-ups', 'Sprints'],
    stats: { workouts: 38, avgAccuracy: 88, bestReps: 45, streak: 8 },
    achievements: ['Consistency King', 'Form Master'],
    joined: '3 months ago',
    isConnected: false
  },
  {
    id: 'athlete-3',
    name: 'Umesh Yadav',
    profilePic: '/ppl/umesh%20yadav.jpeg',
    role: 'ATHLETE',
    district: 'Bangalore, Karnataka',
    bio: 'Strength and endurance enthusiast',
    skills: ['Deadlifts', 'Bench Press', 'Cardio'],
    stats: { workouts: 52, avgAccuracy: 95, bestReps: 60, streak: 15 },
    achievements: ['Elite Athlete', 'Perfect Form', '50+ Workouts'],
    joined: '4 months ago',
    isConnected: true
  },
  {
    id: 'athlete-4',
    name: 'Dharani Kumar',
    profilePic: '/ppl/dharani.webp',
    role: 'ATHLETE',
    district: 'Chennai, Tamil Nadu',
    bio: 'Focused on functional fitness',
    skills: ['Burpees', 'Mountain Climbers', 'Planks'],
    stats: { workouts: 41, avgAccuracy: 90, bestReps: 48, streak: 10 },
    achievements: ['Rising Star', 'Dedication Award'],
    joined: '2 months ago',
    isConnected: false
  },
  {
    id: 'athlete-5',
    name: 'Pranshika Singh',
    profilePic: '/ppl/pranshika.webp',
    role: 'ATHLETE',
    district: 'Pune, Maharashtra',
    bio: 'Yoga and strength training advocate',
    skills: ['Yoga', 'Core Strength', 'Flexibility'],
    stats: { workouts: 36, avgAccuracy: 87, bestReps: 42, streak: 7 },
    achievements: ['Flexibility Master', 'Balanced Athlete'],
    joined: '1 month ago',
    isConnected: false
  },
  // Coaches
  {
    id: 'coach-1',
    name: 'Rahul Dravid',
    profilePic: '/ppl/dravid.avif',
    role: 'COACH',
    district: 'Bangalore, Karnataka',
    bio: 'Former cricketer, now fitness coach',
    skills: ['Strength Training', 'Endurance', 'Mental Toughness'],
    stats: { athletes: 15, totalWorkouts: 450, experience: '8 years', rating: 4.9 },
    achievements: ['Master Coach', 'Top Rated', '500+ Sessions'],
    joined: '2 years ago',
    isConnected: false
  },
  {
    id: 'coach-2',
    name: 'Manish Paul',
    profilePic: '/ppl/manish%20paul.jpg',
    role: 'COACH',
    district: 'Mumbai, Maharashtra',
    bio: 'Celebrity fitness trainer',
    skills: ['HIIT', 'Weight Loss', 'Nutrition'],
    stats: { athletes: 12, totalWorkouts: 380, experience: '6 years', rating: 4.8 },
    achievements: ['Celebrity Trainer', 'Transformation Expert'],
    joined: '1 year ago',
    isConnected: true
  },
  {
    id: 'coach-3',
    name: 'Sundar Kumar',
    profilePic: '/ppl/sundar%20kumar.jpg',
    role: 'COACH',
    district: 'Hyderabad, Telangana',
    bio: 'Specialized in sports performance',
    skills: ['Athletic Performance', 'Speed Training', 'Agility'],
    stats: { athletes: 18, totalWorkouts: 520, experience: '10 years', rating: 5.0 },
    achievements: ['Elite Coach', 'Performance Specialist', 'Top Rated'],
    joined: '3 years ago',
    isConnected: false
  }
];

export default function ConnectionsPageNew() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('discover');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'ATHLETE' | 'COACH'>('all');

  const getSessionUserRole = () => {
    try {
      const sessionStr = localStorage.getItem('auth_session');
      if (sessionStr) {
        const session = JSON.parse(sessionStr);
        return session.role || 'ATHLETE';
      }
    } catch (error) {
      return 'ATHLETE';
    }
  };

  const isAthlete = getSessionUserRole() === 'ATHLETE';

  const filteredUsers = MOCK_USERS.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.bio.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const connectedUsers = MOCK_USERS.filter(u => u.isConnected);
  const discoverUsers = filteredUsers.filter(u => !u.isConnected);

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
              <p className="text-xs text-purple-300">Connect with athletes & coaches</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-black/40 backdrop-blur-xl border border-purple-500/20 mb-4">
            <TabsTrigger value="discover" className="data-[state=active]:bg-purple-600 text-sm">
              Discover
              <Badge className="ml-2 bg-purple-700">{discoverUsers.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="connections" className="data-[state=active]:bg-purple-600 text-sm">
              Connected
              <Badge className="ml-2 bg-green-700">{connectedUsers.length}</Badge>
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
                      placeholder="Search by name, location, or bio..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-black/20 border-purple-500/20 text-white h-9 text-sm"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={filterRole === 'all' ? 'default' : 'outline'}
                      onClick={() => setFilterRole('all')}
                      size="sm"
                      className="flex-1 h-8 text-xs"
                    >
                      All ({MOCK_USERS.length})
                    </Button>
                    <Button
                      variant={filterRole === 'ATHLETE' ? 'default' : 'outline'}
                      onClick={() => setFilterRole('ATHLETE')}
                      size="sm"
                      className="flex-1 h-8 text-xs"
                    >
                      Athletes ({MOCK_USERS.filter(u => u.role === 'ATHLETE').length})
                    </Button>
                    <Button
                      variant={filterRole === 'COACH' ? 'default' : 'outline'}
                      onClick={() => setFilterRole('COACH')}
                      size="sm"
                      className="flex-1 h-8 text-xs"
                    >
                      Coaches ({MOCK_USERS.filter(u => u.role === 'COACH').length})
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* User List */}
            <div className="space-y-2">
              {discoverUsers.map(user => (
                <UserCard key={user.id} user={user} />
              ))}
            </div>
          </TabsContent>

          {/* Connections Tab */}
          <TabsContent value="connections" className="space-y-2">
            {connectedUsers.length === 0 ? (
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
              connectedUsers.map(user => (
                <UserCard key={user.id} user={user} isConnected />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      {isAthlete && <BottomNav />}
    </div>
  );
}


function UserCard({ user, isConnected = false }: any) {
  const [expanded, setExpanded] = useState(false);
  const [connected, setConnected] = useState(isConnected);

  return (
    <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20 hover:border-purple-400 transition-all">
      <CardContent className="p-4">
        <div className="flex gap-3">
          {/* Avatar */}
          <Avatar className="w-16 h-16 border-2 border-purple-500 flex-shrink-0">
            <AvatarImage src={user.profilePic} />
            <AvatarFallback className="bg-purple-600 text-white text-lg">
              {user.name.charAt(0)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-white truncate">{user.name}</h3>
                <div className="flex items-center gap-1 flex-wrap mt-1">
                  <Badge 
                    variant={user.role === 'COACH' ? 'default' : 'secondary'} 
                    className={`text-xs h-5 ${user.role === 'COACH' ? 'bg-orange-600' : 'bg-blue-600'}`}
                  >
                    {user.role}
                  </Badge>
                  {user.achievements.slice(0, 1).map((achievement, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs border-yellow-500/50 text-yellow-300 h-5">
                      <Star className="w-3 h-3 mr-1" />
                      {achievement}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Location & Bio */}
            <div className="space-y-1 mb-3">
              <p className="text-xs text-purple-300 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {user.district}
              </p>
              <p className="text-xs text-gray-300 line-clamp-2">{user.bio}</p>
            </div>

            {/* Stats Grid */}
            {user.role === 'ATHLETE' ? (
              <div className="grid grid-cols-4 gap-1 mb-3">
                <div className="bg-purple-900/30 rounded p-1.5 text-center">
                  <Activity className="w-3 h-3 text-purple-400 mx-auto mb-0.5" />
                  <p className="text-xs text-white font-semibold">{user.stats.workouts}</p>
                  <p className="text-xs text-purple-300">Workouts</p>
                </div>
                <div className="bg-green-900/30 rounded p-1.5 text-center">
                  <TrendingUp className="w-3 h-3 text-green-400 mx-auto mb-0.5" />
                  <p className="text-xs text-white font-semibold">{user.stats.avgAccuracy}%</p>
                  <p className="text-xs text-green-300">Accuracy</p>
                </div>
                <div className="bg-blue-900/30 rounded p-1.5 text-center">
                  <Award className="w-3 h-3 text-blue-400 mx-auto mb-0.5" />
                  <p className="text-xs text-white font-semibold">{user.stats.bestReps}</p>
                  <p className="text-xs text-blue-300">Best</p>
                </div>
                <div className="bg-orange-900/30 rounded p-1.5 text-center">
                  <Trophy className="w-3 h-3 text-orange-400 mx-auto mb-0.5" />
                  <p className="text-xs text-white font-semibold">{user.stats.streak}</p>
                  <p className="text-xs text-orange-300">Streak</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1 mb-3">
                <div className="bg-purple-900/30 rounded p-1.5 text-center">
                  <Users className="w-3 h-3 text-purple-400 mx-auto mb-0.5" />
                  <p className="text-xs text-white font-semibold">{user.stats.athletes}</p>
                  <p className="text-xs text-purple-300">Athletes</p>
                </div>
                <div className="bg-green-900/30 rounded p-1.5 text-center">
                  <Activity className="w-3 h-3 text-green-400 mx-auto mb-0.5" />
                  <p className="text-xs text-white font-semibold">{user.stats.totalWorkouts}</p>
                  <p className="text-xs text-green-300">Sessions</p>
                </div>
                <div className="bg-yellow-900/30 rounded p-1.5 text-center">
                  <Star className="w-3 h-3 text-yellow-400 mx-auto mb-0.5" />
                  <p className="text-xs text-white font-semibold">{user.stats.rating}</p>
                  <p className="text-xs text-yellow-300">Rating</p>
                </div>
              </div>
            )}

            {/* Expanded Details */}
            {expanded && (
              <div className="space-y-2 mb-3 p-2 bg-purple-900/20 rounded">
                <div>
                  <p className="text-xs text-purple-300 font-semibold mb-1">Skills</p>
                  <div className="flex flex-wrap gap-1">
                    {user.skills.map((skill: string, idx: number) => (
                      <Badge key={idx} variant="outline" className="text-xs border-purple-500/50">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-purple-300 font-semibold mb-1">Achievements</p>
                  <div className="flex flex-wrap gap-1">
                    {user.achievements.map((achievement: string, idx: number) => (
                      <Badge key={idx} variant="outline" className="text-xs border-yellow-500/50 text-yellow-300">
                        <Trophy className="w-3 h-3 mr-1" />
                        {achievement}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Calendar className="w-3 h-3" />
                  Joined {user.joined}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                onClick={() => setExpanded(!expanded)}
                variant="outline"
                size="sm"
                className="flex-1 border-purple-500/50 hover:bg-purple-600/20 h-8 text-xs"
              >
                {expanded ? 'Show Less' : 'View Details'}
              </Button>
              {!connected ? (
                <Button
                  onClick={() => setConnected(true)}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700 h-8 text-xs px-4"
                >
                  <UserPlus className="w-3 h-3 mr-1" />
                  Connect
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  className="border-green-500/50 text-green-400 h-8 text-xs px-4"
                  disabled
                >
                  <UserCheck className="w-3 h-3 mr-1" />
                  Connected
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

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
    <div className="min-h-screen bg-gradient-to-br from-purple-200 via-purple-100 to-white pb-20">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-purple-600 to-purple-500 border-b border-purple-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => navigate(-1)}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-purple-700 p-2 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white">Professional Network</h1>
              <p className="text-sm text-purple-100">Connect with athletes & coaches</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-purple-100 border-2 border-purple-300 mb-6 p-1 rounded-xl shadow-md">
            <TabsTrigger 
              value="discover" 
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-purple-800 rounded-lg font-semibold"
            >
              Discover
              <Badge className="ml-2 bg-purple-300 text-purple-900 border-0">{discoverUsers.length}</Badge>
            </TabsTrigger>
            <TabsTrigger 
              value="connections" 
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-purple-800 rounded-lg font-semibold"
            >
              Connected
              <Badge className="ml-2 bg-green-200 text-green-800 border-0">{connectedUsers.length}</Badge>
            </TabsTrigger>
          </TabsList>

          {/* Discover Tab */}
          <TabsContent value="discover" className="space-y-4">
            {/* Search and Filter */}
            <Card className="bg-white border-2 border-purple-300 shadow-md">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-600" />
                    <Input
                      placeholder="Search by name, location, or bio..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-purple-50 border-2 border-purple-300 text-gray-900 h-11 rounded-lg focus:ring-2 focus:ring-purple-600"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={filterRole === 'all' ? 'default' : 'outline'}
                      onClick={() => setFilterRole('all')}
                      size="sm"
                      className={`flex-1 h-9 rounded-lg font-medium ${
                        filterRole === 'all' 
                          ? 'bg-purple-600 text-white hover:bg-purple-700' 
                          : 'border-purple-300 text-purple-700 hover:bg-purple-100'
                      }`}
                    >
                      All ({MOCK_USERS.length})
                    </Button>
                    <Button
                      variant={filterRole === 'ATHLETE' ? 'default' : 'outline'}
                      onClick={() => setFilterRole('ATHLETE')}
                      size="sm"
                      className={`flex-1 h-9 rounded-lg font-medium ${
                        filterRole === 'ATHLETE' 
                          ? 'bg-purple-600 text-white hover:bg-purple-700' 
                          : 'border-purple-300 text-purple-700 hover:bg-purple-100'
                      }`}
                    >
                      Athletes ({MOCK_USERS.filter(u => u.role === 'ATHLETE').length})
                    </Button>
                    <Button
                      variant={filterRole === 'COACH' ? 'default' : 'outline'}
                      onClick={() => setFilterRole('COACH')}
                      size="sm"
                      className={`flex-1 h-9 rounded-lg font-medium ${
                        filterRole === 'COACH' 
                          ? 'bg-purple-600 text-white hover:bg-purple-700' 
                          : 'border-purple-300 text-purple-700 hover:bg-purple-100'
                      }`}
                    >
                      Coaches ({MOCK_USERS.filter(u => u.role === 'COACH').length})
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* User List */}
            <div className="space-y-3">
              {discoverUsers.map(user => (
                <UserCard key={user.id} user={user} />
              ))}
            </div>
          </TabsContent>

          {/* Connections Tab */}
          <TabsContent value="connections" className="space-y-3">
            {connectedUsers.length === 0 ? (
              <Card className="bg-white border-2 border-purple-300 shadow-md">
                <CardContent className="p-12 text-center">
                  <Users className="w-16 h-16 text-purple-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-purple-900 mb-2">No connections yet</h3>
                  <p className="text-purple-700 mb-6">Start connecting with professionals</p>
                  <Button 
                    onClick={() => setActiveTab('discover')} 
                    className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg px-6 font-semibold shadow-md"
                  >
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
    <Card className="bg-white border-2 border-purple-200 hover:border-purple-400 hover:shadow-lg transition-all">
      <CardContent className="p-5">
        <div className="flex gap-4">
          {/* Avatar */}
          <Avatar className="w-20 h-20 border-4 border-purple-300 flex-shrink-0 shadow-md">
            <AvatarImage src={user.profilePic} alt={user.name} />
            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-purple-700 text-white text-xl font-bold">
              {user.name.charAt(0)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-900 truncate">{user.name}</h3>
                <div className="flex items-center gap-2 flex-wrap mt-1">
                  <Badge 
                    className={`text-xs font-semibold border-2 ${
                      user.role === 'COACH' 
                        ? 'bg-purple-100 text-purple-800 border-purple-300' 
                        : 'bg-blue-100 text-blue-800 border-blue-300'
                    }`}
                  >
                    {user.role}
                  </Badge>
                  {user.achievements.slice(0, 1).map((achievement, idx) => (
                    <Badge key={idx} className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                      <Star className="w-3 h-3 mr-1 fill-yellow-400" />
                      {achievement}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Location & Bio */}
            <div className="space-y-1.5 mb-3">
              <p className="text-sm text-gray-600 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-purple-500" />
                {user.district}
              </p>
              <p className="text-sm text-gray-700 line-clamp-2">{user.bio}</p>
            </div>

            {/* Stats Grid */}
            {user.role === 'ATHLETE' ? (
              <div className="grid grid-cols-4 gap-2 mb-4">
                <div className="bg-purple-100 border-2 border-purple-300 rounded-lg p-2 text-center">
                  <Activity className="w-4 h-4 text-purple-700 mx-auto mb-1" />
                  <p className="text-sm text-purple-900 font-bold">{user.stats.workouts}</p>
                  <p className="text-xs text-gray-700">Workouts</p>
                </div>
                <div className="bg-green-100 border-2 border-green-300 rounded-lg p-2 text-center">
                  <TrendingUp className="w-4 h-4 text-green-700 mx-auto mb-1" />
                  <p className="text-sm text-green-900 font-bold">{user.stats.avgAccuracy}%</p>
                  <p className="text-xs text-gray-700">Accuracy</p>
                </div>
                <div className="bg-blue-100 border-2 border-blue-300 rounded-lg p-2 text-center">
                  <Award className="w-4 h-4 text-blue-700 mx-auto mb-1" />
                  <p className="text-sm text-blue-900 font-bold">{user.stats.bestReps}</p>
                  <p className="text-xs text-gray-700">Best</p>
                </div>
                <div className="bg-orange-100 border-2 border-orange-300 rounded-lg p-2 text-center">
                  <Trophy className="w-4 h-4 text-orange-700 mx-auto mb-1" />
                  <p className="text-sm text-orange-900 font-bold">{user.stats.streak}</p>
                  <p className="text-xs text-gray-700">Streak</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="bg-purple-100 border-2 border-purple-300 rounded-lg p-2 text-center">
                  <Users className="w-4 h-4 text-purple-700 mx-auto mb-1" />
                  <p className="text-sm text-purple-900 font-bold">{user.stats.athletes}</p>
                  <p className="text-xs text-gray-700">Athletes</p>
                </div>
                <div className="bg-green-100 border-2 border-green-300 rounded-lg p-2 text-center">
                  <Activity className="w-4 h-4 text-green-700 mx-auto mb-1" />
                  <p className="text-sm text-green-900 font-bold">{user.stats.totalWorkouts}</p>
                  <p className="text-xs text-gray-700">Sessions</p>
                </div>
                <div className="bg-yellow-100 border-2 border-yellow-300 rounded-lg p-2 text-center">
                  <Star className="w-4 h-4 text-yellow-700 mx-auto mb-1 fill-yellow-400" />
                  <p className="text-sm text-yellow-900 font-bold">{user.stats.rating}</p>
                  <p className="text-xs text-gray-700">Rating</p>
                </div>
              </div>
            )}

            {/* Expanded Details */}
            {expanded && (
              <div className="space-y-3 mb-4 p-3 bg-purple-100 border-2 border-purple-300 rounded-lg">
                <div>
                  <p className="text-sm text-purple-900 font-bold mb-2">Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {user.skills.map((skill: string, idx: number) => (
                      <Badge key={idx} className="text-xs bg-white border-2 border-purple-300 text-purple-800 font-medium">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-purple-900 font-bold mb-2">Achievements</p>
                  <div className="flex flex-wrap gap-1.5">
                    {user.achievements.map((achievement: string, idx: number) => (
                      <Badge key={idx} className="text-xs bg-yellow-100 border-2 border-yellow-300 text-yellow-800 font-medium">
                        <Trophy className="w-3 h-3 mr-1" />
                        {achievement}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-purple-800 font-medium">
                  <Calendar className="w-4 h-4" />
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
                className="flex-1 border-2 border-purple-300 text-purple-800 hover:bg-purple-100 h-10 rounded-lg font-semibold"
              >
                {expanded ? 'Show Less' : 'View Details'}
              </Button>
              {!connected ? (
                <Button
                  onClick={() => setConnected(true)}
                  size="sm"
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white h-10 px-6 rounded-lg font-semibold shadow-md"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Connect
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  className="border-2 border-green-300 bg-green-100 text-green-800 h-10 px-6 rounded-lg font-semibold"
                  disabled
                >
                  <UserCheck className="w-4 h-4 mr-2" />
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

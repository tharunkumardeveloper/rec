import { useState } from 'react';
import { Users, Search, MapPin, Activity, TrendingUp, Award, Trophy, Star, Calendar, UserPlus, UserCheck, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Mock data with detailed profiles
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
  const [activeTab, setActiveTab] = useState<'discover' | 'connections'>('discover');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'ATHLETE' | 'COACH'>('all');

  const filteredUsers = MOCK_USERS.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.bio.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const connectedUsers = filteredUsers.filter(u => u.isConnected);
  const discoverUsers = filteredUsers.filter(u => !u.isConnected);

  const displayUsers = activeTab === 'connections' ? connectedUsers : discoverUsers;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Simple Header - matching HomeScreen style */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                // Always navigate to home page
                window.location.href = '/';
              }}
              className="p-2 hover:bg-muted rounded-lg transition-colors -ml-2"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-bold">Connections</h1>
              <p className="text-xs text-muted-foreground">Connect with athletes & coaches</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tabs - Simple buttons like HomeScreen */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === 'discover' ? 'default' : 'outline'}
            onClick={() => setActiveTab('discover')}
            className="flex-1"
          >
            Discover
            <Badge className="ml-2" variant="secondary">{discoverUsers.length}</Badge>
          </Button>
          <Button
            variant={activeTab === 'connections' ? 'default' : 'outline'}
            onClick={() => setActiveTab('connections')}
            className="flex-1"
          >
            Connected
            <Badge className="ml-2" variant="secondary">{connectedUsers.length}</Badge>
          </Button>
        </div>

        {/* Search and Filter */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by name, location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterRole === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilterRole('all')}
                  size="sm"
                  className="flex-1"
                >
                  All
                </Button>
                <Button
                  variant={filterRole === 'ATHLETE' ? 'default' : 'outline'}
                  onClick={() => setFilterRole('ATHLETE')}
                  size="sm"
                  className="flex-1"
                >
                  Athletes
                </Button>
                <Button
                  variant={filterRole === 'COACH' ? 'default' : 'outline'}
                  onClick={() => setFilterRole('COACH')}
                  size="sm"
                  className="flex-1"
                >
                  Coaches
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User List */}
        {displayUsers.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {activeTab === 'connections' ? 'No connections yet' : 'No users found'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {activeTab === 'connections' 
                  ? 'Start connecting with professionals' 
                  : 'Try adjusting your search or filters'}
              </p>
              {activeTab === 'connections' && (
                <Button onClick={() => setActiveTab('discover')}>
                  Discover People
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {displayUsers.map((user) => (
              <UserCard key={user.id} user={user} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function UserCard({ user }: { user: typeof MOCK_USERS[0] }) {
  const [expanded, setExpanded] = useState(false);
  const [connected, setConnected] = useState(user.isConnected);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Avatar */}
          <Avatar className="w-16 h-16 flex-shrink-0">
            <AvatarImage src={user.profilePic} alt={user.name} className="object-cover" />
            <AvatarFallback className="bg-primary text-primary-foreground text-lg font-bold">
              {user.name.charAt(0)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-base truncate">{user.name}</h3>
                <div className="flex items-center gap-2 flex-wrap mt-1">
                  <Badge variant={user.role === 'COACH' ? 'default' : 'secondary'} className="text-xs">
                    {user.role}
                  </Badge>
                  {user.achievements.slice(0, 1).map((achievement, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                      {achievement}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Location & Bio */}
            <div className="space-y-1 mb-3">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {user.district}
              </p>
              <p className="text-sm line-clamp-2">{user.bio}</p>
            </div>

            {/* Stats Grid */}
            {user.role === 'ATHLETE' ? (
              <div className="grid grid-cols-4 gap-1.5 mb-3">
                <div className="bg-muted rounded-lg p-1.5 text-center">
                  <Activity className="w-3.5 h-3.5 text-primary mx-auto mb-0.5" />
                  <p className="text-xs font-bold">{user.stats.workouts}</p>
                  <p className="text-[10px] text-muted-foreground leading-tight">Work</p>
                </div>
                <div className="bg-muted rounded-lg p-1.5 text-center">
                  <TrendingUp className="w-3.5 h-3.5 text-success mx-auto mb-0.5" />
                  <p className="text-xs font-bold">{user.stats.avgAccuracy}%</p>
                  <p className="text-[10px] text-muted-foreground leading-tight">Acc</p>
                </div>
                <div className="bg-muted rounded-lg p-1.5 text-center">
                  <Award className="w-3.5 h-3.5 text-info mx-auto mb-0.5" />
                  <p className="text-xs font-bold">{user.stats.bestReps}</p>
                  <p className="text-[10px] text-muted-foreground leading-tight">Best</p>
                </div>
                <div className="bg-muted rounded-lg p-1.5 text-center">
                  <Trophy className="w-3.5 h-3.5 text-warning mx-auto mb-0.5" />
                  <p className="text-xs font-bold">{user.stats.streak}</p>
                  <p className="text-[10px] text-muted-foreground leading-tight">Streak</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1.5 mb-3">
                <div className="bg-muted rounded-lg p-1.5 text-center">
                  <Users className="w-3.5 h-3.5 text-primary mx-auto mb-0.5" />
                  <p className="text-xs font-bold">{user.stats.athletes}</p>
                  <p className="text-[10px] text-muted-foreground leading-tight">Athletes</p>
                </div>
                <div className="bg-muted rounded-lg p-1.5 text-center">
                  <Activity className="w-3.5 h-3.5 text-success mx-auto mb-0.5" />
                  <p className="text-xs font-bold">{user.stats.totalWorkouts}</p>
                  <p className="text-[10px] text-muted-foreground leading-tight">Sessions</p>
                </div>
                <div className="bg-muted rounded-lg p-1.5 text-center">
                  <Star className="w-3.5 h-3.5 text-warning mx-auto mb-0.5 fill-yellow-400" />
                  <p className="text-xs font-bold">{user.stats.rating}</p>
                  <p className="text-[10px] text-muted-foreground leading-tight">Rating</p>
                </div>
              </div>
            )}

            {/* Expanded Details */}
            {expanded && (
              <div className="space-y-3 mb-3 p-3 bg-muted rounded-lg">
                <div>
                  <p className="text-sm font-semibold mb-2">Skills</p>
                  <div className="flex flex-wrap gap-1">
                    {user.skills.map((skill, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold mb-2">Achievements</p>
                  <div className="flex flex-wrap gap-1">
                    {user.achievements.map((achievement, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        <Trophy className="w-3 h-3 mr-1" />
                        {achievement}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
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
                className="flex-1"
              >
                {expanded ? 'Show Less' : 'View Details'}
              </Button>
              {!connected ? (
                <Button
                  onClick={() => setConnected(true)}
                  size="sm"
                  className="px-4"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Connect
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  className="px-4"
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

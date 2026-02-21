import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, Star, Trophy, ArrowRight, CheckCircle, UserPlus, Search, MapPin } from 'lucide-react';
import { FEATURED_CHALLENGES, getChallengeProgress, type Challenge } from '@/utils/challengeSystem';
import ChallengeDetailModal from '@/components/challenges/ChallengeDetailModal';

interface DiscoverTabProps {
  onStartWorkout?: (exerciseName: string) => void;
  onViewProfile?: (userId: string) => void;
}

const DiscoverTab = ({ onStartWorkout, onViewProfile }: DiscoverTabProps) => {
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [activeTab, setActiveTab] = useState('challenges');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'ATHLETE' | 'COACH'>('all');
  const [discoverUsers, setDiscoverUsers] = useState<any[]>([]);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const currentUserId = localStorage.getItem('userId') || '';

  useEffect(() => {
    if (activeTab === 'people') {
      loadDiscoverUsers();
      loadPendingRequestsCount();
    }
  }, [activeTab]);

  const loadDiscoverUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/users/discover?userId=${currentUserId}`);
      const data = await response.json();
      setDiscoverUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
    }
    setLoading(false);
  };

  const loadPendingRequestsCount = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/connections/requests/pending/${currentUserId}`);
      const data = await response.json();
      setPendingRequestsCount(data.length);
    } catch (error) {
      console.error('Error loading pending requests:', error);
    }
  };

  const sendConnectionRequest = async (toUserId: string) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/connections/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromUserId: currentUserId, toUserId })
      });
      loadDiscoverUsers();
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
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Discover</h1>
        <p className="text-muted-foreground text-base">Find challenges, connect with athletes and coaches</p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
          <TabsTrigger value="challenges">
            <Trophy className="w-4 h-4 mr-2" />
            Challenges
          </TabsTrigger>
          <TabsTrigger value="people">
            <Users className="w-4 h-4 mr-2" />
            People
            {pendingRequestsCount > 0 && (
              <Badge className="ml-2 bg-red-600">{pendingRequestsCount}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Challenges Tab */}
        <TabsContent value="challenges" className="mt-6">

      {/* Featured Challenges - Optimized Grid for PC */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5">
        {FEATURED_CHALLENGES.map((challenge) => {
          const progress = getChallengeProgress(challenge.id);

          return (
            <Card
              key={challenge.id}
              className={`card-elevated cursor-pointer transition-all hover:scale-[1.02] hover:shadow-xl ${
                progress.completed ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-300 dark:border-green-700' : ''
              }`}
              onClick={() => setSelectedChallenge(challenge)}
            >
              <CardContent className="p-5">
                <div className="flex gap-4">
                  {/* Challenge Icon - Larger on PC */}
                  <div className="shrink-0">
                    <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-4xl shadow-sm">
                      {challenge.image}
                    </div>
                  </div>

                  {/* Challenge Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg line-clamp-1">{challenge.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{challenge.description}</p>
                      </div>
                      {progress.completed && (
                        <CheckCircle className="w-6 h-6 text-green-500 shrink-0" />
                      )}
                    </div>

                    {/* Stats - Enhanced spacing */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3 mt-3">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4" />
                        <span>{challenge.participants.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span>{challenge.rating}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Trophy className="w-4 h-4 text-yellow-500" />
                        <span>{challenge.rewards.coins}</span>
                      </div>
                    </div>

                    {/* Progress */}
                    {!progress.completed && progress.workoutsCompleted > 0 && (
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="text-muted-foreground font-medium">Progress</span>
                          <span className="font-semibold">{progress.workoutsCompleted}/{progress.totalWorkouts} workouts</span>
                        </div>
                        <Progress value={progress.progress} className="h-2" />
                      </div>
                    )}

                    {/* Action Button */}
                    <Button
                      size="default"
                      variant={progress.completed ? 'outline' : 'default'}
                      className="w-full mt-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedChallenge(challenge);
                      }}
                    >
                      {progress.completed ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Completed
                        </>
                      ) : progress.workoutsCompleted > 0 ? (
                        <>
                          Continue Challenge
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      ) : (
                        <>
                          Start Challenge
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
        </TabsContent>

        {/* People Tab */}
        <TabsContent value="people" className="mt-6 space-y-4">
          {/* Search and Filter */}
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or region..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={filterRole === 'all' ? 'default' : 'outline'}
                    onClick={() => setFilterRole('all')}
                    className="flex-1 md:flex-none"
                  >
                    All
                  </Button>
                  <Button
                    variant={filterRole === 'ATHLETE' ? 'default' : 'outline'}
                    onClick={() => setFilterRole('ATHLETE')}
                    className="flex-1 md:flex-none"
                  >
                    Athletes
                  </Button>
                  <Button
                    variant={filterRole === 'COACH' ? 'default' : 'outline'}
                    onClick={() => setFilterRole('COACH')}
                    className="flex-1 md:flex-none"
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
              <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-muted-foreground mt-4">Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardContent className="p-12 text-center">
                <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">No users found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filters</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUsers.map(user => (
                <Card key={user._id} className="card-elevated hover:scale-[1.02] transition-all">
                  <CardContent className="p-4">
                    <div className="flex flex-col items-center text-center space-y-3">
                      <Avatar className="w-20 h-20 border-2 border-primary">
                        <AvatarImage src={user.profilePic} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                          {user.name?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="space-y-1 w-full">
                        <h3 className="text-lg font-bold line-clamp-1">{user.name}</h3>
                        <Badge variant={user.role === 'COACH' ? 'default' : 'secondary'}>
                          {user.role}
                        </Badge>
                      </div>

                      {user.district && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {user.district}
                        </p>
                      )}

                      {user.skills && user.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 justify-center w-full">
                          {user.skills.slice(0, 3).map((skill: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="flex gap-2 w-full pt-2">
                        <Button
                          onClick={() => onViewProfile?.(user.userId)}
                          variant="outline"
                          className="flex-1"
                          size="sm"
                        >
                          View Profile
                        </Button>
                        <Button
                          onClick={() => sendConnectionRequest(user.userId)}
                          className="flex-1"
                          size="sm"
                        >
                          <UserPlus className="w-4 h-4 mr-1" />
                          Connect
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Challenge Detail Modal */}
      {selectedChallenge && (
        <ChallengeDetailModal
          challenge={selectedChallenge}
          onClose={() => setSelectedChallenge(null)}
          onStartWorkout={onStartWorkout}
        />
      )}
    </div>
  );
};

export default DiscoverTab;

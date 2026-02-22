import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Medal, Trophy, Award, TrendingUp, Filter } from 'lucide-react';
import workoutStorageService, { StoredWorkout } from '@/services/workoutStorageService';
import { getMockAthletesWithRealData } from '@/services/mockSAIData';

interface LeaderboardEntry {
  rank: number;
  name: string;
  profilePic?: string;
  totalWorkouts: number;
  totalReps: number;
  avgAccuracy: number;
  bestWorkout: string;
  coach: string;
  state: string;
}

interface SAINationalLeaderboardProps {
  onBack: () => void;
}

const SAINationalLeaderboard = ({ onBack }: SAINationalLeaderboardProps) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [filterCategory, setFilterCategory] = useState<'all' | 'pushups' | 'situps' | 'squats'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, [filterCategory]);

  const loadLeaderboard = async () => {
    setIsLoading(true);
    try {
      const realAthletes = await workoutStorageService.getAllAthletes();
      const allAthletes = getMockAthletesWithRealData(realAthletes);

      const leaderboardData: LeaderboardEntry[] = await Promise.all(
        allAthletes.map(async (athlete) => {
          const workouts = await workoutStorageService.getWorkoutsByAthlete(athlete.name);
          
          const filteredWorkouts = filterCategory === 'all' 
            ? workouts 
            : workouts.filter(w => w.activityName.toLowerCase().includes(filterCategory));

          const totalReps = filteredWorkouts.reduce((sum, w) => sum + w.totalReps, 0);
          const avgAccuracy = filteredWorkouts.length > 0
            ? Math.round(filteredWorkouts.reduce((sum, w) => sum + w.accuracy, 0) / filteredWorkouts.length)
            : 0;

          const bestWorkout = filteredWorkouts.length > 0
            ? filteredWorkouts.reduce((best, w) => w.accuracy > best.accuracy ? w : best).activityName
            : 'N/A';

          return {
            rank: 0,
            name: athlete.name,
            profilePic: athlete.profilePic,
            totalWorkouts: filteredWorkouts.length,
            totalReps,
            avgAccuracy,
            bestWorkout,
            coach: athlete.coachName || 'Unassigned',
            state: athlete.state || 'India'
          };
        })
      );

      // Sort by average accuracy and total reps
      leaderboardData.sort((a, b) => {
        if (b.avgAccuracy !== a.avgAccuracy) {
          return b.avgAccuracy - a.avgAccuracy;
        }
        return b.totalReps - a.totalReps;
      });

      // Assign ranks
      leaderboardData.forEach((entry, index) => {
        entry.rank = index + 1;
      });

      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getMedalIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Award className="w-6 h-6 text-orange-600" />;
    return <span className="text-lg font-bold text-gray-600">#{rank}</span>;
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
    if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-500';
    if (rank === 3) return 'bg-gradient-to-r from-orange-400 to-orange-600';
    return 'bg-gray-200';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h2 className="text-2xl font-bold">National Leaderboard</h2>
            <p className="text-sm text-muted-foreground">Top performing athletes across India</p>
          </div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        {[
          { id: 'all', label: 'All Workouts' },
          { id: 'pushups', label: 'Push-ups' },
          { id: 'situps', label: 'Sit-ups' },
          { id: 'squats', label: 'Squats' }
        ].map((filter) => (
          <Button
            key={filter.id}
            size="sm"
            variant={filterCategory === filter.id ? 'default' : 'outline'}
            onClick={() => setFilterCategory(filter.id as any)}
            className="whitespace-nowrap"
          >
            {filter.label}
          </Button>
        ))}
      </div>

      {/* Top 3 Podium */}
      {leaderboard.length >= 3 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {/* 2nd Place */}
          <Card className="border-2 border-gray-400 bg-gradient-to-br from-gray-50 to-gray-100">
            <CardContent className="p-4 text-center">
              <div className="flex justify-center mb-2">
                <Medal className="w-12 h-12 text-gray-400" />
              </div>
              <div className="w-16 h-16 mx-auto rounded-full overflow-hidden border-4 border-gray-400 mb-2">
                {leaderboard[1].profilePic ? (
                  <img src={leaderboard[1].profilePic} alt={leaderboard[1].name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-400 text-white flex items-center justify-center font-bold">
                    {leaderboard[1].name.split(' ').map(n => n[0]).join('')}
                  </div>
                )}
              </div>
              <h3 className="font-bold text-sm truncate">{leaderboard[1].name}</h3>
              <p className="text-2xl font-bold text-gray-600">{leaderboard[1].avgAccuracy}%</p>
              <p className="text-xs text-muted-foreground">{leaderboard[1].totalReps} reps</p>
            </CardContent>
          </Card>

          {/* 1st Place */}
          <Card className="border-2 border-yellow-500 bg-gradient-to-br from-yellow-50 to-yellow-100 transform scale-105">
            <CardContent className="p-4 text-center">
              <div className="flex justify-center mb-2">
                <Trophy className="w-14 h-14 text-yellow-500" />
              </div>
              <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border-4 border-yellow-500 mb-2">
                {leaderboard[0].profilePic ? (
                  <img src={leaderboard[0].profilePic} alt={leaderboard[0].name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-yellow-500 text-white flex items-center justify-center font-bold text-lg">
                    {leaderboard[0].name.split(' ').map(n => n[0]).join('')}
                  </div>
                )}
              </div>
              <h3 className="font-bold truncate">{leaderboard[0].name}</h3>
              <p className="text-3xl font-bold text-yellow-600">{leaderboard[0].avgAccuracy}%</p>
              <p className="text-xs text-muted-foreground">{leaderboard[0].totalReps} reps</p>
            </CardContent>
          </Card>

          {/* 3rd Place */}
          <Card className="border-2 border-orange-600 bg-gradient-to-br from-orange-50 to-orange-100">
            <CardContent className="p-4 text-center">
              <div className="flex justify-center mb-2">
                <Award className="w-12 h-12 text-orange-600" />
              </div>
              <div className="w-16 h-16 mx-auto rounded-full overflow-hidden border-4 border-orange-600 mb-2">
                {leaderboard[2].profilePic ? (
                  <img src={leaderboard[2].profilePic} alt={leaderboard[2].name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-orange-600 text-white flex items-center justify-center font-bold">
                    {leaderboard[2].name.split(' ').map(n => n[0]).join('')}
                  </div>
                )}
              </div>
              <h3 className="font-bold text-sm truncate">{leaderboard[2].name}</h3>
              <p className="text-2xl font-bold text-orange-600">{leaderboard[2].avgAccuracy}%</p>
              <p className="text-xs text-muted-foreground">{leaderboard[2].totalReps} reps</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Full Leaderboard */}
      <div className="space-y-2">
        {leaderboard.map((entry) => (
          <Card 
            key={entry.name} 
            className={`${getRankBadgeColor(entry.rank)} ${entry.rank <= 3 ? 'border-2' : ''}`}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 flex-shrink-0">
                  {getMedalIcon(entry.rank)}
                </div>

                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white flex-shrink-0">
                  {entry.profilePic ? (
                    <img src={entry.profilePic} alt={entry.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary to-primary/70 text-white flex items-center justify-center font-bold">
                      {entry.name.split(' ').map(n => n[0]).join('')}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-bold truncate">{entry.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{entry.state}</span>
                    <span>•</span>
                    <span>Coach: {entry.coach}</span>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <div className="text-2xl font-bold text-primary">{entry.avgAccuracy}%</div>
                  <div className="text-xs text-muted-foreground">{entry.totalReps} reps</div>
                  <div className="text-xs text-muted-foreground">{entry.totalWorkouts} workouts</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {leaderboard.length === 0 && !isLoading && (
        <Card>
          <CardContent className="p-12 text-center">
            <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
            <p className="text-sm text-muted-foreground">
              Leaderboard will populate as athletes complete workouts
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SAINationalLeaderboard;

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Star, TrendingUp, Eye, Award, Target, Zap, Users } from 'lucide-react';
import workoutStorageService, { StoredWorkout } from '@/services/workoutStorageService';
import { getMockAthletesWithRealData } from '@/services/mockSAIData';

interface ScoutingProfile {
  name: string;
  profilePic?: string;
  age: number;
  state: string;
  coach: string;
  totalWorkouts: number;
  avgAccuracy: number;
  totalReps: number;
  consistency: number; // Workouts per week
  improvement: number; // % improvement over time
  potentialRating: number; // 1-10
  scoutingNotes: string;
  specialization: string[];
}

interface SAIScoutingDashboardProps {
  onBack: () => void;
}

const SAIScoutingDashboard = ({ onBack }: SAIScoutingDashboardProps) => {
  const [scoutingProfiles, setScoutingProfiles] = useState<ScoutingProfile[]>([]);
  const [selectedAthlete, setSelectedAthlete] = useState<ScoutingProfile | null>(null);
  const [filterRating, setFilterRating] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadScoutingData();
  }, []);

  const loadScoutingData = async () => {
    setIsLoading(true);
    try {
      const realAthletes = await workoutStorageService.getAllAthletes();
      const allAthletes = getMockAthletesWithRealData(realAthletes);

      const profiles: ScoutingProfile[] = await Promise.all(
        allAthletes.map(async (athlete) => {
          const workouts = await workoutStorageService.getWorkoutsByAthlete(athlete.name);
          
          const totalReps = workouts.reduce((sum, w) => sum + w.totalReps, 0);
          const avgAccuracy = workouts.length > 0
            ? Math.round(workouts.reduce((sum, w) => sum + w.accuracy, 0) / workouts.length)
            : 0;

          // Calculate consistency (workouts per week)
          const firstWorkout = workouts.length > 0 ? new Date(workouts[workouts.length - 1].timestamp) : new Date();
          const lastWorkout = workouts.length > 0 ? new Date(workouts[0].timestamp) : new Date();
          const weeksDiff = Math.max(1, (lastWorkout.getTime() - firstWorkout.getTime()) / (7 * 24 * 60 * 60 * 1000));
          const consistency = Math.round(workouts.length / weeksDiff * 10) / 10;

          // Calculate improvement (comparing first half vs second half of workouts)
          const midPoint = Math.floor(workouts.length / 2);
          const firstHalfAvg = workouts.slice(midPoint).reduce((sum, w) => sum + w.accuracy, 0) / Math.max(1, workouts.length - midPoint);
          const secondHalfAvg = workouts.slice(0, midPoint).reduce((sum, w) => sum + w.accuracy, 0) / Math.max(1, midPoint);
          const improvement = Math.round(((secondHalfAvg - firstHalfAvg) / Math.max(1, firstHalfAvg)) * 100);

          // Calculate potential rating (1-10)
          const potentialRating = Math.min(10, Math.round(
            (avgAccuracy / 10) * 0.4 +
            (consistency) * 0.3 +
            (Math.max(0, improvement) / 10) * 0.3
          ));

          // Identify specializations
          const workoutTypes = workouts.reduce((acc, w) => {
            acc[w.activityName] = (acc[w.activityName] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
          const specialization = Object.entries(workoutTypes)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 2)
            .map(([name]) => name);

          return {
            name: athlete.name,
            profilePic: athlete.profilePic,
            age: athlete.age || 18,
            state: athlete.state || 'India',
            coach: athlete.coachName || 'Unassigned',
            totalWorkouts: workouts.length,
            avgAccuracy,
            totalReps,
            consistency,
            improvement,
            potentialRating,
            scoutingNotes: potentialRating >= 7 
              ? 'High potential athlete. Recommended for advanced training program.'
              : potentialRating >= 5
              ? 'Promising athlete with room for improvement. Monitor progress closely.'
              : 'Developing athlete. Needs consistent training and guidance.',
            specialization
          };
        })
      );

      // Sort by potential rating
      profiles.sort((a, b) => b.potentialRating - a.potentialRating);
      setScoutingProfiles(profiles);
    } catch (error) {
      console.error('Error loading scouting data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPotentialColor = (rating: number) => {
    if (rating >= 8) return 'text-green-600 bg-green-50 border-green-500';
    if (rating >= 6) return 'text-blue-600 bg-blue-50 border-blue-500';
    if (rating >= 4) return 'text-yellow-600 bg-yellow-50 border-yellow-500';
    return 'text-gray-600 bg-gray-50 border-gray-500';
  };

  const getPotentialLabel = (rating: number) => {
    if (rating >= 8) return 'Elite Prospect';
    if (rating >= 6) return 'High Potential';
    if (rating >= 4) return 'Developing';
    return 'Needs Attention';
  };

  const filteredProfiles = filterRating > 0 
    ? scoutingProfiles.filter(p => p.potentialRating >= filterRating)
    : scoutingProfiles;

  const stats = {
    totalAthletes: scoutingProfiles.length,
    eliteProspects: scoutingProfiles.filter(p => p.potentialRating >= 8).length,
    highPotential: scoutingProfiles.filter(p => p.potentialRating >= 6 && p.potentialRating < 8).length,
    avgPotential: scoutingProfiles.length > 0
      ? (scoutingProfiles.reduce((sum, p) => sum + p.potentialRating, 0) / scoutingProfiles.length).toFixed(1)
      : '0'
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
            <h2 className="text-2xl font-bold">SAI Talent Scouting</h2>
            <p className="text-sm text-muted-foreground">Identify and nurture promising athletes</p>
          </div>
        </div>
      </div>

      {/* Scouting Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-2 border-purple-500 bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-4 text-center">
            <Users className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-600">{stats.totalAthletes}</div>
            <p className="text-sm text-muted-foreground">Total Athletes</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-500 bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-4 text-center">
            <Star className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">{stats.eliteProspects}</div>
            <p className="text-sm text-muted-foreground">Elite Prospects</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">{stats.highPotential}</div>
            <p className="text-sm text-muted-foreground">High Potential</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-orange-500 bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-4 text-center">
            <Award className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-orange-600">{stats.avgPotential}</div>
            <p className="text-sm text-muted-foreground">Avg Rating</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Filter by Rating:</span>
        {[
          { value: 0, label: 'All' },
          { value: 8, label: 'Elite (8+)' },
          { value: 6, label: 'High (6+)' },
          { value: 4, label: 'Developing (4+)' }
        ].map((filter) => (
          <Button
            key={filter.value}
            size="sm"
            variant={filterRating === filter.value ? 'default' : 'outline'}
            onClick={() => setFilterRating(filter.value)}
            className="whitespace-nowrap"
          >
            {filter.label}
          </Button>
        ))}
      </div>

      {/* Scouting Profiles */}
      <div className="space-y-3">
        {filteredProfiles.map((profile) => (
          <Card 
            key={profile.name} 
            className={`border-2 ${getPotentialColor(profile.potentialRating)} hover:shadow-lg transition-all`}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 flex-shrink-0">
                  {profile.profilePic ? (
                    <img src={profile.profilePic} alt={profile.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary to-primary/70 text-white flex items-center justify-center font-bold">
                      {profile.name.split(' ').map(n => n[0]).join('')}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-bold">{profile.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{profile.age} years</span>
                        <span>•</span>
                        <span>{profile.state}</span>
                        <span>•</span>
                        <span>Coach: {profile.coach}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 mb-1">
                        {[...Array(10)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < profile.potentialRating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <Badge className={getPotentialColor(profile.potentialRating)}>
                        {getPotentialLabel(profile.potentialRating)}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3">
                    <div className="bg-white/50 p-2 rounded">
                      <p className="text-xs text-muted-foreground">Workouts</p>
                      <p className="text-sm font-bold">{profile.totalWorkouts}</p>
                    </div>
                    <div className="bg-white/50 p-2 rounded">
                      <p className="text-xs text-muted-foreground">Accuracy</p>
                      <p className="text-sm font-bold">{profile.avgAccuracy}%</p>
                    </div>
                    <div className="bg-white/50 p-2 rounded">
                      <p className="text-xs text-muted-foreground">Total Reps</p>
                      <p className="text-sm font-bold">{profile.totalReps}</p>
                    </div>
                    <div className="bg-white/50 p-2 rounded">
                      <p className="text-xs text-muted-foreground">Consistency</p>
                      <p className="text-sm font-bold">{profile.consistency}/wk</p>
                    </div>
                    <div className="bg-white/50 p-2 rounded">
                      <p className="text-xs text-muted-foreground">Improvement</p>
                      <p className={`text-sm font-bold ${profile.improvement >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {profile.improvement >= 0 ? '+' : ''}{profile.improvement}%
                      </p>
                    </div>
                  </div>

                  {profile.specialization.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-muted-foreground mb-1">Specialization:</p>
                      <div className="flex gap-2">
                        {profile.specialization.map((spec) => (
                          <Badge key={spec} variant="outline" className="text-xs">
                            <Target className="w-3 h-3 mr-1" />
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bg-white/70 p-3 rounded-lg border">
                    <p className="text-xs font-semibold text-muted-foreground mb-1">Scouting Notes:</p>
                    <p className="text-sm">{profile.scoutingNotes}</p>
                  </div>

                  <div className="flex gap-2 mt-3">
                    <Button size="sm" className="bg-gradient-to-r from-purple-500 to-blue-500">
                      <Eye className="w-4 h-4 mr-2" />
                      View Full Profile
                    </Button>
                    <Button size="sm" variant="outline">
                      <Star className="w-4 h-4 mr-2" />
                      Add to Watchlist
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProfiles.length === 0 && !isLoading && (
        <Card>
          <CardContent className="p-12 text-center">
            <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Athletes Found</h3>
            <p className="text-sm text-muted-foreground">
              Adjust filters or wait for more athlete data
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SAIScoutingDashboard;

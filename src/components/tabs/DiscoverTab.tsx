import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Users, Star, Trophy, ArrowRight, CheckCircle } from 'lucide-react';
import { FEATURED_CHALLENGES, getChallengeProgress, type Challenge } from '@/utils/challengeSystem';
import ChallengeDetailModal from '@/components/challenges/ChallengeDetailModal';

interface DiscoverTabProps {
  onStartWorkout?: (exerciseName: string) => void;
}

const DiscoverTab = ({ onStartWorkout }: DiscoverTabProps) => {
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Discover Challenges</h1>
        <p className="text-muted-foreground text-base">Join featured challenges and earn exclusive badges</p>
      </div>

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

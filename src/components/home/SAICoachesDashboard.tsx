import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import workoutStorageService from '@/services/workoutStorageService';
import { getMockCoachesWithRealData, getMockAthletesWithRealData, type MockCoach } from '@/services/mockSAIData';
import CoachDashboard from '@/components/home/CoachDashboard';
import { Users, Activity, Trophy, Eye, ArrowLeft } from 'lucide-react';

interface SAICoachesDashboardProps {
  onBack: () => void;
}

const SAICoachesDashboard = ({ onBack }: SAICoachesDashboardProps) => {
  const [coaches, setCoaches] = useState<MockCoach[]>([]);
  const [selectedCoach, setSelectedCoach] = useState<MockCoach | null>(null);

  useEffect(() => {
    loadCoaches();
  }, []);

  const loadCoaches = async () => {
    try {
      const realAthletes = await workoutStorageService.getAllAthletes();
      const coachesData = getMockCoachesWithRealData(realAthletes);
      setCoaches(coachesData);
    } catch (error) {
      console.error('Error loading coaches:', error);
    }
  };

  if (selectedCoach) {
    return (
      <div className="space-y-6">
        <Button onClick={() => setSelectedCoach(null)} variant="ghost" size="sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Coaches
        </Button>
        
        {/* Show full coach dashboard for selected coach */}
        <CoachDashboard 
          userName={selectedCoach.name}
          userRole="COACH"
          onTabChange={() => {}}
          activeTab="training"
          isSAIAdminView={true}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {coaches.length} Coach{coaches.length !== 1 ? 'es' : ''}
        </h3>
        <Button onClick={loadCoaches} variant="outline" size="sm">
          <Activity className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {coaches.map((coach) => (
          <Card key={coach.id} className="card-elevated hover:shadow-lg transition-all duration-300 border-l-4 border-l-success">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-success/30 flex-shrink-0">
                  <img src={coach.profilePic} alt={coach.name} className="w-full h-full object-cover" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base truncate">{coach.name}</h3>
                  <p className="text-sm text-muted-foreground">Head Coach</p>
                  
                  <div className="flex items-center flex-wrap gap-3 mt-2">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">{coach.athleteCount}</span>
                      <span className="text-xs text-muted-foreground">athletes</span>
                    </div>
                    
                    <span className="text-xs text-muted-foreground">•</span>
                    
                    <div className="flex items-center gap-1">
                      <Trophy className="w-4 h-4 text-warning" />
                      <span className="text-sm font-medium">{coach.totalWorkouts}</span>
                      <span className="text-xs text-muted-foreground">workouts</span>
                    </div>
                    
                    {coach.athleteCount > 0 && (
                      <>
                        <span className="text-xs text-muted-foreground">•</span>
                        <Badge className="bg-success text-white text-xs">
                          {Math.round(coach.totalWorkouts / coach.athleteCount)} avg
                        </Badge>
                      </>
                    )}
                  </div>
                </div>
                
                <Button 
                  size="sm" 
                  className="bg-gradient-to-r from-success to-success/80 flex-shrink-0"
                  onClick={() => setSelectedCoach(coach)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SAICoachesDashboard;

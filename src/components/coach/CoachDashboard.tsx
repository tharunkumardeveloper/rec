import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Activity, TrendingUp, Calendar } from 'lucide-react';
import workoutStorageService from '@/services/workoutStorageService';
import { useNavigate } from 'react-router-dom';

const CoachDashboard = () => {
  const [athletes, setAthletes] = useState<Array<{ name: string; workoutCount: number; lastWorkout: string }>>([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadAthletes();
  }, []);

  const loadAthletes = () => {
    const athleteList = workoutStorageService.getAllAthletes();
    setAthletes(athleteList);
  };

  const handleAthleteClick = (athleteName: string) => {
    navigate(`/coach/athlete/${encodeURIComponent(athleteName)}`);
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Coach Dashboard</h1>
            <p className="text-gray-600 mt-2">Monitor your athletes' performance</p>
          </div>
          <Button onClick={loadAthletes} variant="outline">
            Refresh
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Athletes</p>
                  <p className="text-2xl font-bold text-gray-900">{athletes.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Activity className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Workouts</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {athletes.reduce((sum, a) => sum + a.workoutCount, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Active Today</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {athletes.filter(a => {
                      const lastWorkout = new Date(a.lastWorkout);
                      const today = new Date();
                      return lastWorkout.toDateString() === today.toDateString();
                    }).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Athletes List */}
        <Card>
          <CardHeader>
            <CardTitle>Athletes</CardTitle>
          </CardHeader>
          <CardContent>
            {athletes.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No athletes yet</p>
                <p className="text-gray-400 text-sm mt-2">
                  Athletes will appear here after completing workouts
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {athletes.map((athlete) => (
                  <Card
                    key={athlete.name}
                    className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-blue-500"
                    onClick={() => handleAthleteClick(athlete.name)}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-2">
                            {athlete.name}
                          </h3>
                          <div className="space-y-2">
                            <div className="flex items-center text-sm text-gray-600">
                              <Activity className="w-4 h-4 mr-2" />
                              <span>{athlete.workoutCount} workouts</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <Calendar className="w-4 h-4 mr-2" />
                              <span>{formatDate(athlete.lastWorkout)}</span>
                            </div>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          View
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CoachDashboard;

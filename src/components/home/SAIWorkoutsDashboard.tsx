import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Activity, TrendingUp, RefreshCw } from 'lucide-react';
import workoutStorageService from '@/services/workoutStorageService';
import { useNavigate } from 'react-router-dom';

const SAIWorkoutsDashboard = () => {
  const [athletes, setAthletes] = useState<Array<{ name: string; workoutCount: number; lastWorkout: string; athleteProfilePic?: string }>>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadAthletes();
  }, []);

  const loadAthletes = async () => {
    setIsRefreshing(true);
    try {
      const athleteList = await workoutStorageService.getAllAthletes();
      setAthletes(athleteList);
    } catch (error) {
      console.error('Error loading athletes:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleAthleteClick = (athleteName: string) => {
    navigate(`/sai-workouts/athlete/${encodeURIComponent(athleteName)}`);
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">SAI Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">Monitor all athletes' performance across the system</p>
          </div>
          <Button onClick={loadAthletes} variant="outline" disabled={isRefreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Users className="w-6 h-6 text-purple-600" />
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
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Activity className="w-6 h-6 text-blue-600" />
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
                <div className="p-3 bg-green-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-600" />
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
            <CardTitle>All Athletes</CardTitle>
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
                    className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-purple-500"
                    onClick={() => handleAthleteClick(athlete.name)}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3 flex-1">
                          {athlete.athleteProfilePic ? (
                            <img
                              src={athlete.athleteProfilePic}
                              alt={athlete.name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
                              {athlete.name.charAt(0).toUpperCase()}
                            </div>
                          )}
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
                                <TrendingUp className="w-4 h-4 mr-2" />
                                <span>{formatDate(athlete.lastWorkout)}</span>
                              </div>
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

export default SAIWorkoutsDashboard;

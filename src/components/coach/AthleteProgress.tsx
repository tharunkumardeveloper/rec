import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface AthleteProgressProps {
  athleteName: string;
  onBack: () => void;
}

const AthleteProgress = ({ athleteName, onBack }: AthleteProgressProps) => {
  // Mock progress data - would come from MongoDB in real implementation
  const progressData = {
    weeklyStats: [
      { week: 'Week 1', workouts: 3, avgAccuracy: 75, totalReps: 120 },
      { week: 'Week 2', workouts: 4, avgAccuracy: 78, totalReps: 160 },
      { week: 'Week 3', workouts: 5, avgAccuracy: 82, totalReps: 200 },
      { week: 'Week 4', workouts: 4, avgAccuracy: 85, totalReps: 180 }
    ],
    improvements: [
      { exercise: 'Pushups', change: +15, trend: 'up' },
      { exercise: 'Situps', change: +8, trend: 'up' },
      { exercise: 'Squats', change: -2, trend: 'down' },
      { exercise: 'Pullups', change: 0, trend: 'stable' }
    ]
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  const getTrendColor = (trend: string) => {
    if (trend === 'up') return 'text-green-600 bg-green-50';
    if (trend === 'down') return 'text-red-600 bg-red-50';
    return 'text-gray-600 bg-gray-50';
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-lg font-bold">{athleteName}</h2>
          <p className="text-sm text-muted-foreground">Progress Tracking</p>
        </div>
      </div>

      {/* Weekly Progress */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Weekly Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {progressData.weeklyStats.map((week, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                <div className="flex-1">
                  <p className="font-semibold text-sm">{week.week}</p>
                  <p className="text-xs text-muted-foreground">
                    {week.workouts} workouts • {week.totalReps} reps
                  </p>
                </div>
                <Badge className={week.avgAccuracy >= 80 ? 'bg-green-500' : 'bg-yellow-500'}>
                  {week.avgAccuracy}%
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Exercise Improvements */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Exercise Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {progressData.improvements.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                <div className="flex items-center space-x-3">
                  {getTrendIcon(item.trend)}
                  <span className="font-medium text-sm">{item.exercise}</span>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${getTrendColor(item.trend)}`}>
                  {item.change > 0 && '+'}{item.change}%
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AthleteProgress;

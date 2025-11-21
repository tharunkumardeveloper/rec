import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, BarChart3, CheckCircle2, XCircle } from 'lucide-react';

interface DayProgress {
  date: Date;
  workoutsCompleted: number;
  caloriesBurned: number;
  activeMinutes: number;
  goalsMet: boolean;
}

interface WeeklyProgressProps {
  weekData?: DayProgress[];
  currentWeek?: number;
  onWeekChange?: (week: number) => void;
}

const WeeklyProgress = ({ weekData, currentWeek = 0, onWeekChange }: WeeklyProgressProps) => {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // Default data if none provided
  const defaultWeekData: DayProgress[] = [
    { date: new Date(2024, 0, 1), workoutsCompleted: 2, caloriesBurned: 320, activeMinutes: 45, goalsMet: true },
    { date: new Date(2024, 0, 2), workoutsCompleted: 1, caloriesBurned: 280, activeMinutes: 35, goalsMet: true },
    { date: new Date(2024, 0, 3), workoutsCompleted: 0, caloriesBurned: 0, activeMinutes: 0, goalsMet: false },
    { date: new Date(2024, 0, 4), workoutsCompleted: 2, caloriesBurned: 410, activeMinutes: 55, goalsMet: true },
    { date: new Date(2024, 0, 5), workoutsCompleted: 1, caloriesBurned: 295, activeMinutes: 40, goalsMet: true },
    { date: new Date(2024, 0, 6), workoutsCompleted: 2, caloriesBurned: 380, activeMinutes: 50, goalsMet: true },
    { date: new Date(2024, 0, 7), workoutsCompleted: 0, caloriesBurned: 0, activeMinutes: 0, goalsMet: false },
  ];

  const data = weekData || defaultWeekData;
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const handlePreviousWeek = () => {
    if (onWeekChange) {
      onWeekChange(currentWeek - 1);
    }
  };

  const handleNextWeek = () => {
    if (onWeekChange) {
      onWeekChange(currentWeek + 1);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <Card className="card-elevated">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            <span>Weekly Progress</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePreviousWeek}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-muted-foreground">This Week</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNextWeek}
              className="h-8 w-8 p-0"
              disabled={currentWeek >= 0}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Mobile: Vertical stacked layout */}
        <div className="lg:hidden space-y-3">
          {data.map((day, index) => (
            <div
              key={index}
              className="p-3 rounded-lg border bg-card hover:bg-secondary/50 transition-colors cursor-pointer"
              onClick={() => setSelectedDay(selectedDay === index ? null : index)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{days[index]}</span>
                  <span className="text-xs text-muted-foreground">{formatDate(day.date)}</span>
                </div>
                {day.goalsMet ? (
                  <CheckCircle2 className="w-5 h-5 text-success" />
                ) : (
                  <XCircle className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              {selectedDay === index && (
                <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t">
                  <div className="text-center">
                    <div className="text-sm font-medium">{day.workoutsCompleted}</div>
                    <div className="text-xs text-muted-foreground">Workouts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium">{day.caloriesBurned}</div>
                    <div className="text-xs text-muted-foreground">Calories</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium">{day.activeMinutes}</div>
                    <div className="text-xs text-muted-foreground">Minutes</div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Desktop: Horizontal 7-column grid */}
        <div className="hidden lg:grid lg:grid-cols-7 lg:gap-3">
          {data.map((day, index) => (
            <div
              key={index}
              className="relative group"
              onMouseEnter={() => setSelectedDay(index)}
              onMouseLeave={() => setSelectedDay(null)}
            >
              {/* Day Card */}
              <div
                className={`p-3 rounded-lg border text-center transition-all cursor-pointer ${
                  day.goalsMet
                    ? 'bg-success/5 border-success/20 hover:bg-success/10'
                    : 'bg-secondary/30 border-border hover:bg-secondary/50'
                }`}
              >
                <div className="text-xs font-medium text-muted-foreground mb-1">
                  {days[index]}
                </div>
                <div className="text-xs text-muted-foreground mb-2">
                  {formatDate(day.date).split(' ')[1]}
                </div>
                <div className="flex justify-center mb-2">
                  {day.goalsMet ? (
                    <CheckCircle2 className="w-6 h-6 text-success" />
                  ) : (
                    <XCircle className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
                <div className="text-lg font-bold text-primary">
                  {day.caloriesBurned}
                </div>
                <div className="text-xs text-muted-foreground">cal</div>
              </div>

              {/* Hover Tooltip */}
              {selectedDay === index && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-10 w-48 p-3 bg-popover border rounded-lg shadow-lg animate-in fade-in slide-in-from-top-2">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Workouts:</span>
                      <span className="font-medium">{day.workoutsCompleted}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Calories:</span>
                      <span className="font-medium">{day.caloriesBurned}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Active:</span>
                      <span className="font-medium">{day.activeMinutes} min</span>
                    </div>
                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-center space-x-1 text-xs">
                        {day.goalsMet ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-success" />
                            <span className="text-success font-medium">Goals Met</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-muted-foreground" />
                            <span className="text-muted-foreground">Rest Day</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-primary">
              {data.filter(d => d.goalsMet).length}
            </div>
            <div className="text-xs text-muted-foreground">Days Active</div>
          </div>
          <div>
            <div className="text-lg font-bold text-primary">
              {data.reduce((sum, d) => sum + d.caloriesBurned, 0)}
            </div>
            <div className="text-xs text-muted-foreground">Total Calories</div>
          </div>
          <div>
            <div className="text-lg font-bold text-primary">
              {data.reduce((sum, d) => sum + d.activeMinutes, 0)}
            </div>
            <div className="text-xs text-muted-foreground">Total Minutes</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeeklyProgress;

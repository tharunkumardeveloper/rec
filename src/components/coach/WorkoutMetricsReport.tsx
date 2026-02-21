import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Clock, 
  Target, 
  Zap,
  Award,
  AlertCircle,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { StoredWorkout } from '@/services/workoutStorageService';

interface WorkoutMetricsReportProps {
  workout: StoredWorkout;
  athleteProfile?: {
    name: string;
    age?: number;
    gender?: string;
    height?: number;
    weight?: number;
    profilePic?: string;
  };
}

const WorkoutMetricsReport = ({ workout, athleteProfile }: WorkoutMetricsReportProps) => {
  // Calculate metrics
  const avgRepTime = workout.duration / workout.totalReps;
  const repsPerMinute = (workout.totalReps / workout.duration) * 60;
  const errorRate = (workout.incorrectReps / workout.totalReps) * 100;
  const successRate = (workout.correctReps / workout.totalReps) * 100;

  // Performance rating
  const getPerformanceRating = () => {
    if (workout.accuracy >= 90) return { label: 'Excellent', color: 'text-green-600', bg: 'bg-green-50', icon: Award };
    if (workout.accuracy >= 80) return { label: 'Very Good', color: 'text-blue-600', bg: 'bg-blue-50', icon: CheckCircle2 };
    if (workout.accuracy >= 70) return { label: 'Good', color: 'text-yellow-600', bg: 'bg-yellow-50', icon: Target };
    if (workout.accuracy >= 60) return { label: 'Fair', color: 'text-orange-600', bg: 'bg-orange-50', icon: AlertCircle };
    return { label: 'Needs Improvement', color: 'text-red-600', bg: 'bg-red-50', icon: XCircle };
  };

  const rating = getPerformanceRating();
  const RatingIcon = rating.icon;

  // Format date
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="space-y-6">
      {/* Athlete Info Header */}
      {athleteProfile && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              {athleteProfile.profilePic ? (
                <img
                  src={athleteProfile.profile
const API_BASE_URL = 'http://localhost:3001/api';

export interface ProcessingResult {
  success: boolean;
  outputId: string;
  csvData?: any[];
  videoFile?: string;
  outputPath?: string;
  files?: string[];
  error?: string;
}

export interface WorkoutStats {
  totalReps?: number;
  correctReps?: number;
  incorrectReps?: number;
  avgRepDuration?: number;
  minElbowAngle?: number;
  maxElbowAngle?: number;
  totalTime?: number;
  posture?: 'Good' | 'Bad';
  // Add more fields based on different activities
  jumpCount?: number;
  maxJumpHeight?: number;
  avgJumpHeight?: number;
  splitTimes?: number[];
  avgSplitTime?: number;
  distance?: number;
}

class WorkoutService {
  async processVideo(videoFile: File, activityName: string): Promise<ProcessingResult> {
    const formData = new FormData();
    formData.append('video', videoFile);
    formData.append('activityName', activityName);
    formData.append('mode', 'video');

    try {
      const response = await fetch(`${API_BASE_URL}/process-video`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process video');
      }

      return await response.json();
    } catch (error) {
      console.error('Error processing video:', error);
      throw error;
    }
  }

  async startLiveRecording(activityName: string): Promise<ProcessingResult> {
    try {
      const response = await fetch(`${API_BASE_URL}/start-live-recording`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ activityName }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start live recording');
      }

      return await response.json();
    } catch (error) {
      console.error('Error starting live recording:', error);
      throw error;
    }
  }

  async getResults(outputId: string): Promise<ProcessingResult> {
    try {
      const response = await fetch(`${API_BASE_URL}/results/${outputId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get results');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting results:', error);
      throw error;
    }
  }

  getVideoUrl(outputId: string, filename: string): string {
    return `${API_BASE_URL}/video/${outputId}/${filename}`;
  }

  parseWorkoutStats(csvData: any[], activityName: string): WorkoutStats {
    if (!csvData || csvData.length === 0) {
      return {};
    }

    const stats: WorkoutStats = {};

    switch (activityName) {
      case 'Push-ups':
        stats.totalReps = csvData.length;
        stats.correctReps = csvData.filter(row => row.correct === 'True' || row.correct === true).length;
        stats.incorrectReps = stats.totalReps - stats.correctReps;
        stats.avgRepDuration = this.calculateAverage(csvData, 'dip_duration_sec');
        stats.minElbowAngle = Math.min(...csvData.map(row => parseFloat(row.min_elbow_angle || 0)));
        stats.maxElbowAngle = Math.max(...csvData.map(row => parseFloat(row.min_elbow_angle || 0)));
        stats.totalTime = Math.max(...csvData.map(row => parseFloat(row.up_time || 0)));
        stats.posture = stats.correctReps > stats.incorrectReps ? 'Good' : 'Bad';
        break;

      case 'Pull-ups':
        stats.totalReps = csvData.length;
        stats.correctReps = csvData.length; // Assume all detected pull-ups are correct
        stats.incorrectReps = 0;
        stats.avgRepDuration = this.calculateAverage(csvData, 'dip_duration_sec');
        stats.minElbowAngle = Math.min(...csvData.map(row => parseFloat(row.min_elbow_angle || 0)));
        stats.totalTime = Math.max(...csvData.map(row => parseFloat(row.down_time || 0)));
        stats.posture = 'Good';
        break;

      case 'Vertical Jump':
        stats.jumpCount = csvData.length;
        const jumpHeights = csvData.map(row => 
          parseFloat(row.jump_height_m || row.max_jump_height_m || row.max_height_m || 0)
        );
        stats.maxJumpHeight = Math.max(...jumpHeights);
        stats.avgJumpHeight = jumpHeights.reduce((a, b) => a + b, 0) / jumpHeights.length;
        const landingTimes = csvData.map(row => parseFloat(row.landing_time || row.total_time || 0));
        stats.totalTime = Math.max(...landingTimes);
        stats.posture = 'Good'; // Vertical jump doesn't have posture assessment
        break;

      case 'Shuttle Run':
        // Shuttle run CSV contains position data per frame
        // Look for run_count in the data or calculate from position changes
        if (csvData[0]?.run_count !== undefined) {
          stats.totalReps = parseInt(csvData[0].run_count);
        } else {
          // Estimate from frame count (rough approximation)
          stats.totalReps = Math.floor(csvData.length / 100); // Assuming ~100 frames per run
        }
        
        if (csvData[0]?.split_times_sec) {
          const splitTimes = JSON.parse(csvData[0].split_times_sec);
          stats.splitTimes = splitTimes;
          stats.avgSplitTime = splitTimes.reduce((a: number, b: number) => a + b, 0) / splitTimes.length;
        }
        
        stats.totalTime = parseFloat(csvData[csvData.length - 1]?.time || csvData[0]?.total_time || 0);
        stats.distance = parseFloat(csvData[0]?.distance_m || 0);
        stats.posture = 'Good'; // Shuttle run doesn't have posture assessment
        break;

      case 'Sit-ups':
        stats.totalReps = csvData.length;
        // Sit-ups may not have a 'correct' field, so we assume all are correct if not specified
        const correctSitups = csvData.filter(row => row.correct === 'True' || row.correct === true || row.correct === undefined);
        stats.correctReps = correctSitups.length;
        stats.incorrectReps = stats.totalReps - stats.correctReps;
        stats.avgRepDuration = this.calculateAverage(csvData, 'dip_duration_sec') || 
                               this.calculateAverage(csvData, 'avg_rep_time');
        const situpTimes = csvData.map(row => parseFloat(row.up_time || row.total_time_sec || 0));
        stats.totalTime = Math.max(...situpTimes);
        stats.posture = stats.correctReps >= stats.totalReps * 0.7 ? 'Good' : 'Bad';
        break;

      case 'Sit Reach':
        // Sit reach typically measures flexibility distance
        stats.totalReps = csvData.length;
        if (csvData[0]?.reach_distance_cm) {
          stats.distance = parseFloat(csvData[0].reach_distance_cm);
        }
        stats.totalTime = parseFloat(csvData[csvData.length - 1]?.time || 0);
        stats.posture = 'Good';
        break;

      case 'Vertical Broad Jump':
        // Similar to vertical jump but horizontal distance
        stats.jumpCount = csvData.length;
        const broadJumpDistances = csvData.map(row => 
          parseFloat(row.jump_distance_m || row.distance_m || 0)
        );
        stats.maxJumpHeight = Math.max(...broadJumpDistances); // Using maxJumpHeight field for max distance
        stats.avgJumpHeight = broadJumpDistances.reduce((a, b) => a + b, 0) / broadJumpDistances.length;
        stats.totalTime = Math.max(...csvData.map(row => parseFloat(row.time || 0)));
        stats.posture = 'Good';
        break;

      default:
        // Generic parsing for other activities
        stats.totalReps = csvData.length;
        const times = csvData.map(row => parseFloat(row.total_time || row.total_time_sec || row.time || 0));
        stats.totalTime = Math.max(...times.filter(t => !isNaN(t)));
        stats.posture = 'Good';
        break;
    }

    return stats;
  }

  private calculateAverage(data: any[], field: string): number {
    const values = data.map(row => parseFloat(row[field] || 0)).filter(val => !isNaN(val));
    return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  }

  formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  // Simulate processing for demo purposes when backend is not available
  async simulateProcessing(videoFile: File, activityName: string): Promise<ProcessingResult> {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate mock results based on filename
    const filename = videoFile.name.toLowerCase();
    const firstLetter = filename.charAt(0);
    
    let mockCsvData: any[] = [];
    let posture: 'Good' | 'Bad' = 'Good';

    switch (activityName) {
      case 'Push-ups':
        const reps = firstLetter === 'b' ? 15 : 20;
        const badReps = firstLetter === 'b' ? 5 : 2;
        posture = firstLetter === 'b' ? 'Bad' : 'Good';
        
        for (let i = 1; i <= reps; i++) {
          mockCsvData.push({
            count: i,
            down_time: (i - 1) * 2.5 + 1,
            up_time: i * 2.5,
            dip_duration_sec: 1.2 + Math.random() * 0.5,
            min_elbow_angle: firstLetter === 'b' ? 85 + Math.random() * 10 : 65 + Math.random() * 10,
            correct: i <= (reps - badReps)
          });
        }
        break;

      case 'Pull-ups':
        const pullupReps = firstLetter === 'b' ? 8 : 12;
        for (let i = 1; i <= pullupReps; i++) {
          mockCsvData.push({
            count: i,
            up_time: (i - 1) * 4 + 1,
            down_time: i * 4,
            dip_duration_sec: 2.5 + Math.random() * 1,
            min_elbow_angle: 160 + Math.random() * 15
          });
        }
        break;

      case 'Vertical Jump':
        const jumps = 5;
        for (let i = 1; i <= jumps; i++) {
          mockCsvData.push({
            jump_count: i,
            max_jump_height_m: 0.4 + Math.random() * 0.3,
            time_of_max_height_sec: i * 3
          });
        }
        break;
    }

    return {
      success: true,
      outputId: `mock_${Date.now()}`,
      csvData: mockCsvData,
      videoFile: 'mock_annotated.mp4'
    };
  }
}

export const workoutService = new WorkoutService();
/**
 * Coach Dashboard Service
 * Handles automatic submission of workout reports and videos to coach dashboard
 */

interface WorkoutSubmission {
  athleteName: string;
  athleteProfilePic?: string;
  activityName: string;
  totalReps: number;
  correctReps: number;
  incorrectReps: number;
  duration: number;
  accuracy: number;
  formScore: string;
  repDetails: any[];
  timestamp: string;
  videoBlob?: Blob;
  pdfBlob?: Blob;
}

interface CoachDashboardConfig {
  enabled: boolean;
  apiEndpoint: string;
  coachEmail?: string;
  autoSubmit: boolean;
}

class CoachDashboardService {
  private config: CoachDashboardConfig;

  constructor() {
    // Load configuration from localStorage
    this.config = this.loadConfig();
  }

  private loadConfig(): CoachDashboardConfig {
    const savedConfig = localStorage.getItem('coach_dashboard_config');
    if (savedConfig) {
      return JSON.parse(savedConfig);
    }
    
    // Default configuration
    return {
      enabled: false,
      apiEndpoint: import.meta.env.VITE_COACH_API_ENDPOINT || '',
      coachEmail: localStorage.getItem('coach_email') || undefined,
      autoSubmit: true
    };
  }

  public saveConfig(config: Partial<CoachDashboardConfig>): void {
    this.config = { ...this.config, ...config };
    localStorage.setItem('coach_dashboard_config', JSON.stringify(this.config));
  }

  public getConfig(): CoachDashboardConfig {
    return { ...this.config };
  }

  /**
   * Submit workout data to coach dashboard
   */
  public async submitWorkout(data: WorkoutSubmission): Promise<boolean> {
    if (!this.config.enabled || !this.config.autoSubmit) {
      console.log('Coach dashboard submission disabled');
      return false;
    }

    if (!this.config.apiEndpoint) {
      console.warn('Coach dashboard API endpoint not configured');
      return false;
    }

    try {
      const formData = new FormData();
      
      // Add workout metadata
      formData.append('athleteName', data.athleteName);
      formData.append('activityName', data.activityName);
      formData.append('totalReps', data.totalReps.toString());
      formData.append('correctReps', data.correctReps.toString());
      formData.append('incorrectReps', data.incorrectReps.toString());
      formData.append('duration', data.duration.toString());
      formData.append('accuracy', data.accuracy.toString());
      formData.append('formScore', data.formScore);
      formData.append('timestamp', data.timestamp);
      formData.append('repDetails', JSON.stringify(data.repDetails));

      if (data.athleteProfilePic) {
        formData.append('athleteProfilePic', data.athleteProfilePic);
      }

      if (this.config.coachEmail) {
        formData.append('coachEmail', this.config.coachEmail);
      }

      // Add video file
      if (data.videoBlob) {
        const videoFile = new File(
          [data.videoBlob],
          `${data.athleteName}_${data.activityName}_${Date.now()}.webm`,
          { type: 'video/webm' }
        );
        formData.append('video', videoFile);
      }

      // Add PDF report
      if (data.pdfBlob) {
        const pdfFile = new File(
          [data.pdfBlob],
          `${data.athleteName}_${data.activityName}_Report_${Date.now()}.pdf`,
          { type: 'application/pdf' }
        );
        formData.append('report', pdfFile);
      }

      // Submit to coach dashboard
      const response = await fetch(this.config.apiEndpoint, {
        method: 'POST',
        body: formData,
        headers: {
          'X-Athlete-Name': data.athleteName,
          'X-Activity-Type': data.activityName
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to submit workout: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Workout submitted to coach dashboard:', result);
      
      // Store submission record
      this.recordSubmission(data);
      
      return true;
    } catch (error) {
      console.error('Error submitting workout to coach dashboard:', error);
      
      // Store failed submission for retry
      this.storeFailedSubmission(data);
      
      return false;
    }
  }

  /**
   * Generate PDF blob from workout data
   */
  public async generatePDFBlob(
    pdf: any,
    athleteName: string,
    activityName: string
  ): Promise<Blob> {
    return new Promise((resolve) => {
      const pdfBlob = pdf.output('blob');
      resolve(pdfBlob);
    });
  }

  /**
   * Record successful submission
   */
  private recordSubmission(data: WorkoutSubmission): void {
    const submissions = this.getSubmissionHistory();
    submissions.push({
      athleteName: data.athleteName,
      activityName: data.activityName,
      timestamp: data.timestamp,
      status: 'success'
    });
    
    // Keep only last 50 submissions
    if (submissions.length > 50) {
      submissions.shift();
    }
    
    localStorage.setItem('coach_submissions', JSON.stringify(submissions));
  }

  /**
   * Store failed submission for retry
   */
  private storeFailedSubmission(data: WorkoutSubmission): void {
    const failed = this.getFailedSubmissions();
    failed.push({
      data,
      timestamp: new Date().toISOString(),
      retryCount: 0
    });
    
    localStorage.setItem('failed_submissions', JSON.stringify(failed));
  }

  /**
   * Get submission history
   */
  public getSubmissionHistory(): any[] {
    const history = localStorage.getItem('coach_submissions');
    return history ? JSON.parse(history) : [];
  }

  /**
   * Get failed submissions
   */
  public getFailedSubmissions(): any[] {
    const failed = localStorage.getItem('failed_submissions');
    return failed ? JSON.parse(failed) : [];
  }

  /**
   * Retry failed submissions
   */
  public async retryFailedSubmissions(): Promise<void> {
    const failed = this.getFailedSubmissions();
    const remaining: any[] = [];

    for (const item of failed) {
      if (item.retryCount < 3) {
        const success = await this.submitWorkout(item.data);
        if (!success) {
          item.retryCount++;
          remaining.push(item);
        }
      }
    }

    localStorage.setItem('failed_submissions', JSON.stringify(remaining));
  }

  /**
   * Clear submission history
   */
  public clearHistory(): void {
    localStorage.removeItem('coach_submissions');
    localStorage.removeItem('failed_submissions');
  }
}

// Export singleton instance
export const coachDashboardService = new CoachDashboardService();
export default coachDashboardService;

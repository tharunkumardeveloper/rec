/**
 * Workout Storage Service
 * Handles persistent storage of workout data, videos, and reports
 */

export interface StoredWorkout {
  id: string;
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
  videoDataUrl?: string; // Base64 encoded video
  pdfDataUrl?: string; // Base64 encoded PDF
  screenshots: string[]; // Base64 encoded images
}

class WorkoutStorageService {
  private readonly STORAGE_KEY = 'athlete_workouts';
  private readonly MAX_WORKOUTS = 50; // Keep last 50 workouts

  /**
   * Save a workout with video and PDF
   * Keeps only the LATEST workout per athlete (deletes old ones)
   */
  public async saveWorkout(workout: Omit<StoredWorkout, 'id'>): Promise<string> {
    const workouts = this.getAllWorkouts();
    
    // Remove ALL previous workouts from this athlete
    const filteredWorkouts = workouts.filter(w => w.athleteName !== workout.athleteName);
    
    const newWorkout: StoredWorkout = {
      ...workout,
      id: this.generateId()
    };

    // Add new workout at the beginning
    filteredWorkouts.unshift(newWorkout);

    // Keep only last MAX_WORKOUTS total (across all athletes)
    if (filteredWorkouts.length > this.MAX_WORKOUTS) {
      filteredWorkouts.splice(this.MAX_WORKOUTS);
    }

    this.saveToStorage(filteredWorkouts);
    console.log(`✅ Saved workout for ${workout.athleteName}, removed old workouts`);
    return newWorkout.id;
  }

  /**
   * Get all workouts
   */
  public getAllWorkouts(): StoredWorkout[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading workouts:', error);
      return [];
    }
  }

  /**
   * Get workouts by athlete name
   */
  public getWorkoutsByAthlete(athleteName: string): StoredWorkout[] {
    const allWorkouts = this.getAllWorkouts();
    return allWorkouts.filter(w => w.athleteName === athleteName);
  }

  /**
   * Get a specific workout by ID
   */
  public getWorkoutById(id: string): StoredWorkout | null {
    const workouts = this.getAllWorkouts();
    return workouts.find(w => w.id === id) || null;
  }

  /**
   * Delete a workout
   */
  public deleteWorkout(id: string): boolean {
    const workouts = this.getAllWorkouts();
    const filtered = workouts.filter(w => w.id !== id);
    
    if (filtered.length < workouts.length) {
      this.saveToStorage(filtered);
      return true;
    }
    return false;
  }

  /**
   * Get all unique athlete names
   * Since we keep only 1 workout per athlete, this is simplified
   */
  public getAllAthletes(): Array<{ name: string; workoutCount: number; lastWorkout: string }> {
    const workouts = this.getAllWorkouts();
    const athleteMap = new Map<string, { count: number; lastWorkout: string }>();

    workouts.forEach(workout => {
      // Since we keep only 1 workout per athlete, each athlete appears once
      athleteMap.set(workout.athleteName, {
        count: 1, // Always 1 since we keep only latest
        lastWorkout: workout.timestamp
      });
    });

    return Array.from(athleteMap.entries()).map(([name, data]) => ({
      name,
      workoutCount: data.count,
      lastWorkout: data.lastWorkout
    }));
  }

  /**
   * Convert Blob to Base64 Data URL
   */
  public async blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Convert Data URL to Blob
   */
  public dataUrlToBlob(dataUrl: string): Blob {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'application/octet-stream';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  }

  /**
   * Clear all workouts
   */
  public clearAllWorkouts(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Get storage size in MB
   */
  public getStorageSize(): number {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (!data) return 0;
    return new Blob([data]).size / (1024 * 1024); // Convert to MB
  }

  private saveToStorage(workouts: StoredWorkout[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(workouts));
    } catch (error) {
      console.error('Error saving workouts:', error);
      // If storage is full, remove oldest workouts
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        const reduced = workouts.slice(0, Math.floor(workouts.length / 2));
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(reduced));
      }
    }
  }

  private generateId(): string {
    return `workout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const workoutStorageService = new WorkoutStorageService();
export default workoutStorageService;

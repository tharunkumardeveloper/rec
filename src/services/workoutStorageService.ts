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
   * Also saves to MongoDB if backend is available
   */
  public async saveWorkout(workout: Omit<StoredWorkout, 'id'>): Promise<string> {
    console.log(`💾 Saving workout for athlete: ${workout.athleteName}`);
    const workouts = this.getAllWorkouts();
    console.log(`📊 Current workouts in storage: ${workouts.length}`);
    
    // Remove ALL previous workouts from this athlete
    const filteredWorkouts = workouts.filter(w => w.athleteName !== workout.athleteName);
    console.log(`🗑️ After filtering old workouts: ${filteredWorkouts.length}`);
    
    const newWorkout: StoredWorkout = {
      ...workout,
      id: this.generateId()
    };

    // Add new workout at the beginning
    filteredWorkouts.unshift(newWorkout);
    console.log(`➕ After adding new workout: ${filteredWorkouts.length}`);

    // Keep only last MAX_WORKOUTS total (across all athletes)
    if (filteredWorkouts.length > this.MAX_WORKOUTS) {
      filteredWorkouts.splice(this.MAX_WORKOUTS);
    }

    this.saveToStorage(filteredWorkouts);
    console.log(`✅ Saved workout for ${workout.athleteName}, removed old workouts`);
    console.log(`🔑 Storage key: "${this.STORAGE_KEY}"`);
    
    // Verify it was saved
    const verification = localStorage.getItem(this.STORAGE_KEY);
    console.log(`✔️ Verification - Data exists: ${!!verification}, Length: ${verification?.length || 0}`);
    
    // Also save to MongoDB backend
    try {
      await this.saveToMongoDB(newWorkout);
    } catch (error) {
      console.warn('⚠️ MongoDB save failed, data saved to localStorage only:', error);
    }
    
    return newWorkout.id;
  }

  /**
   * Save workout to MongoDB backend
   */
  private async saveToMongoDB(workout: StoredWorkout): Promise<void> {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://rec-backend-yi7u.onrender.com';
      
      // Prepare session metadata
      const sessionMeta = {
        athleteName: workout.athleteName,
        athleteProfilePic: workout.athleteProfilePic,
        activityName: workout.activityName,
        totalReps: workout.totalReps,
        correctReps: workout.correctReps,
        incorrectReps: workout.incorrectReps,
        duration: workout.duration,
        accuracy: workout.accuracy,
        formScore: workout.formScore,
        timestamp: workout.timestamp,
        videoDataUrl: workout.videoDataUrl,
        pdfDataUrl: workout.pdfDataUrl
      };

      // Prepare rep images (screenshots)
      const repImages = workout.screenshots.map((screenshot, index) => ({
        repNumber: index + 1,
        imageData: screenshot,
        correct: workout.repDetails[index]?.correct ?? true,
        details: workout.repDetails[index] || {}
      }));

      console.log(`☁️ Saving to MongoDB: ${workout.athleteName} - ${workout.activityName}`);
      
      const response = await fetch(`${backendUrl}/api/sessions/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionMeta,
          repImages
        })
      });

      if (!response.ok) {
        throw new Error(`MongoDB save failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log(`✅ Saved to MongoDB with session ID: ${result.sessionId}`);
    } catch (error) {
      console.error('❌ MongoDB save error:', error);
      throw error;
    }
  }

  /**
   * Get all workouts
   */
  public getAllWorkouts(): StoredWorkout[] {
    try {
      console.log(`🔍 Getting workouts from key: "${this.STORAGE_KEY}"`);
      const data = localStorage.getItem(this.STORAGE_KEY);
      console.log(`📦 Raw data length: ${data?.length || 0}`);
      const workouts = data ? JSON.parse(data) : [];
      console.log(`📊 Parsed workouts count: ${workouts.length}`);
      if (workouts.length > 0) {
        console.log(`👥 Athletes in storage: ${workouts.map((w: StoredWorkout) => w.athleteName).join(', ')}`);
      }
      return workouts;
    } catch (error) {
      console.error('Error loading workouts:', error);
      return [];
    }
  }

  /**
   * Get workouts by athlete name
   * Tries MongoDB first, falls back to localStorage
   */
  public async getWorkoutsByAthlete(athleteName: string): Promise<StoredWorkout[]> {
    try {
      // Try MongoDB first
      const workouts = await this.getWorkoutsFromMongoDB(athleteName);
      if (workouts.length > 0) {
        console.log(`✅ Loaded ${workouts.length} workouts from MongoDB for ${athleteName}`);
        return workouts;
      }
    } catch (error) {
      console.warn('⚠️ MongoDB fetch failed, using localStorage:', error);
    }

    // Fallback to localStorage
    const allWorkouts = this.getAllWorkouts();
    return allWorkouts.filter(w => w.athleteName === athleteName);
  }

  /**
   * Get workouts from MongoDB for a specific athlete
   */
  private async getWorkoutsFromMongoDB(athleteName: string): Promise<StoredWorkout[]> {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://rec-backend-yi7u.onrender.com';
    
    const response = await fetch(`${backendUrl}/api/sessions/athlete/${encodeURIComponent(athleteName)}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch workouts: ${response.statusText}`);
    }

    const data = await response.json();
    return data.workouts.map((workout: any) => ({
      id: workout._id,
      athleteName: workout.athleteName,
      athleteProfilePic: workout.athleteProfilePic,
      activityName: workout.activityName,
      totalReps: workout.totalReps,
      correctReps: workout.correctReps,
      incorrectReps: workout.incorrectReps,
      duration: workout.duration,
      accuracy: workout.accuracy,
      formScore: workout.formScore,
      repDetails: workout.repDetails || [],
      timestamp: workout.timestamp,
      videoDataUrl: workout.videoDataUrl,
      pdfDataUrl: workout.pdfDataUrl,
      screenshots: workout.screenshots || []
    }));
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
   * Tries MongoDB first, falls back to localStorage
   */
  public async getAllAthletes(): Promise<Array<{ name: string; workoutCount: number; lastWorkout: string }>> {
    try {
      // Try MongoDB first
      const athletes = await this.getAthletesFromMongoDB();
      if (athletes.length > 0) {
        console.log(`✅ Loaded ${athletes.length} athletes from MongoDB`);
        return athletes;
      }
    } catch (error) {
      console.warn('⚠️ MongoDB fetch failed, using localStorage:', error);
    }

    // Fallback to localStorage
    const workouts = this.getAllWorkouts();
    const athleteMap = new Map<string, { count: number; lastWorkout: string }>();

    workouts.forEach(workout => {
      athleteMap.set(workout.athleteName, {
        count: 1,
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
   * Get athletes from MongoDB
   */
  private async getAthletesFromMongoDB(): Promise<Array<{ name: string; workoutCount: number; lastWorkout: string }>> {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://rec-backend-yi7u.onrender.com';
    
    const response = await fetch(`${backendUrl}/api/sessions/all-athletes`);
    if (!response.ok) {
      throw new Error(`Failed to fetch athletes: ${response.statusText}`);
    }

    const data = await response.json();
    return data.athletes.map((athlete: any) => ({
      name: athlete.name,
      workoutCount: athlete.workoutCount,
      lastWorkout: athlete.lastWorkout
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

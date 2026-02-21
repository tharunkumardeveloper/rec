// Shuttle Run Live Detector - Real-time shuttle run lap counting
// Based on horizontal position tracking and direction changes

interface RepDetail {
  count: number;
  timeSec: number;
  direction: string;
  distanceM: number;
  correct: boolean;
  formIssues: string[];
}

interface CurrentMetrics {
  repCount: number;
  status: string;
  direction: string;
  distanceM: number;
}

export class ShuttleRunLiveDetector {
  private reps: RepDetail[] = [];
  private xHistory: number[] = [];
  private dirHistory: string[] = [];
  private startX: number | null = null;
  private lastX: number | null = null;
  private direction: string | null = null;
  private status: string = 'Waiting';
  private readonly SMOOTH_N = 5;
  private readonly DIR_FRAMES = 3;
  private readonly THRESHOLD_PIX = 5;
  private readonly PIXEL_TO_M = 0.01;
  private canvasWidth: number = 640;
  private canvasHeight: number = 480;

  constructor() {
    this.reset();
  }

  setDimensions(width: number, height: number) {
    this.canvasWidth = width;
    this.canvasHeight = height;
  }

  process(landmarks: any[], currentTime: number): number {
    if (!landmarks || landmarks.length < 33) {
      return this.reps.length;
    }

    try {
      // Get foot landmarks for horizontal position
      const leftAnkle = landmarks[27];
      const rightAnkle = landmarks[28];
      const leftFootIndex = landmarks[31];
      const rightFootIndex = landmarks[32];

      // Calculate average X position of feet
      const keypointsX = [
        leftAnkle.x * this.canvasWidth,
        rightAnkle.x * this.canvasWidth,
        leftFootIndex.x * this.canvasWidth,
        rightFootIndex.x * this.canvasWidth
      ];
      const currentX = keypointsX.reduce((a, b) => a + b, 0) / keypointsX.length;

      // Smooth X position
      this.xHistory.push(currentX);
      if (this.xHistory.length > this.SMOOTH_N) {
        this.xHistory.shift();
      }
      const smoothedX = this.xHistory.reduce((a, b) => a + b, 0) / this.xHistory.length;

      // Detect direction
      if (this.lastX !== null) {
        const delta = smoothedX - this.lastX;
        if (delta > this.THRESHOLD_PIX) {
          this.dirHistory.push('forward');
        } else if (delta < -this.THRESHOLD_PIX) {
          this.dirHistory.push('backward');
        }

        // Keep only recent direction history
        if (this.dirHistory.length > this.DIR_FRAMES) {
          this.dirHistory.shift();
        }
      }
      this.lastX = smoothedX;

      // Confirm direction change
      if (this.dirHistory.length === this.DIR_FRAMES) {
        const allSame = this.dirHistory.every(d => d === this.dirHistory[0]);
        
        if (allSame) {
          const confirmedDir = this.dirHistory[0];
          
          if (this.startX === null) {
            // First movement detected
            this.startX = smoothedX;
            this.direction = confirmedDir;
            this.status = confirmedDir === 'forward' ? 'Running Forward' : 'Running Backward';
          } else if (this.direction !== confirmedDir) {
            // Direction changed - lap completed
            const distanceM = Math.abs(smoothedX - this.startX) * this.PIXEL_TO_M;
            
            this.direction = confirmedDir;
            
            if (confirmedDir === 'backward') {
              // Completed a forward lap, now returning
              const formIssues: string[] = [];
              let correct = true;

              if (distanceM < 5) {
                formIssues.push('Distance too short');
                correct = false;
              }

              const rep: RepDetail = {
                count: this.reps.length + 1,
                timeSec: currentTime,
                direction: 'Returning',
                distanceM: Math.round(distanceM * 100) / 100,
                correct: correct,
                formIssues: formIssues
              };

              this.reps.push(rep);
              this.status = 'Returning';
            } else {
              this.status = 'Running Forward';
            }
          }
        }
      }

    } catch (error) {
      console.error('Shuttle run detection error:', error);
    }

    return this.reps.length;
  }

  getCurrentMetrics(): CurrentMetrics {
    const currentDistance = this.startX !== null && this.lastX !== null
      ? Math.abs(this.lastX - this.startX) * this.PIXEL_TO_M
      : 0;

    return {
      repCount: this.reps.length,
      status: this.status,
      direction: this.direction || 'None',
      distanceM: Math.round(currentDistance * 100) / 100
    };
  }

  getReps(): RepDetail[] {
    return this.reps;
  }

  reset() {
    this.reps = [];
    this.xHistory = [];
    this.dirHistory = [];
    this.startX = null;
    this.lastX = null;
    this.direction = null;
    this.status = 'Waiting';
  }
}

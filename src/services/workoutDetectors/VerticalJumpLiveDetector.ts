// Vertical Jump Live Detector - Real-time jump height measurement
// Based on hip position tracking

interface RepDetail {
  count: number;
  jumpHeightPx: number;
  jumpHeightCm: number;
  timeSec: number;
  correct: boolean;
  formIssues: string[];
}

interface CurrentMetrics {
  repCount: number;
  state: string;
  currentHeight: number;
  maxHeight: number;
}

export class VerticalJumpLiveDetector {
  private reps: RepDetail[] = [];
  private baselineY: number | null = null;
  private inAir: boolean = false;
  private peakY: number | null = null;
  private hipHistory: number[] = [];
  private readonly SMOOTH_N = 3;
  private readonly PIXEL_TO_CM = 0.26; // Approximate conversion
  private readonly JUMP_THRESHOLD = 20; // pixels
  private readonly LANDING_THRESHOLD = 5; // pixels
  private canvasWidth: number = 640;
  private canvasHeight: number = 480;
  private maxJumpHeight: number = 0;

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
      // Get hip landmarks
      const leftHip = landmarks[23];
      const rightHip = landmarks[24];

      // Calculate mid-hip Y position
      const midHipY = ((leftHip.y + rightHip.y) / 2) * this.canvasHeight;

      // Smooth hip position
      this.hipHistory.push(midHipY);
      if (this.hipHistory.length > this.SMOOTH_N) {
        this.hipHistory.shift();
      }
      const hipSmoothed = this.hipHistory.reduce((a, b) => a + b, 0) / this.hipHistory.length;

      // Set baseline (standing position)
      if (this.baselineY === null) {
        this.baselineY = hipSmoothed;
      }

      // Jump detection
      if (!this.inAir && hipSmoothed < this.baselineY - this.JUMP_THRESHOLD) {
        // Takeoff detected
        this.inAir = true;
        this.peakY = hipSmoothed;
      } else if (this.inAir) {
        // Track peak height
        if (hipSmoothed < this.peakY!) {
          this.peakY = hipSmoothed;
        }
        
        // Landing detected
        if (hipSmoothed >= this.baselineY - this.LANDING_THRESHOLD) {
          this.inAir = false;
          
          const jumpHeightPx = this.baselineY - this.peakY!;
          const jumpHeightCm = jumpHeightPx * this.PIXEL_TO_CM;

          // Update max height
          if (jumpHeightCm > this.maxJumpHeight) {
            this.maxJumpHeight = jumpHeightCm;
          }

          const formIssues: string[] = [];
          let correct = true;

          // Check form
          if (jumpHeightCm < 5) {
            formIssues.push('Jump too low');
            correct = false;
          }

          const rep: RepDetail = {
            count: this.reps.length + 1,
            jumpHeightPx: Math.round(jumpHeightPx * 100) / 100,
            jumpHeightCm: Math.round(jumpHeightCm * 100) / 100,
            timeSec: currentTime,
            correct: correct,
            formIssues: formIssues
          };

          this.reps.push(rep);
          this.peakY = null;
        }
      }

    } catch (error) {
      console.error('Vertical jump detection error:', error);
    }

    return this.reps.length;
  }

  getCurrentMetrics(): CurrentMetrics {
    const currentHeight = this.baselineY && this.hipHistory.length > 0
      ? Math.max(0, this.baselineY - this.hipHistory[this.hipHistory.length - 1])
      : 0;

    return {
      repCount: this.reps.length,
      state: this.inAir ? 'In Air' : 'On Ground',
      currentHeight: Math.round(currentHeight * this.PIXEL_TO_CM * 100) / 100,
      maxHeight: this.maxJumpHeight
    };
  }

  getReps(): RepDetail[] {
    return this.reps;
  }

  reset() {
    this.reps = [];
    this.baselineY = null;
    this.inAir = false;
    this.peakY = null;
    this.hipHistory = [];
    this.maxJumpHeight = 0;
  }
}

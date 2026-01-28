// Sit & Reach Live Detector - Real-time flexibility measurement
// Based on hand-to-foot distance tracking

interface RepDetail {
  count: number;
  reachPx: number;
  reachCm: number;
  timeSec: number;
  correct: boolean;
  formIssues: string[];
}

interface CurrentMetrics {
  repCount: number;
  currentReachCm: number;
  maxReachCm: number;
}

export class SitReachLiveDetector {
  private reps: RepDetail[] = [];
  private reachHistory: number[] = [];
  private maxReachPx: number = 0;
  private lastReachPx: number = 0;
  private readonly SMOOTH_N = 5;
  private readonly PIXEL_TO_CM = 0.26;
  private readonly MIN_REACH_CHANGE = 10; // pixels - to count as a new reach attempt
  private canvasWidth: number = 640;
  private canvasHeight: number = 480;
  private isReaching: boolean = false;

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
      // Get foot landmarks (average position)
      const leftFoot = landmarks[31]; // LEFT_FOOT_INDEX
      const rightFoot = landmarks[32]; // RIGHT_FOOT_INDEX
      const footX = ((leftFoot.x + rightFoot.x) / 2) * this.canvasWidth;

      // Get hand landmarks (average position)
      const leftHand = landmarks[15]; // LEFT_WRIST
      const rightHand = landmarks[16]; // RIGHT_WRIST
      const handX = ((leftHand.x + rightHand.x) / 2) * this.canvasWidth;

      // Calculate forward reach distance
      const reachPx = handX - footX;

      // Smooth reach measurement
      this.reachHistory.push(reachPx);
      if (this.reachHistory.length > this.SMOOTH_N) {
        this.reachHistory.shift();
      }
      const reachSmoothed = this.reachHistory.reduce((a, b) => a + b, 0) / this.reachHistory.length;

      // Update max reach
      if (reachSmoothed > this.maxReachPx) {
        this.maxReachPx = reachSmoothed;
      }

      // Detect reach attempts (when user extends forward significantly)
      if (!this.isReaching && reachSmoothed > this.lastReachPx + this.MIN_REACH_CHANGE) {
        this.isReaching = true;
      } else if (this.isReaching && reachSmoothed < this.lastReachPx - this.MIN_REACH_CHANGE) {
        // Completed a reach attempt
        this.isReaching = false;
        
        const reachCm = this.maxReachPx * this.PIXEL_TO_CM;
        
        const formIssues: string[] = [];
        let correct = true;

        // Check form
        if (reachCm < 10) {
          formIssues.push('Reach too short');
          correct = false;
        }

        const rep: RepDetail = {
          count: this.reps.length + 1,
          reachPx: Math.round(this.maxReachPx * 100) / 100,
          reachCm: Math.round(reachCm * 100) / 100,
          timeSec: currentTime,
          correct: correct,
          formIssues: formIssues
        };

        this.reps.push(rep);
        
        // Reset max for next attempt
        this.maxReachPx = reachSmoothed;
      }

      this.lastReachPx = reachSmoothed;

    } catch (error) {
      console.error('Sit & reach detection error:', error);
    }

    return this.reps.length;
  }

  getCurrentMetrics(): CurrentMetrics {
    const currentReach = this.reachHistory.length > 0
      ? this.reachHistory[this.reachHistory.length - 1]
      : 0;

    return {
      repCount: this.reps.length,
      currentReachCm: Math.round(currentReach * this.PIXEL_TO_CM * 100) / 100,
      maxReachCm: Math.round(this.maxReachPx * this.PIXEL_TO_CM * 100) / 100
    };
  }

  getReps(): RepDetail[] {
    return this.reps;
  }

  reset() {
    this.reps = [];
    this.reachHistory = [];
    this.maxReachPx = 0;
    this.lastReachPx = 0;
    this.isReaching = false;
  }
}

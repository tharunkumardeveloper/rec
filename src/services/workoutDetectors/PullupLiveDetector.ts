// Pull-up Live Detector - Real-time pull-up counting and form analysis
// Based on elbow angle and head position tracking

interface RepDetail {
  count: number;
  upTime: number;
  downTime: number;
  dipDuration: number;
  minElbowAngle: number;
  correct: boolean;
  formIssues: string[];
}

interface CurrentMetrics {
  repCount: number;
  state: string;
  elbowAngle: number;
  headPosition: string;
}

export class PullupLiveDetector {
  private reps: RepDetail[] = [];
  private state: 'waiting' | 'up' | 'down' = 'waiting';
  private inDip: boolean = false;
  private dipStartTime: number = 0;
  private initialHeadY: number | null = null;
  private angleHistory: number[] = [];
  private readonly SMOOTH_N = 3;
  private readonly TOP_ANGLE = 70; // Chin over bar
  private readonly BOTTOM_ANGLE = 160; // Full extension
  private readonly MIN_DIP_DURATION = 0.1; // seconds
  private canvasWidth: number = 640;
  private canvasHeight: number = 480;

  constructor() {
    this.reset();
  }

  setDimensions(width: number, height: number) {
    this.canvasWidth = width;
    this.canvasHeight = height;
  }

  private calculateAngle(a: [number, number], b: [number, number], c: [number, number]): number {
    const ba = [a[0] - b[0], a[1] - b[1]];
    const bc = [c[0] - b[0], c[1] - b[1]];
    
    const dotProduct = ba[0] * bc[0] + ba[1] * bc[1];
    const magnitudeBA = Math.sqrt(ba[0] * ba[0] + ba[1] * ba[1]);
    const magnitudeBC = Math.sqrt(bc[0] * bc[0] + bc[1] * bc[1]);
    
    const cosAngle = Math.max(-1, Math.min(1, dotProduct / ((magnitudeBA * magnitudeBC) + 1e-9)));
    return Math.acos(cosAngle) * (180 / Math.PI);
  }

  process(landmarks: any[], currentTime: number): number {
    if (!landmarks || landmarks.length < 33) {
      return this.reps.length;
    }

    try {
      // Get key landmarks
      const nose = landmarks[0];
      const leftShoulder = landmarks[11];
      const leftElbow = landmarks[13];
      const leftWrist = landmarks[15];
      const rightShoulder = landmarks[12];
      const rightElbow = landmarks[14];
      const rightWrist = landmarks[16];

      // Calculate head position
      const headY = nose.y * this.canvasHeight;
      
      if (this.initialHeadY === null) {
        this.initialHeadY = headY;
      }

      // Calculate elbow angles
      const leftElbowAngle = this.calculateAngle(
        [leftShoulder.x * this.canvasWidth, leftShoulder.y * this.canvasHeight],
        [leftElbow.x * this.canvasWidth, leftElbow.y * this.canvasHeight],
        [leftWrist.x * this.canvasWidth, leftWrist.y * this.canvasHeight]
      );

      const rightElbowAngle = this.calculateAngle(
        [rightShoulder.x * this.canvasWidth, rightShoulder.y * this.canvasHeight],
        [rightElbow.x * this.canvasWidth, rightElbow.y * this.canvasHeight],
        [rightWrist.x * this.canvasWidth, rightWrist.y * this.canvasHeight]
      );

      const elbowAngle = (leftElbowAngle + rightElbowAngle) / 2;

      // Smooth angle
      this.angleHistory.push(elbowAngle);
      if (this.angleHistory.length > this.SMOOTH_N) {
        this.angleHistory.shift();
      }
      const smoothedAngle = this.angleHistory.reduce((a, b) => a + b, 0) / this.angleHistory.length;

      // State machine for pull-up detection
      if (this.state === 'waiting' && headY < this.initialHeadY) {
        // Started pulling up
        this.state = 'up';
        this.inDip = true;
        this.dipStartTime = currentTime;
      } else if (this.state === 'up') {
        // Check if returned to bottom (full extension)
        if (smoothedAngle > this.BOTTOM_ANGLE) {
          if (headY >= this.initialHeadY && this.inDip) {
            const dipDuration = currentTime - this.dipStartTime;
            
            if (dipDuration >= this.MIN_DIP_DURATION) {
              // Valid rep completed
              const formIssues: string[] = [];
              let correct = true;

              // Check form
              if (smoothedAngle < this.BOTTOM_ANGLE + 10) {
                formIssues.push('Incomplete extension');
                correct = false;
              }

              const rep: RepDetail = {
                count: this.reps.length + 1,
                upTime: this.dipStartTime,
                downTime: currentTime,
                dipDuration: dipDuration,
                minElbowAngle: smoothedAngle,
                correct: correct,
                formIssues: formIssues
              };

              this.reps.push(rep);
            }

            this.inDip = false;
            this.dipStartTime = 0;
            this.state = 'waiting';
          }
        }
      }

    } catch (error) {
      console.error('Pull-up detection error:', error);
    }

    return this.reps.length;
  }

  getCurrentMetrics(): CurrentMetrics {
    const lastRep = this.reps[this.reps.length - 1];
    return {
      repCount: this.reps.length,
      state: this.state,
      elbowAngle: this.angleHistory.length > 0 
        ? this.angleHistory[this.angleHistory.length - 1] 
        : 0,
      headPosition: this.state === 'up' ? 'Above bar' : 'Below bar'
    };
  }

  getReps(): RepDetail[] {
    return this.reps;
  }

  reset() {
    this.reps = [];
    this.state = 'waiting';
    this.inDip = false;
    this.dipStartTime = 0;
    this.initialHeadY = null;
    this.angleHistory = [];
  }
}

// Sit-up Live Detector - Real-time sit-up counting and form analysis
// Based on torso angle and elbow movement tracking

interface RepDetail {
  count: number;
  downTime: number;
  upTime: number;
  angleChange: number;
  correct: boolean;
  formIssues: string[];
}

interface CurrentMetrics {
  repCount: number;
  state: string;
  elbowAngle: number;
}

export class SitupLiveDetector {
  private reps: RepDetail[] = [];
  private state: 'up' | 'down' = 'up';
  private dipStartTime: number = 0;
  private lastExtremeAngle: number | null = null;
  private angleHistory: number[] = [];
  private readonly SMOOTH_N = 5;
  private readonly MIN_DIP_CHANGE = 15; // Minimum angle change to count as movement
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
      // Get key landmarks for sit-up (shoulders, elbows, wrists)
      const leftShoulder = landmarks[11];
      const leftElbow = landmarks[13];
      const leftWrist = landmarks[15];
      const rightShoulder = landmarks[12];
      const rightElbow = landmarks[14];
      const rightWrist = landmarks[16];

      // Calculate elbow angles (indicates torso position)
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

      // Initialize last extreme angle
      if (this.lastExtremeAngle === null) {
        this.lastExtremeAngle = smoothedAngle;
      }

      // State machine for sit-up detection
      if (this.state === 'up' && this.lastExtremeAngle - smoothedAngle >= this.MIN_DIP_CHANGE) {
        // Going down
        this.state = 'down';
        this.dipStartTime = currentTime;
        this.lastExtremeAngle = smoothedAngle;
      } else if (this.state === 'down' && smoothedAngle - this.lastExtremeAngle >= this.MIN_DIP_CHANGE) {
        // Coming back up - rep completed
        const angleChange = smoothedAngle - this.lastExtremeAngle;
        
        const formIssues: string[] = [];
        let correct = true;

        // Check form
        if (angleChange < this.MIN_DIP_CHANGE + 5) {
          formIssues.push('Incomplete range of motion');
          correct = false;
        }

        const rep: RepDetail = {
          count: this.reps.length + 1,
          downTime: this.dipStartTime,
          upTime: currentTime,
          angleChange: angleChange,
          correct: correct,
          formIssues: formIssues
        };

        this.reps.push(rep);
        this.state = 'up';
        this.dipStartTime = 0;
        this.lastExtremeAngle = smoothedAngle;
      }

    } catch (error) {
      console.error('Sit-up detection error:', error);
    }

    return this.reps.length;
  }

  getCurrentMetrics(): CurrentMetrics {
    return {
      repCount: this.reps.length,
      state: this.state,
      elbowAngle: this.angleHistory.length > 0 
        ? this.angleHistory[this.angleHistory.length - 1] 
        : 0
    };
  }

  getReps(): RepDetail[] {
    return this.reps;
  }

  reset() {
    this.reps = [];
    this.state = 'up';
    this.dipStartTime = 0;
    this.lastExtremeAngle = null;
    this.angleHistory = [];
  }
}

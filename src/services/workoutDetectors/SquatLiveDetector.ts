// Squat Live Detector - Real-time squat counting and form analysis
// Based on knee angle tracking (hip-knee-ankle)

interface RepDetail {
  count: number;
  timestamp: number;
  leftKneeAngle: number;
  rightKneeAngle: number;
  correct: boolean;
  formIssues: string[];
}

interface CurrentMetrics {
  repCount: number;
  state: string;
  leftKneeAngle: number;
  rightKneeAngle: number;
}

export class SquatLiveDetector {
  private reps: RepDetail[] = [];
  private lastState: number = 9; // 9 = upright, 1 = squatting
  private readonly SQUAT_ANGLE = 105; // Below this is squat range
  private readonly TRANSITION_ANGLE = 150; // Between squat and upright
  private readonly MIN_VISIBILITY = 0.8;
  private canvasWidth: number = 640;
  private canvasHeight: number = 480;

  constructor() {
    this.reset();
  }

  setDimensions(width: number, height: number) {
    this.canvasWidth = width;
    this.canvasHeight = height;
  }

  private calculateAngle(a: any, b: any, c: any): number {
    // Check visibility
    if (a.visibility < this.MIN_VISIBILITY || 
        b.visibility < this.MIN_VISIBILITY || 
        c.visibility < this.MIN_VISIBILITY) {
      return -1;
    }

    // Calculate vectors
    const bc = [c.x - b.x, c.y - b.y, c.z - b.z];
    const ba = [a.x - b.x, a.y - b.y, a.z - b.z];

    // Calculate angle
    const dotProduct = ba[0] * bc[0] + ba[1] * bc[1] + ba[2] * bc[2];
    const magnitudeBA = Math.sqrt(ba[0] * ba[0] + ba[1] * ba[1] + ba[2] * ba[2]);
    const magnitudeBC = Math.sqrt(bc[0] * bc[0] + bc[1] * bc[1] + bc[2] * bc[2]);

    const cosAngle = Math.max(-1, Math.min(1, dotProduct / (magnitudeBA * magnitudeBC)));
    let angle = Math.acos(cosAngle) * (180 / Math.PI);

    if (angle > 180) {
      angle = 360 - angle;
    }

    return angle;
  }

  private getLegState(angle: number): number {
    if (angle < 0) {
      return 0; // Joint not detected
    } else if (angle < this.SQUAT_ANGLE) {
      return 1; // Squat range
    } else if (angle < this.TRANSITION_ANGLE) {
      return 2; // Transition range
    } else {
      return 3; // Upright range
    }
  }

  process(landmarks: any[], currentTime: number): number {
    if (!landmarks || landmarks.length < 33) {
      return this.reps.length;
    }

    try {
      // Get key landmarks for squat (hip-knee-ankle)
      // Right leg: hip(24), knee(26), ankle(28)
      // Left leg: hip(23), knee(25), ankle(27)
      const rightHip = landmarks[24];
      const rightKnee = landmarks[26];
      const rightAnkle = landmarks[28];
      const leftHip = landmarks[23];
      const leftKnee = landmarks[25];
      const leftAnkle = landmarks[27];

      // Calculate knee angles
      const rightAngle = this.calculateAngle(rightHip, rightKnee, rightAnkle);
      const leftAngle = this.calculateAngle(leftHip, leftKnee, leftAnkle);

      // Get leg states
      const rightState = this.getLegState(rightAngle);
      const leftState = this.getLegState(leftAngle);

      // Combined state (product of both leg states)
      // 0 -> One or both legs not detected
      // Even -> One or both legs transitioning
      // Odd:
      //   1 -> Squatting
      //   9 -> Upright
      //   3 -> One squatting, one upright (bad form)
      const state = rightState * leftState;

      const formIssues: string[] = [];

      // Check for detection issues
      if (state === 0) {
        if (rightState === 0) formIssues.push('Right leg not detected');
        if (leftState === 0) formIssues.push('Left leg not detected');
      }
      // Check for asymmetry
      else if (rightState !== leftState) {
        formIssues.push('Uneven squat - both legs should move together');
      }
      // Valid state change (1 or 9)
      else if (state === 1 || state === 9) {
        if (this.lastState !== state) {
          // State changed
          if (state === 1) {
            // Completed squat (went down)
            const correct = formIssues.length === 0 && 
                          rightAngle > 0 && leftAngle > 0 &&
                          rightAngle < this.SQUAT_ANGLE && 
                          leftAngle < this.SQUAT_ANGLE;

            const rep: RepDetail = {
              count: this.reps.length + 1,
              timestamp: currentTime,
              leftKneeAngle: Math.round(leftAngle),
              rightKneeAngle: Math.round(rightAngle),
              correct: correct,
              formIssues: formIssues
            };

            this.reps.push(rep);
          }
          this.lastState = state;
        }
      }
      // Transitioning - provide form feedback
      else if (state % 2 === 0) {
        if (this.lastState === 1) {
          // Coming up from squat
          if (leftState === 2 || leftState === 1) {
            formIssues.push('Fully extend left leg');
          }
          if (rightState === 2 || rightState === 1) {
            formIssues.push('Fully extend right leg');
          }
        } else {
          // Going down into squat
          if (leftState === 2 || leftState === 3) {
            formIssues.push('Go deeper with left leg');
          }
          if (rightState === 2 || rightState === 3) {
            formIssues.push('Go deeper with right leg');
          }
        }
      }

    } catch (error) {
      console.error('Squat detection error:', error);
    }

    return this.reps.length;
  }

  getCurrentMetrics(): CurrentMetrics {
    const lastRep = this.reps[this.reps.length - 1];
    
    return {
      repCount: this.reps.length,
      state: this.lastState === 1 ? 'Squatting' : this.lastState === 9 ? 'Upright' : 'Transitioning',
      leftKneeAngle: lastRep?.leftKneeAngle || 0,
      rightKneeAngle: lastRep?.rightKneeAngle || 0
    };
  }

  getReps(): RepDetail[] {
    return this.reps;
  }

  reset() {
    this.reps = [];
    this.lastState = 9; // Start in upright position
  }
}

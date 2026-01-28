// Push-up detector matching Python live analysis logic
export interface PushupRepData {
  rep: number;
  duration: number;
  minElbow: number;
  plankAngle: number;
  chestDepth: number;
  correct: boolean;
  timestamp: number;
}

export class PushupLiveDetector {
  // Thresholds (matching Python)
  private readonly DOWN_ANGLE = 75;
  private readonly UP_ANGLE = 110;
  private readonly PLANK_MIN_ANGLE = 165;
  private readonly CHEST_DEPTH_MIN = 40;
  private readonly MIN_DIP_DURATION = 0.2;
  private readonly SMOOTH_N = 3;

  // State
  private angleHistory: number[] = [];
  private state: 'up' | 'down' = 'up';
  private inDip = false;
  private dipStartTime: number | null = null;
  private currentDipMinAngle = 180;
  private reps: PushupRepData[] = [];

  // Current metrics for display
  private currentElbowAngle = 0;
  private currentPlankAngle = 0;
  private currentChestDepth = 0;

  calculateAngle(a: [number, number], b: [number, number], c: [number, number]): number {
    const ba = [a[0] - b[0], a[1] - b[1]];
    const bc = [c[0] - b[0], c[1] - b[1]];
    
    const dotProduct = ba[0] * bc[0] + ba[1] * bc[1];
    const magnitudeBA = Math.sqrt(ba[0] * ba[0] + ba[1] * ba[1]);
    const magnitudeBC = Math.sqrt(bc[0] * bc[0] + bc[1] * bc[1]);
    
    const cosAngle = Math.max(-1, Math.min(1, dotProduct / ((magnitudeBA * magnitudeBC) + 1e-9)));
    return Math.acos(cosAngle) * (180 / Math.PI);
  }

  process(landmarks: any[], currentTime: number): PushupRepData[] {
    if (!landmarks || landmarks.length < 33) return this.reps;

    try {
      // Get landmark positions
      const leftShoulder = [landmarks[11].x, landmarks[11].y] as [number, number];
      const leftElbow = [landmarks[13].x, landmarks[13].y] as [number, number];
      const leftWrist = [landmarks[15].x, landmarks[15].y] as [number, number];
      
      const rightShoulder = [landmarks[12].x, landmarks[12].y] as [number, number];
      const rightElbow = [landmarks[14].x, landmarks[14].y] as [number, number];
      const rightWrist = [landmarks[16].x, landmarks[16].y] as [number, number];
      
      const leftHip = [landmarks[23].x, landmarks[23].y] as [number, number];
      const leftAnkle = [landmarks[27].x, landmarks[27].y] as [number, number];

      // Calculate angles
      const angLeft = this.calculateAngle(leftShoulder, leftElbow, leftWrist);
      const angRight = this.calculateAngle(rightShoulder, rightElbow, rightWrist);
      const elbowAngle = (angLeft + angRight) / 2;

      const plankAngle = this.calculateAngle(leftShoulder, leftHip, leftAnkle);
      const chestDepth = Math.abs(leftWrist[1] - leftShoulder[1]) * 1000; // Scale for visibility

      // Store current metrics
      this.currentElbowAngle = elbowAngle;
      this.currentPlankAngle = plankAngle;
      this.currentChestDepth = chestDepth;

      // Smooth elbow angle
      this.angleHistory.push(elbowAngle);
      if (this.angleHistory.length > this.SMOOTH_N) {
        this.angleHistory.shift();
      }
      const elbowSmooth = this.angleHistory.reduce((a, b) => a + b, 0) / this.angleHistory.length;

      // Rep detection logic
      if (this.state === 'up' && elbowSmooth <= this.DOWN_ANGLE) {
        this.state = 'down';
        this.inDip = true;
        this.dipStartTime = currentTime;
        this.currentDipMinAngle = elbowSmooth;
      } else if (this.state === 'down' && elbowSmooth >= this.UP_ANGLE) {
        this.state = 'up';
        
        if (this.inDip && this.dipStartTime !== null) {
          const dipDuration = currentTime - this.dipStartTime;

          const isCorrect = (
            this.currentDipMinAngle <= this.DOWN_ANGLE &&
            dipDuration >= this.MIN_DIP_DURATION &&
            plankAngle >= this.PLANK_MIN_ANGLE &&
            chestDepth >= this.CHEST_DEPTH_MIN
          );

          this.reps.push({
            rep: this.reps.length + 1,
            duration: parseFloat(dipDuration.toFixed(3)),
            minElbow: parseFloat(this.currentDipMinAngle.toFixed(2)),
            plankAngle: parseFloat(plankAngle.toFixed(2)),
            chestDepth: parseFloat(chestDepth.toFixed(2)),
            correct: isCorrect,
            timestamp: currentTime
          });

          this.inDip = false;
          this.dipStartTime = null;
          this.currentDipMinAngle = 180;
        }
      }

      if (this.inDip) {
        this.currentDipMinAngle = Math.min(this.currentDipMinAngle, elbowSmooth);
      }

    } catch (error) {
      console.error('Push-up detection error:', error);
    }

    return this.reps;
  }

  getReps(): PushupRepData[] {
    return this.reps;
  }

  getState(): 'up' | 'down' {
    return this.state;
  }

  getCurrentMetrics() {
    return {
      elbowAngle: Math.round(this.currentElbowAngle),
      plankAngle: Math.round(this.currentPlankAngle),
      chestDepth: Math.round(this.currentChestDepth),
      state: this.state,
      elbowOk: this.currentElbowAngle <= this.DOWN_ANGLE,
      plankOk: this.currentPlankAngle >= this.PLANK_MIN_ANGLE,
      chestOk: this.currentChestDepth >= this.CHEST_DEPTH_MIN
    };
  }

  reset() {
    this.angleHistory = [];
    this.state = 'up';
    this.inDip = false;
    this.dipStartTime = null;
    this.currentDipMinAngle = 180;
    this.reps = [];
    this.currentElbowAngle = 0;
    this.currentPlankAngle = 0;
    this.currentChestDepth = 0;
  }
}

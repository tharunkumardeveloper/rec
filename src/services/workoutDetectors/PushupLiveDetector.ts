// Push-up detector matching Python live analysis logic exactly
export interface PushupRepData {
  rep: number;
  duration: number;
  min_elbow: number;
  plank_angle: number;
  chest_depth: number;
  correct: boolean;
}

export class PushupLiveDetector {
  // Thresholds (matching Python exactly)
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
  private currentElbowSmooth = 0;
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

  process(landmarks: any[], currentTime: number): number {
    if (!landmarks || landmarks.length < 33) {
      return this.reps.length;
    }

    try {
      // Get landmark positions (normalized 0-1)
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
      
      // Chest depth: difference in Y coordinate (wrist - shoulder)
      const chestDepth = Math.abs(leftWrist[1] - leftShoulder[1]) * 1000; // Scale for visibility

      // Store current metrics
      this.currentElbowAngle = elbowAngle;
      this.currentPlankAngle = plankAngle;
      this.currentChestDepth = chestDepth;

      // Smooth elbow angle (matching Python deque behavior)
      this.angleHistory.push(elbowAngle);
      if (this.angleHistory.length > this.SMOOTH_N) {
        this.angleHistory.shift();
      }
      const elbowSmooth = this.angleHistory.reduce((a, b) => a + b, 0) / this.angleHistory.length;
      this.currentElbowSmooth = elbowSmooth;

      // Log every 30 frames (about once per second at 30fps)
      if (Math.random() < 0.033) {
        console.log(`📊 Elbow: ${Math.round(elbowSmooth)}° | State: ${this.state} | Reps: ${this.reps.length} | Down<=${this.DOWN_ANGLE} | Up>=${this.UP_ANGLE}`);
      }

      // Rep detection logic (exactly matching Python)
      if (this.state === 'up' && elbowSmooth <= this.DOWN_ANGLE) {
        console.log('🔽 Going DOWN - Elbow:', Math.round(elbowSmooth), '<=', this.DOWN_ANGLE);
        this.state = 'down';
        this.inDip = true;
        this.dipStartTime = currentTime;
        this.currentDipMinAngle = elbowSmooth;
      } else if (this.state === 'down' && elbowSmooth >= this.UP_ANGLE) {
        console.log('🔼 Going UP - Elbow:', Math.round(elbowSmooth), '>=', this.UP_ANGLE);
        this.state = 'up';
        
        if (this.inDip && this.dipStartTime !== null) {
          const dipDuration = currentTime - this.dipStartTime;

          const isCorrect = (
            this.currentDipMinAngle <= this.DOWN_ANGLE &&
            dipDuration >= this.MIN_DIP_DURATION &&
            plankAngle >= this.PLANK_MIN_ANGLE &&
            chestDepth >= this.CHEST_DEPTH_MIN
          );

          console.log('✅ REP COMPLETED!', {
            rep: this.reps.length + 1,
            minElbow: Math.round(this.currentDipMinAngle),
            plankAngle: Math.round(plankAngle),
            chestDepth: Math.round(chestDepth),
            duration: dipDuration.toFixed(2),
            correct: isCorrect,
            checks: {
              elbowOk: this.currentDipMinAngle <= this.DOWN_ANGLE,
              durationOk: dipDuration >= this.MIN_DIP_DURATION,
              plankOk: plankAngle >= this.PLANK_MIN_ANGLE,
              depthOk: chestDepth >= this.CHEST_DEPTH_MIN
            }
          });

          this.reps.push({
            rep: this.reps.length + 1,
            duration: parseFloat(dipDuration.toFixed(3)),
            min_elbow: parseFloat(this.currentDipMinAngle.toFixed(2)),
            plank_angle: parseFloat(plankAngle.toFixed(2)),
            chest_depth: parseFloat(chestDepth.toFixed(2)),
            correct: isCorrect
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

    return this.reps.length;
  }

  getReps(): PushupRepData[] {
    return this.reps;
  }

  getRepCount(): number {
    return this.reps.length;
  }

  getState(): 'up' | 'down' {
    return this.state;
  }

  getCurrentMetrics() {
    return {
      elbowAngle: Math.round(this.currentElbowSmooth),
      plankAngle: Math.round(this.currentPlankAngle),
      chestDepth: Math.round(this.currentChestDepth),
      state: this.state,
      repCount: this.reps.length
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
    this.currentElbowSmooth = 0;
    this.currentPlankAngle = 0;
    this.currentChestDepth = 0;
  }
}

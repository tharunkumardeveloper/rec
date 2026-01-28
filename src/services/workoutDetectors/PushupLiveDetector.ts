// Push-up detector - EXACT translation of Python pushup_live.py
export interface PushupRepData {
  rep: number;
  duration: number;
  min_elbow: number;
  plank_angle: number;
  chest_depth: number;
  correct: boolean;
}

export class PushupLiveDetector {
  // Thresholds (EXACT from Python)
  private readonly DOWN_ANGLE = 75;
  private readonly UP_ANGLE = 110;
  private readonly PLANK_MIN_ANGLE = 165;
  private readonly CHEST_DEPTH_MIN = 40;
  private readonly MIN_DIP_DURATION = 0.2;
  private readonly SMOOTH_N = 3;

  // State variables (EXACT from Python)
  private angleHistory: number[] = [];
  private state: 'up' | 'down' = 'up';
  private inDip = false;
  private dipStartTime: number | null = null;
  private currentDipMinAngle = 180;
  private reps: PushupRepData[] = [];

  // Current frame metrics (for display)
  private currentElbowAngle: number | null = null;
  private currentElbowSmooth: number | null = null;
  private currentPlankAngle: number | null = null;
  private currentChestDepth: number | null = null;

  // Canvas dimensions (set from video)
  private width = 640;
  private height = 480;

  setDimensions(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  // EXACT angle calculation from Python
  calculateAngle(a: [number, number], b: [number, number], c: [number, number]): number {
    const ba = [a[0] - b[0], a[1] - b[1]];
    const bc = [c[0] - b[0], c[1] - b[1]];
    
    const dotProduct = ba[0] * bc[0] + ba[1] * bc[1];
    const magnitudeBA = Math.sqrt(ba[0] * ba[0] + ba[1] * ba[1]);
    const magnitudeBC = Math.sqrt(bc[0] * bc[0] + bc[1] * bc[1]);
    
    const cosAngle = Math.max(-1, Math.min(1, dotProduct / ((magnitudeBA * magnitudeBC) + 1e-9)));
    return Math.acos(cosAngle) * (180 / Math.PI);
  }

  // EXACT lm_xy from Python: returns (int(lm.x * w), int(lm.y * h))
  lmXY(lm: any): [number, number] {
    return [Math.floor(lm.x * this.width), Math.floor(lm.y * this.height)];
  }

  process(landmarks: any[], currentTime: number): number {
    // Initialize as None (like Python)
    let elbowAngle: number | null = null;
    let plankAngle: number | null = null;
    let chestDepth: number | null = null;

    // EXACT: if results.pose_landmarks:
    if (landmarks && landmarks.length >= 33) {
      try {
        // EXACT: lm = results.pose_landmarks.landmark
        const lm = landmarks;

        // Get pixel coordinates (EXACT like Python)
        const ls = this.lmXY(lm[11]); // LEFT_SHOULDER
        const le = this.lmXY(lm[13]); // LEFT_ELBOW
        const lw = this.lmXY(lm[15]); // LEFT_WRIST

        const rs = this.lmXY(lm[12]); // RIGHT_SHOULDER
        const re = this.lmXY(lm[14]); // RIGHT_ELBOW
        const rw = this.lmXY(lm[16]); // RIGHT_WRIST

        const lh = this.lmXY(lm[23]); // LEFT_HIP
        const la = this.lmXY(lm[27]); // LEFT_ANKLE

        // Calculate angles (EXACT like Python)
        const angL = this.calculateAngle(ls, le, lw);
        const angR = this.calculateAngle(rs, re, rw);
        elbowAngle = (angL + angR) / 2;

        plankAngle = this.calculateAngle(ls, lh, la);
        chestDepth = lw[1] - ls[1]; // EXACT: lw[1] - ls[1]

        // Store for display
        this.currentElbowAngle = elbowAngle;
        this.currentPlankAngle = plankAngle;
        this.currentChestDepth = chestDepth;
        
        // DEBUG: Log calculated values occasionally
        if (Math.random() < 0.02) {
          console.log('🔢 Calculated:', {
            elbowAngle: Math.round(elbowAngle),
            plankAngle: Math.round(plankAngle),
            chestDepth: Math.round(chestDepth),
            ls, le, lw
          });
        }
      } catch (error) {
        // EXACT: except: pass
        console.error('❌ Error calculating angles:', error);
      }
    } else {
      console.warn('⚠️ No landmarks or invalid count:', landmarks?.length);
    }

    // EXACT: if elbow_angle is not None:
    if (elbowAngle !== null) {
      // EXACT: angle_history.append(elbow_angle)
      this.angleHistory.push(elbowAngle);
      
      // EXACT: elbow_sm = sum(angle_history) / len(angle_history)
      const elbowSm = this.angleHistory.reduce((a, b) => a + b, 0) / this.angleHistory.length;
      this.currentElbowSmooth = elbowSm;

      // Keep only last SMOOTH_N values (deque maxlen behavior)
      if (this.angleHistory.length > this.SMOOTH_N) {
        this.angleHistory.shift();
      }

      // EXACT: if state == "up" and elbow_sm <= DOWN_ANGLE:
      if (this.state === 'up' && elbowSm <= this.DOWN_ANGLE) {
        console.log('🔽 DOWN - Elbow:', Math.round(elbowSm));
        this.state = 'down';
        this.inDip = true;
        this.dipStartTime = currentTime;
        this.currentDipMinAngle = elbowSm;
      }
      // EXACT: elif state == "down" and elbow_sm >= UP_ANGLE:
      else if (this.state === 'down' && elbowSm >= this.UP_ANGLE) {
        console.log('🔼 UP - Elbow:', Math.round(elbowSm));
        this.state = 'up';
        
        // EXACT: if in_dip:
        if (this.inDip && this.dipStartTime !== null) {
          const dipDuration = currentTime - this.dipStartTime;

          // EXACT Python condition
          const isCorrect = (
            this.currentDipMinAngle <= this.DOWN_ANGLE &&
            dipDuration >= this.MIN_DIP_DURATION &&
            plankAngle !== null && plankAngle >= this.PLANK_MIN_ANGLE &&
            chestDepth !== null && chestDepth >= this.CHEST_DEPTH_MIN
          );

          console.log('✅ REP!', {
            rep: this.reps.length + 1,
            minElbow: Math.round(this.currentDipMinAngle),
            plank: plankAngle ? Math.round(plankAngle) : 0,
            depth: chestDepth ? Math.round(chestDepth) : 0,
            duration: dipDuration.toFixed(2),
            correct: isCorrect
          });

          this.reps.push({
            rep: this.reps.length + 1,
            duration: Math.round(dipDuration * 1000) / 1000,
            min_elbow: Math.round(this.currentDipMinAngle * 100) / 100,
            plank_angle: plankAngle ? Math.round(plankAngle * 100) / 100 : 0,
            chest_depth: chestDepth ? Math.round(chestDepth * 100) / 100 : 0,
            correct: isCorrect
          });

          this.inDip = false;
          this.dipStartTime = null;
          this.currentDipMinAngle = 180;
        }
      }

      // EXACT: if in_dip:
      if (this.inDip) {
        this.currentDipMinAngle = Math.min(this.currentDipMinAngle, elbowSm);
      }
    } else {
      // DEBUG: Log when elbow angle is null
      if (Math.random() < 0.01) {
        console.warn('⚠️ Elbow angle is null - not processing rep logic');
      }
    }

    return this.reps.length;
  }

  getReps(): PushupRepData[] {
    return this.reps;
  }

  getCurrentMetrics() {
    return {
      elbowAngle: this.currentElbowSmooth ? Math.round(this.currentElbowSmooth) : 0,
      plankAngle: this.currentPlankAngle ? Math.round(this.currentPlankAngle) : 0,
      chestDepth: this.currentChestDepth ? Math.round(this.currentChestDepth) : 0,
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
    this.currentElbowAngle = null;
    this.currentElbowSmooth = null;
    this.currentPlankAngle = null;
    this.currentChestDepth = null;
  }
}

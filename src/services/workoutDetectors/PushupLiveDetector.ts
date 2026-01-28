/**
 * Push-up Live Detector
 * Direct translation from pushup_live.py
 * Uses MediaPipe Pose landmarks to detect and count push-ups
 */

export interface PushupRepData {
  rep: number;
  duration: number;
  min_elbow: number;
  plank_angle: number;
  chest_depth: number;
  correct: boolean;
}

export class PushupLiveDetector {
  // Thresholds from Python
  private readonly DOWN_ANGLE = 75;
  private readonly UP_ANGLE = 110;
  private readonly PLANK_MIN_ANGLE = 165;
  private readonly CHEST_DEPTH_MIN = 40;
  private readonly MIN_DIP_DURATION = 0.2;
  private readonly SMOOTH_N = 3;

  // State variables
  private angleHistory: number[] = [];
  private state: 'up' | 'down' = 'up';
  private inDip = false;
  private dipStartTime: number | null = null;
  private currentDipMinAngle = 180;
  private reps: PushupRepData[] = [];
  
  // Frame counter for timing
  private frameCount = 0;
  private fps = 30;

  // Canvas dimensions
  private width = 640;
  private height = 480;

  // Current frame values for display
  private lastElbowAngle: number | null = null;
  private lastPlankAngle: number | null = null;
  private lastChestDepth: number | null = null;
  private lastElbowSmooth: number | null = null;

  constructor() {
    console.log('🎯 PushupLiveDetector created');
  }

  setDimensions(width: number, height: number) {
    this.width = width;
    this.height = height;
    console.log('📐 Dimensions set:', { width, height });
  }

  setFPS(fps: number) {
    this.fps = fps;
  }

  /**
   * Python: def angle(a, b, c)
   * Calculate angle at point b formed by points a-b-c
   */
  private angle(a: [number, number], b: [number, number], c: [number, number]): number {
    // ba = np.array([a[0]-b[0], a[1]-b[1]])
    const ba = [a[0] - b[0], a[1] - b[1]];
    // bc = np.array([c[0]-b[0], c[1]-b[1]])
    const bc = [c[0] - b[0], c[1] - b[1]];
    
    // np.dot(ba, bc)
    const dotProduct = ba[0] * bc[0] + ba[1] * bc[1];
    
    // np.linalg.norm(ba) * np.linalg.norm(bc)
    const magBA = Math.sqrt(ba[0] * ba[0] + ba[1] * ba[1]);
    const magBC = Math.sqrt(bc[0] * bc[0] + bc[1] * bc[1]);
    
    // np.clip(..., -1.0, 1.0)
    const cosAngle = Math.max(-1.0, Math.min(1.0, dotProduct / ((magBA * magBC) + 1e-9)));
    
    // np.degrees(np.arccos(cosang))
    return (Math.acos(cosAngle) * 180) / Math.PI;
  }

  /**
   * Python: def lm_xy(lm, w, h)
   * Convert normalized landmark to pixel coordinates
   */
  private lmXY(lm: any): [number, number] {
    return [
      Math.floor(lm.x * this.width),
      Math.floor(lm.y * this.height)
    ];
  }

  /**
   * Main processing function - called for each frame
   * Python: Main loop in pushup_live.py
   */
  process(landmarks: any[], currentTime: number): number {
    this.frameCount++;
    
    // Python: elbow_angle = None, plank_angle = None, chest_depth = None
    let elbowAngle: number | null = null;
    let plankAngle: number | null = null;
    let chestDepth: number | null = null;

    // Python: if results.pose_landmarks:
    if (landmarks && landmarks.length >= 33) {
      try {
        // Python: lm = results.pose_landmarks.landmark
        const lm = landmarks;

        // Get landmark pixel coordinates
        // Python: ls = lm_xy(lm[mp_pose.PoseLandmark.LEFT_SHOULDER], width, height)
        const ls = this.lmXY(lm[11]); // LEFT_SHOULDER = 11
        const le = this.lmXY(lm[13]); // LEFT_ELBOW = 13
        const lw = this.lmXY(lm[15]); // LEFT_WRIST = 15

        const rs = this.lmXY(lm[12]); // RIGHT_SHOULDER = 12
        const re = this.lmXY(lm[14]); // RIGHT_ELBOW = 14
        const rw = this.lmXY(lm[16]); // RIGHT_WRIST = 16

        const lh = this.lmXY(lm[23]); // LEFT_HIP = 23
        const la = this.lmXY(lm[27]); // LEFT_ANKLE = 27

        // Python: ang_l = angle(ls, le, lw)
        const angL = this.angle(ls, le, lw);
        const angR = this.angle(rs, re, rw);
        // Python: elbow_angle = (ang_l + ang_r) / 2
        elbowAngle = (angL + angR) / 2;

        // Python: plank_angle = angle(ls, lh, la)
        plankAngle = this.angle(ls, lh, la);
        
        // Python: chest_depth = lw[1] - ls[1]
        chestDepth = lw[1] - ls[1];

        // Store for display
        this.lastElbowAngle = elbowAngle;
        this.lastPlankAngle = plankAngle;
        this.lastChestDepth = chestDepth;

      } catch (error) {
        // Python: except: pass
        console.error('Error in angle calculation:', error);
      }
    }

    // Python: if elbow_angle is not None:
    if (elbowAngle !== null) {
      // Python: angle_history.append(elbow_angle)
      this.angleHistory.push(elbowAngle);
      
      // Python: elbow_sm = sum(angle_history) / len(angle_history)
      const elbowSm = this.angleHistory.reduce((sum, val) => sum + val, 0) / this.angleHistory.length;
      this.lastElbowSmooth = elbowSm;

      // Maintain deque maxlen behavior
      if (this.angleHistory.length > this.SMOOTH_N) {
        this.angleHistory.shift();
      }

      // Python: if state == "up" and elbow_sm <= DOWN_ANGLE:
      if (this.state === 'up' && elbowSm <= this.DOWN_ANGLE) {
        console.log(`🔽 Going DOWN | Elbow: ${Math.round(elbowSm)}° <= ${this.DOWN_ANGLE}°`);
        // Python: state = "down"
        this.state = 'down';
        // Python: in_dip = True
        this.inDip = true;
        // Python: dip_start_time = t
        this.dipStartTime = currentTime;
        // Python: current_dip_min_angle = elbow_sm
        this.currentDipMinAngle = elbowSm;
      }
      // Python: elif state == "down" and elbow_sm >= UP_ANGLE:
      else if (this.state === 'down' && elbowSm >= this.UP_ANGLE) {
        console.log(`🔼 Going UP | Elbow: ${Math.round(elbowSm)}° >= ${this.UP_ANGLE}°`);
        // Python: state = "up"
        this.state = 'up';
        
        // Python: if in_dip:
        if (this.inDip && this.dipStartTime !== null) {
          // Python: dip_duration = t - dip_start_time
          const dipDuration = currentTime - this.dipStartTime;

          // Python: is_correct = (...)
          const isCorrect = (
            this.currentDipMinAngle <= this.DOWN_ANGLE &&
            dipDuration >= this.MIN_DIP_DURATION &&
            plankAngle !== null && plankAngle >= this.PLANK_MIN_ANGLE &&
            chestDepth !== null && chestDepth >= this.CHEST_DEPTH_MIN
          );

          // Python: reps.append({...})
          const repData: PushupRepData = {
            rep: this.reps.length + 1,
            duration: Math.round(dipDuration * 1000) / 1000,
            min_elbow: Math.round(this.currentDipMinAngle * 100) / 100,
            plank_angle: plankAngle !== null ? Math.round(plankAngle * 100) / 100 : 0,
            chest_depth: chestDepth !== null ? Math.round(chestDepth * 100) / 100 : 0,
            correct: isCorrect
          };

          this.reps.push(repData);

          console.log('✅ REP COMPLETED!', {
            rep: repData.rep,
            minElbow: repData.min_elbow,
            plankAngle: repData.plank_angle,
            chestDepth: repData.chest_depth,
            duration: repData.duration,
            correct: isCorrect,
            checks: {
              elbowOk: this.currentDipMinAngle <= this.DOWN_ANGLE,
              durationOk: dipDuration >= this.MIN_DIP_DURATION,
              plankOk: plankAngle !== null && plankAngle >= this.PLANK_MIN_ANGLE,
              depthOk: chestDepth !== null && chestDepth >= this.CHEST_DEPTH_MIN
            }
          });

          // Python: in_dip = False
          this.inDip = false;
          // Python: dip_start_time = None
          this.dipStartTime = null;
          // Python: current_dip_min_angle = 180
          this.currentDipMinAngle = 180;
        }
      }

      // Python: if in_dip:
      if (this.inDip) {
        // Python: current_dip_min_angle = min(current_dip_min_angle, elbow_sm)
        this.currentDipMinAngle = Math.min(this.currentDipMinAngle, elbowSm);
      }
    }

    return this.reps.length;
  }

  /**
   * Get current metrics for HUD display
   */
  getCurrentMetrics() {
    return {
      elbowAngle: this.lastElbowSmooth !== null ? Math.round(this.lastElbowSmooth) : 0,
      plankAngle: this.lastPlankAngle !== null ? Math.round(this.lastPlankAngle) : 0,
      chestDepth: this.lastChestDepth !== null ? Math.round(this.lastChestDepth) : 0,
      state: this.state,
      repCount: this.reps.length
    };
  }

  /**
   * Get all completed reps
   */
  getReps(): PushupRepData[] {
    return this.reps;
  }

  /**
   * Reset detector state
   */
  reset() {
    console.log('🔄 Resetting detector');
    this.angleHistory = [];
    this.state = 'up';
    this.inDip = false;
    this.dipStartTime = null;
    this.currentDipMinAngle = 180;
    this.reps = [];
    this.frameCount = 0;
    this.lastElbowAngle = null;
    this.lastPlankAngle = null;
    this.lastChestDepth = null;
    this.lastElbowSmooth = null;
  }
}

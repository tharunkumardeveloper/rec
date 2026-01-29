/**
 * Squat Live Detector
 * Direct translation from squat_live.py
 * Uses MediaPipe Pose landmarks to detect and count squats based on knee angle
 */

export interface SquatRepData {
  rep: number;
  knee_angle: number;
  correct: boolean;
}

export class SquatLiveDetector {
  // Thresholds from Python
  private readonly GREEN_ANGLE = 120; // knee bent (squat down)
  private readonly SMOOTH_N = 5;

  // State variables
  private angleHistory: number[] = [];
  private prevColor: 'RED' | 'GREEN' = 'RED';
  private reps: SquatRepData[] = [];
  
  // Frame counter
  private frameCount = 0;

  // Canvas dimensions
  private width = 640;
  private height = 480;

  // Current frame values for display
  private lastKneeAngle: number | null = null;
  private lastSmoothAngle: number | null = null;
  private currentColor: 'RED' | 'GREEN' = 'RED';

  constructor() {
    console.log('🎯 SquatLiveDetector created');
  }

  setDimensions(width: number, height: number) {
    this.width = width;
    this.height = height;
    console.log('📐 Dimensions set:', { width, height });
  }

  /**
   * Python: def angle(a, b, c)
   * Calculate angle at point b formed by points a-b-c
   */
  private angle(a: [number, number], b: [number, number], c: [number, number]): number {
    const ba = [a[0] - b[0], a[1] - b[1]];
    const bc = [c[0] - b[0], c[1] - b[1]];
    
    const dotProduct = ba[0] * bc[0] + ba[1] * bc[1];
    const magBA = Math.sqrt(ba[0] * ba[0] + ba[1] * ba[1]);
    const magBC = Math.sqrt(bc[0] * bc[0] + bc[1] * bc[1]);
    
    const cosAngle = Math.max(-1.0, Math.min(1.0, dotProduct / ((magBA * magBC) + 1e-9)));
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
   * Python: Main loop in squat_live.py
   */
  process(landmarks: any[], currentTime: number): number {
    this.frameCount++;
    
    // DEBUG: Print landmark structure once
    if (this.frameCount === 1) {
      console.log('🔍 Squat Landmark structure:', {
        isArray: Array.isArray(landmarks),
        length: landmarks?.length,
        sample: landmarks?.[23]
      });
    }
    
    let kneeAngle: number | null = null;
    let smoothAngle: number | null = null;
    let currColor: 'RED' | 'GREEN' = this.prevColor;

    // Python: if result.pose_landmarks:
    if (landmarks && landmarks.length >= 33) {
      try {
        // Python: lm = result.pose_landmarks.landmark
        const lm = landmarks;

        // Get landmark pixel coordinates
        // Python: hip = lm_xy(lm[mp_pose.PoseLandmark.LEFT_HIP], width, height)
        const hip = this.lmXY(lm[23]); // LEFT_HIP = 23
        const knee = this.lmXY(lm[25]); // LEFT_KNEE = 25
        const ankle = this.lmXY(lm[27]); // LEFT_ANKLE = 27

        // DEBUG: Print coordinates once
        if (this.frameCount === 1) {
          console.log('🔍 Squat coordinates:', { hip, knee, ankle });
        }

        // Python: knee_angle = angle(hip, knee, ankle)
        kneeAngle = this.angle(hip, knee, ankle);
        
        // Python: angle_hist.append(knee_angle)
        this.angleHistory.push(kneeAngle);
        
        // Maintain deque maxlen behavior
        if (this.angleHistory.length > this.SMOOTH_N) {
          this.angleHistory.shift();
        }
        
        // Python: smooth_angle = sum(angle_hist) / len(angle_hist)
        smoothAngle = this.angleHistory.reduce((sum, val) => sum + val, 0) / this.angleHistory.length;

        // Store for display
        this.lastKneeAngle = kneeAngle;
        this.lastSmoothAngle = smoothAngle;

        // Python: curr_color = "GREEN" if smooth_angle <= GREEN_ANGLE else "RED"
        currColor = smoothAngle <= this.GREEN_ANGLE ? 'GREEN' : 'RED';
        this.currentColor = currColor;

        // DEBUG: Print angles occasionally
        if (this.frameCount % 30 === 0) {
          console.log(`📊 Knee: ${Math.round(smoothAngle)}° | Color: ${currColor} | Reps: ${this.reps.length}`);
        }

        // Python: if prev_color == "RED" and curr_color == "GREEN":
        if (this.prevColor === 'RED' && currColor === 'GREEN') {
          console.log(`✅ SQUAT REP COMPLETED! Angle: ${Math.round(smoothAngle)}°`);
          
          // Python: reps.append({...})
          const repData: SquatRepData = {
            rep: this.reps.length + 1,
            knee_angle: Math.round(smoothAngle * 100) / 100,
            correct: true // All reps counted are considered correct in Python version
          };

          this.reps.push(repData);
        }

        // Python: prev_color = curr_color
        this.prevColor = currColor;

      } catch (error) {
        console.error('❌ Error in squat angle calculation:', error);
      }
    } else {
      // DEBUG: Log when landmarks not available
      if (this.frameCount % 30 === 0) {
        console.warn('⚠️ Squat landmarks not available');
      }
    }

    return this.reps.length;
  }

  /**
   * Get current metrics for HUD display
   */
  getCurrentMetrics() {
    return {
      kneeAngle: this.lastSmoothAngle !== null ? Math.round(this.lastSmoothAngle) : 0,
      state: this.currentColor,
      repCount: this.reps.length
    };
  }

  /**
   * Get all completed reps
   */
  getReps(): SquatRepData[] {
    return this.reps;
  }

  /**
   * Reset detector state
   */
  reset() {
    console.log('🔄 Resetting squat detector');
    this.angleHistory = [];
    this.prevColor = 'RED';
    this.reps = [];
    this.frameCount = 0;
    this.lastKneeAngle = null;
    this.lastSmoothAngle = null;
    this.currentColor = 'RED';
  }
}

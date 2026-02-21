/**
 * Sit-up Live Detector
 * Direct translation from situp_live.py
 * Uses MediaPipe Pose landmarks to detect and count sit-ups based on torso angle
 */

export interface SitupRepData {
  rep: number;
  angle: number;
  correct: boolean;
}

export class SitupLiveDetector {
  // Thresholds from Python
  private readonly GREEN_ANGLE = 110; // sitting up (liberal)
  private readonly SMOOTH_N = 5;

  // State variables
  private angleHistory: number[] = [];
  private prevColor: 'RED' | 'GREEN' = 'RED';
  private reps: SitupRepData[] = [];
  
  // Frame counter
  private frameCount = 0;

  // Canvas dimensions
  private width = 640;
  private height = 480;

  // Current frame values for display
  private lastTorsoAngle: number | null = null;
  private lastSmoothAngle: number | null = null;
  private currentColor: 'RED' | 'GREEN' = 'RED';

  constructor() {
    console.log('🎯 SitupLiveDetector created');
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
   * Python: Main loop in situp_live.py
   */
  process(landmarks: any[], currentTime: number): number {
    this.frameCount++;
    
    // DEBUG: Print landmark structure once
    if (this.frameCount === 1) {
      console.log('🔍 Situp Landmark structure:', {
        isArray: Array.isArray(landmarks),
        length: landmarks?.length,
        sample: landmarks?.[11]
      });
    }
    
    let torsoAngle: number | null = null;
    let smoothAngle: number | null = null;
    let currColor: 'RED' | 'GREEN' = this.prevColor;

    // Python: if result.pose_landmarks:
    if (landmarks && landmarks.length >= 33) {
      try {
        // Python: lm = result.pose_landmarks.landmark
        const lm = landmarks;

        // Get landmark pixel coordinates
        // Python: shoulder = lm_xy(lm[mp_pose.PoseLandmark.LEFT_SHOULDER], width, height)
        const shoulder = this.lmXY(lm[11]); // LEFT_SHOULDER = 11
        const hip = this.lmXY(lm[23]); // LEFT_HIP = 23
        const knee = this.lmXY(lm[25]); // LEFT_KNEE = 25

        // DEBUG: Print coordinates once
        if (this.frameCount === 1) {
          console.log('🔍 Situp coordinates:', { shoulder, hip, knee });
        }

        // Python: torso_angle = angle(shoulder, hip, knee)
        torsoAngle = this.angle(shoulder, hip, knee);
        
        // Python: angle_hist.append(torso_angle)
        this.angleHistory.push(torsoAngle);
        
        // Maintain deque maxlen behavior
        if (this.angleHistory.length > this.SMOOTH_N) {
          this.angleHistory.shift();
        }
        
        // Python: smooth_angle = sum(angle_hist) / len(angle_hist)
        smoothAngle = this.angleHistory.reduce((sum, val) => sum + val, 0) / this.angleHistory.length;

        // Store for display
        this.lastTorsoAngle = torsoAngle;
        this.lastSmoothAngle = smoothAngle;

        // Python: curr_color = "GREEN" if smooth_angle <= GREEN_ANGLE else "RED"
        currColor = smoothAngle <= this.GREEN_ANGLE ? 'GREEN' : 'RED';
        this.currentColor = currColor;

        // DEBUG: Print angles occasionally
        if (this.frameCount % 30 === 0) {
          console.log(`📊 Torso: ${Math.round(smoothAngle)}° | Color: ${currColor} | Reps: ${this.reps.length}`);
        }

        // Python: if prev_color == "RED" and curr_color == "GREEN":
        if (this.prevColor === 'RED' && currColor === 'GREEN') {
          console.log(`✅ REP COMPLETED! Angle: ${Math.round(smoothAngle)}°`);
          
          // Python: reps.append({...})
          const repData: SitupRepData = {
            rep: this.reps.length + 1,
            angle: Math.round(smoothAngle * 100) / 100,
            correct: true // All reps counted are considered correct in Python version
          };

          this.reps.push(repData);
        }

        // Python: prev_color = curr_color
        this.prevColor = currColor;

      } catch (error) {
        console.error('❌ Error in situp angle calculation:', error);
      }
    } else {
      // DEBUG: Log when landmarks not available
      if (this.frameCount % 30 === 0) {
        console.warn('⚠️ Situp landmarks not available');
      }
    }

    return this.reps.length;
  }

  /**
   * Get current metrics for HUD display
   */
  getCurrentMetrics() {
    return {
      torsoAngle: this.lastSmoothAngle !== null ? Math.round(this.lastSmoothAngle) : 0,
      state: this.currentColor,
      repCount: this.reps.length
    };
  }

  /**
   * Get all completed reps
   */
  getReps(): SitupRepData[] {
    return this.reps;
  }

  /**
   * Reset detector state
   */
  reset() {
    console.log('🔄 Resetting situp detector');
    this.angleHistory = [];
    this.prevColor = 'RED';
    this.reps = [];
    this.frameCount = 0;
    this.lastTorsoAngle = null;
    this.lastSmoothAngle = null;
    this.currentColor = 'RED';
  }
}

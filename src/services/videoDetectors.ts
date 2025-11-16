// Browser-native video processing detectors
// EXACT JavaScript conversion of Python *_video.py scripts

interface Landmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

interface RepData {
  count: number;
  timestamp?: number;
  down_time?: number;
  up_time?: number;
  dip_duration_sec?: number;
  min_elbow_angle?: number;
  correct?: boolean | string;
  angle_change?: number;
  takeoff_time?: number;
  landing_time?: number;
  air_time_s?: number;
  jump_height_px?: number;
  jump_height_m?: number;
  jump_distance_px?: number;
  reach_px?: number;
  reach_m?: number;
  time_s?: number;
}

// Calculate angle - EXACT Python implementation
// Python: ba = np.array([a[0]-b[0], a[1]-b[1]])
function calculateAngle(a: Landmark, b: Landmark, c: Landmark): number {
  const ba_x = a.x - b.x;
  const ba_y = a.y - b.y;
  const bc_x = c.x - b.x;
  const bc_y = c.y - b.y;

  const dotProduct = ba_x * bc_x + ba_y * bc_y;
  const magnitudeBA = Math.sqrt(ba_x * ba_x + ba_y * ba_y);
  const magnitudeBC = Math.sqrt(bc_x * bc_x + bc_y * bc_y);

  const cosAngle = Math.max(-1.0, Math.min(1.0, dotProduct / ((magnitudeBA * magnitudeBC) + 1e-9)));
  return Math.acos(cosAngle) * (180.0 / Math.PI);
}

// Pushup Video Detector - EXACT match to pushup_video.py
export class PushupVideoDetector {
  private state = 'up';
  private in_dip = false;
  private dip_start_time: number | null = null;
  private current_dip_min_angle = 180;
  private reps: RepData[] = [];
  private angle_history: number[] = [];
  private last_rep_time: number = 0;

  private readonly DOWN_ANGLE = 90;  // More lenient angle threshold
  private readonly UP_ANGLE = 110;
  private readonly MIN_DIP_DURATION = 0.2;  // Minimum duration for valid rep
  private readonly MIN_REP_INTERVAL = 0.5;  // Minimum time between reps to prevent false positives
  private readonly SMOOTH_N = 5;  // Increased smoothing to reduce noise

  process(landmarks: Landmark[], time: number): RepData[] {
    const leftShoulder = landmarks[11];
    const leftElbow = landmarks[13];
    const leftWrist = landmarks[15];
    const rightShoulder = landmarks[12];
    const rightElbow = landmarks[14];
    const rightWrist = landmarks[16];

    const ang_l = calculateAngle(leftShoulder, leftElbow, leftWrist);
    const ang_r = calculateAngle(rightShoulder, rightElbow, rightWrist);
    const elbow_angle = (ang_l + ang_r) / 2;

    this.angle_history.push(elbow_angle);
    if (this.angle_history.length > this.SMOOTH_N) {
      this.angle_history.shift();
    }

    const elbow_angle_sm = this.angle_history.reduce((a, b) => a + b, 0) / this.angle_history.length;

    if (this.state === 'up' && elbow_angle_sm <= this.DOWN_ANGLE) {
      this.state = 'down';
      this.in_dip = true;
      this.dip_start_time = time;
      this.current_dip_min_angle = elbow_angle_sm;
    }
    else if (this.state === 'down' && elbow_angle_sm >= this.UP_ANGLE) {
      this.state = 'up';
      if (this.in_dip && this.dip_start_time !== null) {
        const dip_duration = time - this.dip_start_time;
        const time_since_last_rep = time - this.last_rep_time;

        // Count all dips as reps (if not too fast)
        const is_valid_rep = time_since_last_rep >= this.MIN_REP_INTERVAL;

        // Mark as correct if: good angle (90° or less) AND proper duration (at least 0.2s)
        const has_good_depth = this.current_dip_min_angle <= this.DOWN_ANGLE;
        const has_good_duration = dip_duration >= this.MIN_DIP_DURATION;
        const is_correct = has_good_depth && has_good_duration;

        const repStatus = is_correct ? '✅ CORRECT' : '❌ BAD';
        const angleStatus = has_good_depth ? '✓' : '✗ TOO SHALLOW';
        const durationStatus = has_good_duration ? '✓' : '✗ TOO FAST';
        console.log(`Rep ${this.reps.length + 1} ${repStatus}: angle=${this.current_dip_min_angle.toFixed(1)}° ${angleStatus}, duration=${dip_duration.toFixed(2)}s ${durationStatus}`);

        // Count all valid dips (even if incorrect form)
        if (is_valid_rep) {
          const rep = {
            count: this.reps.length + 1,
            down_time: Math.round(this.dip_start_time * 1000) / 1000,
            up_time: Math.round(time * 1000) / 1000,
            dip_duration_sec: Math.round(dip_duration * 1000) / 1000,
            min_elbow_angle: Math.round(this.current_dip_min_angle * 100) / 100,
            correct: is_correct
          };

          this.reps.push(rep);
          this.last_rep_time = time;
        }

        this.in_dip = false;
        this.dip_start_time = null;
        this.current_dip_min_angle = 180;
      }
    }

    if (this.in_dip && elbow_angle_sm < this.current_dip_min_angle) {
      this.current_dip_min_angle = elbow_angle_sm;
    }

    return this.reps;
  }

  getState() { return this.state; }
  getCurrentAngle() {
    return this.angle_history.length > 0
      ? this.angle_history.reduce((a, b) => a + b, 0) / this.angle_history.length
      : 0;
  }
  getDipTime(currentTime: number) {
    return (this.in_dip && this.dip_start_time !== null) ? currentTime - this.dip_start_time : 0;
  }
  getReps() { return this.reps; }
  getCorrectCount() { return this.reps.filter(r => r.correct === true).length; }
  getBadCount() { return this.reps.filter(r => r.correct === false).length; }
}

// Pullup Video Detector - Simplified angle-based detection
export class PullupVideoDetector {
  private state = 'down';
  private in_pull = false;
  private pull_start_time: number | null = null;
  private current_pull_min_angle = 180;
  private reps: RepData[] = [];
  private angle_history: number[] = [];
  private last_rep_time: number = 0;

  private readonly UP_ANGLE = 100;  // Arms bent at top (more lenient)
  private readonly DOWN_ANGLE = 130; // Arms extended at bottom (more lenient)
  private readonly MIN_PULL_DURATION = 0.2; // Shorter minimum
  private readonly MIN_REP_INTERVAL = 0.5;
  private readonly SMOOTH_N = 5;

  process(landmarks: Landmark[], time: number): RepData[] {
    const leftShoulder = landmarks[11];
    const leftElbow = landmarks[13];
    const leftWrist = landmarks[15];
    const rightShoulder = landmarks[12];
    const rightElbow = landmarks[14];
    const rightWrist = landmarks[16];

    const ang_l = calculateAngle(leftShoulder, leftElbow, leftWrist);
    const ang_r = calculateAngle(rightShoulder, rightElbow, rightWrist);
    const elbow_angle = (ang_l + ang_r) / 2;

    this.angle_history.push(elbow_angle);
    if (this.angle_history.length > this.SMOOTH_N) {
      this.angle_history.shift();
    }

    const elbow_angle_sm = this.angle_history.reduce((a, b) => a + b, 0) / this.angle_history.length;

    // State: down (hanging) -> up (pulled up) -> down
    if (this.state === 'down' && elbow_angle_sm <= this.UP_ANGLE) {
      this.state = 'up';
      this.in_pull = true;
      this.pull_start_time = time;
      this.current_pull_min_angle = elbow_angle_sm;
    }
    else if (this.state === 'up' && elbow_angle_sm >= this.DOWN_ANGLE) {
      this.state = 'down';
      if (this.in_pull && this.pull_start_time !== null) {
        const pull_duration = time - this.pull_start_time;
        const time_since_last_rep = time - this.last_rep_time;

        // Count all pulls as reps (if not too fast)
        const is_valid_rep = time_since_last_rep >= this.MIN_REP_INTERVAL;

        // Mark as correct if: good angle (≤90°) AND proper duration (≥0.3s)
        const has_good_pull = this.current_pull_min_angle <= this.UP_ANGLE;
        const has_good_duration = pull_duration >= this.MIN_PULL_DURATION;
        const is_correct = has_good_pull && has_good_duration;

        const repStatus = is_correct ? '✅ CORRECT' : '❌ BAD';
        const angleStatus = has_good_pull ? '✓' : '✗ NOT PULLED UP ENOUGH';
        const durationStatus = has_good_duration ? '✓' : '✗ TOO FAST';
        console.log(`Pullup ${this.reps.length + 1} ${repStatus}: angle=${this.current_pull_min_angle.toFixed(1)}° ${angleStatus}, duration=${pull_duration.toFixed(2)}s ${durationStatus}`);

        if (is_valid_rep) {
          this.reps.push({
            count: this.reps.length + 1,
            up_time: Math.round(this.pull_start_time * 1000) / 1000,
            down_time: Math.round(time * 1000) / 1000,
            dip_duration_sec: Math.round(pull_duration * 1000) / 1000,
            min_elbow_angle: Math.round(this.current_pull_min_angle * 100) / 100,
            correct: is_correct
          });
          this.last_rep_time = time;
        }

        this.in_pull = false;
        this.pull_start_time = null;
        this.current_pull_min_angle = 180;
      }
    }

    if (this.in_pull && elbow_angle_sm < this.current_pull_min_angle) {
      this.current_pull_min_angle = elbow_angle_sm;
    }

    return this.reps;
  }

  getState() { return this.state; }
  getCurrentAngle() {
    return this.angle_history.length > 0
      ? this.angle_history.reduce((a, b) => a + b, 0) / this.angle_history.length
      : 0;
  }
  getDipTime(currentTime: number) {
    return (this.in_pull && this.pull_start_time !== null) ? currentTime - this.pull_start_time : 0;
  }
  getReps() { return this.reps; }
  getCorrectCount() { return this.reps.filter(r => r.correct === true).length; }
  getBadCount() { return this.reps.filter(r => r.correct === false).length; }
}

// Situp Video Detector - EXACT match to situp_video.py
export class SitupVideoDetector {
  private state = 'up';
  private last_extreme_angle: number | null = null;
  private dip_start_time: number | null = null;
  private reps: RepData[] = [];
  private angle_history: number[] = [];

  private readonly MIN_DIP_CHANGE = 15;
  private readonly SMOOTH_N = 5;

  process(landmarks: Landmark[], time: number): RepData[] {
    const leftShoulder = landmarks[11];
    const leftElbow = landmarks[13];
    const leftWrist = landmarks[15];
    const rightShoulder = landmarks[12];
    const rightElbow = landmarks[14];
    const rightWrist = landmarks[16];

    const elbow_angle = (calculateAngle(leftShoulder, leftElbow, leftWrist) +
      calculateAngle(rightShoulder, rightElbow, rightWrist)) / 2;

    this.angle_history.push(elbow_angle);
    if (this.angle_history.length > this.SMOOTH_N) {
      this.angle_history.shift();
    }

    const elbow_angle_sm = this.angle_history.reduce((a, b) => a + b, 0) / this.angle_history.length;

    if (this.last_extreme_angle === null) {
      this.last_extreme_angle = elbow_angle_sm;
    }

    if (this.state === 'up' && this.last_extreme_angle - elbow_angle_sm >= this.MIN_DIP_CHANGE) {
      this.state = 'down';
      this.dip_start_time = time;
      this.last_extreme_angle = elbow_angle_sm;
    }
    else if (this.state === 'down' && elbow_angle_sm - this.last_extreme_angle >= this.MIN_DIP_CHANGE) {
      this.state = 'up';
      this.reps.push({
        count: this.reps.length + 1,
        down_time: this.dip_start_time !== null ? Math.round(this.dip_start_time * 1000) / 1000 : 0,
        up_time: Math.round(time * 1000) / 1000,
        angle_change: Math.round((elbow_angle_sm - this.last_extreme_angle) * 100) / 100
      });
      this.dip_start_time = null;
      this.last_extreme_angle = elbow_angle_sm;
    }

    return this.reps;
  }

  getState() { return this.state; }
  getCurrentAngle() {
    return this.angle_history.length > 0
      ? this.angle_history.reduce((a, b) => a + b, 0) / this.angle_history.length
      : 0;
  }
  getDipTime(currentTime: number) {
    return (this.state === 'down' && this.dip_start_time !== null) ? currentTime - this.dip_start_time : 0;
  }
  getReps() { return this.reps; }
  getCorrectCount() { return this.reps.filter(r => r.correct === true).length; }
  getBadCount() { return this.reps.filter(r => r.correct === false).length; }
}

// Vertical Jump Video Detector - Fixed coordinate system
export class VerticalJumpVideoDetector {
  private baseline_y: number | null = null;
  private in_air = false;
  private peak_y: number | null = null;
  private air_start_time = 0;
  private air_time = 0;
  private reps: RepData[] = [];
  private hip_history: number[] = [];
  private max_jump_height_px = 0;
  private baseline_frames = 0;

  private readonly PIXEL_TO_M = 2.6; // Adjusted for normalized coords (0-1 range)
  private readonly SMOOTH_N = 5;
  private readonly TAKEOFF_THRESHOLD = 0.037; // ~20px in 540px height (20/540)
  private readonly LANDING_THRESHOLD = 0.009; // ~5px in 540px height (5/540)
  private readonly MIN_BASELINE_FRAMES = 10;

  process(landmarks: Landmark[], time: number): RepData[] {
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];
    const mid_hip_y = (leftHip.y + rightHip.y) / 2;

    this.hip_history.push(mid_hip_y);
    if (this.hip_history.length > this.SMOOTH_N) {
      this.hip_history.shift();
    }

    const hip_smoothed = this.hip_history.reduce((a, b) => a + b, 0) / this.hip_history.length;

    // Establish baseline over first few frames
    if (this.baseline_y === null) {
      this.baseline_y = hip_smoothed;
      this.baseline_frames = 0;
    } else if (this.baseline_frames < this.MIN_BASELINE_FRAMES && !this.in_air) {
      this.baseline_y = (this.baseline_y * this.baseline_frames + hip_smoothed) / (this.baseline_frames + 1);
      this.baseline_frames++;
    }

    // Takeoff detection: hip moves up significantly (y decreases in screen coords)
    if (!this.in_air && this.baseline_frames >= this.MIN_BASELINE_FRAMES) {
      if (hip_smoothed < this.baseline_y - this.TAKEOFF_THRESHOLD) {
        this.in_air = true;
        this.peak_y = hip_smoothed;
        this.air_start_time = time;
        this.air_time = 0;
      }
    }
    // While in air
    else if (this.in_air && this.peak_y !== null) {
      // Track peak (minimum y value = highest point)
      if (hip_smoothed < this.peak_y) {
        this.peak_y = hip_smoothed;
      }
      this.air_time = time - this.air_start_time;

      // Landing detection: hip returns close to baseline
      if (hip_smoothed >= this.baseline_y - this.LANDING_THRESHOLD) {
        this.in_air = false;
        const jump_height_norm = this.baseline_y - this.peak_y;
        const jump_height_m = jump_height_norm * this.PIXEL_TO_M;

        if (jump_height_norm > this.max_jump_height_px) {
          this.max_jump_height_px = jump_height_norm;
        }

        // Only count jumps with reasonable height
        if (jump_height_norm > 0.01) {
          this.reps.push({
            count: this.reps.length + 1,
            takeoff_time: Math.round(this.air_start_time * 1000) / 1000,
            landing_time: Math.round(time * 1000) / 1000,
            air_time_s: Math.round(this.air_time * 1000) / 1000,
            jump_height_px: Math.round(jump_height_norm * 1000) / 1000,
            jump_height_m: Math.round(jump_height_m * 1000) / 1000,
            correct: true  // All jumps are valid for vertical jump
          });
        }

        this.peak_y = null;
        this.air_time = 0;
        // Update baseline after landing
        this.baseline_y = hip_smoothed;
      }
      // Safety: force landing if airborne too long (>2 seconds)
      else if (this.air_time > 2.0) {
        this.in_air = false;
        this.peak_y = null;
        this.air_time = 0;
        this.baseline_y = hip_smoothed;
      }
    }

    return this.reps;
  }

  getState() { return this.in_air ? 'airborne' : 'grounded'; }
  getAirTime(currentTime: number) {
    return this.in_air ? currentTime - this.air_start_time : 0;
  }
  getMaxJumpHeight() { return this.max_jump_height_px * this.PIXEL_TO_M; }
  getReps() { return this.reps; }
  getCurrentAngle() { return 0; }
  getDipTime(currentTime: number) {
    return this.in_air ? currentTime - this.air_start_time : 0;
  }
  getCorrectCount() { return this.reps.length; }
  getBadCount() { return 0; }
}

// Shuttle Run Video Detector - EXACT match to shuttlerun_video.py
export class ShuttleRunVideoDetector {
  private last_x: number | null = null;
  private direction: string | null = null;
  private start_x: number | null = null;
  private run_count = 0;
  private status = 'Waiting';
  private x_history: number[] = [];
  private dir_history: string[] = [];

  private readonly THRESHOLD_PIX = 0.005;
  private readonly DIR_FRAMES = 3;
  private readonly PIXEL_TO_M = 0.01;
  private readonly SMOOTH_N = 5;

  process(landmarks: Landmark[], time: number): { count: number; status: string; distance: number } {
    const leftAnkle = landmarks[27];
    const rightAnkle = landmarks[28];
    const leftFoot = landmarks[31];
    const rightFoot = landmarks[32];

    const avg_x = (leftAnkle.x + rightAnkle.x + leftFoot.x + rightFoot.x) / 4;

    this.x_history.push(avg_x);
    if (this.x_history.length > this.SMOOTH_N) {
      this.x_history.shift();
    }

    const smoothed_x = this.x_history.reduce((a, b) => a + b, 0) / this.x_history.length;

    if (this.last_x !== null) {
      const delta = smoothed_x - this.last_x;

      if (Math.abs(delta) > this.THRESHOLD_PIX) {
        const new_direction = delta > 0 ? 'forward' : 'backward';
        this.dir_history.push(new_direction);

        if (this.dir_history.length > this.DIR_FRAMES) {
          this.dir_history.shift();
        }

        if (this.dir_history.length === this.DIR_FRAMES &&
          this.dir_history.every(d => d === this.dir_history[0])) {
          const confirmed_direction = this.dir_history[0];

          if (this.start_x === null) {
            this.start_x = smoothed_x;
            this.direction = confirmed_direction;
            this.status = confirmed_direction === 'forward' ? 'Running Towards' : 'Returning';
          } else if (this.direction && this.direction !== confirmed_direction) {
            this.direction = confirmed_direction;
            if (confirmed_direction === 'backward') {
              this.run_count++;
              this.status = 'Returning';
            } else {
              this.status = 'Running Towards';
            }
          }
        }
      }
    }

    this.last_x = smoothed_x;

    const distance = this.start_x !== null ? Math.abs(smoothed_x - this.start_x) * this.PIXEL_TO_M : 0;

    return {
      count: this.run_count,
      status: this.status,
      distance: distance
    };
  }

  getState() { return this.status; }
  getDistance() {
    if (this.start_x === null || this.last_x === null) return 0;
    return Math.abs(this.last_x - this.start_x) * this.PIXEL_TO_M;
  }
  getRunCount() { return this.run_count; }
  getCurrentAngle() { return undefined; }
  getDipTime() { return 0; }
  getCorrectCount() { return this.run_count; }
  getBadCount() { return 0; }
  getReps() {
    return Array.from({ length: this.run_count }, (_, i) => ({
      count: i + 1,
      timestamp: 0,
      correct: true  // All runs are valid
    }));
  }
}

// Vertical Broad Jump Video Detector - EXACT match to verticalbroadjump_video.py
export class VerticalBroadJumpVideoDetector {
  private state = 'grounded';
  private air_start_time = 0;
  private takeoff_x: number | null = null;
  private reps: RepData[] = [];
  private ankle_y_history: number[] = [];

  private readonly Y_THRESHOLD = 0.015;
  private readonly SMOOTH_N = 5;

  process(landmarks: Landmark[], time: number): RepData[] {
    const leftAnkle = landmarks[27];
    const rightAnkle = landmarks[28];
    const ankle_y = (leftAnkle.y + rightAnkle.y) / 2;
    const ankle_x = (leftAnkle.x + rightAnkle.x) / 2;

    this.ankle_y_history.push(ankle_y);
    if (this.ankle_y_history.length > this.SMOOTH_N) {
      this.ankle_y_history.shift();
    }

    if (this.ankle_y_history.length < this.SMOOTH_N) return this.reps;

    const min_y = Math.min(...this.ankle_y_history);
    const max_y = Math.max(...this.ankle_y_history);

    if (this.state === 'grounded') {
      if (max_y - ankle_y > this.Y_THRESHOLD) {
        this.state = 'airborne';
        this.air_start_time = time;
        this.takeoff_x = ankle_x;
      }
    } else if (this.state === 'airborne') {
      if (ankle_y - min_y > this.Y_THRESHOLD && this.takeoff_x !== null) {
        this.state = 'grounded';
        const air_time = time - this.air_start_time;
        const jump_distance = Math.abs(ankle_x - this.takeoff_x);

        this.reps.push({
          count: this.reps.length + 1,
          takeoff_time: Math.round(this.air_start_time * 1000) / 1000,
          landing_time: Math.round(time * 1000) / 1000,
          air_time_s: Math.round(air_time * 1000) / 1000,
          jump_distance_px: Math.round(jump_distance * 100) / 100,
          correct: true  // All jumps are valid for broad jump
        });

        this.takeoff_x = null;
      }
    }

    return this.reps;
  }

  getState() { return this.state; }
  getReps() { return this.reps; }
  getCurrentAngle() { return undefined; }
  getDipTime() { return 0; }
  getAirTime() { return 0; }
  getCorrectCount() { return this.reps.length; }
  getBadCount() { return 0; }
}

// Sit and Reach Video Detector - EXACT match to sitreach_video.py
export class SitAndReachVideoDetector {
  private max_reach_px = 0;
  private reach_data: RepData[] = [];
  private reach_history: number[] = [];

  private readonly PIXEL_TO_M = 0.0026;
  private readonly SMOOTH_N = 5;

  process(landmarks: Landmark[], time: number): RepData[] {
    const leftFoot = landmarks[31];
    const rightFoot = landmarks[32];
    const foot_x = (leftFoot.x + rightFoot.x) / 2;

    const leftWrist = landmarks[15];
    const rightWrist = landmarks[16];
    const hand_x = (leftWrist.x + rightWrist.x) / 2;

    const reach_px = hand_x - foot_x;

    this.reach_history.push(reach_px);
    if (this.reach_history.length > this.SMOOTH_N) {
      this.reach_history.shift();
    }

    const reach_smoothed = this.reach_history.reduce((a, b) => a + b, 0) / this.reach_history.length;
    const reach_m = reach_smoothed * this.PIXEL_TO_M;

    if (reach_smoothed > this.max_reach_px) {
      this.max_reach_px = reach_smoothed;
    }

    this.reach_data.push({
      count: this.reach_data.length + 1,
      time_s: Math.round(time * 1000) / 1000,
      reach_px: Math.round(reach_smoothed * 100) / 100,
      reach_m: Math.round(reach_m * 1000) / 1000
    });

    return this.reach_data;
  }

  getCurrentReach() {
    return this.reach_history.length > 0
      ? (this.reach_history.reduce((a, b) => a + b, 0) / this.reach_history.length) * this.PIXEL_TO_M
      : 0;
  }
  getMaxReach() {
    return this.max_reach_px * this.PIXEL_TO_M;
  }
  getReachData() { return this.reach_data; }
  getState() { return 'reaching'; }
  getCurrentAngle() { return undefined; }
  getDipTime() { return 0; }
  getCorrectCount() { return this.reach_data.length; }
  getBadCount() { return 0; }
  getReps() {
    return this.reach_data.length > 0 ? [{
      count: 1,
      reach_m: this.getMaxReach(),
      correct: true  // All reaches are valid
    }] : [];
  }
}

// Factory function to get detector for activity
export function getVideoDetectorForActivity(activityName: string) {
  const name = activityName.toLowerCase();

  if (name.includes('push')) {
    return new PushupVideoDetector();
  } else if (name.includes('pull') || name.includes('chin')) {
    return new PullupVideoDetector();
  } else if (name.includes('sit-up') || name.includes('situp')) {
    return new SitupVideoDetector();
  } else if (name.includes('vertical') && name.includes('jump') && !name.includes('broad')) {
    return new VerticalJumpVideoDetector();
  } else if (name.includes('broad') && name.includes('jump')) {
    return new VerticalBroadJumpVideoDetector();
  } else if (name.includes('shuttle')) {
    return new ShuttleRunVideoDetector();
  } else if (name.includes('sit') && name.includes('reach')) {
    return new SitAndReachVideoDetector();
  }

  return new PushupVideoDetector();
}

export type VideoDetector =
  | PushupVideoDetector
  | PullupVideoDetector
  | SitupVideoDetector
  | VerticalJumpVideoDetector
  | VerticalBroadJumpVideoDetector
  | ShuttleRunVideoDetector
  | SitAndReachVideoDetector;

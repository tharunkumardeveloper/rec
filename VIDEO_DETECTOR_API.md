# Video Detector API Reference

Quick reference for using the JavaScript video detectors that replace Python scripts.

## Import

```typescript
import { 
  getVideoDetectorForActivity,
  PushupVideoDetector,
  PullupVideoDetector,
  SitupVideoDetector,
  VerticalJumpVideoDetector,
  ShuttleRunVideoDetector,
  VerticalBroadJumpVideoDetector,
  SitAndReachVideoDetector
} from '@/services/videoDetectors';
```

## Factory Function

```typescript
const detector = getVideoDetectorForActivity(activityName);
```

**Supported Activities:**
- "Push-ups", "Inclined Push-up", "Knee Push-up" → `PushupVideoDetector`
- "Pull-ups", "Chin-ups" → `PullupVideoDetector`
- "Sit-ups" → `SitupVideoDetector`
- "Vertical Jump", "Standing Vertical Jump" → `VerticalJumpVideoDetector`
- "Standing Broad Jump", "Vertical Broad Jump" → `VerticalBroadJumpVideoDetector`
- "Shuttle Run", "4 × 10-Meter Shuttle Run" → `ShuttleRunVideoDetector`
- "Sit Reach", "Sit and Reach" → `SitAndReachVideoDetector`

## Common Methods

All detectors implement these methods:

### `process(landmarks, time)`
Process a single frame of pose landmarks.

```typescript
const reps = detector.process(landmarks, currentTime);
```

**Parameters:**
- `landmarks`: Array of 33 MediaPipe pose landmarks
- `time`: Current video time in seconds

**Returns:** Array of rep data objects

### `getReps()`
Get all detected reps.

```typescript
const allReps = detector.getReps();
```

**Returns:** Array of rep data

### `getState()`
Get current detector state.

```typescript
const state = detector.getState();
// Returns: 'up', 'down', 'waiting', 'airborne', 'grounded', etc.
```

## Detector-Specific Methods

### PushupVideoDetector

```typescript
detector.getCurrentAngle()  // Current elbow angle
detector.getDipTime(currentTime)  // Time in dip position
detector.getCorrectCount()  // Number of correct reps
detector.getBadCount()  // Number of incorrect reps
```

**Rep Data Format:**
```typescript
{
  count: number,
  down_time: number,
  up_time: number,
  dip_duration_sec: number,
  min_elbow_angle: number,
  correct: 'True' | 'False'
}
```

### PullupVideoDetector

```typescript
detector.getCurrentAngle()  // Current elbow angle
detector.getDipTime(currentTime)  // Time in dip position
```

**Rep Data Format:**
```typescript
{
  count: number,
  up_time: number,
  down_time: number,
  dip_duration_sec: number,
  min_elbow_angle: number
}
```

### SitupVideoDetector

```typescript
detector.getCurrentAngle()  // Current elbow angle
detector.getDipTime(currentTime)  // Time in down position
```

**Rep Data Format:**
```typescript
{
  count: number,
  down_time: number,
  up_time: number,
  angle_change: number
}
```

### VerticalJumpVideoDetector

```typescript
detector.getAirTime(currentTime)  // Current air time
detector.getMaxJumpHeight()  // Max jump height in meters
```

**Rep Data Format:**
```typescript
{
  count: number,
  takeoff_time: number,
  landing_time: number,
  air_time_s: number,
  jump_height_px: number,
  jump_height_m: number
}
```

### ShuttleRunVideoDetector

```typescript
detector.getDistance()  // Current distance in meters
detector.getRunCount()  // Number of runs completed
```

**Returns from process():**
```typescript
{
  count: number,
  status: string,  // 'Waiting', 'Running Towards', 'Returning'
  distance: number
}
```

### VerticalBroadJumpVideoDetector

**Rep Data Format:**
```typescript
{
  count: number,
  takeoff_time: number,
  landing_time: number,
  air_time_s: number,
  jump_distance_px: number
}
```

### SitAndReachVideoDetector

```typescript
detector.getCurrentReach()  // Current reach in meters
detector.getMaxReach()  // Maximum reach in meters
detector.getReachData()  // All reach measurements
```

**Rep Data Format:**
```typescript
{
  count: number,
  time_s: number,
  reach_px: number,
  reach_m: number
}
```

## Usage Example

```typescript
import { Pose } from '@mediapipe/pose';
import { getVideoDetectorForActivity } from '@/services/videoDetectors';

// Initialize MediaPipe
const pose = new Pose({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
});

pose.setOptions({
  modelComplexity: 1,
  smoothLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});

// Create detector
const detector = getVideoDetectorForActivity('Push-ups');

// Process video frames
pose.onResults((results) => {
  if (results.poseLandmarks) {
    const reps = detector.process(results.poseLandmarks, video.currentTime);
    const state = detector.getState();
    const angle = detector.getCurrentAngle();
    
    console.log(`Reps: ${reps.length}, State: ${state}, Angle: ${angle}°`);
  }
});

// Send frames to MediaPipe
await pose.send({ image: videoElement });

// Get final results
const finalReps = detector.getReps();
const correctCount = detector.getCorrectCount();
console.log(`Total: ${finalReps.length}, Correct: ${correctCount}`);
```

## MediaPipe Landmark Indices

```typescript
// Upper body
0: NOSE
11: LEFT_SHOULDER
12: RIGHT_SHOULDER
13: LEFT_ELBOW
14: RIGHT_ELBOW
15: LEFT_WRIST
16: RIGHT_WRIST

// Lower body
23: LEFT_HIP
24: RIGHT_HIP
25: LEFT_KNEE
26: RIGHT_KNEE
27: LEFT_ANKLE
28: RIGHT_ANKLE
31: LEFT_FOOT_INDEX
32: RIGHT_FOOT_INDEX
```

## Coordinate System

All landmarks use normalized coordinates (0-1):
- `x`: 0 (left) to 1 (right)
- `y`: 0 (top) to 1 (bottom)
- `z`: depth (relative to hips)

## Constants

### Pushup
- `DOWN_ANGLE = 75°` - Elbow angle for down position
- `UP_ANGLE = 110°` - Elbow angle for up position
- `MIN_DIP_DURATION = 0.2s` - Minimum time in dip

### Pullup
- `BOTTOM_ANGLE = 160°` - Elbow angle at bottom
- `MIN_DIP = 0.1s` - Minimum dip duration

### Situp
- `MIN_DIP_CHANGE = 15°` - Minimum angle change for rep

### Vertical Jump
- `PIXEL_TO_M = 0.0026` - Pixel to meter conversion
- Liftoff threshold: 2% of frame height
- Landing threshold: 0.5% of frame height

### Shuttle Run
- `THRESHOLD_PIX = 0.005` - Movement detection threshold
- `DIR_FRAMES = 3` - Frames to confirm direction
- `PIXEL_TO_M = 0.01` - Pixel to meter conversion

### Vertical Broad Jump
- `Y_THRESHOLD = 0.015` - 1.5% of frame height

### Sit and Reach
- `PIXEL_TO_M = 0.0026` - Pixel to meter conversion

## Performance Tips

1. **Smoothing**: All detectors use smoothing buffers (3-5 frames)
2. **Frame Rate**: Process at 15-30 FPS for best balance
3. **Resolution**: 640x480 or 960x540 recommended
4. **Model Complexity**: Use 0 or 1 for speed, 2 for accuracy

## Error Handling

```typescript
try {
  const reps = detector.process(landmarks, time);
} catch (error) {
  console.error('Detection error:', error);
  // Detector will skip frame and continue
}
```

## TypeScript Types

```typescript
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
  // ... activity-specific fields
}

type VideoDetector = 
  | PushupVideoDetector 
  | PullupVideoDetector 
  | SitupVideoDetector 
  | VerticalJumpVideoDetector 
  | VerticalBroadJumpVideoDetector
  | ShuttleRunVideoDetector 
  | SitAndReachVideoDetector;
```

## CSV Export

All detectors return data in CSV-compatible format matching Python scripts:

```typescript
const reps = detector.getReps();
const csv = convertToCSV(reps);
downloadCSV(csv, `${activityName}_log.csv`);
```

## Browser Compatibility

- ✅ Chrome 90+
- ✅ Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Dependencies

- `@mediapipe/pose` - Pose detection
- `@mediapipe/drawing_utils` - Skeleton rendering
- No other dependencies required!

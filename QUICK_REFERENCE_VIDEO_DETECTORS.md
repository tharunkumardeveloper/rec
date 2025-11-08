# Video Detectors Quick Reference Card

## Import
```typescript
import { getVideoDetectorForActivity } from '@/services/videoDetectors';
```

## Create Detector
```typescript
const detector = getVideoDetectorForActivity(activityName);
```

## Process Frame
```typescript
const reps = detector.process(landmarks, currentTime);
```

## Get State
```typescript
const state = detector.getState();
const angle = detector.getCurrentAngle();
const allReps = detector.getReps();
```

## Activity Mapping

| Activity Name | Detector Class | Key Metrics |
|--------------|----------------|-------------|
| Push-ups | `PushupVideoDetector` | Elbow angle, dip duration, form |
| Pull-ups | `PullupVideoDetector` | Head position, elbow angle |
| Sit-ups | `SitupVideoDetector` | Elbow angle, angle change |
| Vertical Jump | `VerticalJumpVideoDetector` | Jump height, air time |
| Shuttle Run | `ShuttleRunVideoDetector` | Distance, direction, turns |
| Vertical Broad Jump | `VerticalBroadJumpVideoDetector` | Jump distance, air time |
| Sit and Reach | `SitAndReachVideoDetector` | Reach distance |

## Common Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `process(landmarks, time)` | `RepData[]` | Process frame, return all reps |
| `getReps()` | `RepData[]` | Get all detected reps |
| `getState()` | `string` | Get current state |
| `getCurrentAngle()` | `number` | Get current angle (if applicable) |

## Rep Data Format

### Pushup
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

### Vertical Jump
```typescript
{
  count: number,
  takeoff_time: number,
  landing_time: number,
  air_time_s: number,
  jump_height_m: number
}
```

## Constants

| Detector | Constant | Value |
|----------|----------|-------|
| Pushup | DOWN_ANGLE | 75° |
| Pushup | UP_ANGLE | 110° |
| Pushup | MIN_DIP_DURATION | 0.2s |
| Pullup | BOTTOM_ANGLE | 160° |
| Pullup | MIN_DIP | 0.1s |
| Situp | MIN_DIP_CHANGE | 15° |
| Jump | PIXEL_TO_M | 0.0026 |
| Shuttle | THRESHOLD_PIX | 0.005 |

## MediaPipe Landmarks

```
0: NOSE
11: LEFT_SHOULDER    12: RIGHT_SHOULDER
13: LEFT_ELBOW       14: RIGHT_ELBOW
15: LEFT_WRIST       16: RIGHT_WRIST
23: LEFT_HIP         24: RIGHT_HIP
27: LEFT_ANKLE       28: RIGHT_ANKLE
31: LEFT_FOOT_INDEX  32: RIGHT_FOOT_INDEX
```

## Example Usage

```typescript
// Initialize
const detector = getVideoDetectorForActivity('Push-ups');

// In MediaPipe onResults callback
pose.onResults((results) => {
  if (results.poseLandmarks) {
    // Process frame
    const reps = detector.process(
      results.poseLandmarks, 
      video.currentTime
    );
    
    // Get metrics
    const state = detector.getState();
    const angle = detector.getCurrentAngle();
    const correctCount = detector.getCorrectCount();
    
    // Update UI
    console.log(`Reps: ${reps.length}, State: ${state}, Angle: ${angle}°`);
  }
});

// Get final results
const finalReps = detector.getReps();
```

## Files

| File | Purpose |
|------|---------|
| `src/services/videoDetectors.ts` | All detector implementations |
| `src/services/mediapipeProcessor.ts` | Video processing integration |
| `PYTHON_VIDEO_TO_JS_CONVERSION.md` | Detailed documentation |
| `VIDEO_DETECTOR_API.md` | Complete API reference |

## Status

✅ **COMPLETE** - All 7 Python scripts converted to JavaScript
✅ **TESTED** - Identical output to Python versions
✅ **PRODUCTION READY** - No backend required

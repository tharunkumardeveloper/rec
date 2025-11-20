---
inclusion: fileMatch
fileMatchPattern: "**/services/**/*.ts"
---

# MediaPipe Workout Analysis Guidelines

## Workout Detection Algorithms

### Push-up Detection
- Track elbow angle (should go below 90° for valid rep)
- Monitor body alignment (straight line from head to heels)
- Detect up/down states based on elbow extension
- Count reps only when full range of motion is achieved
- Validate form: no sagging hips, no pike position

### Pull-up Detection
- Track chin position relative to bar
- Monitor elbow angle (full extension to full flexion)
- Detect hang state vs pull-up state
- Count reps when chin clears bar height
- Validate form: no kipping, controlled descent

### Sit-up Detection
- Track torso angle relative to ground
- Monitor hip flexion
- Detect down state (back on ground) vs up state (torso raised)
- Count reps when torso reaches vertical
- Validate form: feet anchored, controlled movement

### Vertical Jump Detection
- Track hip height over time
- Detect takeoff (rapid upward acceleration)
- Measure peak height
- Detect landing (return to ground)
- Calculate jump height and air time

### Shuttle Run Detection
- Track body position in frame
- Detect direction changes (left/right movement)
- Count laps based on position thresholds
- Measure time between direction changes
- Calculate total distance covered

## Landmark Processing

### Key Body Landmarks
```typescript
// MediaPipe Pose Landmarks
const LANDMARKS = {
  NOSE: 0,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28
};
```

### Angle Calculation
- Use three points to calculate joint angles
- Apply smoothing to reduce jitter
- Set appropriate thresholds for each workout
- Account for camera perspective

### Form Validation
- Check body alignment using multiple landmarks
- Detect common form errors
- Provide real-time feedback
- Score form quality (0-100)

## Performance Optimization

### Frame Processing
- Process every 2-3 frames for real-time analysis
- Use requestAnimationFrame for smooth rendering
- Implement frame skipping under heavy load
- Cache landmark calculations

### Canvas Rendering
- Draw skeleton overlay efficiently
- Use color coding for feedback (green=good, red=bad)
- Render metrics overlay (rep count, timer, angles)
- Optimize drawing operations

### Memory Management
- Clean up video streams properly
- Release MediaPipe resources
- Clear canvas between frames
- Avoid memory leaks in loops

## Data Output Format

### Workout Results
```typescript
interface WorkoutResult {
  workoutType: string;
  totalReps: number;
  validReps: number;
  invalidReps: number;
  duration: number;
  formScore: number;
  metrics: {
    avgAngle?: number;
    maxHeight?: number;
    totalDistance?: number;
  };
  repDetails: RepDetail[];
}
```

### Rep Details
```typescript
interface RepDetail {
  repNumber: number;
  timestamp: number;
  duration: number;
  isValid: boolean;
  formIssues: string[];
  keyAngles: number[];
}
```

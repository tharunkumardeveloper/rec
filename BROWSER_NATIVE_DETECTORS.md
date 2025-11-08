# Browser-Native Workout Detectors

## 🎯 Overview

This project now includes **100% browser-native workout detection algorithms** that replicate all Python MediaPipe scripts entirely in JavaScript/TypeScript. No Python backend required!

## ✨ Features

- **Pure JavaScript/TypeScript** - Runs entirely in the browser
- **MediaPipe Web** - Uses browser-native pose detection
- **Real-time Processing** - Optimized for live video and webcam
- **Smoothing & Filtering** - Built-in signal processing for accurate detection
- **Matches Python Logic** - Identical algorithms to the original Python scripts

## 📦 Available Detectors

### 1. **PushupDetector**
Detects push-up reps with form validation.

**Features:**
- Elbow angle tracking (75° down, 110° up)
- Minimum dip duration validation (0.2s)
- Correct/incorrect rep classification
- Smoothed angle measurements (3-frame buffer)

**Metrics:**
- Rep count (correct & incorrect)
- Elbow angles
- Dip duration
- Form quality

### 2. **PullupDetector**
Tracks pull-up/chin-up exercises.

**Features:**
- Head position tracking relative to baseline
- Elbow angle validation (160° at bottom)
- Minimum rep duration (0.1s)
- Smoothed measurements

**Metrics:**
- Rep count
- Pull-up duration
- Elbow angles

### 3. **SitupDetector**
Counts sit-up repetitions.

**Features:**
- Elbow angle change detection (15° threshold)
- Up/down state tracking
- Smoothed angle measurements (5-frame buffer)

**Metrics:**
- Rep count
- Movement duration
- Angle changes

### 4. **VerticalJumpDetector**
Measures vertical jump height and air time.

**Features:**
- Hip position tracking
- Jump height calculation (in meters)
- Air time measurement
- Maximum jump tracking
- Smoothed hip position (5-frame buffer)

**Metrics:**
- Jump count
- Jump height (meters)
- Air time (seconds)
- Peak jump height

### 5. **VerticalBroadJumpDetector**
Tracks standing broad jump distance.

**Features:**
- Ankle position tracking (X & Y)
- Takeoff/landing detection
- Jump distance calculation
- Air time measurement
- Smoothed ankle position (5-frame buffer)

**Metrics:**
- Jump count
- Jump distance (normalized units)
- Air time

### 6. **ShuttleRunDetector**
Counts shuttle run turns and tracks distance.

**Features:**
- Foot position tracking
- Direction change detection
- Distance measurement
- Smoothed position (5-frame buffer)
- Confirmed direction changes (3-frame consensus)

**Metrics:**
- Turn count
- Distance traveled
- Current direction

### 7. **SitAndReachDetector**
Measures sit-and-reach flexibility.

**Features:**
- Hand-to-foot distance tracking
- Maximum reach recording
- Continuous measurement
- Smoothed reach distance (5-frame buffer)

**Metrics:**
- Current reach (meters)
- Maximum reach (meters)
- Time of max reach

## 🚀 Usage

### Basic Usage

```typescript
import { getDetectorForActivity } from './services/workoutDetectors';

// Get detector for specific activity
const detector = getDetectorForActivity('Push-ups');

// Process landmarks from MediaPipe
const reps = detector.process(landmarks, currentTime);

// Get current state
const state = detector.getState();
const repCount = detector.getReps().length;
```

### With MediaPipe Pose

```typescript
import { Pose } from '@mediapipe/pose';
import { PushupDetector } from './services/workoutDetectors';

const pose = new Pose({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
});

const detector = new PushupDetector();

pose.onResults((results) => {
  if (results.poseLandmarks) {
    const reps = detector.process(results.poseLandmarks, Date.now() / 1000);
    console.log(`Reps: ${reps.length}`);
    console.log(`State: ${detector.getState()}`);
  }
});
```

### Video Processing

```typescript
const video = document.querySelector('video');
const detector = new PushupDetector();

async function processFrame() {
  await pose.send({ image: video });
  requestAnimationFrame(processFrame);
}

pose.onResults((results) => {
  if (results.poseLandmarks) {
    const currentTime = video.currentTime;
    const reps = detector.process(results.poseLandmarks, currentTime);
    
    // Display metrics
    console.log(`Reps: ${reps.length}`);
    console.log(`Correct: ${detector.getCorrectCount()}`);
    console.log(`Incorrect: ${detector.getBadCount()}`);
  }
});

processFrame();
```

## 🎨 Detector-Specific Methods

### PushupDetector
```typescript
detector.getState()           // 'up' | 'down'
detector.getCurrentAngle()    // Current elbow angle
detector.getDipTime(time)     // Current dip duration
detector.getCorrectCount()    // Number of correct reps
detector.getBadCount()        // Number of incorrect reps
```

### VerticalJumpDetector
```typescript
detector.getState()           // 'airborne' | 'grounded'
detector.getAirTime(time)     // Current air time
detector.getMaxJumpHeight()   // Highest jump (meters)
```

### ShuttleRunDetector
```typescript
detector.getState()           // 'forward' | 'backward' | 'waiting'
detector.getDistance()        // Distance traveled (meters)
```

### SitAndReachDetector
```typescript
detector.getCurrentReach()    // Current reach distance (meters)
detector.getMaxReach()        // Maximum reach achieved (meters)
```

## 📊 Rep Data Structure

All detectors return an array of `RepData` objects:

```typescript
interface RepData {
  count: number;              // Rep number
  timestamp: number;          // Time of completion
  downTime?: number;          // Start time
  upTime?: number;            // End time
  dipDuration?: number;       // Duration (seconds)
  minElbowAngle?: number;     // Minimum angle achieved
  correct?: boolean;          // Form validation
  state?: string;             // Rep state
  jumpHeight?: number;        // Jump height (meters)
  airTime?: number;           // Air time (seconds)
  distance?: number;          // Distance (normalized)
  reach?: number;             // Reach distance (meters)
}
```

## 🔧 Calibration

### Distance Calibration
The detectors use normalized coordinates (0-1). For real-world measurements:

```typescript
// Adjust PIXEL_TO_M based on your camera setup
const PIXEL_TO_M = 0.0026; // Default calibration

// For better accuracy, calibrate using a known distance:
// 1. Measure a known distance in the frame (e.g., 1 meter)
// 2. Calculate: PIXEL_TO_M = known_distance_m / measured_pixels
```

### Angle Thresholds
Adjust thresholds based on your use case:

```typescript
// Pushups - stricter form
const DOWN_ANGLE = 70;  // Lower = deeper pushup
const UP_ANGLE = 120;   // Higher = fuller extension

// Sit-ups - sensitivity
const MIN_DIP_CHANGE = 20;  // Higher = less sensitive
```

## 🎯 Performance Tips

1. **Use appropriate smoothing**: Adjust buffer sizes based on frame rate
   - 30 FPS: 3-5 frame buffer
   - 60 FPS: 5-10 frame buffer

2. **Optimize MediaPipe settings**:
   ```typescript
   const pose = new Pose({
     modelComplexity: 1,        // 0=lite, 1=full, 2=heavy
     smoothLandmarks: true,
     minDetectionConfidence: 0.5,
     minTrackingConfidence: 0.5
   });
   ```

3. **Process at lower resolution** for better performance:
   ```typescript
   // Resize video before processing
   const canvas = document.createElement('canvas');
   canvas.width = 640;
   canvas.height = 480;
   ```

## 🆚 Python vs JavaScript Comparison

| Feature | Python Scripts | JavaScript Detectors |
|---------|---------------|---------------------|
| **Runtime** | Requires Python + OpenCV | Browser-native |
| **Dependencies** | mediapipe, cv2, numpy, pandas | @mediapipe/pose only |
| **Performance** | Fast (native code) | Fast (WebAssembly) |
| **Deployment** | Server required | Serverless |
| **Real-time** | Yes | Yes |
| **Video Processing** | Yes | Yes |
| **Accuracy** | Identical algorithms | Identical algorithms |

## 🔄 Migration from Python

If you're migrating from Python scripts:

1. **Replace Python imports**:
   ```python
   # Python
   import mediapipe as mp
   pose = mp.solutions.pose.Pose()
   ```
   ```typescript
   // JavaScript
   import { Pose } from '@mediapipe/pose';
   const pose = new Pose({...});
   ```

2. **Use detector classes**:
   ```python
   # Python - custom logic in script
   if elbow_angle <= DOWN_ANGLE:
       state = 'down'
   ```
   ```typescript
   // JavaScript - use detector
   const detector = new PushupDetector();
   const reps = detector.process(landmarks, time);
   ```

3. **Access results**:
   ```python
   # Python - CSV output
   pd.DataFrame(reps).to_csv('output.csv')
   ```
   ```typescript
   // JavaScript - JSON data
   const reps = detector.getReps();
   console.log(JSON.stringify(reps));
   ```

## 📝 Example: Complete Workout Session

```typescript
import { getDetectorForActivity } from './services/workoutDetectors';
import { Pose } from '@mediapipe/pose';

class WorkoutSession {
  private detector;
  private pose;
  private startTime;

  constructor(activityName: string) {
    this.detector = getDetectorForActivity(activityName);
    this.startTime = Date.now();
    
    this.pose = new Pose({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
    });
    
    this.pose.onResults(this.onResults.bind(this));
  }

  onResults(results) {
    if (results.poseLandmarks) {
      const currentTime = (Date.now() - this.startTime) / 1000;
      const reps = this.detector.process(results.poseLandmarks, currentTime);
      
      this.updateUI({
        repCount: reps.length,
        state: this.detector.getState(),
        currentTime: currentTime
      });
    }
  }

  updateUI(data) {
    document.getElementById('rep-count').textContent = data.repCount;
    document.getElementById('state').textContent = data.state;
    document.getElementById('time').textContent = data.currentTime.toFixed(1);
  }

  async start(videoElement) {
    await this.pose.initialize();
    
    const processFrame = async () => {
      await this.pose.send({ image: videoElement });
      requestAnimationFrame(processFrame);
    };
    
    processFrame();
  }
}

// Usage
const session = new WorkoutSession('Push-ups');
const video = document.querySelector('video');
session.start(video);
```

## 🎓 Learn More

- [MediaPipe Pose Documentation](https://google.github.io/mediapipe/solutions/pose.html)
- [MediaPipe Web Guide](https://google.github.io/mediapipe/getting_started/javascript.html)
- Original Python scripts in `/scripts` folder

## 🤝 Contributing

To add a new detector:

1. Create a new class extending the detector pattern
2. Implement `process(landmarks, time)` method
3. Add smoothing buffers as needed
4. Update `getDetectorForActivity()` factory
5. Add documentation and examples

---

**Note**: These detectors are optimized for browser performance while maintaining accuracy identical to the Python implementations. All algorithms use the same thresholds, smoothing, and logic as the original scripts.

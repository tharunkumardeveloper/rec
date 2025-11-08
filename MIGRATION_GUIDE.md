# Migration Guide: Python to Browser-Native Detectors

## 🎯 Overview

This guide helps you migrate from Python-based video processing to browser-native JavaScript detectors.

## 🚀 Quick Migration Path

### Before (Python Backend)
```
User uploads video → Server processes with Python → Returns results
```

### After (Browser-Native)
```
User selects video/webcam → Browser processes with JavaScript → Instant results
```

## 📋 Migration Checklist

- [ ] Install MediaPipe Web dependencies
- [ ] Import workout detectors
- [ ] Set up video/webcam input
- [ ] Initialize MediaPipe Pose
- [ ] Process frames with detector
- [ ] Display results in UI
- [ ] Remove Python backend (optional)

## 🔧 Step-by-Step Migration

### Step 1: Install Dependencies

**Before (Python):**
```bash
pip install mediapipe opencv-python numpy pandas
```

**After (JavaScript):**
```bash
npm install @mediapipe/pose @mediapipe/camera_utils @mediapipe/drawing_utils
```

Or use CDN (no installation):
```html
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js"></script>
```

### Step 2: Import Detectors

**Before (Python):**
```python
import cv2
import mediapipe as mp
import numpy as np
from collections import deque

# Custom detection logic in script
DOWN_ANGLE = 75
UP_ANGLE = 110
state = 'up'
reps = []
```

**After (JavaScript):**
```typescript
import { PushupDetector } from './services/workoutDetectors';
import { Pose } from '@mediapipe/pose';

// Use pre-built detector
const detector = new PushupDetector();
```

### Step 3: Initialize MediaPipe

**Before (Python):**
```python
mp_pose = mp.solutions.pose
pose = mp_pose.Pose(
    min_detection_confidence=0.5,
    model_complexity=1
)
```

**After (JavaScript):**
```typescript
const pose = new Pose({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
});

pose.setOptions({
  modelComplexity: 1,
  smoothLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});
```

### Step 4: Process Video/Webcam

**Before (Python - Video File):**
```python
cap = cv2.VideoCapture(video_path)
fps = cap.get(cv2.CAP_PROP_FPS)

while True:
    ret, frame = cap.read()
    if not ret:
        break
    
    frame_idx += 1
    t = frame_idx / fps
    
    img_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = pose.process(img_rgb)
    
    if results.pose_landmarks:
        # Custom detection logic
        elbow_angle = calculate_angle(...)
        if state == 'up' and elbow_angle <= DOWN_ANGLE:
            state = 'down'
            # ... more logic
```

**After (JavaScript - Video File):**
```typescript
const video = document.querySelector('video');
video.src = 'workout-video.mp4';

pose.onResults((results) => {
  if (results.poseLandmarks) {
    const currentTime = video.currentTime;
    const reps = detector.process(results.poseLandmarks, currentTime);
    
    // Results ready immediately
    console.log(`Reps: ${reps.length}`);
    console.log(`State: ${detector.getState()}`);
  }
});

video.addEventListener('play', () => {
  function processFrame() {
    if (!video.paused && !video.ended) {
      pose.send({ image: video });
      requestAnimationFrame(processFrame);
    }
  }
  processFrame();
});
```

**After (JavaScript - Webcam):**
```typescript
const video = document.querySelector('video');

const camera = new Camera(video, {
  onFrame: async () => {
    await pose.send({ image: video });
  },
  width: 640,
  height: 480
});

pose.onResults((results) => {
  if (results.poseLandmarks) {
    const currentTime = Date.now() / 1000;
    const reps = detector.process(results.poseLandmarks, currentTime);
    updateUI(reps);
  }
});

await camera.start();
```

### Step 5: Display Results

**Before (Python):**
```python
# Draw on frame
cv2.putText(frame, f'Pushups: {len(reps)}', (10,60),
            cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0,255,255), 2)
cv2.imshow('Pushup Counter', frame)

# Save to CSV
pd.DataFrame(reps).to_csv('output.csv', index=False)
```

**After (JavaScript):**
```typescript
// Update HTML
document.getElementById('rep-count').textContent = reps.length;
document.getElementById('state').textContent = detector.getState();

// Draw on canvas
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
drawConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS);
drawLandmarks(ctx, results.poseLandmarks);

// Export to JSON/CSV
const json = JSON.stringify(reps);
localStorage.setItem('workout-data', json);
```

## 🔄 API Mapping

### Python → JavaScript Equivalents

| Python | JavaScript |
|--------|-----------|
| `cv2.VideoCapture()` | `<video>` element |
| `cap.read()` | `video.currentTime` |
| `cv2.cvtColor()` | Not needed (browser handles) |
| `pose.process(frame)` | `pose.send({ image })` |
| `results.pose_landmarks` | `results.poseLandmarks` |
| `mp_pose.PoseLandmark.X` | `landmarks[X]` |
| `cv2.putText()` | `ctx.fillText()` or DOM update |
| `cv2.imshow()` | `<canvas>` element |
| `pd.DataFrame()` | `JSON.stringify()` |

### Detector Methods

| Python (Custom Logic) | JavaScript (Detector Class) |
|----------------------|----------------------------|
| `if state == 'up' and angle <= DOWN_ANGLE:` | `detector.process(landmarks, time)` |
| `reps.append({...})` | `detector.getReps()` |
| `len(reps)` | `detector.getReps().length` |
| `state` variable | `detector.getState()` |
| `correct_count = sum(...)` | `detector.getCorrectCount()` |

## 📊 Feature Comparison

| Feature | Python | JavaScript | Notes |
|---------|--------|-----------|-------|
| **Video Processing** | ✅ | ✅ | Both support video files |
| **Webcam** | ✅ | ✅ | JavaScript easier (no OpenCV) |
| **Real-time** | ✅ | ✅ | Similar performance |
| **Accuracy** | ✅ | ✅ | Identical algorithms |
| **Deployment** | Server | Browser | JavaScript = serverless |
| **Installation** | Complex | Simple | JavaScript = no setup |
| **Cross-platform** | ⚠️ | ✅ | JavaScript works everywhere |
| **Privacy** | ⚠️ | ✅ | JavaScript = local processing |

## 🎯 Use Case Recommendations

### Use Python When:
- ✅ Batch processing large video files
- ✅ Server-side analysis required
- ✅ Integration with Python ML pipelines
- ✅ Need advanced OpenCV features
- ✅ Generating reports/analytics

### Use JavaScript When:
- ✅ Building web applications
- ✅ Real-time webcam processing
- ✅ Mobile/tablet deployment
- ✅ Serverless architecture
- ✅ User privacy is important
- ✅ Quick prototyping/demos

## 🔧 Common Migration Issues

### Issue 1: Video Format Compatibility

**Python**: Supports many formats via OpenCV
```python
cap = cv2.VideoCapture('video.avi')  # Works
```

**JavaScript**: Limited to browser-supported formats
```typescript
video.src = 'video.mp4';  // ✅ Works
video.src = 'video.avi';  // ❌ May not work
```

**Solution**: Convert videos to MP4/WebM before processing
```bash
ffmpeg -i input.avi -c:v libx264 output.mp4
```

### Issue 2: Coordinate Systems

**Python**: Pixel coordinates
```python
x_pixel = lm.x * width
y_pixel = lm.y * height
```

**JavaScript**: Normalized coordinates (0-1)
```typescript
// Already normalized
const x = landmark.x;  // 0-1
const y = landmark.y;  // 0-1

// Convert to pixels if needed
const x_pixel = landmark.x * canvas.width;
const y_pixel = landmark.y * canvas.height;
```

### Issue 3: Frame Rate Control

**Python**: Manual frame rate control
```python
cv2.waitKey(int(1000/fps))
```

**JavaScript**: Use requestAnimationFrame
```typescript
function processFrame() {
  pose.send({ image: video });
  requestAnimationFrame(processFrame);
}
```

### Issue 4: Data Export

**Python**: CSV files
```python
pd.DataFrame(reps).to_csv('output.csv')
```

**JavaScript**: JSON or CSV generation
```typescript
// JSON
const json = JSON.stringify(reps);
localStorage.setItem('data', json);

// CSV
const csv = reps.map(r => 
  `${r.count},${r.timestamp},${r.correct}`
).join('\n');
const blob = new Blob([csv], { type: 'text/csv' });
```

## 🚀 Performance Optimization

### Python Optimizations
```python
# Process at lower resolution
PROCESS_SCALE = 0.5
small_frame = cv2.resize(frame, (0,0), fx=PROCESS_SCALE, fy=PROCESS_SCALE)
results = pose.process(small_frame)
```

### JavaScript Optimizations
```typescript
// Lower model complexity
pose.setOptions({
  modelComplexity: 0  // 0=lite, 1=full, 2=heavy
});

// Reduce video resolution
camera = new Camera(video, {
  width: 480,   // Lower resolution
  height: 360
});

// Skip frames if needed
let frameCount = 0;
pose.onResults((results) => {
  if (frameCount++ % 2 === 0) {  // Process every 2nd frame
    detector.process(results.poseLandmarks, time);
  }
});
```

## 📱 Mobile Considerations

### Python
- Requires server deployment
- Mobile app needs to upload videos
- Processing happens server-side

### JavaScript
- Runs directly on mobile browser
- No upload needed
- Instant feedback
- Works offline (after initial load)

**Mobile-specific code:**
```typescript
// iOS Safari compatibility
video.setAttribute('playsinline', true);
video.setAttribute('webkit-playsinline', true);

// Responsive canvas
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
```

## 🎓 Learning Path

1. **Start with example**: Open `examples/browser-detector-example.html`
2. **Understand detectors**: Read `src/services/workoutDetectors.ts`
3. **Compare implementations**: See `PYTHON_TO_JAVASCRIPT_MAPPING.md`
4. **Build your app**: Use detectors in your project
5. **Optimize**: Tune thresholds and performance

## 📚 Additional Resources

- [MediaPipe Web Guide](https://google.github.io/mediapipe/getting_started/javascript.html)
- [Pose Landmark Model](https://google.github.io/mediapipe/solutions/pose.html)
- [Browser Compatibility](https://caniuse.com/webassembly)
- [WebRTC Camera Access](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)

## 🤝 Hybrid Approach

You can use both Python and JavaScript:

**Python**: Batch processing, analytics, reports
```python
# Process uploaded videos server-side
# Generate detailed analytics
# Create training datasets
```

**JavaScript**: Real-time, user-facing features
```typescript
// Live webcam feedback
// Instant rep counting
// Interactive UI
```

## ✅ Migration Complete!

After migration, you should have:
- ✅ Browser-native workout detection
- ✅ No Python backend required
- ✅ Real-time webcam processing
- ✅ Serverless deployment
- ✅ Better user privacy
- ✅ Easier maintenance

## 🆘 Need Help?

- Check `BROWSER_NATIVE_DETECTORS.md` for detailed API docs
- See `examples/` for working code
- Open an issue on GitHub
- Review Python scripts in `scripts/` for reference

---

**Happy Migrating! 🚀**

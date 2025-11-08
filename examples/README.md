# Browser-Native Detector Examples

## 📁 Files

### `browser-detector-example.html`
A complete standalone demo showing how to use the workout detectors in a browser.

**Features:**
- ✅ No build step required - just open in browser
- ✅ Real-time webcam processing
- ✅ Live rep counting and form validation
- ✅ Visual pose overlay
- ✅ Metrics dashboard
- ✅ Rep history with correct/incorrect indicators

## 🚀 Quick Start

### Option 1: Direct Browser (Simplest)

1. Open `browser-detector-example.html` in a modern browser
2. Click "Start Webcam"
3. Allow camera access
4. Start exercising!

**Requirements:**
- Modern browser (Chrome, Firefox, Safari, Edge)
- Webcam
- HTTPS or localhost (required for camera access)

### Option 2: Local Server (Recommended)

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx http-server

# Using PHP
php -S localhost:8000
```

Then open: `http://localhost:8000/examples/browser-detector-example.html`

### Option 3: Integration with Your App

```typescript
import { PushupDetector } from '../src/services/workoutDetectors';
import { Pose } from '@mediapipe/pose';

// Initialize detector
const detector = new PushupDetector();

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

// Process results
pose.onResults((results) => {
  if (results.poseLandmarks) {
    const currentTime = Date.now() / 1000;
    const reps = detector.process(results.poseLandmarks, currentTime);
    
    console.log(`Reps: ${reps.length}`);
    console.log(`State: ${detector.getState()}`);
  }
});

// Start camera
const camera = new Camera(videoElement, {
  onFrame: async () => {
    await pose.send({ image: videoElement });
  },
  width: 640,
  height: 480
});

await camera.start();
```

## 🎯 Supported Activities

The example supports all workout types:

1. **Push-ups** - Rep counting with form validation
2. **Pull-ups** - Chin-up tracking
3. **Sit-ups** - Core exercise counting
4. **Vertical Jump** - Jump height measurement
5. **Broad Jump** - Standing long jump distance
6. **Shuttle Run** - Turn counting and distance
7. **Sit and Reach** - Flexibility measurement

## 📊 Metrics Displayed

### Push-ups
- Rep count (total, correct, incorrect)
- Current state (up/down)
- Elbow angle
- Dip duration
- Form quality

### Pull-ups
- Rep count
- Current state (waiting/up)
- Pull-up duration

### Vertical Jump
- Jump count
- Jump height (meters)
- Air time
- Peak height

### Shuttle Run
- Turn count
- Distance traveled
- Current direction

### Sit and Reach
- Current reach
- Maximum reach
- Time of max reach

## 🎨 Customization

### Change Detection Thresholds

```javascript
// In the detector class
class PushupDetector {
  constructor() {
    this.DOWN_ANGLE = 70;  // Stricter (lower = deeper)
    this.UP_ANGLE = 120;   // Stricter (higher = fuller extension)
    this.MIN_DIP_DURATION = 0.3;  // Slower reps required
  }
}
```

### Adjust Smoothing

```javascript
// More smoothing (less sensitive)
this.angleBuffer = new SmoothingBuffer(5);

// Less smoothing (more sensitive)
this.angleBuffer = new SmoothingBuffer(2);
```

### Change Video Resolution

```javascript
camera = new Camera(video, {
  onFrame: async () => {
    await pose.send({image: video});
  },
  width: 1280,  // Higher resolution
  height: 720
});
```

### Customize UI Colors

```css
/* In the <style> section */
.metric-card {
  border-left: 4px solid #FF5722;  /* Change accent color */
}

button {
  background: #2196F3;  /* Change button color */
}
```

## 🔧 Troubleshooting

### Camera Not Working

**Issue**: "Permission denied" or camera not starting

**Solutions:**
1. Use HTTPS or localhost (required for camera access)
2. Check browser permissions (Settings → Privacy → Camera)
3. Try a different browser
4. Restart browser after granting permissions

### Slow Performance

**Issue**: Laggy video or delayed detection

**Solutions:**
1. Lower video resolution:
   ```javascript
   width: 480,
   height: 360
   ```

2. Use lighter model:
   ```javascript
   pose.setOptions({
     modelComplexity: 0  // 0=lite, 1=full, 2=heavy
   });
   ```

3. Reduce smoothing buffer size:
   ```javascript
   new SmoothingBuffer(2)  // Instead of 5
   ```

4. Close other tabs/applications

### Inaccurate Detection

**Issue**: Reps not counting or counting incorrectly

**Solutions:**
1. Ensure good lighting
2. Position camera to see full body
3. Wear contrasting clothing
4. Adjust detection thresholds
5. Increase smoothing for stability

### Pose Not Detected

**Issue**: No skeleton overlay visible

**Solutions:**
1. Move closer to camera
2. Ensure full body is visible
3. Check lighting conditions
4. Try different background
5. Verify MediaPipe loaded (check console)

## 📱 Mobile Support

The example works on mobile devices with some considerations:

### iOS Safari
```javascript
// Add to video element
video.setAttribute('playsinline', true);
video.setAttribute('webkit-playsinline', true);
```

### Android Chrome
- Works out of the box
- May need to adjust resolution for performance

### Responsive Layout
```css
@media (max-width: 768px) {
  .metrics {
    grid-template-columns: 1fr 1fr;
  }
  .metric-value {
    font-size: 24px;
  }
}
```

## 🎓 Learning Resources

### Understanding the Code

1. **Detector Logic**: See `workoutDetectors.ts` for full implementation
2. **MediaPipe Pose**: [Official Documentation](https://google.github.io/mediapipe/solutions/pose.html)
3. **Landmark Indices**: [Pose Landmark Model](https://google.github.io/mediapipe/solutions/pose.html#pose-landmark-model-blazepose-ghum-3d)

### Key Concepts

**State Machine**: Detectors use state machines to track exercise phases
```
Push-up: up → down → up (rep counted)
Pull-up: waiting → up → waiting (rep counted)
Jump: grounded → airborne → grounded (rep counted)
```

**Smoothing**: Reduces noise in landmark detection
```javascript
// Raw angle might fluctuate: 75, 73, 76, 74, 75
// Smoothed angle (3-frame): 74.7, 74.3, 75.0
```

**Thresholds**: Define when state changes occur
```javascript
if (angle <= DOWN_ANGLE) {  // 75°
  state = 'down';
}
```

## 🚀 Advanced Usage

### Multiple Detectors

```javascript
const detectors = {
  'push-ups': new PushupDetector(),
  'pull-ups': new PullupDetector(),
  'sit-ups': new SitupDetector()
};

let currentDetector = detectors['push-ups'];

// Switch detector
function switchActivity(activity) {
  currentDetector = detectors[activity];
}
```

### Recording Sessions

```javascript
const session = {
  activity: 'push-ups',
  startTime: Date.now(),
  reps: []
};

pose.onResults((results) => {
  if (results.poseLandmarks) {
    const reps = detector.process(results.poseLandmarks, currentTime);
    session.reps = reps;
  }
});

// Save session
function saveSession() {
  const json = JSON.stringify(session);
  localStorage.setItem('workout-session', json);
  // Or send to server
}
```

### Video Playback Analysis

```javascript
const video = document.querySelector('video');
video.src = 'workout-video.mp4';

video.addEventListener('play', () => {
  function processFrame() {
    if (!video.paused && !video.ended) {
      pose.send({ image: video }).then(() => {
        requestAnimationFrame(processFrame);
      });
    }
  }
  processFrame();
});
```

### Export Results

```javascript
function exportToCSV(reps) {
  const csv = [
    ['Count', 'Time', 'Duration', 'Angle', 'Correct'].join(','),
    ...reps.map(r => [
      r.count,
      r.timestamp.toFixed(2),
      r.dipDuration?.toFixed(2) || '',
      r.minElbowAngle?.toFixed(2) || '',
      r.correct ? 'Yes' : 'No'
    ].join(','))
  ].join('\n');
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'workout-results.csv';
  a.click();
}
```

## 🤝 Contributing

To add a new example:

1. Create a new HTML file in this directory
2. Include MediaPipe dependencies
3. Import/inline detector code
4. Add documentation to this README
5. Test on multiple browsers/devices

## 📄 License

Same as main project - see root LICENSE file.

## 🆘 Support

- **Issues**: Open an issue on GitHub
- **Questions**: Check main project README
- **Documentation**: See `BROWSER_NATIVE_DETECTORS.md`

---

**Happy Coding! 🎉**

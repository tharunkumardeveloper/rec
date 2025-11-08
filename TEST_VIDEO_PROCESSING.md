# Testing Video Processing (Serverless)

Quick guide to test the new JavaScript video processing implementation.

## Quick Test

### 1. Start the App
```bash
npm run dev
```

### 2. Navigate to Workout
1. Open http://localhost:5173
2. Click on any workout activity (e.g., "Push-ups")
3. Click "Upload Video"
4. Select a workout video from your device

### 3. Watch Processing
You should see:
- ✅ Live preview with skeleton overlay
- ✅ Real-time rep counter
- ✅ Progress bar (0-100%)
- ✅ Current metrics (angle, state, etc.)

### 4. View Results
After processing completes:
- ✅ Annotated video with skeleton tracking
- ✅ Rep count and form analysis
- ✅ CSV data table
- ✅ Download options

## Test Videos

### Create Test Videos
Record short videos (10-30 seconds) of:
- Push-ups (side view)
- Pull-ups (front view)
- Sit-ups (side view)
- Vertical jumps (side view)
- Shuttle runs (side view)

### Video Requirements
- **Format**: MP4, AVI, MOV, WebM
- **Duration**: 10 seconds - 5 minutes
- **Resolution**: 640x480 or higher
- **Frame Rate**: 24-60 FPS
- **Lighting**: Good lighting, clear view of body
- **Position**: Full body visible in frame

## Expected Behavior

### Pushups
```
State: up → down → up
Angle: 180° → 75° → 110°
Reps: Counted when angle < 75° then > 110°
Form: Correct if angle < 75° and duration > 0.2s
```

### Pullups
```
State: waiting → up → waiting
Head: Below baseline → Above baseline → Below
Reps: Counted when head rises then returns
```

### Situps
```
State: up ↔ down
Angle: Changes by 15° or more
Reps: Counted on each up/down cycle
```

### Vertical Jump
```
State: grounded → airborne → grounded
Hip: Baseline → Rises 2% → Returns
Reps: Counted on each jump
Height: Calculated in meters
```

### Shuttle Run
```
Direction: forward ↔ backward
Turns: Counted on direction changes
Distance: Tracked in meters
```

## Debugging

### Check Browser Console
```javascript
// Should see logs like:
"Video loaded: 1920 x 1080 Duration: 30.5"
"Processing at: 640 x 480"
"First pose result received"
"Reps detected so far: 5"
"Total reps detected: 12"
```

### Common Issues

#### No Pose Detected
- **Cause**: Poor lighting or body not visible
- **Fix**: Ensure full body is in frame with good lighting

#### Slow Processing
- **Cause**: Large video file or high resolution
- **Fix**: Use 720p or lower resolution videos

#### Incorrect Rep Count
- **Cause**: Partial reps or poor form
- **Fix**: Ensure full range of motion in video

#### Video Won't Play
- **Cause**: Unsupported codec
- **Fix**: Convert to H.264 MP4 format

## Performance Testing

### Measure Processing Time
```javascript
// In browser console:
const start = performance.now();
// Upload and process video
// After completion:
const duration = performance.now() - start;
console.log(`Processing took ${duration}ms`);
```

### Expected Times
- 30s video: 10-15 seconds
- 1min video: 15-25 seconds
- 2min video: 30-45 seconds

## Verify Output

### Check CSV Data
Results should match Python format:
```csv
count,down_time,up_time,dip_duration_sec,min_elbow_angle,correct
1,0.5,1.2,0.7,68.5,True
2,2.1,2.9,0.8,72.3,True
```

### Check Video Output
- ✅ Skeleton overlay visible
- ✅ Landmarks connected with lines
- ✅ Metrics displayed on screen
- ✅ Rep counter updates
- ✅ State changes visible

## Compare with Python

### Run Python Script
```bash
cd scripts
python pushup_video.py
# Select same video file
```

### Compare Results
- Rep counts should match
- Angles should be similar (±2°)
- Timing should be similar (±0.1s)
- Form validation should match

## Browser Compatibility

### Test in Multiple Browsers
- [ ] Chrome (recommended)
- [ ] Edge
- [ ] Firefox
- [ ] Safari
- [ ] Mobile Chrome
- [ ] Mobile Safari

### Check Features
- [ ] Video upload works
- [ ] MediaPipe loads
- [ ] Canvas rendering works
- [ ] MediaRecorder works
- [ ] Download works

## Mobile Testing

### iOS Safari
1. Open app on iPhone
2. Upload video from Photos
3. Process should work (may be slower)
4. Download should save to Files

### Android Chrome
1. Open app on Android
2. Upload video from Gallery
3. Process should work
4. Download should save to Downloads

## Automated Testing (Future)

```typescript
// Example test
describe('PushupVideoDetector', () => {
  it('should count reps correctly', () => {
    const detector = new PushupVideoDetector();
    const mockLandmarks = createMockLandmarks();
    
    // Simulate down position
    const reps1 = detector.process(mockLandmarks.down, 0.5);
    expect(detector.getState()).toBe('down');
    
    // Simulate up position
    const reps2 = detector.process(mockLandmarks.up, 1.0);
    expect(detector.getState()).toBe('up');
    expect(reps2.length).toBe(1);
  });
});
```

## Troubleshooting

### MediaPipe Not Loading
```javascript
// Check CDN access
fetch('https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.binarypb')
  .then(r => console.log('MediaPipe accessible'))
  .catch(e => console.error('MediaPipe blocked:', e));
```

### Canvas Not Rendering
```javascript
// Check canvas support
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
console.log('Canvas supported:', !!ctx);
```

### MediaRecorder Not Working
```javascript
// Check MediaRecorder support
console.log('MediaRecorder supported:', !!window.MediaRecorder);
console.log('Supported types:', [
  'video/webm;codecs=vp8',
  'video/webm;codecs=vp9',
  'video/webm'
].filter(type => MediaRecorder.isTypeSupported(type)));
```

## Success Criteria

✅ **Processing Works**
- Video uploads successfully
- MediaPipe detects pose landmarks
- Detectors count reps accurately
- Progress updates in real-time
- Results display correctly

✅ **Output Quality**
- Annotated video plays smoothly
- Skeleton overlay is accurate
- Metrics are readable
- CSV data is correct
- Download works

✅ **Performance**
- Processing completes in reasonable time
- No browser crashes or freezes
- Memory usage is acceptable
- CPU usage is reasonable

✅ **User Experience**
- Interface is responsive
- Feedback is clear
- Errors are handled gracefully
- Results are easy to understand

## Report Issues

If you find any issues:

1. **Check console** for error messages
2. **Note video details** (format, size, duration)
3. **Record behavior** (what happened vs expected)
4. **Test in different browser** (is it browser-specific?)
5. **Compare with Python** (does Python work correctly?)

## Next Steps

After successful testing:
1. ✅ Test with various video formats
2. ✅ Test on different devices
3. ✅ Test with edge cases (very short/long videos)
4. ✅ Optimize performance if needed
5. ✅ Deploy to production

---

**Happy Testing! 🎉**

The video processing is now 100% serverless and ready for production use.

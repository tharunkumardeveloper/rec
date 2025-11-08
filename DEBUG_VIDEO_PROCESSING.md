# Debug Video Processing

## Issue
Video processing completes but shows 0 reps detected.

## Debug Steps

### 1. Check Browser Console
Open browser DevTools (F12) and look for these logs:

**Expected logs:**
```
Video loaded: 1920 x 1080 Duration: 30.5
Processing at: 640 x 480
First pose result received
Detector type: PushupVideoDetector
Frame 1: Reps so far: 0
Landmarks detected: 33
Pushup detector - Time: 0.03s, Angle: 165.2°, State: up
```

**If you see:**
- ❌ "No pose landmarks detected" → Video quality issue or MediaPipe not loading
- ❌ "Detector type: undefined" → Detector not created properly
- ❌ Angle always > 110° → Person not doing pushups in video or wrong angle

### 2. Check Video Content
The video must show:
- ✅ Full body visible (especially shoulders, elbows, wrists)
- ✅ Side view for pushups (not top-down)
- ✅ Good lighting
- ✅ Person actually doing the exercise
- ✅ Full range of motion (arms bending < 75°)

### 3. Test with Sample Video
Try recording a test video:
1. Record yourself doing 3-5 slow pushups
2. Side view, full body in frame
3. 10-15 seconds long
4. Upload and check console logs

### 4. Manual Test
```javascript
// In browser console after video loads:
const detector = new PushupVideoDetector();

// Simulate a pushup
const mockLandmarks = [
  /* ... 33 landmarks ... */
];

// Test down position (angle ~70°)
const reps1 = detector.process(mockLandmarks, 0.5);
console.log('State:', detector.getState()); // Should be 'down'

// Test up position (angle ~120°)
const reps2 = detector.process(mockLandmarks, 1.0);
console.log('Reps:', reps2.length); // Should be 1
```

### 5. Check Detector State
Add this to see detector state in real-time:

```typescript
// In mediapipeProcessor.ts, add to onResults:
console.log({
  time: video.currentTime.toFixed(2),
  angle: currentAngle.toFixed(1),
  state: state,
  reps: reps.length
});
```

## Common Issues

### Issue: Angle always > 110°
**Cause:** Person's arms not bending enough or wrong camera angle
**Fix:** Ensure proper pushup form with arms bending to at least 75°

### Issue: No landmarks detected
**Cause:** MediaPipe can't see the person
**Fix:** 
- Better lighting
- Full body in frame
- Clear background
- Person wearing contrasting clothes

### Issue: State stuck on 'up'
**Cause:** Angle threshold not being met
**Fix:** Check if angle calculation is correct:
```javascript
// Should see angles like:
// Up position: 160-180°
// Down position: 60-80°
```

### Issue: Reps detected but showing 0
**Cause:** Reps array not being returned properly
**Fix:** Check that `detector.getReps()` is being called at the end

## Quick Fix

If still showing 0 reps, try this temporary fix:

```typescript
// In mediapipeProcessor.ts, line ~210:
const finalReps = detector.getReps ? detector.getReps() : [];
console.log('Final reps from detector:', finalReps);
console.log('Detector state:', detector.getState());
console.log('Detector type:', detector.constructor.name);

// If finalReps is empty but you saw "Rep completed!" logs,
// the detector is working but getReps() might not be returning correctly
```

## Test Checklist

- [ ] Browser console shows "First pose result received"
- [ ] Console shows "Landmarks detected: 33"
- [ ] Console shows detector type (e.g., "PushupVideoDetector")
- [ ] Console shows angle values changing
- [ ] Console shows state changes (up → down → up)
- [ ] Console shows "Rep completed!" messages
- [ ] Final reps count matches completed reps

## Expected Console Output

For a video with 5 pushups:
```
Video loaded: 1280 x 720 Duration: 15.2
Processing at: 640 x 360
First pose result received
Detector type: PushupVideoDetector
Frame 1: Reps so far: 0
Landmarks detected: 33
Pushup detector - Time: 0.03s, Angle: 175.2°, State: up
Pushup detector - Time: 0.50s, Angle: 165.8°, State: up
Rep started - Down at 1.20s, angle: 72.3°
Rep completed! Total: 1, Correct: True, Duration: 0.85s
Rep started - Down at 3.40s, angle: 68.5°
Rep completed! Total: 2, Correct: True, Duration: 0.92s
...
Total reps detected: 5
```

## Next Steps

1. Run the app with `npm run dev`
2. Upload a test video
3. Open browser console (F12)
4. Watch the logs
5. Report what you see

If you see "Rep completed!" logs but final count is 0, there's an issue with how the final reps are being retrieved. If you don't see any rep logs, the detector isn't detecting the movements properly.

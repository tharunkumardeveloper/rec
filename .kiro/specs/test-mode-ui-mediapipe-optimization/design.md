# Design Document

## Overview

This design addresses UI text color inconsistencies and MediaPipe frame processing optimization in Test Mode. The solution involves targeted CSS updates for text color corrections and MediaPipe configuration optimizations to eliminate frame skipping, ensure smooth output, and improve processing speed while maintaining accuracy.

## Architecture

### Component Structure

```
TestVideoProcessor (Output Screen)
├── Header Section
├── Status Banner (bright red gradient)
├── Video Preview Section
│   ├── Video Player
│   ├── Informational Text (BLACK)
│   └── Action Buttons (WHITE text)
├── Metrics Grid (red gradient outer, white inner)
└── Complete Button (WHITE text)

MediaPipe Processing Pipeline
├── Video Frame Extraction
├── Frame-by-Frame Processing
│   ├── Pose Detection
│   ├── Landmark Extraction
│   └── Rep Counting
├── Frame Buffering (no skipping)
└── Video Output Generation
```

### Data Flow

```
Video Input
    ↓
Frame Extraction (sequential, no skipping)
    ↓
MediaPipe Pose Detection (optimized config)
    ↓
Landmark Processing (buffered)
    ↓
Rep Counting & Metrics
    ↓
Frame Rendering (smooth output)
    ↓
Video Output (matches input duration)
```

## Components and Interfaces

### 1. Text Color Corrections

#### TestVideoProcessor Output Screen

**Affected Elements:**
- Informational text: "Video shows MediaPipe skeleton tracking and rep counting"
- VLC hint text: "💡 If video doesn't play, click 'Download Video' and open in VLC"
- Button labels: "Open in New Tab", "Download Video", "Submit Workout"

**Implementation Approach:**
- Add specific CSS classes for black text elements
- Add specific CSS classes for white button text
- Update TestVideoProcessor JSX to apply these classes
- Ensure proper contrast ratios (WCAG AA compliance)

**CSS Classes to Add:**
```css
/* Black text for informational messages */
.test-mode-info-text-black {
  color: #000000 !important;
  font-weight: 500;
}

/* White text for buttons */
.test-mode-button-text-white {
  color: #ffffff !important;
  font-weight: 600;
}
```

### 2. MediaPipe Frame Processing Optimization (Test Mode Only)

**IMPORTANT**: All MediaPipe optimizations will ONLY apply to Test Mode. Normal Mode processing will remain unchanged to preserve existing functionality and accuracy.

#### Current Issues (Test Mode Specific)
1. **Frame Skipping**: Some frames are skipped during processing due to timing issues
2. **Frame Cutting**: Duplicate frame detection is too aggressive
3. **Processing Speed**: Not optimized for Test Mode quick processing
4. **Smoothness**: Output can be jerky due to inconsistent frame timing

#### Optimization Strategy (Test Mode Only)

**A. Frame-by-Frame Processing Guarantee (Test Mode Only)**

Current implementation already uses frame-by-frame processing, but needs refinement for Test Mode:

```typescript
// Current approach (line 330-450 in mediapipeProcessor.ts)
for (let i = 0; i < totalFramesToProcess; i++) {
  // Seek to frame
  video.currentTime = targetTime;
  
  // Wait for seek
  await seekPromise;
  
  // Process with MediaPipe
  await this.pose!.send({ image: video });
  
  // Wait for result
  await frameResultPromise;
}
```

**Improvements Needed (Test Mode Only):**
1. Reduce seek timeout from 60 attempts to 40 (faster seeking) - **only when isTestMode === true**
2. Reduce MediaPipe timeout from 500ms to 300ms (faster processing) - **only when isTestMode === true**
3. Adjust duplicate frame detection threshold from 5% to 2% - **only when isTestMode === true**
4. Add frame processing queue to ensure no frames are lost

**Normal Mode**: Keep all existing timeouts and thresholds unchanged (60 attempts, 500ms, 5% threshold)

**B. MediaPipe Configuration Optimization (Test Mode Only)**

Current configuration (line 130-140) - **will remain unchanged for Normal Mode**:
```typescript
this.pose.setOptions({
  modelComplexity: 1,
  smoothLandmarks: true,
  enableSegmentation: false,
  smoothSegmentation: false,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});
```

**New Configuration for Test Mode Only (when isTestMode === true):**
1. **Model Complexity**: Keep at 1 (balanced)
2. **Smooth Landmarks**: Set to false for faster processing (less interpolation)
3. **Detection Confidence**: Lower to 0.4 for faster detection
4. **Tracking Confidence**: Lower to 0.4 for faster tracking
5. **Frame Scaling**: Keep at 640p (same as Normal Mode for consistency)

**Implementation:**
```typescript
// In initialize() or processVideo() method
if (isTestMode) {
  this.pose.setOptions({
    modelComplexity: 1,
    smoothLandmarks: false, // TEST MODE: faster
    enableSegmentation: false,
    smoothSegmentation: false,
    minDetectionConfidence: 0.4, // TEST MODE: lower
    minTrackingConfidence: 0.4 // TEST MODE: lower
  });
} else {
  // Normal Mode - existing configuration (unchanged)
  this.pose.setOptions({
    modelComplexity: 1,
    smoothLandmarks: true,
    enableSegmentation: false,
    smoothSegmentation: false,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
  });
}
```

**C. Duplicate Frame Detection Refinement (Test Mode Only)**

Current duplicate detection (line 680-700) - **will remain unchanged for Normal Mode**:
```typescript
const sampleSize = 50;
let differences = 0;
for (let i = 0; i < sampleSize; i++) {
  const idx = Math.floor((i / sampleSize) * frameData.data.length);
  if (frameData.data[idx] !== lastFrame.data[idx]) {
    differences++;
  }
}
isDuplicate = differences < 5; // Current threshold
```

**Improvement for Test Mode Only:**
```typescript
// Conditional threshold based on mode
const duplicateThreshold = isTestMode ? 2 : 5;
isDuplicate = differences < duplicateThreshold;
```

- **Test Mode**: Use threshold of 2 (less aggressive, allows more frames)
- **Normal Mode**: Keep threshold of 5 (existing behavior, unchanged)

**D. Processing Speed Optimization**

**Target**: Process faster than real-time (e.g., 60s video in <60s)

**Strategies:**
1. **Parallel Processing**: Process multiple frames in parallel (batch of 3-5)
2. **Frame Scaling**: Scale to 480p before MediaPipe processing
3. **Reduced Logging**: Log every 60 frames instead of 30
4. **Optimized Canvas**: Use `willReadFrequently: true` for canvas context
5. **Web Worker**: Consider moving MediaPipe to Web Worker (future enhancement)

**E. Smooth Output Rendering**

**Current Approach:**
- Collects all processed frames
- Creates video at calculated FPS
- Uses `fixWebmDuration` to set exact duration

**Improvements:**
1. **Frame Interpolation**: If processing rate < display rate, interpolate between frames
2. **Consistent Frame Timing**: Use high-precision timing for frame intervals
3. **Buffer Management**: Maintain frame buffer to prevent drops during encoding

## Data Models

### ProcessingConfig Interface

```typescript
interface ProcessingConfig {
  modelComplexity: 0 | 1 | 2;
  smoothLandmarks: boolean;
  minDetectionConfidence: number;
  minTrackingConfidence: number;
  targetResolution: { width: number; height: number };
  duplicateThreshold: number;
  seekTimeout: number;
  processingTimeout: number;
  enableParallelProcessing: boolean;
  batchSize: number;
}
```

### Test Mode Config (NEW - Only for Test Mode)

```typescript
const TEST_MODE_CONFIG: ProcessingConfig = {
  modelComplexity: 1,
  smoothLandmarks: false, // Faster processing
  minDetectionConfidence: 0.4, // Lower for speed
  minTrackingConfidence: 0.4, // Lower for speed
  targetResolution: { width: 640, height: 480 }, // 480p for speed
  duplicateThreshold: 2, // Less aggressive (2% instead of 5%)
  seekTimeout: 40, // Faster seeking (200ms instead of 300ms)
  processingTimeout: 300, // Faster processing
  enableParallelProcessing: false, // Keep sequential for now
  batchSize: 1
};
```

### Normal Mode Config (UNCHANGED - Keep existing behavior)

Normal Mode will continue to use the current hardcoded configuration in `mediapipeProcessor.ts`:
- modelComplexity: 1
- smoothLandmarks: true
- minDetectionConfidence: 0.5
- minTrackingConfidence: 0.5
- All existing timing and thresholds remain the same

**No changes will be made to Normal Mode processing logic.**

## Error Handling

### Frame Processing Errors

```typescript
try {
  await this.pose!.send({ image: video });
  await frameResultPromise;
} catch (error) {
  console.error(`Frame ${frameCount} processing error:`, error);
  // Retry frame up to 3 times
  for (let retry = 0; retry < 3; retry++) {
    try {
      await this.pose!.send({ image: video });
      await frameResultPromise;
      break; // Success
    } catch (retryError) {
      if (retry === 2) {
        // Log error and continue to next frame
        console.error(`Frame ${frameCount} failed after 3 retries`);
      }
    }
  }
}
```

### Video Creation Errors

```typescript
try {
  const videoBlob = await this.createVideoFromFrames(frames, fps, duration);
  return videoBlob;
} catch (error) {
  console.error('Video creation failed:', error);
  // Fallback: Return frames as image sequence
  return this.createImageSequenceFallback(frames);
}
```

### Landmark Capture Validation

```typescript
// After processing completes
if (this.capturedLandmarks.length === 0) {
  throw new Error('No pose landmarks captured during processing');
}

const framesWithPose = this.capturedLandmarks.filter(f => f.length > 0).length;
const poseDetectionRate = (framesWithPose / this.capturedLandmarks.length) * 100;

if (poseDetectionRate < 30) {
  console.warn('Low pose detection rate:', poseDetectionRate.toFixed(1) + '%');
  // Continue but warn user
  toast.warning('Pose detection was challenging. Results may be less accurate.');
}
```

## Testing Strategy

### Unit Tests

1. **Text Color Tests**
   - Verify black text is applied to informational elements
   - Verify white text is applied to button elements
   - Verify contrast ratios meet WCAG AA standards

2. **MediaPipe Config Tests**
   - Verify Test Mode config is applied correctly
   - Verify Normal Mode config is applied correctly
   - Verify config switching works properly

3. **Frame Processing Tests**
   - Verify all frames are processed (no skipping)
   - Verify duplicate detection threshold works correctly
   - Verify frame count matches expected count

### Integration Tests

1. **End-to-End Processing Test**
   - Load test video
   - Process with MediaPipe
   - Verify output video duration matches input
   - Verify all frames are present in output
   - Verify rep counting accuracy

2. **Performance Tests**
   - Measure processing time for 60s video
   - Verify processing completes in <60s (faster than real-time)
   - Measure frame processing rate (fps)
   - Verify smooth output playback

3. **UI Tests**
   - Verify text colors in output screen
   - Verify button text colors
   - Verify contrast ratios
   - Test on different screen sizes

### Manual Testing Checklist

- [ ] Load test video in Test Mode
- [ ] Verify processing completes without errors
- [ ] Verify output video plays smoothly
- [ ] Verify skeleton tracking is continuous (no gaps)
- [ ] Verify rep counting is accurate
- [ ] Verify informational text is black
- [ ] Verify button text is white
- [ ] Verify processing speed is faster than real-time
- [ ] Test on mobile device
- [ ] Test on desktop browser
- [ ] Test with different workout types (pushup, pullup, situp, etc.)

## Performance Considerations

### Processing Speed Targets

| Video Duration | Target Processing Time | Target FPS |
|---------------|----------------------|-----------|
| 30 seconds | <25 seconds | >24 fps |
| 60 seconds | <50 seconds | >24 fps |
| 90 seconds | <75 seconds | >24 fps |

### Memory Management

1. **Frame Buffer Limits**
   - Maximum 3000 frames in memory (100s at 30fps)
   - If exceeded, process in chunks

2. **Canvas Optimization**
   - Use `willReadFrequently: true` for canvas context
   - Clear canvas between frames
   - Reuse canvas instances

3. **Landmark Storage**
   - Store only essential landmark data (x, y, z, visibility)
   - Compress landmark arrays if needed

### Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (with polyfills)
- Mobile browsers: Optimized for performance

## Implementation Plan

### Phase 1: Text Color Corrections (Quick Win)

1. Add CSS classes for black and white text
2. Update TestVideoProcessor JSX
3. Test contrast ratios
4. Deploy

**Estimated Time**: 30 minutes

### Phase 2: MediaPipe Configuration Optimization (Test Mode Only)

1. Create ProcessingConfig interface
2. Define TEST_MODE_CONFIG constant
3. Add optional `isTestMode` parameter to `processVideo()` method
4. Apply TEST_MODE_CONFIG only when `isTestMode === true`
5. **DO NOT modify Normal Mode processing** - keep all existing logic intact
6. Test with Test Mode videos only

**Estimated Time**: 1-2 hours

**Critical**: All changes must be conditional on `isTestMode` flag. Normal Mode must remain completely unchanged.

### Phase 3: Frame Processing Optimization (Test Mode Only)

1. Add conditional logic for Test Mode timeouts
2. Add conditional logic for Test Mode duplicate detection
3. Ensure Normal Mode uses existing timeouts and thresholds
4. Test frame count accuracy in Test Mode only
5. Verify Normal Mode is unaffected

**Estimated Time**: 2-3 hours

**Critical**: Use `if (isTestMode)` checks to apply optimizations only to Test Mode.

### Phase 4: Performance Testing & Tuning

1. Run performance tests
2. Measure processing speed
3. Tune configuration parameters
4. Verify smooth output
5. Test on multiple devices

**Estimated Time**: 1-2 hours

### Phase 5: Error Handling & Validation

1. Add frame retry logic
2. Add landmark validation
3. Add user warnings for low detection rates
4. Test error scenarios

**Estimated Time**: 1 hour

## Accessibility Considerations

### Color Contrast

- Black text on light backgrounds: 21:1 ratio (AAA)
- White text on dark buttons: 7:1 ratio (AAA)
- All text meets WCAG AA minimum (4.5:1)

### Screen Reader Support

- Informational text is readable by screen readers
- Button labels are descriptive
- Progress indicators have aria-labels

### Keyboard Navigation

- All buttons are keyboard accessible
- Focus indicators are visible
- Tab order is logical

## Security Considerations

- All processing happens client-side (no data sent to server)
- Video files are processed in memory only
- No persistent storage of video data
- User privacy is maintained

## Future Enhancements

1. **Web Worker Processing**: Move MediaPipe to Web Worker for better performance
2. **GPU Acceleration**: Use WebGL for faster frame processing
3. **Adaptive Quality**: Automatically adjust quality based on device performance
4. **Frame Interpolation**: Smooth output by interpolating between frames
5. **Batch Processing**: Process multiple frames in parallel
6. **Progressive Rendering**: Show partial results during processing

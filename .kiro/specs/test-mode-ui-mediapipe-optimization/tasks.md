# Implementation Plan

- [ ] 1. Fix Test Mode Output Screen Text Colors
  - Add CSS classes for black informational text in test-mode-theme.css
  - Add CSS classes for white button text in test-mode-theme.css
  - Update TestVideoProcessor.tsx to apply black color to "Video shows MediaPipe skeleton tracking and rep counting" text
  - Update TestVideoProcessor.tsx to apply black color to VLC hint text "💡 If video doesn't play, click 'Download Video' and open in VLC"
  - Update TestVideoProcessor.tsx to apply white color to "Open in New Tab" button text
  - Update TestVideoProcessor.tsx to apply white color to "Download Video" button text
  - Update TestVideoProcessor.tsx to apply white color to "Submit Workout" button text
  - Verify contrast ratios meet WCAG AA standards (4.5:1 minimum)
  - Test text visibility on different screen sizes
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 2. Add Test Mode Flag to MediaPipe Processor
  - Add optional `isTestMode?: boolean` parameter to `processVideo()` method signature in mediapipeProcessor.ts
  - Pass `isTestMode` flag through processing pipeline
  - Store `isTestMode` as instance variable for access in helper methods
  - Update TestWorkoutInterface.tsx to pass `isTestMode: true` when calling processVideo
  - Verify Normal Mode (VideoProcessor) does not pass isTestMode flag (defaults to false)
  - Add logging to confirm Test Mode vs Normal Mode detection
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 3. Implement Test Mode MediaPipe Configuration
  - Create conditional MediaPipe configuration in `initialize()` or `processVideo()` method
  - When `isTestMode === true`, set `smoothLandmarks: false` for faster processing
  - When `isTestMode === true`, set `minDetectionConfidence: 0.4` for faster detection
  - When `isTestMode === true`, set `minTrackingConfidence: 0.4` for faster tracking
  - When `isTestMode === false`, keep existing configuration unchanged (smoothLandmarks: true, confidence: 0.5)
  - Add console logging to show which configuration is being used
  - Test that Test Mode uses optimized config
  - Test that Normal Mode uses original config
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 4. Optimize Test Mode Frame Seeking Timeout
  - Locate seek timeout logic in `processVideoFrameByFrame()` function (around line 380)
  - Add conditional timeout: `const seekAttempts = isTestMode ? 40 : 60;`
  - Update seek wait loop to use `seekAttempts` variable instead of hardcoded 60
  - When `isTestMode === true`, use 40 attempts (200ms timeout) for faster seeking
  - When `isTestMode === false`, keep 60 attempts (300ms timeout) for existing behavior
  - Add logging to track seek performance in Test Mode
  - Test that Test Mode seeks faster without losing frames
  - Verify Normal Mode seeking behavior is unchanged
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 4.5, 8.1, 8.2_

- [ ] 5. Optimize Test Mode MediaPipe Processing Timeout
  - Locate MediaPipe processing timeout in `processVideoFrameByFrame()` function (around line 420)
  - Add conditional timeout: `const timeoutMs = isTestMode ? 300 : 500;`
  - Update timeout promise to use `timeoutMs` variable instead of hardcoded 500
  - When `isTestMode === true`, use 300ms timeout for faster processing
  - When `isTestMode === false`, keep 500ms timeout for existing behavior
  - Add logging to track processing speed in Test Mode
  - Test that Test Mode processes faster without skipping frames
  - Verify Normal Mode processing timeout is unchanged
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 4.5, 8.1, 8.2_

- [ ] 6. Adjust Test Mode Duplicate Frame Detection Threshold
  - Locate duplicate frame detection logic in `pose.onResults()` callback (around line 690)
  - Add conditional threshold: `const duplicateThreshold = isTestMode ? 2 : 5;`
  - Update duplicate detection to use `duplicateThreshold` variable instead of hardcoded 5
  - When `isTestMode === true`, use threshold of 2 (less aggressive, allows more frames)
  - When `isTestMode === false`, keep threshold of 5 (existing behavior)
  - Add logging to track duplicate frame detection rate
  - Test that Test Mode captures more frames without duplicates
  - Verify Normal Mode duplicate detection is unchanged
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 7. Add Frame Processing Progress Logging for Test Mode
  - Update progress logging to show frame processing rate (fps)
  - Add estimated time remaining calculation based on current processing speed
  - Display "Processing faster than real-time" message when applicable
  - Log total processing time at completion
  - Show frames processed vs total frames expected
  - Add Test Mode specific logging prefix for easy identification
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 8.1, 8.2, 8.3_

- [ ] 8. Verify Frame-by-Frame Processing Completeness
  - Add frame count validation at end of processing
  - Compare processed frame count with expected frame count (duration × fps)
  - Log warning if frame counts don't match
  - Add frame processing success rate metric
  - Verify no frames are skipped in Test Mode
  - Verify no frames are cut due to duplicate detection
  - Test with various video lengths (30s, 60s, 90s)
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 9. Test Processing Speed Performance
  - Test 60-second video processing time in Test Mode
  - Verify processing completes in less than 60 seconds (faster than real-time)
  - Measure average frame processing rate (should be >20 fps)
  - Test on different workout types (pushup, pullup, situp, shuttlerun, sit&reach, verticaljump)
  - Verify output video duration matches input video duration
  - Verify skeleton tracking is smooth and continuous
  - Verify rep counting accuracy is maintained
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 7.1, 7.2, 7.3, 7.4, 7.5, 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 10. Verify Normal Mode is Unaffected
  - Test Normal Mode video processing with sample video
  - Verify Normal Mode uses original MediaPipe configuration (smoothLandmarks: true, confidence: 0.5)
  - Verify Normal Mode uses original timeouts (60 attempts, 500ms)
  - Verify Normal Mode uses original duplicate threshold (5)
  - Verify Normal Mode processing behavior is identical to before changes
  - Compare Normal Mode output with baseline (before changes)
  - Ensure no regressions in Normal Mode functionality
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 11. Test Cross-Browser Compatibility
  - Test Test Mode processing in Chrome/Edge
  - Test Test Mode processing in Firefox
  - Test Test Mode processing in Safari (if available)
  - Test on mobile Chrome browser
  - Test on mobile Safari browser
  - Verify text colors display correctly in all browsers
  - Verify processing speed is acceptable in all browsers
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5, 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 12. End-to-End Test Mode Validation
  - Load test video in Test Mode
  - Verify processing starts immediately
  - Verify progress updates smoothly
  - Verify processing completes without errors
  - Verify output video plays smoothly
  - Verify skeleton tracking is continuous (no gaps or jumps)
  - Verify rep counting is accurate
  - Verify informational text is black and readable
  - Verify button text is white and readable
  - Verify "Submit Workout" button works correctly
  - Test complete workflow from video selection to results submission
  - _Requirements: All_

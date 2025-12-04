# Requirements Document

## Introduction

This feature addresses critical UI text visibility issues and MediaPipe frame processing optimization in Test Mode. The goal is to ensure all text elements have proper white color for readability against dark/red backgrounds, eliminate frame skipping during MediaPipe processing, and deliver smooth, continuous video output with accurate rep counting and skeleton tracking.

## Glossary

- **Test Mode**: Test evaluation interface with red/dark theme for pre-recorded test videos
- **MediaPipe**: AI-powered pose detection library used for skeleton tracking and rep counting
- **Frame Processing**: Individual video frame analysis by MediaPipe for pose landmark detection
- **Frame Skipping**: Undesirable behavior where video frames are not processed, causing jerky output
- **Frame Cutting**: Loss of video frames during processing, resulting in incomplete analysis
- **Skeleton Tracking**: Visual overlay showing detected body landmarks and connections
- **Rep Counting**: Automated counting of exercise repetitions based on pose analysis
- **Processing Screen**: Interface showing real-time MediaPipe analysis with skeleton overlay
- **Output Screen**: Results interface displaying processed video with metrics
- **UI Text Elements**: Informational text including hints, instructions, button labels, and status messages
- **Download Video Button**: Button allowing users to download processed video output
- **Open in New Tab Button**: Button allowing users to view video in separate browser tab
- **Submit Workout Button**: Button to finalize and save workout results
- **VLC Hint Text**: Informational message suggesting VLC player for video playback issues

## Requirements

### Requirement 1: Test Mode Informational Text Color - Black

**User Story:** As a user in Test Mode output screen, I want informational text to be black colored, so that I can easily read it against lighter backgrounds.

#### Acceptance Criteria

1. WHEN the Output Screen displays the text "Video shows MediaPipe skeleton tracking and rep counting", THE System SHALL render it in black color (#000000 or equivalent)
2. WHEN the Output Screen displays the VLC hint text "💡 If video doesn't play, click 'Download Video' and open in VLC", THE System SHALL render it in black color (#000000 or equivalent)
3. WHEN informational text is rendered in black, THE System SHALL ensure sufficient contrast with the background for readability
4. WHEN emoji icons (💡) are included in text, THE System SHALL preserve their native colors while rendering surrounding text in black
5. WHILE displaying informational messages, THE System SHALL maintain consistent black text color for all hint and description text

### Requirement 2: Test Mode Button Text Color - White

**User Story:** As a user viewing Test Mode output, I want button labels to be white colored, so that they stand out clearly against button backgrounds.

#### Acceptance Criteria

1. WHEN the "Open in New Tab" button is rendered in Test Mode output screen, THE System SHALL display the button text in white color (#ffffff or equivalent)
2. WHEN the "Download Video" button is rendered in Test Mode output screen, THE System SHALL display the button text in white color (#ffffff or equivalent)
3. WHEN the "Submit Workout" button is rendered in Test Mode output screen, THE System SHALL display the button text in white color (#ffffff or equivalent)
4. WHEN buttons are in hover state, THE System SHALL maintain white text color with appropriate background contrast enhancement
5. WHEN buttons are in disabled state, THE System SHALL use a lighter white or gray shade (e.g., #cccccc) to indicate disabled status while maintaining readability

### Requirement 3: MediaPipe Frame Processing Continuity

**User Story:** As a user processing a workout video, I want MediaPipe to analyze every frame without skipping, so that I get accurate rep counts and smooth skeleton tracking.

#### Acceptance Criteria

1. WHEN a video is being processed by MediaPipe, THE System SHALL process every video frame sequentially without skipping frames
2. WHEN MediaPipe processes a frame, THE System SHALL wait for pose detection to complete before advancing to the next frame
3. WHEN frame processing is slower than video playback rate, THE System SHALL pause video playback to maintain frame-by-frame synchronization
4. WHEN pose landmarks are detected in a frame, THE System SHALL store all landmark data before proceeding to the next frame
5. WHILE processing video, THE System SHALL maintain a processing queue that ensures no frames are dropped or skipped

### Requirement 4: MediaPipe Processing Performance Optimization

**User Story:** As a user processing a workout video, I want MediaPipe to deliver smooth output without cutting frames, so that the skeleton tracking appears fluid and natural.

#### Acceptance Criteria

1. WHEN MediaPipe processes video frames, THE System SHALL maintain consistent frame timing to prevent jerky output
2. WHEN rendering skeleton overlay, THE System SHALL interpolate between frames if processing rate is lower than display rate
3. WHEN video output is generated, THE System SHALL include all processed frames without cutting or removing any frames
4. WHEN frame processing encounters delays, THE System SHALL buffer frames rather than skip them
5. WHILE maintaining processing accuracy, THE System SHALL optimize MediaPipe configuration for smooth 30fps output or match source video frame rate

### Requirement 5: MediaPipe Configuration Optimization for Speed and Accuracy

**User Story:** As a user in Test Mode, I want MediaPipe to process videos quickly while maintaining accurate and smooth results, so that I can complete my test evaluation efficiently.

#### Acceptance Criteria

1. WHEN MediaPipe Pose is initialized in Test Mode, THE System SHALL configure it with optimal model complexity that prioritizes both processing speed and pose detection accuracy
2. WHEN MediaPipe processes frames in Test Mode, THE System SHALL use appropriate smoothing parameters to reduce jitter while maintaining responsiveness for quick processing
3. WHEN video resolution is high, THE System SHALL scale frames to optimal processing resolution (e.g., 640x480 or 1280x720) before MediaPipe analysis to improve processing speed
4. WHEN MediaPipe detects poses, THE System SHALL use confidence thresholds that balance detection accuracy with processing speed to ensure quick results
5. WHILE processing video in Test Mode, THE System SHALL optimize frame processing pipeline to achieve faster-than-realtime processing speed (e.g., process 30fps video in less than video duration) while maintaining smooth and accurate skeleton tracking and rep counting

### Requirement 6: Frame-by-Frame Processing Guarantee

**User Story:** As a user, I want assurance that every frame of my workout video is analyzed, so that no reps are missed and tracking is complete.

#### Acceptance Criteria

1. WHEN video processing begins, THE System SHALL calculate total frame count based on video duration and frame rate
2. WHEN processing is in progress, THE System SHALL display current frame number and total frame count
3. WHEN processing completes, THE System SHALL verify that processed frame count equals total frame count
4. WHEN a frame fails to process, THE System SHALL retry processing that frame up to 3 times before logging an error
5. WHILE processing video, THE System SHALL maintain a frame processing log that tracks successful and failed frame analyses

### Requirement 7: Smooth Output Video Rendering

**User Story:** As a user viewing processed output, I want the video with skeleton overlay to play smoothly, so that I can clearly see my form and rep counting.

#### Acceptance Criteria

1. WHEN output video is rendered, THE System SHALL encode video at consistent frame rate matching source video or 30fps minimum
2. WHEN skeleton overlay is drawn on output frames, THE System SHALL ensure all landmark connections are rendered without gaps
3. WHEN rep count changes, THE System SHALL display the updated count smoothly without flickering
4. WHEN output video is played back, THE System SHALL maintain synchronization between video frames and skeleton overlay
5. WHILE rendering output, THE System SHALL use canvas rendering optimizations to prevent dropped frames during playback


### Requirement 8: Test Mode Processing Speed Performance

**User Story:** As a user in Test Mode, I want video processing to complete quickly, so that I can get my test results without long waiting times.

#### Acceptance Criteria

1. WHEN a video is processed in Test Mode, THE System SHALL complete processing faster than the video's actual duration (e.g., a 60-second video should process in less than 60 seconds)
2. WHEN MediaPipe analyzes frames in Test Mode, THE System SHALL optimize computational resources to maximize processing throughput
3. WHEN processing progress is displayed, THE System SHALL show estimated time remaining based on current processing speed
4. WHEN Test Mode processing is active, THE System SHALL prioritize processing speed optimizations while maintaining minimum accuracy thresholds for rep counting
5. WHILE processing video quickly, THE System SHALL ensure that speed optimizations do not compromise the smoothness of skeleton tracking or accuracy of rep detection

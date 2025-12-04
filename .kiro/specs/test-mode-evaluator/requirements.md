# Requirements Document

## Introduction

The Test Mode feature provides a streamlined workout evaluation interface designed specifically for Talent Track evaluators. Unlike Ghost Mode which offers live camera and upload options, Test Mode automatically loads pre-recorded test videos for each workout type, enabling consistent evaluation without requiring evaluators to perform exercises or upload their own videos. The interface uses a red theme to visually distinguish it from Ghost Mode.

## Glossary

- **Test Mode**: A workout evaluation mode designed for Talent Track evaluators that uses pre-loaded test videos
- **Ghost Mode**: The existing workout mode that allows users to compare their performance against reference videos
- **Talent Track**: A program or system that requires workout evaluation
- **Test Video**: Pre-recorded workout demonstration videos stored in the application
- **Workout Interface**: The UI component that displays workout execution and analysis
- **MediaPipe Processor**: The service that analyzes pose landmarks from video input
- **Frontend Bundle**: The compiled application assets deployed to Vercel

## Requirements

### Requirement 1

**User Story:** As a Talent Track evaluator, I want to access a dedicated Test Mode from the home screen, so that I can evaluate workout performances using standardized test videos.

#### Acceptance Criteria

1. THE System SHALL display a "Test Mode" option on the home screen with a red theme indicator
2. WHEN an evaluator selects Test Mode, THE System SHALL navigate to a test mode workout selection interface
3. THE Test Mode interface SHALL use a red color scheme to distinguish it from Ghost Mode
4. THE System SHALL display all available workout types in the Test Mode selection interface

### Requirement 2

**User Story:** As a Talent Track evaluator, I want to select a workout and immediately start the test video, so that I can quickly evaluate performance without choosing input methods.

#### Acceptance Criteria

1. WHEN an evaluator selects a workout in Test Mode, THE System SHALL display a "Start Workout" button
2. THE System SHALL NOT display "Live Mode" or "Upload Mode" options in Test Mode
3. WHEN the evaluator clicks "Start Workout", THE System SHALL automatically load the corresponding pre-recorded test video
4. THE System SHALL map each workout type to its corresponding test video file (pullup.mp4, pushup.mp4, shuttlerun.mp4, sit&reach.mp4, situp.mp4, vertical.mp4)

### Requirement 3

**User Story:** As a Talent Track evaluator, I want test videos to be bundled with the application, so that I can evaluate workouts without requiring evaluators to upload videos.

#### Acceptance Criteria

1. THE System SHALL store test videos in the public assets directory for frontend access
2. THE System SHALL include test videos in the Vercel deployment bundle
3. WHEN Test Mode loads a workout, THE System SHALL retrieve the video from the bundled assets
4. THE System SHALL support the following video files: pullup.mp4, pushup.mp4, shuttlerun.mp4, sit&reach.mp4, situp.mp4, vertical.mp4

### Requirement 4

**User Story:** As a Talent Track evaluator, I want the test video to be processed with MediaPipe analysis using the same workflow as normal workout mode, so that I can see pose detection and workout metrics in a familiar interface.

#### Acceptance Criteria

1. WHEN the evaluator clicks "Start Workout" in Test Mode, THE System SHALL automatically process the pre-loaded test video through MediaPipe
2. THE System SHALL display a processing screen with live preview, progress bar, and real-time metrics (same as normal workout mode but with red theme)
3. WHEN processing completes, THE System SHALL display a results screen with the annotated video player, metrics grid, and performance summary (same as normal workout mode but with red theme)
4. THE System SHALL use the same MediaPipe processing logic and VideoProcessor component structure as normal workout mode
5. THE System SHALL display the skeleton overlay on the processed video output
6. THE System SHALL calculate and display workout-specific metrics (reps, form quality, angles, etc.)

### Requirement 5

**User Story:** As a developer, I want Test Mode to be implemented in separate files, so that existing Ghost Mode and workout functionality remains unaffected.

#### Acceptance Criteria

1. THE System SHALL create new component files for Test Mode functionality
2. THE System SHALL NOT modify existing Ghost Mode component files
3. THE System SHALL reuse existing services (MediaPipe Processor) without modification where possible
4. THE System SHALL maintain separation between Test Mode and Ghost Mode routing and navigation

### Requirement 6

**User Story:** As a Talent Track evaluator, I want a consistent red-themed interface throughout Test Mode, so that I can easily identify when I'm in evaluation mode.

#### Acceptance Criteria

1. THE Test Mode interface SHALL use red as the primary accent color
2. THE System SHALL apply red theming to buttons, headers, and interactive elements in Test Mode
3. THE System SHALL maintain visual consistency with the overall application design while using the red theme
4. THE System SHALL clearly differentiate Test Mode visually from Ghost Mode's theme

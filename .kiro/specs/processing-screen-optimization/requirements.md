# Requirements Document

## Introduction

This feature focuses on optimizing the processing preview and output screens for both normal mode (original VideoProcessor) and test mode across mobile and desktop (PC) views. The goal is to restructure the mobile processing layout, implement bright red gradient theme for test mode, optimize video sizing on PC output screens, fix GIF visibility issues, and ensure consistent visual hierarchy across all modes and devices.

## Glossary

- **Processing Screen**: The interface displayed while video is being analyzed by MediaPipe AI
- **Output Screen**: The results interface showing workout metrics and performance data after processing
- **Normal Mode**: Original VideoProcessor interface for standard workout processing
- **Test Mode**: Test evaluation interface with red theme for pre-recorded test videos
- **GIF Display**: Animated demonstration of workout form
- **Metric Boxes**: UI cards displaying workout statistics (reps, time, form score, etc.)
- **Live Processing Section**: Real-time video preview showing MediaPipe skeleton overlay during analysis
- **Processing Progress Section**: Progress bar and status indicators showing analysis completion percentage
- **Live Metrics Section**: Real-time workout statistics displayed during processing
- **Privacy Text**: Informational text explaining browser-based processing and background operation
- **Bright Red Gradient**: Vibrant red gradient background (e.g., from #ff0000 to #cc0000) used in test mode
- **PC View**: Desktop/laptop screen layout optimizations (typically >1024px width)
- **Mobile View**: Smartphone/tablet layout optimizations (typically <768px width)

## Requirements

### Requirement 1: Mobile Processing Screen Layout Restructuring

**User Story:** As a mobile user, I want the processing screen to display information in a clear vertical hierarchy, so that I can easily track my workout analysis progress.

#### Acceptance Criteria

1. WHEN the Processing Screen is displayed on mobile in Normal Mode, THE System SHALL render the Live Processing Section at the top of the screen
2. WHEN the Live Processing Section is rendered, THE System SHALL display the Processing Progress Section immediately below it
3. WHEN the Processing Progress Section is rendered, THE System SHALL display the Live Metrics Section immediately below it
4. WHEN the Live Metrics Section is rendered, THE System SHALL display the Privacy Text at the bottom with the messages "💡 Processing happens entirely in your browser - no data is sent to any server!" and "⚡ Processing continues even when this tab is minimized or inactive"
5. WHEN the Processing Screen is displayed on mobile in Test Mode, THE System SHALL follow the same vertical layout order as Normal Mode

### Requirement 2: PC Processing Screen Layout Optimization

**User Story:** As a desktop user, I want the processing screen to utilize my larger screen space effectively, so that I can view all information without excessive scrolling.

#### Acceptance Criteria

1. WHEN the Processing Screen is displayed on PC in Normal Mode, THE System SHALL center-align the Live Metrics Section below the Live Processing Section
2. WHEN the Processing Screen is displayed on PC in Test Mode, THE System SHALL center-align the Live Metrics Section below the Live Processing Section
3. WHEN the Live Metrics Section is rendered on PC, THE System SHALL apply appropriate maximum width constraints for optimal readability
4. WHEN the Processing Progress Section is displayed on PC, THE System SHALL maintain centered alignment consistent with other sections
5. WHILE the Processing Screen is active on PC, THE System SHALL ensure all sections are visible without requiring vertical scrolling during normal operation

### Requirement 3: PC Output Screen Video Size Optimization

**User Story:** As a desktop user viewing workout results, I want the output video to fit on screen without scrolling, so that I can see both the video and metrics simultaneously.

#### Acceptance Criteria

1. WHEN the Output Screen is displayed on PC in Normal Mode, THE System SHALL size the output video to fit within the viewport without requiring vertical scrolling to view metrics
2. WHEN the Output Screen is displayed on PC in Test Mode, THE System SHALL size the output video to fit within the viewport without requiring vertical scrolling to view metrics
3. WHEN the output video is rendered on PC, THE System SHALL maintain the video's aspect ratio while constraining its maximum height
4. WHEN metrics are displayed below the video on PC, THE System SHALL ensure all primary metrics are visible without scrolling
5. WHILE viewing the Output Screen on PC, THE System SHALL allow the user to see the complete video player and at least the first row of metrics without scrolling

### Requirement 4: Test Mode GIF Visibility Fix

**User Story:** As a user in Test Mode, I want to see workout demonstration GIFs in the workout details screen, so that I understand the proper form before starting the test.

#### Acceptance Criteria

1. WHEN the Test Mode workout details screen is displayed, THE System SHALL render the workout demonstration GIF with full visibility
2. WHEN the GIF is rendered in Test Mode, THE System SHALL apply Test Mode theme styling without obscuring the GIF content
3. WHEN the GIF container is styled, THE System SHALL ensure sufficient contrast between the GIF and its background
4. WHILE the GIF is loading, THE System SHALL display a loading indicator with Test Mode theme colors
5. WHEN the GIF fails to load, THE System SHALL display an appropriate fallback image or icon

### Requirement 5: Test Mode Bright Red Gradient Theme Implementation

**User Story:** As a user in Test Mode, I want the processing screen to have a distinctive bright red theme, so that I can clearly distinguish test mode from normal workout mode.

#### Acceptance Criteria

1. WHEN the Processing Progress Section is displayed in Test Mode, THE System SHALL apply a bright red gradient background
2. WHEN text is rendered within the Processing Progress Section in Test Mode, THE System SHALL display the text in black color for maximum contrast
3. WHEN the Live Processing Section is displayed in Test Mode, THE System SHALL apply a bright red gradient container background
4. WHEN the Live Metrics Section is displayed in Test Mode, THE System SHALL apply a bright red gradient container background with white inner metric containers
5. WHEN the Privacy Text is displayed in Test Mode, THE System SHALL render black text on a bright red gradient background

### Requirement 6: Test Mode Bright Red Gradient Styling Consistency

**User Story:** As a user in Test Mode, I want all processing screen sections to have consistent bright red gradient styling, so that the visual theme is cohesive throughout the experience.

#### Acceptance Criteria

1. WHEN any container in Test Mode Processing Screen uses bright red gradient, THE System SHALL apply gradient-based bright red colors (e.g., from #ff0000 to #cc0000 or similar vibrant red spectrum)
2. WHEN the Processing Progress Section background is rendered, THE System SHALL use bright red gradient styling
3. WHEN the Live Processing Section container is rendered, THE System SHALL use bright red gradient styling
4. WHEN the Live Metrics Section outer container is rendered, THE System SHALL use bright red gradient styling
5. WHEN the Privacy Text container is rendered, THE System SHALL use bright red gradient styling

### Requirement 7: Test Mode Text Color Contrast for Readability

**User Story:** As a user in Test Mode, I want text to be clearly readable against bright red backgrounds, so that I can easily read all information during workout processing.

#### Acceptance Criteria

1. WHEN text is displayed on bright red gradient backgrounds in Test Mode, THE System SHALL use black text color for optimal contrast
2. WHEN metric values are displayed within white inner containers in Test Mode, THE System SHALL maintain appropriate text colors that differ from the container background
3. WHEN the Processing Progress text is rendered, THE System SHALL display it in black color against the bright red gradient background
4. WHEN the Privacy Text is rendered, THE System SHALL display it in black color against the bright red gradient background
5. WHILE maintaining Test Mode theme consistency, THE System SHALL ensure all text meets minimum readability standards against their respective backgrounds

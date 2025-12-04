# Implementation Plan

- [x] 1. Restructure Mobile Processing Screen Layout for Normal Mode




  - Reorder VideoProcessor processing screen components to: Live Processing (top) → Processing Progress → Live Metrics → Privacy Text (bottom)
  - Implement vertical flex layout with proper spacing (space-y-4)
  - Add Privacy Text section with two messages: "💡 Processing happens entirely in your browser - no data is sent to any server!" and "⚡ Processing continues even when this tab is minimized or inactive"
  - Ensure layout applies to mobile viewports (<768px)
  - Test component ordering on mobile devices
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 2. Restructure Mobile Processing Screen Layout for Test Mode



  - Apply same component ordering to TestVideoProcessor: Live Processing → Processing Progress → Live Metrics → Privacy Text
  - Maintain vertical flex layout consistent with normal mode
  - Ensure Privacy Text displays correctly in test mode theme
  - Test layout on mobile devices
  - _Requirements: 1.5_


- [x] 3. Implement PC Processing Screen Centered Layout for Normal Mode


  - Center-align Live Metrics Section using mx-auto and max-width constraints
  - Center-align Processing Progress Section
  - Center-align Privacy Text Section
  - Apply desktop-specific styling for viewports >1024px
  - Test centering on various desktop resolutions
  - _Requirements: 2.1, 2.3, 2.4, 2.5_


- [x] 4. Implement PC Processing Screen Centered Layout for Test Mode


  - Apply same centering strategy to TestVideoProcessor
  - Ensure all sections (Live Processing, Progress, Metrics, Privacy) are centered
  - Maintain consistent max-width constraints
  - Test on desktop viewports
  - _Requirements: 2.2, 2.3, 2.4, 2.5_


- [x] 5. Optimize PC Output Screen Video Sizing for Normal Mode


  - Constrain VideoProcessor output video to max-h-[50vh]
  - Apply object-fit: contain to maintain aspect ratio
  - Ensure first row of metrics visible without scrolling
  - Implement responsive max-heights: mobile (40vh), tablet (45vh), desktop (50vh), large (55vh)
  - Test at multiple desktop resolutions (1920x1080, 2560x1440)
  - _Requirements: 3.1, 3.3, 3.4, 3.5_


- [x] 6. Optimize PC Output Screen Video Sizing for Test Mode


  - Apply same video size constraints to TestVideoProcessor output screen
  - Ensure metrics grid visible without scrolling
  - Test video sizing with test mode theme
  - Verify responsive behavior across breakpoints
  - _Requirements: 3.2, 3.3, 3.4, 3.5_


- [x] 7. Fix GIF Visibility in TestWorkoutDetail


  - Add GIF display component to TestWorkoutDetail screen
  - Implement GIF path mapping for test activities (pushup, pullup, situp, shuttlerun, sit&reach, verticaljump, kneepushup)
  - Use /ghost/ directory for GIF sources
  - Add loading state with test mode themed spinner
  - Implement error fallback with appropriate icon
  - Apply test mode styling (red border, dark background)
  - Position GIF prominently before instructions
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_


- [x] 8. Implement Bright Red Gradient for Test Mode Processing Progress Section


  - Create bright red gradient background (linear-gradient from #ff0000 to #cc0000 or similar vibrant spectrum)
  - Apply gradient to Processing Progress Section container in TestVideoProcessor
  - Update progress bar styling to work with bright red background
  - Change all text within section to black color (#000000)
  - Apply font-weight: 600 for better visibility
  - Test contrast ratio meets WCAG AA standards
  - _Requirements: 5.1, 5.2, 6.2, 7.1, 7.3_


- [x] 9. Implement Bright Red Gradient for Test Mode Live Processing Section


  - Apply bright red gradient background to Live Processing Section container
  - Ensure video canvas visibility against red background
  - Update any overlays or badges to work with red theme
  - Test MediaPipe skeleton visibility
  - _Requirements: 5.3, 6.3_



- [x] 10. Implement Bright Red Gradient for Test Mode Live Metrics Section


  - Apply bright red gradient to outer Live Metrics Section container
  - Create white inner containers for individual metric boxes (bg-white)
  - Update metric value colors to be vibrant on white background (red-600, green-600, orange-600)
  - Update metric labels to dark gray (gray-700) on white
  - Ensure proper spacing and padding
  - Test readability of colored text on white backgrounds

  - _Requirements: 5.4, 6.4, 7.2_



- [x] 11. Implement Bright Red Gradient for Test Mode Privacy Text Section


  - Apply bright red gradient background to Privacy Text container
  - Change Privacy Text to black color (#000000)
  - Maintain emoji icons (💡 and ⚡)
  - Apply appropriate padding and rounded corners

  - Test text readability on bright red background
  - _Requirements: 5.5, 6.5, 7.4_

- [x] 12. Update Test Mode Theme CSS


  - Add bright red gradient CSS custom properties to test-mode-theme.css
  - Define gradient variants (linear, radial, animated options)
  - Create utility classes for bright red containers
  - Add black text color utilities for test mode
  - Define white inner container styles
  - Ensure CSS cascade works correctly
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [x] 13. Verify Color Contrast and Accessibility


  - Test black text on bright red gradient meets WCAG AA (>4.5:1)
  - Verify colored text on white backgrounds meets WCAG AAA (>7:1)
  - Check all text is readable in different lighting conditions
  - Test with browser accessibility tools
  - Validate focus indicators are visible

  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_


- [x] 14. Test Responsive Behavior Across All Breakpoints


  - Test mobile layout (375px, 414px, 768px)
  - Test tablet layout (768px, 1024px)
  - Test desktop layout (1024px, 1440px, 1920px)
  - Verify component ordering on mobile
  - Verify centering on desktop
  - Test video sizing at all breakpoints
  - Ensure smooth transitions between breakpoints

  - _Requirements: 1.1, 1.5, 2.1, 2.2, 3.1, 3.2_

- [x] 15. Cross-Browser and Performance Testing


  - Test in Chrome/Edge (Chromium)
  - Test in Firefox
  - Test in Safari (macOS and iOS)
  - Test in mobile browsers (Chrome Mobile, Safari Mobile)
  - Measure layout shift (CLS < 0.1)
  - Test GIF loading performance
  - Verify gradient rendering performance
  - Check video playback performance
  - _Requirements: All_

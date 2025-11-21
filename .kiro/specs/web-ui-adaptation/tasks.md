# Implementation Plan

## Authentication Pages Optimization

- [x] 1. Optimize Login Page for desktop


  - Create centered card layout with max-width 480px for screens ≥1024px
  - Add responsive background gradient that scales for larger screens
  - Implement proper form field sizing (320px-480px width range)
  - Ensure mobile full-width layout remains unchanged
  - _Requirements: 11.1, 11.3, 11.4, 11.5_

- [x] 2. Redesign User Preference Setup Form


  - Implement 2-column grid layout for desktop screens (≥1024px)
  - Group related fields (height/weight, age/gender) in same row
  - Add progress indicator at top showing setup completion
  - Organize form into logical sections: Personal Info, Fitness Profile, Notifications, Privacy
  - Maintain single-column layout for mobile screens
  - _Requirements: 11.2, 11.4, 11.5_

## Weekly Progress Component Redesign

- [x] 3. Create horizontal weekly progress layout


  - Implement 7-column CSS Grid for desktop (one column per day)
  - Add week navigation with previous/next arrow buttons
  - Display daily metrics (workouts, calories, active minutes) in compact cards
  - Limit vertical height to maximum 400px with internal scrolling if needed
  - Add hover state to reveal detailed breakdown for each day
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [x] 4. Integrate redesigned weekly progress into Report page

  - Replace existing vertical weekly progress with new horizontal component
  - Ensure component fits within center column of dashboard layout
  - Test with multiple weeks of data to verify horizontal scrolling/pagination
  - Maintain vertical stacked layout for mobile screens
  - _Requirements: 12.1, 12.5_

## Activity Grid Layout Enhancement

- [x] 5. Update activity grid to 3-column layout for desktop


  - Modify ActivityGrid component to use responsive grid: 1 col (mobile), 2 cols (tablet), 3 cols (desktop)
  - Set proper gap spacing (16px-24px) between cards
  - Ensure cards maintain consistent aspect ratio (4:3) across all layouts
  - Add hover scale effect for desktop (scale-105)
  - Test with varying numbers of activities to ensure proper wrapping
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

- [x] 6. Optimize activity card content for desktop

  - Implement quick start button that appears on hover (desktop only)
  - Ensure background images/videos scale properly
  - Add duration and difficulty badges with proper positioning
  - Test touch interactions remain functional on mobile
  - _Requirements: 13.3, 13.5_

## Report Page Desktop Revamp

- [x] 7. Implement 3-column dashboard layout


  - Create CSS Grid with columns: 320px (left), 1fr (center), 320px (right)
  - Set maximum width to 1600px with centered alignment
  - Add proper gap spacing (24px) between columns
  - Ensure single-column layout for mobile and tablet screens
  - _Requirements: 14.1, 14.2, 14.3, 14.4_

- [x] 8. Build left column components (BMI & body metrics)

  - Move BMI Tracker to left column with 320px max width
  - Add body composition metrics card
  - Create weight trend mini-chart component
  - Display quick stats (total workouts, current streak)
  - Style cards with backdrop blur and border effects
  - _Requirements: 14.2_

- [x] 9. Build center column components (charts & trends)

  - Integrate redesigned horizontal weekly progress chart
  - Add performance trends line graph
  - Create activity distribution pie chart
  - Implement monthly comparison bar chart
  - Ensure charts scale to fill available width (~50% of viewport)
  - _Requirements: 14.3_

- [x] 10. Build right column components (recent activity)

  - Create recent workouts list showing last 5 workouts
  - Add latest achievements badges section
  - Display upcoming challenges card
  - Show personal records highlights
  - Maintain 320px max width for column
  - _Requirements: 14.4_

- [x] 11. Implement collapsible sections for dashboard


  - Add expand/collapse toggle to each major section
  - Persist collapse state in localStorage
  - Implement smooth height transitions (300ms)
  - Ensure accessibility with proper ARIA attributes
  - _Requirements: 14.5_

## Workout Detail Page Optimization

- [x] 12. Implement 40-60 split layout for ActivityDetail


  - Create CSS Grid with 40% left column and 60% right column for desktop
  - Build left column: workout metadata, equipment, muscle groups, action buttons
  - Build right column: exercise list with demonstrations
  - Add full-width bottom section for statistics cards
  - Maintain vertical stacked layout for mobile screens
  - _Requirements: 15.1, 15.5_

- [x] 13. Optimize exercise demonstration videos

  - Set minimum width of 480px for video players on desktop
  - Maintain proper aspect ratio (16:9) for all videos
  - Add rounded corners and border styling
  - Ensure videos load efficiently with lazy loading
  - Display exercise metadata: name, sets/reps, rest period, form tips
  - _Requirements: 15.2, 15.4_

- [x] 14. Create statistics cards section

  - Design horizontal card layout for workout statistics
  - Display previous attempts timeline
  - Add user comments/notes section
  - Implement responsive grid that adapts to available width
  - Style with consistent card design (backdrop blur, borders)
  - _Requirements: 15.3_

## Ghost Mode Workout Detail Optimization

- [x] 15. Implement side-by-side video comparison layout



  - Create 50-50 split grid for user vs ghost performance videos
  - Add synchronized playback controls for both videos
  - Implement timeline scrubber with rep markers
  - Ensure videos maintain aspect ratio and equal sizing
  - Add border styling to distinguish active video
  - _Requirements: 16.1, 16.4, 16.5_

- [x] 16. Build metrics comparison section


  - Create side-by-side comparison table for key metrics
  - Display: total reps, time, form score, pace
  - Add visual indicators (icons/colors) for better/worse/equal performance
  - Calculate and highlight performance differences
  - Style with horizontal card layout below video comparison
  - _Requirements: 16.2_

- [x] 17. Implement rep-by-rep analysis table


  - Create horizontal scrollable table for detailed rep analysis
  - Add columns: Rep #, User Time, Ghost Time, Difference
  - Implement color coding: green (faster), red (slower), gray (equal)
  - Display form score comparison per rep
  - Ensure table is responsive with proper overflow handling
  - _Requirements: 16.3_

## Sidebar Navigation Implementation

- [x] 18. Create desktop sidebar navigation component

  - Build fixed sidebar (264px width, 100vh height) for screens ≥1024px
  - Add gradient background (purple-900 to purple-950)
  - Implement three sections: brand header, navigation items, user profile
  - Hide sidebar on mobile/tablet screens (< 1024px)
  - Ensure bottom navigation remains visible on mobile
  - _Requirements: 2.1, 2.5_

- [x] 19. Implement navigation items and interactions

  - Add navigation items: Training, Discover, Report, Roadmap, Badges
  - Include icons and labels for each item
  - Implement active state highlighting with background color
  - Add hover effects (bg-white/10) for better UX
  - Handle navigation routing on item click
  - _Requirements: 2.2, 2.3_

- [x] 20. Build user profile section in sidebar

  - Add user avatar thumbnail at bottom of sidebar
  - Display user name and role
  - Include settings gear icon button
  - Add logout button with confirmation
  - Make section sticky at bottom of sidebar
  - _Requirements: 2.4_

## Responsive Infrastructure & Polish

- [x] 21. Create responsive utility hooks


  - Implement useResponsive hook with breakpoint detection
  - Add debounced resize handler (150ms delay)
  - Export boolean flags: isMobile, isTablet, isDesktop, isWideDesktop
  - Create LayoutContext for sharing responsive state
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 22. Update Tailwind configuration


  - Add custom breakpoints (xs: 480px, 3xl: 1920px)
  - Define custom max-width utilities (8xl: 1600px)
  - Add custom grid template columns for dashboard and workout layouts
  - Configure CSS custom properties for responsive spacing
  - _Requirements: 1.5_

- [x] 23. Implement responsive container components

  - Create ResponsiveContainer wrapper with max-width constraints
  - Add PageContainer with responsive padding
  - Build CardContainer with adaptive spacing
  - Ensure containers adapt padding/margin by breakpoint
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 24. Optimize modal and overlay sizing

  - Constrain modal max-width to 800px on desktop screens
  - Center modals horizontally with proper backdrop
  - Apply backdrop blur effects consistently
  - Ensure close buttons are easily accessible
  - Maintain full-screen modals for mobile (< 768px)
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 25. Adjust typography and spacing for desktop

  - Increase base font sizes by 10% for screens ≥1024px
  - Update padding and margin values for cards and containers
  - Adjust line heights and letter spacing for readability
  - Maintain mobile-optimized typography for screens < 768px
  - Test text legibility across all breakpoints
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 26. Implement performance optimizations

  - Add code splitting for desktop-only components
  - Implement lazy loading for images in activity grids
  - Optimize chart library loading (load on demand)
  - Add skeleton loaders for dynamic content
  - Measure and optimize Cumulative Layout Shift (CLS < 0.1)
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 27. Add accessibility enhancements

  - Ensure keyboard navigation works for sidebar
  - Add ARIA labels to all navigation items
  - Maintain 44px minimum touch targets on mobile
  - Test with screen readers and fix issues
  - Verify color contrast meets WCAG AA standards
  - _Requirements: 2.2, 2.3_

- [x] 28. Cross-browser testing and fixes


  - Test all layouts on Chrome, Firefox, Safari, Edge
  - Verify CSS Grid and Flexbox support
  - Fix any vendor-specific rendering issues
  - Test responsive behavior on actual devices
  - Validate MediaPipe continues to function correctly
  - _Requirements: 5.5, 10.5_

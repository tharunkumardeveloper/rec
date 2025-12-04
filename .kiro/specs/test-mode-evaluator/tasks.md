# Implementation Plan

- [x] 1. Set up Test Mode infrastructure and video assets


  - Move test videos from `test video/` folder to `public/test-videos/` directory
  - Verify all 6 video files are present (pullup.mp4, pushup.mp4, shuttlerun.mp4, sit&reach.mp4, situp.mp4, vertical.mp4)
  - Create video mapping configuration for workout-to-video association
  - _Requirements: 3.1, 3.2, 3.3_









- [x] 2. Create Test Mode tab component


  - [ ] 2.1 Implement TestModeTab.tsx component
    - Create component with red-themed gradient background (from-red-950 via-gray-900 to-red-950)





    - Display grid of available workouts with images
    - Add red-themed styling for cards, borders, and interactive elements
    - Implement workout selection handler
    - _Requirements: 1.1, 1.2, 1.3, 6.1, 6.2, 6.3_





- [x] 3. Create Test Mode workout detail component

  - [x] 3.1 Implement TestWorkoutDetail.tsx component


    - Create component structure similar to GhostWorkoutDetail but with red theme
    - Display workout information (description, muscles, steps, mistakes)




    - Show single "Start Workout" button (no Live/Upload mode options)
    - Apply red color scheme to all UI elements

    - _Requirements: 2.1, 2.2, 6.1, 6.2, 6.3, 6.4_



- [ ] 4. Create Test Mode workout interface component
  - [ ] 4.1 Implement TestWorkoutInterface.tsx component
    - Fetch test video from public directory based on workout type using video mapping
    - Convert fetched video to File object

    - Pass video File to VideoProcessor component (reuse from normal workout mode)



    - Apply red theme styling via CSS class wrapper or theme context
    - Handle completion callback to save results with isTestMode flag
    - _Requirements: 2.3, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 6.1, 6.2, 6.3_



- [ ] 5. Apply red theme to VideoProcessor for Test Mode
  - [ ] 5.1 Create red theme CSS overrides or theme context
    - Define red color variants for primary colors
    - Override progress bar colors to red gradient

    - Update badge and card styling to red theme


    - Modify border and shadow colors to red tones
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  
  - [x] 5.2 Test VideoProcessor with red theme


    - Verify processing screen displays with red theme
    - Verify results screen displays with red theme
    - Ensure all metrics and video player work correctly
    - Confirm skeleton overlay renders properly



    - _Requirements: 4.1, 4.2, 4.3, 4.5, 4.6_

- [ ] 6. Integrate Test Mode into main application
  - [ ] 6.1 Update HomeScreen.tsx
    - Add Test Mode banner with red theme below Ghost Mode banner
    - Implement click handler to navigate to Test Mode
    - Use red gradient background and red-themed icons
    - _Requirements: 1.1, 1.2, 6.1, 6.2, 6.3_

  - [ ] 6.2 Update Index.tsx routing
    - Add 'test-mode' tab to navigation state
    - Implement routing logic to display TestModeTab
    - Handle navigation from TestModeTab to TestWorkoutDetail to TestWorkoutInterface
    - Maintain separation from Ghost Mode routing
    - _Requirements: 1.2, 5.4_

- [ ] 7. Verify deployment configuration
  - Confirm test videos in public/test-videos/ are tracked in git
  - Verify videos are included in Vercel build
  - Test video loading from deployed application
  - _Requirements: 3.2, 3.3_

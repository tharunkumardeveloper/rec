# System Architecture - Talent Track Workout App

## Overview

The Talent Track Workout App uses a hybrid architecture combining React frontend, Node.js backend, and Python ML processing for real-time workout analysis.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
│                    (React + TypeScript)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │   Training   │  │   Discover   │  │    Report    │        │
│  │     Tab      │  │     Tab      │  │     Tab      │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
│                                                                 │
│  ┌─────────────────────────────────────────────────────┐      │
│  │         Workout Interface Component                  │      │
│  │  ┌────────────────┐  ┌────────────────────────┐    │      │
│  │  │ Upload Screen  │→ │  Video Processor       │    │      │
│  │  │ - File Upload  │  │  - Processing UI       │    │      │
│  │  │ - Live Record  │  │  - Results Display     │    │      │
│  │  └────────────────┘  └────────────────────────┘    │      │
│  └─────────────────────────────────────────────────────┘      │
│                           ↓                                     │
│                  workoutService.ts                             │
│                  (API Communication)                           │
└─────────────────────────────────────────────────────────────────┘
                            ↓ HTTP/REST
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND SERVER                             │
│                    (Node.js + Express)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  API Endpoints:                                                │
│  ┌────────────────────────────────────────────────────┐       │
│  │ POST /api/process-video                            │       │
│  │  - Receives video file                             │       │
│  │  - Spawns Python process                           │       │
│  │  - Returns processed results                       │       │
│  └────────────────────────────────────────────────────┘       │
│                                                                 │
│  ┌────────────────────────────────────────────────────┐       │
│  │ POST /api/start-live-recording                     │       │
│  │  - Initiates live camera processing                │       │
│  │  - Manages Python script execution                 │       │
│  └────────────────────────────────────────────────────┘       │
│                                                                 │
│  ┌────────────────────────────────────────────────────┐       │
│  │ GET /api/results/:outputId                         │       │
│  │  - Retrieves processing results                    │       │
│  │  - Returns CSV data and video URL                  │       │
│  └────────────────────────────────────────────────────┘       │
│                                                                 │
│  ┌────────────────────────────────────────────────────┐       │
│  │ GET /api/video/:outputId/:filename                 │       │
│  │  - Serves annotated video files                    │       │
│  └────────────────────────────────────────────────────┘       │
│                           ↓                                     │
│                  Script Modifier                               │
│                  (Removes GUI, adds paths)                     │
└─────────────────────────────────────────────────────────────────┘
                            ↓ spawn()
┌─────────────────────────────────────────────────────────────────┐
│                   PYTHON ML PROCESSING                          │
│                  (MediaPipe + OpenCV)                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Workout Scripts:                                              │
│  ┌────────────────────────────────────────────────────┐       │
│  │ pushup_video.py / pushup_live.py                   │       │
│  │  - Detects body landmarks                          │       │
│  │  - Calculates elbow angles                         │       │
│  │  - Counts reps (down < 75°, up > 110°)            │       │
│  │  - Validates form (min dip duration)               │       │
│  │  - Draws skeleton overlay                          │       │
│  │  - Outputs: annotated.mp4 + CSV                    │       │
│  └────────────────────────────────────────────────────┘       │
│                                                                 │
│  ┌────────────────────────────────────────────────────┐       │
│  │ pullup_video.py / pullup_live.py                   │       │
│  │  - Tracks head position (chin over bar)            │       │
│  │  - Measures elbow extension (> 160°)               │       │
│  │  - Counts complete reps                            │       │
│  │  - Outputs: annotated.mp4 + CSV                    │       │
│  └────────────────────────────────────────────────────┘       │
│                                                                 │
│  ┌────────────────────────────────────────────────────┐       │
│  │ verticaljump_video.py / verticaljump_live.py       │       │
│  │  - Tracks hip position                             │       │
│  │  - Calculates jump height (pixels → meters)        │       │
│  │  - Measures air time                               │       │
│  │  - Outputs: annotated.mp4 + CSV                    │       │
│  └────────────────────────────────────────────────────┘       │
│                                                                 │
│  ┌────────────────────────────────────────────────────┐       │
│  │ shuttlerun_video.py / shuttlerun_live.py           │       │
│  │  - Tracks foot position                            │       │
│  │  - Detects direction changes                       │       │
│  │  - Counts runs                                     │       │
│  │  - Outputs: annotated.mp4 + CSV                    │       │
│  └────────────────────────────────────────────────────┘       │
│                                                                 │
│  ┌────────────────────────────────────────────────────┐       │
│  │ situp_video.py / situp_live.py                     │       │
│  │  - Measures torso angle                            │       │
│  │  - Detects up/down transitions                     │       │
│  │  - Counts reps                                     │       │
│  │  - Outputs: annotated.mp4 + CSV                    │       │
│  └────────────────────────────────────────────────────┘       │
│                                                                 │
│  MediaPipe Pose Model:                                         │
│  - 33 body landmarks                                           │
│  - Real-time pose estimation                                   │
│  - Runs on CPU (no GPU required)                              │
│                                                                 │
│  OpenCV:                                                       │
│  - Video I/O                                                   │
│  - Frame processing                                            │
│  - Drawing overlays                                            │
│  - Video encoding                                              │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                      FILE STORAGE                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  server/uploads/          - Temporary video uploads            │
│  server/outputs/          - Processed results                  │
│    └── {outputId}/                                             │
│        ├── {name}_annotated.mp4  - Video with skeleton        │
│        └── {name}_log.csv        - Performance metrics         │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Video Upload Flow

```
User → Upload Video
  ↓
WorkoutUploadScreen
  ↓
VideoProcessor (processing state)
  ↓
workoutService.processVideo()
  ↓
POST /api/process-video
  ↓
Backend receives file
  ↓
Create output directory
  ↓
Modify Python script (remove GUI, set paths)
  ↓
spawn('python', [script])
  ↓
Python processes video:
  - Read frames
  - Detect pose landmarks
  - Calculate angles
  - Count reps
  - Draw skeleton
  - Write annotated video
  - Save CSV data
  ↓
Backend reads results
  ↓
Return {csvData, videoFile, outputId}
  ↓
VideoProcessor displays results
  ↓
User views annotated video + stats
```

### 2. Live Recording Flow

```
User → Live Recording
  ↓
WorkoutUploadScreen
  ↓
Request camera access
  ↓
MediaRecorder captures video
  ↓
User stops recording
  ↓
Convert Blob to File
  ↓
[Same as Video Upload Flow from here]
```

## Component Hierarchy

```
Index.tsx (Main App)
  └── WorkoutInterface
      ├── WorkoutUploadScreen
      │   ├── File Input
      │   ├── Camera Recorder
      │   └── Instructions Card
      │
      └── VideoProcessor
          ├── Processing Screen
          │   ├── Progress Bar
          │   └── Status Messages
          │
          └── Results Screen
              ├── Annotated Video Player
              ├── Analysis Features Card
              ├── Stats Grid
              ├── Performance Summary
              └── Submit Button
```

## Technology Stack

### Frontend
- **React 18**: UI framework
- **TypeScript**: Type safety
- **Vite**: Build tool
- **Tailwind CSS**: Styling
- **shadcn/ui**: Component library
- **Lucide React**: Icons

### Backend
- **Node.js**: Runtime
- **Express**: Web framework
- **Multer**: File upload handling
- **csv-parser**: CSV data parsing
- **fs-extra**: File system operations

### ML Processing
- **Python 3.8+**: Runtime
- **MediaPipe**: Pose estimation
- **OpenCV**: Video processing
- **NumPy**: Numerical operations
- **Pandas**: Data manipulation

## Key Features

### 1. MediaPipe Pose Detection
- 33 body landmarks
- Real-time tracking
- High accuracy
- CPU-optimized

### 2. Skeleton Overlay
- Colored lines connecting joints
- Joint markers (dots)
- Dynamic colors based on state
- Real-time metrics display

### 3. Form Validation
- Angle-based validation
- Duration checks
- Movement pattern recognition
- Correct/incorrect classification

### 4. Video Annotation
- Frame-by-frame processing
- Overlay drawing
- Text annotations
- MP4 output

### 5. Performance Metrics
- Rep counting
- Time tracking
- Angle measurements
- Form analysis
- Statistical summaries

## File Structure

```
project/
├── src/
│   ├── components/
│   │   └── workout/
│   │       ├── WorkoutInterface.tsx      # Main workout container
│   │       ├── WorkoutUploadScreen.tsx   # Upload/record UI
│   │       └── VideoProcessor.tsx        # Processing & results
│   ├── services/
│   │   └── workoutService.ts            # API communication
│   └── pages/
│       └── Index.tsx                     # Main app
│
├── server/
│   ├── server.js                        # Express backend
│   ├── uploads/                         # Temp uploads
│   └── outputs/                         # Processed results
│
├── Talent Track py scripts/
│   ├── pushup_video.py                  # Push-up analysis
│   ├── pushup_live.py                   # Push-up live
│   ├── pullup_video.py                  # Pull-up analysis
│   ├── pullup_live.py                   # Pull-up live
│   ├── situp_video.py                   # Sit-up analysis
│   ├── situp_live.py                    # Sit-up live
│   ├── verticaljump_video.py            # Jump analysis
│   ├── verticaljump_live.py             # Jump live
│   ├── shuttlerun_video.py              # Shuttle analysis
│   ├── shuttlerun_live.py               # Shuttle live
│   ├── sitreach_video.py                # Sit reach
│   ├── verticalbroadjump_video.py       # Broad jump
│   └── requirements.txt                 # Python deps
│
└── Documentation/
    ├── QUICK_START.md                   # Quick start guide
    ├── WORKOUT_SETUP.md                 # Detailed setup
    └── ARCHITECTURE.md                  # This file
```

## Performance Considerations

### Processing Time
- Video upload: 30-60 seconds
- Live recording: Real-time + 10-20 seconds
- Depends on video length and quality

### Resource Usage
- CPU: Moderate (MediaPipe optimized)
- Memory: ~500MB per process
- Disk: Temporary storage for videos
- Network: Video upload bandwidth

### Optimization
- Frame scaling (960x540) for faster processing
- Headless execution (no GUI)
- Automatic cleanup of temp files
- Progress tracking for user feedback

## Security Considerations

### File Upload
- File type validation (video only)
- Size limits (100MB max)
- Temporary storage
- Automatic cleanup

### API Security
- CORS enabled for localhost
- Input validation
- Error handling
- No sensitive data exposure

### Data Privacy
- Videos processed locally
- No cloud storage
- Temporary file deletion
- User data in localStorage only

## Future Enhancements

### Planned Features
1. Real-time browser-based processing (TensorFlow.js)
2. Cloud storage integration
3. Social features (leaderboards, challenges)
4. Advanced analytics dashboard
5. Mobile app (React Native)
6. Multi-user support
7. Coach-athlete communication
8. Video comparison tools
9. Progress tracking graphs
10. Export reports (PDF)

### Technical Improvements
1. WebAssembly for Python scripts
2. GPU acceleration support
3. Batch processing
4. Video streaming
5. Caching layer
6. Database integration
7. Authentication system
8. Real-time notifications
9. Offline mode
10. Progressive Web App (PWA)

## Troubleshooting Guide

### Common Issues

**Backend Connection Failed**
- Check server is running on port 3001
- Verify CORS settings
- Check firewall rules

**Python Script Errors**
- Verify Python installation
- Check dependencies installed
- Review script modifications
- Check file paths

**Video Processing Fails**
- Verify video format
- Check video quality
- Ensure full body visible
- Verify lighting conditions

**Slow Performance**
- Reduce video resolution
- Shorten video length
- Close other applications
- Check CPU usage

## Conclusion

The Talent Track Workout App provides a comprehensive solution for AI-powered workout analysis, combining modern web technologies with advanced ML processing to deliver real-time form feedback and performance tracking.

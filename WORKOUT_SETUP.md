# Workout Analysis Setup Guide

This guide will help you set up the Python backend for workout video analysis using MediaPipe.

## Prerequisites

1. **Python 3.8 or higher** - [Download Python](https://www.python.org/downloads/)
2. **Node.js 16 or higher** - Already installed for the React frontend
3. **Webcam** (optional) - For live recording features

## Installation Steps

### 1. Install Python Dependencies

Navigate to the `Talent Track py scripts` folder and install the required packages:

```bash
cd "Talent Track py scripts"
pip install -r requirements.txt
```

Or install manually:

```bash
pip install opencv-python mediapipe numpy pandas
```

### 2. Verify Python Installation

Test if Python scripts can run:

```bash
python --version
```

Should show Python 3.8 or higher.

### 3. Start the Backend Server

Navigate to the server folder and start the Node.js backend:

```bash
cd server
npm install
npm start
```

The server will run on `http://localhost:3001`

### 4. Start the Frontend

In a new terminal, from the project root:

```bash
npm install
npm run dev
```

The frontend will run on `http://localhost:5173`

## Available Workouts

### Video Upload Support
All workouts support video upload and analysis:
- ✅ Push-ups
- ✅ Pull-ups  
- ✅ Sit-ups
- ✅ Vertical Jump
- ✅ Shuttle Run
- ✅ Sit Reach
- ✅ Vertical Broad Jump

### Live Recording Support
These workouts support real-time camera recording:
- ✅ Push-ups
- ✅ Pull-ups
- ✅ Sit-ups
- ✅ Vertical Jump
- ✅ Shuttle Run

## How It Works

### 1. Video Upload Flow
1. User selects a workout type
2. User uploads a video file (MP4, AVI, MOV)
3. Backend receives the video
4. Python script processes video using MediaPipe:
   - Detects body landmarks
   - Tracks joint angles
   - Counts reps/jumps
   - Validates form
5. Generates annotated video with:
   - Skeleton overlay (colored lines)
   - Joint markers (dots)
   - Rep counter
   - Form indicators
   - Real-time metrics
6. Returns CSV data with detailed metrics
7. Frontend displays results and annotated video

### 2. Live Recording Flow
1. User selects live recording option
2. Browser requests camera access
3. User records workout (max 60 seconds)
4. Video is sent to backend
5. Same processing as video upload
6. Results displayed with annotated video

## Annotated Video Features

The processed videos include:

### Visual Overlays
- **Skeleton Lines**: Colored lines connecting body joints
  - Green: Good form detected
  - Red: Form issues detected
  - Yellow: Neutral/transitional states

- **Joint Markers**: Dots at key body points
  - Shoulders, elbows, wrists
  - Hips, knees, ankles
  - Nose (for head tracking)

### On-Screen Metrics
- **Rep Counter**: Current number of reps/jumps
- **Angle Display**: Joint angles in degrees
- **State Indicator**: Up/Down/In Air status
- **Timer**: Elapsed time
- **Form Feedback**: Correct/Incorrect counts

### Workout-Specific Displays

**Push-ups:**
- Elbow angle (should be < 75° for down position)
- Dip duration
- Correct vs incorrect reps

**Pull-ups:**
- Elbow angle (should be > 160° at bottom)
- Head position tracking
- Rep timing

**Vertical Jump:**
- Jump height in meters
- Air time
- Peak height indicator

**Shuttle Run:**
- Distance traveled
- Direction indicators
- Run count

**Sit-ups:**
- Torso angle
- Rep timing
- Movement range

## Troubleshooting

### Python Script Errors

**Issue**: `ModuleNotFoundError: No module named 'cv2'`
```bash
pip install opencv-python
```

**Issue**: `ModuleNotFoundError: No module named 'mediapipe'`
```bash
pip install mediapipe
```

### Backend Connection Issues

**Issue**: Frontend can't connect to backend
- Ensure backend server is running on port 3001
- Check `src/services/workoutService.ts` has correct API URL
- Verify no firewall blocking localhost:3001

### Video Processing Issues

**Issue**: Video processing fails
- Ensure video file is valid (MP4, AVI, MOV)
- Check video has clear view of full body
- Verify good lighting in video
- Make sure person is visible throughout

### Camera Access Issues

**Issue**: Live recording can't access camera
- Grant browser camera permissions
- Close other apps using the camera
- Try a different browser (Chrome recommended)

## File Structure

```
project/
├── Talent Track py scripts/     # Python workout analysis scripts
│   ├── pushup_video.py
│   ├── pushup_live.py
│   ├── pullup_video.py
│   ├── pullup_live.py
│   ├── situp_video.py
│   ├── situp_live.py
│   ├── verticaljump_video.py
│   ├── verticaljump_live.py
│   ├── shuttlerun_video.py
│   ├── shuttlerun_live.py
│   ├── sitreach_video.py
│   ├── verticalbroadjump_video.py
│   └── requirements.txt
├── server/                      # Node.js backend
│   ├── server.js               # Express server with Python integration
│   ├── uploads/                # Temporary video uploads
│   └── outputs/                # Processed videos and CSV results
├── src/
│   ├── components/workout/     # React workout components
│   │   ├── WorkoutInterface.tsx
│   │   ├── WorkoutUploadScreen.tsx
│   │   └── VideoProcessor.tsx
│   └── services/
│       └── workoutService.ts   # API service for backend communication
└── scripts/                    # Legacy scripts (fallback)
```

## CSV Output Format

Each workout generates a CSV file with detailed metrics:

### Push-ups CSV
```csv
count,down_time,up_time,dip_duration_sec,min_elbow_angle,correct
1,2.1,3.2,1.1,68,True
2,4.5,5.8,1.3,72,True
```

### Vertical Jump CSV
```csv
count,takeoff_time,landing_time,air_time_s,jump_height_px,jump_height_m
1,2.0,2.8,0.8,150,0.45
2,5.0,5.9,0.9,165,0.48
```

## Performance Tips

1. **Video Quality**: Use 720p or 1080p for best results
2. **Lighting**: Ensure even, bright lighting
3. **Camera Position**: Place camera to capture full body
4. **Background**: Use plain background for better detection
5. **Clothing**: Wear fitted clothing for better landmark detection

## Adding New Workouts

To add a new workout type:

1. Create Python script in `Talent Track py scripts/`
2. Follow existing script structure
3. Add to `activityScripts` mapping in `server/server.js`
4. Add parsing logic in `src/services/workoutService.ts`
5. Update UI to include new workout option

## Support

For issues or questions:
1. Check this documentation
2. Review console logs in browser (F12)
3. Check server terminal for Python errors
4. Verify all dependencies are installed

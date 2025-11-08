# Testing Guide - Workout Analysis Integration

## Pre-Testing Checklist

Before testing, ensure:
- ✅ Python 3.8+ installed
- ✅ Node.js 16+ installed
- ✅ Python dependencies installed (`pip install -r requirements.txt`)
- ✅ Backend dependencies installed (`cd server && npm install`)
- ✅ Frontend dependencies installed (`npm install`)

## Quick Test

### Automated Test (Recommended)
```bash
# Double-click this file or run:
start-full-app.bat
```

This will:
1. Check Python installation
2. Install dependencies if needed
3. Start backend server (port 3001)
4. Start frontend (port 5173)
5. Open browser automatically

### Manual Test
```bash
# Terminal 1 - Backend
cd server
npm start

# Terminal 2 - Frontend  
npm run dev

# Open browser
http://localhost:5173
```

## Test Scenarios

### Test 1: Basic Navigation ✅
**Steps:**
1. Open app in browser
2. Click through loading screen
3. Select "Athlete" role
4. Navigate to Training tab

**Expected:**
- Loading animation appears
- Login screen shows
- Home screen displays workout cards
- All UI elements render correctly

**Status:** Pass ☐ Fail ☐

---

### Test 2: Workout Selection ✅
**Steps:**
1. From Training tab
2. Click on "Push-ups" card
3. Observe workout detail screen

**Expected:**
- Activity detail screen appears
- Shows workout information
- "Start Workout" button visible

**Status:** Pass ☐ Fail ☐

---

### Test 3: Upload Screen ✅
**Steps:**
1. Click "Start Workout"
2. Observe upload screen

**Expected:**
- Upload screen displays
- "Upload Video" button visible
- "Live Recording" button visible (for supported workouts)
- Tips section shows

**Status:** Pass ☐ Fail ☐

---

### Test 4: Video Upload Processing ✅
**Steps:**
1. Click "Upload Video"
2. Select a workout video file (MP4/AVI/MOV)
3. Wait for processing

**Expected:**
- File picker opens
- Processing screen appears
- Progress bar shows 0-100%
- Processing info displays:
  - "Detecting body landmarks"
  - "Tracking joint angles"
  - "Counting reps"
  - "Generating annotated video"

**Status:** Pass ☐ Fail ☐

**Notes:**
- Processing time: 30-60 seconds
- Check server terminal for Python output
- Check browser console for errors

---

### Test 5: Results Display ✅
**Steps:**
1. After processing completes
2. Observe results screen

**Expected:**
- Annotated video player appears
- Video shows skeleton overlay with:
  - Colored lines connecting joints
  - Joint markers (dots)
  - Rep counter on screen
  - Angle measurements
  - State indicators
- "AI Analysis Features" card displays
- Stats grid shows:
  - Posture (Good/Bad)
  - Reps completed
  - Duration
  - Activity-specific metrics
- Performance summary displays
- "Submit Workout" button visible

**Status:** Pass ☐ Fail ☐

---

### Test 6: Video Playback ✅
**Steps:**
1. Click play on annotated video
2. Watch video
3. Observe skeleton overlay

**Expected:**
- Video plays smoothly
- Skeleton lines visible and colored:
  - Green lines for good form
  - Red lines for issues
  - Yellow for neutral
- Joint markers (dots) visible
- On-screen metrics update:
  - Rep counter
  - Angles
  - Timer
  - State (Up/Down)
- Video controls work (play/pause/seek)

**Status:** Pass ☐ Fail ☐

---

### Test 7: Live Recording (if supported) ✅
**Steps:**
1. Select workout with live recording support
2. Click "Live Recording"
3. Allow camera access
4. Click "Record"
5. Perform 3-5 reps
6. Click "Stop"
7. Click "Use Recording"

**Expected:**
- Camera permission prompt appears
- Camera feed displays
- Recording indicator shows
- Timer counts up
- Recording stops
- Processing begins
- Results display (same as Test 5)

**Status:** Pass ☐ Fail ☐

---

### Test 8: Different Workout Types ✅

Test each workout type:

#### Push-ups
**Expected Metrics:**
- Rep count
- Elbow angle (should show < 75° for down)
- Correct vs incorrect reps
- Dip duration

**Status:** Pass ☐ Fail ☐

#### Pull-ups
**Expected Metrics:**
- Rep count
- Elbow extension (> 160°)
- Head position tracking
- Rep timing

**Status:** Pass ☐ Fail ☐

#### Sit-ups
**Expected Metrics:**
- Rep count
- Torso angle
- Movement range
- Rep timing

**Status:** Pass ☐ Fail ☐

#### Vertical Jump
**Expected Metrics:**
- Jump count
- Max height (meters)
- Average height
- Air time

**Status:** Pass ☐ Fail ☐

#### Shuttle Run
**Expected Metrics:**
- Run count
- Distance
- Direction changes
- Split times

**Status:** Pass ☐ Fail ☐

---

### Test 9: Error Handling ✅

#### Test 9a: Invalid File
**Steps:**
1. Try uploading non-video file (e.g., .txt, .jpg)

**Expected:**
- Error message displays
- User can retry

**Status:** Pass ☐ Fail ☐

#### Test 9b: Poor Quality Video
**Steps:**
1. Upload video with poor lighting or no person visible

**Expected:**
- Processing completes
- Shows "Poor quality" message
- Option to retry

**Status:** Pass ☐ Fail ☐

#### Test 9c: Backend Offline
**Steps:**
1. Stop backend server
2. Try uploading video

**Expected:**
- Error message displays
- Graceful fallback to simulation mode

**Status:** Pass ☐ Fail ☐

---

### Test 10: Submit Workout ✅
**Steps:**
1. After viewing results
2. Click "Submit Workout"

**Expected:**
- Returns to home screen
- Workout saved to localStorage
- Can view in Reports tab

**Status:** Pass ☐ Fail ☐

---

## Backend Testing

### Test Backend Endpoints

#### Test 1: Health Check
```bash
curl http://localhost:3001/
```
**Expected:** Server responds

#### Test 2: Process Video Endpoint
```bash
curl -X POST http://localhost:3001/api/process-video \
  -F "video=@path/to/video.mp4" \
  -F "activityName=Push-ups"
```
**Expected:** Returns JSON with outputId and results

#### Test 3: Get Results
```bash
curl http://localhost:3001/api/results/{outputId}
```
**Expected:** Returns CSV data and video info

---

## Python Script Testing

### Test Individual Scripts

#### Test Push-up Script
```bash
cd "Talent Track py scripts"
python pushup_video.py
```
**Expected:**
- File picker opens
- Select video
- Processing begins
- Annotated video created
- CSV file generated

#### Test Pull-up Script
```bash
python pullup_video.py
```
**Expected:** Same as push-up test

#### Test Live Script
```bash
python pushup_live.py
```
**Expected:**
- Camera opens
- Real-time skeleton overlay
- Rep counting works
- Press ESC to exit

---

## Performance Testing

### Test 1: Processing Speed
**Measure:**
- Upload 30-second video
- Time from upload to results

**Expected:**
- < 60 seconds for 30-second video
- Progress bar updates smoothly

**Actual Time:** _____ seconds

### Test 2: Multiple Uploads
**Steps:**
1. Upload 3 videos in sequence
2. Observe memory usage

**Expected:**
- Each upload processes successfully
- No memory leaks
- Temp files cleaned up

**Status:** Pass ☐ Fail ☐

### Test 3: Large Video
**Steps:**
1. Upload 2-minute video

**Expected:**
- Processes successfully
- Takes proportionally longer
- No crashes

**Status:** Pass ☐ Fail ☐

---

## Browser Compatibility

Test in different browsers:

### Chrome
**Status:** Pass ☐ Fail ☐

### Firefox
**Status:** Pass ☐ Fail ☐

### Edge
**Status:** Pass ☐ Fail ☐

### Safari (if available)
**Status:** Pass ☐ Fail ☐

---

## Common Issues & Solutions

### Issue: "Python not found"
**Solution:**
```bash
# Check Python installation
python --version

# If not installed, download from python.org
# Add to PATH during installation
```

### Issue: "Module not found" (Python)
**Solution:**
```bash
cd "Talent Track py scripts"
pip install -r requirements.txt
```

### Issue: "Cannot connect to backend"
**Solution:**
```bash
# Check if backend is running
cd server
npm start

# Check port 3001 is not in use
netstat -ano | findstr :3001
```

### Issue: "Video processing fails"
**Solution:**
- Check video format (MP4 recommended)
- Ensure full body visible in video
- Check lighting quality
- Try shorter video

### Issue: "Camera access denied"
**Solution:**
- Click address bar in browser
- Allow camera permissions
- Refresh page
- Try different browser

---

## Test Video Requirements

For best test results, use videos with:
- ✅ Full body visible
- ✅ Good lighting
- ✅ Plain background
- ✅ Clear movements
- ✅ 30-60 seconds duration
- ✅ 720p or higher resolution

---

## Checklist Summary

### Setup
- ☐ Python installed and in PATH
- ☐ Node.js installed
- ☐ Python dependencies installed
- ☐ Backend dependencies installed
- ☐ Frontend dependencies installed

### Basic Functionality
- ☐ App loads successfully
- ☐ Navigation works
- ☐ Workout selection works
- ☐ Upload screen displays

### Core Features
- ☐ Video upload works
- ☐ Processing completes
- ☐ Annotated video displays
- ☐ Skeleton overlay visible
- ☐ Metrics display correctly
- ☐ Live recording works (if supported)

### All Workout Types
- ☐ Push-ups
- ☐ Pull-ups
- ☐ Sit-ups
- ☐ Vertical Jump
- ☐ Shuttle Run
- ☐ Sit Reach
- ☐ Vertical Broad Jump

### Error Handling
- ☐ Invalid file handling
- ☐ Poor quality detection
- ☐ Backend offline handling
- ☐ Camera permission handling

### Performance
- ☐ Processing speed acceptable
- ☐ Multiple uploads work
- ☐ Large videos work
- ☐ No memory leaks

---

## Test Report Template

```
Test Date: _______________
Tester: _______________
Environment: _______________

Overall Status: Pass ☐ Fail ☐

Tests Passed: ___ / ___
Tests Failed: ___ / ___

Critical Issues:
1. _______________
2. _______________

Minor Issues:
1. _______________
2. _______________

Notes:
_______________________________________________
_______________________________________________
_______________________________________________

Recommendations:
_______________________________________________
_______________________________________________
_______________________________________________
```

---

## Next Steps After Testing

If all tests pass:
1. ✅ System is ready for use
2. ✅ Can start recording workouts
3. ✅ Share with users

If tests fail:
1. Review error messages
2. Check documentation (WORKOUT_SETUP.md)
3. Verify all dependencies installed
4. Check Python script paths
5. Review server logs

---

## Support

For issues during testing:
1. Check QUICK_START.md
2. Review WORKOUT_SETUP.md
3. Check browser console (F12)
4. Check server terminal
5. Verify Python scripts run independently

---

**Happy Testing! 🎉**

Remember: The first run may take longer as Python loads the MediaPipe model. Subsequent runs will be faster.

# Quick Start Guide - Talent Track Workout App

## 🚀 Fast Setup (Windows)

### Option 1: Automated Setup (Recommended)
Simply double-click `start-full-app.bat` - it will:
- Check Python installation
- Install all dependencies
- Start backend server
- Start frontend app
- Open in your browser

### Option 2: Manual Setup

1. **Install Python Dependencies**
```bash
cd "Talent Track py scripts"
pip install -r requirements.txt
cd ..
```

2. **Install Node Dependencies**
```bash
npm install
cd server
npm install
cd ..
```

3. **Start Backend** (in one terminal)
```bash
cd server
npm start
```

4. **Start Frontend** (in another terminal)
```bash
npm run dev
```

5. **Open Browser**
Navigate to `http://localhost:5173`

## 📱 Using the App

### 1. Login
- Choose your role: Athlete, Coach, or Admin
- For demo, use Athlete role

### 2. Select Workout
- Go to Training tab
- Click on any workout card (e.g., Push-ups, Pull-ups)

### 3. Record or Upload
**Option A: Upload Video**
- Click "Upload Video"
- Select a video file from your computer
- Supported formats: MP4, AVI, MOV

**Option B: Live Recording** (if available)
- Click "Live Recording"
- Allow camera access
- Click "Record" to start
- Click "Stop" when done
- Click "Use Recording"

### 4. View Results
- Wait for AI processing (30-60 seconds)
- Watch annotated video with skeleton overlay
- Review performance metrics:
  - Rep count
  - Form analysis (Good/Bad)
  - Joint angles
  - Duration
  - Detailed statistics

### 5. Submit Workout
- Click "Submit Workout"
- Results saved to your profile
- View history in Reports tab

## 🎯 Supported Workouts

### ✅ Full Support (Upload + Live Recording)
- **Push-ups**: Counts reps, validates elbow angle and form
- **Pull-ups**: Tracks chin-over-bar, measures elbow extension
- **Sit-ups**: Counts reps, monitors torso angle
- **Vertical Jump**: Measures jump height and air time
- **Shuttle Run**: Tracks distance and direction changes

### 📹 Upload Only
- **Sit Reach**: Measures flexibility distance
- **Vertical Broad Jump**: Measures horizontal jump distance

## 🎨 Understanding the Annotated Video

### Visual Elements

**Skeleton Lines (Colored)**
- 🟢 Green: Good form detected
- 🔴 Red: Form issues or incorrect position
- 🟡 Yellow: Neutral/transitional state
- Lines connect: shoulders-elbows-wrists, hips-knees-ankles

**Joint Markers (Dots)**
- Small circles at key body points
- Shoulders, elbows, wrists
- Hips, knees, ankles
- Nose (for head tracking)

**On-Screen Metrics**
- Top-left corner shows:
  - Current rep/jump count
  - Joint angles (degrees)
  - State (Up/Down/In Air)
  - Timer
  - Correct/Incorrect counts

### Example: Push-up Analysis
```
Elbow: 68°          ← Joint angle
Pushups: 15         ← Total count
State: down         ← Current position
Dip: 1.2s          ← Time in position
Correct: 12        ← Good form reps
Bad: 3             ← Poor form reps
Time: 45.3s        ← Total duration
```

## 🎥 Video Recording Tips

### For Best Results

**Camera Setup**
- Position camera 6-10 feet away
- Capture full body in frame
- Keep camera steady (use tripod if possible)
- Landscape orientation recommended

**Lighting**
- Use bright, even lighting
- Avoid backlighting (don't face windows)
- No harsh shadows
- Indoor lighting works well

**Background**
- Plain, uncluttered background
- Contrasting color to your clothing
- Avoid busy patterns

**Clothing**
- Fitted clothing works best
- Avoid baggy clothes
- Contrasting colors help detection

**Exercise Form**
- Perform exercise in camera view
- Don't move out of frame
- Maintain consistent speed
- Follow proper form guidelines

## 🔧 Troubleshooting

### "Backend not available" Error
1. Check if backend server is running (port 3001)
2. Restart backend: `cd server && npm start`
3. Check console for Python errors

### "Camera access denied"
1. Click browser address bar
2. Allow camera permissions
3. Refresh page
4. Try different browser (Chrome recommended)

### "Video processing failed"
1. Ensure video shows full body
2. Check lighting quality
3. Verify video format (MP4 works best)
4. Try shorter video (< 2 minutes)

### Python Errors
1. Verify Python installed: `python --version`
2. Reinstall dependencies: `pip install -r requirements.txt`
3. Check Python is in system PATH

### Slow Processing
- Normal processing time: 30-60 seconds
- Longer videos take more time
- First run may be slower (model loading)

## 📊 Understanding Results

### Posture Rating
- **Good**: 70%+ reps with correct form
- **Bad**: < 70% reps with correct form

### Rep Validation Criteria

**Push-ups**
- Elbow angle < 75° at bottom
- Minimum dip duration: 0.2s
- Full extension at top

**Pull-ups**
- Chin above bar (head tracking)
- Elbow angle > 160° at bottom
- Controlled movement

**Vertical Jump**
- Clear takeoff detected
- Peak height measured
- Landing detected

### CSV Data Export
Each workout generates a CSV file with:
- Timestamp for each rep
- Joint angles
- Duration metrics
- Form validation flags
- Performance statistics

## 🎓 Next Steps

1. **Practice**: Record multiple workouts to track progress
2. **Compare**: View history in Reports tab
3. **Improve**: Use form feedback to correct technique
4. **Challenge**: Try different workout types
5. **Compete**: Compare with friends (coming soon)

## 📞 Need Help?

1. Check `WORKOUT_SETUP.md` for detailed setup
2. Review console logs (F12 in browser)
3. Check server terminal for errors
4. Verify all dependencies installed

## 🎉 Tips for Success

- Start with shorter videos (30-60 seconds)
- Ensure good lighting and camera position
- Perform exercises with proper form
- Review annotated video to improve technique
- Track progress over time in Reports tab

---

**Ready to start?** Double-click `start-full-app.bat` and begin your fitness journey! 💪

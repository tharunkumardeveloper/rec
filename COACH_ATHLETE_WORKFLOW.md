# Coach-Athlete Workout Workflow Guide

## Complete Workflow: From Athlete Workout to Coach Review

### Step-by-Step Process

#### 1. **Athlete Records Workout**
```
Login as Athlete
  ↓
Select Exercise (Push-ups, Squats, etc.)
  ↓
Start Workout Recording
  ↓
Complete Workout
  ↓
View Results Screen
```

#### 2. **Generate and Save Report** ⚠️ CRITICAL STEP
```
On Workout Results Screen:
  ↓
Click "Download PDF Report" button
  ↓
✅ Data is automatically saved to localStorage
  ↓
PDF downloads to your device
```

**⚠️ IMPORTANT:** You MUST click "Download PDF Report" for the workout to be saved! This triggers the automatic save to localStorage.

#### 3. **Switch to Coach View**
```
Logout from Athlete account
  ↓
Login as Coach (e.g., "Rajesh Menon")
  ↓
Navigate to "Athletes" tab (bottom navigation)
  ↓
Click "Refresh Data" button
  ↓
✅ See all athlete workouts!
```

### What You'll See in Coach Dashboard

#### Athletes Tab View:
- **List of Athletes** with workout counts
- **Last workout timestamp**
- **Quick stats** for recent workouts
- **"View All Workouts"** button for each athlete

#### Athlete Detail View (after clicking "View All Workouts"):
- **Complete workout history**
- **Performance metrics:**
  - Total reps
  - Correct reps
  - Incorrect reps
  - Duration
  - Accuracy percentage
  - Form score

- **Full workout video** with MediaPipe pose tracking
- **6 workout screenshots** captured during exercise
- **Download buttons** for PDF report and video
- **Rep-by-rep analysis** with joint angles

### Mobile-Friendly Features

✅ **Responsive Design**
- Works on all screen sizes
- Touch-friendly buttons
- Optimized for mobile viewing

✅ **Video Playback**
- Full-screen video player
- Standard video controls
- Works on mobile browsers

✅ **Easy Navigation**
- Bottom navigation bar
- Large tap targets
- Smooth scrolling

### Troubleshooting

#### "No Athlete Workouts Yet" Message

**Problem:** Coach dashboard shows no workouts

**Solution:**
1. ✅ Make sure you clicked "Download PDF Report" after workout
2. ✅ Check browser console for errors (F12)
3. ✅ Click "Refresh Data" button
4. ✅ Verify you're not in Incognito/Private mode
5. ✅ Check localStorage is enabled in browser

**Debug Steps:**
```javascript
// Open browser console (F12) and run:
localStorage.getItem('athlete_workouts')
// Should show workout data if saved correctly
```

#### Data Not Persisting

**Problem:** Workouts disappear after page reload

**Causes:**
- Using Incognito/Private browsing mode
- Browser set to clear data on exit
- localStorage disabled in browser settings

**Solution:**
- Use normal browsing mode
- Check browser privacy settings
- Enable localStorage

#### Video Not Playing

**Problem:** Video player shows but won't play

**Solutions:**
- Check browser supports WebM format
- Try Chrome or Edge browser
- Verify video was recorded during workout
- Check browser console for errors

### Data Storage Details

#### What Gets Saved:
- ✅ Athlete name and profile picture
- ✅ Workout type and timestamp
- ✅ Performance metrics (reps, accuracy, duration)
- ✅ Full workout video (Base64 encoded)
- ✅ PDF report (Base64 encoded)
- ✅ 6 workout screenshots
- ✅ Rep-by-rep analysis with angles

#### Storage Location:
- **Browser localStorage** (local to device)
- **Persists** across page reloads
- **Survives** browser restarts
- **Automatic cleanup** (keeps last 50 workouts)

#### Storage Limits:
- Browser localStorage: ~10MB
- Videos are compressed for efficiency
- Automatic removal of oldest workouts when full

### Best Practices

#### For Athletes:
1. ✅ Always click "Download PDF Report" after workout
2. ✅ Wait for PDF to download before closing
3. ✅ Use consistent name in settings
4. ✅ Ensure good lighting for video recording
5. ✅ Complete full range of motion for accurate tracking

#### For Coaches:
1. ✅ Click "Refresh Data" when opening Athletes tab
2. ✅ Review videos for form analysis
3. ✅ Download reports for record keeping
4. ✅ Check rep-by-rep analysis for patterns
5. ✅ Monitor accuracy trends over time

### Quick Reference

#### Athlete Workflow:
```
1. Login as athlete
2. Complete workout
3. Click "Download PDF Report" ⚠️ MUST DO THIS
4. Logout
```

#### Coach Workflow:
```
1. Login as coach (Rajesh Menon)
2. Go to Athletes tab
3. Click "Refresh Data"
4. View athlete workouts
```

### Features Available

#### In Athletes List:
- ✅ Athlete name with initials avatar
- ✅ Workout count badge
- ✅ Last workout timestamp
- ✅ Preview of recent workouts
- ✅ "View All Workouts" button
- ✅ "Refresh Data" button

#### In Workout Details:
- ✅ Performance metrics grid
- ✅ Accuracy bar with color coding
- ✅ Form score (Excellent/Good/Needs Work)
- ✅ Full video player with controls
- ✅ Screenshot gallery (6 images)
- ✅ Download PDF button
- ✅ Download video button
- ✅ Back to list navigation

### Common Questions

**Q: Do I need to be online?**
A: No, data is stored locally in browser. No internet needed after initial load.

**Q: Can I see workouts from different devices?**
A: No, data is stored per-device in localStorage. Each device has its own data.

**Q: How many workouts can be stored?**
A: System keeps last 50 workouts automatically. Older ones are removed.

**Q: Can I export all data?**
A: Yes, download individual PDF reports and videos for each workout.

**Q: What if I clear browser cache?**
A: Workout data will be lost. Download important reports before clearing cache.

**Q: Can multiple coaches see the same data?**
A: Only if using the same device/browser. Data is local to each browser.

### Support

If you encounter issues:
1. Check browser console (F12) for errors
2. Verify localStorage is enabled
3. Try different browser (Chrome/Edge recommended)
4. Clear cache and retry
5. Check COACH_DASHBOARD_ACCESS.md for detailed troubleshooting

### Summary

**Key Points:**
- ✅ Must click "Download PDF Report" to save workout
- ✅ Data stored in browser localStorage
- ✅ Click "Refresh Data" in coach view
- ✅ Works offline after initial load
- ✅ Mobile-friendly design
- ✅ Full video playback with MediaPipe tracking
- ✅ Automatic storage management

**Remember:** The "Download PDF Report" button is the trigger that saves everything to localStorage!

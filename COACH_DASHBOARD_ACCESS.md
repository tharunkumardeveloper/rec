# How to Access the Coach Workouts Dashboard

## Quick Access

### Method 1: Settings Menu (Recommended)
1. Open the app at `http://localhost:8081`
2. Click on **Settings** (gear icon)
3. Scroll down to the **Support** section
4. Click on **"Coach Workouts Dashboard"** button
5. You'll be taken to the coach workouts page

### Method 2: Direct URL
Navigate directly to:
```
http://localhost:8081/coach-workouts
```

## Testing the Dashboard

### Step 1: Generate Some Workout Data
1. Complete a workout (any exercise: Push-ups, Squats, etc.)
2. At the end, click **"Download PDF Report"**
3. The workout data is automatically saved to localStorage
4. Repeat for multiple workouts to see more data

### Step 2: View in Coach Dashboard
1. Go to Settings → Coach Workouts Dashboard
2. You should see:
   - Total athletes count
   - Total workouts count
   - Active today count
   - List of athletes with their workout counts

### Step 3: View Athlete Details
1. Click on any athlete card
2. You'll see:
   - Complete workout history
   - Performance metrics
   - Workout video player
   - Screenshots from the workout
   - Rep-by-rep analysis
   - Download options for PDF and video

## What You Should See

### Coach Dashboard Home (`/coach-workouts`)
```
┌─────────────────────────────────────────┐
│         Coach Dashboard                  │
│  Monitor your athletes' performance      │
├─────────────────────────────────────────┤
│  📊 Stats Overview                       │
│  ┌──────┐ ┌──────┐ ┌──────┐            │
│  │  3   │ │  12  │ │  2   │            │
│  │Athletes│Workouts│Active │            │
│  └──────┘ └──────┘ └──────┘            │
├─────────────────────────────────────────┤
│  👥 Athletes                             │
│  ┌─────────────────┐ ┌─────────────────┐│
│  │ John Doe        │ │ Jane Smith      ││
│  │ 5 workouts      │ │ 7 workouts      ││
│  │ Jan 29, 2026    │ │ Jan 28, 2026    ││
│  └─────────────────┘ └─────────────────┘│
└─────────────────────────────────────────┘
```

### Athlete Detail Page (`/coach-workouts/athlete/:name`)
```
┌─────────────────────────────────────────┐
│  ← Back    John Doe                     │
│            5 total workouts              │
├─────────────────────────────────────────┤
│  Workout History  │  Workout Details    │
│  ┌──────────────┐ │  ┌──────────────┐  │
│  │ Push-ups     │ │  │ Video Player │  │
│  │ Jan 29, 2026 │ │  │              │  │
│  │ 90% accuracy │ │  │  [▶ Play]    │  │
│  └──────────────┘ │  └──────────────┘  │
│  ┌──────────────┐ │  Performance:       │
│  │ Squats       │ │  • 20 total reps    │
│  │ Jan 28, 2026 │ │  • 18 correct       │
│  │ 85% accuracy │ │  • 2 incorrect      │
│  └──────────────┘ │  • 2:30 duration    │
└─────────────────────────────────────────┘
```

## Troubleshooting

### "No athletes yet" message
**Problem:** Dashboard shows no data

**Solutions:**
1. Complete at least one workout
2. Make sure to click "Download PDF Report" at the end
3. Check browser console for errors
4. Verify localStorage is enabled in your browser

### Can't see workout video
**Problem:** Video player shows but video doesn't play

**Solutions:**
1. Check if video was recorded during workout
2. Verify browser supports WebM video format
3. Check browser console for errors
4. Try a different browser (Chrome/Edge recommended)

### Data disappeared after refresh
**Problem:** Workouts don't persist

**Solutions:**
1. Check if you're in Incognito/Private mode (data won't persist)
2. Verify localStorage is enabled
3. Check browser privacy settings
4. Make sure you're not clearing cache on exit

### Storage full error
**Problem:** Can't save new workouts

**Solutions:**
1. System automatically keeps last 50 workouts
2. Manually delete old workouts if needed
3. Clear browser cache
4. Download important reports before clearing

## Data Flow

```
Athlete completes workout
         ↓
Generates PDF report
         ↓
System automatically:
  • Converts video to Base64
  • Converts PDF to Base64
  • Captures 6 screenshots
  • Saves to localStorage
         ↓
Data appears in Coach Dashboard
         ↓
Persists across page reloads
```

## Storage Information

### What's Stored
- Athlete name and profile picture
- Workout type and timestamp
- Performance metrics (reps, accuracy, duration)
- Full workout video (Base64 encoded)
- PDF report (Base64 encoded)
- 6 workout screenshots
- Rep-by-rep analysis data

### Storage Limits
- Browser localStorage: ~10MB
- Automatic cleanup: Keeps last 50 workouts
- Videos are compressed for storage efficiency

### Check Storage Usage
Open browser console and run:
```javascript
import workoutStorageService from '@/services/workoutStorageService';
console.log(`Storage: ${workoutStorageService.getStorageSize().toFixed(2)} MB`);
```

## Features Available

### ✅ In Coach Dashboard
- View all athletes
- See workout counts
- View last workout date
- Click to see athlete details

### ✅ In Athlete Detail Page
- Complete workout history
- Performance metrics
- Video playback with controls
- Screenshot gallery
- Rep-by-rep analysis
- Download PDF report
- Download workout video

### ✅ Data Persistence
- Survives page reloads
- Survives browser restarts
- Stored locally (no server needed)
- Automatic cleanup of old data

## Next Steps

1. **Test with Multiple Athletes**
   - Use different names in settings
   - Complete workouts with each name
   - See how dashboard organizes data

2. **Test Video Playback**
   - Verify videos play correctly
   - Check MediaPipe overlay is visible
   - Test download functionality

3. **Test Data Persistence**
   - Complete a workout
   - Close browser completely
   - Reopen and check dashboard
   - Data should still be there

4. **Monitor Storage**
   - Complete many workouts
   - Watch storage usage
   - Verify automatic cleanup works

## Support

If you encounter issues:
1. Check browser console for errors
2. Verify you're using a modern browser
3. Ensure localStorage is enabled
4. Try clearing cache and retrying
5. Check the COACH_DASHBOARD_USAGE.md for detailed API info

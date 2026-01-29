# Coach Dashboard - Usage Guide

## Overview
The Coach Dashboard provides a persistent, local storage solution for viewing athlete workout data, videos, and reports. All data is stored in the browser's localStorage and persists across page reloads.

## Features

### 🏠 Coach Dashboard Home (`/coach`)
- View all athletes who have completed workouts
- See total workout count per athlete
- View last workout timestamp
- Quick stats: Total athletes, total workouts, active today
- Click on any athlete to view their detailed workout history

### 👤 Athlete Detail Page (`/coach/athlete/:athleteName`)
- Complete workout history for the selected athlete
- View all workout sessions with timestamps
- Select any workout to see:
  - Performance summary (reps, accuracy, duration)
  - Full workout video with MediaPipe tracking
  - Workout screenshots (6 key moments)
  - Rep-by-rep analysis with angles
  - Download PDF report
  - Download workout video

## How It Works

### Automatic Data Storage
When an athlete completes a workout and generates a PDF report:

1. **Video Conversion**: Workout video is converted to Base64 data URL
2. **PDF Conversion**: PDF report is converted to Base64 data URL
3. **Screenshots**: 6 workout screenshots are captured and stored
4. **Local Storage**: All data is saved to browser localStorage
5. **Persistence**: Data survives page reloads and browser restarts

### Data Structure
```typescript
{
  id: string,                    // Unique workout ID
  athleteName: string,           // Athlete's name
  athleteProfilePic?: string,    // Profile picture (Base64)
  activityName: string,          // Workout type (Push-ups, Squats, etc.)
  totalReps: number,
  correctReps: number,
  incorrectReps: number,
  duration: number,              // In seconds
  accuracy: number,              // Percentage
  formScore: string,             // Excellent, Good, Needs Work
  repDetails: array,             // Rep-by-rep analysis
  timestamp: string,             // ISO 8601 format
  videoDataUrl: string,          // Base64 encoded video
  pdfDataUrl: string,            // Base64 encoded PDF
  screenshots: string[]          // Array of Base64 images
}
```

## Accessing the Coach Dashboard

### Option 1: Direct URL
Navigate to `/coach` in your browser:
```
http://localhost:8081/coach
```

### Option 2: Add Navigation Link
Add a link to your app's navigation:
```tsx
<Link to="/coach">Coach Dashboard</Link>
```

## Storage Limits

### Browser localStorage Limits
- **Chrome/Edge**: ~10MB
- **Firefox**: ~10MB
- **Safari**: ~5MB

### Automatic Management
- Stores up to **50 most recent workouts**
- Automatically removes oldest workouts when limit is reached
- Handles storage quota errors gracefully

### Check Storage Usage
```typescript
import workoutStorageService from '@/services/workoutStorageService';

const sizeInMB = workoutStorageService.getStorageSize();
console.log(`Storage used: ${sizeInMB.toFixed(2)} MB`);
```

## API Reference

### WorkoutStorageService

#### Save Workout
```typescript
await workoutStorageService.saveWorkout({
  athleteName: 'John Doe',
  activityName: 'Push-ups',
  totalReps: 20,
  correctReps: 18,
  incorrectReps: 2,
  duration: 120,
  accuracy: 90,
  formScore: 'Excellent',
  repDetails: [...],
  timestamp: new Date().toISOString(),
  videoDataUrl: 'data:video/webm;base64,...',
  pdfDataUrl: 'data:application/pdf;base64,...',
  screenshots: ['data:image/jpeg;base64,...']
});
```

#### Get All Workouts
```typescript
const workouts = workoutStorageService.getAllWorkouts();
```

#### Get Workouts by Athlete
```typescript
const athleteWorkouts = workoutStorageService.getWorkoutsByAthlete('John Doe');
```

#### Get Specific Workout
```typescript
const workout = workoutStorageService.getWorkoutById('workout_123');
```

#### Delete Workout
```typescript
workoutStorageService.deleteWorkout('workout_123');
```

#### Get All Athletes
```typescript
const athletes = workoutStorageService.getAllAthletes();
// Returns: [{ name: 'John Doe', workoutCount: 5, lastWorkout: '2026-01-29T...' }]
```

#### Clear All Data
```typescript
workoutStorageService.clearAllWorkouts();
```

## Viewing Workout Data

### Video Playback
- Videos are stored as Base64 data URLs
- Full video controls (play, pause, seek, volume)
- Includes MediaPipe pose tracking overlay
- Download option available

### PDF Reports
- Stored as Base64 data URLs
- Download button to save locally
- Contains all workout analytics

### Screenshots
- 6 key moments from the workout
- Grid layout for easy viewing
- Captured at evenly spaced intervals

### Rep Analysis
- Detailed breakdown of each rep
- Shows correct/incorrect status
- Displays joint angles (elbow, plank, knee, etc.)
- Color-coded for easy identification

## Example Workflow

1. **Athlete completes workout**
   - Records video with MediaPipe tracking
   - System analyzes form and counts reps

2. **Athlete generates PDF report**
   - PDF is created with all analytics
   - Video and PDF are automatically saved to localStorage
   - Screenshots are captured and stored

3. **Coach views dashboard**
   - Opens `/coach` in browser
   - Sees list of all athletes
   - Clicks on athlete name

4. **Coach reviews workout**
   - Sees complete workout history
   - Selects specific workout session
   - Watches video with pose tracking
   - Reviews rep-by-rep analysis
   - Downloads PDF report if needed

## Troubleshooting

### Data Not Appearing
1. Check browser console for errors
2. Verify localStorage is enabled
3. Check storage quota (may be full)
4. Ensure workout PDF was generated

### Videos Not Playing
1. Check browser video codec support
2. Verify video data URL is valid
3. Try different browser
4. Check console for errors

### Storage Full
1. Delete old workouts manually
2. System auto-deletes oldest workouts
3. Clear browser cache
4. Increase browser storage limit (if possible)

### Page Reload Loses Data
- This should NOT happen - data persists in localStorage
- If it does, check:
  - Browser privacy settings
  - Incognito/Private mode (doesn't persist)
  - Browser extensions blocking storage

## Privacy & Security

### Local Storage Only
- All data stored in browser localStorage
- No server uploads (unless coach API configured)
- Data stays on the device
- Not shared across devices

### Data Retention
- Data persists until manually deleted
- Survives browser restarts
- Cleared when browser cache is cleared
- Not affected by page reloads

### Sharing Data
To share workout data:
1. Download PDF report
2. Download video file
3. Send via email/messaging
4. Or configure coach API endpoint for automatic upload

## Best Practices

1. **Regular Backups**: Download important reports
2. **Storage Management**: Monitor storage usage
3. **Clear Old Data**: Remove outdated workouts
4. **Test Playback**: Verify videos play correctly
5. **Browser Compatibility**: Use modern browsers

## Browser Compatibility

✅ **Fully Supported:**
- Chrome 90+
- Edge 90+
- Firefox 88+
- Safari 14+

⚠️ **Limited Support:**
- Older browsers may have storage limits
- Some video codecs may not work

## Future Enhancements

- Export all data to JSON
- Import data from file
- Cloud sync option
- Multi-device access
- Advanced filtering and search
- Performance trends and charts
- Comparison between workouts

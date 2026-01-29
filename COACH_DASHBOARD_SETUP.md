# Coach Dashboard Integration Setup

## Overview
The Talent Track app now automatically submits workout reports and videos to a coach dashboard after each workout session. This allows coaches to monitor athlete performance in real-time.

## Features

### Automatic Submission
When an athlete completes a workout and generates a PDF report, the system automatically:
- ✅ Sends the PDF report with detailed analytics
- ✅ Uploads the workout video with MediaPipe pose tracking
- ✅ Includes workout screenshots (6 key moments)
- ✅ Submits rep-by-rep form analysis
- ✅ Sends athlete profile information
- ✅ Includes timestamp and performance metrics

### What Gets Submitted
1. **PDF Report** - Comprehensive workout report including:
   - Athlete profile with photo
   - Key metrics (reps, accuracy, duration)
   - Performance breakdown charts
   - Workout screenshots
   - Rep-by-rep analysis with angles

2. **Video File** - Workout recording with:
   - MediaPipe pose tracking overlay
   - Real-time form analysis
   - Rep counting visualization

3. **Metadata** - JSON data including:
   - Athlete name and profile picture
   - Activity type
   - Total/correct/incorrect reps
   - Duration and accuracy
   - Form score
   - Detailed rep data with angles
   - Timestamp

## Configuration

### 1. Environment Variables
Add to your `.env.local` file:

```env
VITE_COACH_API_ENDPOINT=https://your-coach-dashboard.com/api/workouts
```

### 2. Settings UI
Athletes can configure the integration in the app settings:

1. Navigate to Settings → Coach Dashboard
2. Enable "Coach Dashboard Integration"
3. Enter the API endpoint URL
4. (Optional) Enter coach email for notifications
5. Enable/disable auto-submit
6. Save configuration

### 3. API Endpoint Requirements

Your coach dashboard API should accept `POST` requests with `multipart/form-data`:

#### Request Headers
```
Content-Type: multipart/form-data
X-Athlete-Name: {athlete_name}
X-Activity-Type: {activity_type}
```

#### Form Data Fields
```javascript
{
  // Text fields
  athleteName: string,
  activityName: string,
  totalReps: number,
  correctReps: number,
  incorrectReps: number,
  duration: number,
  accuracy: number,
  formScore: string,
  timestamp: ISO8601 string,
  repDetails: JSON string,
  athleteProfilePic: base64 string (optional),
  coachEmail: string (optional),
  
  // File uploads
  video: File (video/webm),
  report: File (application/pdf)
}
```

#### Response Format
```json
{
  "success": true,
  "message": "Workout submitted successfully",
  "submissionId": "unique-id"
}
```

## Example API Implementation

### Node.js/Express Example
```javascript
const express = require('express');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

app.post('/api/workouts', 
  upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'report', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const {
        athleteName,
        activityName,
        totalReps,
        correctReps,
        incorrectReps,
        duration,
        accuracy,
        formScore,
        timestamp,
        repDetails,
        coachEmail
      } = req.body;

      const videoFile = req.files['video'][0];
      const reportFile = req.files['report'][0];

      // Store files and data in your database
      const submission = await saveWorkoutSubmission({
        athleteName,
        activityName,
        metrics: {
          totalReps: parseInt(totalReps),
          correctReps: parseInt(correctReps),
          incorrectReps: parseInt(incorrectReps),
          duration: parseInt(duration),
          accuracy: parseFloat(accuracy)
        },
        formScore,
        timestamp,
        repDetails: JSON.parse(repDetails),
        videoPath: videoFile.path,
        reportPath: reportFile.path
      });

      // Send notification to coach
      if (coachEmail) {
        await sendCoachNotification(coachEmail, submission);
      }

      res.json({
        success: true,
        message: 'Workout submitted successfully',
        submissionId: submission.id
      });
    } catch (error) {
      console.error('Submission error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);
```

### Python/Flask Example
```python
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
import json

@app.route('/api/workouts', methods=['POST'])
def submit_workout():
    try:
        # Get form data
        athlete_name = request.form.get('athleteName')
        activity_name = request.form.get('activityName')
        total_reps = int(request.form.get('totalReps'))
        correct_reps = int(request.form.get('correctReps'))
        accuracy = float(request.form.get('accuracy'))
        rep_details = json.loads(request.form.get('repDetails'))
        
        # Get uploaded files
        video_file = request.files.get('video')
        report_file = request.files.get('report')
        
        # Save files
        video_path = save_file(video_file, 'videos')
        report_path = save_file(report_file, 'reports')
        
        # Store in database
        submission = save_workout_submission({
            'athlete_name': athlete_name,
            'activity_name': activity_name,
            'total_reps': total_reps,
            'correct_reps': correct_reps,
            'accuracy': accuracy,
            'rep_details': rep_details,
            'video_path': video_path,
            'report_path': report_path
        })
        
        return jsonify({
            'success': True,
            'message': 'Workout submitted successfully',
            'submissionId': submission.id
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500
```

## Features

### Automatic Retry
- Failed submissions are automatically stored
- System retries up to 3 times
- Manual retry option available in settings

### Submission History
- View last 10 successful submissions
- See failed submissions
- Clear history option

### Background Processing
- Submissions happen in the background
- No interruption to athlete workflow
- Silent failures (logged but not shown to user)

## Testing

### Test Endpoint
You can test with a mock endpoint like RequestBin or webhook.site:

1. Go to https://webhook.site
2. Copy your unique URL
3. Add it to your `.env.local`:
   ```
   VITE_COACH_API_ENDPOINT=https://webhook.site/your-unique-id
   ```
4. Complete a workout and generate a report
5. Check webhook.site to see the submitted data

## Security Considerations

1. **HTTPS Only** - Always use HTTPS endpoints
2. **Authentication** - Consider adding API keys or tokens
3. **Rate Limiting** - Implement rate limiting on your API
4. **File Size Limits** - Set appropriate limits for video/PDF uploads
5. **Validation** - Validate all incoming data
6. **Storage** - Use secure cloud storage for files

## Troubleshooting

### Submissions Not Working
1. Check browser console for errors
2. Verify API endpoint is correct
3. Ensure CORS is configured on your API
4. Check network tab for failed requests

### Failed Submissions
1. Go to Settings → Coach Dashboard
2. Check "Failed Submissions" section
3. Click "Retry" to attempt resubmission
4. Check API logs for error details

## Support

For issues or questions:
- Check browser console logs
- Review API server logs
- Verify network connectivity
- Ensure API endpoint is accessible

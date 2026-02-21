# Face Verification System Setup Guide

## Overview
This system adds identity verification before workouts to prevent athlete substitution and ensure fair competition.

## Features
- ✅ Pre-workout face verification
- ✅ Liveness detection (blink check)
- ✅ DeepFace comparison with 85%+ confidence threshold
- ✅ Anomaly flagging for substitution attempts
- ✅ Coach/SAI dashboard verification status
- ✅ Automatic blocking on failed verification

## Architecture

```
Frontend (React/TypeScript)
  ↓
FaceVerificationScreen.tsx
  ↓
Node.js Backend (Express)
  ↓
DeepFace Service (FastAPI/Python)
  ↓
MongoDB (verification logs)
```

## Installation

### 1. Install Python Dependencies

```bash
cd server
pip install fastapi uvicorn deepface opencv-python pillow numpy
```

### 2. Install Node.js Dependencies

```bash
npm install node-fetch
```

### 3. Update Environment Variables

Add to `server/.env`:

```env
DEEPFACE_API_URL=http://localhost:5000
MONGODB_URI=your_mongodb_connection_string
```

## Running the Services

### Start DeepFace Service (Terminal 1)

```bash
cd server
python deepface_service.py
```

This starts the FastAPI service on `http://localhost:5000`

### Start Node.js Backend (Terminal 2)

```bash
cd server
node server.js
```

This starts the Express server on `http://localhost:3001`

### Start Frontend (Terminal 3)

```bash
npm run dev
```

## How It Works

### 1. Athlete Registration
- Athletes upload a clear face photo during profile setup
- Image stored as base64 in MongoDB `users.profileImage`

### 2. Pre-Workout Verification Flow

```
1. Athlete clicks exercise → FaceVerificationScreen opens
2. Camera activates automatically
3. System detects face using ML Kit
4. Prompts "Please blink twice" (liveness check)
5. Captures face image after 2 blinks detected
6. Sends to backend for comparison
7. Backend calls DeepFace API with:
   - Registered profile image
   - Live captured image
   - Facenet model
8. DeepFace returns confidence score
9. If confidence >= 85%:
   ✅ Show "Identity Verified" (2 seconds)
   ✅ Proceed to workout
   ✅ Save verification_status: true
10. If confidence < 85%:
   ❌ Show "Verification Failed - Substitution Detected"
   ❌ Block workout
   ❌ Log anomaly_flag: true
   ❌ Allow retry after 10 seconds
```

### 3. Database Schema

#### Users Collection
```javascript
{
  userId: "string",
  name: "string",
  profileImage: "base64_string", // NEW: Face verification reference
  role: "ATHLETE" | "COACH" | "SAI_ADMIN",
  // ... other fields
}
```

#### Workout Sessions Collection
```javascript
{
  athleteId: "string",
  activityName: "string",
  totalReps: 10,
  face_verified: true,              // NEW
  verification_confidence: 0.92,    // NEW
  anomaly_flag: false,              // NEW
  verified_at: "2024-01-15T10:30:00Z", // NEW
  // ... other fields
}
```

#### Verification Logs Collection (NEW)
```javascript
{
  athleteId: "ObjectId",
  verified: true,
  confidence: 0.92,
  timestamp: "2024-01-15T10:30:00Z",
  anomalyFlag: false
}
```

## Frontend Integration

### Update Activity Detail to Use Verification

Replace `WorkoutInterface` with `WorkoutWithVerification`:

```typescript
// Before
import WorkoutInterface from '@/components/workout/WorkoutInterface';

// After
import WorkoutWithVerification from '@/components/workout/WorkoutWithVerification';

// Usage
<WorkoutWithVerification
  activityName={activity.name}
  onBack={() => navigate(-1)}
/>
```

### Coach Dashboard Updates

Add verification column to results table:

```typescript
{
  header: "Verified",
  cell: (session) => (
    <div className="flex items-center gap-2">
      {session.face_verified ? (
        <>
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span className="text-green-400">
            {(session.verification_confidence * 100).toFixed(1)}%
          </span>
        </>
      ) : session.anomaly_flag ? (
        <>
          <AlertTriangle className="w-4 h-4 text-red-500" />
          <span className="text-red-400">Flagged</span>
        </>
      ) : (
        <span className="text-gray-400">N/A</span>
      )}
    </div>
  )
}
```

## API Endpoints

### POST /api/verify-face
Verify face against registered profile

**Request:**
```json
{
  "athleteId": "user123",
  "liveImage": "data:image/jpeg;base64,..."
}
```

**Response:**
```json
{
  "verified": true,
  "confidence": 0.92,
  "message": "Identity verified successfully",
  "anomalyFlag": false
}
```

### POST /api/sessions/:sessionId/verification
Save verification result to workout session

**Request:**
```json
{
  "athleteId": "user123",
  "face_verified": true,
  "verification_confidence": 0.92,
  "anomaly_flag": false,
  "verified_at": "2024-01-15T10:30:00Z"
}
```

### GET /api/users/:userId/profile-image
Get athlete's registered profile image

**Response:**
```json
{
  "profileImage": "data:image/jpeg;base64,..."
}
```

## Security Considerations

1. **Liveness Detection**: Blink check prevents photo spoofing
2. **High Threshold**: 85% confidence minimum ensures accuracy
3. **Anomaly Logging**: All failed attempts logged for review
4. **Retry Delay**: 10-second cooldown prevents rapid retry attacks
5. **Leaderboard Exclusion**: Flagged results excluded from rankings

## Troubleshooting

### DeepFace Service Won't Start
```bash
# Install missing dependencies
pip install tf-keras tensorflow

# Or use CPU-only version
pip install deepface --no-deps
pip install opencv-python pillow numpy
```

### Camera Access Denied
- Check browser permissions
- Ensure HTTPS in production
- Test with `http://localhost` in development

### Low Confidence Scores
- Ensure good lighting during registration
- Use front-facing camera
- Capture face straight-on, not at angle
- Remove glasses/hats if possible

### MongoDB Connection Issues
```bash
# Check connection string
echo $MONGODB_URI

# Test connection
node server/test-mongodb.js
```

## Testing

### Test Face Verification Endpoint
```bash
curl -X POST http://localhost:3001/api/verify-face \
  -H "Content-Type: application/json" \
  -d '{
    "athleteId": "test123",
    "liveImage": "data:image/jpeg;base64,..."
  }'
```

### Test DeepFace Service
```bash
curl http://localhost:5000/health
```

## Production Deployment

### Vercel (Frontend + Node Backend)
1. Deploy as normal
2. Add environment variable: `DEEPFACE_API_URL`

### DeepFace Service (Separate Server)
```bash
# Use Railway, Render, or AWS EC2
# Install dependencies
pip install -r requirements.txt

# Run with gunicorn
gunicorn -w 4 -k uvicorn.workers.UvicornWorker deepface_service:app
```

### Environment Variables
```env
# Production
DEEPFACE_API_URL=https://your-deepface-service.com
MONGODB_URI=mongodb+srv://...
NODE_ENV=production
```

## Performance Optimization

1. **Cache Face Embeddings**: Store computed embeddings instead of recomputing
2. **Batch Processing**: Process multiple verifications in parallel
3. **CDN for Images**: Use Cloudinary for profile images
4. **Redis Caching**: Cache recent verification results

## Future Enhancements

- [ ] Multi-angle face capture
- [ ] Voice verification
- [ ] Fingerprint integration (mobile)
- [ ] Real-time monitoring dashboard
- [ ] ML-based anomaly detection patterns
- [ ] Automated coach notifications on flags

## Support

For issues or questions:
- Check logs: `server/logs/verification.log`
- MongoDB queries: Use MongoDB Compass
- DeepFace docs: https://github.com/serengil/deepface

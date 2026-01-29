# User Profile System

## Overview
Complete user profile management system with editable fields that persist to MongoDB and sync across page refreshes.

## Features

### ✅ Editable Profile Fields
- **Name** (required) - Used for personalized voice coaching
- **Email** - Contact information
- **Phone Number** - Contact information
- **Profile Picture** - Upload and store in Cloudinary

### ✅ Data Persistence
- **Local Storage** - Immediate access and offline support
- **MongoDB** - Cloud backup and cross-device sync
- **Auto-sync** - Loads from MongoDB on page refresh

### ✅ Profile Picture Management
- Upload images up to 5MB
- Automatic Cloudinary upload
- Base64 fallback if upload fails
- Preview before saving

## API Endpoints

### POST /api/users/profile
Create or update complete user profile
```json
{
  "userId": "user_123",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "profilePic": "data:image/jpeg;base64,..." or "https://cloudinary.com/...",
  "role": "ATHLETE"
}
```

### PATCH /api/users/profile/:userId
Update specific profile fields
```json
{
  "name": "John Smith",
  "email": "john.smith@example.com"
}
```

### GET /api/users/profile/:userId
Get user profile by userId

## Frontend Components

### ProfileSettings Component
Location: `src/components/settings/ProfileSettings.tsx`

Features:
- Profile picture upload with preview
- Name, email, phone editing
- Real-time validation
- Loading states
- Success/error notifications
- Auto-sync from MongoDB on mount

### Integration
The ProfileSettings component is integrated into the SettingsPage, replacing the old NameSettings component.

## Service Layer

### userProfileService
Location: `src/services/userProfileService.ts`

Methods:
- `saveProfile()` - Save complete profile
- `updateProfile()` - Update specific fields
- `getProfile()` - Get local profile
- `syncFromMongoDB()` - Sync from database
- `getProfileFromMongoDB()` - Fetch from database
- `updateProfilePicture()` - Update picture only

## Data Flow

1. **User edits profile** → ProfileSettings component
2. **Save clicked** → userProfileService.saveProfile()
3. **Local save** → localStorage (immediate)
4. **Cloud save** → MongoDB via API (background)
5. **Page refresh** → syncFromMongoDB() → Load latest data

## Changes Made

### Removed
- ❌ "Streaming from Cloudinary CDN" text from CoachDashboard
- ❌ Old NameSettings component (replaced)

### Added
- ✅ ProfileSettings component with full profile editing
- ✅ PATCH endpoint for partial updates
- ✅ Auto-sync from MongoDB on page load
- ✅ Profile picture upload to Cloudinary
- ✅ Email and phone fields

### Updated
- ✅ SettingsPage now uses ProfileSettings
- ✅ userProfileService with sync methods
- ✅ Backend API with PATCH support

## Usage

### For Users
1. Navigate to Settings
2. Click on Profile Settings card
3. Upload profile picture (optional)
4. Enter name (required), email, phone
5. Click "Save Profile"
6. Data persists across page refreshes

### For Developers
```typescript
import { userProfileService } from '@/services/userProfileService';

// Get current profile
const profile = userProfileService.getProfile();

// Update profile
await userProfileService.updateProfile(userId, {
  name: 'New Name',
  email: 'new@email.com'
});

// Sync from MongoDB
await userProfileService.syncFromMongoDB(userId);
```

## Database Schema

```javascript
{
  userId: String,        // Unique identifier
  name: String,          // User's name
  email: String,         // Email address
  phone: String,         // Phone number
  profilePic: String,    // Cloudinary URL or base64
  role: String,          // ATHLETE | COACH | SAI_ADMIN
  district: String,
  state: String,
  age: Number,
  gender: String,
  height: Number,
  weight: Number,
  bio: String,
  createdAt: Date,
  updatedAt: Date
}
```

## Testing

1. **Create Profile**: Enter details and save
2. **Refresh Page**: Verify data persists
3. **Update Profile**: Change fields and save
4. **Upload Picture**: Test image upload
5. **Offline Mode**: Verify localStorage fallback
6. **Cross-device**: Check MongoDB sync

## Notes

- Profile pictures are uploaded to Cloudinary folder: `talenttrack/profiles`
- Maximum image size: 5MB
- Backward compatible with legacy `user_name` localStorage key
- Graceful fallback if MongoDB is unavailable

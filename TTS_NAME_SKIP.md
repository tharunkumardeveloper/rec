# TTS Name Prompt - Role-Based Behavior

## Overview
The TTS (Text-to-Speech) name prompt in the WelcomeDialog now intelligently skips for coaches and SAI admins, only showing for athletes.

## Changes Made

### WelcomeDialog Component
**Location:** `src/components/onboarding/WelcomeDialog.tsx`

**Behavior:**
- ✅ **Athletes**: See the welcome dialog asking for their name for personalized voice coaching
- ✅ **Coaches**: Dialog is automatically skipped, onboarding marked as complete
- ✅ **SAI Admins**: Dialog is automatically skipped, onboarding marked as complete

### Implementation Details

```typescript
useEffect(() => {
  // Check if user has completed onboarding
  const hasCompletedOnboarding = localStorage.getItem('onboarding_completed');
  
  // Check user role - skip dialog for coaches and SAI admins
  const profile = userProfileService.getProfile();
  const userRole = profile?.role;
  
  // Only show dialog for athletes who haven't completed onboarding
  if (!hasCompletedOnboarding && userRole !== 'COACH' && userRole !== 'SAI_ADMIN') {
    setIsOpen(true);
  } else if (userRole === 'COACH' || userRole === 'SAI_ADMIN') {
    // Auto-complete onboarding for coaches and admins
    localStorage.setItem('onboarding_completed', 'true');
  }
}, []);
```

## Why This Change?

### For Athletes
- Voice coaching is a key feature during workouts
- Personalized encouragement ("Great work John! Keep going!")
- Enhances motivation and engagement

### For Coaches & SAI Admins
- Don't perform workouts themselves
- Focus on monitoring and managing athletes
- TTS name prompt is not relevant to their workflow
- Skipping improves onboarding experience

## User Experience Flow

### Athlete Login
1. Login as athlete
2. See WelcomeDialog asking for name
3. Enter name (optional) or skip
4. Name used for voice coaching during workouts

### Coach/Admin Login
1. Login as coach or SAI admin
2. WelcomeDialog automatically skipped
3. Onboarding marked as complete
4. Direct access to dashboard

## Testing

### Test Athlete Flow
1. Clear localStorage: `localStorage.clear()`
2. Create athlete profile with role: `ATHLETE`
3. Refresh page
4. ✅ Should see WelcomeDialog

### Test Coach Flow
1. Clear localStorage: `localStorage.clear()`
2. Create coach profile with role: `COACH`
3. Refresh page
4. ✅ Should NOT see WelcomeDialog
5. ✅ `onboarding_completed` should be set to 'true'

### Test SAI Admin Flow
1. Clear localStorage: `localStorage.clear()`
2. Create SAI admin profile with role: `SAI_ADMIN`
3. Refresh page
4. ✅ Should NOT see WelcomeDialog
5. ✅ `onboarding_completed` should be set to 'true'

## Related Components

### ProfileSettings
Athletes can still update their name in Settings → Profile Settings, which will be used for voice coaching.

### Voice Coach (TTS)
The TTS system reads the name from:
1. User profile (`userProfileService.getProfile().name`)
2. Legacy localStorage key (`user_name`)
3. Falls back to generic encouragement if no name set

## Notes

- The WelcomeDialog is rendered in `src/pages/Index.tsx` at the bottom of the home screen
- It only appears once per user (tracked via `onboarding_completed` localStorage key)
- Coaches and admins can still set their name in Profile Settings if needed
- The change is backward compatible with existing users

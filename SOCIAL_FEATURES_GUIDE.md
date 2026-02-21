# 🌐 Social Media Features - TalentTrack

## Overview

TalentTrack now functions as a social platform where athletes and coaches can connect, view profiles, share workouts, and build professional relationships.

## ✨ Key Features

### 1. Connection System
- **Athlete → Coach**: Athletes can send connection requests to coaches
- **Coach → Athlete**: Coaches can discover and connect with athletes
- **Mutual Connections**: Both parties must accept for full access
- **Request Management**: Accept/reject incoming requests, view sent requests

### 2. Enhanced Profiles
- **Comprehensive Info**: Name, role, region, skills/specializations
- **Workout History**: View connected users' workout sessions
- **Performance Stats**: Total workouts, best scores, accuracy metrics
- **Achievements**: Unlock badges based on performance
- **Privacy**: Workouts only visible to connected users

### 3. Discovery System
- **Search**: Find users by name or region
- **Filter**: View all users, only athletes, or only coaches
- **Smart Recommendations**: Discover users based on skills and location

### 4. Responsive Design
- **Mobile-First**: Optimized for mobile devices with bottom navigation
- **Desktop**: Full-featured layout with sidebar navigation
- **Adaptive UI**: Components adjust based on screen size

## 📱 User Interface

### Mobile View
- Bottom navigation bar with 4 tabs:
  - 🏠 Home
  - 👥 Connect
  - 🏆 Challenges
  - 👤 Profile
- Swipeable cards for user discovery
- Compact profile layouts
- Touch-optimized buttons

### Desktop View
- Sidebar navigation
- Grid layouts for user cards (3 columns)
- Expanded profile information
- Hover effects and animations

## 🔄 User Flows

### Athlete Connecting to Coach

```
1. Athlete opens "Connect" tab
2. Searches for coaches by name/region
3. Filters to show only coaches
4. Views coach profile (limited view)
5. Clicks "Connect" button
6. Request sent → shows "Pending"
7. Coach receives notification
8. Coach accepts request
9. Athlete can now view coach's full profile
10. Workout history becomes visible
```

### Coach Discovering Athletes

```
1. Coach opens "Connect" tab
2. Browses "Discover" section
3. Views athlete cards with:
   - Name, region, role
   - Top 3 skills
   - Profile picture
4. Clicks "View Profile"
5. Sees limited profile (stats only)
6. Sends connection request
7. Athlete accepts
8. Coach gains access to:
   - Full workout history
   - Detailed performance metrics
   - Video recordings
```

### Profile Viewing

```
Connected Users:
✅ View all workouts
✅ See performance stats
✅ Access video recordings
✅ View achievements
✅ Send messages (future)

Non-Connected Users:
❌ Workouts hidden
✅ Basic info visible (name, role, region)
✅ Skills/specializations visible
✅ Can send connection request
```

## 🗄️ Database Schema

### Connections Collection

```javascript
{
  _id: ObjectId,
  fromUserId: "user123",        // Who sent the request
  toUserId: "user456",          // Who received it
  status: "pending",            // pending | accepted | rejected
  createdAt: Date,
  acceptedAt: Date,             // When accepted
  rejectedAt: Date              // When rejected
}
```

### Users Collection (Updated)

```javascript
{
  userId: "user123",
  name: "John Doe",
  role: "ATHLETE",              // ATHLETE | COACH | SAI_ADMIN
  district: "Mumbai",
  email: "john@example.com",
  profilePic: "base64...",
  profileImage: "base64...",    // For face verification
  skills: [                     // NEW
    "Push-ups",
    "Pull-ups",
    "Sit-ups"
  ],
  createdAt: Date
}
```

## 🎨 UI Components

### ConnectionsPage
- **Tabs**: Discover, My Connections, Requests
- **Search Bar**: Real-time filtering
- **Role Filter**: All, Athletes, Coaches
- **User Cards**: Avatar, name, role, region, skills
- **Action Buttons**: Connect, View Profile

### EnhancedProfilePage
- **Header**: Cover photo, avatar, name, role
- **Stats Cards**: Workouts, best score, accuracy
- **Tabs**: Workouts, Statistics, Achievements
- **Privacy Gate**: Connect prompt for non-connected users
- **Responsive**: Adapts to mobile/desktop

### UserCard Component
```typescript
- Avatar (80x80px)
- Name (bold, white)
- Role badge (colored)
- Region (with pin icon)
- Skills (max 3 shown)
- Action buttons:
  - View Profile
  - Connect (if not connected)
```

### RequestCard Component
```typescript
- Avatar (48x48px)
- Name and role
- Region
- Action buttons:
  - Accept (green)
  - Reject (red)
  - Pending badge (for sent requests)
```

## 🔌 API Endpoints

### Discovery
```
GET /api/users/discover?userId={userId}
- Returns users excluding self and connections
```

### Connections
```
GET /api/connections/{userId}
- Returns accepted connections

GET /api/connections/requests/pending/{userId}
- Returns pending incoming requests

GET /api/connections/requests/sent/{userId}
- Returns pending outgoing requests

POST /api/connections/request
Body: { fromUserId, toUserId }
- Sends connection request

POST /api/connections/request/{requestId}/accept
- Accepts request

POST /api/connections/request/{requestId}/reject
- Rejects request

GET /api/connections/status/{userId1}/{userId2}
- Checks connection status between two users
```

### Profile & Stats
```
GET /api/users/{userId}
- Returns user profile

GET /api/users/{userId}/stats
- Returns performance statistics

POST /api/users/{userId}/skills
Body: { skills: ["Push-ups", "Pull-ups"] }
- Updates user skills
```

## 🎯 Skills System

### For Athletes
Skills represent exercises they excel at:
- Push-ups
- Pull-ups
- Sit-ups
- Squats
- Vertical Jump
- Shuttle Run
- Sit & Reach

**Auto-Detection**: System automatically adds skills based on:
- Workouts with 90%+ accuracy
- Consistent performance (5+ sessions)
- High rep counts

### For Coaches
Skills represent specializations:
- Strength Training
- Endurance Coaching
- Flexibility Training
- Speed & Agility
- Form Correction
- Youth Development

**Manual Selection**: Coaches choose during profile setup

## 📊 Statistics Displayed

### Profile Stats
- **Total Workouts**: Count of all completed sessions
- **Best Score**: Highest rep count achieved
- **Avg Accuracy**: Average form accuracy across all workouts
- **Form Quality**: Percentage of "Excellent" form scores
- **Consistency**: Based on workout frequency

### Activity Breakdown
- Pie chart showing workout distribution
- Session count per activity type
- Most performed exercises

### Achievements
- First Workout (1+ workout)
- 10 Workouts (10+ workouts)
- 90% Accuracy (90%+ avg accuracy)
- Consistency King (80%+ consistency)

## 🔒 Privacy & Permissions

### Public Information (Always Visible)
- Name
- Role
- Region
- Skills/Specializations
- Profile Picture
- Basic stats (total workouts, best score)

### Private Information (Connected Users Only)
- Workout history
- Video recordings
- Detailed performance metrics
- Rep-by-rep analysis
- PDF reports

### Connection Requirements
- Both users must accept connection
- Either party can initiate
- Rejected requests can be resent after 7 days
- Users can disconnect anytime

## 🚀 Implementation Checklist

### Frontend
- [x] ConnectionsPage component
- [x] EnhancedProfilePage component
- [x] BottomNav component
- [x] UserCard component
- [x] RequestCard component
- [x] Responsive layouts
- [ ] Update main App.tsx routing
- [ ] Add connections link to existing navigation
- [ ] Integrate with existing profile page

### Backend
- [x] Connections routes
- [x] MongoDB schema updates
- [x] User discovery endpoint
- [x] Connection management endpoints
- [x] Stats calculation endpoint
- [ ] Skills auto-detection logic
- [ ] Notification system

### Database
- [x] Connections collection
- [x] Users schema update (skills field)
- [x] Indexes for performance
- [ ] Migration script for existing users

## 🎨 Design System

### Colors
- **Primary**: Violet (#8B5CF6)
- **Secondary**: Purple (#A855F7)
- **Accent**: Indigo (#6366F1)
- **Success**: Green (#10B981)
- **Error**: Red (#EF4444)
- **Warning**: Yellow (#F59E0B)

### Typography
- **Headings**: Bold, White
- **Body**: Regular, Violet-300
- **Labels**: Small, Violet-400

### Spacing
- **Mobile**: 4px, 8px, 12px, 16px
- **Desktop**: 8px, 16px, 24px, 32px

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 📱 Mobile Optimizations

### Touch Targets
- Minimum 44x44px for all buttons
- Increased padding on mobile
- Larger tap areas for cards

### Performance
- Lazy loading for user lists
- Image optimization
- Infinite scroll for discovery
- Cached API responses

### Gestures
- Swipe to refresh
- Pull to load more
- Swipe cards (future)

## 🔮 Future Enhancements

### Phase 2
- [ ] Direct messaging between connections
- [ ] Group chats for teams
- [ ] Workout challenges between connections
- [ ] Live workout sessions
- [ ] Video calls for coaching

### Phase 3
- [ ] Feed/timeline of connected users' activities
- [ ] Like and comment on workouts
- [ ] Share workouts to social media
- [ ] Leaderboards among connections
- [ ] Team/squad management

### Phase 4
- [ ] AI-powered connection recommendations
- [ ] Skill-based matching
- [ ] Virtual coaching sessions
- [ ] Marketplace for coaching services
- [ ] Certification and badges

## 🐛 Testing Checklist

### Connection Flow
- [ ] Send request as athlete to coach
- [ ] Send request as coach to athlete
- [ ] Accept request
- [ ] Reject request
- [ ] View pending requests
- [ ] View sent requests
- [ ] Check connection status

### Profile Viewing
- [ ] View own profile
- [ ] View connected user profile
- [ ] View non-connected user profile
- [ ] Verify privacy gates work
- [ ] Check stats calculation
- [ ] Verify achievements unlock

### Responsive Design
- [ ] Test on mobile (< 768px)
- [ ] Test on tablet (768-1024px)
- [ ] Test on desktop (> 1024px)
- [ ] Verify bottom nav on mobile
- [ ] Check sidebar on desktop

### Performance
- [ ] Load time < 2 seconds
- [ ] Smooth scrolling
- [ ] No layout shifts
- [ ] Images load progressively

## 📞 Support

For issues or questions:
- Check browser console for errors
- Verify MongoDB connection
- Test API endpoints with Postman
- Review network tab for failed requests

## 🎓 User Guide

### For Athletes
1. Complete your profile with skills
2. Search for coaches in your region
3. Send connection requests
4. Once connected, share your workouts
5. Get feedback from coaches
6. Track your progress

### For Coaches
1. Set up your coaching specializations
2. Discover athletes in your area
3. Review athlete profiles and stats
4. Connect with promising athletes
5. Monitor their progress
6. Provide guidance and feedback

---

**Built with**: React, TypeScript, Tailwind CSS, shadcn/ui, MongoDB

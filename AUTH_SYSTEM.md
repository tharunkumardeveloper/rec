# Authentication System Documentation

## Overview
Complete authentication system with role-based access, email/password login, and MongoDB integration.

## Features

### 1. Role Selection
- **Three Roles**: Athlete, Coach, SAI Admin
- Each role has distinct icon, color, and description
- Users select role first before login/signup

### 2. Login/Signup Flow
1. **Choose Role** → Select Athlete/Coach/Admin
2. **Choose Action** → Login or Create New Account
3. **Enter Credentials**:
   - **Login**: Email + Password
   - **Signup**: Name, Email, Password, Phone (optional), Profile Picture (optional)

### 3. Authentication Features
- ✅ Email/Password authentication
- ✅ Password visibility toggle
- ✅ Profile picture upload (Cloudinary)
- ✅ Role-based access control
- ✅ Session persistence
- ✅ MongoDB storage
- ✅ Real-time validation

## API Endpoints

### POST /api/auth/signup
Create new user account
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+1234567890",
  "role": "ATHLETE",
  "profilePic": "base64_or_url"
}
```

### POST /api/auth/login
Login existing user
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### POST /api/auth/check-email
Check if email exists
```json
{
  "email": "john@example.com"
}
```

## Database Schema

### Users Collection
```javascript
{
  userId: "athlete_abc123",
  name: "John Doe",
  email: "john@example.com",
  password: "password123", // Plain text (use bcrypt in production)
  phone: "+1234567890",
  role: "ATHLETE" | "COACH" | "SAI_ADMIN",
  profilePic: "cloudinary_url",
  createdAt: ISODate,
  updatedAt: ISODate
}
```

## Frontend Components

### LoginSignup.tsx
Main authentication component with 4 steps:
1. **role** - Role selection screen
2. **choice** - Login or Signup choice
3. **login** - Login form
4. **signup** - Signup form with profile picture

### authService.ts
Authentication service handling:
- signup() - Create new account
- login() - Authenticate user
- logout() - Clear session
- getSession() - Get current user
- isLoggedIn() - Check auth status

## User Flow

### New User (Signup)
1. Select role (Athlete/Coach/Admin)
2. Click "Create New Account"
3. Upload profile picture (optional)
4. Enter name, email, password, phone
5. Account created → Auto login → Home screen

### Existing User (Login)
1. Select role (Athlete/Coach/Admin)
2. Click "Login to Existing Account"
3. Enter email and password
4. Login → Home screen

### Logout
1. Go to Profile page
2. Click "Logout" button
3. Session cleared → Back to login screen

## Security Notes

⚠️ **Current Implementation**:
- Passwords stored as plain text
- No password hashing
- No JWT tokens
- No rate limiting

🔒 **Production Requirements**:
- Use bcrypt for password hashing
- Implement JWT tokens
- Add rate limiting
- Add HTTPS
- Add password reset flow
- Add email verification

## TTS Integration

The TTS system automatically uses the athlete's real name from the auth session:
```typescript
// In elevenLabsTTS.ts
private getUserName(): string {
  const authSession = localStorage.getItem('auth_session');
  if (authSession) {
    const session = JSON.parse(authSession);
    return session.name || '';
  }
  return '';
}
```

## Session Management

Sessions are stored in localStorage:
- Key: `auth_session`
- Contains: Full user profile
- Persists across page refreshes
- Cleared on logout

## Testing

### Test Accounts
Create test accounts for each role:

**Athlete**:
- Email: athlete@test.com
- Password: test123

**Coach**:
- Email: coach@test.com
- Password: test123

**Admin**:
- Email: admin@test.com
- Password: test123

## Removed Features
- ❌ Demo users (Rajesh Menon, etc.)
- ❌ Fake localStorage data
- ❌ Role-based auto-login
- ❌ Password-less authentication

## Next Steps
1. Add password hashing (bcrypt)
2. Add JWT tokens
3. Add password reset
4. Add email verification
5. Add 2FA (optional)
6. Add social login (optional)

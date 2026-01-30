/**
 * Authentication Service
 * Handles user authentication and session management
 */

import { userProfileService, UserProfile } from './userProfileService';

interface SignupData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: 'ATHLETE' | 'COACH' | 'SAI_ADMIN';
  profilePic?: string;
}

interface LoginData {
  email: string;
  password: string;
}

class AuthService {
  private readonly BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://rec-backend-yi7u.onrender.com';
  private readonly SESSION_KEY = 'auth_session';
  private readonly RECENT_USERS_KEY = 'recent_users';

  /**
   * Sign up a new user
   */
  public async signup(data: SignupData): Promise<UserProfile> {
    try {
      console.log('📝 Signing up user:', data.email);

      const response = await fetch(`${this.BACKEND_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('❌ Non-JSON response:', text);
        throw new Error('Server error: Expected JSON response but got HTML. Make sure the backend server is running on port 3001.');
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Signup failed');
      }

      console.log('✅ Signup successful:', result.user.userId);

      // Save profile to localStorage
      const profile: UserProfile = {
        userId: result.user.userId,
        name: result.user.name,
        email: result.user.email,
        phone: result.user.phone,
        role: result.user.role,
        profilePic: result.user.profilePic,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await userProfileService.saveProfile(profile);
      this.saveSession(profile);

      return profile;
    } catch (error) {
      console.error('❌ Signup error:', error);
      throw error;
    }
  }

  /**
   * Login existing user
   */
  public async login(data: LoginData): Promise<UserProfile> {
    try {
      console.log('🔐 Logging in user:', data.email);

      const response = await fetch(`${this.BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('❌ Non-JSON response:', text);
        throw new Error('Server error: Expected JSON response but got HTML. Make sure the backend server is running on port 3001.');
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Login failed');
      }

      console.log('✅ Login successful:', result.user.userId);

      // Save profile to localStorage
      const profile: UserProfile = {
        userId: result.user.userId,
        name: result.user.name,
        email: result.user.email,
        phone: result.user.phone,
        role: result.user.role,
        profilePic: result.user.profilePic,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await userProfileService.saveProfile(profile);
      this.saveSession(profile);

      return profile;
    } catch (error) {
      console.error('❌ Login error:', error);
      throw error;
    }
  }

  /**
   * Check if email exists
   */
  public async checkEmail(email: string): Promise<{ exists: boolean; user?: { name: string; role: string } }> {
    try {
      const response = await fetch(`${this.BACKEND_URL}/api/auth/check-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const result = await response.json();
      return {
        exists: result.exists,
        user: result.user
      };
    } catch (error) {
      console.error('❌ Check email error:', error);
      return { exists: false };
    }
  }

  /**
   * Logout user
   */
  public logout(): void {
    console.log('👋 Logging out user');
    localStorage.removeItem(this.SESSION_KEY);
    localStorage.removeItem('talenttrack_user'); // Remove old demo data
    userProfileService.clearProfile();
  }

  /**
   * Get current session
   */
  public getSession(): UserProfile | null {
    try {
      const session = localStorage.getItem(this.SESSION_KEY);
      return session ? JSON.parse(session) : null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if user is logged in
   */
  public isLoggedIn(): boolean {
    return !!this.getSession();
  }

  /**
   * Save session
   */
  private saveSession(profile: UserProfile): void {
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(profile));
    this.addToRecentUsers(profile);
  }

  /**
   * Add user to recent users list (max 3)
   */
  private addToRecentUsers(profile: UserProfile): void {
    try {
      const recentUsersStr = localStorage.getItem(this.RECENT_USERS_KEY);
      let recentUsers: UserProfile[] = recentUsersStr ? JSON.parse(recentUsersStr) : [];
      
      // Remove if already exists
      recentUsers = recentUsers.filter(u => u.userId !== profile.userId);
      
      // Add to front
      recentUsers.unshift(profile);
      
      // Keep only last 3
      recentUsers = recentUsers.slice(0, 3);
      
      localStorage.setItem(this.RECENT_USERS_KEY, JSON.stringify(recentUsers));
    } catch (error) {
      console.error('Error saving recent users:', error);
    }
  }

  /**
   * Get recent users
   */
  public getRecentUsers(): UserProfile[] {
    try {
      const recentUsersStr = localStorage.getItem(this.RECENT_USERS_KEY);
      return recentUsersStr ? JSON.parse(recentUsersStr) : [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Clear all demo/fake data (but keep auth session)
   */
  public clearDemoData(): void {
    console.log('🧹 Clearing old demo data...');
    localStorage.removeItem('talenttrack_user'); // Old demo data
    // Don't remove auth_session or user_profile - these are real user data
  }
}

export const authService = new AuthService();
export default authService;

/**
 * User Profile Service
 * Handles storage and retrieval of user profiles (Athletes, Coaches, SAI Admins)
 */

export interface UserProfile {
  userId: string;
  name: string;
  email?: string;
  phone?: string;
  role: 'ATHLETE' | 'COACH' | 'SAI_ADMIN';
  profilePic?: string; // Base64 or Cloudinary URL
  district?: string;
  state?: string;
  age?: number;
  gender?: 'Male' | 'Female' | 'Other';
  height?: number; // in cm
  weight?: number; // in kg
  specialization?: string; // For coaches
  experience?: string; // For coaches
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

class UserProfileService {
  private readonly STORAGE_KEY = 'user_profile';
  private readonly BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://rec-backend-yi7u.onrender.com';

  /**
   * Save or update user profile
   */
  public async saveProfile(profile: Omit<UserProfile, 'createdAt' | 'updatedAt'>): Promise<UserProfile> {
    const now = new Date().toISOString();
    const existingProfile = this.getLocalProfile();
    
    const fullProfile: UserProfile = {
      ...profile,
      createdAt: existingProfile?.createdAt || now,
      updatedAt: now
    };

    // Save to localStorage
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(fullProfile));

    // Try to save to MongoDB
    try {
      await this.saveToMongoDB(fullProfile);
    } catch (error) {
      console.warn('Failed to save profile to MongoDB:', error);
    }

    return fullProfile;
  }

  /**
   * Update specific profile fields
   */
  public async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const profile = this.getProfile();
    if (!profile) {
      throw new Error('No profile found');
    }

    const updatedProfile: UserProfile = {
      ...profile,
      ...updates,
      userId,
      updatedAt: new Date().toISOString()
    };

    // Save to localStorage
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedProfile));

    // Try to update in MongoDB
    try {
      await this.updateInMongoDB(userId, updates);
    } catch (error) {
      console.warn('Failed to update profile in MongoDB:', error);
    }

    return updatedProfile;
  }

  /**
   * Update profile in MongoDB (PATCH)
   */
  private async updateInMongoDB(userId: string, updates: Partial<UserProfile>): Promise<void> {
    try {
      const response = await fetch(`${this.BACKEND_URL}/api/users/profile/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error(`Failed to update profile: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Profile updated in MongoDB:', result);
    } catch (error) {
      console.error('MongoDB profile update error:', error);
      throw error;
    }
  }

  /**
   * Sync profile from MongoDB to localStorage
   */
  public async syncFromMongoDB(userId: string): Promise<UserProfile | null> {
    try {
      const mongoProfile = await this.getProfileFromMongoDB(userId);
      if (mongoProfile) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(mongoProfile));
        console.log('✅ Profile synced from MongoDB');
        return mongoProfile;
      }
      return null;
    } catch (error) {
      console.error('Failed to sync profile from MongoDB:', error);
      return null;
    }
  }

  /**
   * Get current user profile
   */
  public getProfile(): UserProfile | null {
    return this.getLocalProfile();
  }

  /**
   * Get profile from localStorage
   */
  private getLocalProfile(): UserProfile | null {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error loading profile:', error);
      return null;
    }
  }

  /**
   * Save profile to MongoDB
   */
  private async saveToMongoDB(profile: UserProfile): Promise<void> {
    try {
      const response = await fetch(`${this.BACKEND_URL}/api/users/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profile)
      });

      if (!response.ok) {
        throw new Error(`Failed to save profile: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Profile saved to MongoDB:', result);
    } catch (error) {
      console.error('MongoDB profile save error:', error);
      throw error;
    }
  }

  /**
   * Get profile from MongoDB by userId
   */
  public async getProfileFromMongoDB(userId: string): Promise<UserProfile | null> {
    try {
      const response = await fetch(`${this.BACKEND_URL}/api/users/profile/${userId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch profile: ${response.statusText}`);
      }

      const data = await response.json();
      return data.profile;
    } catch (error) {
      console.error('MongoDB profile fetch error:', error);
      return null;
    }
  }

  /**
   * Update profile picture
   */
  public async updateProfilePicture(profilePic: string): Promise<void> {
    const profile = this.getProfile();
    if (!profile) {
      throw new Error('No profile found');
    }

    await this.saveProfile({
      ...profile,
      profilePic
    });
  }

  /**
   * Clear profile
   */
  public clearProfile(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Get user's role
   */
  public getUserRole(): 'ATHLETE' | 'COACH' | 'SAI_ADMIN' | null {
    const profile = this.getProfile();
    return profile?.role || null;
  }

  /**
   * Check if user is athlete
   */
  public isAthlete(): boolean {
    return this.getUserRole() === 'ATHLETE';
  }

  /**
   * Check if user is coach
   */
  public isCoach(): boolean {
    return this.getUserRole() === 'COACH';
  }

  /**
   * Check if user is SAI admin
   */
  public isSAIAdmin(): boolean {
    return this.getUserRole() === 'SAI_ADMIN';
  }
}

export const userProfileService = new UserProfileService();
export default userProfileService;

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { User, Save, Camera, Mail, Phone, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { userProfileService, UserProfile } from '@/services/userProfileService';

const ProfileSettings = () => {
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    name: '',
    email: '',
    phone: '',
    profilePic: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const existingProfile = userProfileService.getProfile();
      
      // Try to sync from MongoDB if we have a userId
      if (existingProfile?.userId) {
        const syncedProfile = await userProfileService.syncFromMongoDB(existingProfile.userId);
        if (syncedProfile) {
          setProfile({
            name: syncedProfile.name || '',
            email: syncedProfile.email || '',
            phone: syncedProfile.phone || '',
            profilePic: syncedProfile.profilePic || ''
          });
          setPreviewUrl(syncedProfile.profilePic || '');
          return;
        }
      }
      
      // Fallback to local profile
      if (existingProfile) {
        setProfile({
          name: existingProfile.name || '',
          email: existingProfile.email || '',
          phone: existingProfile.phone || '',
          profilePic: existingProfile.profilePic || ''
        });
        setPreviewUrl(existingProfile.profilePic || '');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setProfile(prev => ({ ...prev, profilePic: base64String }));
      setPreviewUrl(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!profile.name?.trim()) {
      toast.error('Name is required');
      return;
    }

    setIsSaving(true);
    try {
      const existingProfile = userProfileService.getProfile();
      
      const updatedProfile = {
        userId: existingProfile?.userId || `user_${Date.now()}`,
        name: profile.name.trim(),
        email: profile.email?.trim() || '',
        phone: profile.phone?.trim() || '',
        profilePic: profile.profilePic || '',
        role: existingProfile?.role || 'ATHLETE',
        district: existingProfile?.district,
        state: existingProfile?.state,
        age: existingProfile?.age,
        gender: existingProfile?.gender,
        height: existingProfile?.height,
        weight: existingProfile?.weight,
        bio: existingProfile?.bio
      };

      await userProfileService.saveProfile(updatedProfile);
      
      // Also update the legacy user_name for backward compatibility
      localStorage.setItem('user_name', profile.name.trim());
      
      toast.success('Profile saved successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="card-elevated">
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-elevated">
      <CardHeader>
        <CardTitle className="flex items-center">
          <User className="w-5 h-5 mr-2" />
          Profile Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Profile Picture */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center border-2 border-primary/20">
              {previewUrl ? (
                <img 
                  src={previewUrl} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-12 h-12 text-primary/40" />
              )}
            </div>
            <label 
              htmlFor="profile-pic-upload" 
              className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-colors"
            >
              <Camera className="w-4 h-4" />
            </label>
            <input
              id="profile-pic-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Click the camera icon to upload a profile picture
          </p>
        </div>

        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="profile-name" className="flex items-center">
            <User className="w-4 h-4 mr-2" />
            Name *
          </Label>
          <Input
            id="profile-name"
            type="text"
            placeholder="Enter your name"
            value={profile.name}
            onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
            maxLength={50}
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="profile-email" className="flex items-center">
            <Mail className="w-4 h-4 mr-2" />
            Email
          </Label>
          <Input
            id="profile-email"
            type="email"
            placeholder="Enter your email"
            value={profile.email}
            onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
            maxLength={100}
          />
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="profile-phone" className="flex items-center">
            <Phone className="w-4 h-4 mr-2" />
            Phone Number
          </Label>
          <Input
            id="profile-phone"
            type="tel"
            placeholder="Enter your phone number"
            value={profile.phone}
            onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
            maxLength={15}
          />
        </div>

        {/* Save Button */}
        <Button 
          onClick={handleSave}
          disabled={isSaving || !profile.name?.trim()}
          className="w-full"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Profile
            </>
          )}
        </Button>

        {profile.name && (
          <div className="p-3 bg-primary/5 rounded-md border border-primary/10">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Preview:</span> "Great work {profile.name}! Keep it up!"
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileSettings;

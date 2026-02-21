import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';
import { User, Mail, Phone, Loader2, Camera, Edit2, X, Save } from 'lucide-react';
import { userProfileService, UserProfile } from '@/services/userProfileService';
import { authService } from '@/services/authService';

const ProfileSettings = () => {
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    name: '',
    email: '',
    phone: '',
    profilePic: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

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
          const profileData = {
            name: syncedProfile.name || '',
            email: syncedProfile.email || '',
            phone: syncedProfile.phone || '',
            profilePic: syncedProfile.profilePic || ''
          };
          setProfile(profileData);
          setEditedProfile(profileData);
          return;
        }
      }
      
      // Fallback to local profile
      if (existingProfile) {
        const profileData = {
          name: existingProfile.name || '',
          email: existingProfile.email || '',
          phone: existingProfile.phone || '',
          profilePic: existingProfile.profilePic || ''
        };
        setProfile(profileData);
        setEditedProfile(profileData);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setEditedProfile(prev => ({ ...prev, profilePic: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const currentProfile = userProfileService.getProfile();
      if (!currentProfile?.userId) {
        toast.error('User ID not found');
        return;
      }

      // Update profile in MongoDB
      await userProfileService.updateProfile(currentProfile.userId, editedProfile);
      
      // Update auth session
      const updatedProfile = { ...currentProfile, ...editedProfile };
      authService.logout(); // Clear old session
      await userProfileService.saveProfile(updatedProfile as UserProfile);
      
      // Reload profile
      await loadProfile();
      
      setIsEditing(false);
      toast.success('Profile updated successfully!');
      
      // Reload page to reflect changes everywhere
      setTimeout(() => window.location.reload(), 1000);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
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
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <User className="w-5 h-5 mr-2" />
            Profile Information
          </CardTitle>
          {!isEditing ? (
            <Button
              onClick={() => setIsEditing(true)}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Edit2 className="w-4 h-4" />
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                onClick={handleCancel}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                disabled={isSaving}
              >
                <X className="w-4 h-4" />
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                size="sm"
                className="flex items-center gap-2"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Profile Picture */}
        <div className="flex flex-col items-center space-y-2">
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center border-4 border-primary/20 shadow-lg">
              {(isEditing ? editedProfile.profilePic : profile.profilePic) ? (
                <img 
                  src={isEditing ? editedProfile.profilePic : profile.profilePic} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-16 h-16 text-primary/40" />
              )}
            </div>
            {isEditing && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors shadow-lg"
              >
                <Camera className="w-4 h-4" />
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
          {isEditing && (
            <p className="text-xs text-muted-foreground text-center">Click camera icon to change photo</p>
          )}
        </div>

        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name" className="flex items-center text-sm font-medium">
            <User className="w-4 h-4 mr-2" />
            Name
          </Label>
          {isEditing ? (
            <Input
              id="name"
              value={editedProfile.name || ''}
              onChange={(e) => setEditedProfile(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter your name"
            />
          ) : (
            <p className="text-base font-semibold">{profile.name || 'Not set'}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center text-sm font-medium">
            <Mail className="w-4 h-4 mr-2" />
            Email
          </Label>
          {isEditing ? (
            <Input
              id="email"
              type="email"
              value={editedProfile.email || ''}
              onChange={(e) => setEditedProfile(prev => ({ ...prev, email: e.target.value }))}
              placeholder="Enter your email"
            />
          ) : (
            <p className="text-base">{profile.email || 'Not set'}</p>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone" className="flex items-center text-sm font-medium">
            <Phone className="w-4 h-4 mr-2" />
            Phone Number
          </Label>
          {isEditing ? (
            <Input
              id="phone"
              type="tel"
              value={editedProfile.phone || ''}
              onChange={(e) => setEditedProfile(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="Enter your phone number"
            />
          ) : (
            <p className="text-base">{profile.phone || 'Not set'}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileSettings;

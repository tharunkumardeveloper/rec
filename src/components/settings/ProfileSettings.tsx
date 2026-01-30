import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Phone, Loader2 } from 'lucide-react';
import { userProfileService, UserProfile } from '@/services/userProfileService';

const ProfileSettings = () => {
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    name: '',
    email: '',
    phone: '',
    profilePic: ''
  });
  const [isLoading, setIsLoading] = useState(true);

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
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
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
          Profile Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Profile Picture */}
        <div className="flex flex-col items-center space-y-2">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center border-4 border-primary/20 shadow-lg">
            {profile.profilePic ? (
              <img 
                src={profile.profilePic} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-16 h-16 text-primary/40" />
            )}
          </div>
          <p className="text-xs text-muted-foreground text-center">Profile information is managed by your administrator</p>
        </div>

        {/* Name */}
        <div className="space-y-2">
          <div className="flex items-center text-sm font-medium text-muted-foreground">
            <User className="w-4 h-4 mr-2" />
            Name
          </div>
          <p className="text-base font-semibold">{profile.name || 'Not set'}</p>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <div className="flex items-center text-sm font-medium text-muted-foreground">
            <Mail className="w-4 h-4 mr-2" />
            Email
          </div>
          <p className="text-base">{profile.email || 'Not set'}</p>
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <div className="flex items-center text-sm font-medium text-muted-foreground">
            <Phone className="w-4 h-4 mr-2" />
            Phone Number
          </div>
          <p className="text-base">{profile.phone || 'Not set'}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileSettings;

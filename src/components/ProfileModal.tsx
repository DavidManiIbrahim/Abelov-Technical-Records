import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Upload, LogOut } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ProfileModal({ open, onOpenChange }: ProfileModalProps) {
  const { user, signOut, updateUser } = useAuth();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [username, setUsername] = useState<string>('');
  const [originalUsername, setOriginalUsername] = useState<string>('');
  const [hasChanges, setHasChanges] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getInitials = (email?: string) => {
    if (!email) return 'U';
    return email
      .split('@')[0]
      .split('.')
      .map(part => part[0].toUpperCase())
      .join('')
      .slice(0, 2);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({ title: 'Error', description: 'Please select an image file', variant: 'destructive' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'Error', description: 'File size must be less than 5MB', variant: 'destructive' });
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      setProfileImage(e.target?.result as string);
      setHasChanges(true);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveChanges = async () => {
    try {
      const { authAPI } = await import('@/lib/api');
      const updatedUser = await authAPI.updateProfile({
        username,
        ...(profileImage && { profile_image: profileImage })
      });

      updateUser({
        username: updatedUser.username,
        profile_image: updatedUser.profile_image
      });

      setOriginalUsername(username);
      setHasChanges(false);
      toast({ title: 'Success', description: 'Profile updated successfully' });
    } catch {
      toast({ title: 'Error', description: 'Failed to update profile', variant: 'destructive' });
    }
  };

  const handleLogout = async () => {
    await signOut();
    onOpenChange(false);
  };

  useEffect(() => {
    if (user) {
      if (user.profile_image) setProfileImage(user.profile_image);
      if (user.username) {
        setUsername(user.username);
        setOriginalUsername(user.username);
      }
    }
  }, [user]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex flex-col items-center gap-4 pb-6 border-b">
            <div className="relative">
              <Avatar
                className="h-24 w-24 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => fileInputRef.current?.click()}
              >
                {profileImage ? (
                  <AvatarImage src={profileImage} alt={user?.email} />
                ) : null}
                <AvatarFallback className="bg-blue-500 text-white text-3xl font-semibold">
                  {getInitials(user?.email)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-full p-1.5">
                <Upload size={14} />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Click avatar to upload photo (Max 5MB)</p>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              disabled={isUploading}
            />
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Email</p>
              <p className="font-medium">{user?.email}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Username</p>
              <Input
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setHasChanges(e.target.value !== originalUsername);
                }}
                placeholder="Enter your username"
                maxLength={50}
              />
            </div>
          </div>

          {hasChanges && (
            <Button onClick={handleSaveChanges} className="w-full" disabled={isUploading}>
              {isUploading ? 'Uploading...' : 'Save Changes'}
            </Button>
          )}

          <Button
            variant="outline"
            className="w-full text-destructive hover:text-destructive"
            onClick={handleLogout}
          >
            <LogOut size={16} className="mr-2" />
            Logout
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
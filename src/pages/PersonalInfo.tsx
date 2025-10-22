import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

const PersonalInfo = () => {
  const navigate = useNavigate();
  const { profile, isLoading, updateProfile } = useProfile();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    email: '',
    nrc_number: '',
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    showCurrent: false,
    showNew: false,
    showConfirm: false,
  });

  const [nrcFront, setNrcFront] = useState<File | null>(null);
  const [nrcBack, setNrcBack] = useState<File | null>(null);
  const [tradingLicense, setTradingLicense] = useState<File | null>(null);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone_number: profile.phone_number || '',
        email: '', // Will be fetched from auth
        nrc_number: profile.nrc_number || '',
      });
    }
  }, [profile]);

  useEffect(() => {
    const fetchEmail = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setFormData(prev => ({ ...prev, email: user.email || '' }));
      }
    };
    fetchEmail();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(formData);
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "New password and confirmation must match",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword === passwordData.currentPassword) {
      toast({
        title: "Same password",
        description: "New password cannot be the same as current password",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });

      if (error) throw error;

      toast({
        title: "Password updated",
        description: "Your password has been changed successfully",
      });

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        showCurrent: false,
        showNew: false,
        showConfirm: false,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const uploadFile = async (file: File, bucket: string, path: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${path}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleFileUploads = async () => {
    setIsSubmitting(true);
    try {
      const updates: any = {};

      if (nrcFront) {
        updates.nrc_front_url = await uploadFile(nrcFront, 'profile-pictures', 'nrc');
      }
      if (nrcBack) {
        updates.nrc_back_url = await uploadFile(nrcBack, 'profile-pictures', 'nrc');
      }
      if (tradingLicense) {
        updates.trading_license_url = await uploadFile(tradingLicense, 'profile-pictures', 'license');
      }
      if (profilePicture) {
        updates.profile_picture_url = await uploadFile(profilePicture, 'profile-pictures', 'avatar');
      }

      if (Object.keys(updates).length > 0) {
        updateProfile(updates);
      }

      setNrcFront(null);
      setNrcBack(null);
      setTradingLicense(null);
      setProfilePicture(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/profile")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-3xl font-bold">Personal Information</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone_number">Phone Number</Label>
              <Input
                id="phone_number"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nrc_number">NRC Number</Label>
              <Input
                id="nrc_number"
                value={formData.nrc_number}
                onChange={(e) => setFormData({ ...formData, nrc_number: e.target.value })}
              />
            </div>

            <Button type="submit" className="w-full">
              Update Information
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current_password">Current Password</Label>
            <div className="relative">
              <Input
                id="current_password"
                type={passwordData.showCurrent ? "text" : "password"}
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0"
                onClick={() => setPasswordData({ ...passwordData, showCurrent: !passwordData.showCurrent })}
              >
                {passwordData.showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="new_password">New Password</Label>
            <div className="relative">
              <Input
                id="new_password"
                type={passwordData.showNew ? "text" : "password"}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0"
                onClick={() => setPasswordData({ ...passwordData, showNew: !passwordData.showNew })}
              >
                {passwordData.showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm_password">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="confirm_password"
                type={passwordData.showConfirm ? "text" : "password"}
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0"
                onClick={() => setPasswordData({ ...passwordData, showConfirm: !passwordData.showConfirm })}
              >
                {passwordData.showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <Button onClick={handlePasswordChange} disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Updating..." : "Change Password"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Documents & Profile Picture</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="profile_picture">Profile Picture</Label>
            <Input
              id="profile_picture"
              type="file"
              accept="image/*"
              onChange={(e) => setProfilePicture(e.target.files?.[0] || null)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nrc_front">NRC Front</Label>
            <Input
              id="nrc_front"
              type="file"
              accept="image/*"
              onChange={(e) => setNrcFront(e.target.files?.[0] || null)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nrc_back">NRC Back</Label>
            <Input
              id="nrc_back"
              type="file"
              accept="image/*"
              onChange={(e) => setNrcBack(e.target.files?.[0] || null)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="trading_license">Trading License (for franchises)</Label>
            <Input
              id="trading_license"
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setTradingLicense(e.target.files?.[0] || null)}
            />
          </div>

          <Button onClick={handleFileUploads} disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Uploading..." : "Upload Documents"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PersonalInfo;
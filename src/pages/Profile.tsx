import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Loader2, Trash2 } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const Profile = () => {
  const { profile, isLoading, updateProfile } = useProfile();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    nrc_number: '',
  });
  const [hasPendingTransactions, setHasPendingTransactions] = useState(false);
  const [isCheckingTransactions, setIsCheckingTransactions] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone_number: profile.phone_number || '',
        nrc_number: profile.nrc_number || '',
      });
    }
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(formData);
  };

  const checkPendingTransactions = async () => {
    setIsCheckingTransactions(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: pendingTxns, error } = await supabase
        .from('payment_transactions')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'pending');

      if (error) throw error;
      setHasPendingTransactions((pendingTxns?.length || 0) > 0);
    } catch (error: any) {
      console.error('Error checking transactions:', error);
    } finally {
      setIsCheckingTransactions(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const scheduledDate = new Date();
      scheduledDate.setDate(scheduledDate.getDate() + 30);

      const { error } = await supabase
        .from('profiles')
        .update({
          deleted_at: new Date().toISOString(),
          deletion_scheduled_for: scheduledDate.toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Account deletion scheduled",
        description: "Your account will be permanently deleted in 30 days.",
      });

      // Sign out user
      await supabase.auth.signOut();
      navigate('/auth');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
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
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-3xl">
          <User className="w-10 h-10" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-muted-foreground">Manage your account settings</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="John Doe" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input 
                id="phone" 
                type="tel"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                placeholder="+260 XXX XXX XXX" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nrc">NRC Number</Label>
              <Input 
                id="nrc"
                value={formData.nrc_number}
                onChange={(e) => setFormData({ ...formData, nrc_number: e.target.value })}
                placeholder="123456/78/9" 
              />
            </div>
            <Button type="submit" className="w-full">
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Once you delete your account, there is no going back. Your account will be kept for 30 days before permanent deletion.
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  className="w-full"
                  onClick={checkPendingTransactions}
                  disabled={isCheckingTransactions}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {isCheckingTransactions ? "Checking..." : "Delete Account"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    {hasPendingTransactions ? (
                      "You have pending transactions. Please complete or cancel them before deleting your account."
                    ) : (
                      "This action will schedule your account for deletion in 30 days. You can cancel this by contacting support within that period."
                    )}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  {!hasPendingTransactions && (
                    <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground">
                      Delete Account
                    </AlertDialogAction>
                  )}
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;

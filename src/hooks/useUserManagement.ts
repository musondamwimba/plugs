import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useUserManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ['all-users'],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_moderation (
            status,
            reason,
            fine_amount,
            expires_at
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return profiles;
    },
  });

  const moderateUser = useMutation({
    mutationFn: async ({ 
      userId, 
      status, 
      reason, 
      fineAmount,
      expiresAt 
    }: { 
      userId: string; 
      status: 'active' | 'suspended' | 'banned' | 'blocked'; 
      reason?: string; 
      fineAmount?: number;
      expiresAt?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check if record exists
      const { data: existing } = await supabase
        .from('user_moderation')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      let data;
      if (existing) {
        // Update existing record
        const { data: updated, error } = await supabase
          .from('user_moderation')
          .update({
            status,
            reason,
            fine_amount: fineAmount || 0,
            moderated_by: user.id,
            expires_at: expiresAt,
          })
          .eq('user_id', userId)
          .select()
          .single();
        
        if (error) throw error;
        data = updated;
      } else {
        // Insert new record
        const { data: inserted, error } = await supabase
          .from('user_moderation')
          .insert([{
            user_id: userId,
            status,
            reason,
            fine_amount: fineAmount || 0,
            moderated_by: user.id,
            expires_at: expiresAt,
          }])
          .select()
          .single();
        
        if (error) throw error;
        data = inserted;
      }

      // Log admin action
      await supabase.from('admin_actions').insert({
        admin_id: user.id,
        action_type: 'user_moderation',
        target_user_id: userId,
        details: { status, reason, fineAmount, expiresAt }
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-users'] });
      toast({
        title: "User moderated",
        description: "User status has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    users,
    isLoading,
    moderateUser: moderateUser.mutate,
  };
}

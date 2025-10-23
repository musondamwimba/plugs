import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useRoles() {
  const { data: roles, isLoading } = useQuery({
    queryKey: ['user-roles'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (error) throw error;
      return data.map(r => r.role);
    },
  });

  return {
    roles: roles || [],
    isLoading,
    isAdmin: roles?.includes('admin') || false,
    isVendor: roles?.includes('vendor') || false,
    isBuyer: roles?.includes('buyer') || false,
  };
}

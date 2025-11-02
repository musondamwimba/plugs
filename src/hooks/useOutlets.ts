import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useOutlets() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: outlets, isLoading } = useQuery({
    queryKey: ['outlets'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('outlets')
        .select('*')
        .eq('vendor_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const createOutlet = useMutation({
    mutationFn: async (outlet: {
      name: string;
      location_lat?: number;
      location_lng?: number;
      location_address?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('outlets')
        .insert([{
          ...outlet,
          vendor_id: user.id,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outlets'] });
      toast({
        title: "Success",
        description: "Outlet created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateOutlet = useMutation({
    mutationFn: async ({ id, ...updates }: {
      id: string;
      name?: string;
      location_lat?: number;
      location_lng?: number;
      location_address?: string;
      is_active?: boolean;
    }) => {
      const { data, error } = await supabase
        .from('outlets')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outlets'] });
      toast({
        title: "Success",
        description: "Outlet updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    outlets,
    isLoading,
    createOutlet: createOutlet.mutate,
    updateOutlet: updateOutlet.mutate,
  };
}

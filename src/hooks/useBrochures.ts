import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useBrochures(outletId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: brochures, isLoading } = useQuery({
    queryKey: ['brochures', outletId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let query = supabase
        .from('brochures')
        .select('*')
        .eq('vendor_id', user.id)
        .order('created_at', { ascending: false });

      if (outletId) {
        query = query.eq('outlet_id', outletId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
    enabled: !!outletId || outletId === undefined,
  });

  const createBrochure = useMutation({
    mutationFn: async (brochure: {
      outlet_id: string;
      title: string;
      brochure_url: string;
      brochure_type: 'brochure' | 'catalog' | 'magazine' | 'product_images';
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check brochure limit (5 max per outlet)
      const { data: existing } = await supabase
        .from('brochures')
        .select('id')
        .eq('outlet_id', brochure.outlet_id)
        .eq('vendor_id', user.id);

      if (existing && existing.length >= 5) {
        throw new Error('Maximum 5 brochures per outlet reached');
      }

      const { data, error } = await supabase
        .from('brochures')
        .insert([{
          ...brochure,
          vendor_id: user.id,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brochures'] });
      toast({
        title: "Success",
        description: "Brochure uploaded successfully.",
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

  const deleteBrochure = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('brochures')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brochures'] });
      toast({
        title: "Success",
        description: "Brochure deleted successfully.",
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
    brochures,
    isLoading,
    createBrochure: createBrochure.mutate,
    deleteBrochure: deleteBrochure.mutate,
  };
}

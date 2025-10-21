import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

export function useProducts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_images(*)
        `)
        .eq('is_active', true)
        .eq('is_sold', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const createProduct = useMutation({
    mutationFn: async (product: TablesInsert<'products'>) => {
      const { data, error } = await supabase
        .from('products')
        .insert(product)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: "Product created",
        description: "Your product has been listed successfully.",
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
    products,
    isLoading,
    createProduct: createProduct.mutate,
  };
}

export function useMyProducts() {
  const { data: products, isLoading } = useQuery({
    queryKey: ['my-products'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_images(*)
        `)
        .eq('vendor_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  return { products, isLoading };
}

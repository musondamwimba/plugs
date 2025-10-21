import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

export function useBids(productId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: bids, isLoading } = useQuery({
    queryKey: ['bids', productId],
    queryFn: async () => {
      let query = supabase
        .from('bids')
        .select(`
          *,
          bidder:bidder_id (
            id,
            profiles (full_name)
          ),
          products (name, starting_bid, bid_end_time)
        `)
        .order('amount', { ascending: false });

      if (productId) {
        query = query.eq('product_id', productId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
    enabled: !!productId,
  });

  const placeBid = useMutation({
    mutationFn: async ({ productId, amount }: { productId: string; amount: number }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('bids')
        .insert({
          product_id: productId,
          bidder_id: user.id,
          amount,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bids'] });
      toast({
        title: "Bid placed",
        description: "Your bid has been placed successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error placing bid",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Subscribe to real-time bids
  useEffect(() => {
    if (!productId) return;

    const channel = supabase
      .channel('bids')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bids',
          filter: `product_id=eq.${productId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['bids', productId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [productId, queryClient]);

  return {
    bids,
    isLoading,
    placeBid: placeBid.mutate,
  };
}

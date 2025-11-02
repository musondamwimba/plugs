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

      // Get current highest bid
      const { data: existingBids } = await supabase
        .from('bids')
        .select('bidder_id, amount')
        .eq('product_id', productId)
        .order('amount', { ascending: false })
        .limit(1);

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

      // Notify previous highest bidder they've been outbid
      if (existingBids && existingBids.length > 0) {
        const previousHighest = existingBids[0];
        if (previousHighest.bidder_id !== user.id) {
          await supabase.from('notifications').insert({
            user_id: previousHighest.bidder_id,
            product_id: productId,
            type: 'outbid',
            title: 'You\'ve been outbid!',
            message: `Your bid of ${previousHighest.amount} ZMK has been outbid. Place a higher bid to win!`,
          });
        }
      }

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

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

      // Get product details for message
      const { data: product } = await supabase
        .from('products')
        .select('name, vendor_id')
        .eq('id', productId)
        .single();

      if (product) {
        // Notify vendor of new bid
        await supabase.from('messages').insert({
          sender_id: user.id,
          receiver_id: product.vendor_id,
          product_id: productId,
          content: `A new bid of ${amount} ZMK has been placed on your product "${product.name}".`,
          is_read: false
        });

        // Notify previous highest bidder they've been outbid
        if (existingBids && existingBids.length > 0) {
          const previousHighest = existingBids[0];
          if (previousHighest.bidder_id !== user.id) {
            await supabase.from('messages').insert({
              sender_id: product.vendor_id,
              receiver_id: previousHighest.bidder_id,
              product_id: productId,
              content: `You have been outbid on "${product.name}". The current highest bid is ${amount} ZMK. Place a higher bid to win!`,
              is_read: false
            });
          }
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

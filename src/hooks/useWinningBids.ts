import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useWinningBids() {
  const { data: winningBids, isLoading } = useQuery({
    queryKey: ['winning-bids'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('bids')
        .select(`
          *,
          products (
            id,
            name,
            price,
            product_images (image_url)
          )
        `)
        .eq('bidder_id', user.id)
        .eq('is_winning_bid', true)
        .eq('payment_status', 'pending');

      if (error) throw error;
      return data;
    },
  });

  return {
    winningBids,
    isLoading,
  };
}

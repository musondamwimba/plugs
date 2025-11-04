import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useCheckout() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const notifyVendor = useMutation({
    mutationFn: async ({ productId, vendorId, productName }: { productId: string; vendorId: string; productName: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Send message to vendor
      const { error } = await supabase.from('messages').insert({
        sender_id: user.id,
        receiver_id: vendorId,
        product_id: productId,
        content: `A customer has added "${productName}" to their cart and is proceeding to checkout.`,
        is_read: false
      });

      if (error) throw error;
    },
  });

  return {
    notifyVendor: notifyVendor.mutate,
  };
}

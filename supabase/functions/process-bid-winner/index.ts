import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Find all bid products where deadline has passed
    const now = new Date();
    const { data: expiredBids, error: bidsError } = await supabaseClient
      .from('products')
      .select(`
        id,
        name,
        vendor_id,
        bid_end_time,
        bids (
          id,
          bidder_id,
          amount,
          is_winning_bid,
          payment_deadline,
          payment_status
        )
      `)
      .eq('is_bid', true)
      .lte('bid_end_time', now.toISOString())
      .eq('is_sold', false);

    if (bidsError) throw bidsError;

    for (const product of expiredBids || []) {
      if (!product.bids || product.bids.length === 0) continue;

      // Sort bids by amount descending
      const sortedBids = [...product.bids].sort((a, b) => b.amount - a.amount);
      const winningBid = sortedBids[0];

      // Check if winning bid already processed
      if (winningBid.is_winning_bid) {
        // Check if payment deadline passed
        if (winningBid.payment_deadline && new Date(winningBid.payment_deadline) < now) {
          if (winningBid.payment_status === 'pending') {
            // Mark as failed and ban user temporarily
            await supabaseClient.from('bids').update({
              payment_status: 'failed'
            }).eq('id', winningBid.id);

            // Temporary ban user
            await supabaseClient.from('user_moderation').insert({
              user_id: winningBid.bidder_id,
              status: 'suspended',
              reason: 'Failed to pay for winning bid within 48 hours',
              expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
              moderated_by: product.vendor_id
            });

            // Notify banned user
            await supabaseClient.from('messages').insert({
              sender_id: product.vendor_id,
              receiver_id: winningBid.bidder_id,
              product_id: product.id,
              content: `You have been temporarily suspended for failing to pay for your winning bid on "${product.name}" within 48 hours. Your account will be restored in 7 days.`,
              is_read: false
            });

            // Move to second highest bidder
            if (sortedBids.length > 1) {
              const secondBid = sortedBids[1];
              
              // Mark second bidder as new winner
              await supabaseClient.from('bids').update({
                is_winning_bid: true,
                payment_deadline: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
              }).eq('id', secondBid.id);

              // Notify new winner
              await supabaseClient.from('messages').insert({
                sender_id: product.vendor_id,
                receiver_id: secondBid.bidder_id,
                product_id: product.id,
                content: `Congratulations! You are now the winning bidder for "${product.name}" at ${secondBid.amount} ZMK. The previous winner failed to pay. Are you still interested? Please confirm within 48 hours.`,
                is_read: false
              });
            }
          }
        }
        continue;
      }

      // Set as winning bid with 48hr payment deadline
      const paymentDeadline = new Date(Date.now() + 48 * 60 * 60 * 1000);
      await supabaseClient.from('bids').update({
        is_winning_bid: true,
        payment_deadline: paymentDeadline.toISOString()
      }).eq('id', winningBid.id);

      // Notify winner
      await supabaseClient.from('messages').insert({
        sender_id: product.vendor_id,
        receiver_id: winningBid.bidder_id,
        product_id: product.id,
        content: `Congratulations! You won the bid for "${product.name}" at ${winningBid.amount} ZMK. Please complete payment within 48 hours to secure your purchase.`,
        is_read: false
      });

      // Notify vendor
      await supabaseClient.from('notifications').insert({
        user_id: product.vendor_id,
        product_id: product.id,
        type: 'bid_won',
        title: 'Bid Completed',
        message: `Your product "${product.name}" sold to a bidder for ${winningBid.amount} ZMK.`
      });
    }

    return new Response(
      JSON.stringify({ success: true, processed: expiredBids?.length || 0 }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});

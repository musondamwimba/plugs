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

    // Check for bids ending in 1 hour
    const oneHourFromNow = new Date();
    oneHourFromNow.setHours(oneHourFromNow.getHours() + 1);
    
    const { data: products, error: productsError } = await supabaseClient
      .from('products')
      .select(`
        id,
        name,
        bid_end_time,
        bids (
          bidder_id,
          amount
        )
      `)
      .eq('is_bid', true)
      .gte('bid_end_time', new Date().toISOString())
      .lte('bid_end_time', oneHourFromNow.toISOString());

    if (productsError) throw productsError;

    for (const product of products || []) {
      if (!product.bids || product.bids.length === 0) continue;

      // Get highest bid
      const sortedBids = [...product.bids].sort((a, b) => b.amount - a.amount);
      const highestBid = sortedBids[0];

      // Notify all bidders except the highest
      for (const bid of sortedBids.slice(1)) {
        await supabaseClient.from('notifications').insert({
          user_id: bid.bidder_id,
          product_id: product.id,
          type: 'bid_ending',
          title: 'Bid Ending Soon!',
          message: `The bid for "${product.name}" ends in 1 hour. Current highest bid: ${highestBid.amount} ZMK. Increase your bid to win!`,
        });
      }
    }

    return new Response(
      JSON.stringify({ success: true, processed: products?.length || 0 }),
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

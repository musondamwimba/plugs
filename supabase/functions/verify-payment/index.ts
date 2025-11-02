import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabaseClient.auth.getUser(token);

    if (!user) {
      throw new Error('Unauthorized');
    }

    const { transaction_id, verification_code } = await req.json();

    // Fetch transaction
    const { data: transaction, error: fetchError } = await supabaseClient
      .from('payment_transactions')
      .select('*')
      .eq('id', transaction_id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !transaction) {
      throw new Error('Transaction not found');
    }

    if (transaction.status !== 'pending') {
      throw new Error('Transaction already processed');
    }

    // Verify code
    if (transaction.verification_code !== verification_code) {
      throw new Error('Invalid verification code');
    }

    // Update transaction status
    const { error: updateError } = await supabaseClient
      .from('payment_transactions')
      .update({
        status: 'completed',
        verified_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
      })
      .eq('id', transaction_id);

    if (updateError) throw updateError;

    // Update user balance (deposit)
    if (transaction.transaction_type === 'deposit') {
      const { data: profile } = await supabaseClient
        .from('profiles')
        .select('balance')
        .eq('id', user.id)
        .single();

      const newBalance = (profile?.balance || 0) + parseFloat(transaction.amount);

      const { error: balanceError } = await supabaseClient
        .from('profiles')
        .update({ balance: newBalance })
        .eq('id', user.id);

      if (balanceError) throw balanceError;

      // Create transaction record
      await supabaseClient
        .from('transactions')
        .insert([{
          user_id: user.id,
          type: 'deposit',
          amount: transaction.amount,
          admin_fee: transaction.fee,
          description: `Deposit via ${transaction.payment_method}`,
        }]);

      // Delete old deposit record if exists
      await supabaseClient
        .from('deposits')
        .delete()
        .eq('user_id', user.id)
        .eq('amount', transaction.amount)
        .eq('payment_method', transaction.payment_method);
    }

    // Handle withdrawal
    if (transaction.transaction_type === 'withdrawal') {
      const { data: profile } = await supabaseClient
        .from('profiles')
        .select('balance')
        .eq('id', user.id)
        .single();

      const newBalance = (profile?.balance || 0) - parseFloat(transaction.amount) - parseFloat(transaction.fee);

      if (newBalance < 0) {
        throw new Error('Insufficient balance');
      }

      const { error: balanceError } = await supabaseClient
        .from('profiles')
        .update({ balance: newBalance })
        .eq('id', user.id);

      if (balanceError) throw balanceError;

      // Create transaction record
      await supabaseClient
        .from('transactions')
        .insert([{
          user_id: user.id,
          type: 'withdrawal',
          amount: -transaction.amount,
          admin_fee: transaction.fee,
          description: `Withdrawal via ${transaction.payment_method}`,
        }]);

      // Delete old withdrawal record if exists
      await supabaseClient
        .from('withdrawals')
        .delete()
        .eq('user_id', user.id)
        .eq('amount', transaction.amount)
        .eq('payment_method', transaction.payment_method);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Payment verified successfully',
        transaction_type: transaction.transaction_type,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

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

    const { amount, fee, payment_method, phone_number, account_number } = await req.json();

    // Validate input
    if (!amount || amount <= 0) {
      throw new Error('Invalid amount');
    }

    if (!payment_method || !['Mobile Money', 'Bank Transfer'].includes(payment_method)) {
      throw new Error('Invalid payment method');
    }

    // Check user balance
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('balance')
      .eq('id', user.id)
      .single();

    const totalAmount = parseFloat(amount) + parseFloat(fee);
    if (!profile || profile.balance < totalAmount) {
      throw new Error('Insufficient balance');
    }

    // Generate verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Create payment transaction
    const { data: transaction, error: transactionError } = await supabaseClient
      .from('payment_transactions')
      .insert([{
        user_id: user.id,
        transaction_type: 'withdrawal',
        amount,
        fee,
        payment_method,
        phone_number,
        account_number,
        verification_code: verificationCode,
        status: 'pending',
        metadata: {
          ip_address: req.headers.get('x-forwarded-for'),
          user_agent: req.headers.get('user-agent'),
        }
      }])
      .select()
      .single();

    if (transactionError) throw transactionError;

    // TODO: Integrate with actual payment provider
    // For now, simulate sending verification code
    console.log(`Verification code for withdrawal: ${verificationCode}`);

    return new Response(
      JSON.stringify({
        success: true,
        transaction_id: transaction.id,
        message: 'Verification code sent. Please verify to complete withdrawal.',
        requires_verification: true,
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

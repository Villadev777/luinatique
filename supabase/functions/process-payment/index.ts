import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PaymentRequest {
  order_id: string;
  payment_method: string;
  payment_details: {
    card_number?: string;
    exp_month?: string;
    exp_year?: string;
    cvv?: string;
    cardholder_name?: string;
  };
  billing_address: {
    line1: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');

    if (!stripeSecretKey) {
      throw new Error('Stripe secret key not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const paymentData: PaymentRequest = await req.json();
    const { order_id, payment_method, payment_details, billing_address } = paymentData;

    console.log('Processing payment for order:', order_id);

    // Fetch order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', order_id)
      .single();

    if (orderError) {
      throw new Error(`Order not found: ${orderError.message}`);
    }

    // Simulate payment processing (replace with actual Stripe integration)
    const paymentResponse = await simulatePayment(order.total_amount, payment_details);

    if (paymentResponse.success) {
      // Update order status
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          payment_status: 'paid',
          payment_method: payment_method,
          billing_address: billing_address,
          status: 'processing'
        })
        .eq('id', order_id);

      if (updateError) {
        throw new Error(`Failed to update order: ${updateError.message}`);
      }

      // Call order confirmation email function
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('user_id', order.user_id)
          .single();

        await supabase.functions.invoke('send-order-confirmation', {
          body: {
            order_id: order_id,
            customer_email: order.user_id, // In a real app, you'd get this from auth
            customer_name: profile?.display_name || 'Valued Customer'
          }
        });
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
        // Don't fail the payment if email fails
      }

      console.log('Payment processed successfully for order:', order_id);

      return new Response(JSON.stringify({
        success: true,
        payment_id: paymentResponse.payment_id,
        order_id: order_id,
        status: 'paid'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else {
      throw new Error(paymentResponse.error || 'Payment failed');
    }

  } catch (error) {
    console.error('Error in process-payment function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Simulate payment processing (replace with actual Stripe API calls)
async function simulatePayment(amount: number, paymentDetails: any) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Simple validation
  if (!paymentDetails.card_number || paymentDetails.card_number.length < 16) {
    return { success: false, error: 'Invalid card number' };
  }

  if (!paymentDetails.cvv || paymentDetails.cvv.length < 3) {
    return { success: false, error: 'Invalid CVV' };
  }

  // Simulate random failures (10% failure rate)
  if (Math.random() < 0.1) {
    return { success: false, error: 'Payment declined by issuer' };
  }

  return {
    success: true,
    payment_id: `pi_${Math.random().toString(36).substr(2, 9)}`,
    amount_charged: amount
  };
}
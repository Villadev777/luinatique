import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { MercadoPago, Payment } from "npm:mercadopago";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verify method
    if (req.method !== 'GET') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get MercadoPago credentials from environment
    const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
    if (!accessToken) {
      return new Response(
        JSON.stringify({ error: 'MercadoPago access token not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get payment ID from URL
    const url = new URL(req.url);
    const paymentId = url.pathname.split('/').pop();
    
    if (!paymentId) {
      return new Response(
        JSON.stringify({ error: 'Payment ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Initialize MercadoPago
    const client = new MercadoPago({
      accessToken: accessToken,
      options: {
        timeout: 5000
      }
    });

    // Get payment details
    const payment = new Payment(client);
    const result = await payment.get({ id: paymentId });

    console.log('Payment retrieved:', result);

    return new Response(
      JSON.stringify(result),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error getting payment:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to get payment details',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
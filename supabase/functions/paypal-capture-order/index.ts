import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// PayPal API configuration
const getPayPalConfig = () => {
  const clientId = Deno.env.get('PAYPAL_CLIENT_ID');
  const clientSecret = Deno.env.get('PAYPAL_CLIENT_SECRET');
  const isProduction = Deno.env.get('PAYPAL_MODE') === 'production';
  
  if (!clientId || !clientSecret) {
    throw new Error('PayPal credentials not configured');
  }
  
  return {
    clientId,
    clientSecret,
    baseUrl: isProduction 
      ? 'https://api-m.paypal.com' 
      : 'https://api-m.sandbox.paypal.com',
  };
};

// Get PayPal access token
async function getPayPalAccessToken(): Promise<string> {
  const config = getPayPalConfig();
  
  const auth = btoa(`${config.clientId}:${config.clientSecret}`);
  
  const response = await fetch(`${config.baseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  
  if (!response.ok) {
    const error = await response.text();
    console.error('PayPal auth error:', error);
    throw new Error('Failed to get PayPal access token');
  }
  
  const data = await response.json();
  return data.access_token;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('🚀 PayPal Capture Order - Start');
    
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Extract order ID from URL path
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const orderID = pathParts[pathParts.length - 1];
    
    if (!orderID) {
      return new Response(
        JSON.stringify({ error: 'Order ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('📝 Capturing order:', orderID);

    // Get access token
    const accessToken = await getPayPalAccessToken();
    console.log('✅ PayPal access token obtained');

    // Capture the order
    const config = getPayPalConfig();
    const response = await fetch(`${config.baseUrl}/v2/checkout/orders/${orderID}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'PayPal-Request-Id': crypto.randomUUID(),
      },
    });

    const responseText = await response.text();
    console.log('📥 PayPal Capture Response:', {
      status: response.status,
      statusText: response.statusText,
      body: responseText
    });

    if (!response.ok) {
      console.error('❌ PayPal Capture Error:', responseText);
      return new Response(
        JSON.stringify({ 
          error: 'PayPal capture error',
          status: response.status,
          details: responseText
        }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const result = JSON.parse(responseText);
    console.log('✅ PayPal order captured successfully:', {
      id: result.id,
      status: result.status,
      payer: result.payer?.email_address
    });

    // Here you would typically save the payment details to your database
    // and update order status, send confirmation emails, etc.

    return new Response(
      JSON.stringify(result),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ Error capturing PayPal order:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to capture PayPal order',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

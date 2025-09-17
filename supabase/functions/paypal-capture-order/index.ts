import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

// Initialize Supabase client
const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

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

// Update order status in database
async function updateOrderInDatabase(paypalOrderId: string, captureDetails: any) {
  try {
    const { payer, purchase_units } = captureDetails;
    const payerId = payer?.payer_id;
    const captureId = purchase_units?.[0]?.payments?.captures?.[0]?.id;
    
    // First, try to find the order by PayPal order ID
    const { data: order, error: fetchError } = await supabaseClient
      .from('orders')
      .select('*')
      .eq('paypal_order_id', paypalOrderId)
      .single();

    if (fetchError) {
      console.error('Error fetching order:', fetchError);
      throw new Error(`Failed to find order: ${fetchError.message}`);
    }

    if (!order) {
      throw new Error('Order not found in database');
    }

    // Update the order with capture details
    const { data: updatedOrder, error: updateError } = await supabaseClient
      .from('orders')
      .update({
        paypal_payer_id: payerId,
        payment_id: captureId,
        payment_status: 'completed',
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('paypal_order_id', paypalOrderId)
      .select()
      .single();

    if (updateError) {
      console.error('Database update error:', updateError);
      throw new Error(`Failed to update order: ${updateError.message}`);
    }

    console.log('✅ Order updated in database:', updatedOrder.id);
    return updatedOrder;
  } catch (error) {
    console.error('❌ Error updating order in database:', error);
    throw error;
  }
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('🚀 PayPal Capture Order - Start');
    console.log('🌐 Origin:', req.headers.get('origin'));
    
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

    // Update order in database
    try {
      await updateOrderInDatabase(orderID, result);
      console.log('✅ Order status updated in database');
    } catch (dbError) {
      console.error('⚠️ Failed to update order in database (PayPal capture still successful):', dbError);
      // Don't fail the entire request if DB update fails
    }

    // Here you would typically:
    // 1. Send confirmation email to customer
    // 2. Update inventory
    // 3. Trigger fulfillment process
    // 4. Send notifications to admin

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

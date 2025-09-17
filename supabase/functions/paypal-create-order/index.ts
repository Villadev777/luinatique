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

// Store order in database
async function storeOrderInDatabase(orderData: any, paypalOrderId: string) {
  try {
    const { purchase_units } = orderData;
    const purchaseUnit = purchase_units[0];
    const { amount, items, reference_id } = purchaseUnit;
    
    // Create external reference if not provided
    const externalRef = reference_id || `PAYPAL_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Calculate PEN amount (approximate conversion)
    const exchangeRate = 3.7; // USD to PEN approximate rate
    const usdAmount = parseFloat(amount.value);
    const penAmount = usdAmount * exchangeRate;
    
    // Extract customer info from items or use defaults
    const customerEmail = orderData.customer_email || 'customer@example.com';
    const customerName = orderData.customer_name || 'PayPal Customer';
    
    const { data, error } = await supabaseClient
      .from('orders')
      .insert({
        payment_method: 'paypal',
        external_reference: externalRef,
        paypal_order_id: paypalOrderId,
        total_amount: penAmount,
        currency: 'USD',
        exchange_rate: exchangeRate,
        customer_email: customerEmail,
        customer_name: customerName,
        items: items || [],
        status: 'pending',
        payment_status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      throw new Error(`Failed to store order: ${error.message}`);
    }

    console.log('✅ Order stored in database:', data.id);
    return data;
  } catch (error) {
    console.error('❌ Error storing order in database:', error);
    throw error;
  }
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('🚀 PayPal Create Order - Start');
    console.log('🌐 Origin:', req.headers.get('origin'));
    console.log('🔧 Environment check:', {
      hasClientId: !!Deno.env.get('PAYPAL_CLIENT_ID'),
      hasClientSecret: !!Deno.env.get('PAYPAL_CLIENT_SECRET'),
      mode: Deno.env.get('PAYPAL_MODE'),
      hasSupabaseUrl: !!Deno.env.get('SUPABASE_URL'),
      hasServiceKey: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    });
    
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get access token
    const accessToken = await getPayPalAccessToken();
    console.log('✅ PayPal access token obtained');

    // Parse request body
    const orderData = await req.json();
    console.log('📝 Order data received:', JSON.stringify(orderData, null, 2));

    // Create order with PayPal
    const config = getPayPalConfig();
    const response = await fetch(`${config.baseUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'PayPal-Request-Id': crypto.randomUUID(),
      },
      body: JSON.stringify(orderData),
    });

    const responseText = await response.text();
    console.log('📥 PayPal API Response:', {
      status: response.status,
      statusText: response.statusText,
      body: responseText
    });

    if (!response.ok) {
      console.error('❌ PayPal API Error:', responseText);
      return new Response(
        JSON.stringify({ 
          error: 'PayPal API error',
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
    console.log('✅ PayPal order created successfully:', {
      id: result.id,
      status: result.status
    });

    // Store order in database
    try {
      await storeOrderInDatabase(orderData, result.id);
    } catch (dbError) {
      console.error('⚠️ Failed to store order in database (PayPal order still created):', dbError);
      // Don't fail the entire request if DB storage fails
    }

    return new Response(
      JSON.stringify(result),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ Error creating PayPal order:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to create PayPal order',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { MercadoPago, Preference } from "npm:mercadopago";

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
    if (req.method !== 'POST') {
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

    // Initialize MercadoPago
    const client = new MercadoPago({
      accessToken: accessToken,
      options: {
        timeout: 5000,
        idempotencyKey: crypto.randomUUID()
      }
    });

    // Parse request body
    const preferenceData = await req.json();
    
    // Validate required fields
    if (!preferenceData.items || !Array.isArray(preferenceData.items) || preferenceData.items.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Items are required and must be a non-empty array' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create preference
    const preference = new Preference(client);
    const result = await preference.create({
      body: {
        ...preferenceData,
        // Ensure auto_return is set
        auto_return: preferenceData.auto_return || 'approved',
        // Add default payment methods if not provided
        payment_methods: {
          installments: 12,
          ...preferenceData.payment_methods
        },
        // Add metadata
        metadata: {
          source: 'luinatique_ecommerce',
          timestamp: new Date().toISOString(),
          ...preferenceData.metadata
        }
      }
    });

    console.log('Preference created:', result);

    return new Response(
      JSON.stringify(result),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error creating MercadoPago preference:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to create payment preference',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
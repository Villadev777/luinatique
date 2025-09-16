import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('🚀 MercadoPago Create Preference - Start');
    
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
      console.error('❌ MERCADOPAGO_ACCESS_TOKEN no configurado');
      return new Response(
        JSON.stringify({ error: 'MercadoPago access token not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('✅ Access token encontrado:', accessToken.substring(0, 20) + '...');

    // Parse request body
    const preferenceData = await req.json();
    console.log('📝 Request data recibida:', JSON.stringify(preferenceData, null, 2));
    
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

    if (!preferenceData.payer || !preferenceData.payer.email) {
      return new Response(
        JSON.stringify({ error: 'Payer email is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Prepare preference data for MercadoPago API
    const preferencePayload = {
      items: preferenceData.items.map((item: any) => ({
        id: item.id,
        title: item.title,
        quantity: item.quantity,
        currency_id: item.currency_id || 'PEN',
        unit_price: item.unit_price,
        description: item.description,
        picture_url: item.picture_url,
      })),
      payer: {
        email: preferenceData.payer.email,
        name: preferenceData.payer.name,
        ...(preferenceData.payer.phone && { phone: preferenceData.payer.phone }),
        ...(preferenceData.payer.address && { address: preferenceData.payer.address }),
      },
      back_urls: preferenceData.back_urls || {
        success: `${new URL(req.url).origin}/payment/success`,
        failure: `${new URL(req.url).origin}/payment/failure`,
        pending: `${new URL(req.url).origin}/payment/pending`,
      },
      auto_return: preferenceData.auto_return || 'approved',
      notification_url: preferenceData.notification_url,
      statement_descriptor: preferenceData.statement_descriptor || 'LUNATIQUE',
      external_reference: preferenceData.external_reference || `LUINA_${Date.now()}_${crypto.randomUUID().substring(0, 8)}`,
      expires: preferenceData.expires !== false,
      expiration_date_to: preferenceData.expiration_date_to || (() => {
        const exp = new Date();
        exp.setHours(exp.getHours() + 24);
        return exp.toISOString();
      })(),
      payment_methods: {
        installments: 12,
        ...preferenceData.payment_methods
      },
      ...(preferenceData.shipments && { shipments: preferenceData.shipments }),
      metadata: {
        source: 'luinatique_ecommerce',
        timestamp: new Date().toISOString(),
        ...preferenceData.metadata
      }
    };

    console.log('🎯 Datos preparados para MercadoPago:', JSON.stringify(preferencePayload, null, 2));

    // Call MercadoPago API directly using fetch
    console.log('📤 Creando preferencia en MercadoPago API...');
    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': crypto.randomUUID(),
      },
      body: JSON.stringify(preferencePayload),
    });

    const responseText = await response.text();
    console.log('📥 MercadoPago API Response:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      body: responseText
    });

    if (!response.ok) {
      console.error('❌ MercadoPago API Error:', {
        status: response.status,
        statusText: response.statusText,
        body: responseText
      });
      
      return new Response(
        JSON.stringify({ 
          error: 'MercadoPago API error',
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
    console.log('✅ Preferencia creada exitosamente:', {
      id: result.id,
      init_point: result.init_point,
      sandbox_init_point: result.sandbox_init_point,
    });

    // Return only the necessary data
    return new Response(
      JSON.stringify({
        id: result.id,
        init_point: result.init_point,
        sandbox_init_point: result.sandbox_init_point,
        public_key: result.public_key,
        external_reference: result.external_reference,
        date_created: result.date_created,
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ Error creating MercadoPago preference:', error);
    
    // Log detailed error information
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
    
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

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

    // Verificar que sea un token TEST
    const isTestToken = accessToken.startsWith('TEST-');
    console.log('🔑 Access token type:', isTestToken ? 'TEST (Sandbox)' : 'PRODUCTION');
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

    // Validar cada item
    for (const item of preferenceData.items) {
      if (!item.title || item.title.trim() === '') {
        return new Response(
          JSON.stringify({ error: 'Item title is required and cannot be empty' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (!item.unit_price || item.unit_price <= 0) {
        return new Response(
          JSON.stringify({ error: `Item "${item.title}" must have a price greater than 0` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (!item.quantity || item.quantity <= 0) {
        return new Response(
          JSON.stringify({ error: `Item "${item.title}" must have a quantity greater than 0` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
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

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(preferenceData.payer.email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare preference data for MercadoPago API
    const preferencePayload = {
      items: preferenceData.items.map((item: any) => ({
        id: String(item.id || crypto.randomUUID()),
        title: String(item.title).substring(0, 256), // MercadoPago limita a 256 caracteres
        quantity: Number(item.quantity),
        currency_id: 'PEN', // SIEMPRE PEN para Perú
        unit_price: Number(item.unit_price),
        description: item.description ? String(item.description).substring(0, 256) : undefined,
        picture_url: item.picture_url,
      })),
      payer: {
        email: preferenceData.payer.email,
        name: preferenceData.payer.name || 'Usuario',
        ...(preferenceData.payer.phone && { 
          phone: {
            area_code: '',
            number: String(preferenceData.payer.phone.number || preferenceData.payer.phone)
          }
        }),
        ...(preferenceData.payer.address && { 
          address: {
            street_name: preferenceData.payer.address.street_name,
            street_number: Number(preferenceData.payer.address.street_number),
            zip_code: preferenceData.payer.address.zip_code
          }
        }),
      },
      back_urls: preferenceData.back_urls || {
        success: 'https://lunatiqueshop.netlify.app/payment/success',
        failure: 'https://lunatiqueshop.netlify.app/payment/failure',
        pending: 'https://lunatiqueshop.netlify.app/payment/pending',
      },
      auto_return: 'approved',
      notification_url: preferenceData.notification_url,
      statement_descriptor: 'LUINATIQUE',
      external_reference: preferenceData.external_reference || `LUINA_${Date.now()}_${crypto.randomUUID().substring(0, 8)}`,
      expires: true,
      expiration_date_to: (() => {
        const exp = new Date();
        exp.setHours(exp.getHours() + 24);
        return exp.toISOString();
      })(),
      payment_methods: {
        installments: 12,
        excluded_payment_types: [],
        excluded_payment_methods: []
      },
      ...(preferenceData.shipments && { 
        shipments: {
          mode: 'not_specified',
          ...preferenceData.shipments
        }
      }),
      metadata: {
        source: 'luinatique_ecommerce',
        timestamp: new Date().toISOString(),
        test_mode: isTestToken,
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
      body: responseText.substring(0, 500) // Limitar el log
    });

    if (!response.ok) {
      console.error('❌ MercadoPago API Error:', {
        status: response.status,
        statusText: response.statusText,
        body: responseText
      });
      
      let errorDetails = responseText;
      try {
        const errorJson = JSON.parse(responseText);
        errorDetails = errorJson.message || errorJson.error || JSON.stringify(errorJson);
      } catch (e) {
        // Si no es JSON, usar el texto tal cual
      }
      
      return new Response(
        JSON.stringify({ 
          error: 'MercadoPago API error',
          status: response.status,
          details: errorDetails,
          message: 'Error al crear la preferencia de pago. Verifica las credenciales de MercadoPago.'
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

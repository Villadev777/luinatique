import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

// 🆕 Helper para respuestas JSON
const jsonResponse = (data: any, status = 200) => {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json'
    }
  });
};

// 🆕 Helper para respuestas de error
const errorResponse = (error: string, details?: any, status = 500) => {
  console.error(`❌ Error ${status}:`, error, details);
  return jsonResponse({ error, details }, status);
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('🚀 MercadoPago Create Preference - Start');
    console.log('📍 Request URL:', req.url);
    console.log('📍 Request method:', req.method);
    
    // Verify method
    if (req.method !== 'POST') {
      return errorResponse('Method not allowed', { allowedMethods: ['POST'] }, 405);
    }

    // Get MercadoPago credentials from environment
    const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
    if (!accessToken) {
      console.error('❌ MERCADOPAGO_ACCESS_TOKEN no configurado');
      return errorResponse(
        'MercadoPago access token not configured',
        'Configure MERCADOPAGO_ACCESS_TOKEN en las variables de entorno de Supabase',
        500
      );
    }

    // 🔐 Detectar el tipo de token (TEST vs PRODUCCIÓN)
    const isTestToken = accessToken.startsWith('TEST-');
    const tokenType = isTestToken ? 'SANDBOX (TEST)' : 'PRODUCCIÓN';
    console.log(`✅ Token ${tokenType} detectado:`, accessToken.substring(0, 20) + '...');
    
    if (!isTestToken) {
      console.warn('⚠️ ADVERTENCIA: Usando token de PRODUCCIÓN - Los pagos serán REALES');
    }

    // Parse request body
    let preferenceData;
    try {
      preferenceData = await req.json();
      console.log('📝 Request data recibida:', JSON.stringify(preferenceData, null, 2));
    } catch (parseError) {
      return errorResponse(
        'Invalid JSON in request body',
        parseError.message,
        400
      );
    }

    // 🆕 Validaciones mejoradas
    if (!preferenceData.items || !Array.isArray(preferenceData.items) || preferenceData.items.length === 0) {
      return errorResponse(
        'Items are required and must be a non-empty array',
        { received: preferenceData.items },
        400
      );
    }

    // 🆕 Validar cada item
    for (const [index, item] of preferenceData.items.entries()) {
      if (!item.title || typeof item.title !== 'string') {
        return errorResponse(
          `Item ${index}: title is required and must be a string`,
          { item },
          400
        );
      }
      if (!item.unit_price || typeof item.unit_price !== 'number' || item.unit_price <= 0) {
        return errorResponse(
          `Item ${index}: unit_price must be a positive number`,
          { item },
          400
        );
      }
      if (!item.quantity || typeof item.quantity !== 'number' || item.quantity <= 0) {
        return errorResponse(
          `Item ${index}: quantity must be a positive number`,
          { item },
          400
        );
      }
    }

    if (!preferenceData.payer || !preferenceData.payer.email) {
      return errorResponse(
        'Payer email is required',
        { received: preferenceData.payer },
        400
      );
    }

    // 🆕 Validar email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(preferenceData.payer.email)) {
      return errorResponse(
        'Invalid email format',
        { email: preferenceData.payer.email },
        400
      );
    }

    // 🆕 Calcular totales para logging
    const subtotal = preferenceData.items.reduce(
      (sum: number, item: any) => sum + (item.unit_price * item.quantity),
      0
    );
    console.log('💰 Subtotal calculado:', subtotal.toFixed(2), 'PEN');

    // Prepare preference data for MercadoPago API
    const preferencePayload = {
      items: preferenceData.items.map((item: any) => ({
        id: item.id || crypto.randomUUID().substring(0, 8),
        title: item.title.substring(0, 256), // 🆕 MercadoPago limit
        quantity: item.quantity,
        currency_id: item.currency_id || 'PEN',
        unit_price: Math.round(item.unit_price * 100) / 100, // 🆕 Redondear a 2 decimales
        description: item.description?.substring(0, 256), // 🆕 MercadoPago limit
        picture_url: item.picture_url
      })),
      payer: {
        email: preferenceData.payer.email,
        name: preferenceData.payer.name,
        ...(preferenceData.payer.phone && {
          phone: preferenceData.payer.phone
        }),
        ...(preferenceData.payer.address && {
          address: preferenceData.payer.address
        })
      },
      back_urls: preferenceData.back_urls || {
        success: `${new URL(req.url).origin}/payment/success`,
        failure: `${new URL(req.url).origin}/payment/failure`,
        pending: `${new URL(req.url).origin}/payment/pending`
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
        installments: preferenceData.payment_methods?.installments || 12,
        ...(preferenceData.payment_methods?.excluded_payment_types && {
          excluded_payment_types: preferenceData.payment_methods.excluded_payment_types
        }),
        ...(preferenceData.payment_methods?.excluded_payment_methods && {
          excluded_payment_methods: preferenceData.payment_methods.excluded_payment_methods
        })
      },
      ...(preferenceData.shipments && {
        shipments: preferenceData.shipments
      }),
      metadata: {
        source: 'luinatique_ecommerce',
        timestamp: new Date().toISOString(),
        environment: isTestToken ? 'sandbox' : 'production',
        subtotal: subtotal.toFixed(2),
        ...preferenceData.metadata
      }
    };

    console.log('🎯 Payload preparado para MercadoPago API');
    console.log('📦 Items:', preferencePayload.items.length);
    console.log('💰 Total:', subtotal.toFixed(2), 'PEN');
    console.log('🔗 Back URLs:', preferencePayload.back_urls);

    // Call MercadoPago API directly using fetch
    console.log('📤 Enviando request a MercadoPago API...');
    const startTime = Date.now();
    
    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': crypto.randomUUID()
      },
      body: JSON.stringify(preferencePayload)
    });

    const responseTime = Date.now() - startTime;
    console.log(`⏱️ Response time: ${responseTime}ms`);

    // 🆕 Mejor manejo de errores de la API
    if (!response.ok) {
      let errorData;
      const responseText = await response.text();
      
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = responseText;
      }

      console.error('❌ MercadoPago API Error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorData
      });

      // 🆕 Mensajes de error más específicos
      let errorMessage = 'MercadoPago API error';
      switch (response.status) {
        case 400:
          errorMessage = 'Datos inválidos enviados a MercadoPago';
          break;
        case 401:
          errorMessage = 'Token de MercadoPago inválido o expirado';
          break;
        case 403:
          errorMessage = 'Acceso denegado por MercadoPago';
          break;
        case 404:
          errorMessage = 'Endpoint de MercadoPago no encontrado';
          break;
        case 429:
          errorMessage = 'Demasiadas peticiones a MercadoPago (rate limit)';
          break;
        case 500:
        case 502:
        case 503:
          errorMessage = 'Error del servidor de MercadoPago';
          break;
      }

      return errorResponse(
        errorMessage,
        {
          status: response.status,
          mercadoPagoError: errorData,
          tokenType
        },
        response.status
      );
    }

    const result = await response.json();
    
    console.log('✅ Preferencia creada exitosamente:', {
      id: result.id,
      external_reference: result.external_reference,
      has_init_point: !!result.init_point,
      has_sandbox_init_point: !!result.sandbox_init_point,
      tokenType
    });

    // 🆕 Validar que se recibieron las URLs necesarias
    if (!result.init_point && !result.sandbox_init_point) {
      console.error('⚠️ ADVERTENCIA: No se recibieron URLs de checkout de MercadoPago');
      return errorResponse(
        'MercadoPago no devolvió URLs de checkout',
        { result },
        500
      );
    }

    // 🆕 Log del modo detectado
    if (result.sandbox_init_point && !result.init_point) {
      console.log('🧪 Modo SANDBOX detectado - URL de prueba generada');
    } else if (result.init_point) {
      console.log('💳 Modo PRODUCCIÓN detectado - URL real generada');
    }

    // Return only the necessary data
    return jsonResponse({
      id: result.id,
      init_point: result.init_point,
      sandbox_init_point: result.sandbox_init_point,
      public_key: result.public_key,
      external_reference: result.external_reference,
      date_created: result.date_created,
      // 🆕 Información adicional útil
      mode: result.sandbox_init_point && !result.init_point ? 'sandbox' : 'production',
      checkout_url: result.init_point || result.sandbox_init_point
    }, 200);

  } catch (error) {
    console.error('❌ Error inesperado:', error);
    
    // Log detailed error information
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });

    // 🆕 Mejor manejo de diferentes tipos de errores
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return errorResponse(
        'Error de conexión con MercadoPago',
        'No se pudo conectar con la API de MercadoPago. Verifica tu conexión.',
        503
      );
    }

    return errorResponse(
      'Failed to create payment preference',
      error.message,
      500
    );
  }
});

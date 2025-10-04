import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

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
    const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
    if (!accessToken) {
      throw new Error('MERCADOPAGO_ACCESS_TOKEN not configured');
    }

    // Crear cliente de Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Obtener los datos del webhook
    const webhookData = await req.json();
    
    console.log('🔔 MercadoPago Webhook received:', JSON.stringify(webhookData, null, 2));

    // Procesar según el tipo de notificación
    if (webhookData.type === 'payment') {
      const paymentId = webhookData.data?.id;
      
      if (!paymentId) {
        throw new Error('Payment ID not found in webhook data');
      }

      // Obtener los detalles del pago desde MercadoPago API
      const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!paymentResponse.ok) {
        throw new Error(`Failed to fetch payment details: ${paymentResponse.status}`);
      }

      const payment = await paymentResponse.json();
      console.log('💳 Payment details:', payment);

      // Solo procesar pagos aprobados
      if (payment.status === 'approved') {
        // Extraer información del pago
        const externalReference = payment.external_reference;
        const payer = payment.payer;
        
        // Buscar si ya existe una orden con este payment_id
        const { data: existingOrder } = await supabase
          .from('orders')
          .select('id')
          .eq('payment_id', String(paymentId))
          .single();

        if (existingOrder) {
          console.log('⚠️ Order already exists for payment:', paymentId);
          return new Response(
            JSON.stringify({ received: true, message: 'Order already processed' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
          );
        }

        // Crear la orden
        const orderNumber = `MP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        
        const orderData = {
          order_number: orderNumber,
          customer_email: payer.email || 'unknown@example.com',
          customer_name: payer.first_name && payer.last_name 
            ? `${payer.first_name} ${payer.last_name}`
            : payer.first_name || 'Cliente',
          customer_phone: payer.phone?.number || null,
          
          // Shipping address (si está disponible)
          shipping_street: payment.additional_info?.shipments?.receiver_address?.street_name || null,
          shipping_number: payment.additional_info?.shipments?.receiver_address?.street_number?.toString() || null,
          shipping_city: payment.additional_info?.shipments?.receiver_address?.city_name || null,
          shipping_state: payment.additional_info?.shipments?.receiver_address?.state_name || null,
          shipping_zip_code: payment.additional_info?.shipments?.receiver_address?.zip_code || null,
          shipping_country: 'PE',
          
          // Montos
          subtotal: payment.transaction_amount,
          shipping_cost: 0,
          tax: 0,
          total: payment.transaction_amount,
          currency: payment.currency_id || 'PEN',
          
          // Estado
          status: 'processing',
          payment_status: 'approved',
          
          // Payment info
          payment_method: 'mercadopago',
          payment_id: String(paymentId),
          payment_reference: externalReference || null,
          
          // Metadata
          metadata: {
            payment_method_id: payment.payment_method_id,
            payment_type_id: payment.payment_type_id,
            installments: payment.installments,
            transaction_details: payment.transaction_details,
          },
          
          paid_at: new Date().toISOString(),
        };

        const { data: newOrder, error: orderError } = await supabase
          .from('orders')
          .insert([orderData])
          .select()
          .single();

        if (orderError) {
          console.error('❌ Error creating order:', orderError);
          throw orderError;
        }

        console.log('✅ Order created:', newOrder);

        // Crear los order items (si están disponibles en additional_info)
        if (payment.additional_info?.items && Array.isArray(payment.additional_info.items)) {
          const orderItems = payment.additional_info.items.map((item: any) => ({
            order_id: newOrder.id,
            product_id: item.id || null, // Puede ser null si no se envió el ID
            product_name: item.title,
            product_image: item.picture_url || null,
            product_sku: item.id || null,
            unit_price: item.unit_price,
            quantity: item.quantity,
            subtotal: item.unit_price * item.quantity,
          }));

          const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems);

          if (itemsError) {
            console.error('❌ Error creating order items:', itemsError);
            // No lanzar error aquí, la orden ya se creó
          } else {
            console.log('✅ Order items created');
          }
        }

        return new Response(
          JSON.stringify({ 
            received: true, 
            payment_id: paymentId,
            status: payment.status,
            order_id: newOrder.id,
            order_number: orderNumber
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        );
      } else {
        console.log(`⏳ Payment status is ${payment.status}, not processing order yet`);
        return new Response(
          JSON.stringify({ 
            received: true, 
            payment_id: paymentId,
            status: payment.status,
            message: 'Payment not approved yet'
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        );
      }
    }

    // Para otros tipos de notificaciones
    return new Response(
      JSON.stringify({ received: true, type: webhookData.type }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
    
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Error processing webhook',
        details: error instanceof Error ? error.stack : 'No additional details'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
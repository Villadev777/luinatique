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
    // Crear cliente de Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Obtener los datos del webhook
    const webhookData = await req.json();
    
    console.log('🔔 PayPal Webhook received:', JSON.stringify(webhookData, null, 2));

    // PayPal envía diferentes tipos de eventos
    const eventType = webhookData.event_type;
    
    // Procesar solo cuando el pago se completa
    if (eventType === 'PAYMENT.CAPTURE.COMPLETED' || eventType === 'CHECKOUT.ORDER.APPROVED') {
      const resource = webhookData.resource;
      const orderId = resource.id;
      
      // Buscar si ya existe una orden con este payment_id
      const { data: existingOrder } = await supabase
        .from('orders')
        .select('id')
        .eq('payment_id', orderId)
        .single();

      if (existingOrder) {
        console.log('⚠️ Order already exists for PayPal payment:', orderId);
        return new Response(
          JSON.stringify({ received: true, message: 'Order already processed' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      }

      // Extraer información del pago
      const payer = resource.payer || webhookData.resource.payer;
      const purchaseUnits = resource.purchase_units || [{}];
      const firstUnit = purchaseUnits[0];
      const amount = firstUnit.amount || resource.amount;
      const shipping = firstUnit.shipping;
      const items = firstUnit.items || [];

      // Crear número de orden
      const orderNumber = `PP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      const orderData = {
        order_number: orderNumber,
        customer_email: payer?.email_address || 'unknown@example.com',
        customer_name: payer?.name?.given_name && payer?.name?.surname
          ? `${payer.name.given_name} ${payer.name.surname}`
          : payer?.name?.given_name || 'Cliente',
        customer_phone: shipping?.phone_number?.national_number || null,
        
        // Shipping address
        shipping_street: shipping?.address?.address_line_1 || null,
        shipping_number: shipping?.address?.address_line_2 || null,
        shipping_city: shipping?.address?.admin_area_2 || null,
        shipping_state: shipping?.address?.admin_area_1 || null,
        shipping_zip_code: shipping?.address?.postal_code || null,
        shipping_country: shipping?.address?.country_code || 'PE',
        
        // Montos
        subtotal: parseFloat(amount.breakdown?.item_total?.value || amount.value || 0),
        shipping_cost: parseFloat(amount.breakdown?.shipping?.value || 0),
        tax: parseFloat(amount.breakdown?.tax_total?.value || 0),
        total: parseFloat(amount.value),
        currency: amount.currency_code || 'USD',
        
        // Estado
        status: 'processing',
        payment_status: 'approved',
        
        // Payment info
        payment_method: 'paypal',
        payment_id: orderId,
        payment_reference: firstUnit.reference_id || null,
        
        // Metadata
        metadata: {
          paypal_event_type: eventType,
          paypal_create_time: resource.create_time,
          paypal_update_time: resource.update_time,
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

      console.log('✅ PayPal Order created:', newOrder);

      // Crear los order items
      if (items.length > 0) {
        const orderItems = items.map((item: any) => ({
          order_id: newOrder.id,
          product_id: item.sku || null, // PayPal usa SKU en lugar de ID
          product_name: item.name,
          product_image: null,
          product_sku: item.sku || null,
          unit_price: parseFloat(item.unit_amount?.value || 0),
          quantity: parseInt(item.quantity || 1),
          subtotal: parseFloat(item.unit_amount?.value || 0) * parseInt(item.quantity || 1),
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
          event_type: eventType,
          paypal_order_id: orderId,
          order_id: newOrder.id,
          order_number: orderNumber
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    } else {
      console.log(`⏳ Event type is ${eventType}, not processing order yet`);
      return new Response(
        JSON.stringify({ 
          received: true, 
          event_type: eventType,
          message: 'Event acknowledged but not processed'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }
    
  } catch (error) {
    console.error('❌ Error processing PayPal webhook:', error);
    
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
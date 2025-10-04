import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { paymentDetails, cartItems, customerInfo, shippingAddress } = await req.json();
    
    console.log('📝 Creating order from frontend:', { paymentDetails, cartItems });

    if (!paymentDetails || !cartItems || !customerInfo) {
      throw new Error('Missing required data: paymentDetails, cartItems, or customerInfo');
    }

    const paymentId = paymentDetails.id;
    const method = paymentDetails.method || 'paypal';

    // Verificar si ya existe una orden con este payment_id
    const { data: existingOrder } = await supabase
      .from('orders')
      .select('id')
      .eq('payment_id', paymentId)
      .single();

    if (existingOrder) {
      console.log('⚠️ Order already exists:', paymentId);
      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'Order already exists',
          order_id: existingOrder.id
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Calcular totales
    const subtotal = cartItems.reduce((sum: number, item: any) => 
      sum + (item.price * item.quantity), 0
    );

    const orderNumber = `${method.toUpperCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    const orderData = {
      order_number: orderNumber,
      customer_email: customerInfo.email || 'unknown@example.com',
      customer_name: customerInfo.name || 'Cliente',
      customer_phone: customerInfo.phone || null,
      
      shipping_street: shippingAddress?.street || null,
      shipping_number: shippingAddress?.number || null,
      shipping_city: shippingAddress?.city || null,
      shipping_state: shippingAddress?.state || null,
      shipping_zip_code: shippingAddress?.zipCode || null,
      shipping_country: 'PE',
      
      subtotal: subtotal,
      shipping_cost: 0,
      tax: 0,
      total: subtotal,
      currency: method === 'paypal' ? 'USD' : 'PEN',
      
      status: 'processing',
      payment_status: 'approved',
      
      payment_method: method,
      payment_id: paymentId,
      payment_reference: paymentDetails.external_reference || null,
      
      metadata: paymentDetails,
      
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

    // Crear order items
    const orderItems = cartItems.map((item: any) => ({
      order_id: newOrder.id,
      product_id: item.id,
      product_name: item.title || item.name,
      product_image: item.image,
      product_sku: item.id,
      selected_size: item.selectedSize || null,
      selected_material: item.selectedMaterial || null,
      selected_color: item.selectedColor || null,
      unit_price: item.price,
      quantity: item.quantity,
      subtotal: item.price * item.quantity,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('❌ Error creating order items:', itemsError);
      throw itemsError;
    }

    console.log('✅ Order items created');

    return new Response(
      JSON.stringify({ 
        success: true,
        order_id: newOrder.id,
        order_number: orderNumber,
        message: 'Order created successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
    
  } catch (error) {
    console.error('❌ Error creating order:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Error creating order',
        details: error instanceof Error ? error.stack : 'No additional details'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
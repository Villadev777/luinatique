import { supabase } from '../lib/supabase';

interface CreateOrderParams {
  paymentDetails: any;
  cartItems: any[];
  customerInfo: {
    email: string;
    name: string;
    phone?: string;
  };
  shippingAddress?: {
    street?: string;
    number?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
}

export const createOrder = async ({
  paymentDetails,
  cartItems,
  customerInfo,
  shippingAddress,
}: CreateOrderParams) => {
  try {
    const paymentId = paymentDetails.id;
    const method = paymentDetails.method || 'paypal';

    // Verificar si ya existe una orden
    const { data: existingOrder } = await supabase
      .from('orders')
      .select('id')
      .eq('payment_id', paymentId)
      .single();

    if (existingOrder) {
      console.log('⚠️ Order already exists:', paymentId);
      return {
        success: true,
        message: 'Order already exists',
        order_id: existingOrder.id,
      };
    }

    // Calcular totales
    const subtotal = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const orderNumber = `${method.toUpperCase()}-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)
      .toUpperCase()}`;

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
    const orderItems = cartItems.map((item) => ({
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

    return {
      success: true,
      order_id: newOrder.id,
      order_number: orderNumber,
      message: 'Order created successfully',
    };
  } catch (error) {
    console.error('❌ Error in createOrder:', error);
    throw error;
  }
};
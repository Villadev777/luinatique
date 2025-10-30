import { supabase } from '../lib/supabase';

interface CreateOrderParams {
  paymentDetails: any;
  cartItems: any[];
  customerInfo: {
    email: string;
    name: string;
    phone?: string;
    dni?: string;
  };
  shippingAddress?: {
    street?: string;
    number?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
}

// 🔐 SEGURIDAD: Sanitizar strings para prevenir XSS
const sanitizeString = (str: string | undefined | null): string => {
  if (!str) return '';
  return str
    .replace(/[<>]/g, '') // Remover tags HTML
    .replace(/javascript:/gi, '') // Remover javascript: URLs
    .replace(/on\w+\s*=/gi, '') // Remover event handlers
    .trim()
    .substring(0, 500); // Limitar longitud
};

// 🔐 SEGURIDAD: Validar email
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email) && email.length <= 254;
};

// 🔐 SEGURIDAD: Rate limiting simple (en memoria)
const webhookCallTimestamps: number[] = [];
const MAX_CALLS_PER_MINUTE = 10;

const checkRateLimit = (): boolean => {
  const now = Date.now();
  const oneMinuteAgo = now - 60000;
  
  // Limpiar timestamps antiguos
  const recentCalls = webhookCallTimestamps.filter(ts => ts > oneMinuteAgo);
  webhookCallTimestamps.length = 0;
  webhookCallTimestamps.push(...recentCalls);
  
  if (webhookCallTimestamps.length >= MAX_CALLS_PER_MINUTE) {
    console.warn('⚠️ Rate limit exceeded for webhook calls');
    return false;
  }
  
  webhookCallTimestamps.push(now);
  return true;
};

// 🔐 SEGURIDAD: Generar firma HMAC para autenticación
const generateWebhookSignature = async (payload: string): Promise<string> => {
  try {
    const secret = import.meta.env.VITE_WEBHOOK_SECRET || 'luinatique-webhook-secret-2024';
    const encoder = new TextEncoder();
    const data = encoder.encode(payload);
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const signature = await crypto.subtle.sign('HMAC', key, data);
    return Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  } catch (error) {
    console.error('❌ Error generating webhook signature:', error);
    return '';
  }
};

// 📧 Enviar datos al webhook de N8N con retry y seguridad
const sendToN8NWebhook = async (orderData: any, retryCount = 0): Promise<void> => {
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000; // ms
  
  const webhookUrl = import.meta.env.VITE_N8N_ORDER_WEBHOOK_URL;
  
  if (!webhookUrl) {
    console.warn('⚠️ N8N Webhook URL not configured. Skipping webhook notification.');
    return;
  }

  // 🔐 SEGURIDAD: Check rate limit
  if (!checkRateLimit()) {
    throw new Error('Rate limit exceeded. Please try again later.');
  }

  try {
    // 🔐 SEGURIDAD: Sanitizar todos los strings del payload
    const sanitizedPayload = {
      order_id: orderData.order_id,
      order_number: sanitizeString(orderData.order_number),
      customer_email: sanitizeString(orderData.customer_email),
      customer_name: sanitizeString(orderData.customer_name),
      customer_phone: sanitizeString(orderData.customer_phone),
      customer_dni: sanitizeString(orderData.customer_dni),
      total: Number(orderData.total) || 0,
      currency: sanitizeString(orderData.currency),
      payment_method: sanitizeString(orderData.payment_method),
      payment_id: sanitizeString(orderData.payment_id),
      status: sanitizeString(orderData.status),
      items: Array.isArray(orderData.items) ? orderData.items.map((item: any) => ({
        product_name: sanitizeString(item.product_name),
        quantity: Number(item.quantity) || 0,
        unit_price: Number(item.unit_price) || 0,
        subtotal: Number(item.subtotal) || 0,
        selected_size: sanitizeString(item.selected_size),
        selected_material: sanitizeString(item.selected_material),
      })) : [],
      shipping_address: orderData.shipping_address ? {
        street: sanitizeString(orderData.shipping_address.street),
        number: sanitizeString(orderData.shipping_address.number),
        city: sanitizeString(orderData.shipping_address.city),
        state: sanitizeString(orderData.shipping_address.state),
        zip_code: sanitizeString(orderData.shipping_address.zip_code),
        country: sanitizeString(orderData.shipping_address.country),
      } : null,
      created_at: orderData.created_at,
      // Metadatos adicionales
      source: 'luinatique_ecommerce',
      timestamp: new Date().toISOString(),
      retry_count: retryCount,
    };

    // 🔐 SEGURIDAD: Generar firma para el payload
    const payloadString = JSON.stringify(sanitizedPayload);
    const signature = await generateWebhookSignature(payloadString);

    console.log('📤 Sending order to N8N webhook:', {
      url: webhookUrl,
      order_id: sanitizedPayload.order_id,
      retry_count: retryCount,
    });

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
        'X-Webhook-Source': 'luinatique',
        'User-Agent': 'Luinatique-Webhook/1.0',
      },
      body: payloadString,
      // 🔐 SEGURIDAD: Timeout para evitar hanging requests
      signal: AbortSignal.timeout(10000), // 10 segundos
    });

    if (!response.ok) {
      throw new Error(`Webhook returned status ${response.status}: ${response.statusText}`);
    }

    const result = await response.json().catch(() => ({}));
    console.log('✅ Order successfully sent to N8N:', result);
    
  } catch (error: any) {
    console.error(`❌ Error sending to N8N webhook (attempt ${retryCount + 1}/${MAX_RETRIES + 1}):`, error);
    
    // ♻️ Retry con backoff exponencial
    if (retryCount < MAX_RETRIES) {
      const delay = RETRY_DELAY * Math.pow(2, retryCount); // Exponential backoff
      console.log(`🔄 Retrying in ${delay}ms...`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      return sendToN8NWebhook(orderData, retryCount + 1);
    } else {
      console.error('❌ Max retries reached. Webhook notification failed.');
      // No lanzar error para no afectar la creación de la orden
      // La orden se crea correctamente aunque el webhook falle
    }
  }
};

export const createOrder = async ({
  paymentDetails,
  cartItems,
  customerInfo,
  shippingAddress,
}: CreateOrderParams) => {
  try {
    const paymentId = paymentDetails.id;
    const method = paymentDetails.method || 'paypal';

    console.log('Creating order with data:', {
      paymentId,
      method,
      itemsCount: cartItems.length,
      customerEmail: customerInfo.email
    });

    // 🔐 SEGURIDAD: Validar email
    if (!isValidEmail(customerInfo.email)) {
      throw new Error('Invalid email format');
    }

    // 🔐 SEGURIDAD: Validar que haya items
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      throw new Error('Cart must contain at least one item');
    }

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
      customer_email: sanitizeString(customerInfo.email) || 'unknown@example.com',
      customer_name: sanitizeString(customerInfo.name) || 'Cliente',
      customer_phone: sanitizeString(customerInfo.phone) || null,
      customer_dni: sanitizeString(customerInfo.dni) || null,

      shipping_street: sanitizeString(shippingAddress?.street) || null,
      shipping_number: sanitizeString(shippingAddress?.number) || null,
      shipping_city: sanitizeString(shippingAddress?.city) || null,
      shipping_state: sanitizeString(shippingAddress?.state) || null,
      shipping_zip_code: sanitizeString(shippingAddress?.zipCode) || null,
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

    console.log('Inserting order:', orderData);

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
    const orderItems = [];
    for (const item of cartItems) {
      const orderItem = {
        order_id: newOrder.id,
        product_id: item.id,
        product_name: sanitizeString(item.title || item.name),
        product_image: sanitizeString(item.image) || null,
        product_sku: item.id,
        selected_size: sanitizeString(item.selectedSize) || null,
        selected_material: sanitizeString(item.selectedMaterial) || null,
        selected_color: sanitizeString(item.selectedColor) || null,
        unit_price: parseFloat(item.price),
        quantity: parseInt(item.quantity),
        subtotal: parseFloat(item.price) * parseInt(item.quantity),
      };

      console.log('Inserting order item:', orderItem);

      const { error: itemError } = await supabase
        .from('order_items')
        .insert([orderItem]);

      if (itemError) {
        console.error('❌ Error creating order item:', itemError);
        console.error('Failed item data:', orderItem);
      } else {
        console.log('✅ Order item created for product:', item.id);
        orderItems.push(orderItem);
      }
    }

    // 📧 Enviar notificación al webhook de N8N (NO bloquea la respuesta)
    const webhookData = {
      order_id: newOrder.id,
      order_number: newOrder.order_number,
      customer_email: newOrder.customer_email,
      customer_name: newOrder.customer_name,
      customer_phone: newOrder.customer_phone,
      customer_dni: newOrder.customer_dni,
      total: newOrder.total,
      currency: newOrder.currency,
      payment_method: newOrder.payment_method,
      payment_id: newOrder.payment_id,
      status: newOrder.status,
      items: orderItems,
      shipping_address: shippingAddress ? {
        street: shippingAddress.street,
        number: shippingAddress.number,
        city: shippingAddress.city,
        state: shippingAddress.state,
        zip_code: shippingAddress.zipCode,
        country: 'PE',
      } : null,
      created_at: newOrder.created_at,
    };

    // Enviar en background (no esperar respuesta)
    sendToN8NWebhook(webhookData).catch((error) => {
      console.error('❌ Background webhook error:', error);
      // No afectar el flujo principal
    });

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

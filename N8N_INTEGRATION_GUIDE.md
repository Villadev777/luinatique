# 🔄 Integración n8n para Automatización de Órdenes - GUÍA COMPLETA

Esta guía te ayudará a configurar n8n para automatizar completamente el flujo de órdenes, incluyendo envío de emails, WhatsApp, alertas de inventario y más.

## 📋 Tabla de Contenidos
1. [Requisitos Previos](#requisitos-previos)
2. [Configuración de Supabase](#configuración-de-supabase)
3. [Workflows Básicos](#workflows-básicos)
   - Email de Confirmación
   - Notificación de Cambio de Estado
   - Confirmación de Pago
4. [Workflows Avanzados](#workflows-avanzados)
   - WhatsApp Notificaciones
   - Alerta de Inventario Bajo
   - Email de Review Post-Entrega
   - Recordatorio Carrito Abandonado
   - Integración Google Sheets
   - Notificaciones Slack/Discord
5. [Testing](#testing)
6. [Troubleshooting](#troubleshooting)

---

## 🔧 Requisitos Previos

- **Supabase Project** configurado
- **n8n** instalado (self-hosted o cloud) - [n8n.io](https://n8n.io)
- **Gmail/SMTP** para emails
- **WhatsApp Business API** o **Twilio** para WhatsApp
- **Google Sheets API** (opcional)
- **Slack/Discord Webhook** (opcional)

---

## ⚙️ Configuración de Supabase

### 1. Deploy Edge Function

```bash
supabase functions deploy n8n-webhook
```

### 2. Configurar Variables de Entorno

Ve a **Project Settings > Edge Functions**:

```bash
# Webhooks básicos
N8N_WEBHOOK_ORDER_CREATED=https://tu-n8n.com/webhook/order-created
N8N_WEBHOOK_ORDER_STATUS_CHANGED=https://tu-n8n.com/webhook/order-status-changed
N8N_WEBHOOK_ORDER_PAYMENT_UPDATED=https://tu-n8n.com/webhook/order-payment-updated

# Webhooks avanzados
N8N_WEBHOOK_LOW_STOCK=https://tu-n8n.com/webhook/low-stock-alert
N8N_WEBHOOK_ADMIN_NOTIFICATION=https://tu-n8n.com/webhook/admin-new-order

# Secret de seguridad
N8N_WEBHOOK_SECRET=tu_secret_seguro_aqui
```

### 3. Aplicar Migrations

```bash
supabase db push
```

---

## 📧 WORKFLOWS BÁSICOS

### Workflow 1: Email de Confirmación de Orden

**Trigger:** Nueva orden creada

#### Nodos:
1. **Webhook** → 2. **Function** → 3. **Gmail/SMTP**

#### Configuración Detallada:

**1. Webhook Node**
- Method: `POST`
- Path: `order-created`

**2. Function Node** - Procesar Datos
```javascript
const orderData = $input.all()[0].json.data;
const orderItems = $input.all()[0].json.order_items || [];

// Formatear items para HTML
const itemsHtml = orderItems.map(item => `
  <tr style="border-bottom: 1px solid #eee;">
    <td style="padding: 12px 8px;">
      <strong>${item.product_name}</strong>
      ${item.selected_size ? `<br><small>Talla: ${item.selected_size}</small>` : ''}
    </td>
    <td style="padding: 12px 8px; text-align: center;">${item.quantity}</td>
    <td style="padding: 12px 8px; text-align: right;">$${item.unit_price.toFixed(2)}</td>
    <td style="padding: 12px 8px; text-align: right;"><strong>$${item.subtotal.toFixed(2)}</strong></td>
  </tr>
`).join('');

const shippingAddress = `
  ${orderData.shipping_street}<br>
  ${orderData.shipping_city}, ${orderData.shipping_state}<br>
  ${orderData.shipping_country} ${orderData.shipping_zip_code}
`;

return {
  customer_name: orderData.customer_name,
  customer_email: orderData.customer_email,
  order_number: orderData.order_number,
  total: orderData.total,
  subtotal: orderData.subtotal,
  shipping_cost: orderData.shipping_cost || 0,
  tax: orderData.tax || 0,
  currency: orderData.currency,
  items_html: itemsHtml,
  shipping_address: shippingAddress,
  order_date: new Date(orderData.created_at).toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }),
  payment_method: orderData.payment_method === 'paypal' ? 'PayPal' : 'MercadoPago'
};
```

**3. Gmail Node**
- To: `{{$json.customer_email}}`
- Subject: `✅ Orden Confirmada - #{{$json.order_number}}`
- HTML:
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 28px;">¡Gracias por tu compra!</h1>
      <p style="color: #ffffff; margin: 10px 0 0 0; opacity: 0.9;">Tu orden ha sido confirmada</p>
    </div>

    <!-- Content -->
    <div style="padding: 40px 20px;">
      <p style="font-size: 16px; color: #333; margin: 0 0 20px 0;">
        Hola <strong>{{$json.customer_name}}</strong>,
      </p>
      
      <p style="font-size: 14px; color: #666; line-height: 1.6;">
        Hemos recibido tu orden <strong style="color: #667eea;">#{{$json.order_number}}</strong> 
        y la estamos preparando para el envío.
      </p>

      <!-- Order Details Card -->
      <div style="background-color: #f9f9f9; border-radius: 8px; padding: 20px; margin: 30px 0;">
        <h2 style="margin: 0 0 15px 0; font-size: 18px; color: #333;">Detalles del Pedido</h2>
        
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #667eea; color: white;">
              <th style="padding: 10px 8px; text-align: left; font-weight: 600;">Producto</th>
              <th style="padding: 10px 8px; text-align: center; font-weight: 600;">Cant.</th>
              <th style="padding: 10px 8px; text-align: right; font-weight: 600;">Precio</th>
              <th style="padding: 10px 8px; text-align: right; font-weight: 600;">Subtotal</th>
            </tr>
          </thead>
          <tbody style="background-color: white;">
            {{$json.items_html}}
          </tbody>
        </table>

        <!-- Totals -->
        <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #ddd;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="color: #666;">Subtotal:</span>
            <span style="color: #333; font-weight: 500;">{{$json.currency}} ${{$json.subtotal}}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="color: #666;">Envío:</span>
            <span style="color: #333; font-weight: 500;">
              {{$json.shipping_cost > 0 ? '$' + $json.shipping_cost : 'GRATIS'}}
            </span>
          </div>
          {{$json.tax > 0 ? `
          <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
            <span style="color: #666;">Impuestos:</span>
            <span style="color: #333; font-weight: 500;">$${$json.tax}</span>
          </div>
          ` : ''}}
          <div style="display: flex; justify-content: space-between; padding-top: 12px; border-top: 2px solid #667eea;">
            <span style="font-size: 18px; font-weight: bold; color: #333;">Total:</span>
            <span style="font-size: 20px; font-weight: bold; color: #667eea;">
              {{$json.currency}} ${{$json.total}}
            </span>
          </div>
        </div>
      </div>

      <!-- Shipping Info -->
      <div style="background-color: #fff8e1; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #333;">📦 Dirección de Envío</h3>
        <p style="margin: 0; color: #666; line-height: 1.6;">{{$json.shipping_address}}</p>
      </div>

      <!-- Payment Info -->
      <div style="background-color: #e8f5e9; border-left: 4px solid #4caf50; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #333;">💳 Información de Pago</h3>
        <p style="margin: 0; color: #666;">
          <strong>Método:</strong> {{$json.payment_method}}<br>
          <strong>Fecha:</strong> {{$json.order_date}}
        </p>
      </div>

      <!-- What's Next -->
      <div style="background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin: 30px 0;">
        <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #1976d2;">¿Qué sigue?</h3>
        <ol style="margin: 0; padding-left: 20px; color: #666; line-height: 1.8;">
          <li>Procesaremos tu pedido en las próximas 24 horas</li>
          <li>Te enviaremos un email cuando tu pedido sea enviado</li>
          <li>Tiempo estimado de entrega: 3-5 días hábiles</li>
        </ol>
      </div>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://lunatiqueshop.netlify.app/orders" 
           style="display: inline-block; background-color: #667eea; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
          Ver Estado del Pedido
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #f5f5f5; padding: 30px 20px; text-align: center; border-top: 1px solid #ddd;">
      <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">
        ¿Necesitas ayuda? <a href="https://lunatiqueshop.netlify.app/contactanos" style="color: #667eea; text-decoration: none;">Contáctanos</a>
      </p>
      <p style="margin: 0; color: #999; font-size: 12px;">
        Este email fue enviado automáticamente. Por favor no respondas a este mensaje.
      </p>
      <p style="margin: 10px 0 0 0; color: #999; font-size: 12px;">
        © 2025 Lunatique. Todos los derechos reservados.
      </p>
    </div>
  </div>
</body>
</html>
```

---

### Workflow 2: Notificación de Cambio de Estado

**Trigger:** Cambio de estado de orden

#### Estructura:
**Webhook** → **Switch (por estado)** → **Gmail** (específico por estado)

**Switch Node Configuración:**
```javascript
// Mode: Expression
// Output Expression:
{{$json.data.status}}
```

**Outputs:**
- `processing`
- `shipped`
- `delivered`

**Gmail para "shipped":**
```html
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
      <div style="font-size: 60px; margin-bottom: 10px;">📦</div>
      <h1 style="color: white; margin: 0;">¡Tu pedido está en camino!</h1>
    </div>
    
    <div style="padding: 40px 30px;">
      <p style="font-size: 16px; color: #333;">
        Hola <strong>{{$json.data.customer_name}}</strong>,
      </p>
      
      <p style="color: #666; line-height: 1.6;">
        Tu orden <strong style="color: #667eea;">#{{$json.data.order_number}}</strong> 
        ha sido enviada y está en camino a tu dirección.
      </p>

      <div style="background: #f0f4ff; padding: 20px; border-radius: 8px; margin: 25px 0;">
        <h3 style="margin: 0 0 15px 0; color: #333;">📍 Detalles del Envío</h3>
        <p style="margin: 0; color: #666; line-height: 1.8;">
          <strong>Dirección:</strong><br>
          {{$json.data.shipping_street}}<br>
          {{$json.data.shipping_city}}, {{$json.data.shipping_state}}<br>
          {{$json.data.shipping_country}}
        </p>
        <p style="margin: 15px 0 0 0; color: #666;">
          <strong>Tiempo estimado:</strong> 3-5 días hábiles
        </p>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="https://lunatiqueshop.netlify.app/orders" 
           style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">
          Rastrear Pedido
        </a>
      </div>

      <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
        © 2025 Lunatique - Joyería Artesanal
      </p>
    </div>
  </div>
</body>
</html>
```

---

## 🚀 WORKFLOWS AVANZADOS

### Workflow 3: 📱 Notificación WhatsApp - Nueva Orden

**Propósito:** Enviar mensaje de WhatsApp al admin cuando hay nueva orden

#### Requerimientos:
- Twilio Account (o WhatsApp Business API)
- Twilio Phone Number con WhatsApp habilitado

#### Estructura:
**Webhook** → **Function** → **Twilio (WhatsApp)**

**1. Webhook Node**
- Usa el mismo webhook de `order-created`
- O crea uno nuevo: `admin-notification`

**2. Function Node**
```javascript
const order = $input.all()[0].json.data;
const items = $input.all()[0].json.order_items || [];

const itemsList = items.map(item => 
  `• ${item.product_name} x${item.quantity} - $${item.subtotal}`
).join('\n');

const message = `
🛒 *NUEVA ORDEN RECIBIDA*

📋 Orden: #${order.order_number}
👤 Cliente: ${order.customer_name}
📧 Email: ${order.customer_email}
💰 Total: ${order.currency} $${order.total}

📦 Productos:
${itemsList}

📍 Envío a:
${order.shipping_city}, ${order.shipping_state}

💳 Método: ${order.payment_method === 'paypal' ? 'PayPal' : 'MercadoPago'}
✅ Estado: ${order.payment_status}

🔗 Ver en admin: https://lunatiqueshop.netlify.app/admin
`;

return {
  to: '+51920502708', // Tu número de WhatsApp
  message: message.trim()
};
```

**3. Twilio Node**
- Account SID: Tu Twilio SID
- Auth Token: Tu Twilio Auth Token
- From: `whatsapp:+14155238886` (Twilio Sandbox) o tu número
- To: `whatsapp:{{$json.to}}`
- Message: `{{$json.message}}`

**Alternativa con WhatsApp Business API:**
```javascript
// HTTP Request Node
{
  method: 'POST',
  url: 'https://graph.facebook.com/v18.0/YOUR_PHONE_ID/messages',
  headers: {
    'Authorization': 'Bearer YOUR_ACCESS_TOKEN',
    'Content-Type': 'application/json'
  },
  body: {
    messaging_product: 'whatsapp',
    to: '51920502708',
    type: 'text',
    text: {
      body: $json.message
    }
  }
}
```

---

### Workflow 4: ⚠️ Alerta de Inventario Bajo

**Propósito:** Notificar cuando un producto tiene menos de 5 unidades

#### Estructura:
**Cron** → **Supabase Query** → **IF (Stock < 5)** → **Email + WhatsApp**

**1. Cron Node**
- Mode: `Every day at 9:00 AM`
- Cron Expression: `0 9 * * *`

**2. HTTP Request Node** - Query Supabase
```javascript
{
  method: 'GET',
  url: 'https://sjrlfwxfojfyzujulyas.supabase.co/rest/v1/products',
  qs: {
    select: 'id,name,sku,stock_quantity,price',
    stock_quantity: 'lt.5',
    in_stock: 'eq.true'
  },
  headers: {
    'apikey': '{{$credentials.supabaseApi.apiKey}}',
    'Authorization': 'Bearer {{$credentials.supabaseApi.apiKey}}'
  }
}
```

**3. IF Node**
- Condition: `{{$json.length}} > 0`

**4. Function Node** - Format Alert
```javascript
const products = $input.all()[0].json;

const productList = products.map(p => 
  `⚠️ *${p.name}*\n   SKU: ${p.sku}\n   Stock: ${p.stock_quantity} unidades\n   Precio: $${p.price}`
).join('\n\n');

return {
  count: products.length,
  products_html: products.map(p => `
    <tr style="border-bottom: 1px solid #ddd;">
      <td style="padding: 10px;">${p.name}</td>
      <td style="padding: 10px;">${p.sku}</td>
      <td style="padding: 10px; color: red; font-weight: bold;">${p.stock_quantity}</td>
      <td style="padding: 10px;">$${p.price}</td>
    </tr>
  `).join(''),
  whatsapp_message: `🚨 *ALERTA DE INVENTARIO BAJO*\n\nTienes ${products.length} producto(s) con menos de 5 unidades:\n\n${productList}\n\n📊 Revisa el inventario: https://lunatiqueshop.netlify.app/admin`
};
```

**5. Gmail Node**
```html
<h1 style="color: #ff6b6b;">⚠️ Alerta de Inventario Bajo</h1>
<p>Tienes <strong>{{$json.count}}</strong> productos con menos de 5 unidades en stock:</p>

<table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
  <thead>
    <tr style="background: #f5f5f5;">
      <th style="padding: 10px; text-align: left;">Producto</th>
      <th style="padding: 10px; text-align: left;">SKU</th>
      <th style="padding: 10px; text-align: left;">Stock</th>
      <th style="padding: 10px; text-align: left;">Precio</th>
    </tr>
  </thead>
  <tbody>
    {{$json.products_html}}
  </tbody>
</table>

<p style="margin-top: 30px;">
  <a href="https://lunatiqueshop.netlify.app/admin" style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
    Revisar Inventario
  </a>
</p>
```

**6. Twilio/WhatsApp Node**
- Message: `{{$json.whatsapp_message}}`

---

### Workflow 5: ⭐ Email de Review Post-Entrega

**Propósito:** Enviar email pidiendo review 7 días después de la entrega

#### Estructura:
**Cron** → **Supabase Query** → **Filter** → **Gmail**

**1. Cron Node**
- Mode: `Every day at 10:00 AM`
- Cron Expression: `0 10 * * *`

**2. HTTP Request** - Query Delivered Orders
```javascript
{
  method: 'GET',
  url: 'https://sjrlfwxfojfyzujulyas.supabase.co/rest/v1/orders',
  qs: {
    select: 'id,order_number,customer_name,customer_email,delivered_at,order_items(product_name)',
    status: 'eq.delivered',
    delivered_at: `gte.${new Date(Date.now() - 8*24*60*60*1000).toISOString()}`,
    delivered_at: `lte.${new Date(Date.now() - 6*24*60*60*1000).toISOString()}`
  },
  headers: {
    'apikey': '{{$credentials.supabaseApi.apiKey}}',
    'Authorization': 'Bearer {{$credentials.supabaseApi.apiKey}}'
  }
}
```

**3. Split In Batches Node**
- Batch Size: `1`

**4. Gmail Node** - Review Request
```html
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden;">
    <div style="background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%); padding: 40px; text-align: center;">
      <div style="font-size: 60px;">⭐</div>
      <h1 style="color: #333; margin: 10px 0;">¿Qué te pareció tu compra?</h1>
    </div>
    
    <div style="padding: 40px 30px; text-align: center;">
      <p style="font-size: 16px; color: #333;">
        Hola <strong>{{$json.customer_name}}</strong>,
      </p>
      
      <p style="color: #666; line-height: 1.6; margin: 20px 0;">
        Esperamos que estés disfrutando tus productos de Lunatique. 
        Tu opinión es muy importante para nosotros y nos ayuda a mejorar.
      </p>

      <div style="margin: 30px 0;">
        <p style="color: #333; font-size: 18px; margin-bottom: 20px;">
          ¿Cómo calificarías tu experiencia?
        </p>
        <div style="font-size: 40px; letter-spacing: 10px;">
          <a href="https://lunatiqueshop.netlify.app/review?order={{$json.order_number}}&rating=5" style="text-decoration: none;">⭐</a>
          <a href="https://lunatiqueshop.netlify.app/review?order={{$json.order_number}}&rating=4" style="text-decoration: none;">⭐</a>
          <a href="https://lunatiqueshop.netlify.app/review?order={{$json.order_number}}&rating=3" style="text-decoration: none;">⭐</a>
          <a href="https://lunatiqueshop.netlify.app/review?order={{$json.order_number}}&rating=2" style="text-decoration: none;">⭐</a>
          <a href="https://lunatiqueshop.netlify.app/review?order={{$json.order_number}}&rating=1" style="text-decoration: none;">⭐</a>
        </div>
      </div>

      <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 30px 0;">
        <p style="margin: 0; color: #666;">
          <strong>Orden:</strong> #{{$json.order_number}}
        </p>
      </div>

      <a href="https://lunatiqueshop.netlify.app/review?order={{$json.order_number}}" 
         style="display: inline-block; background: #667eea; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 20px;">
        Dejar una Reseña
      </a>

      <p style="color: #999; font-size: 12px; margin-top: 30px;">
        Gracias por elegir Lunatique ❤️
      </p>
    </div>
  </div>
</body>
</html>
```

---

### Workflow 6: 🛒 Recordatorio de Carrito Abandonado

**Propósito:** Recordar a usuarios que dejaron productos en el carrito

#### Estructura:
**Cron** → **Supabase Query** → **Filter** → **Gmail**

**1. Cron Node**
- Mode: `Every 6 hours`
- Cron Expression: `0 */6 * * *`

**2. HTTP Request** - Query Abandoned Carts
```javascript
{
  method: 'GET',
  url: 'https://sjrlfwxfojfyzujulyas.supabase.co/rest/v1/rpc/get_abandoned_carts',
  headers: {
    'apikey': '{{$credentials.supabaseApi.apiKey}}',
    'Authorization': 'Bearer {{$credentials.supabaseApi.apiKey}}'
  }
}
```

**Primero crea la función RPC en Supabase:**
```sql
CREATE OR REPLACE FUNCTION get_abandoned_carts()
RETURNS TABLE (
  user_id uuid,
  user_email text,
  cart_data jsonb,
  last_updated timestamptz,
  total_value numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id as user_id,
    u.email as user_email,
    u.cart_data,
    u.updated_at as last_updated,
    COALESCE((
      SELECT SUM((item->>'price')::numeric * (item->>'quantity')::numeric)
      FROM jsonb_array_elements(u.cart_data) as item
    ), 0) as total_value
  FROM auth.users u
  WHERE u.cart_data IS NOT NULL
    AND jsonb_array_length(u.cart_data) > 0
    AND u.updated_at < NOW() - INTERVAL '24 hours'
    AND u.updated_at > NOW() - INTERVAL '48 hours'
    AND NOT EXISTS (
      SELECT 1 FROM orders o 
      WHERE o.customer_email = u.email 
      AND o.created_at > u.updated_at
    );
END;
$$ LANGUAGE plpgsql;
```

**3. Split In Batches**
- Batch Size: `1`

**4. Function Node** - Format Cart
```javascript
const cart = JSON.parse($json.cart_data);
const cartItems = cart.map(item => `
  <tr>
    <td style="padding: 15px;">
      <img src="${item.image}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;">
    </td>
    <td style="padding: 15px;">
      <strong>${item.name}</strong><br>
      <span style="color: #666; font-size: 14px;">${item.selectedSize || ''}</span>
    </td>
    <td style="padding: 15px; text-align: center;">${item.quantity}</td>
    <td style="padding: 15px; text-align: right;"><strong>$${(item.price * item.quantity).toFixed(2)}</strong></td>
  </tr>
`).join('');

return {
  user_email: $json.user_email,
  cart_html: cartItems,
  total: $json.total_value.toFixed(2),
  items_count: cart.length
};
```

**5. Gmail Node**
```html
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
      <div style="font-size: 60px;">🛍️</div>
      <h1 style="color: white; margin: 10px 0;">¡Dejaste algo en tu carrito!</h1>
      <p style="color: white; opacity: 0.9; margin: 0;">Tus productos te están esperando</p>
    </div>
    
    <div style="padding: 40px 30px;">
      <p style="font-size: 16px; color: #333;">
        ¡Hola! Notamos que dejaste <strong>{{$json.items_count}}</strong> producto(s) en tu carrito.
      </p>
      
      <p style="color: #666; line-height: 1.6;">
        No te preocupes, los guardamos para ti. ¡Completa tu compra ahora!
      </p>

      <table style="width: 100%; margin: 30px 0; border-collapse: collapse; border: 1px solid #eee;">
        <thead>
          <tr style="background: #f5f5f5;">
            <th style="padding: 15px; text-align: left;">Imagen</th>
            <th style="padding: 15px; text-align: left;">Producto</th>
            <th style="padding: 15px; text-align: center;">Cant.</th>
            <th style="padding: 15px; text-align: right;">Precio</th>
          </tr>
        </thead>
        <tbody>
          {{$json.cart_html}}
        </tbody>
      </table>

      <div style="background: #f0f4ff; padding: 20px; border-radius: 8px; margin: 30px 0;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 18px; color: #333;">Total:</span>
          <span style="font-size: 24px; font-weight: bold; color: #667eea;">${{$json.total}}</span>
        </div>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="https://lunatiqueshop.netlify.app/cart" 
           style="display: inline-block; background: #667eea; color: white; padding: 16px 40px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
          Completar Mi Compra
        </a>
      </div>

      <div style="background: #fff8e1; padding: 15px; border-radius: 6px; margin-top: 30px; text-align: center;">
        <p style="margin: 0; color: #666; font-size: 14px;">
          🎁 <strong>Envío gratis</strong> en compras mayores a $50
        </p>
      </div>

      <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">
        Si ya completaste tu compra, ignora este mensaje.
      </p>
    </div>
  </div>
</body>
</html>
```

---

### Workflow 7: 📊 Integración con Google Sheets

**Propósito:** Registrar automáticamente cada orden en Google Sheets para reportes

#### Estructura:
**Webhook** → **Function** → **Google Sheets**

**1. Webhook Node**
- Usa el webhook de `order-created`

**2. Function Node** - Format for Sheets
```javascript
const order = $input.all()[0].json.data;
const items = $input.all()[0].json.order_items || [];

const productsString = items.map(i => `${i.product_name} (${i.quantity})`).join(', ');

return {
  timestamp: new Date(order.created_at).toLocaleString('es-PE'),
  order_number: order.order_number,
  customer_name: order.customer_name,
  customer_email: order.customer_email,
  products: productsString,
  quantity: items.reduce((sum, item) => sum + item.quantity, 0),
  subtotal: order.subtotal,
  shipping: order.shipping_cost || 0,
  tax: order.tax || 0,
  total: order.total,
  currency: order.currency,
  payment_method: order.payment_method,
  payment_status: order.payment_status,
  status: order.status,
  city: order.shipping_city,
  state: order.shipping_state,
  country: order.shipping_country
};
```

**3. Google Sheets Node**
- Operation: `Append`
- Document: Selecciona tu Google Sheet
- Sheet: `Orders` (crea esta hoja primero)
- Columns:
  - Timestamp
  - Order Number
  - Customer Name
  - Customer Email
  - Products
  - Quantity
  - Subtotal
  - Shipping
  - Tax
  - Total
  - Currency
  - Payment Method
  - Payment Status
  - Status
  - City
  - State
  - Country

**Crea el Google Sheet con estos headers:**
```
| Timestamp | Order Number | Customer Name | Customer Email | Products | Quantity | Subtotal | Shipping | Tax | Total | Currency | Payment Method | Payment Status | Status | City | State | Country |
```

**Opcional - Crear Dashboard:**
Agrega otra hoja llamada "Dashboard" con fórmulas:
```excel
=COUNTIF(Orders!N:N,"delivered")  // Órdenes completadas
=SUM(Orders!J:J)                   // Revenue total
=AVERAGE(Orders!J:J)               // Ticket promedio
```

---

### Workflow 8: 💬 Notificaciones Slack/Discord

**Propósito:** Notificar al equipo en Slack o Discord cuando hay nueva orden

#### Para Slack:

**1. Webhook Node**
- Usa el webhook de `order-created`

**2. Function Node**
```javascript
const order = $input.all()[0].json.data;
const items = $input.all()[0].json.order_items || [];

return {
  text: `🛒 Nueva Orden Recibida`,
  blocks: [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: "🛒 Nueva Orden Recibida"
      }
    },
    {
      type: "section",
      fields: [
        {
          type: "mrkdwn",
          text: `*Orden:*\n#${order.order_number}`
        },
        {
          type: "mrkdwn",
          text: `*Cliente:*\n${order.customer_name}`
        },
        {
          type: "mrkdwn",
          text: `*Email:*\n${order.customer_email}`
        },
        {
          type: "mrkdwn",
          text: `*Total:*\n${order.currency} $${order.total}`
        }
      ]
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Productos:*\n${items.map(i => `• ${i.product_name} x${i.quantity}`).join('\n')}`
      }
    },
    {
      type: "section",
      fields: [
        {
          type: "mrkdwn",
          text: `*Método de Pago:*\n${order.payment_method === 'paypal' ? 'PayPal' : 'MercadoPago'}`
        },
        {
          type: "mrkdwn",
          text: `*Estado:*\n✅ ${order.payment_status}`
        }
      ]
    },
    {
      type: "actions",
      elements: [
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "Ver en Admin"
          },
          url: "https://lunatiqueshop.netlify.app/admin",
          style: "primary"
        }
      ]
    }
  ]
};
```

**3. Slack Node**
- Channel: `#orders` (o tu canal)
- Text: `{{$json.text}}`
- Blocks: `{{$json.blocks}}`

#### Para Discord:

**1. HTTP Request Node**
```javascript
{
  method: 'POST',
  url: 'YOUR_DISCORD_WEBHOOK_URL',
  headers: {
    'Content-Type': 'application/json'
  },
  body: {
    username: 'Lunatique Orders',
    avatar_url: 'https://lunatiqueshop.netlify.app/logo.png',
    embeds: [
      {
        title: '🛒 Nueva Orden Recibida',
        color: 6750054, // Purple color
        fields: [
          {
            name: '📋 Orden',
            value: `#${$json.data.order_number}`,
            inline: true
          },
          {
            name: '👤 Cliente',
            value: $json.data.customer_name,
            inline: true
          },
          {
            name: '💰 Total',
            value: `${$json.data.currency} $${$json.data.total}`,
            inline: true
          },
          {
            name: '📦 Productos',
            value: $json.order_items.map(i => `• ${i.product_name} x${i.quantity}`).join('\n'),
            inline: false
          },
          {
            name: '💳 Método',
            value: $json.data.payment_method === 'paypal' ? 'PayPal' : 'MercadoPago',
            inline: true
          },
          {
            name: '✅ Estado',
            value: $json.data.payment_status,
            inline: true
          }
        ],
        footer: {
          text: 'Lunatique Shop'
        },
        timestamp: new Date().toISOString()
      }
    ]
  }
}
```

---

## 🧪 Testing Completo

### Test de Todos los Workflows

```bash
# 1. Test Email Confirmación
curl -X POST https://tu-n8n.com/webhook-test/order-created \
  -H "Content-Type: application/json" \
  -d @test-order.json

# 2. Test WhatsApp
# (Mismo endpoint, verifica Twilio/WhatsApp logs)

# 3. Test Inventario Bajo
# Ejecuta manualmente el workflow en n8n

# 4. Test Review Email
# Marca una orden como delivered hace 7 días y espera el cron

# 5. Test Carrito Abandonado
# Agrega productos al carrito y no compres por 24h

# 6. Test Google Sheets
# Crea una orden y verifica que aparece en Sheets

# 7. Test Slack/Discord
# Crea una orden y verifica notificación
```

---

## 📋 Checklist de Implementación Completa

### Workflows Básicos:
- [ ] Email de confirmación
- [ ] Email de cambio de estado
- [ ] Email de pago aprobado

### Workflows Avanzados:
- [ ] WhatsApp notificaciones
- [ ] Alerta de inventario bajo
- [ ] Email de review (7 días post-entrega)
- [ ] Recordatorio carrito abandonado
- [ ] Integración Google Sheets
- [ ] Notificaciones Slack/Discord

### Configuración:
- [ ] Todas las credenciales agregadas en n8n
- [ ] Variables de entorno en Supabase
- [ ] Función RPC para carritos abandonados
- [ ] Google Sheet creado y configurado
- [ ] Slack/Discord webhook configurado
- [ ] Twilio/WhatsApp configurado

### Testing:
- [ ] Todos los workflows probados
- [ ] Emails llegando correctamente
- [ ] WhatsApp funcionando
- [ ] Sheets actualizándose
- [ ] Notificaciones en Slack/Discord

---

## 🆘 Troubleshooting

### WhatsApp no envía
```bash
# Verificar Twilio sandbox
# O configurar WhatsApp Business API apropiadamente
```

### Google Sheets no actualiza
```bash
# Verificar permisos de la cuenta de servicio
# Verificar que el Sheet existe y tiene los headers correctos
```

### Cron no se ejecuta
```bash
# Verificar que el workflow está activo
# Verificar la zona horaria en n8n settings
```

---

## 🎯 Métricas de Éxito

Con todos estos workflows implementados, deberías ver:

- ✅ 100% de órdenes con email de confirmación
- ✅ Notificación instantánea al equipo por cada orden
- ✅ 0 productos sin stock sin que lo sepas
- ✅ Incremento en reviews de clientes
- ✅ Recuperación de 10-15% de carritos abandonados
- ✅ Reportes automáticos en tiempo real

---

## 📚 Recursos Adicionales

- [n8n Documentation](https://docs.n8n.io)
- [Twilio WhatsApp](https://www.twilio.com/whatsapp)
- [Google Sheets API](https://developers.google.com/sheets/api)
- [Slack Webhooks](https://api.slack.com/messaging/webhooks)
- [Discord Webhooks](https://discord.com/developers/docs/resources/webhook)

---

¡Felicidades! Ahora tienes un sistema de automatización completo para tu e-commerce. 🎉
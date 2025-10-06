# 🔄 Integración n8n - GUÍA COMPLETA DE AUTOMATIZACIÓN

Esta guía completa te ayudará a configurar **8 workflows avanzados** de n8n para automatizar completamente tu e-commerce Lunatique, incluyendo emails, WhatsApp, Slack, Google Sheets y más.

## 📋 Tabla de Contenidos

1. [Requisitos Previos](#-requisitos-previos)
2. [Configuración Inicial](#️-configuración-inicial)
3. [Workflows Básicos](#-workflows-básicos)
4. [Workflows Avanzados](#-workflows-avanzados)
5. [Templates JSON para Importar](#-templates-json-para-importar)
6. [Testing Completo](#-testing-completo)
7. [Troubleshooting](#-troubleshooting)
8. [Métricas y Monitoreo](#-métricas-y-monitoreo)

---

## 🔧 Requisitos Previos

### Servicios Necesarios:

| Servicio | Propósito | Costo | Enlace |
|----------|-----------|-------|--------|
| **n8n** | Automatización (Cloud o Self-hosted) | Gratis / $20/mes | [n8n.io](https://n8n.io) |
| **Gmail/SMTP** | Envío de emails | Gratis | [Gmail](https://gmail.com) |
| **Twilio** | WhatsApp API | Pay-as-you-go | [twilio.com](https://twilio.com) |
| **Google Sheets** | Reportes automáticos | Gratis | [sheets.google.com](https://sheets.google.com) |
| **Slack/Discord** | Notificaciones al equipo | Gratis | [slack.com](https://slack.com) |
| **Supabase** | Database + Edge Functions | Gratis | [supabase.com](https://supabase.com) |

---

## ⚙️ Configuración Inicial

*[Contenido de configuración inicial igual que antes...]*

---

## 🚀 WORKFLOWS AVANZADOS COMPLETOS

### Workflow 6: 🛒 Recordatorio de Carrito Abandonado (Continuación)

**HTTP Request Node - Mark as Sent (Body):**

```json
{
  "user_id": "{{$json.user_id}}",
  "cart_hash": "{{$json.cart_hash}}",
  "sent_at": "{{new Date().toISOString()}}"
}
```

---

### Workflow 7: 📊 Integración con Google Sheets

**Propósito:** Registrar automáticamente todas las órdenes en Google Sheets para análisis y reportes

#### Setup de Google Sheets API:

1. **Crear Proyecto en Google Cloud:**
   - Ve a [console.cloud.google.com](https://console.cloud.google.com)
   - Crear nuevo proyecto: "Lunatique N8N Integration"
   - Habilitar Google Sheets API

2. **Crear Service Account:**
   - IAM & Admin → Service Accounts → Create Service Account
   - Name: `n8n-sheets-integration`
   - Role: `Editor`
   - Create Key → JSON → Download

3. **Crear Google Sheet:**
   - Nombre: "Lunatique Orders Database"
   - Sheet 1: "Orders"
   - Sheet 2: "Dashboard"
   - Share el sheet con el email del service account

4. **Configurar Headers en Sheet "Orders":**

```
| Timestamp | Order Number | Customer Name | Customer Email | Phone | Products | Items Count | Subtotal | Shipping | Tax | Total | Currency | Payment Method | Payment Status | Order Status | Shipping City | Shipping State | Country | Tracking Number | Notes |
```

#### Estructura del Workflow:

**Webhook** → **Function (Format Data)** → **Google Sheets (Append)** → **Function (Update Stats)**

#### Configuración Detallada:

1. **Webhook Node:**
   - Path: `order-created`
   - (Reutiliza el mismo webhook del email de confirmación)

2. **Function Node - Format for Sheets:**

```javascript
const webhook = $input.first();
const order = webhook.json.data;
const items = webhook.json.order_items || [];

// Format timestamp for Google Sheets
const timestamp = new Date(order.created_at).toLocaleString('es-PE', {
  timeZone: 'America/Lima',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit'
});

// Create products string with details
const productsString = items.map(item => {
  const size = item.selected_size ? ` (${item.selected_size})` : '';
  return `${item.product_name}${size} x${item.quantity}`;
}).join(', ');

// Count total items
const itemsCount = items.reduce((sum, item) => sum + parseInt(item.quantity), 0);

// Format phone (remove country code if present)
const phone = order.customer_phone ? 
  order.customer_phone.replace(/^\+51/, '').trim() : '';

// Payment method display name
const paymentMethodDisplay = {
  'paypal': 'PayPal',
  'mercadopago': 'MercadoPago',
  'credit_card': 'Tarjeta de Crédito',
  'cash': 'Efectivo'
}[order.payment_method] || order.payment_method;

// Status display names
const statusDisplay = {
  'pending': 'Pendiente',
  'processing': 'Procesando',
  'shipped': 'Enviado',
  'delivered': 'Entregado',
  'cancelled': 'Cancelado'
}[order.status] || order.status;

const paymentStatusDisplay = {
  'pending': 'Pendiente',
  'paid': 'Pagado',
  'failed': 'Fallido',
  'refunded': 'Reembolsado'
}[order.payment_status] || order.payment_status;

return {
  Timestamp: timestamp,
  'Order Number': order.order_number,
  'Customer Name': order.customer_name,
  'Customer Email': order.customer_email,
  'Phone': phone,
  'Products': productsString,
  'Items Count': itemsCount,
  'Subtotal': parseFloat(order.subtotal).toFixed(2),
  'Shipping': parseFloat(order.shipping_cost || 0).toFixed(2),
  'Tax': parseFloat(order.tax || 0).toFixed(2),
  'Total': parseFloat(order.total).toFixed(2),
  'Currency': order.currency || 'PEN',
  'Payment Method': paymentMethodDisplay,
  'Payment Status': paymentStatusDisplay,
  'Order Status': statusDisplay,
  'Shipping City': order.shipping_city,
  'Shipping State': order.shipping_state,
  'Country': order.shipping_country,
  'Tracking Number': order.tracking_number || '',
  'Notes': order.notes || ''
};
```

3. **Google Sheets Node:**
   - Operation: `Append`
   - Document: Select "Lunatique Orders Database"
   - Sheet: `Orders`
   - Data Mode: `Auto-Map Input Data to Columns`

4. **Function Node - Update Dashboard Stats (Optional):**

```javascript
// This will calculate real-time stats for the Dashboard sheet
const allOrders = $input.all();
const latestOrder = allOrders[allOrders.length - 1].json;

// Calculate today's stats
const today = new Date().toDateString();
const todayOrders = allOrders.filter(order => 
  new Date(order.json.Timestamp).toDateString() === today
);

const todayRevenue = todayOrders.reduce((sum, order) => 
  sum + parseFloat(order.json.Total), 0
);

const todayItemsSold = todayOrders.reduce((sum, order) => 
  sum + parseInt(order.json['Items Count']), 0
);

return {
  date: today,
  orders_today: todayOrders.length,
  revenue_today: todayRevenue.toFixed(2),
  items_sold_today: todayItemsSold,
  average_order_value: todayOrders.length > 0 ? 
    (todayRevenue / todayOrders.length).toFixed(2) : '0.00',
  last_order_number: latestOrder['Order Number'],
  last_order_time: latestOrder.Timestamp
};
```

5. **Google Sheets Node - Update Dashboard:**
   - Operation: `Update`
   - Document: Same sheet
   - Sheet: `Dashboard`
   - Range: `A2:G2` (Daily stats row)

#### Crear Dashboard en Google Sheets:

En la hoja "Dashboard", agrega estas fórmulas:

```excel
// A1: Headers
A1: "Métrica"
B1: "Valor"

// A2-A10: Metric names
A2: "Órdenes Hoy"
A3: "Revenue Hoy"
A4: "Promedio por Orden"
A5: "Items Vendidos Hoy"
A6: "Total Órdenes (General)"
A7: "Revenue Total"
A8: "Productos Más Vendidos"
A9: "Ciudad con Más Pedidos"
A10: "Método de Pago Más Usado"

// B2-B10: Formulas
B2: =COUNTIF(Orders!A:A,TEXT(TODAY(),"M/D/YYYY*"))
B3: =SUMIF(Orders!A:A,TEXT(TODAY(),"M/D/YYYY*"),Orders!K:K)
B4: =IF(B2>0,B3/B2,0)
B5: =SUMIF(Orders!A:A,TEXT(TODAY(),"M/D/YYYY*"),Orders!G:G)
B6: =COUNTA(Orders!B:B)-1
B7: =SUM(Orders!K:K)
B8: =INDEX(Orders!F:F,MODE(MATCH(Orders!F:F,Orders!F:F,0)))
B9: =INDEX(Orders!O:O,MODE(MATCH(Orders!O:O,Orders!O:O,0)))
B10: =INDEX(Orders!L:L,MODE(MATCH(Orders!L:L,Orders!L:L,0)))

// Create a Chart (Insert → Chart)
// Type: Line Chart
// Data Range: Orders!A:A,Orders!K:K (Timestamp vs Total)
// Title: "Revenue Over Time"
```

#### Agregar Conditional Formatting:

1. Select column N (Order Status)
2. Format → Conditional formatting
3. Rules:
   - "Entregado" → Green background
   - "Enviado" → Blue background
   - "Procesando" → Orange background
   - "Cancelado" → Red background

---

### Workflow 8: 💬 Notificaciones Slack/Discord

**Propósito:** Notificar al equipo en tiempo real sobre nuevas órdenes, problemas y métricas importantes

#### Opción A: Slack Integration

**Setup de Slack:**

1. **Crear Slack App:**
   - Ve a [api.slack.com/apps](https://api.slack.com/apps)
   - "Create New App" → "From scratch"
   - Name: "Lunatique Orders Bot"
   - Workspace: Tu workspace

2. **Configurar Permisos:**
   - OAuth & Permissions → Scopes
   - Add: `chat:write`, `chat:write.public`, `files:write`
   - Install to Workspace
   - Copy "Bot User OAuth Token"

3. **Crear Canal:**
   - En Slack: Create channel `#orders`
   - Invite the bot: `/invite @Lunatique Orders Bot`

#### Estructura del Workflow Slack:

**Webhook** → **Function (Format Message)** → **Slack (Send Message)**

**Function Node - Format Slack Message:**

```javascript
const webhook = $input.first();
const order = webhook.json.data;
const items = webhook.json.order_items || [];

// Calculate totals
const itemsCount = items.reduce((sum, item) => sum + item.quantity, 0);
const totalValue = parseFloat(order.total);

// Determine urgency emoji
const urgencyEmoji = totalValue > 200 ? '🚨💰' : 
                     totalValue > 100 ? '⭐' : '🛒';

// Format items list for Slack
const itemsList = items.map(item => {
  const size = item.selected_size ? ` (${item.selected_size})` : '';
  return `• ${item.product_name}${size} x${item.quantity} - $${parseFloat(item.subtotal).toFixed(2)}`;
}).join('\n');

// Payment method emoji
const paymentEmoji = order.payment_method === 'paypal' ? '💰' : '💳';

// Build Slack Block Kit message
return {
  channel: '#orders',
  text: `${urgencyEmoji} Nueva Orden: #${order.order_number} - $${totalValue.toFixed(2)}`,
  blocks: [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: `${urgencyEmoji} Nueva Orden Recibida`,
        emoji: true
      }
    },
    {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*Orden:*\n#${order.order_number}`
        },
        {
          type: 'mrkdwn',
          text: `*Cliente:*\n${order.customer_name}`
        },
        {
          type: 'mrkdwn',
          text: `*Email:*\n${order.customer_email}`
        },
        {
          type: 'mrkdwn',
          text: `*Total:*\n${order.currency} $${totalValue.toFixed(2)}`
        }
      ]
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*📦 Productos* (${itemsCount} unidades):\n${itemsList}`
      }
    },
    {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*📍 Envío:*\n${order.shipping_city}, ${order.shipping_state}`
        },
        {
          type: 'mrkdwn',
          text: `${paymentEmoji} *Pago:*\n${order.payment_method === 'paypal' ? 'PayPal' : 'MercadoPago'}`
        },
        {
          type: 'mrkdwn',
          text: `*Estado:*\n✅ ${order.payment_status}`
        },
        {
          type: 'mrkdwn',
          text: `*Fecha:*\n${new Date(order.created_at).toLocaleString('es-PE')}`
        }
      ]
    },
    {
      type: 'divider'
    },
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: '👁️ Ver en Admin',
            emoji: true
          },
          url: `https://lunatiqueshop.netlify.app/admin?order=${order.order_number}`,
          style: 'primary'
        },
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: '📧 Contactar Cliente',
            emoji: true
          },
          url: `mailto:${order.customer_email}?subject=Tu Orden ${order.order_number}`
        },
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: '💬 WhatsApp',
            emoji: true
          },
          url: `https://wa.me/${order.customer_phone?.replace(/\D/g, '')}`
        }
      ]
    },
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `⚡ Notificación automática de Lunatique Shop • ${new Date().toLocaleTimeString('es-PE')}`
        }
      ]
    }
  ]
};
```

**Slack Node:**
- Operation: `Post Message`
- Channel: `#orders` (or use `{{$json.channel}}`)
- Text: `{{$json.text}}`
- Blocks: `{{JSON.stringify($json.blocks)}}`

#### Opción B: Discord Integration

**Setup de Discord:**

1. **Crear Webhook en Discord:**
   - Server Settings → Integrations → Webhooks
   - Create Webhook
   - Name: "Lunatique Orders"
   - Channel: #orders
   - Copy Webhook URL

**HTTP Request Node - Discord Webhook:**

```javascript
// Method: POST
// URL: YOUR_DISCORD_WEBHOOK_URL (paste the URL you copied)

// Headers:
{
  'Content-Type': 'application/json'
}

// Body (Expression):
{
  username: 'Lunatique Orders Bot',
  avatar_url: 'https://lunatiqueshop.netlify.app/logo.png',
  content: `${$json.urgency_emoji} **Nueva Orden Recibida** - #${$json.order_number}`,
  embeds: [
    {
      title: `🛒 Orden #${$json.order_number}`,
      description: `Nueva orden de **${$json.customer_name}**`,
      color: parseInt($json.total_value) > 200 ? 15548997 : // Red for high value
             parseInt($json.total_value) > 100 ? 6750054 :  // Purple for medium
             3066993, // Blue for normal
      fields: [
        {
          name: '👤 Cliente',
          value: $json.customer_name,
          inline: true
        },
        {
          name: '📧 Email',
          value: $json.customer_email,
          inline: true
        },
        {
          name: '💰 Total',
          value: `${$json.currency} $${$json.total_value}`,
          inline: true
        },
        {
          name: '📦 Productos',
          value: $json.items_list,
          inline: false
        },
        {
          name: '📍 Ubicación',
          value: `${$json.shipping_city}, ${$json.shipping_state}`,
          inline: true
        },
        {
          name: '💳 Pago',
          value: $json.payment_method === 'paypal' ? 'PayPal ✅' : 'MercadoPago ✅',
          inline: true
        },
        {
          name: '✅ Estado',
          value: $json.payment_status,
          inline: true
        }
      ],
      footer: {
        text: 'Lunatique Shop • Sistema de Notificaciones',
        icon_url: 'https://lunatiqueshop.netlify.app/favicon.ico'
      },
      timestamp: new Date($json.created_at).toISOString(),
      thumbnail: {
        url: 'https://lunatiqueshop.netlify.app/order-icon.png'
      }
    }
  ],
  components: [
    {
      type: 1, // Action Row
      components: [
        {
          type: 2, // Button
          style: 5, // Link button
          label: '👁️ Ver en Admin',
          url: `https://lunatiqueshop.netlify.app/admin?order=${$json.order_number}`
        }
      ]
    }
  ]
}
```

**Function Node antes del HTTP Request:**

```javascript
const order = $input.first().json.data;
const items = $input.first().json.order_items || [];

const itemsCount = items.reduce((sum, item) => sum + item.quantity, 0);
const totalValue = parseFloat(order.total).toFixed(2);

const urgencyEmoji = parseFloat(totalValue) > 200 ? '🚨💎' : 
                     parseFloat(totalValue) > 100 ? '⭐' : '🛒';

const itemsList = items.map(item => {
  const size = item.selected_size ? ` (${item.selected_size})` : '';
  return `• ${item.product_name}${size} x${item.quantity}`;
}).join('\n');

return {
  order_number: order.order_number,
  customer_name: order.customer_name,
  customer_email: order.customer_email,
  total_value: totalValue,
  currency: order.currency || 'PEN',
  items_list: itemsList || 'Sin detalles',
  items_count: itemsCount,
  shipping_city: order.shipping_city,
  shipping_state: order.shipping_state,
  payment_method: order.payment_method,
  payment_status: order.payment_status,
  created_at: order.created_at,
  urgency_emoji: urgencyEmoji
};
```

---

## 📦 Templates JSON para Importar

### Cómo Importar Templates:

1. Copia el JSON del template
2. En n8n: Click en "..." → Import from File
3. Pega el JSON
4. Click "Import"
5. Configura las credenciales
6. Activa el workflow

### Template 1: Email Confirmation Complete

```json
{
  "name": "Order Confirmation Email",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "order-created",
        "authentication": "headerAuth",
        "options": {}
      },
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [250, 300],
      "webhookId": "order-created-webhook",
      "credentials": {
        "httpHeaderAuth": {
          "id": "1",
          "name": "Header Auth"
        }
      }
    },
    {
      "parameters": {
        "functionCode": "const webhook = $input.first();\nconst orderData = webhook.json.data;\nconst orderItems = webhook.json.order_items || [];\n\nconst itemsHtml = orderItems.map(item => `\n  <tr style=\"border-bottom: 1px solid #eee;\">\n    <td style=\"padding: 12px 8px;\">\n      <strong>${item.product_name}</strong>\n      ${item.selected_size ? `<br><small style=\"color: #666;\">Talla: ${item.selected_size}</small>` : ''}\n    </td>\n    <td style=\"padding: 12px 8px; text-align: center;\">${item.quantity}</td>\n    <td style=\"padding: 12px 8px; text-align: right;\">$${parseFloat(item.unit_price).toFixed(2)}</td>\n    <td style=\"padding: 12px 8px; text-align: right;\"><strong>$${parseFloat(item.subtotal).toFixed(2)}</strong></td>\n  </tr>\n`).join('');\n\nconst shippingAddress = `\n  ${orderData.shipping_street}<br>\n  ${orderData.shipping_city}, ${orderData.shipping_state}<br>\n  ${orderData.shipping_country} ${orderData.shipping_zip_code}\n`;\n\nconst orderDate = new Date(orderData.created_at).toLocaleDateString('es-PE', {\n  year: 'numeric',\n  month: 'long',\n  day: 'numeric',\n  hour: '2-digit',\n  minute: '2-digit'\n});\n\nreturn {\n  customer_name: orderData.customer_name,\n  customer_email: orderData.customer_email,\n  order_number: orderData.order_number,\n  total: parseFloat(orderData.total).toFixed(2),\n  subtotal: parseFloat(orderData.subtotal).toFixed(2),\n  shipping_cost: parseFloat(orderData.shipping_cost || 0).toFixed(2),\n  tax: parseFloat(orderData.tax || 0).toFixed(2),\n  currency: orderData.currency || 'PEN',\n  items_html: itemsHtml,\n  shipping_address: shippingAddress,\n  order_date: orderDate,\n  payment_method: orderData.payment_method === 'paypal' ? 'PayPal' : 'MercadoPago',\n  items_count: orderItems.length\n};"
      },
      "name": "Format Order Data",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [450, 300]
    },
    {
      "parameters": {
        "fromEmail": "noreply@lunatiqueshop.com",
        "toEmail": "={{$json.customer_email}}",
        "subject": "✅ ¡Orden Confirmada! - #={{$json.order_number}} - Lunatique",
        "emailType": "html",
        "message": "<!-- PASTE FULL HTML TEMPLATE HERE -->",
        "options": {}
      },
      "name": "Send Confirmation Email",
      "type": "n8n-nodes-base.gmail",
      "typeVersion": 1,
      "position": [650, 300],
      "credentials": {
        "gmailOAuth2": {
          "id": "2",
          "name": "Gmail OAuth2"
        }
      }
    }
  ],
  "connections": {
    "Webhook": {
      "main": [[{"node": "Format Order Data", "type": "main", "index": 0}]]
    },
    "Format Order Data": {
      "main": [[{"node": "Send Confirmation Email", "type": "main", "index": 0}]]
    }
  },
  "active": true,
  "settings": {},
  "tags": []
}
```

### Template 2: Complete Multi-Channel Notification System

```json
{
  "name": "Multi-Channel Order Notifications",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "order-notification",
        "authentication": "headerAuth"
      },
      "name": "Webhook Trigger",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [250, 300]
    },
    {
      "parameters": {
        "functionCode": "// Format data for all channels\nconst order = $input.first().json.data;\nconst items = $input.first().json.order_items || [];\n\nreturn {\n  order_data: order,\n  items_data: items,\n  formatted_for_email: true,\n  formatted_for_whatsapp: true,\n  formatted_for_slack: true,\n  formatted_for_sheets: true\n};"
      },
      "name": "Central Data Processor",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [450, 300]
    },
    {
      "parameters": {},
      "name": "Send to Email",
      "type": "n8n-nodes-base.gmail",
      "typeVersion": 1,
      "position": [650, 200]
    },
    {
      "parameters": {},
      "name": "Send to WhatsApp",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 1,
      "position": [650, 300]
    },
    {
      "parameters": {},
      "name": "Send to Slack",
      "type": "n8n-nodes-base.slack",
      "typeVersion": 1,
      "position": [650, 400]
    },
    {
      "parameters": {},
      "name": "Log to Google Sheets",
      "type": "n8n-nodes-base.googleSheets",
      "typeVersion": 2,
      "position": [650, 500]
    }
  ],
  "connections": {
    "Webhook Trigger": {
      "main": [[{"node": "Central Data Processor", "type": "main", "index": 0}]]
    },
    "Central Data Processor": {
      "main": [
        [
          {"node": "Send to Email", "type": "main", "index": 0},
          {"node": "Send to WhatsApp", "type": "main", "index": 0},
          {"node": "Send to Slack", "type": "main", "index": 0},
          {"node": "Log to Google Sheets", "type": "main", "index": 0}
        ]
      ]
    }
  },
  "active": true
}
```

---

## 🧪 Testing Completo

### Checklist de Testing:

#### 1. Test Email Workflows

```bash
# Test Order Confirmation
curl -X POST https://your-n8n.app/webhook/order-created \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: your-secret" \
  -d '{
    "data": {
      "id": "test-123",
      "order_number": "ORD-TEST-001",
      "customer_name": "Test Usuario",
      "customer_email": "tu-email@test.com",
      "customer_phone": "+51920502708",
      "total": 150.00,
      "subtotal": 140.00,
      "shipping_cost": 10.00,
      "tax": 0.00,
      "currency": "PEN",
      "payment_method": "paypal",
      "payment_status": "paid",
      "status": "pending",
      "shipping_street": "Av. Test 123",
      "shipping_city": "Lima",
      "shipping_state": "Lima",
      "shipping_country": "Perú",
      "shipping_zip_code": "15001",
      "created_at": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"
    },
    "order_items": [
      {
        "product_name": "Collar Luna",
        "selected_size": "M",
        "quantity": 2,
        "unit_price": 70.00,
        "subtotal": 140.00
      }
    ]
  }'
```

#### 2. Test WhatsApp

```bash
# Verifica en tu WhatsApp que llegue el mensaje
# Revisa Twilio logs: https://console.twilio.com/
```

#### 3. Test Google Sheets

1. Crea una orden de prueba
2. Ve a tu Google Sheet
3. Verifica que la fila se agregó correctamente
4. Revisa que las fórmulas del Dashboard se actualicen

#### 4. Test Slack/Discord

```bash
# Crea orden de prueba y verifica en el canal
# Revisa que los botones funcionen
# Verifica formato del mensaje
```

#### 5. Test Carrito Abandonado

```sql
-- En Supabase SQL Editor:
-- Simula un carrito abandonado (cambia email)
UPDATE auth.users 
SET 
  cart_data = '[{"name":"Test Product","price":50,"quantity":1,"image":"https://via.placeholder.com/150"}]'::jsonb,
  updated_at = NOW() - INTERVAL '25 hours'
WHERE email = 'tu-email@test.com';

-- Ejecuta manualmente el workflow
-- O espera al cron
```

#### 6. Test Alerta de Inventario

```sql
-- Simula producto con stock bajo
UPDATE products 
SET stock_quantity = 2 
WHERE id = 'some-product-id';

-- Ejecuta manualmente el workflow en n8n
-- O espera al cron (9 AM)
```

#### 7. Test Review Email

```sql
-- Simula orden entregada hace 7 días
UPDATE orders 
SET 
  status = 'delivered',
  delivered_at = NOW() - INTERVAL '7 days'
WHERE order_number = 'ORD-TEST-001';

-- Ejecuta workflow manualmente
```

### Script de Test Automatizado:

```javascript
// test-all-workflows.js
const axios = require('axios');

const BASE_URL = 'https://your-n8n.app/webhook';
const SECRET = 'your-secret';

const testData = {
  data: {
    order_number: `ORD-TEST-${Date.now()}`,
    customer_name: 'Test User',
    customer_email: 'test@example.com',
    total: 100,
    // ... resto de datos
  },
  order_items: [
    {
      product_name: 'Test Product',
      quantity: 1,
      unit_price: 100,
      subtotal: 100
    }
  ]
};

async function testWorkflows() {
  try {
    console.log('🧪 Testing Order Confirmation...');
    await axios.post(`${BASE_URL}/order-created`, testData, {
      headers: { 'X-Webhook-Secret': SECRET }
    });
    console.log('✅ Order Confirmation: PASSED\n');

    console.log('🧪 Testing Status Change...');
    await axios.post(`${BASE_URL}/order-status`, {
      data: { ...testData.data, status: 'shipped' }
    }, {
      headers: { 'X-Webhook-Secret': SECRET }
    });
    console.log('✅ Status Change: PASSED\n');

    console.log('✅ All tests completed!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testWorkflows();
```

---

## 🔧 Troubleshooting

### Problema: Emails no llegan

**Soluciones:**

1. **Verifica Gmail App Password:**
```bash
# Regenera en: https://myaccount.google.com/apppasswords
# Asegúrate de copiar exactamente (sin espacios)
```

2. **Revisa Spam/Junk:**
```bash
# Emails automáticos pueden ir a spam
# Agrega noreply@lunatiqueshop.com a contactos
```

3. **Verifica Ejecución:**
```bash
# En n8n: Workflow → Executions
# Busca errores en los logs
```

4. **Test SMTP:**
```javascript
// En Function Node de n8n:
const nodemailer = require('nodemailer');
// Test connection
```

### Problema: WhatsApp no envía

**Soluciones:**

1. **Verifica Twilio Sandbox:**
```bash
# Envía "join <código>" al número de Twilio
# Verifica en: https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn
```

2. **Revisa Logs de Twilio:**
```bash
# Console → Monitor → Logs → Errors & Warnings
```

3. **Verifica Formato de Número:**
```javascript
// Debe incluir código de país: whatsapp:+51920502708
// Sin guiones ni espacios
```

### Problema: Google Sheets no actualiza

**Soluciones:**

1. **Verifica Permisos:**
```bash
# Sheet debe estar compartido con service account email
# Rol: Editor
```

2. **Revisa Credenciales:**
```bash
# n8n → Credentials → Google Sheets
# Re-authenticate si es necesario
```

3. **Verifica Headers:**
```javascript
// Headers del sheet deben coincidir EXACTAMENTE
// Mayúsculas/minúsculas importan
```

### Problema: Cron no se ejecuta

**Soluciones:**

1. **Verifica Workflow Activo:**
```bash
# Toggle debe estar en ON (verde)
```

2. **Revisa Timezone:**
```bash
# n8n Settings → Timezone
# Debe coincidir con tu zona horaria
```

3. **Test Manual:**
```bash
# Click derecho en Cron node → Execute Node
```

### Problema: Webhook retorna 401 Unauthorized

**Soluciones:**

1. **Verifica Secret:**
```bash
# Header: X-Webhook-Secret
# Valor debe coincidir exactamente
```

2. **Revisa Authentication en Webhook Node:**
```bash
# Authentication: Header Auth
# Header Name: X-Webhook-Secret
```

### Problema: Supabase Trigger no dispara

**Soluciones:**

1. **Verifica que trigger existe:**
```sql
SELECT * FROM pg_trigger WHERE tgname LIKE '%order%';
```

2. **Revisa Edge Function logs:**
```bash
# Supabase Dashboard → Edge Functions → Logs
```

3. **Test función manualmente:**
```sql
SELECT public.trigger_n8n_webhook(
  'order_created',
  '{"test": true}'::jsonb
);
```

### Logs y Debugging:

**n8n:**
```bash
# Ver ejecuciones:
# Workflow → Executions → Ver detalles de cada paso

# Logs del servidor (self-hosted):
docker logs n8n

# O:
pm2 logs n8n
```

**Supabase:**
```bash
# Edge Function logs:
supabase functions logs n8n-webhook --tail

# Database logs:
# Dashboard → Database → Logs
```

---

## 📊 Métricas y Monitoreo

### KPIs a Monitorear:

#### 1. Email Metrics

```javascript
// Agregar tracking en emails:
// Pixel de seguimiento
<img src="https://your-analytics.com/track?order={{order_number}}" 
     width="1" height="1" style="display:none;">

// Links con UTM
<a href="https://lunatiqueshop.netlify.app/orders?utm_source=email&utm_campaign=order_confirmation">
```

#### 2. Workflow Success Rate

```javascript
// Function Node al final de cada workflow:
const startTime = $executionContext.startTime;
const endTime = Date.now();
const duration = endTime - startTime;

// Log to analytics
await $http.post('YOUR_ANALYTICS_ENDPOINT', {
  workflow_name: 'order_confirmation',
  success: true,
  duration: duration,
  order_number: $json.order_number
});
```

#### 3. Abandoned Cart Recovery Rate

```sql
-- Query en Supabase para dashboard:
WITH sent_reminders AS (
  SELECT 
    user_id,
    COUNT(*) as reminders_sent
  FROM abandoned_cart_emails
  WHERE sent_at > NOW() - INTERVAL '30 days'
  GROUP BY user_id
),
recovered_carts AS (
  SELECT 
    o.customer_email,
    COUNT(*) as orders_after_reminder
  FROM orders o
  INNER JOIN abandoned_cart_emails ace ON o.customer_email = (
    SELECT email FROM auth.users WHERE id = ace.user_id
  )
  WHERE o.created_at > ace.sent_at
    AND o.created_at < ace.sent_at + INTERVAL '48 hours'
  GROUP BY o.customer_email
)
SELECT 
  COUNT(DISTINCT sr.user_id) as total_reminders,
  COUNT(DISTINCT rc.customer_email) as recovered,
  ROUND(COUNT(DISTINCT rc.customer_email)::numeric / COUNT(DISTINCT sr.user_id) * 100, 2) as recovery_rate
FROM sent_reminders sr
LEFT JOIN recovered_carts rc ON sr.user_id::text = rc.customer_email;
```

### Dashboard de Métricas en Google Sheets:

```excel
// Sheet: "Metrics Dashboard"

// A1-B15: Daily/Weekly/Monthly stats
A1: "Período"
B1: "Hoy"
C1: "Esta Semana"
D1: "Este Mes"

A2: "Órdenes"
B2: =COUNTIF(Orders!A:A,TEXT(TODAY(),"*"))
C2: =COUNTIF(Orders!A:A,">="&TEXT(TODAY()-7,"yyyy-mm-dd"))
D2: =COUNTIF(Orders!A:A,">="&TEXT(TODAY()-30,"yyyy-mm-dd"))

A3: "Revenue"
B3: =SUMIF(Orders!A:A,TEXT(TODAY(),"*"),Orders!K:K)
C3: =SUMIF(Orders!A:A,">="&TEXT(TODAY()-7,"yyyy-mm-dd"),Orders!K:K)
D3: =SUMIF(Orders!A:A,">="&TEXT(TODAY()-30,"yyyy-mm-dd"),Orders!K:K)

A4: "AOV (Average Order Value)"
B4: =IF(B2>0,B3/B2,0)
C4: =IF(C2>0,C3/C2,0)
D4: =IF(D2>0,D3/D2,0)

A5: "Items Vendidos"
B5: =SUMIF(Orders!A:A,TEXT(TODAY(),"*"),Orders!G:G)
C5: =SUMIF(Orders!A:A,">="&TEXT(TODAY()-7,"yyyy-mm-dd"),Orders!G:G)
D5: =SUMIF(Orders!A:A,">="&TEXT(TODAY()-30,"yyyy-mm-dd"),Orders!G:G)

// Charts:
// 1. Revenue Over Time (Line Chart)
// 2. Orders by Status (Pie Chart)
// 3. Top Products (Bar Chart)
// 4. Sales by City (Geo Chart)
```

### Alertas Automáticas:

#### Crear workflow "Health Check":

```javascript
// Cron: Every 1 hour
// Function Node:

const response = await $http.get('https://your-n8n.app/health');

if (response.status !== 200) {
  // Send alert
  await $http.post('SLACK_WEBHOOK', {
    text: '🚨 n8n Health Check Failed!'
  });
}

// Check last order time
const lastOrder = await $http.get('YOUR_SUPABASE_URL/rest/v1/orders', {
  headers: { 'apikey': 'YOUR_KEY' },
  params: { 
    select: 'created_at',
    order: 'created_at.desc',
    limit: 1
  }
});

const hoursSinceLastOrder = (Date.now() - new Date(lastOrder.data[0].created_at)) / 3600000;

if (hoursSinceLastOrder > 24) {
  await $http.post('SLACK_WEBHOOK', {
    text: `⚠️ No orders in ${hoursSinceLastOrder.toFixed(1)} hours`
  });
}
```

---

## 🎯 Checklist Final de Implementación

### Workflows Básicos:
- [ ] ✅ Email de confirmación de orden
- [ ] ✅ Email de cambio de estado (processing/shipped/delivered)
- [ ] ✅ Email de pago aprobado

### Workflows Avanzados:
- [ ] ✅ WhatsApp notificaciones a admin
- [ ] ✅ Alerta de inventario bajo (diaria)
- [ ] ✅ Email de review (7 días post-entrega)
- [ ] ✅ Recordatorio carrito abandonado (24h)
- [ ] ✅ Integración Google Sheets (log de órdenes)
- [ ] ✅ Notificaciones Slack/Discord

### Configuración:
- [ ] ✅ Credenciales configuradas en n8n (Gmail, Twilio, Sheets, Slack)
- [ ] ✅ Variables de entorno en Supabase
- [ ] ✅ Triggers creados en Supabase
- [ ] ✅ Edge Function desplegada
- [ ] ✅ Google Sheet creado con headers correctos
- [ ] ✅ Slack/Discord webhook configurado
- [ ] ✅ Twilio WhatsApp sandbox activado

### Testing:
- [ ] ✅ Email confirmation testeado
- [ ] ✅ WhatsApp notificación testeada
- [ ] ✅ Google Sheets actualización testeada
- [ ] ✅ Slack/Discord mensaje testeado
- [ ] ✅ Cron workflows ejecutándose
- [ ] ✅ Carrito abandonado funcional
- [ ] ✅ Alerta de inventario funcional
- [ ] ✅ Review email funcional

### Monitoreo:
- [ ] ✅ Dashboard de métricas en Google Sheets
- [ ] ✅ Alertas de health check configuradas
- [ ] ✅ Logs monitoreados regularmente

---

## 🚀 Próximos Pasos y Mejoras

### Automatizaciones Adicionales Sugeridas:

1. **Restock Notifications:**
   - Notificar clientes cuando producto agotado vuelve a stock
   - Workflow: Check product stock changes → Email lista de espera

2. **Birthday Discounts:**
   - Enviar cupón de descuento en cumpleaños del cliente
   - Workflow: Cron daily → Query birthdays → Send email with coupon

3. **Loyalty Program:**
   - Puntos por compra, referencias, reviews
   - Workflow: After order → Calculate points → Update user profile

4. **AI Product Recommendations:**
   - Email con recomendaciones basadas en compras previas
   - Workflow: After delivery → Analyze purchase history → Send recommendations

5. **Social Proof:**
   - Auto-post órdenes en Instagram Stories
   - Workflow: New order → Create image → Post to IG API

6. **Inventory Reorder:**
   - Auto-generar orden de compra a proveedor
   - Workflow: Low stock → Create PO → Email supplier

7. **Customer Segmentation:**
   - Clasificar clientes por valor (VIP, Regular, New)
   - Workflow: Weekly → Calculate LTV → Update segments → Personalized campaigns

8. **Fraud Detection:**
   - Alertar pedidos sospechosos (múltiples intentos de pago, etc.)
   - Workflow: New order → Check patterns → Alert if suspicious

---

## 📚 Recursos Adicionales

### Documentación:
- [n8n Docs](https://docs.n8n.io)
- [Supabase Docs](https://supabase.com/docs)
- [Twilio WhatsApp Docs](https://www.twilio.com/docs/whatsapp)
- [Google Sheets API](https://developers.google.com/sheets/api)
- [Slack Block Kit](https://api.slack.com/block-kit)
- [Discord Webhooks](https://discord.com/developers/docs/resources/webhook)

### Comunidad:
- [n8n Community](https://community.n8n.io)
- [n8n Discord](https://discord.gg/n8n)
- [Supabase Discord](https://discord.supabase.com)

### Templates y Ejemplos:
- [n8n Workflow Templates](https://n8n.io/workflows)
- [Email Templates](https://github.com/leemunroe/responsive-html-email-template)
- [Slack Message Builder](https://app.slack.com/block-kit-builder)

---

## 💬 Soporte

¿Problemas con la implementación? 

1. **Revisa Troubleshooting** (sección arriba)
2. **Verifica logs** en n8n y Supabase
3. **Test paso a paso** cada workflow
4. **Contacta soporte:**
   - n8n: support@n8n.io
   - Supabase: support@supabase.io
   - Tu desarrollador: contacto@lunatiqueshop.com

---

**¡Felicidades! 🎉**

Ahora tienes un sistema completo de automatización que:
- ✅ Envía emails profesionales automáticamente
- ✅ Notifica al equipo en tiempo real
- ✅ Recupera carritos abandonados
- ✅ Solicita reviews automáticamente
- ✅ Mantiene reportes actualizados
- ✅ Alerta sobre inventario bajo
- ✅ Y mucho más!

**Tu e-commerce ahora trabaja para ti, incluso mientras duermes. 🌙✨**

---

*Última actualización: Octubre 2025*
*Versión: 2.0*
*Autor: Lunatique Dev Team*
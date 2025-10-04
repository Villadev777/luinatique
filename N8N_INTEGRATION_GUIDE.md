# 🔄 Integración n8n para Automatización de Órdenes

Esta guía te ayudará a configurar n8n para automatizar el flujo de órdenes, incluyendo envío de emails de confirmación y notificaciones de cambios de estado.

## 📋 Tabla de Contenidos
1. [Requisitos Previos](#requisitos-previos)
2. [Configuración de Supabase](#configuración-de-supabase)
3. [Configuración de n8n](#configuración-de-n8n)
4. [Workflows Recomendados](#workflows-recomendados)
5. [Testing](#testing)

---

## 🔧 Requisitos Previos

- **Supabase Project** configurado
- **n8n** instalado (self-hosted o cloud)
- **Gmail/SMTP** o servicio de email configurado en n8n

---

## ⚙️ Configuración de Supabase

### 1. Deploy Edge Function

```bash
# Desde la raíz de tu proyecto
supabase functions deploy n8n-webhook
```

### 2. Configurar Variables de Entorno en Supabase

Ve a **Project Settings > Edge Functions** y agrega:

```bash
N8N_WEBHOOK_ORDER_CREATED=https://tu-n8n-instance.com/webhook/order-created
N8N_WEBHOOK_ORDER_STATUS_CHANGED=https://tu-n8n-instance.com/webhook/order-status-changed
N8N_WEBHOOK_ORDER_PAYMENT_UPDATED=https://tu-n8n-instance.com/webhook/order-payment-updated
N8N_WEBHOOK_SECRET=tu_secret_seguro_aqui  # Opcional pero recomendado
```

### 3. Aplicar Migration de Database Triggers

```bash
# Aplica la migration de triggers
supabase db push
```

O manualmente en SQL Editor:

```sql
-- Verificar que los triggers se crearon correctamente
SELECT * FROM information_schema.triggers 
WHERE event_object_table = 'orders';
```

---

## 🚀 Configuración de n8n

### Workflow 1: Email de Confirmación de Orden

Este workflow se activa cuando se crea una nueva orden y envía un email de confirmación al cliente.

#### **Estructura del Workflow:**

```
Webhook Trigger → Obtener Datos de Orden → Formatear Email → Enviar Gmail/SMTP
```

#### **Paso a Paso:**

1. **Crear nuevo Workflow en n8n**

2. **Webhook Node** (Trigger)
   - Method: `POST`
   - Path: `order-created`
   - Copiar la URL del webhook y agregarla a Supabase env vars

3. **Function Node** (Procesar Datos)
   ```javascript
   // Formatear los datos de la orden
   const orderData = $input.all()[0].json.data;
   const orderItems = $input.all()[0].json.order_items;
   
   // Calcular totales
   const itemsHtml = orderItems.map(item => `
     <tr>
       <td>${item.product_name}</td>
       <td>${item.quantity}</td>
       <td>$${item.unit_price.toFixed(2)}</td>
       <td>$${item.subtotal.toFixed(2)}</td>
     </tr>
   `).join('');
   
   return {
     customer_name: orderData.customer_name,
     customer_email: orderData.customer_email,
     order_number: orderData.order_number,
     total: orderData.total,
     currency: orderData.currency,
     items_html: itemsHtml,
     order_date: new Date(orderData.created_at).toLocaleDateString('es-PE')
   };
   ```

4. **Gmail/SMTP Node** (Enviar Email)
   - To: `{{$json.customer_email}}`
   - Subject: `✅ Orden Confirmada - #{{$json.order_number}}`
   - Email Type: `HTML`
   - HTML Body:
   ```html
   <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
     <h1 style="color: #333;">¡Gracias por tu compra!</h1>
     <p>Hola {{$json.customer_name}},</p>
     <p>Tu orden <strong>#{{$json.order_number}}</strong> ha sido confirmada.</p>
     
     <h2>Detalles de tu pedido:</h2>
     <table style="width: 100%; border-collapse: collapse;">
       <thead>
         <tr style="background-color: #f3f3f3;">
           <th style="padding: 10px; border: 1px solid #ddd;">Producto</th>
           <th style="padding: 10px; border: 1px solid #ddd;">Cantidad</th>
           <th style="padding: 10px; border: 1px solid #ddd;">Precio</th>
           <th style="padding: 10px; border: 1px solid #ddd;">Subtotal</th>
         </tr>
       </thead>
       <tbody>
         {{$json.items_html}}
       </tbody>
     </table>
     
     <div style="margin-top: 20px; padding: 15px; background-color: #f9f9f9; border-radius: 5px;">
       <h3 style="margin: 0;">Total: ${{$json.total}}</h3>
     </div>
     
     <p style="margin-top: 20px;">Recibirás un email cuando tu pedido sea enviado.</p>
     
     <p style="color: #666; font-size: 12px; margin-top: 30px;">
       Este email fue enviado automáticamente. Por favor no respondas a este mensaje.
     </p>
   </div>
   ```

5. **Activar el Workflow** ✅

---

### Workflow 2: Notificación de Cambio de Estado

Este workflow notifica al cliente cuando el estado de su orden cambia.

#### **Estructura del Workflow:**

```
Webhook Trigger → Switch (Status) → Enviar Email según Estado
```

#### **Configuración:**

1. **Webhook Node**
   - Path: `order-status-changed`

2. **Switch Node** (Por Status)
   - Mode: `Expression`
   - Output: Crear salidas para cada estado:
     - `processing` → "Orden en proceso"
     - `shipped` → "Orden enviada"
     - `delivered` → "Orden entregada"

3. **Gmail Nodes** (Uno por cada estado)
   
   **Para "shipped":**
   ```html
   <h1>📦 ¡Tu pedido ha sido enviado!</h1>
   <p>Tu orden #{{$json.data.order_number}} está en camino.</p>
   <p>Tiempo estimado de entrega: 3-5 días hábiles.</p>
   ```
   
   **Para "delivered":**
   ```html
   <h1>✅ ¡Tu pedido ha sido entregado!</h1>
   <p>Tu orden #{{$json.data.order_number}} ha sido entregada exitosamente.</p>
   <p>¡Esperamos que disfrutes tu compra!</p>
   ```

---

### Workflow 3: Notificación de Pago Aprobado

```
Webhook Trigger → Verificar Payment Status → Enviar Email
```

1. **Webhook Node**
   - Path: `order-payment-updated`

2. **IF Node** (Verificar si fue aprobado)
   - Condition: `{{$json.data.payment_status}} === 'approved'`

3. **Gmail Node**
   ```html
   <h1>💳 Pago Confirmado</h1>
   <p>Hola {{$json.data.customer_name}},</p>
   <p>Tu pago por ${{$json.data.total}} ha sido confirmado.</p>
   <p>Orden: #{{$json.data.order_number}}</p>
   ```

---

## 📊 Workflows Avanzados (Opcionales)

### 1. Notificación al Admin cuando hay nueva orden

```
Webhook → Telegram/Slack → "Nueva orden: #123"
```

### 2. Seguimiento de Inventario

```
Webhook → Verificar Stock → Alerta si < 5 unidades
```

### 3. Recordatorio de Carrito Abandonado

```
Cron Trigger → Query Supabase → Email a usuarios con carritos > 24h
```

---

## 🧪 Testing

### Test Manual del Webhook

Desde tu terminal:

```bash
curl -X POST https://tu-proyecto.supabase.co/functions/v1/n8n-webhook \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_SERVICE_ROLE_KEY" \
  -d '{
    "event": "INSERT",
    "table": "orders",
    "record": {
      "id": "test-123",
      "order_number": "TEST-001",
      "customer_name": "Test User",
      "customer_email": "test@example.com",
      "total": 100,
      "currency": "USD",
      "payment_status": "approved"
    }
  }'
```

### Verificar en n8n

1. Ve a **Executions** en n8n
2. Deberías ver una nueva ejecución del workflow
3. Verifica que el email se envió correctamente

---

## 🔒 Seguridad

### 1. Usar Webhook Secret

En Supabase env vars:
```bash
N8N_WEBHOOK_SECRET=un_secret_muy_seguro_y_aleatorio
```

En n8n Webhook Node:
- Authentication: `Header Auth`
- Header Name: `Authorization`
- Header Value: `Bearer un_secret_muy_seguro_y_aleatorio`

### 2. Validar IP (Opcional)

Si tu n8n tiene IP fija, puedes agregar validación en la Edge Function.

---

## 📞 Troubleshooting

### Webhook no se dispara

1. **Verificar triggers en Supabase:**
   ```sql
   SELECT * FROM information_schema.triggers 
   WHERE event_object_table = 'orders';
   ```

2. **Verificar logs de Edge Function:**
   ```bash
   supabase functions logs n8n-webhook
   ```

3. **Verificar en n8n:**
   - Ve a Executions y busca errores
   - Verifica que el webhook esté activo

### Email no llega

1. **Verificar credenciales de Gmail/SMTP**
2. **Revisar spam folder**
3. **Verificar executions en n8n** para ver errores

---

## 🎯 URLs de Webhooks

Guarda estas URLs en tus variables de entorno de Supabase:

```
Order Created: https://your-n8n.com/webhook/order-created
Status Changed: https://your-n8n.com/webhook/order-status-changed
Payment Updated: https://your-n8n.com/webhook/order-payment-updated
```

---

## ✅ Checklist de Implementación

- [ ] Edge Function deployed
- [ ] Variables de entorno configuradas
- [ ] Migration aplicada
- [ ] Workflows de n8n creados
- [ ] Webhooks URLs configuradas
- [ ] Gmail/SMTP configurado
- [ ] Test realizado exitosamente
- [ ] Email de confirmación recibido
- [ ] Webhook secret configurado

---

## 🆘 Soporte

Si tienes problemas, revisa:
1. Logs de Supabase Functions
2. Executions en n8n
3. Triggers en la base de datos

¿Necesitas ayuda? Abre un issue en el repositorio.
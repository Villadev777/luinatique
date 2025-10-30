# 📧 Guía de Integración N8N Webhook - Luinatique Ecommerce

## 🎯 Descripción General

Este documento describe la integración del webhook de N8N para el envío automático de notificaciones por email cuando se crea una nueva orden en el ecommerce Luinatique.

## 🔗 URL del Webhook

```
https://dvwebhook.brandora.space/webhook/order-created
```

---

## 📋 Configuración Paso a Paso

### 1. Variables de Entorno

Agrega las siguientes variables a tu archivo `.env`:

```env
# N8N Webhook Configuration
VITE_N8N_ORDER_WEBHOOK_URL=https://dvwebhook.brandora.space/webhook/order-created

# Secret para firmar los webhooks (IMPORTANTE: Cambiar en producción)
VITE_WEBHOOK_SECRET=tu-secret-personalizado-aqui-2024
```

⚠️ **IMPORTANTE**: Cambia el `VITE_WEBHOOK_SECRET` por un valor único y seguro en producción.

### 2. Configuración en Netlify/Vercel

Si tu aplicación está desplegada en Netlify o Vercel, agrega estas variables de entorno en el panel de configuración:

**Netlify:**
- Site settings → Environment variables → Add a variable

**Vercel:**
- Project settings → Environment Variables → Add

---

## 🔐 Medidas de Seguridad Implementadas

### 1. Sanitización de Datos (XSS Prevention)
Todos los strings enviados al webhook son sanitizados para prevenir ataques XSS:
- Remoción de tags HTML `<>`
- Eliminación de URLs `javascript:`
- Eliminación de event handlers `onclick=`, `onerror=`, etc.
- Limitación de longitud a 500 caracteres

### 2. Validación de Email
Validación estricta usando regex:
```javascript
/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
```

### 3. Rate Limiting
Protección contra abuso con límite de:
- **10 llamadas por minuto** al webhook
- Implementado en memoria (se resetea al reiniciar)

### 4. Firma HMAC
Cada request al webhook incluye una firma HMAC-SHA256 para autenticación:
```
X-Webhook-Signature: <hash_hmac_sha256>
```

### 5. Retry con Backoff Exponencial
Sistema de reintentos automáticos:
- **Máximo 3 reintentos**
- Delays: 1s, 2s, 4s (exponencial)
- No afecta la creación de la orden si el webhook falla

### 6. Timeout de Request
Timeout de **10 segundos** para evitar hanging requests.

---

## 📦 Payload del Webhook

### Estructura del JSON enviado:

```json
{
  "order_id": "uuid",
  "order_number": "PAYPAL-1234567890-ABC123",
  "customer_email": "cliente@example.com",
  "customer_name": "Juan Pérez",
  "customer_phone": "+51987654321",
  "customer_dni": "12345678",
  "total": 150.00,
  "currency": "PEN",
  "payment_method": "paypal",
  "payment_id": "PAYID-XXXXX",
  "status": "processing",
  "items": [
    {
      "product_name": "Collar Luna",
      "quantity": 1,
      "unit_price": 150.00,
      "subtotal": 150.00,
      "selected_size": "M",
      "selected_material": "Plata 925"
    }
  ],
  "shipping_address": {
    "street": "Av. Javier Prado Este",
    "number": "1234",
    "city": "Lima",
    "state": "Lima",
    "zip_code": "15036",
    "country": "PE"
  },
  "created_at": "2024-10-30T02:00:00.000Z",
  "source": "luinatique_ecommerce",
  "timestamp": "2024-10-30T02:00:00.000Z",
  "retry_count": 0
}
```

### Headers del Request:

```http
Content-Type: application/json
X-Webhook-Signature: <hmac_sha256_signature>
X-Webhook-Source: luinatique
User-Agent: Luinatique-Webhook/1.0
```

---

## 🛡️ Validación en N8N

### Validar la Firma HMAC en N8N:

```javascript
// En tu webhook de N8N, agrega este código de validación:
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  const calculatedSignature = hmac.digest('hex');
  
  return calculatedSignature === signature;
}

// Uso en N8N:
const payload = JSON.stringify($json);
const receivedSignature = $headers['x-webhook-signature'];
const secret = 'tu-secret-personalizado-aqui-2024'; // Mismo que en .env

if (!verifyWebhookSignature(payload, receivedSignature, secret)) {
  throw new Error('Invalid webhook signature');
}

// Si la firma es válida, procesar el pedido
return $json;
```

---

## 📧 Configuración del Workflow en N8N

### Ejemplo de Workflow:

```
1. Webhook Trigger (POST)
   └─> URL: /webhook/order-created
   
2. Validar Firma HMAC
   └─> Function Node
   
3. Formatear Email
   └─> Function Node
   
4. Enviar Email
   └─> Gmail/SendGrid/SMTP Node
   
5. (Opcional) Guardar en Base de Datos
   └─> Supabase/PostgreSQL Node
   
6. Responder al Webhook
   └─> Response Node
```

### Template de Email Sugerido:

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #8B5CF6; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9f9f9; }
    .order-details { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; }
    .total { font-size: 24px; font-weight: bold; color: #8B5CF6; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🌙 Nueva Orden - Luinatique</h1>
    </div>
    <div class="content">
      <h2>¡Hola {{customer_name}}!</h2>
      <p>Gracias por tu compra. Hemos recibido tu orden correctamente.</p>
      
      <div class="order-details">
        <h3>Detalles del Pedido</h3>
        <p><strong>Número de Orden:</strong> {{order_number}}</p>
        <p><strong>Total:</strong> <span class="total">{{currency}} {{total}}</span></p>
        <p><strong>Método de Pago:</strong> {{payment_method}}</p>
        
        <h4>Productos:</h4>
        <ul>
          {{#each items}}
          <li>{{product_name}} - Cantidad: {{quantity}} - {{currency}} {{subtotal}}</li>
          {{/each}}
        </ul>
      </div>
      
      <p>Te notificaremos cuando tu pedido sea enviado.</p>
      <p>¡Gracias por confiar en Luinatique! 🌙</p>
    </div>
  </div>
</body>
</html>
```

---

## 🧪 Testing

### Probar el Webhook Manualmente:

```bash
curl -X POST https://dvwebhook.brandora.space/webhook/order-created \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Signature: test-signature" \
  -H "X-Webhook-Source: luinatique" \
  -d '{
    "order_id": "test-123",
    "order_number": "TEST-1234",
    "customer_email": "test@example.com",
    "customer_name": "Test User",
    "total": 100.00,
    "currency": "PEN",
    "payment_method": "test",
    "status": "processing"
  }'
```

### Logs en el Navegador:

Los logs del webhook aparecen en la consola del navegador:
- `📤 Sending order to N8N webhook:` - Antes de enviar
- `✅ Order successfully sent to N8N:` - Envío exitoso
- `❌ Error sending to N8N webhook:` - Error en envío
- `🔄 Retrying in Xms...` - Reintento

---

## 🔍 Troubleshooting

### Problema: El webhook no se dispara

**Solución:**
1. Verificar que `VITE_N8N_ORDER_WEBHOOK_URL` esté configurado
2. Revisar los logs en la consola del navegador
3. Verificar que el webhook de N8N esté activo y escuchando

### Problema: Error 429 (Rate Limit)

**Solución:**
- Esperar 1 minuto antes de crear otra orden
- O aumentar el límite en `orders.ts`:
```javascript
const MAX_CALLS_PER_MINUTE = 20; // Aumentar según necesidad
```

### Problema: Firma HMAC inválida

**Solución:**
1. Verificar que el `VITE_WEBHOOK_SECRET` sea el mismo en ambos lados
2. Asegurarse de que N8N esté usando el mismo algoritmo (SHA-256)

### Problema: Timeout en el webhook

**Solución:**
- El sistema tiene 10 segundos de timeout
- Verificar que el endpoint de N8N responda rápido
- Optimizar el workflow en N8N

---

## 📊 Monitoreo

### Métricas a Monitorear:

1. **Tasa de Éxito de Webhooks**
   - Ideal: >95%
   - Revisar logs si cae por debajo

2. **Tiempo de Respuesta**
   - Ideal: <2 segundos
   - Alertar si >5 segundos

3. **Rate Limit Hits**
   - Monitorear advertencias de rate limit
   - Ajustar límite si es necesario

4. **Reintentos**
   - Contar cuántas veces se reintentan
   - Investigar si hay muchos reintentos

---

## 🚀 Recomendaciones de Producción

1. **Secret Fuerte**: Usar un secret aleatorio y seguro
   ```bash
   # Generar un secret seguro:
   openssl rand -hex 32
   ```

2. **Monitoreo**: Implementar Sentry o similar para trackear errores

3. **Backup**: Guardar órdenes fallidas en una cola para reprocesar

4. **Rate Limiting Distribuido**: Usar Redis para rate limiting si hay múltiples instancias

5. **Logging Centralizado**: Enviar logs a un servicio como Datadog o Loggly

6. **Alertas**: Configurar alertas cuando:
   - La tasa de fallo supere el 5%
   - El tiempo de respuesta supere 5 segundos
   - Se alcance el rate limit frecuentemente

---

## 📝 Changelog

### v1.0.0 (2024-10-30)
- ✅ Integración inicial del webhook N8N
- ✅ Sanitización de datos contra XSS
- ✅ Validación de email
- ✅ Rate limiting (10/min)
- ✅ Firma HMAC para autenticación
- ✅ Sistema de retry con backoff exponencial
- ✅ Timeout de 10 segundos
- ✅ Logging detallado

---

## 🆘 Soporte

Para reportar problemas o sugerencias:
- GitHub Issues: https://github.com/Villadev777/luinatique/issues
- Email: soporte@luinatique.com

---

## 📚 Referencias

- [N8N Webhook Documentation](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/)
- [HMAC Authentication](https://en.wikipedia.org/wiki/HMAC)
- [OWASP XSS Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)

---

**Última actualización:** 30 de Octubre, 2024
**Versión:** 1.0.0
**Autor:** Agente Especializado Luinatique

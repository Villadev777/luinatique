# ⚡ Setup Rápido de n8n para Lunatique - 5 Minutos

Esta es la guía express para configurar las automatizaciones básicas de n8n en tu e-commerce Lunatique. Para la guía completa con todos los workflows avanzados, consulta [N8N_INTEGRATION_GUIDE.md](./N8N_INTEGRATION_GUIDE.md).

---

## 🎯 Lo que vas a lograr en 5 minutos:

- ✅ Email automático de confirmación de orden
- ✅ Email cuando cambia el estado (enviado, entregado)
- ✅ Notificación WhatsApp al admin por cada orden
- ✅ Todo funcionando y probado

---

## 📋 Requisitos Previos

- [ ] Cuenta de n8n (Cloud o self-hosted)
- [ ] Gmail con App Password generado
- [ ] Proyecto de Supabase configurado
- [ ] (Opcional) Cuenta de Twilio para WhatsApp

---

## 🚀 Paso 1: Configurar n8n (1 minuto)

### Si usas n8n Cloud:
1. Ve a [n8n.io](https://n8n.io) y crea cuenta
2. Crea un nuevo workflow

### Si usas self-hosted:
```bash
# Instalación rápida
npm install n8n -g
n8n start

# O con Docker
docker run -it --rm --name n8n -p 5678:5678 -v ~/.n8n:/home/node/.n8n n8nio/n8n
```

Accede a: `http://localhost:5678`

---

## 🔑 Paso 2: Agregar Credenciales (2 minutos)

### Gmail:

1. Ve a: [Google App Passwords](https://myaccount.google.com/apppasswords)
2. Genera nueva contraseña de aplicación
3. En n8n:
   - Settings → Credentials → New
   - Type: `Gmail`
   - Email: `tu-email@gmail.com`
   - App Password: `pega-aquí`

### Supabase:

1. En n8n:
   - Settings → Credentials → New
   - Type: `Supabase`
   - Host: `https://sjrlfwxfojfyzujulyas.supabase.co`
   - API Key: (Tu Supabase anon key)

### Twilio (Opcional para WhatsApp):

1. Ve a: [Twilio Console](https://console.twilio.com)
2. Get your Account SID y Auth Token
3. En n8n:
   - Settings → Credentials → New
   - Type: `Twilio`
   - Account SID: `AC...`
   - Auth Token: `...`

---

## 📧 Paso 3: Crear Workflow Email (2 minutos)

### Opción A: Importar Template (RECOMENDADO)

1. Descarga el template: [order-confirmation-workflow.json](./templates/order-confirmation-workflow.json)
2. En n8n: Click en "..." → Import from File
3. Selecciona el archivo descargado
4. Configura tus credenciales
5. Activa el workflow (toggle)

### Opción B: Crear desde cero

1. **Agregar Webhook Node:**
   - Drag & Drop "Webhook" al canvas
   - HTTP Method: `POST`
   - Path: `order-created`
   - Authentication: `Header Auth`
   - Header Name: `X-Webhook-Secret`
   - Header Value: `tu_secret_aqui`

2. **Agregar Function Node:**
   - Conecta al Webhook
   - Pega este código:

```javascript
const order = $input.first().json.data;
const items = $input.first().json.order_items || [];

return {
  customer_name: order.customer_name,
  customer_email: order.customer_email,
  order_number: order.order_number,
  total: order.total,
  items_count: items.length
};
```

3. **Agregar Gmail Node:**
   - Conecta al Function
   - To: `{{$json.customer_email}}`
   - Subject: `¡Orden Confirmada! #{{$json.order_number}}`
   - Message: 

```
Hola {{$json.customer_name}},

¡Gracias por tu compra! Tu orden #{{$json.order_number}} ha sido confirmada.

Total: ${{$json.total}}
Productos: {{$json.items_count}}

Puedes rastrear tu orden en: https://lunatiqueshop.netlify.app/orders

Saludos,
Equipo Lunatique
```

4. **Activar Workflow:**
   - Click en el toggle (arriba derecha)
   - Copia la Webhook URL

---

## ⚙️ Paso 4: Configurar Supabase (30 segundos)

1. Ve a Supabase Dashboard → Project Settings → Edge Functions → Secrets
2. Agrega esta variable:

```
N8N_WEBHOOK_ORDER_CREATED=https://tu-n8n.app/webhook/order-created
N8N_WEBHOOK_SECRET=tu_secret_aqui
```

3. Guarda los cambios

---

## 🧪 Paso 5: Probar (30 segundos)

### Test con curl:

```bash
curl -X POST https://tu-n8n.app/webhook/order-created \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: tu_secret_aqui" \
  -d '{
    "data": {
      "order_number": "TEST-001",
      "customer_name": "Test User",
      "customer_email": "tu-email@test.com",
      "total": 100
    },
    "order_items": [
      {"product_name": "Test Product", "quantity": 1}
    ]
  }'
```

### Test desde Supabase:

```sql
-- En SQL Editor
INSERT INTO orders (
  order_number, 
  customer_name, 
  customer_email, 
  total
) VALUES (
  'TEST-002',
  'Test User',
  'tu-email@test.com',
  100
);
```

**✅ Si recibes el email, ¡funciona!**

---

## 📱 Bonus: WhatsApp en 2 minutos

1. **Setup Twilio WhatsApp Sandbox:**
   - Ve a: [Twilio Console → WhatsApp](https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn)
   - Envía `join <tu-codigo>` al número de Twilio desde tu WhatsApp
   - Ejemplo: `join purple-tiger`

2. **Agregar HTTP Request Node** en tu workflow:
   - Conecta después del Function Node
   - Method: `POST`
   - URL: `https://api.twilio.com/2010-04-01/Accounts/{{$credentials.twilio.accountSid}}/Messages.json`
   - Authentication: `Basic Auth` (usa tus credenciales Twilio)
   - Body Parameters:
     - `From`: `whatsapp:+14155238886` (Twilio sandbox)
     - `To`: `whatsapp:+51920502708` (tu número)
     - `Body`: `🛒 Nueva orden #{{$json.order_number}} de {{$json.customer_name}} - ${{$json.total}}`

3. **Probar:**
   - Ejecuta el workflow
   - Deberías recibir WhatsApp

---

## 🎉 ¡Listo!

Ahora tienes:
- ✅ Emails automáticos funcionando
- ✅ Notificaciones WhatsApp (si configuraste)
- ✅ Sistema probado y activo

---

## 🚀 Próximos Pasos (Opcional)

Para agregar más automatizaciones:

1. **Email de Estado:** Duplica el workflow y cambia webhook a `order-status`
2. **Google Sheets:** Agrega nodo de Google Sheets para registrar órdenes
3. **Slack/Discord:** Agrega nodo para notificar al equipo
4. **Carrito Abandonado:** Crea workflow con Cron que se ejecute cada 6 horas
5. **Review Email:** Crea workflow con Cron diario para pedir reviews

**Ver guía completa:** [N8N_INTEGRATION_GUIDE.md](./N8N_INTEGRATION_GUIDE.md)

---

## 🆘 Problemas Comunes

### Email no llega
- ✅ Verifica Gmail App Password
- ✅ Revisa carpeta Spam
- ✅ Verifica ejecución en n8n → Executions

### WhatsApp no envía
- ✅ Verifica que enviaste "join" al número de Twilio
- ✅ Revisa logs en Twilio Console
- ✅ Verifica formato: `whatsapp:+codigo-pais-numero`

### Webhook retorna 401
- ✅ Verifica que el secret coincide
- ✅ Header debe ser: `X-Webhook-Secret`

### Workflow no se ejecuta
- ✅ Verifica que está activo (toggle verde)
- ✅ Revisa Executions para ver errores
- ✅ Test manual: Click derecho → Execute Workflow

---

## 📚 Recursos

- [Guía Completa (N8N_INTEGRATION_GUIDE.md)](./N8N_INTEGRATION_GUIDE.md) - Todos los workflows avanzados
- [n8n Docs](https://docs.n8n.io)
- [Supabase Docs](https://supabase.com/docs)
- [Twilio WhatsApp](https://www.twilio.com/docs/whatsapp)

---

## 💡 Tips

1. **Guarda tu webhook URL** - La necesitarás para configurar más workflows
2. **Usa el mismo secret** para todos los webhooks - Más fácil de mantener
3. **Test frecuentemente** - Mejor detectar errores temprano
4. **Monitorea Executions** - Revisa logs semanalmente
5. **Backups** - Exporta tus workflows regularmente

---

**¡Tu sistema está listo! 🎉**

Ahora cada vez que alguien haga una compra:
1. Recibirán un email profesional automáticamente
2. Tú recibirás una notificación por WhatsApp
3. Todo queda registrado para seguimiento

**Tu e-commerce trabaja 24/7, incluso mientras duermes. 😴✨**

---

*Tiempo total de setup: ~5 minutos*  
*Actualizado: Octubre 2025*
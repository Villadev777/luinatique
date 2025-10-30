# 🚀 Guía Rápida: Integración N8N Webhook

## ⚡ Configuración en 5 Minutos

### 1️⃣ Configurar Variables de Entorno

Copia tu archivo `.env.example` a `.env` y agrega:

```env
# N8N Webhook
VITE_N8N_ORDER_WEBHOOK_URL=https://dvwebhook.brandora.space/webhook/order-created
VITE_WEBHOOK_SECRET=tu-secret-super-seguro-aqui
```

### 2️⃣ Importar Workflow a N8N

1. Abre N8N: `https://dvwebhook.brandora.space`
2. Ve a **Workflows** → **Import from File**
3. Selecciona: `n8n-workflows/luinatique-order-email.json`
4. Configura tus credenciales de Gmail/SendGrid
5. Activa el workflow

### 3️⃣ Configurar Secret en N8N

En el nodo "Validate Signature" del workflow, cambia:

```javascript
const secret = 'tu-secret-super-seguro-aqui'; // Mismo que en .env
```

### 4️⃣ Deploy

```bash
# Instalar dependencias si es necesario
npm install

# Build
npm run build

# Deploy a Netlify (ejemplo)
netlify deploy --prod
```

### 5️⃣ Probar

1. Ve a tu ecommerce
2. Realiza una compra de prueba
3. Verifica que llegue el email
4. Revisa los logs en la consola del navegador

---

## ✅ Todo Listo!

Tu webhook de N8N está configurado y funcionando con:

- ✅ Envío automático de emails de confirmación
- ✅ Protección contra XSS
- ✅ Rate limiting (10/min)
- ✅ Autenticación HMAC
- ✅ Sistema de reintentos
- ✅ Sanitización de datos

---

## 📚 Documentación Completa

- **Integración detallada**: `N8N_WEBHOOK_INTEGRATION_GUIDE.md`
- **Seguridad**: `SECURITY_RECOMMENDATIONS.md`
- **Workflow N8N**: `n8n-workflows/luinatique-order-email.json`

---

## 🔧 Troubleshooting

### Problema: No se envía el email

**Soluciones:**
1. Verifica que `VITE_N8N_ORDER_WEBHOOK_URL` esté en `.env`
2. Revisa que el workflow de N8N esté **activo**
3. Verifica las credenciales de Gmail/SendGrid en N8N
4. Revisa los logs en la consola del navegador

### Problema: Error de firma HMAC

**Solución:**
El `VITE_WEBHOOK_SECRET` debe ser idéntico en:
- `.env` del ecommerce
- Nodo "Validate Signature" en N8N

### Problema: Rate limit

**Solución:**
Espera 1 minuto o aumenta el límite en `src/lib/orders.ts`:
```typescript
const MAX_CALLS_PER_MINUTE = 20;
```

---

## 💡 Próximos Pasos

1. **Personalizar email**: Edita el template HTML en el workflow de N8N
2. **Agregar más notificaciones**: Copia el workflow para otras acciones
3. **Implementar WAF**: Configura Cloudflare para mayor seguridad
4. **Monitoreo**: Integra Sentry para tracking de errores

---

## 🆘 Soporte

- **Issues**: [GitHub Issues](https://github.com/Villadev777/luinatique/issues)
- **Email**: soporte@luinatique.com

---

**¡Disfruta de tu ecommerce con notificaciones automáticas! 🎉**

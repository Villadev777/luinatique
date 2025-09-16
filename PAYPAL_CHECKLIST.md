# 🚀 Lista de Verificación de PayPal para Luinatique

## ✅ Configuración Completada

### Backend/Edge Functions
- [x] Función `paypal-create-order` configurada
- [x] Función `paypal-capture-order` configurada
- [x] Integración con base de datos Supabase
- [x] Manejo de errores y logs
- [x] CORS configurado correctamente

### Frontend
- [x] Servicio PayPal (`src/lib/paypal.ts`)
- [x] Componente de pago (`PaymentMethodSelector.tsx`)
- [x] Tipos TypeScript definidos
- [x] Manejo de estados de carga
- [x] Conversión PEN/USD

### Base de Datos
- [x] Tabla `orders` mejorada para PayPal
- [x] Funciones auxiliares SQL
- [x] RLS policies configuradas
- [x] Índices optimizados

## ⏳ Configuración Pendiente

### 1. Variables de Entorno (CRÍTICO)

**En tu archivo `.env` local:**
```bash
# Supabase
VITE_SUPABASE_URL=https://lunatique.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_anonima

# PayPal Frontend
VITE_PAYPAL_CLIENT_ID=tu_paypal_client_id
VITE_PAYPAL_MODE=sandbox
```

**En Supabase Dashboard (Edge Functions):**
```bash
PAYPAL_CLIENT_ID=tu_paypal_client_id
PAYPAL_CLIENT_SECRET=tu_paypal_client_secret
PAYPAL_MODE=sandbox
SUPABASE_URL=https://lunatique.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```

### 2. Credenciales PayPal

1. Ve a [PayPal Developer](https://developer.paypal.com/)
2. Crea una aplicación sandbox
3. Obtén:
   - Client ID
   - Client Secret

### 3. Despliegue de Edge Functions

```bash
# Instalar Supabase CLI
npm install supabase --save-dev

# Login a Supabase
npx supabase login

# Link a tu proyecto
npx supabase link --project-ref sjrlfwxfojfyzujulyas

# Desplegar funciones
npx supabase functions deploy paypal-create-order
npx supabase functions deploy paypal-capture-order
```

### 4. Testing

**Cuentas de Prueba PayPal:**
- Comprador: sb-buyer@personal.example.com / password123
- Vendedor: sb-seller@business.example.com / password123

**Flujo de Testing:**
1. Agregar productos al carrito
2. Ir a checkout
3. Seleccionar PayPal
4. Completar pago con cuenta de prueba
5. Verificar orden en base de datos

## 🔧 Comandos de Configuración

### Instalar Dependencias
```bash
npm install
```

### Ejecutar en Desarrollo
```bash
npm run dev
```

### Verificar Edge Functions
```bash
npx supabase functions serve
```

### Verificar Base de Datos
```bash
npx supabase db status
```

## 🐛 Debugging

### Logs a Revisar

1. **Navegador (F12):**
   - Console errors
   - Network requests a edge functions

2. **Supabase Dashboard:**
   - Edge Functions > Logs
   - Table Editor > orders

3. **PayPal Developer:**
   - Sandbox activity
   - Webhook events

### Errores Comunes

**"PayPal credentials not configured"**
→ Verificar variables de entorno en Supabase

**"Failed to load PayPal SDK"**
→ Verificar VITE_PAYPAL_CLIENT_ID

**"CORS error"**
→ Verificar headers en edge functions

**"Database connection failed"**
→ Verificar SUPABASE_SERVICE_ROLE_KEY

## 📱 URLs de Testing

- **Frontend:** http://localhost:5173
- **Edge Functions:** https://sjrlfwxfojfyzujulyas.supabase.co/functions/v1/
- **PayPal Sandbox:** https://www.sandbox.paypal.com

## 🚦 Estado Actual

| Componente | Estado | Acción Requerida |
|-----------|--------|------------------|
| Edge Functions | ✅ Listo | Desplegar |
| Frontend | ✅ Listo | Configurar env vars |
| Base de Datos | ✅ Listo | Aplicar migraciones |
| PayPal App | ❌ Pendiente | Crear en PayPal Developer |
| Variables Env | ❌ Pendiente | Configurar credenciales |

## 🎯 Próximos Pasos

1. **HOY:**
   - [ ] Crear app en PayPal Developer
   - [ ] Configurar variables de entorno
   - [ ] Desplegar edge functions

2. **ESTA SEMANA:**
   - [ ] Testing completo en sandbox
   - [ ] Configurar para producción
   - [ ] Optimizar UX/UI

3. **OPCIONAL:**
   - [ ] Webhook de PayPal
   - [ ] Notificaciones por email
   - [ ] Dashboard de admin

---

**¿Necesitas ayuda?** Revisa `PAYPAL_SETUP.md` para instrucciones detalladas.

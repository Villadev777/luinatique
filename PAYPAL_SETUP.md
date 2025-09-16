# Guía de Configuración de PayPal para Luinatique

## Estado Actual

✅ **Completado:**
- Edge Functions de PayPal (`paypal-create-order`, `paypal-capture-order`)
- Servicio frontend de PayPal (`src/lib/paypal.ts`)
- Componente de selección de pagos (`PaymentMethodSelector.tsx`)
- Tipos TypeScript para PayPal
- Variables de entorno definidas

❌ **Pendiente:**
- Configurar credenciales de PayPal
- Verificar configuración de Supabase
- Testear la integración completa

## Paso 1: Configurar Credenciales de PayPal

### 1.1 Crear Aplicación en PayPal Developer

1. Ve a [PayPal Developer](https://developer.paypal.com/)
2. Inicia sesión con tu cuenta PayPal
3. Ve a "My Apps & Credentials"
4. Crea una nueva app:
   - **App Name:** `Luinatique E-commerce`
   - **Merchant:** Selecciona tu cuenta de negocio
   - **Platform:** Web
   - **Intent:** Merchant

### 1.2 Obtener Credenciales

**Para Sandbox (Testing):**
```
Client ID: Se genera automáticamente
Client Secret: Se genera automáticamente
```

**Para Production:**
```
Client ID: Se genera automáticamente  
Client Secret: Se genera automáticamente
```

### 1.3 Configurar Variables de Entorno

Crea un archivo `.env` basado en `.env.example`:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://lunatique.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_anonima_supabase

# PayPal Configuration (Frontend)
VITE_PAYPAL_CLIENT_ID=tu_paypal_client_id
VITE_PAYPAL_MODE=sandbox  # Cambiar a 'production' para producción

# PayPal Configuration (Backend/Edge Functions)
PAYPAL_CLIENT_ID=tu_paypal_client_id
PAYPAL_CLIENT_SECRET=tu_paypal_client_secret
PAYPAL_MODE=sandbox  # Cambiar a 'production' para producción

# MercadoPago (ya configurado)
MERCADOPAGO_ACCESS_TOKEN=TEST-564877013772959-091522-bf2d1c3bc97b8a9475e54bef2045f839-2054342269
```

## Paso 2: Configurar Supabase Edge Functions

### 2.1 Configurar Variables de Entorno en Supabase

En tu dashboard de Supabase, ve a **Settings > Edge Functions** y agrega:

```
PAYPAL_CLIENT_ID=tu_paypal_client_id
PAYPAL_CLIENT_SECRET=tu_paypal_client_secret  
PAYPAL_MODE=sandbox
```

### 2.2 Verificar Edge Functions

Las siguientes funciones ya están configuradas:

- `paypal-create-order`: Crea órdenes de PayPal
- `paypal-capture-order`: Captura pagos después de la aprobación

## Paso 3: Verificar Frontend

### 3.1 Componente PaymentMethodSelector

El componente ya está configurado y maneja:
- Carga del SDK de PayPal
- Creación de órdenes
- Captura de pagos
- Manejo de errores
- Conversión PEN a USD

### 3.2 Flujo de Pago

1. Usuario selecciona PayPal como método de pago
2. Se cargan los botones de PayPal
3. Usuario hace clic en "Pagar con PayPal"
4. Se crea la orden via Edge Function
5. Usuario completa el pago en PayPal
6. Se captura el pago via Edge Function
7. Usuario es redirigido a página de éxito

## Paso 4: Testing

### 4.1 Cuentas de Prueba PayPal

Para testing en sandbox, usa estas cuentas:

**Comprador Personal:**
```
Email: sb-buyer@personal.example.com
Password: password123
```

**Vendedor Business:**
```
Email: sb-seller@business.example.com  
Password: password123
```

### 4.2 Tarjetas de Prueba

```
Visa: 4032035568677101
Mastercard: 5194274026375055
Amex: 371449635398431
```

## Paso 5: Configuración de Producción

### 5.1 Cambios Necesarios

1. **Variables de entorno:**
   ```
   VITE_PAYPAL_MODE=production
   PAYPAL_MODE=production
   ```

2. **Credenciales de producción en PayPal Developer**

3. **Verificar HTTPS en producción**

### 5.2 Webhook de PayPal (Opcional)

Para mayor seguridad, puedes configurar webhooks:

1. En PayPal Developer, ve a tu app
2. Agrega webhook URL: `https://tu-proyecto.supabase.co/functions/v1/paypal-webhook`
3. Selecciona eventos: `PAYMENT.CAPTURE.COMPLETED`

## Debugging

### Logs a Revisar

1. **Consola del navegador:** Errores de JavaScript
2. **Supabase Edge Functions:** Logs de las funciones PayPal
3. **PayPal Developer:** Logs de transacciones

### Problemas Comunes

**Error: "PayPal credentials not configured"**
- Verificar variables de entorno en Supabase

**Error: "Failed to load PayPal SDK"**
- Verificar `VITE_PAYPAL_CLIENT_ID` en frontend

**Error: "PayPal API error"**
- Verificar modo (sandbox vs production)
- Verificar credenciales en PayPal Developer

## Comandos Útiles

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Build para producción
npm run build

# Desplegar Edge Functions (si usas Supabase CLI)
supabase functions deploy paypal-create-order
supabase functions deploy paypal-capture-order
```

## Archivos Relevantes

```
├── supabase/functions/
│   ├── paypal-create-order/index.ts
│   └── paypal-capture-order/index.ts
├── src/
│   ├── components/PaymentMethodSelector.tsx
│   ├── lib/paypal.ts
│   └── types/paypal.ts
└── .env.example
```

## Próximos Pasos

1. ✅ Obtener credenciales de PayPal
2. ✅ Configurar variables de entorno
3. ⏳ Testear en sandbox
4. ⏳ Configurar para producción
5. ⏳ Implementar webhook (opcional)

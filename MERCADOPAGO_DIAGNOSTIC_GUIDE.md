# 🚀 Guía de Diagnóstico MercadoPago - Luinatique

## ¿Qué es esto?

Esta herramienta de diagnóstico te permitirá verificar que toda tu integración de MercadoPago esté funcionando correctamente. Es como un "chequeo médico" para tu sistema de pagos.

## 🔧 Cómo usar la herramienta

### 1. Acceder al diagnóstico

Navega a: `http://localhost:5173/diagnostic-mp` (en desarrollo) o `https://tudominio.com/diagnostic-mp` (en producción)

### 2. Ejecutar las pruebas

La herramienta incluye 5 pruebas principales:

#### ✅ **Prueba 1: Variables de Entorno**
- Verifica que `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` estén configuradas
- Muestra información del entorno actual

#### ✅ **Prueba 2: Conexión a Supabase**
- Verifica conectividad básica con tu instancia de Supabase
- Confirma que las credenciales sean válidas

#### ✅ **Prueba 3: Edge Functions**
- Verifica que las Edge Functions estén desplegadas
- Confirma que respondan correctamente

#### ✅ **Prueba 4: Creación de Preferencia**
- Intenta crear una preferencia real de MercadoPago
- Usa datos de prueba seguros

#### ✅ **Prueba 5: Flujo Completo**
- Simula todo el proceso de checkout
- Verifica que se puedan generar URLs de pago

## 🛠 Solución de Problemas Comunes

### ❌ **Error: Variables de entorno faltantes**

**Problema:** No se encuentran las variables VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY

**Solución:**
1. Crear un archivo `.env` en la raíz del proyecto
2. Agregar las variables:
```env
VITE_SUPABASE_URL=https://lunatique.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui
```
3. Reiniciar el servidor de desarrollo

### ❌ **Error: Edge Functions no responden**

**Problema:** Las funciones de Supabase no están disponibles

**Solución:**
1. Verificar que las Edge Functions estén desplegadas en Supabase
2. Ir al dashboard de Supabase → Edge Functions
3. Confirmar que `mercadopago-create-preference` esté activa
4. Si no está desplegada, ejecutar:
```bash
supabase functions deploy mercadopago-create-preference
```

### ❌ **Error: Token de MercadoPago inválido**

**Problema:** El token de acceso de MercadoPago no es válido

**Solución:**
1. Ir al dashboard de Supabase → Settings → Edge Functions → Environment variables
2. Verificar que `MERCADOPAGO_ACCESS_TOKEN` esté configurada
3. Usar el token de TEST para pruebas:
   `TEST-564877013772959-091522-bf2d1c3bc97b8a9475e54bef2045f839-2054342269`

### ❌ **Error: CORS**

**Problema:** Errores de política de CORS

**Solución:**
1. Verificar que las Edge Functions tengan los headers CORS correctos
2. En el código de la Edge Function, confirmar:
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
```

## 📋 Checklist de Verificación Manual

Antes de usar la herramienta, verifica manualmente:

### Backend (Supabase):
- [ ] Proyecto de Supabase activo
- [ ] Edge Functions desplegadas
- [ ] Variables de entorno configuradas en Supabase
- [ ] Token de MercadoPago válido

### Frontend (Local):
- [ ] Archivo `.env` creado
- [ ] Variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` configuradas
- [ ] Dependencias instaladas (`npm install`)
- [ ] Servidor en funcionamiento (`npm run dev`)

### MercadoPago:
- [ ] Cuenta de desarrollador activa
- [ ] Aplicación creada en el dashboard
- [ ] Token de acceso generado (TEST para pruebas)

## 🎯 Próximos Pasos

Una vez que todas las pruebas sean exitosas:

1. **Probar flujo real:**
   - Ir a `/checkout`
   - Agregar productos al carrito
   - Completar formulario
   - Seleccionar MercadoPago
   - Completar pago en sandbox

2. **Verificar URLs de retorno:**
   - Confirmar que `/payment/success` funcione
   - Confirmar que `/payment/failure` funcione
   - Verificar que el carrito se limpie después de pago exitoso

3. **Testing con usuarios reales:**
   - Usar tarjetas de prueba de MercadoPago
   - Verificar emails de confirmación
   - Probar diferentes métodos de pago

## 📞 Soporte

Si alguna prueba falla y no puedes resolverlo:

1. **Revisa la consola del navegador** para errores detallados
2. **Copia el mensaje de error completo**
3. **Verifica los logs de las Edge Functions** en Supabase
4. **Contacta soporte** con la información del error

## 🔍 Información Técnica

### Arquitectura del Sistema:
```
Frontend (React) → Supabase Edge Functions → MercadoPago API
```

### Flujo de Datos:
1. Usuario completa checkout
2. Frontend envía datos a Edge Function
3. Edge Function crea preferencia en MercadoPago
4. MercadoPago devuelve URLs de pago
5. Usuario es redirigido a MercadoPago
6. Después del pago, usuario regresa a la app

### Logs Importantes:
- Consola del navegador: Errores del frontend
- Supabase Edge Functions: Logs del backend
- MercadoPago Dashboard: Estado de transacciones
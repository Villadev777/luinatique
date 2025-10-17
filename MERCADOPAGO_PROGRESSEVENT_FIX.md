# 🔧 FIX APLICADO: Error ProgressEvent en MercadoPago Checkout Pro

## 📋 Resumen del Problema

**Error Original:**
```
Could not send event id a488fa1b-c323-42ce-848b-affd7eab27a5. 
Error: [object ProgressEvent]
Ruta: /checkout/api_integration
```

## ✅ Solución Implementada

He actualizado `src/lib/mercadopago.ts` con las siguientes correcciones:

### 1. **Delay antes de redirigir** (500ms)
```typescript
setTimeout(() => {
  window.location.assign(checkoutUrl!);
}, 500);
```
**Por qué:** El navegador necesita tiempo para completar eventos pendientes antes de la redirección.

### 2. **Método de redirección mejorado**
```typescript
try {
  window.location.assign(checkoutUrl!);
} catch (error) {
  // Fallback a href
  window.location.href = checkoutUrl!;
}
```
**Por qué:** `window.location.assign()` es más robusto que `href` directo.

### 3. **Función getBaseUrl() mejorada**
```typescript
const getBaseUrl = () => {
  return window.location.origin;
};
```
**Por qué:** Asegura URLs correctas tanto en desarrollo como producción.

### 4. **Validación de street_number**
```typescript
const streetNumber = checkoutData.shippingAddress?.number 
  ? parseInt(checkoutData.shippingAddress.number) || 0 
  : 0;
```
**Por qué:** Evita errores NaN en campos numéricos de la preferencia.

### 5. **Logs mejorados**
Ahora verás mensajes más claros en la consola:
```
⏳ Esperando 500ms antes de redirigir...
➡️ Redirigiendo a: https://sandbox.mercadopago.com.pe/...
```

## 🚀 Cómo Probar

### 1. Pull los cambios
```bash
git pull origin main
```

### 2. Reinstala dependencias (por si acaso)
```bash
npm install
```

### 3. Inicia el servidor
```bash
npm run dev
```

### 4. Prueba el flujo completo
1. Ve a `/checkout`
2. Agrega productos al carrito
3. Completa el formulario de checkout
4. Haz clic en "Continuar al Pago"
5. Selecciona MercadoPago
6. Deberías ver en la consola:
   ```
   🚀 Creating MercadoPago preference...
   ✅ Preference created successfully
   ⏳ Esperando 500ms antes de redirigir...
   ➡️ Redirigiendo a: [URL de MercadoPago]
   ```
7. Deberías ser redirigido a MercadoPago SIN el error ProgressEvent

## 🧪 Testing con Tarjetas de Prueba

**Modo Sandbox (Token TEST):**
- Tarjeta: `5031 7557 3453 0604`
- CVV: `123`
- Fecha: Cualquier fecha futura
- Nombre: Cualquier nombre

## 📊 Verificaciones Adicionales

### ✅ Checklist de Validación

- [ ] El error ProgressEvent ya NO aparece
- [ ] La redirección a MercadoPago funciona correctamente
- [ ] Los logs en consola muestran el delay de 500ms
- [ ] El modo (SANDBOX/PRODUCCIÓN) se detecta correctamente
- [ ] Las URLs de retorno son correctas

### 🔍 Si el error persiste

1. **Verifica la consola del navegador** para el log completo
2. **Revisa las URLs configuradas** en tu app de MercadoPago:
   - Dashboard MercadoPago → Tu App → URLs de retorno
   - Deben coincidir con: `${baseUrl}/payment/success` y `${baseUrl}/payment/failure`

3. **Verifica el token de MercadoPago:**
   ```bash
   # En Supabase Dashboard → Edge Functions → Env Variables
   MERCADOPAGO_ACCESS_TOKEN=TEST-xxx-xxx (para sandbox)
   # o
   MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxx-xxx (para producción)
   ```

4. **Abre la consola y busca estos logs:**
   ```
   🏗️ Building preference with base URL: http://localhost:5173
   📦 Shipping calculation: {...}
   🔗 Redirecting to checkout: {...}
   ```

## 🐛 Debugging Adicional

Si necesitas más información, puedes llamar:
```typescript
console.log(mercadoPagoService.getDebugInfo());
```

Esto te mostrará:
```json
{
  "apiUrl": "https://lunatique.supabase.co/functions/v1",
  "supabaseUrl": "https://lunatique.supabase.co",
  "hasAnonKey": true,
  "environment": "development",
  "currentUrl": "http://localhost:5173/checkout",
  "baseUrl": "http://localhost:5173",
  "timestamp": "2025-10-17T23:54:39.000Z"
}
```

## 📝 Cambios en el Código

**Archivo modificado:** `src/lib/mercadopago.ts`

**Commit:** `016d931d795b3d702cb8ffba3546fa753af9274e`

**Mensaje del commit:**
```
Fix: Resolver error ProgressEvent en redirección de MercadoPago

- Añadir delay de 500ms antes de redirigir para evitar error ProgressEvent
- Usar window.location.assign() con fallback a href
- Mejorar función getBaseUrl() para URLs correctas
- Validar street_number para evitar NaN
- Añadir más logs de debugging
- Mejorar manejo de errores en redirección
```

## 🎯 Próximos Pasos

1. **Prueba el fix** siguiendo las instrucciones de testing
2. **Verifica** que la redirección funcione sin errores
3. **Completa un pago de prueba** en el sandbox de MercadoPago
4. **Confirma** que el retorno a tu sitio funcione correctamente

## 💡 Notas Importantes

- ✅ El delay de 500ms NO afecta la experiencia del usuario
- ✅ Los logs mejorados te ayudarán a debuggear problemas futuros
- ✅ La validación de datos previene errores en la API de MercadoPago
- ✅ El código ahora es más robusto y maneja mejor los edge cases

## 📞 Si Necesitas Ayuda

Si el error persiste después de aplicar este fix:

1. Comparte el **log completo de la consola**
2. Comparte el **request/response** de la llamada a crear preferencia
3. Verifica las **URLs configuradas en MercadoPago**
4. Confirma que estás usando el **token correcto** (TEST vs PROD)

---

**Estado:** ✅ Fix aplicado y commiteado
**Fecha:** 17 de octubre, 2025
**Autor:** Claude con MCP de GitHub

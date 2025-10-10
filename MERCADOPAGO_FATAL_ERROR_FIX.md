# 🔧 Solución para Error `/fatal` en Edge y Safari

## 📋 Problema

El error `/fatal` de MercadoPago aparece en **Edge y Safari** pero no en **Brave/Chrome/Firefox**.

## 🎯 Causa Raíz

El problema se debe a:
1. **Cookies de terceros bloqueadas** por defecto en Safari y Edge
2. **Tracking Prevention** más agresivo en estos navegadores
3. **LocalStorage bloqueado** en contextos cross-origin
4. **URLs de retorno no configuradas** correctamente

## ✅ Solución Implementada

### Cambio 1: Edge Function Actualizada

He actualizado `supabase/functions/mercadopago-create-preference/index.ts` para:
- ✅ **Validar** que las back_urls siempre vengan del frontend
- ✅ **Requerir HTTPS** en producción
- ✅ **Eliminar** URLs hardcodeadas que causaban conflictos
- ✅ **Agregar logging** detallado para debugging

### Cambio 2: Pasos que Debes Seguir

## 🚀 PASOS PARA SOLUCIONAR

### 1. Redesplegar la Edge Function

```bash
cd luinatique
supabase functions deploy mercadopago-create-preference
```

### 2. Verificar Variables de Entorno en Supabase

Ve a: **Supabase Dashboard → Settings → Edge Functions → Environment variables**

Verifica que tengas:
```
MERCADOPAGO_ACCESS_TOKEN=TEST-tu-token-aqui
```

### 3. Configurar URLs en tu Aplicación de MercadoPago

**CRÍTICO**: Agrega tus URLs a la whitelist en MercadoPago:

1. Ve a https://www.mercadopago.com.pe/developers/panel/app
2. Selecciona tu aplicación
3. Ve a **"Configuración" → "URLs de retorno"**
4. Agrega:
   - `https://lunatiqueshop.netlify.app/payment/success`
   - `https://lunatiqueshop.netlify.app/payment/failure`
   - `https://lunatiqueshop.netlify.app/payment/pending`
   - Si tienes otro dominio, agrégalo también

### 4. Testear en Edge y Safari

#### Para Edge:
1. Abre `edge://settings/privacy`
2. **Prevención de seguimiento** → Cambia a "**Básica**"
3. O agrega excepción para `mercadopago.com` y tu dominio

#### Para Safari:
1. **Safari → Preferencias → Privacidad**
2. ☐ Desmarcar "**Prevenir rastreo entre sitios**"
3. O permite cookies para `mercadopago.com`

### 5. Si Sigue Fallando

Abre la **consola del navegador (F12)** y verifica:

```javascript
// En la pestaña Console, busca:
- ❌ Errores de CORS
- ❌ Errores de cookies bloqueadas
- ❌ Errores de localStorage

// En la pestaña Network:
- Busca el request a: /functions/v1/mercadopago-create-preference
- Verifica la respuesta
- Copia el error y búscalo en Supabase Logs
```

## 🔍 Debugging Adicional

### Ver Logs de Supabase:
```bash
# Logs en tiempo real
supabase functions logs mercadopago-create-preference --tail

# O en el dashboard
Supabase → Edge Functions → mercadopago-create-preference → Logs
```

### Información que Buscar en los Logs:
```
✅ back_urls validadas: { success: "...", failure: "...", pending: "..." }
✅ Preferencia creada exitosamente
❌ back_urls no fueron proporcionadas por el frontend
❌ Invalid success URL: must use HTTPS protocol
```

## 🎯 Solución para Usuarios Finales

Si NO puedes pedirles a tus clientes que cambien configuraciones de navegador, implementa:

### Opción A: Mostrar Banner Informativo

```tsx
// Agregar en CheckoutPage.tsx
{isSafariOrEdge && (
  <Alert>
    <AlertTitle>⚠️ Configuración necesaria</AlertTitle>
    <AlertDescription>
      Para completar tu pago en {browserName}, por favor:
      <ol>
        <li>Permite cookies de terceros para este sitio</li>
        <li>O usa Chrome/Firefox para una mejor experiencia</li>
      </ol>
    </AlertDescription>
  </Alert>
)}
```

### Opción B: Detectar y Redirigir

```typescript
// En PaymentMethodSelector.tsx
const detectBrowser = () => {
  const ua = navigator.userAgent;
  return {
    isSafari: /Safari/.test(ua) && !/Chrome/.test(ua),
    isEdge: /Edg/.test(ua)
  };
};

useEffect(() => {
  const { isSafari, isEdge } = detectBrowser();
  if ((isSafari || isEdge) && selectedMethod === 'mercadopago') {
    toast({
      title: "Recomendación",
      description: "Para mejor experiencia con MercadoPago, recomendamos usar Chrome o Firefox",
    });
  }
}, [selectedMethod]);
```

## 📊 Monitoreo

Para trackear el problema:

1. **Supabase Analytics** → Ver tasa de éxito de pagos por navegador
2. **Sentry o LogRocket** → Capturar errores del frontend
3. **Google Analytics** → Eventos de abandono en checkout

## 🔗 URLs Importantes

- **MercadoPago Developers**: https://www.mercadopago.com.pe/developers
- **Supabase Dashboard**: https://supabase.com/dashboard
- **Proyecto GitHub**: https://github.com/Villadev777/luinatique

## 💡 Notas Adicionales

- **Modo TEST**: Usa tarjetas de prueba de MercadoPago
- **Modo PRODUCCIÓN**: Cambia el token a uno de producción cuando vayas a lanzar
- **Compatibilidad**: Chrome/Firefox tienen mejor soporte para pagos online

## ❓ Si Nada Funciona

1. Revisa que el dominio en `back_urls` sea exactamente el mismo que tu site
2. Verifica que las Edge Functions estén desplegadas
3. Prueba con un token de **PRODUCCIÓN** (no TEST) en producción
4. Contacta soporte de MercadoPago si el problema persiste

---

**Última actualización**: 2025-10-10
**Status**: ✅ Edge Function actualizada y lista para desplegar

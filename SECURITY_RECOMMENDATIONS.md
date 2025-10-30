# 🛡️ Recomendaciones de Ciberseguridad - Luinatique Ecommerce

## 📋 Resumen Ejecutivo

Este documento detalla las medidas de seguridad implementadas y recomendaciones adicionales para proteger tu ecommerce Luinatique contra ataques comunes.

---

## ✅ Medidas de Seguridad Implementadas

### 1. Protección contra XSS (Cross-Site Scripting)

**Implementado en:** `src/lib/orders.ts`

```typescript
const sanitizeString = (str: string): string => {
  return str
    .replace(/[<>]/g, '')           // Remover tags HTML
    .replace(/javascript:/gi, '')    // Remover javascript: URLs
    .replace(/on\w+\s*=/gi, '')     // Remover event handlers
    .trim()
    .substring(0, 500);             // Limitar longitud
};
```

**Protege contra:**
- Inyección de scripts maliciosos
- Event handlers maliciosos (onclick, onerror, etc.)
- URLs javascript: maliciosas

---

### 2. Validación de Email

**Implementado en:** `src/lib/orders.ts`

```typescript
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email) && email.length <= 254;
};
```

**Protege contra:**
- Emails malformados
- Email injection attacks
- Spam

---

### 3. Rate Limiting

**Implementado en:** `src/lib/orders.ts`

```typescript
const MAX_CALLS_PER_MINUTE = 10;
```

**Protege contra:**
- Ataques de denegación de servicio (DoS)
- Spam de webhooks
- Abuso del sistema

**Recomendación:** En producción, implementar rate limiting a nivel de servidor (Nginx, Cloudflare, etc.)

---

### 4. Autenticación HMAC

**Implementado en:** `src/lib/orders.ts`

```typescript
const generateWebhookSignature = async (payload: string): Promise<string> => {
  const secret = import.meta.env.VITE_WEBHOOK_SECRET;
  // ... genera HMAC SHA-256
};
```

**Protege contra:**
- Webhooks no autorizados
- Man-in-the-middle attacks
- Replay attacks (parcial)

---

### 5. Timeout de Requests

**Implementado en:** `src/lib/orders.ts`

```typescript
signal: AbortSignal.timeout(10000) // 10 segundos
```

**Protege contra:**
- Hanging requests
- Resource exhaustion
- DoS attacks

---

### 6. Retry con Backoff Exponencial

**Implementado en:** `src/lib/orders.ts`

```typescript
const delay = RETRY_DELAY * Math.pow(2, retryCount); // 1s, 2s, 4s
```

**Protege contra:**
- Sobrecarga del servidor webhook
- Cascading failures

---

## 🔴 Vulnerabilidades Críticas a Prevenir

### 1. SQL Injection

**Estado:** ✅ Protegido por Supabase

Supabase usa prepared statements automáticamente, lo que previene SQL injection.

**Recomendación adicional:**
- Nunca construir queries SQL manualmente
- Validar todos los inputs antes de queries

---

### 2. CSRF (Cross-Site Request Forgery)

**Estado:** ⚠️ Requiere implementación adicional

**Recomendación:**
```typescript
// Agregar token CSRF en forms
<input type="hidden" name="csrf_token" value={csrfToken} />
```

**Implementar en:**
- Forms de checkout
- Admin panel
- Profile updates

---

### 3. Credential Stuffing

**Estado:** ⚠️ Depende de Supabase Auth

**Recomendaciones:**
1. Habilitar 2FA en Supabase
2. Implementar captcha en login
3. Limitar intentos de login fallidos
4. Usar password strength requirements

---

### 4. Session Hijacking

**Estado:** ⚠️ Requiere configuración adicional

**Recomendaciones:**
```typescript
// En producción, configurar cookies seguras
{
  secure: true,         // Solo HTTPS
  httpOnly: true,       // No accesible desde JS
  sameSite: 'strict'    // Prevenir CSRF
}
```

---

### 5. Clickjacking

**Estado:** ⚠️ Requiere headers HTTP

**Implementar en Netlify:** `netlify.toml`

```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.paypal.com https://sdk.mercadopago.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.supabase.co https://api.mercadopago.com https://api.paypal.com"
```

---

## 🚀 Mejoras de Seguridad Recomendadas

### 1. Implementar WAF (Web Application Firewall)

**Opciones:**
- Cloudflare WAF (Recomendado)
- AWS WAF
- Sucuri

**Beneficios:**
- Bloqueo de IPs maliciosas
- Protección contra DDoS
- Bot management

---

### 2. Habilitar HTTPS Strict

**En Netlify:**
```toml
[[headers]]
  for = "/*"
  [headers.values]
    Strict-Transport-Security = "max-age=31536000; includeSubDomains; preload"
```

---

### 3. Implementar Content Security Policy (CSP)

**Archivo:** `index.html`

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' https://sdk.mercadopago.com https://www.paypal.com; 
               style-src 'self' 'unsafe-inline'; 
               img-src 'self' data: https:;">
```

---

### 4. Logging y Monitoreo

**Implementar:**
- Sentry para error tracking
- LogRocket para session replay
- Cloudflare Analytics

**Ejemplo de integración Sentry:**

```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.NODE_ENV,
  tracesSampleRate: 1.0,
  beforeSend(event, hint) {
    // Sanitizar datos sensibles
    if (event.request?.data) {
      delete event.request.data.customer_dni;
      delete event.request.data.customer_phone;
    }
    return event;
  }
});
```

---

### 5. Backup Automático de Base de Datos

**Configurar en Supabase:**
- Backups diarios automáticos
- Retención de 30 días
- Point-in-time recovery

---

### 6. Secrets Management

**❌ Nunca hacer:**
```typescript
const apiKey = "hardcoded-key-123"; // ¡MAL!
```

**✅ Hacer:**
```typescript
const apiKey = import.meta.env.VITE_API_KEY;
```

**Herramientas recomendadas:**
- Doppler
- AWS Secrets Manager
- HashiCorp Vault

---

### 7. Auditorías de Seguridad

**Frecuencia recomendada:**
- Mensual: Revisión de dependencias (npm audit)
- Trimestral: Penetration testing
- Anual: Security audit profesional

**Herramientas:**
```bash
# Auditar dependencias
npm audit --audit-level=high

# Actualizar dependencias con vulnerabilidades
npm audit fix

# Escanear con Snyk
npx snyk test

# Escanear con OWASP Dependency Check
npx dependency-check .
```

---

### 8. Implementar Honeypot

**Para forms:**
```typescript
// Campo invisible para bots
<input 
  type="text" 
  name="website" 
  style={{ display: 'none' }}
  tabIndex={-1}
  autoComplete="off"
/>

// Validar en backend
if (formData.website !== '') {
  // Es un bot, rechazar
  return { error: 'Invalid submission' };
}
```

---

### 9. Input Validation Completa

**Implementar en todos los forms:**

```typescript
const validateCheckoutData = (data: any) => {
  // Validar email
  if (!isValidEmail(data.email)) {
    throw new Error('Invalid email');
  }
  
  // Validar DNI (8 dígitos)
  if (!/^\d{8}$/.test(data.dni)) {
    throw new Error('Invalid DNI');
  }
  
  // Validar teléfono
  if (data.phone && !/^\+?[\d\s-()]+$/.test(data.phone)) {
    throw new Error('Invalid phone');
  }
  
  // Validar amounts
  if (data.total <= 0 || data.total > 100000) {
    throw new Error('Invalid amount');
  }
  
  return true;
};
```

---

### 10. Implementar Token Anti-Replay

**Para webhooks:**

```typescript
// Generar nonce único
const nonce = crypto.randomUUID();

// Incluir en payload
const payload = {
  ...orderData,
  nonce: nonce,
  timestamp: Date.now()
};

// Validar en N8N
const isReplay = checkNonceUsed(payload.nonce);
if (isReplay) {
  throw new Error('Replay attack detected');
}
markNonceAsUsed(payload.nonce);
```

---

## 📊 Checklist de Seguridad

### Pre-Producción

- [ ] Cambiar `VITE_WEBHOOK_SECRET` por valor aleatorio seguro
- [ ] Habilitar HTTPS en producción
- [ ] Configurar CSP headers
- [ ] Implementar rate limiting a nivel servidor
- [ ] Habilitar backups automáticos en Supabase
- [ ] Configurar Sentry o similar para error tracking
- [ ] Auditar dependencias con `npm audit`
- [ ] Implementar 2FA en cuentas admin
- [ ] Configurar WAF (Cloudflare recomendado)
- [ ] Sanitizar logs (no incluir datos sensibles)

### Post-Producción

- [ ] Monitorear logs de seguridad diariamente
- [ ] Revisar intentos de acceso fallidos
- [ ] Actualizar dependencias semanalmente
- [ ] Revisar CSP violations
- [ ] Monitorear rate limit hits
- [ ] Backup manual mensual
- [ ] Penetration testing trimestral
- [ ] Security audit anual

---

## 🚨 Plan de Respuesta a Incidentes

### Fase 1: Detección (0-5 minutos)

1. Recibir alerta de monitoreo
2. Confirmar si es un incidente real
3. Clasificar severidad (Crítico/Alto/Medio/Bajo)

### Fase 2: Contención (5-30 minutos)

1. Aislar el sistema afectado
2. Bloquear IPs maliciosas en WAF
3. Rotar credenciales comprometidas
4. Notificar al equipo de seguridad

### Fase 3: Erradicación (30 minutos - 4 horas)

1. Identificar vulnerabilidad explotada
2. Parchear sistema
3. Eliminar backdoors
4. Actualizar reglas de firewall

### Fase 4: Recuperación (4-24 horas)

1. Restaurar desde backup si necesario
2. Verificar integridad de datos
3. Monitorear actividad anómala
4. Reactivar servicios gradualmente

### Fase 5: Post-Mortem (1-7 días)

1. Documentar incidente completo
2. Analizar causa raíz
3. Implementar mejoras
4. Actualizar procedimientos

---

## 📞 Contactos de Emergencia

**Equipo de Seguridad:**
- Email: security@luinatique.com
- Teléfono: +51 XXX XXX XXX

**Servicios de Soporte:**
- Supabase Support: https://supabase.com/support
- Cloudflare Support: https://support.cloudflare.com
- Netlify Support: https://www.netlify.com/support/

**Reportar Vulnerabilidades:**
- Email: security@luinatique.com
- Bounty Program: (Si aplica)

---

## 📚 Recursos Adicionales

### Estándares de Seguridad

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CWE Top 25](https://cwe.mitre.org/top25/)
- [PCI DSS](https://www.pcisecuritystandards.org/)

### Herramientas de Testing

- [OWASP ZAP](https://www.zaproxy.org/)
- [Burp Suite](https://portswigger.net/burp)
- [Snyk](https://snyk.io/)

### Capacitación

- [OWASP WebGoat](https://owasp.org/www-project-webgoat/)
- [HackTheBox](https://www.hackthebox.com/)
- [TryHackMe](https://tryhackme.com/)

---

**Última actualización:** 30 de Octubre, 2024  
**Versión:** 1.0.0  
**Próxima revisión:** 30 de Enero, 2025  
**Autor:** Agente Especializado Luinatique

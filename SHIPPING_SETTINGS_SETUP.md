# 📦 Sistema de Configuración Dinámica de Envío

## 🎯 Descripción

Ahora puedes cambiar las reglas de envío de tu tienda directamente desde el **Dashboard de Administración** sin necesidad de modificar código.

## 🛠️ Instalación

### Paso 1: Ejecutar la Migración de Supabase

Debes ejecutar la migración SQL en tu base de datos de Supabase:

**Opción A: Desde el Dashboard de Supabase**

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Navega a **SQL Editor**
3. Crea una nueva query
4. Copia y pega el contenido de `supabase/migrations/20250107_create_shipping_settings.sql`
5. Ejecuta la query

**Opción B: Desde la CLI de Supabase**

```bash
cd tu-proyecto
supabase db push
```

### Paso 2: Verificar la Instalación

1. Ve al **Dashboard de Admin**: `/admin`
2. Haz clic en la pestaña **"Settings"**
3. Deberías ver la configuración de envío

## ⚙️ Cómo Usar

### Cambiar la Configuración de Envío

1. **Accede al Admin Dashboard**
   - URL: `https://tu-dominio.com/admin`
   - Solo administradores pueden acceder

2. **Ve a la pestaña "Settings"**
   - Encontrarás 6 pestañas: Analytics, Orders, Products, Categories, Users, **Settings**

3. **Edita los valores**
   - **Umbral para Envío Gratis**: Monto mínimo para envío gratis (ej: S/ 100)
   - **Costo de Envío Estándar**: Costo para pedidos menores (ej: S/ 12.99)

4. **Guarda los cambios**
   - Haz clic en "Guardar Cambios"
   - Los cambios se aplican **inmediatamente** en todo el sitio

### Dónde se Aplican los Cambios

Los valores dinámicos se usan automáticamente en:

- ✅ **Carrito de Compras** (`CartSidebar.tsx`)
- ✅ **Página de Checkout** (`CheckoutComponent.tsx`)
- ✅ **Selección de Método de Pago** (`PaymentMethodSelector.tsx`)
- ✅ **Procesamiento de Pagos**:
  - MercadoPago (PEN)
  - PayPal (USD - con conversión automática)

## 📊 Ejemplos de Uso

### Ejemplo 1: Promoción de Envío Gratis

**Antes:**
- Umbral: S/ 50
- Envío: S/ 9.99

**Cambia a:**
- Umbral: S/ 30 (para promoción)
- Envío: S/ 9.99

**Resultado:** Más clientes calificarán para envío gratis

### Ejemplo 2: Aumentar Umbral

**Antes:**
- Umbral: S/ 50
- Envío: S/ 9.99

**Cambia a:**
- Umbral: S/ 100 (para aumentar ticket promedio)
- Envío: S/ 15.00

**Resultado:** Los clientes necesitarán comprar más para envío gratis

## 💻 Arquitectura Técnica

### Base de Datos

**Tabla: `shipping_settings`**

```sql
CREATE TABLE shipping_settings (
  id UUID PRIMARY KEY,
  free_shipping_threshold DECIMAL(10,2) NOT NULL,
  standard_shipping_cost DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'PEN',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Hook: `useShippingSettings`

```typescript
import { useShippingSettings } from '@/hooks/useShippingSettings';

function MyComponent() {
  const { 
    calculateShipping,           // Calcula envío basado en subtotal
    getFreeShippingThreshold,    // Obtiene umbral actual
    getShippingCost,             // Obtiene costo actual
    isFreeShipping,              // Verifica si aplica envío gratis
    getAmountNeededForFreeShipping  // Cantidad faltante para envío gratis
  } = useShippingSettings();
  
  const subtotal = 45;
  const shipping = calculateShipping(subtotal); // 9.99
  const needed = getAmountNeededForFreeShipping(subtotal); // 5.00
}
```

### Componente de Admin: `ShippingSettings`

Proporciona una interfaz gráfica para:

- 📊 Ver configuración actual
- ✏️ Editar valores
- 💾 Guardar cambios
- 🔄 Cancelar edición

## 🛡️ Seguridad

### Políticas RLS (Row Level Security)

```sql
-- Cualquiera puede LEER la configuración
CREATE POLICY "Anyone can read shipping settings"
  ON shipping_settings FOR SELECT
  USING (true);

-- Solo ADMINS pueden ACTUALIZAR
CREATE POLICY "Admins can update shipping settings"
  ON shipping_settings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );
```

## 💡 Mejores Prácticas

### ✅ Hacer

- Monitorea el impacto de los cambios en las ventas
- Ajusta valores según campañas estacionales
- Comunica cambios importantes a los clientes
- Prueba diferentes umbrales para optimizar conversiones

### ❌ No Hacer

- Cambiar valores muy frecuentemente (confunde a los clientes)
- Establecer umbrales demasiado altos (reduce conversiones)
- Olvidar volver a valores normales después de promociones

## 🐛 Troubleshooting

### Error: "No se pudo actualizar la configuración"

**Posibles causas:**
- El usuario no es administrador
- La tabla no existe (falta ejecutar migración)
- Problemas de permisos RLS

**Solución:**
```bash
# Verificar que el usuario es admin
SELECT is_admin FROM profiles WHERE id = auth.uid();

# Verificar que la tabla existe
SELECT * FROM shipping_settings;
```

### Los cambios no se reflejan inmediatamente

**Solución:**
- Refresca la página (F5)
- El caché se invalida automáticamente cada 5 minutos
- Los componentes usan `useShippingSettings` que consulta en tiempo real

## 📊 Monitoreo

### Ver Historial de Cambios

Puedes consultar cuándo se hicieron cambios:

```sql
SELECT 
  free_shipping_threshold,
  standard_shipping_cost,
  updated_at
FROM shipping_settings
ORDER BY updated_at DESC;
```

### Valores por Defecto

Si la tabla no está disponible, el sistema usa valores por defecto:

- **Umbral para envío gratis:** S/ 50.00
- **Costo de envío:** S/ 9.99

## 🚀 Futuras Mejoras

Posibles extensiones del sistema:

- [ ] Múltiples zonas de envío (Lima, Provincias, Internacional)
- [ ] Envío express con costo adicional
- [ ] Horarios de envío dinámicos
- [ ] Integración con APIs de courier
- [ ] Historial de cambios con audit log
- [ ] Programación de cambios futuros

## 📞 Soporte

Si tienes problemas:

1. Revisa los logs del navegador (F12 > Console)
2. Verifica que la migración se ejecutó correctamente
3. Confirma que tu usuario tiene permisos de admin

---

¡Ahora puedes gestionar los costos de envío de tu tienda de forma dinámica! 🎉
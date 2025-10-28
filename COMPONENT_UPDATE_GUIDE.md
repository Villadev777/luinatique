# 🛠️ Guía de Actualización de Componentes

## Cómo actualizar tus componentes de checkout para incluir DNI

### 1. Actualizar el Formulario de Checkout

```tsx
// src/components/CheckoutForm.tsx (EJEMPLO)
import { useState } from 'react';
import { mercadoPagoService } from '@/lib/mercadopago';
import type { CheckoutData } from '@/types/mercadopago';

export function CheckoutForm({ cartItems, onSuccess, onError }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    dni: '', // ✨ NUEVO: Campo DNI
    phone: '',
    street: '',
    number: '',
    zipCode: '',
    city: 'Lima',
    state: 'Lima'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  // ✨ Validar DNI
  const validateDNI = (dni: string): boolean => {
    const dniRegex = /^[0-9]{8}$/;
    return dniRegex.test(dni);
  };

  // Validar formulario
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    }

    if (!formData.email.includes('@')) {
      newErrors.email = 'Email inválido';
    }

    // ✨ Validación DNI obligatoria
    if (!formData.dni) {
      newErrors.dni = 'El DNI es obligatorio';
    } else if (!validateDNI(formData.dni)) {
      newErrors.dni = 'El DNI debe tener 8 dígitos';
    }

    if (formData.phone && formData.phone.length < 9) {
      newErrors.phone = 'El teléfono debe tener al menos 9 dígitos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);

    try {
      // ✨ Construir CheckoutData con DNI incluido
      const checkoutData: CheckoutData = {
        items: cartItems.map(item => ({
          id: item.id,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          description: item.description
        })),
        customer: {
          name: formData.name,
          email: formData.email,
          dni: formData.dni, // ✨ CRÍTICO: Incluir DNI
          phone: formData.phone || undefined
        },
        shippingAddress: {
          street: formData.street,
          number: formData.number,
          zipCode: formData.zipCode,
          city: formData.city,
          state: formData.state
        }
      };

      // Crear preferencia
      const preference = await mercadoPagoService.createPreference(checkoutData);

      // Redirigir a MercadoPago
      mercadoPagoService.redirectToCheckout(preference);

      onSuccess?.();
    } catch (error) {
      console.error('Error al procesar el pago:', error);
      onError?.(error);
      
      setErrors({
        submit: error instanceof Error ? error.message : 'Error al procesar el pago'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Información Personal */}
      <div className="space-y-3">
        <h3 className="font-semibold">Información Personal</h3>
        
        {/* Nombre */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Nombre Completo *
          </label>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border rounded"
            placeholder="Juan Pérez"
            required
          />
          {errors.name && (
            <span className="text-red-500 text-sm">{errors.name}</span>
          )}
        </div>

        {/* DNI - ✨ NUEVO CAMPO */}
        <div>
          <label htmlFor="dni" className="block text-sm font-medium mb-1">
            DNI * <span className="text-gray-500 text-xs">(8 dígitos)</span>
          </label>
          <input
            id="dni"
            type="text"
            value={formData.dni}
            onChange={(e) => {
              // Solo permitir números y máximo 8 dígitos
              const value = e.target.value.replace(/\D/g, '').slice(0, 8);
              setFormData({ ...formData, dni: value });
            }}
            pattern="[0-9]{8}"
            maxLength={8}
            className="w-full px-3 py-2 border rounded"
            placeholder="12345678"
            required
          />
          {errors.dni && (
            <span className="text-red-500 text-sm">{errors.dni}</span>
          )}
          <p className="text-xs text-gray-500 mt-1">
            El DNI es necesario para procesar tu pago de forma segura
          </p>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email *
          </label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-3 py-2 border rounded"
            placeholder="tu@email.com"
            required
          />
          {errors.email && (
            <span className="text-red-500 text-sm">{errors.email}</span>
          )}
        </div>

        {/* Teléfono */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium mb-1">
            Teléfono (opcional)
          </label>
          <input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '');
              setFormData({ ...formData, phone: value });
            }}
            className="w-full px-3 py-2 border rounded"
            placeholder="987654321"
          />
          {errors.phone && (
            <span className="text-red-500 text-sm">{errors.phone}</span>
          )}
        </div>
      </div>

      {/* Dirección de Envío */}
      <div className="space-y-3">
        <h3 className="font-semibold">Dirección de Envío</h3>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label htmlFor="street" className="block text-sm font-medium mb-1">
              Calle *
            </label>
            <input
              id="street"
              type="text"
              value={formData.street}
              onChange={(e) => setFormData({ ...formData, street: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              placeholder="Av. Principal"
              required
            />
          </div>

          <div>
            <label htmlFor="number" className="block text-sm font-medium mb-1">
              Número *
            </label>
            <input
              id="number"
              type="text"
              value={formData.number}
              onChange={(e) => setFormData({ ...formData, number: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              placeholder="123"
              required
            />
          </div>

          <div>
            <label htmlFor="zipCode" className="block text-sm font-medium mb-1">
              Código Postal *
            </label>
            <input
              id="zipCode"
              type="text"
              value={formData.zipCode}
              onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              placeholder="15001"
              required
            />
          </div>

          <div>
            <label htmlFor="city" className="block text-sm font-medium mb-1">
              Ciudad *
            </label>
            <input
              id="city"
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              placeholder="Lima"
              required
            />
          </div>

          <div>
            <label htmlFor="state" className="block text-sm font-medium mb-1">
              Departamento *
            </label>
            <input
              id="state"
              type="text"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              placeholder="Lima"
              required
            />
          </div>
        </div>
      </div>

      {/* Error general */}
      {errors.submit && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {errors.submit}
        </div>
      )}

      {/* Botón de pago */}
      <button
        type="submit"
        disabled={isProcessing}
        className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? 'Procesando...' : 'Proceder al Pago'}
      </button>

      <p className="text-xs text-gray-500 text-center">
        Al continuar, serás redirigido a MercadoPago para completar tu pago de forma segura
      </p>
    </form>
  );
}
```

### 2. Ejemplo de Uso en una Página

```tsx
// src/pages/Checkout.tsx
import { CheckoutForm } from '@/components/CheckoutForm';
import { useCart } from '@/context/CartContext';
import { useNavigate } from 'react-router-dom';

export function CheckoutPage() {
  const { items, clearCart } = useCart();
  const navigate = useNavigate();

  const handleSuccess = () => {
    clearCart();
    // El usuario será redirigido a MercadoPago automáticamente
  };

  const handleError = (error: any) => {
    console.error('Error en checkout:', error);
    // Mostrar notificación de error
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Finalizar Compra</h1>
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* Formulario */}
        <div>
          <CheckoutForm
            cartItems={items}
            onSuccess={handleSuccess}
            onError={handleError}
          />
        </div>

        {/* Resumen de orden */}
        <div>
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="font-semibold mb-4">Resumen de Compra</h2>
            {/* ... resumen de items ... */}
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 3. Validación de DNI Reutilizable

```typescript
// src/utils/validation.ts
export const validateDNI = (dni: string): { valid: boolean; error?: string } => {
  // Remover espacios
  const cleanDNI = dni.trim();

  // Verificar longitud
  if (cleanDNI.length !== 8) {
    return { valid: false, error: 'El DNI debe tener 8 dígitos' };
  }

  // Verificar que solo contenga números
  if (!/^[0-9]{8}$/.test(cleanDNI)) {
    return { valid: false, error: 'El DNI solo debe contener números' };
  }

  // DNI válido
  return { valid: true };
};

// Uso:
const dniValidation = validateDNI(formData.dni);
if (!dniValidation.valid) {
  setError(dniValidation.error);
}
```

### 4. Hook Personalizado para Checkout

```typescript
// src/hooks/useCheckout.ts
import { useState } from 'react';
import { mercadoPagoService } from '@/lib/mercadopago';
import type { CheckoutData, CartItem } from '@/types/mercadopago';

interface UseCheckoutReturn {
  processCheckout: (data: CheckoutData) => Promise<void>;
  isProcessing: boolean;
  error: string | null;
}

export function useCheckout(): UseCheckoutReturn {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processCheckout = async (checkoutData: CheckoutData) => {
    setIsProcessing(true);
    setError(null);

    try {
      // ✨ Validar DNI
      if (!checkoutData.customer.dni) {
        throw new Error('El DNI es obligatorio');
      }

      if (!/^[0-9]{8}$/.test(checkoutData.customer.dni)) {
        throw new Error('El DNI debe tener 8 dígitos');
      }

      // Crear preferencia
      const preference = await mercadoPagoService.createPreference(checkoutData);

      // Redirigir automáticamente
      mercadoPagoService.redirectToCheckout(preference);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al procesar el pago';
      setError(errorMessage);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    processCheckout,
    isProcessing,
    error
  };
}

// Uso en componente:
const { processCheckout, isProcessing, error } = useCheckout();

const handleSubmit = async () => {
  await processCheckout({
    items: cartItems,
    customer: {
      name: 'Juan',
      email: 'juan@example.com',
      dni: '12345678' // ✨ Incluir DNI
    }
  });
};
```

## 📝 Checklist de Migración

- [ ] Agregar campo DNI al formulario
- [ ] Validar DNI (8 dígitos, solo números)
- [ ] Hacer DNI obligatorio en CheckoutData
- [ ] Actualizar tests con DNI incluido
- [ ] Probar en modo Sandbox
- [ ] Verificar logs de preferencia creada
- [ ] Confirmar metadata incluye DNI
- [ ] Testear flujo completo de pago

## 🎯 Campos Obligatorios vs Opcionales

### Obligatorios ✅
- `customer.name`
- `customer.email`
- `customer.dni` (✨ NUEVO)
- `items[]` (al menos 1)

### Opcionales
- `customer.phone`
- `customer.surname` (se genera automáticamente)
- `shippingAddress` (si no hay envío físico)

## 🔍 Debugging

```typescript
// Verificar datos antes de enviar
console.log('CheckoutData:', checkoutData);
console.log('DNI incluido:', !!checkoutData.customer.dni);
console.log('DNI válido:', /^[0-9]{8}$/.test(checkoutData.customer.dni));

// Obtener debug info del servicio
const debugInfo = mercadoPagoService.getDebugInfo();
console.log('MercadoPago Debug:', debugInfo);
```

---

**Nota**: Todos los cambios son retrocompatibles con la estructura anterior, pero **el DNI ahora es obligatorio** para mejorar la tasa de aprobación.

import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useShippingSettings } from '@/hooks/useShippingSettings';
import { mercadoPagoService } from '../lib/mercadopago';
import { CheckoutData, CartItem } from '../types/mercadopago';
import PaymentMethodSelector from './PaymentMethodSelector';
import { Loader2, CreditCard, Shield, ArrowLeft, Truck, AlertCircle } from 'lucide-react';

interface CheckoutComponentProps {
  items: CartItem[];
  onSuccess?: (preferenceId: string) => void;
  onError?: (error: string) => void;
}

type CheckoutStep = 'form' | 'payment';

export const CheckoutComponent: React.FC<CheckoutComponentProps> = ({
  items,
  onSuccess,
  onError,
}) => {
  const { toast } = useToast();
  const { calculateShipping, getFreeShippingThreshold, getAmountNeededForFreeShipping } = useShippingSettings();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('form');
  const [customerData, setCustomerData] = useState({
    email: '',
    name: '',
    phone: '',
    dni: '', // ⚠️ OPCIONAL: Solo requerido para Mercado Pago
  });
  const [shippingData, setShippingData] = useState({
    street: '',
    number: '',
    zipCode: '',
    city: '',
    state: '',
  });
  
  // ✨ Estado de validación DNI
  const [dniError, setDniError] = useState('');

  const subtotal = mercadoPagoService.calculateTotal(items);
  const shippingCost = calculateShipping(subtotal);
  const total = subtotal + shippingCost;
  const freeShippingThreshold = getFreeShippingThreshold();
  const amountNeeded = getAmountNeededForFreeShipping(subtotal);

  // ✨ Validar DNI (solo si se proporciona)
  const validateDNI = (dni: string): boolean => {
    if (!dni) {
      setDniError('');
      return true; // DNI vacío es válido (opcional)
    }
    
    if (dni.length !== 8) {
      setDniError('El DNI debe tener 8 dígitos');
      return false;
    }
    
    if (!/^[0-9]{8}$/.test(dni)) {
      setDniError('El DNI solo debe contener números');
      return false;
    }
    
    setDniError('');
    return true;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // ✨ Validar solo campos REALMENTE obligatorios (Email y Nombre)
    if (!customerData.email || !customerData.name) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Por favor complete Email y Nombre',
      });
      return;
    }

    // ✨ Validar formato DNI si se proporcionó
    if (customerData.dni && !validateDNI(customerData.dni)) {
      toast({
        variant: 'destructive',
        title: 'DNI inválido',
        description: dniError,
      });
      return;
    }

    // Proceed to payment method selection
    setCurrentStep('payment');
  };

  const handleMercadoPagoPayment = async () => {
    setLoading(true);

    try {
      const checkoutData: CheckoutData = {
        items,
        customer: customerData,
        shippingAddress: shippingData.street ? shippingData : undefined,
      };

      const preference = await mercadoPagoService.createPreference(checkoutData);
      
      toast({
        title: 'Redirigiendo al pago',
        description: 'Serás redirigido a MercadoPago para completar tu pago',
      });

      // Esperar un momento antes de redirigir
      setTimeout(() => {
        // AUTO-DETECCIÓN: El servicio detecta automáticamente si usar producción o sandbox
        mercadoPagoService.redirectToCheckout(preference);
        onSuccess?.(preference.id);
      }, 1000);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast({
        variant: 'destructive',
        title: 'Error al procesar el pago',
        description: errorMessage,
      });
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const preparePaymentData = (): CheckoutData => {
    return {
      items,
      customer: customerData,
      shippingAddress: shippingData.street ? shippingData : undefined,
    };
  };

  if (currentStep === 'payment') {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="outline" 
            onClick={() => setCurrentStep('form')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Selecciona tu método de pago</h1>
            <p className="text-muted-foreground">
              Cliente: {customerData.name} ({customerData.email})
            </p>
          </div>
        </div>
        
        <PaymentMethodSelector 
          checkoutData={preparePaymentData()}
          onSuccess={onSuccess}
          onError={onError}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Finalizar Compra</h1>
        <p className="text-muted-foreground">
          Complete sus datos para proceder con el pago
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Formulario de Checkout */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Información del Cliente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Datos del Cliente */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Datos del Cliente</h3>
                
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={customerData.email}
                    onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
                    placeholder="tu@email.com"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="name">Nombre Completo *</Label>
                  <Input
                    id="name"
                    value={customerData.name}
                    onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
                    placeholder="Juan Pérez"
                    required
                  />
                </div>

                {/* ✨ DNI OPCIONAL: Solo para Mercado Pago */}
                <div>
                  <Label htmlFor="dni" className="flex items-center gap-2">
                    DNI (Opcional)
                    <span className="text-xs text-muted-foreground font-normal">
                      (Requerido para Mercado Pago)
                    </span>
                  </Label>
                  <Input
                    id="dni"
                    type="text"
                    value={customerData.dni}
                    onChange={(e) => {
                      // Solo permitir números y máximo 8 dígitos
                      const value = e.target.value.replace(/\D/g, '').slice(0, 8);
                      setCustomerData({ ...customerData, dni: value });
                      // Validar en tiempo real
                      validateDNI(value);
                    }}
                    placeholder="12345678"
                    maxLength={8}
                    pattern="[0-9]{8}"
                    className={dniError ? 'border-red-500' : ''}
                  />
                  {dniError && (
                    <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {dniError}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    💡 El DNI es <strong>obligatorio para Mercado Pago</strong> y mejora la tasa de aprobación. Opcional para PayPal.
                  </p>
                </div>

                <div>
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    value={customerData.phone}
                    onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
                    placeholder="+51 999 999 999"
                  />
                </div>
              </div>

              <Separator />

              {/* Dirección de Envío */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Dirección de Envío (Opcional)</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="street">Calle</Label>
                    <Input
                      id="street"
                      value={shippingData.street}
                      onChange={(e) => setShippingData({ ...shippingData, street: e.target.value })}
                      placeholder="Av. Javier Prado"
                    />
                  </div>
                  <div>
                    <Label htmlFor="number">Número</Label>
                    <Input
                      id="number"
                      value={shippingData.number}
                      onChange={(e) => setShippingData({ ...shippingData, number: e.target.value })}
                      placeholder="123"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">Ciudad</Label>
                    <Input
                      id="city"
                      value={shippingData.city}
                      onChange={(e) => setShippingData({ ...shippingData, city: e.target.value })}
                      placeholder="Lima"
                    />
                  </div>
                  <div>
                    <Label htmlFor="zipCode">Código Postal</Label>
                    <Input
                      id="zipCode"
                      value={shippingData.zipCode}
                      onChange={(e) => setShippingData({ ...shippingData, zipCode: e.target.value })}
                      placeholder="15001"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="state">Departamento</Label>
                  <Input
                    id="state"
                    value={shippingData.state}
                    onChange={(e) => setShippingData({ ...shippingData, state: e.target.value })}
                    placeholder="Lima"
                  />
                </div>
              </div>

              <Separator />

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Continuar al Pago
                  </>
                )}
              </Button>

              <div className="text-xs text-muted-foreground text-center">
                En el siguiente paso podrás elegir entre MercadoPago (soles) o PayPal (USD) para completar tu pago.
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Resumen del Pedido */}
        <Card>
          <CardHeader>
            <CardTitle>Resumen del Pedido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between items-center">
                <div className="flex-1">
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-muted-foreground">
                    Cantidad: {item.quantity}
                  </p>
                </div>
                <p className="font-medium">
                  {mercadoPagoService.formatPrice(item.price * item.quantity)}
                </p>
              </div>
            ))}
            
            <Separator />
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>{mercadoPagoService.formatPrice(subtotal)}</span>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-muted-foreground" />
                  <span>Envío:</span>
                </div>
                <div>
                  {shippingCost === 0 ? (
                    <span className="text-green-600 font-semibold">GRATIS</span>
                  ) : (
                    <span>{mercadoPagoService.formatPrice(shippingCost)}</span>
                  )}
                </div>
              </div>
              
              {amountNeeded > 0 && (
                <p className="text-xs text-muted-foreground">
                  💡 Agrega {mercadoPagoService.formatPrice(amountNeeded)} más para envío gratis
                </p>
              )}
            </div>
            
            <Separator />
            
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total</span>
              <span>{mercadoPagoService.formatPrice(total)}</span>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Métodos de Pago Disponibles</h4>
              <div className="text-sm text-muted-foreground space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span><strong>MercadoPago (PEN):</strong> Tarjetas locales, transferencias, PagoEfectivo (requiere DNI)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span><strong>PayPal (USD):</strong> Pagos internacionales seguros (DNI opcional)</span>
                </div>
              </div>
            </div>

            <div className="space-y-1 text-xs text-muted-foreground text-center">
              <div className="flex items-center justify-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>Pagos 100% seguros y encriptados</span>
              </div>
              <div>
                📦 Envío gratis en pedidos superiores a S/ {freeShippingThreshold.toFixed(2)}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

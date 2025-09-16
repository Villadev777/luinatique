import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { useToast } from '@/hooks/use-toast';
import { mercadoPagoService } from '../lib/mercadopago';
import { CheckoutData, CartItem } from '../types/mercadopago';
import { Loader2, CreditCard, Shield } from 'lucide-react';

interface CheckoutComponentProps {
  items: CartItem[];
  onSuccess?: (preferenceId: string) => void;
  onError?: (error: string) => void;
}

export const CheckoutComponent: React.FC<CheckoutComponentProps> = ({
  items,
  onSuccess,
  onError,
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [customerData, setCustomerData] = useState({
    email: '',
    name: '',
    phone: '',
  });
  const [shippingData, setShippingData] = useState({
    street: '',
    number: '',
    zipCode: '',
    city: '',
    state: '',
  });

  const total = mercadoPagoService.calculateTotal(items);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerData.email || !customerData.name) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Por favor complete los campos obligatorios',
      });
      return;
    }

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
        mercadoPagoService.redirectToCheckout(preference, true); // true para sandbox
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

  return (
    <div className=\"max-w-4xl mx-auto p-6 space-y-6\">
      <div className=\"grid md:grid-cols-2 gap-6\">
        {/* Formulario de Checkout */}
        <Card>
          <CardHeader>
            <CardTitle className=\"flex items-center gap-2\">
              <CreditCard className=\"h-5 w-5\" />
              Información de Pago
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className=\"space-y-4\">
              {/* Datos del Cliente */}
              <div className=\"space-y-4\">
                <h3 className=\"font-semibold text-lg\">Datos del Cliente</h3>
                
                <div>
                  <Label htmlFor=\"email\">Email *</Label>
                  <Input
                    id=\"email\"
                    type=\"email\"
                    value={customerData.email}
                    onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
                    placeholder=\"tu@email.com\"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor=\"name\">Nombre Completo *</Label>
                  <Input
                    id=\"name\"
                    value={customerData.name}
                    onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
                    placeholder=\"Juan Pérez\"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor=\"phone\">Teléfono</Label>
                  <Input
                    id=\"phone\"
                    value={customerData.phone}
                    onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
                    placeholder=\"+51 999 999 999\"
                  />
                </div>
              </div>

              <Separator />

              {/* Dirección de Envío */}
              <div className=\"space-y-4\">
                <h3 className=\"font-semibold text-lg\">Dirección de Envío (Opcional)</h3>
                
                <div className=\"grid grid-cols-2 gap-4\">
                  <div>
                    <Label htmlFor=\"street\">Calle</Label>
                    <Input
                      id=\"street\"
                      value={shippingData.street}
                      onChange={(e) => setShippingData({ ...shippingData, street: e.target.value })}
                      placeholder=\"Av. Javier Prado\"
                    />
                  </div>
                  <div>
                    <Label htmlFor=\"number\">Número</Label>
                    <Input
                      id=\"number\"
                      value={shippingData.number}
                      onChange={(e) => setShippingData({ ...shippingData, number: e.target.value })}
                      placeholder=\"123\"
                    />
                  </div>
                </div>

                <div className=\"grid grid-cols-2 gap-4\">
                  <div>
                    <Label htmlFor=\"city\">Ciudad</Label>
                    <Input
                      id=\"city\"
                      value={shippingData.city}
                      onChange={(e) => setShippingData({ ...shippingData, city: e.target.value })}
                      placeholder=\"Lima\"
                    />
                  </div>
                  <div>
                    <Label htmlFor=\"zipCode\">Código Postal</Label>
                    <Input
                      id=\"zipCode\"
                      value={shippingData.zipCode}
                      onChange={(e) => setShippingData({ ...shippingData, zipCode: e.target.value })}
                      placeholder=\"15001\"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor=\"state\">Departamento</Label>
                  <Input
                    id=\"state\"
                    value={shippingData.state}
                    onChange={(e) => setShippingData({ ...shippingData, state: e.target.value })}
                    placeholder=\"Lima\"
                  />
                </div>
              </div>

              <Separator />

              <Button
                type=\"submit\"
                className=\"w-full\"
                disabled={loading}
                size=\"lg\"
              >
                {loading ? (
                  <>
                    <Loader2 className=\"mr-2 h-4 w-4 animate-spin\" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <Shield className=\"mr-2 h-4 w-4\" />
                    Pagar con MercadoPago
                  </>
                )}
              </Button>

              <div className=\"text-xs text-muted-foreground text-center\">
                Al hacer clic en \"Pagar\", serás redirigido a MercadoPago para completar tu pago de forma segura.
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Resumen del Pedido */}
        <Card>
          <CardHeader>
            <CardTitle>Resumen del Pedido</CardTitle>
          </CardHeader>
          <CardContent className=\"space-y-4\">
            {items.map((item) => (
              <div key={item.id} className=\"flex justify-between items-center\">
                <div className=\"flex-1\">
                  <p className=\"font-medium\">{item.title}</p>
                  <p className=\"text-sm text-muted-foreground\">
                    Cantidad: {item.quantity}
                  </p>
                </div>
                <p className=\"font-medium\">
                  {mercadoPagoService.formatPrice(item.price * item.quantity)}
                </p>
              </div>
            ))}
            
            <Separator />
            
            <div className=\"flex justify-between items-center text-lg font-bold\">
              <span>Total</span>
              <span>{mercadoPagoService.formatPrice(total)}</span>
            </div>

            <div className=\"bg-muted p-4 rounded-lg\">
              <h4 className=\"font-semibold mb-2\">Métodos de Pago Disponibles</h4>
              <div className=\"text-sm text-muted-foreground space-y-1\">
                <p>• Tarjetas de crédito y débito</p>
                <p>• Transferencia bancaria</p>
                <p>• PagoEfectivo</p>
                <p>• Cuotas sin interés disponibles</p>
              </div>
            </div>

            <div className=\"flex items-center justify-center space-x-2 text-sm text-muted-foreground\">
              <Shield className=\"h-4 w-4\" />
              <span>Pago 100% seguro con MercadoPago</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
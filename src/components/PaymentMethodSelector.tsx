import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { Badge } from '../components/ui/badge';
import { useToast } from '../hooks/use-toast';
import { paypalService } from '../lib/paypal';
import { mercadoPagoService } from '../lib/mercadopago';
import { createOrder } from '../lib/orders';
import { CheckoutData } from '../types/mercadopago';
import { PayPalCaptureResponse } from '../types/paypal';
import { 
  CreditCard, 
  DollarSign, 
  Clock, 
  Shield, 
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface PaymentMethod {
  id: 'mercadopago' | 'paypal';
  name: string;
  description: string;
  currency: string;
  icon: React.ReactNode;
  fees: string;
  processingTime: string;
  status: 'available' | 'unavailable' | 'recommended';
}

interface PaymentMethodSelectorProps {
  checkoutData?: CheckoutData;
  onSuccess?: (details: any) => void;
  onError?: (error: string) => void;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  checkoutData: providedCheckoutData,
  onSuccess,
  onError
}) => {
  const { state, clearCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [selectedMethod, setSelectedMethod] = useState<'mercadopago' | 'paypal' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paypalLoaded, setPaypalLoaded] = useState(false);

  const checkoutData: CheckoutData = providedCheckoutData || {
    items: state.items.map(item => ({
      id: item.id,
      title: item.name,
      quantity: item.quantity,
      price: item.sale_price || item.price,
      description: item.name,
      image: item.image,
    })),
    customer: {
      email: 'test_user_123456@testuser.com',
      name: 'Usuario de Prueba',
      phone: '+51987654321',
    },
    shippingAddress: {
      street: 'Av. Javier Prado Este',
      number: '1234',
      city: 'Lima',
      state: 'Lima',
      zipCode: '15036',
    },
  };

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'mercadopago',
      name: 'MercadoPago',
      description: 'Paga en soles peruanos con tarjetas locales',
      currency: 'PEN (Soles)',
      icon: <CreditCard className="h-6 w-6" />,
      fees: 'Sin comisión adicional',
      processingTime: 'Inmediato',
      status: 'available',
    },
    {
      id: 'paypal',
      name: 'PayPal',
      description: 'Pago internacional seguro con PayPal',
      currency: 'USD (Dólares)',
      icon: <DollarSign className="h-6 w-6" />,
      fees: 'Conversión automática',
      processingTime: 'Inmediato',
      status: 'recommended',
    },
  ];

  useEffect(() => {
    const loadPayPal = async () => {
      try {
        await paypalService.loadPayPalScript();
        setPaypalLoaded(true);
      } catch (error) {
        console.error('Failed to load PayPal:', error);
        toast({
          title: "Error",
          description: "No se pudo cargar PayPal. Intenta recargar la página.",
          variant: "destructive",
        });
      }
    };

    loadPayPal();
  }, [toast]);

  useEffect(() => {
    if (selectedMethod === 'paypal' && paypalLoaded && window.paypal && !isProcessing) {
      const paypalButtonsContainer = document.getElementById('paypal-buttons');
      if (paypalButtonsContainer && paypalButtonsContainer.children.length === 0) {
        
        const buttonsConfig = paypalService.createButtonsConfig(
          checkoutData,
          async (details: PayPalCaptureResponse) => {
            console.log('💳 PayPal payment success:', details);
            
            try {
              console.log('📝 Saving order to database...');
              
              // Guardar orden directamente en Supabase
              await createOrder({
                paymentDetails: { ...details, method: 'paypal' },
                cartItems: state.items,
                customerInfo: checkoutData.customer,
                shippingAddress: checkoutData.shippingAddress,
              });
              
              console.log('✅ Order saved successfully');
              
              toast({
                title: "¡Pago exitoso!",
                description: `Pago procesado correctamente. ID: ${details.id}`,
              });
              
              clearCart();
              
              if (onSuccess) {
                onSuccess({ ...details, method: 'paypal' });
              } else {
                navigate('/payment/success', { 
                  state: { 
                    paymentDetails: details,
                    method: 'paypal' 
                  } 
                });
              }
            } catch (error) {
              console.error('❌ Error saving order:', error);
              toast({
                title: "Advertencia",
                description: "El pago se procesó pero hubo un problema al guardar la orden. Contacta al soporte.",
                variant: "destructive",
              });
            }
          },
          (error: any) => {
            console.error('PayPal payment error:', error);
            const errorMessage = "Hubo un problema procesando tu pago con PayPal.";
            toast({
              title: "Error en el pago",
              description: errorMessage,
              variant: "destructive",
            });
            setIsProcessing(false);
            
            if (onError) {
              onError(errorMessage);
            }
          }
        );

        try {
          window.paypal.Buttons(buttonsConfig).render('#paypal-buttons');
        } catch (error) {
          console.error('Error rendering PayPal buttons:', error);
        }
      }
    }
  }, [selectedMethod, paypalLoaded, isProcessing, checkoutData, toast, clearCart, navigate, onSuccess, onError, state.items]);

  const handleMercadoPagoPayment = async () => {
    console.log('🎯 handleMercadoPagoPayment - START');
    
    setIsProcessing(true);
    
    try {
      const preference = await mercadoPagoService.createPreference(checkoutData);
      
      toast({
        title: "Redirigiendo a MercadoPago",
        description: "Serás redirigido para completar tu pago.",
      });
      
      if (onSuccess) {
        onSuccess({ preference_id: preference.id, method: 'mercadopago' });
      }
      
      const checkoutUrl = preference.sandbox_init_point || preference.init_point;
      
      if (!checkoutUrl) {
        throw new Error('No se recibió URL de checkout de MercadoPago');
      }
      
      window.location.href = checkoutUrl;
      
    } catch (error) {
      console.error('❌ MercadoPago error:', error);
      
      const errorMessage = error instanceof Error ? error.message : "Hubo un problema con MercadoPago.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      if (onError) {
        onError(errorMessage);
      }
      setIsProcessing(false);
    }
  };

  const getStatusIcon = (status: PaymentMethod['status']) => {
    switch (status) {
      case 'recommended':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'unavailable':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
    }
  };

  const getStatusBadge = (status: PaymentMethod['status']) => {
    switch (status) {
      case 'recommended':
        return <Badge className="bg-green-100 text-green-800">Recomendado</Badge>;
      case 'unavailable':
        return <Badge variant="destructive">Temporalmente no disponible</Badge>;
      default:
        return <Badge variant="secondary">Disponible</Badge>;
    }
  };

  const totalPEN = checkoutData.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  const totalUSD = paypalService.getTotalAmountUSD(checkoutData);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Elige tu método de pago</h1>
        <p className="text-muted-foreground">
          Selecciona la opción que más te convenga para completar tu compra
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          {paymentMethods.map((method) => (
            <Card 
              key={method.id}
              className={`cursor-pointer transition-all ${
                selectedMethod === method.id 
                  ? 'ring-2 ring-primary border-primary' 
                  : 'hover:shadow-md'
              } ${method.status === 'unavailable' ? 'opacity-60' : ''}`}
              onClick={() => method.status !== 'unavailable' && setSelectedMethod(method.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {method.icon}
                    <CardTitle className="text-lg">{method.name}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(method.status)}
                    {getStatusBadge(method.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  {method.description}
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span>{method.currency}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{method.processingTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span>{method.fees}</span>
                  </div>
                </div>

                {method.status === 'unavailable' && (
                  <div className="mt-3 p-2 bg-red-50 rounded text-sm text-red-700">
                    {method.name} está temporalmente no disponible.
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumen del pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {checkoutData.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      Cantidad: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      S/ {(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>S/ {totalPEN.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Envío:</span>
                  <span>Gratis</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <div className="text-right">
                    <div>S/ {totalPEN.toFixed(2)}</div>
                    {selectedMethod === 'paypal' && (
                      <div className="text-sm text-muted-foreground">
                        ≈ ${totalUSD.toFixed(2)} USD
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              {!selectedMethod ? (
                <div className="text-center text-muted-foreground">
                  Selecciona un método de pago para continuar
                </div>
              ) : selectedMethod === 'mercadopago' ? (
                <Button 
                  onClick={handleMercadoPagoPayment}
                  disabled={isProcessing}
                  className="w-full"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Pagar con MercadoPago
                    </>
                  )}
                </Button>
              ) : selectedMethod === 'paypal' ? (
                <div className="space-y-4">
                  <div className="text-center text-sm text-muted-foreground">
                    Haz clic en el botón de PayPal para continuar
                  </div>
                  <div id="paypal-buttons"></div>
                  {!paypalLoaded && (
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Cargando PayPal...
                    </div>
                  )}
                </div>
              ) : null}
            </CardContent>
          </Card>

          <div className="text-center text-xs text-muted-foreground">
            🔒 Tus datos están protegidos con encriptación SSL
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodSelector;

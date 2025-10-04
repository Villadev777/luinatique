import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';
import { mercadoPagoService } from '../lib/mercadopago';
import { PaymentStatus } from '../types/mercadopago';

interface PayPalPaymentData {
  paymentDetails?: any;
  method?: string;
  timestamp?: string;
}

const PaymentResult: React.FC = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
  const [paypalData, setPaypalData] = useState<PayPalPaymentData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processPayment = async () => {
      console.log('🔄 Processing payment callback with params:', {
        payment_id: searchParams.get('payment_id'),
        status: searchParams.get('status'),
        collection_status: searchParams.get('collection_status'),
        external_reference: searchParams.get('external_reference'),
        payment_type: searchParams.get('payment_type'),
        preference_id: searchParams.get('preference_id'),
      });

      try {
        // PRIORITY 1: Check if this is a PayPal payment from location state
        if (location.state?.paymentDetails || location.state?.method === 'paypal') {
          console.log('✅ PayPal payment detected from location state');
          setPaypalData(location.state as PayPalPaymentData);
          setLoading(false);
          return;
        }

        // PRIORITY 2: Check sessionStorage for PayPal data
        const savedPayPalData = sessionStorage.getItem('payment_success_data');
        if (savedPayPalData) {
          console.log('✅ PayPal payment detected from sessionStorage');
          const data = JSON.parse(savedPayPalData);
          setPaypalData(data);
          sessionStorage.removeItem('payment_success_data'); // Clean up
          setLoading(false);
          return;
        }

        // PRIORITY 3: Check if we have MercadoPago payment parameters
        const paymentId = searchParams.get('payment_id');
        const collectionStatus = searchParams.get('collection_status');
        const status = searchParams.get('status');

        if (paymentId || collectionStatus || status) {
          console.log('✅ MercadoPago payment detected from URL params');
          const result = await mercadoPagoService.processPaymentCallback(searchParams);
          setPaymentStatus(result);
          setLoading(false);
          return;
        }

        // No payment data found at all
        console.log('⚠️ No payment data found');
        setError('No se encontraron datos de pago');
        setLoading(false);
      } catch (err) {
        console.error('❌ Error processing payment:', err);
        setError(err instanceof Error ? err.message : 'Error al procesar el pago');
        setLoading(false);
      }
    };

    processPayment();
  }, [searchParams, location.state]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
      case 'COMPLETED':
        return <CheckCircle className="h-16 w-16 text-green-500" />;
      case 'rejected':
      case 'cancelled':
        return <XCircle className="h-16 w-16 text-red-500" />;
      case 'pending':
      case 'in_process':
        return <Clock className="h-16 w-16 text-yellow-500" />;
      default:
        return <Clock className="h-16 w-16 text-gray-500" />;
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'approved':
      case 'COMPLETED':
        return {
          title: '¡Pago Exitoso!',
          description: 'Tu pago ha sido procesado correctamente. Recibirás un email de confirmación.',
          color: 'text-green-600'
        };
      case 'rejected':
        return {
          title: 'Pago Rechazado',
          description: 'Tu pago ha sido rechazado. Por favor, verifica tus datos e intenta nuevamente.',
          color: 'text-red-600'
        };
      case 'cancelled':
        return {
          title: 'Pago Cancelado',
          description: 'Has cancelado el proceso de pago.',
          color: 'text-red-600'
        };
      case 'pending':
        return {
          title: 'Pago Pendiente',
          description: 'Tu pago está siendo procesado. Te notificaremos cuando se complete.',
          color: 'text-yellow-600'
        };
      case 'in_process':
        return {
          title: 'Pago en Proceso',
          description: 'Tu pago está siendo revisado. Te notificaremos el resultado pronto.',
          color: 'text-yellow-600'
        };
      default:
        return {
          title: 'Estado Desconocido',
          description: 'No pudimos determinar el estado de tu pago. Contacta con soporte.',
          color: 'text-gray-600'
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
            <Loader2 className="h-16 w-16 animate-spin text-blue-500" />
            <h2 className="text-xl font-semibold">Procesando pago...</h2>
            <p className="text-muted-foreground text-center">
              Estamos verificando el estado de tu pago
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <XCircle className="h-16 w-16 text-red-500" />
            </div>
            <p className="text-center text-muted-foreground">{error}</p>
            <div className="flex gap-2">
              <Button 
                onClick={() => navigate('/')} 
                variant="outline" 
                className="flex-1"
              >
                Volver a la Tienda
              </Button>
              <Button 
                onClick={() => window.location.reload()} 
                className="flex-1"
              >
                Reintentar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Handle PayPal payment success
  if (paypalData) {
    const details = paypalData.paymentDetails || {};
    const paymentId = details.id || 'N/A';
    
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-center text-green-600">
              ¡Pago Exitoso!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Success Icon */}
            <div className="flex justify-center">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>

            {/* Message */}
            <p className="text-center text-lg text-muted-foreground">
              Tu pago con PayPal ha sido procesado correctamente. Recibirás un email de confirmación.
            </p>

            {/* Payment Details */}
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <h3 className="font-semibold mb-3">Detalles del Pago</h3>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">ID de Pago:</span>
                <span className="font-mono text-sm">{paymentId}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Método de Pago:</span>
                <span>PayPal</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estado:</span>
                <span className="text-green-600 font-semibold">Completado</span>
              </div>

              {details.payer?.email_address && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="text-sm">{details.payer.email_address}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
              <Button onClick={() => navigate('/orders')} className="flex-1 max-w-48">
                Ver Mis Pedidos
              </Button>
              <Button 
                onClick={() => navigate('/')} 
                variant="outline" 
                className="flex-1 max-w-48"
              >
                Seguir Comprando
              </Button>
            </div>

            {/* Additional Info */}
            <div className="text-center text-sm text-muted-foreground space-y-1">
              <p>
                Recibirás un email de confirmación en los próximos minutos.
              </p>
              <p>
                Si tienes alguna pregunta, no dudes en{' '}
                <button 
                  onClick={() => navigate('/contactanos')}
                  className="text-primary hover:underline"
                >
                  contactarnos
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Handle MercadoPago payment
  if (!paymentStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
            <XCircle className="h-16 w-16 text-red-500" />
            <h2 className="text-xl font-semibold text-red-600">
              No se encontró información del pago
            </h2>
            <p className="text-muted-foreground text-center">
              No pudimos obtener los detalles de tu pago
            </p>
            <Button onClick={() => navigate('/')}>
              Volver a la Tienda
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusInfo = getStatusMessage(paymentStatus.status);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className={`text-center ${statusInfo.color}`}>
            {statusInfo.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status Icon */}
          <div className="flex justify-center">
            {getStatusIcon(paymentStatus.status)}
          </div>

          {/* Message */}
          <p className="text-center text-lg text-muted-foreground">
            {statusInfo.description}
          </p>

          {/* Payment Details */}
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <h3 className="font-semibold mb-3">Detalles del Pago</h3>
            
            {paymentStatus.id && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">ID de Pago:</span>
                <span className="font-mono text-sm">{paymentStatus.id}</span>
              </div>
            )}
            
            {paymentStatus.external_reference && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Referencia:</span>
                <span className="font-mono text-sm">{paymentStatus.external_reference}</span>
              </div>
            )}
            
            {paymentStatus.transaction_amount > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Monto:</span>
                <span className="font-semibold">
                  {mercadoPagoService.formatPrice(paymentStatus.transaction_amount)}
                </span>
              </div>
            )}
            
            {paymentStatus.payment_method_id && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Método de Pago:</span>
                <span>MercadoPago - {paymentStatus.payment_method_id}</span>
              </div>
            )}
            
            {paymentStatus.date_created && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fecha:</span>
                <span>{new Date(paymentStatus.date_created).toLocaleString('es-PE')}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            {paymentStatus.status === 'approved' && (
              <>
                <Button onClick={() => navigate('/orders')} className="flex-1 max-w-48">
                  Ver Mis Pedidos
                </Button>
                <Button 
                  onClick={() => navigate('/')} 
                  variant="outline" 
                  className="flex-1 max-w-48"
                >
                  Seguir Comprando
                </Button>
              </>
            )}

            {['rejected', 'cancelled'].includes(paymentStatus.status) && (
              <>
                <Button onClick={() => navigate('/')} className="flex-1 max-w-48">
                  Intentar Nuevamente
                </Button>
                <Button 
                  onClick={() => navigate('/contactanos')} 
                  variant="outline" 
                  className="flex-1 max-w-48"
                >
                  Contactar Soporte
                </Button>
              </>
            )}

            {['pending', 'in_process'].includes(paymentStatus.status) && (
              <>
                <Button onClick={() => navigate('/orders')} className="flex-1 max-w-48">
                  Ver Estado del Pedido
                </Button>
                <Button 
                  onClick={() => navigate('/')} 
                  variant="outline" 
                  className="flex-1 max-w-48"
                >
                  Volver a la Tienda
                </Button>
              </>
            )}
          </div>

          {/* Additional Information */}
          <div className="text-center text-sm text-muted-foreground space-y-1">
            {paymentStatus.status === 'approved' && (
              <p>
                Recibirás un email de confirmación en los próximos minutos.
              </p>
            )}
            
            {['pending', 'in_process'].includes(paymentStatus.status) && (
              <p>
                Te enviaremos una notificación cuando el pago sea procesado.
              </p>
            )}
            
            <p>
              Si tienes alguna pregunta, no dudes en{' '}
              <button 
                onClick={() => navigate('/contactanos')}
                className="text-primary hover:underline"
              >
                contactarnos
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentResult;
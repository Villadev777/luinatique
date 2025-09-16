import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';
import { mercadoPagoService } from '../lib/mercadopago';
import { PaymentStatus } from '../types/mercadopago';

export const PaymentResult: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processPayment = async () => {
      try {
        const result = await mercadoPagoService.processPaymentCallback(searchParams);
        setPaymentStatus(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al procesar el pago');
      } finally {
        setLoading(false);
      }
    };

    processPayment();
  }, [searchParams]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
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
                onClick={() => navigate('/shop')} 
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
            <Button onClick={() => navigate('/shop')}>
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
          {/* Icono de Estado */}
          <div className="flex justify-center">
            {getStatusIcon(paymentStatus.status)}
          </div>

          {/* Mensaje */}
          <p className="text-center text-lg text-muted-foreground">
            {statusInfo.description}
          </p>

          {/* Detalles del Pago */}
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
                <span>{paymentStatus.payment_method_id}</span>
              </div>
            )}
            
            {paymentStatus.date_created && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fecha:</span>
                <span>{new Date(paymentStatus.date_created).toLocaleString('es-PE')}</span>
              </div>
            )}
          </div>

          {/* Botones de Acción */}
          <div className="flex gap-4 justify-center">
            {paymentStatus.status === 'approved' && (
              <>
                <Button onClick={() => navigate('/orders')} className="flex-1 max-w-48">
                  Ver Mis Pedidos
                </Button>
                <Button 
                  onClick={() => navigate('/shop')} 
                  variant="outline" 
                  className="flex-1 max-w-48"
                >
                  Seguir Comprando
                </Button>
              </>
            )}

            {['rejected', 'cancelled'].includes(paymentStatus.status) && (
              <>
                <Button onClick={() => navigate('/shop')} className="flex-1 max-w-48">
                  Intentar Nuevamente
                </Button>
                <Button 
                  onClick={() => navigate('/contact')} 
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
                  onClick={() => navigate('/shop')} 
                  variant="outline" 
                  className="flex-1 max-w-48"
                >
                  Volver a la Tienda
                </Button>
              </>
            )}
          </div>

          {/* Información Adicional */}
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
                onClick={() => navigate('/contact')}
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
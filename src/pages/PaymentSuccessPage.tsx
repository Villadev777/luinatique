import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { CheckCircle, Package, Home } from 'lucide-react';

const PaymentSuccessPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const paymentDetails = location.state?.paymentDetails;
  const method = location.state?.method;

  useEffect(() => {
    // Si no hay datos de pago, buscar en sessionStorage
    if (!paymentDetails) {
      const savedData = sessionStorage.getItem('payment_success_data');
      if (savedData) {
        const data = JSON.parse(savedData);
        // Actualizar el estado con los datos guardados
        sessionStorage.removeItem('payment_success_data');
      }
    }
  }, [paymentDetails]);

  const handleGoHome = () => {
    navigate('/');
  };

  const handleViewOrders = () => {
    navigate('/orders');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center justify-center p-8 space-y-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold">¡Pago Exitoso!</h1>
            <p className="text-muted-foreground">
              Tu pedido ha sido procesado correctamente
            </p>
          </div>

          {paymentDetails && (
            <div className="w-full space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">ID de Pago:</span>
                <span className="font-mono">{paymentDetails.id}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Método:</span>
                <span className="capitalize">{method || 'PayPal'}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Estado:</span>
                <span className="text-green-600 font-semibold">Aprobado</span>
              </div>
            </div>
          )}

          <div className="w-full space-y-3 pt-4">
            <Button 
              onClick={handleViewOrders}
              className="w-full"
              size="lg"
            >
              <Package className="mr-2 h-4 w-4" />
              Ver mis Pedidos
            </Button>
            
            <Button 
              onClick={handleGoHome}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <Home className="mr-2 h-4 w-4" />
              Volver al Inicio
            </Button>
          </div>

          <div className="text-center text-xs text-muted-foreground pt-4">
            <p>Recibirás un correo de confirmación en breve</p>
            <p className="mt-1">¡Gracias por tu compra!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccessPage;
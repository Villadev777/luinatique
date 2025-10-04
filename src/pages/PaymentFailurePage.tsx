import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { XCircle, Home, ShoppingCart } from 'lucide-react';

const PaymentFailurePage: React.FC = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleRetry = () => {
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center justify-center p-8 space-y-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <XCircle className="h-10 w-10 text-red-600" />
          </div>
          
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold">Pago Cancelado</h1>
            <p className="text-muted-foreground">
              Tu pago no se completó. No te preocupes, no se realizó ningún cargo.
            </p>
          </div>

          <div className="w-full space-y-3 pt-4">
            <Button 
              onClick={handleRetry}
              className="w-full"
              size="lg"
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Intentar Nuevamente
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
            <p>Si tienes algún problema, contáctanos</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentFailurePage;
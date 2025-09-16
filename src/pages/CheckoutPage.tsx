import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckoutComponent } from '../components/CheckoutComponent';
import { CartItem } from '../types/mercadopago';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ArrowLeft, ShoppingCart } from 'lucide-react';

// Mock cart hook - reemplaza esto con tu hook real de carrito
const useCart = () => {
  const [items, setItems] = useState<CartItem[]>([
    {
      id: '1',
      title: 'Producto de ejemplo',
      price: 99.99,
      quantity: 1,
      description: 'Descripción del producto',
      image: '/placeholder-image.jpg'
    }
  ]);

  return {
    items,
    clearCart: () => setItems([]),
    removeItem: (id: string) => setItems(items.filter(item => item.id !== id)),
  };
};

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, clearCart } = useCart();

  useEffect(() => {
    // Si no hay items en el carrito, redirigir a la tienda
    if (items.length === 0) {
      navigate('/shop');
    }
  }, [items, navigate]);

  const handlePaymentSuccess = (preferenceId: string) => {
    console.log('Payment initiated with preference:', preferenceId);
    // Aquí puedes agregar lógica adicional como limpiar el carrito
    // clearCart();
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
    // Aquí puedes agregar lógica para manejar errores
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
            <ShoppingCart className="h-16 w-16 text-muted-foreground" />
            <h2 className="text-xl font-semibold">Carrito Vacío</h2>
            <p className="text-muted-foreground text-center">
              No tienes productos en tu carrito para proceder al checkout
            </p>
            <Button onClick={() => navigate('/shop')}>
              Ir a la Tienda
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Volver</span>
              </Button>
              <h1 className="text-2xl font-bold">Checkout</h1>
            </div>
            <div className="text-sm text-muted-foreground">
              {items.length} producto{items.length !== 1 ? 's' : ''} en el carrito
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Content */}
      <CheckoutComponent
        items={items}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
      />
    </div>
  );
};
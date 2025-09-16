import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckoutComponent } from '../components/CheckoutComponent';
import { CartItem as MercadoPagoCartItem } from '../types/mercadopago';
import { useCart } from '../context/CartContext';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ArrowLeft, ShoppingCart } from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { state: cartState, clearCart } = useCart();

  useEffect(() => {
    // Si no hay items en el carrito, redirigir a la tienda
    if (cartState.items.length === 0) {
      navigate('/shop');
    }
  }, [cartState.items, navigate]);

  // Convertir items del carrito al formato de MercadoPago
  const convertCartItems = (): MercadoPagoCartItem[] => {
    return cartState.items.map(item => ({
      id: item.id,
      title: item.name,
      price: item.sale_price || item.price,
      quantity: item.quantity,
      description: `${item.selectedSize ? `Talla: ${item.selectedSize}` : ''} ${item.selectedMaterial ? `Material: ${item.selectedMaterial}` : ''}`.trim() || undefined,
      image: item.image,
    }));
  };

  const handlePaymentSuccess = (preferenceId: string) => {
    console.log('Payment initiated with preference:', preferenceId);
    // Guardamos la referencia del pago para limpiar el carrito después del pago exitoso
    sessionStorage.setItem('pending_payment_preference', preferenceId);
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
    // Aquí puedes agregar lógica para manejar errores
  };

  if (cartState.items.length === 0) {
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

  const mercadoPagoItems = convertCartItems();

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
              {cartState.items.length} producto{cartState.items.length !== 1 ? 's' : ''} en el carrito
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Content */}
      <CheckoutComponent
        items={mercadoPagoItems}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
      />
    </div>
  );
};
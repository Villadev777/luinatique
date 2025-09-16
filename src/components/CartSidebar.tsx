import React from 'react';
import { useCart } from '../context/CartContext';
import useCheckout from '../hooks/useCheckout';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { ShoppingCart, Plus, Minus, Trash2, CreditCard } from 'lucide-react';

export const CartSidebar: React.FC = () => {
  const { state, updateQuantity, removeItem } = useCart();
  const { goToCheckout, formatPrice, canCheckout } = useCheckout();

  if (state.items.length === 0) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
          <ShoppingCart className="h-16 w-16 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Tu carrito está vacío</h3>
          <p className="text-muted-foreground text-center">
            Agrega productos para continuar con tu compra
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Carrito de Compras
          </span>
          <Badge variant="secondary">
            {state.items.length} {state.items.length === 1 ? 'producto' : 'productos'}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Lista de productos */}
        <div className="space-y-4 max-h-64 overflow-y-auto">
          {state.items.map((item) => (
            <div key={item.id} className="flex gap-3 p-3 border rounded-lg">
              {/* Imagen del producto */}
              <div className="flex-shrink-0">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded-md"
                />
              </div>
              
              {/* Información del producto */}
              <div className="flex-1 space-y-2">
                <div>
                  <h4 className="font-medium text-sm">{item.name}</h4>
                  {item.selectedSize && (
                    <p className="text-xs text-muted-foreground">
                      Talla: {item.selectedSize}
                    </p>
                  )}
                  {item.selectedMaterial && (
                    <p className="text-xs text-muted-foreground">
                      Material: {item.selectedMaterial}
                    </p>
                  )}
                </div>
                
                {/* Precio */}
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm">
                    {formatPrice(item.sale_price || item.price)}
                  </span>
                  
                  {/* Controles de cantidad */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="h-8 w-8 p-0"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    
                    <span className="min-w-8 text-center text-sm font-medium">
                      {item.quantity}
                    </span>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Separator />

        {/* Resumen del total */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal:</span>
            <span>{formatPrice(state.totalPrice)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Envío:</span>
            <span className="text-muted-foreground">Calculado en checkout</span>
          </div>
          <Separator />
          <div className="flex justify-between font-semibold">
            <span>Total:</span>
            <span>{formatPrice(state.totalPrice)}</span>
          </div>
        </div>

        {/* Botón de Checkout */}
        <Button 
          onClick={goToCheckout}
          disabled={!canCheckout}
          className="w-full"
          size="lg"
        >
          <CreditCard className="mr-2 h-4 w-4" />
          Proceder al Pago
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Pago seguro con MercadoPago
        </p>
      </CardContent>
    </Card>
  );
};
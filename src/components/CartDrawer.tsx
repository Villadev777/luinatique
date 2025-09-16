import React from 'react';
import { useCart } from '../context/CartContext';
import useCheckout from '../hooks/useCheckout';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { ShoppingCart, Plus, Minus, Trash2, CreditCard, X } from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const { state, updateQuantity, removeItem, closeCart } = useCart();
  const { goToCheckout, formatPrice, canCheckout } = useCheckout();

  if (!state.isOpen) {
    return null;
  }

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={closeCart}
      />
      
      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-96 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Carrito de Compras</h2>
            <Badge variant="secondary">
              {state.items.length} {state.items.length === 1 ? 'producto' : 'productos'}
            </Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={closeCart}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex flex-col h-full">
          {state.items.length === 0 ? (
            // Empty cart
            <div className="flex flex-col items-center justify-center flex-1 p-8 space-y-4">
              <ShoppingCart className="h-16 w-16 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Tu carrito está vacío</h3>
              <p className="text-muted-foreground text-center">
                Agrega productos para continuar con tu compra
              </p>
              <Button onClick={closeCart} className="mt-4">
                Continuar Comprando
              </Button>
            </div>
          ) : (
            <>
              {/* Items list */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
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

              {/* Footer con totales y checkout */}
              <div className="border-t p-4 bg-gray-50">
                <div className="space-y-2 mb-4">
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
                  onClick={() => {
                    closeCart();
                    goToCheckout();
                  }}
                  disabled={!canCheckout}
                  className="w-full"
                  size="lg"
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Proceder al Pago
                </Button>

                <p className="text-xs text-muted-foreground text-center mt-2">
                  Pago seguro con MercadoPago
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};
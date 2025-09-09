import React from 'react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ShoppingBag, Plus, Minus, Trash2, X } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface CartSidebarProps {
  children: React.ReactNode;
}

export const CartSidebar: React.FC<CartSidebarProps> = ({ children }) => {
  const { state, increaseQuantity, decreaseQuantity, removeItem, clearCart } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Shopping Cart
            {state.totalItems > 0 && (
              <Badge variant="secondary" className="ml-2">
                {state.totalItems} {state.totalItems === 1 ? 'item' : 'items'}
              </Badge>
            )}
          </SheetTitle>
          <SheetDescription>
            {state.totalItems === 0 
              ? "Your cart is empty" 
              : `${state.totalItems} ${state.totalItems === 1 ? 'item' : 'items'} in your cart`
            }
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col h-full">
          {state.items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
              <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
              <p className="text-muted-foreground mb-6">
                Discover our beautiful jewelry collections and add some items to your cart.
              </p>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto py-6">
                <div className="space-y-4">
                  {state.items.map((item) => (
                    <div key={item.id} className="flex items-start gap-4 p-4 border rounded-lg">
                      <div className="flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-md"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm leading-tight mb-1">
                          {item.name}
                        </h4>
                        
                        {item.selectedSize && (
                          <p className="text-xs text-muted-foreground mb-2">
                            Size: {item.selectedSize}
                          </p>
                        )}
                        
                        {item.selectedMaterial && (
                          <p className="text-xs text-muted-foreground mb-2">
                            Material: {item.selectedMaterial}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => decreaseQuantity(item.id)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-sm font-medium w-8 text-center">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => increaseQuantity(item.id)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-sm font-semibold">
                              {formatPrice((item.sale_price || item.price) * item.quantity)}
                            </p>
                            {item.sale_price && (
                              <p className="text-xs text-muted-foreground line-through">
                                {formatPrice(item.price * item.quantity)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-base font-semibold">Total:</span>
                  <span className="text-lg font-bold">
                    {formatPrice(state.totalPrice)}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <Button className="w-full" size="lg">
                    Proceed to Checkout
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={clearCart}
                    disabled={state.items.length === 0}
                  >
                    Clear Cart
                  </Button>
                </div>
                
                <p className="text-xs text-muted-foreground text-center">
                  Shipping and taxes calculated at checkout
                </p>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
import React from 'react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button'; 
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
import { useToast } from '@/hooks/use-toast';

interface CartSidebarProps {
  children: React.ReactNode;
}

export const CartSidebar: React.FC<CartSidebarProps> = ({ children }) => {
  const { state, increaseQuantity, decreaseQuantity, removeItem, clearCart } = useCart();
  const { toast } = useToast();
  const [promoCode, setPromoCode] = React.useState('');
  const [appliedPromo, setAppliedPromo] = React.useState<string | null>(null);
  const [discount, setDiscount] = React.useState(0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'PEN',
    }).format(price); 
  };

  const getItemPrice = (item: any) => {
    return item.sale_price || item.price;
  };

  const handleApplyPromo = () => {
    // Simulamos algunos códigos promocionales
    const promoCodes = {
      'WELCOME10': 0.10,
      'SAVE20': 0.20,
      'FIRST15': 0.15,
    };

    const discountRate = promoCodes[promoCode.toUpperCase() as keyof typeof promoCodes];
    
    if (discountRate) {
      setAppliedPromo(promoCode.toUpperCase());
      setDiscount(state.totalPrice * discountRate);
      setPromoCode('');
      toast({
        title: "Promo code applied!",
        description: `You saved ${(discountRate * 100).toFixed(0)}% on your order.`,
      });
    } else {
      toast({
        title: "Invalid promo code",
        description: "Please check your code and try again.",
        variant: "destructive",
      });
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setDiscount(0);
    toast({
      title: "Promo code removed",
      description: "The discount has been removed from your order.",
    });
  };

  const subtotal = state.totalPrice;
  const shipping = subtotal >= 50 ? 0 : 9.99;
  const tax = (subtotal - discount) * 0.18; // 8% tax
  const finalTotal = subtotal - discount + shipping + tax;
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
                              {formatPrice(getItemPrice(item) * item.quantity)}
                            </p>
                            {item.sale_price && item.sale_price < item.price && (
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

              <Separator className="my-4" />
              <div className="border-t pt-4 space-y-4">
                {/* Promo Code Section */}
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Promo Code</h4>
                  {appliedPromo ? (
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-md">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          {appliedPromo}
                        </Badge>
                        <span className="text-sm text-green-700 dark:text-green-300">
                          -{formatPrice(discount)}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRemovePromo}
                        className="h-6 w-6 p-0 text-green-700 hover:text-green-900 dark:text-green-300"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter promo code"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        className="flex-1"
                        onKeyPress={(e) => e.key === 'Enter' && handleApplyPromo()}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleApplyPromo}
                        disabled={!promoCode.trim()}
                      >
                        Apply
                      </Button>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                      <span>Discount ({appliedPromo}):</span>
                      <span>-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Shipping:</span>
                    <span>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Tax:</span>
                    <span>{formatPrice(tax)}</span>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex justify-between items-center">
                  <span className="text-base font-semibold">Total:</span>
                  <span className="text-lg font-bold">
                    {formatPrice(finalTotal)}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <Button className="w-full" size="lg">
                    Proceed to Checkout
                  </Button>
                  
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => window.location.href = '/shop'}
                  >
                    Continue Shopping
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
                  Free shipping on orders over $50
                </p>
                
                {/* Estimated delivery */}
                <div className="text-center p-3 bg-muted/50 rounded-md">
                  <p className="text-xs text-muted-foreground">
                    📦 Estimated delivery: 3-5 business days
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
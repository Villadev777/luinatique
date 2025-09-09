import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface CartIconProps {
  className?: string;
  showLabel?: boolean;
}

export const CartIcon: React.FC<CartIconProps> = ({ 
  className = "", 
  showLabel = false 
}) => {
  const { state } = useCart();

  return (
    <div className={`relative ${className}`}>
      <Button variant="ghost" size="sm" className="relative">
        <ShoppingBag className="h-4 w-4" />
        {showLabel && (
          <span className="ml-2 hidden sm:inline">
            Cart
          </span>
        )}
        {state.totalItems > 0 && (
          <Badge 
            className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs animate-pulse"
            variant="default"
          >
            {state.totalItems > 99 ? '99+' : state.totalItems}
          </Badge>
        )}
      </Button>
      
      {/* Mini preview on hover - could be expanded */}
      {state.totalItems > 0 && (
        <div className="absolute top-full right-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="bg-popover border rounded-md p-2 shadow-md min-w-[200px]">
            <p className="text-xs text-muted-foreground">
              {state.totalItems} {state.totalItems === 1 ? 'item' : 'items'} in cart
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
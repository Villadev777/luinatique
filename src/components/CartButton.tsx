import React from 'react';
import { useCart } from '../context/CartContext';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ShoppingCart } from 'lucide-react';

export const CartButton: React.FC = () => {
  const { state, toggleCart } = useCart();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleCart}
      className="relative"
    >
      <ShoppingCart className="h-5 w-5" />
      {state.totalItems > 0 && (
        <Badge 
          variant="destructive" 
          className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
        >
          {state.totalItems}
        </Badge>
      )}
      <span className="sr-only">
        Carrito con {state.totalItems} productos
      </span>
    </Button>
  );
};
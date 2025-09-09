import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Check, Plus, Minus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  name: string;
  price: number;
  sale_price?: number | null;
  images: string[] | null;
  slug: string;
  in_stock: boolean;
  sizes?: string[] | null;
  materials?: string[] | null;
}

interface QuickAddToCartProps {
  product: Product;
  className?: string;
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'sm' | 'default' | 'lg';
  showQuantityControls?: boolean;
}

export const QuickAddToCart: React.FC<QuickAddToCartProps> = ({
  product,
  className = "",
  variant = 'default',
  size = 'default',
  showQuantityControls = false
}) => {
  const { addItem, isInCart, getItemQuantity, increaseQuantity, decreaseQuantity } = useCart();
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);

  const quantity = getItemQuantity(product.id);
  const inCart = isInCart(product.id);

  const handleAddToCart = async () => {
    if (!product.in_stock) return;

    setIsAdding(true);
    
    // Simulate a small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 300));

    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      sale_price: product.sale_price,
      image: product.images && product.images.length > 0 ? product.images[0] : '/placeholder.svg',
      slug: product.slug,
    };

    addItem(cartItem);
    
    toast({
      title: inCart ? "Quantity updated" : "Added to cart",
      description: `${product.name} ${inCart ? 'quantity increased' : 'added to cart'}.`,
    });

    setIsAdding(false);
  };

  const handleIncrease = () => {
    increaseQuantity(product.id);
    toast({
      title: "Quantity updated",
      description: `${product.name} quantity increased.`,
    });
  };

  const handleDecrease = () => {
    decreaseQuantity(product.id);
    toast({
      title: "Quantity updated", 
      description: `${product.name} quantity decreased.`,
    });
  };

  if (!product.in_stock) {
    return (
      <Button 
        variant="outline" 
        size={size}
        disabled
        className={className}
      >
        Out of Stock
      </Button>
    );
  }

  if (inCart && showQuantityControls) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDecrease}
          className="h-8 w-8 p-0"
        >
          <Minus className="h-3 w-3" />
        </Button>
        
        <Badge variant="secondary" className="px-3 py-1">
          {quantity} in cart
        </Badge>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleIncrease}
          className="h-8 w-8 p-0"
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleAddToCart}
      disabled={isAdding}
      className={`flex items-center gap-2 ${className}`}
    >
      {isAdding ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
          Adding...
        </>
      ) : inCart ? (
        <>
          <Check className="h-4 w-4" />
          Add Another
          {quantity > 0 && (
            <Badge variant="secondary" className="ml-1">
              {quantity}
            </Badge>
          )}
        </>
      ) : (
        <>
          <ShoppingCart className="h-4 w-4" />
          Add to Cart
        </>
      )}
    </Button>
  );
};
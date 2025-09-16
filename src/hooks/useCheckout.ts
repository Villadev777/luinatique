import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from './use-toast';

export const useCheckout = () => {
  const navigate = useNavigate();
  const { state: cartState, clearCart } = useCart();
  const { toast } = useToast();

  const goToCheckout = () => {
    if (cartState.items.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Carrito vacío',
        description: 'Agrega productos a tu carrito antes de proceder al checkout',
      });
      return;
    }

    navigate('/checkout');
  };

  const handlePaymentSuccess = () => {
    // Limpiar el carrito después de un pago exitoso
    clearCart();
    
    toast({
      title: '¡Pago exitoso!',
      description: 'Tu pedido ha sido procesado correctamente',
    });
    
    // Redirigir a la página de órdenes o confirmación
    navigate('/orders');
  };

  const calculateTotal = () => {
    return cartState.items.reduce((total, item) => {
      const price = item.sale_price || item.price;
      return total + (price * item.quantity);
    }, 0);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(price);
  };

  return {
    goToCheckout,
    handlePaymentSuccess,
    calculateTotal,
    formatPrice,
    canCheckout: cartState.items.length > 0,
    cartItems: cartState.items,
    totalItems: cartState.totalItems,
  };
};

export default useCheckout;
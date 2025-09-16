import React from 'react';
import { CartSidebar } from '../components/CartSidebar';
import { useCart } from '../context/CartContext';
import { Button } from '../components/ui/button';

const CartPage: React.FC = () => {
  const { addItem } = useCart();

  // Función para agregar un producto de ejemplo
  const addSampleProduct = () => {
    addItem({
      id: `sample-${Date.now()}`,
      name: 'Collar Lunatique Ejemplo',
      price: 89.99,
      sale_price: 69.99,
      image: 'https://via.placeholder.com/150x150?text=Collar',
      selectedSize: 'M',
      selectedMaterial: 'Plata',
      slug: 'collar-ejemplo'
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contenido principal */}
          <div className="lg:col-span-2">
            <h1 className="text-3xl font-bold mb-6">Mi Carrito</h1>
            
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Esta es una página de ejemplo para probar el carrito de compras.
              </p>
              
              <Button onClick={addSampleProduct}>
                Agregar Producto de Ejemplo
              </Button>
            </div>
          </div>

          {/* Sidebar del carrito */}
          <div className="lg:col-span-1">
            <CartSidebar />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
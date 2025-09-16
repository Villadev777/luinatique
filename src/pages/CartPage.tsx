import React, { useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import Header from '../components/Header';
import Footer from '../components/Footer';

const CartPage: React.FC = () => {
  const { addItem, openCart } = useCart();
  const navigate = useNavigate();

  // Abrir el carrito automáticamente cuando se carga la página
  useEffect(() => {
    openCart();
  }, [openCart]);

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

  const goToShop = () => {
    navigate('/shop');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-6">Tu Carrito</h1>
          
          <div className="space-y-6">
            <p className="text-muted-foreground">
              El carrito se muestra en el panel lateral derecho. 
              Haz clic en el ícono del carrito en el header para abrirlo.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={addSampleProduct} size="lg">
                Agregar Producto de Ejemplo
              </Button>
              
              <Button variant="outline" onClick={goToShop} size="lg">
                Ir a la Tienda
              </Button>
            </div>

            <div className="mt-8 p-6 border rounded-lg bg-muted/50">
              <h2 className="text-lg font-semibold mb-2">¿Cómo usar el carrito?</h2>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Haz clic en el ícono del carrito 🛒 en el header</li>
                <li>• Agrega productos desde cualquier página de producto</li>
                <li>• El carrito se abre automáticamente al agregar productos</li>
                <li>• Haz clic en "Proceder al Pago" para completar tu compra</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CartPage;
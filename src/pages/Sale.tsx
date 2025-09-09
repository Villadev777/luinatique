import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/context/CartContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { QuickAddToCart } from '@/components/QuickAddToCart';
import { Separator } from '@/components/ui/separator';
import { Flame, Clock, Star } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  sale_price: number | null;
  images: string[] | null;
  in_stock: boolean;
  stock_quantity: number;
  featured: boolean;
  slug: string;
  created_at: string;
}

const Sale = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSaleProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .not('sale_price', 'is', null)
          .eq('in_stock', true)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching sale products:', error);
          return;
        }

        setProducts(data || []);
      } catch (error) {
        console.error('Error fetching sale products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSaleProducts();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const getDiscountPercentage = (originalPrice: number, salePrice: number) => {
    return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading sale items...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-destructive/10 to-destructive/5 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Flame className="h-8 w-8 text-destructive" />
              <Badge className="bg-destructive text-destructive-foreground text-lg px-4 py-2">
                SALE
              </Badge>
              <Flame className="h-8 w-8 text-destructive" />
            </div>
            <h1 className="font-playfair text-4xl md:text-6xl font-semibold text-foreground mb-6">
              Ofertas Especiales
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Descubre nuestras joyas más exclusivas con descuentos increíbles. 
              Ofertas por tiempo limitado en piezas seleccionadas.
            </p>
            <div className="flex items-center justify-center gap-2 mt-6">
              <Clock className="h-5 w-5 text-destructive" />
              <span className="text-destructive font-medium">¡Ofertas por tiempo limitado!</span>
            </div>
          </div>
        </section>

        {/* Products Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {products.length === 0 ? (
              <div className="text-center py-16">
                <h2 className="font-playfair text-3xl font-semibold mb-4">
                  No hay ofertas disponibles
                </h2>
                <p className="text-muted-foreground mb-8">
                  Actualmente no tenemos productos en oferta, pero pronto habrá nuevas promociones.
                </p>
                <Button onClick={() => window.location.href = '/shop'}>
                  Ver Todos los Productos
                </Button>
              </div>
            ) : (
              <>
                <div className="text-center mb-12">
                  <h2 className="font-playfair text-3xl font-semibold mb-4">
                    {products.length} Productos en Oferta
                  </h2>
                  <p className="text-muted-foreground">
                    Ahorra hasta un 50% en joyas seleccionadas
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {products.map((product) => (
                    <Card key={product.id} className="group overflow-hidden hover:shadow-lg transition-shadow duration-300">
                      <div className="relative aspect-square overflow-hidden">
                        <img
                          src={product.images && product.images.length > 0 ? product.images[0] : '/placeholder.svg'}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute top-3 left-3">
                          <Badge className="bg-destructive text-destructive-foreground">
                            -{getDiscountPercentage(product.price, product.sale_price!)}%
                          </Badge>
                        </div>
                        {product.featured && (
                          <div className="absolute top-3 right-3">
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <Star className="h-3 w-3" />
                              Featured
                            </Badge>
                          </div>
                        )}
                      </div>
                      
                      <CardContent className="p-6">
                        <h3 className="font-playfair text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                          <a href={`/product/${product.slug}`}>
                            {product.name}
                          </a>
                        </h3>
                        
                        {product.description && (
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                            {product.description}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-xl font-bold text-destructive">
                            {formatPrice(product.sale_price!)}
                          </span>
                          <span className="text-sm text-muted-foreground line-through">
                            {formatPrice(product.price)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-xs text-muted-foreground">
                            {product.stock_quantity > 10 ? (
                              <span className="text-green-600">En stock</span>
                            ) : product.stock_quantity > 0 ? (
                              <span className="text-orange-600">Solo {product.stock_quantity} disponibles</span>
                            ) : (
                              <span className="text-red-600">Agotado</span>
                            )}
                          </div>
                        </div>

                        <Separator className="my-4" />

                        <QuickAddToCart 
                          product={product} 
                          className="w-full"
                          showQuantityControls={true}
                        />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-sage/5">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="font-playfair text-3xl md:text-4xl font-semibold mb-6">
              ¿No encontraste lo que buscabas?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Explora nuestra colección completa o suscríbete para recibir notificaciones de nuevas ofertas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => window.location.href = '/shop'}>
                Ver Todos los Productos
              </Button>
              <Button size="lg" variant="outline" onClick={() => window.location.href = '/#newsletter'}>
                Suscribirse a Ofertas
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Sale;
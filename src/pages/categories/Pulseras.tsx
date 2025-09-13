import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/context/CartContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { QuickAddToCart } from '@/components/QuickAddToCart';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Heart, Star } from 'lucide-react';

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

const Pulseras = () => {
  const { subcategory } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryInfo, setCategoryInfo] = useState<{title: string; description: string} | null>(null);

  const subcategories = {
    'hombre': {
      title: 'Pulseras para Hombre',
      description: 'Pulseras masculinas con diseños robustos y elegantes, perfectas para el hombre moderno.',
    },
    'mujeres': {
      title: 'Pulseras para Mujeres',
      description: 'Pulseras femeninas delicadas y sofisticadas que complementan cualquier outfit.',
    },
    'ninas': {
      title: 'Pulseras para Niñas',
      description: 'Pulseras especialmente diseñadas para las más pequeñas, con colores vibrantes y diseños divertidos.',
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        if (subcategory) {
          // Fetch products for specific subcategory
          const currentSubcategory = subcategories[subcategory as keyof typeof subcategories];
          if (currentSubcategory) {
            setCategoryInfo(currentSubcategory);
          }

          // Get subcategory ID first
          const { data: subcategoryData, error: subcategoryError } = await supabase
            .from('subcategories')
            .select('id')
            .eq('slug', subcategory)
            .single();

          if (subcategoryError || !subcategoryData) {
            console.error('Subcategory not found:', subcategoryError);
            setProducts([]);
            return;
          }

          // Fetch products for this subcategory
          const { data: productsData, error: productsError } = await supabase
            .from('products')
            .select('*')
            .eq('subcategory_id', subcategoryData.id)
            .eq('in_stock', true)
            .order('created_at', { ascending: false });

          if (productsError) {
            console.error('Error fetching products:', productsError);
            setProducts([]);
            return;
          }

          setProducts(productsData || []);
        } else {
          // Fetch all bracelet products (category = "pulseras")
          setCategoryInfo({
            title: 'Pulseras',
            description: 'Pulseras que adornan tu muñeca con estilo. Desde diseños delicados hasta piezas statement que expresan tu personalidad.'
          });

          // Get category section ID for "pulseras"
          const { data: sectionData, error: sectionError } = await supabase
            .from('category_sections')
            .select('id')
            .eq('slug', 'pulseras')
            .single();

          if (sectionError || !sectionData) {
            console.error('Category section not found:', sectionError);
            setProducts([]);
            return;
          }

          // Get all subcategories for pulseras
          const { data: subcategoriesData, error: subcategoriesError } = await supabase
            .from('subcategories')
            .select('id')
            .eq('category_section_id', sectionData.id);

          if (subcategoriesError) {
            console.error('Error fetching subcategories:', subcategoriesError);
            setProducts([]);
            return;
          }

          const subcategoryIds = subcategoriesData?.map(sub => sub.id) || [];

          // Fetch products for all bracelet subcategories
          const { data: productsData, error: productsError } = await supabase
            .from('products')
            .select('*')
            .in('subcategory_id', subcategoryIds)
            .eq('in_stock', true)
            .order('created_at', { ascending: false });

          if (productsError) {
            console.error('Error fetching products:', productsError);
            setProducts([]);
            return;
          }

          setProducts(productsData || []);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [subcategory]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const getDiscountPercentage = (originalPrice: number, salePrice: number) => {
    return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Breadcrumb */}
        <section className="py-6 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/shop')}
                className="p-0 h-auto hover:bg-transparent"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Tienda
              </Button>
              <span>/</span>
              <span>Pulseras</span>
              {categoryInfo && subcategory && (
                <>
                  <span>/</span>
                  <span className="text-foreground font-medium">{categoryInfo.title}</span>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Hero Section */}
        <section className="py-20 bg-primary/5">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="font-playfair text-4xl md:text-6xl font-semibold text-foreground mb-6">
              {categoryInfo?.title || 'Pulseras'}
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              {categoryInfo?.description || 'Pulseras que adornan tu muñeca con estilo.'}
            </p>
          </div>
        </section>

        {/* Products Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {products.length === 0 ? (
              <div className="text-center py-16">
                <h2 className="font-playfair text-3xl font-semibold mb-4">
                  No hay productos disponibles
                </h2>
                <p className="text-muted-foreground mb-8">
                  Actualmente no tenemos pulseras en esta categoría, pero pronto habrá nuevos productos.
                </p>
                <Button onClick={() => navigate('/shop')}>
                  Ver Todos los Productos
                </Button>
              </div>
            ) : (
              <>
                <div className="text-center mb-12">
                  <h2 className="font-playfair text-3xl font-semibold mb-4">
                    {products.length} {products.length === 1 ? 'Producto' : 'Productos'} Disponibles
                  </h2>
                  <p className="text-muted-foreground">
                    Encuentra la pulsera perfecta para ti
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
                        {product.sale_price && (
                          <div className="absolute top-3 left-3">
                            <Badge className="bg-destructive text-destructive-foreground">
                              -{getDiscountPercentage(product.price, product.sale_price)}%
                            </Badge>
                          </div>
                        )}
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
                          {product.sale_price ? (
                            <>
                              <span className="text-xl font-bold text-destructive">
                                {formatPrice(product.sale_price)}
                              </span>
                              <span className="text-sm text-muted-foreground line-through">
                                {formatPrice(product.price)}
                              </span>
                            </>
                          ) : (
                            <span className="text-xl font-bold">
                              {formatPrice(product.price)}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between mb-4">
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
        <section className="py-20 bg-primary/5">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="font-playfair text-3xl md:text-4xl font-semibold mb-6">
              ¿No encontraste la pulsera perfecta?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Explora otras categorías o contáctanos para crear un diseño personalizado.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => navigate('/shop')}>
                Ver Todas las Categorías
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/contactanos')}>
                Diseño Personalizado
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Pulseras;
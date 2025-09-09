import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/context/CartContext";
import { Heart, ShoppingCart, Eye } from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  sale_price: number | null;
  images: string[];
  in_stock: boolean;
  stock_quantity: number;
  featured: boolean;
  category_id: string | null;
  sizes: string[] | null;
  materials: string[] | null;
  slug: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
}

const Shop = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("featured");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { addItem, isInCart, getItemQuantity } = useCart();

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('in_stock', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
        toast({
          title: "Error",
          description: "Failed to load products",
          variant: "destructive",
        });
        return;
      }

      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      });
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching categories:', error);
        return;
      }

      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchProducts(), fetchCategories()]);
      setLoading(false);
    };

    loadData();
  }, []);

  const filteredProducts = selectedCategory === "all" 
    ? products 
    : products.filter(product => product.category_id === selectedCategory);

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return (a.sale_price || a.price) - (b.sale_price || b.price);
      case "price-high":
        return (b.sale_price || b.price) - (a.sale_price || a.price);
      case "featured":
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return 0;
      case "newest":
      default:
        return 0; // Already sorted by created_at desc in query
    }
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const handleAddToCart = (product: Product) => {
    // Verificar si el producto ya está en el carrito
    if (isInCart(product.id)) {
      toast({
        title: "Product updated",
        description: `Added another ${product.name} to your cart.`,
      });
    } else {
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart.`,
      });
    }

    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      sale_price: product.sale_price,
      image: product.images.length > 0 ? product.images[0] : '/placeholder.svg',
      slug: product.slug,
    };

    addItem(cartItem);
  };

  const getDisplayPrice = (product: Product) => {
    return product.sale_price || product.price;
  };

  const hasDiscount = (product: Product) => {
    return product.sale_price && product.sale_price < product.price;
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="bg-sage/10 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="font-playfair text-4xl md:text-5xl font-semibold text-foreground mb-4">
              Shop Collection
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover our handcrafted jewelry pieces, each designed to capture the magic of celestial beauty.
            </p>
          </div>
        </section>

        {/* Filters */}
        <section className="py-8 border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedCategory === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory("all")}
                >
                  All Jewelry
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
              
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  {sortedProducts.length} products
                </span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading products...</p>
              </div>
            ) : sortedProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No products found</p>
                <p className="text-sm text-muted-foreground">Try adjusting your filters or check back later for new arrivals</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {sortedProducts.map((product) => (
                  <Card key={product.id} className="group cursor-pointer overflow-hidden hover:shadow-lg transition-all duration-300">
                    <div className="relative aspect-square overflow-hidden">
                      <img
                        src={product.images.length > 0 ? product.images[0] : '/placeholder.svg'}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      
                      {/* Badges */}
                      <div className="absolute top-4 left-4 flex flex-col gap-2">
                        {product.featured && (
                          <Badge className="bg-primary text-primary-foreground">
                            Featured
                          </Badge>
                        )}
                        {hasDiscount(product) && (
                          <Badge className="bg-destructive text-destructive-foreground">
                            Sale
                          </Badge>
                        )}
                      </div>

                      {/* Quick Actions */}
                      <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            // TODO: Add to favorites functionality
                          }}
                        >
                          <Heart className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            // TODO: Quick view functionality
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Stock indicator */}
                      {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
                        <div className="absolute bottom-4 left-4">
                          <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
                            Only {product.stock_quantity} left
                          </Badge>
                        </div>
                      )}
                    </div>
                    
                    <CardContent className="p-6">
                      <h3 className="font-playfair text-xl font-semibold mb-2">{product.name}</h3>
                      <p className="text-muted-foreground mb-3 line-clamp-2">
                        {product.description}
                      </p>
                      
                      <div className="flex justify-between items-end">
                        <div className="flex flex-col">
                          {hasDiscount(product) ? (
                            <>
                              <span className="text-sm line-through text-muted-foreground">
                                {formatPrice(product.price)}
                              </span>
                              <span className="text-lg font-semibold text-destructive">
                                {formatPrice(product.sale_price)}
                              </span>
                            </>
                          ) : (
                            <span className="text-lg font-semibold">{formatPrice(product.price)}</span>
                          )}
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          {isInCart(product.id) && (
                            <div className="text-xs text-center text-muted-foreground">
                              {getItemQuantity(product.id)} in cart
                            </div>
                          )}
                          <Button 
                            size="sm" 
                            disabled={!product.in_stock}
                            onClick={() => handleAddToCart(product)}
                            className="flex items-center gap-2"
                          >
                            <ShoppingCart className="h-4 w-4" />
                            {product.in_stock ? 'Add to Cart' : 'Out of Stock'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Shop;
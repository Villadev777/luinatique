import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QuickAddToCart } from '@/components/QuickAddToCart';
import { Separator } from '@/components/ui/separator';
import { Heart, ShoppingBag, Star, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FavoriteProduct {
  id: string;
  product_id: string;
  created_at: string;
  products: {
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
  };
}

const FavoritesPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  const fetchFavorites = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          *,
          products (
            id,
            name,
            description,
            price,
            sale_price,
            images,
            in_stock,
            stock_quantity,
            featured,
            slug
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching favorites:', error);
        toast({
          title: "Error",
          description: "Failed to load favorites",
          variant: "destructive",
        });
        return;
      }

      setFavorites(data || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (favoriteId: string) => {
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', favoriteId);

      if (error) {
        console.error('Error removing favorite:', error);
        toast({
          title: "Error",
          description: "Failed to remove from favorites",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Removed",
        description: "Item removed from favorites",
      });

      fetchFavorites();
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast({
        title: "Error",
        description: "Failed to remove from favorites",
        variant: "destructive",
      });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const getDiscountPercentage = (originalPrice: number, salePrice: number) => {
    return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
  };

  if (!user) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">Access Denied</h2>
            <p className="text-muted-foreground mb-6">Please sign in to view your favorites.</p>
            <Button onClick={() => window.location.href = '/'}>
              Go to Home
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading favorites...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="h-6 w-6 text-destructive" />
            <h1 className="text-3xl font-bold text-foreground">My Favorites</h1>
          </div>
          <p className="text-muted-foreground">
            {favorites.length === 0 
              ? "You haven't added any favorites yet" 
              : `${favorites.length} ${favorites.length === 1 ? 'item' : 'items'} in your favorites`
            }
          </p>
        </div>

        {favorites.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
            <h2 className="text-2xl font-semibold mb-4">No favorites yet</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Start exploring our beautiful jewelry collections and save your favorite pieces here.
            </p>
            <Button onClick={() => window.location.href = '/shop'}>
              <ShoppingBag className="h-4 w-4 mr-2" />
              Browse Products
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {favorites.map((favorite) => (
              <Card key={favorite.id} className="group overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={favorite.products.images && favorite.products.images.length > 0 
                      ? favorite.products.images[0] 
                      : '/placeholder.svg'
                    }
                    alt={favorite.products.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 h-8 w-8 p-0 bg-white/80 hover:bg-white text-destructive hover:text-destructive"
                    onClick={() => removeFavorite(favorite.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  {favorite.products.sale_price && (
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-destructive text-destructive-foreground">
                        -{getDiscountPercentage(favorite.products.price, favorite.products.sale_price)}%
                      </Badge>
                    </div>
                  )}
                  {favorite.products.featured && (
                    <div className="absolute bottom-3 left-3">
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        Featured
                      </Badge>
                    </div>
                  )}
                </div>
                
                <CardContent className="p-6">
                  <h3 className="font-playfair text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                    <a href={`/product/${favorite.products.slug}`}>
                      {favorite.products.name}
                    </a>
                  </h3>
                  
                  {favorite.products.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {favorite.products.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-2 mb-4">
                    {favorite.products.sale_price ? (
                      <>
                        <span className="text-xl font-bold text-destructive">
                          {formatPrice(favorite.products.sale_price)}
                        </span>
                        <span className="text-sm text-muted-foreground line-through">
                          {formatPrice(favorite.products.price)}
                        </span>
                      </>
                    ) : (
                      <span className="text-xl font-bold">
                        {formatPrice(favorite.products.price)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="text-xs text-muted-foreground">
                      {favorite.products.stock_quantity > 10 ? (
                        <span className="text-green-600">In Stock</span>
                      ) : favorite.products.stock_quantity > 0 ? (
                        <span className="text-orange-600">Only {favorite.products.stock_quantity} left</span>
                      ) : (
                        <span className="text-red-600">Out of Stock</span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Added {new Date(favorite.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <Separator className="my-4" />

                  <QuickAddToCart 
                    product={favorite.products} 
                    className="w-full"
                    showQuantityControls={true}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default FavoritesPage;
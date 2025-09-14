import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Heart, Share2, ShoppingCart, Truck, Shield, RotateCcw } from 'lucide-react';

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
  sizes: string[] | null;
  materials: string[] | null;
  colors: string[] | null;
  slug: string;
  created_at: string;
}

const ProductDetail = () => {
  const { productSlug } = useParams<{ productSlug: string }>();
  const navigate = useNavigate();
  const { addItem, isInCart, getItemQuantity } = useCart();
  const { toast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedMaterial, setSelectedMaterial] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productSlug) {
        navigate('/shop');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('slug', productSlug)
          .eq('in_stock', true)
          .single();

        if (error || !data) {
          console.error('Error fetching product:', error);
          toast({
            title: "Producto no encontrado",
            description: "El producto que buscas no existe o ya no está disponible.",
            variant: "destructive",
          });
          navigate('/shop');
          return;
        }

        setProduct(data);
        
        // Set default selections
        if (data.sizes && data.sizes.length > 0) {
          setSelectedSize(data.sizes[0]);
        }
        if (data.materials && data.materials.length > 0) {
          setSelectedMaterial(data.materials[0]);
        }
        if (data.colors && data.colors.length > 0) {
          setSelectedColor(data.colors[0]);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los detalles del producto.",
          variant: "destructive",
        });
        navigate('/shop');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productSlug, navigate, toast]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'PEN',
    }).format(price);
  };

  const getDisplayPrice = () => {
    if (!product) return '';
    return product.sale_price || product.price;
  };

  const hasDiscount = () => {
    if (!product) return false;
    return product.sale_price && product.sale_price < product.price;
  };

  const handleAddToCart = async () => {
    if (!product) return;

    setIsAddingToCart(true);

    // Create unique cart item key based on selections
    const cartItemKey = `${product.id}-${selectedSize}-${selectedMaterial}-${selectedColor}`;
    
    const cartItem = {
      id: cartItemKey,
      name: product.name,
      price: product.price,
      sale_price: product.sale_price,
      image: product.images && product.images.length > 0 ? product.images[0] : '/placeholder.svg',
      slug: product.slug,
      selectedSize: selectedSize || undefined,
      selectedMaterial: selectedMaterial || undefined,
      selectedColor: selectedColor || undefined,
    };

    // Add multiple quantities if needed
    for (let i = 0; i < quantity; i++) {
      addItem(cartItem);
    }

    toast({
      title: "Agregado al carrito",
      description: `${quantity} x ${product.name} agregado a tu carrito.`,
    });

    setIsAddingToCart(false);
  };

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= (product?.stock_quantity || 1)) {
      setQuantity(newQuantity);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando detalles del producto...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">Producto no encontrado</h2>
            <p className="text-muted-foreground mb-6">El producto que buscas no existe.</p>
            <Button onClick={() => navigate('/shop')}>
              Volver a la Tienda
            </Button>
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
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToShop}
            className="p-0 h-auto hover:bg-transparent"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a la Tienda
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square overflow-hidden rounded-lg bg-muted">
              <img
                src={product.images && product.images[selectedImage] ? product.images[selectedImage] : '/placeholder.svg'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnail Images */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square overflow-hidden rounded-md border-2 transition-colors ${
                      selectedImage === index
                        ? 'border-primary'
                        : 'border-transparent hover:border-muted-foreground'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            {/* Product Title and Price */}
            <div>
              <div className="flex items-start justify-between mb-2">
                <h1 className="font-playfair text-3xl md:text-4xl font-semibold">
                  {product.name}
                </h1>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-4">
                {hasDiscount() ? (
                  <>
                    <span className="text-3xl font-bold text-destructive">
                      {formatPrice(product.sale_price!)}
                    </span>
                    <span className="text-xl text-muted-foreground line-through">
                      {formatPrice(product.price)}
                    </span>
                    <Badge className="bg-destructive text-destructive-foreground">
                      Ahorra {Math.round(((product.price - product.sale_price!) / product.price) * 100)}%
                    </Badge>
                  </>
                ) : (
                  <span className="text-3xl font-bold">
                    {formatPrice(product.price)}
                  </span>
                )}
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2 mb-4">
                {product.stock_quantity > 10 ? (
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    En Stock
                  </Badge>
                ) : product.stock_quantity > 0 ? (
                  <Badge variant="outline" className="text-orange-600 border-orange-600">
                    Solo quedan {product.stock_quantity}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-red-600 border-red-600">
                    Agotado
                  </Badge>
                )}
                
                {product.featured && (
                  <Badge className="bg-primary text-primary-foreground">
                    Destacado
                  </Badge>
                )}
              </div>
            </div>

            <Separator />

            {/* Product Description */}
            {product.description && (
              <div>
                <h3 className="font-semibold mb-2">Descripción</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Talla</h3>
                <Select value={selectedSize} onValueChange={setSelectedSize}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona una talla" />
                  </SelectTrigger>
                  <SelectContent>
                    {product.sizes.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Material Selection */}
            {product.materials && product.materials.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Material</h3>
                <Select value={selectedMaterial} onValueChange={setSelectedMaterial}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona un material" />
                  </SelectTrigger>
                  <SelectContent>
                    {product.materials.map((material) => (
                      <SelectItem key={material} value={material}>
                        {material}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Color</h3>
                <Select value={selectedColor} onValueChange={setSelectedColor}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona un color" />
                  </SelectTrigger>
                  <SelectContent>
                    {product.colors.map((color) => (
                      <SelectItem key={color} value={color}>
                        {color}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Quantity Selection */}
            <div>
              <h3 className="font-semibold mb-3">Cantidad</h3>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                >
                  -
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= (product.stock_quantity || 1)}
                >
                  +
                </Button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <div className="space-y-4">
              <Button
                size="lg"
                className="w-full"
                onClick={handleAddToCart}
                disabled={!product.in_stock || isAddingToCart}
              >
                {isAddingToCart ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                    Agregando al Carrito...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {product.in_stock ? 'Agregar al Carrito' : 'Agotado'}
                  </>
                )}
              </Button>

              {isInCart(product.id) && (
                <p className="text-sm text-center text-muted-foreground">
                  {getItemQuantity(product.id)} artículo(s) ya en el carrito
                </p>
              )}
            </div>

            <Separator />

            {/* Product Features */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Truck className="h-5 w-5 text-muted-foreground" />
                <span>Envío gratis en pedidos mayores a S/ 150</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <span>Garantía de por vida incluida</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <RotateCcw className="h-5 w-5 text-muted-foreground" />
                <span>Política de cambios de 7 días</span>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Package, 
  Calendar, 
  CreditCard, 
  Truck, 
  CheckCircle, 
  Clock,
  AlertCircle,
  ShoppingBag
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  selected_size: string | null;
  products: {
    name: string;
    images: string[] | null;
    slug: string;
  };
}

interface Order {
  id: string;
  status: string;
  total_amount: number;
  payment_status: string | null;
  payment_method: string | null;
  created_at: string;
  updated_at: string;
  order_items: OrderItem[];
}

const OrdersPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            quantity,
            price,
            selected_size,
            products (
              name,
              images,
              slug
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        toast({
          title: "Error",
          description: "Failed to load orders",
          variant: "destructive",
        });
        return;
      }

      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
  const formatted = new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
  return `S/ ${formatted}`;
};

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'processing':
        return <Package className="h-4 w-4" />;
      case 'shipped':
        return <Truck className="h-4 w-4" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPaymentStatusColor = (status: string | null) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'refunded':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">Access Denied</h2>
            <p className="text-muted-foreground mb-6">Please sign in to view your orders.</p>
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
            <p className="text-muted-foreground">Loading orders...</p>
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
            <Package className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">My Orders</h1>
          </div>
          <p className="text-muted-foreground">
            {orders.length === 0 
              ? "You haven't placed any orders yet" 
              : `${orders.length} ${orders.length === 1 ? 'order' : 'orders'} found`
            }
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
            <h2 className="text-2xl font-semibold mb-4">No orders yet</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Start exploring our beautiful jewelry collections and place your first order.
            </p>
            <Button onClick={() => window.location.href = '/shop'}>
              <ShoppingBag className="h-4 w-4 mr-2" />
              Start Shopping
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        Order #{order.id.substring(0, 8)}
                        <Badge className={`${getStatusColor(order.status)} border`}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(order.status)}
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </div>
                        </Badge>
                      </CardTitle>
                      <CardDescription className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(order.created_at)}
                        </div>
                        {order.payment_status && (
                          <Badge variant="outline" className={getPaymentStatusColor(order.payment_status)}>
                            <CreditCard className="h-3 w-3 mr-1" />
                            {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                          </Badge>
                        )}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">
                        {formatPrice(order.total_amount)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {order.order_items.reduce((sum, item) => sum + item.quantity, 0)} items
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {order.order_items.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                        <div className="flex-shrink-0">
                          <img
                            src={item.products.images && item.products.images.length > 0 
                              ? item.products.images[0] 
                              : '/placeholder.svg'
                            }
                            alt={item.products.name}
                            className="w-16 h-16 object-cover rounded-md"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">
                            <a 
                              href={`/product/${item.products.slug}`}
                              className="hover:text-primary transition-colors"
                            >
                              {item.products.name}
                            </a>
                          </h4>
                          {item.selected_size && (
                            <p className="text-sm text-muted-foreground">
                              Size: {item.selected_size}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-sm">Qty: {item.quantity}</span>
                            <span className="text-sm font-medium">
                              {formatPrice(item.price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-6" />

                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                      {order.payment_method && (
                        <span>Payment: {order.payment_method}</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      {order.status === 'delivered' && (
                        <Button variant="outline" size="sm">
                          Reorder
                        </Button>
                      )}
                    </div>
                  </div>
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

export default OrdersPage;
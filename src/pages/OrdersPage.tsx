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
  unit_price: number;
  subtotal: number;
  selected_size: string | null;
  selected_material: string | null;
  selected_color: string | null;
  product_name: string;
  product_image: string | null;
  product_sku: string | null;
  product_id: string;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  total: number;
  subtotal: number;
  shipping_cost: number;
  tax: number;
  currency: string;
  payment_status: string;
  payment_method: string;
  customer_email: string;
  customer_name: string;
  created_at: string;
  updated_at: string;
  paid_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
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
      console.log('📦 Fetching orders for user:', user.email);
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            quantity,
            unit_price,
            subtotal,
            selected_size,
            selected_material,
            selected_color,
            product_name,
            product_image,
            product_sku,
            product_id
          )
        `)
        .eq('customer_email', user.email)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching orders:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar las órdenes",
          variant: "destructive",
        });
        return;
      }

      console.log('✅ Orders fetched successfully:', data?.length || 0);
      setOrders(data || []);
    } catch (error) {
      console.error('❌ Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Ocurrió un error al cargar las órdenes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number, currency: string = 'PEN') => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: currency === 'USD' ? 'USD' : 'PEN',
    }).format(price);
  }; 

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
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

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Pendiente',
      processing: 'Procesando',
      shipped: 'Enviado',
      delivered: 'Entregado',
      cancelled: 'Cancelado',
    };
    return labels[status] || status;
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected':
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'refunded':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPaymentStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Pendiente',
      approved: 'Aprobado',
      paid: 'Pagado',
      rejected: 'Rechazado',
      failed: 'Fallido',
      refunded: 'Reembolsado',
    };
    return labels[status] || status;
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      mercadopago: 'MercadoPago',
      paypal: 'PayPal',
      cash: 'Efectivo',
      transfer: 'Transferencia',
    };
    return labels[method] || method;
  };

  if (!user) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">Acceso Denegado</h2>
            <p className="text-muted-foreground mb-6">Por favor inicia sesión para ver tus órdenes.</p>
            <Button onClick={() => window.location.href = '/'}>
              Ir al Inicio
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
            <p className="text-muted-foreground">Cargando órdenes...</p>
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
            <h1 className="text-3xl font-bold text-foreground">Mis Pedidos</h1>
          </div>
          <p className="text-muted-foreground">
            {orders.length === 0 
              ? "Aún no has realizado ningún pedido" 
              : `${orders.length} ${orders.length === 1 ? 'pedido encontrado' : 'pedidos encontrados'}`
            }
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
            <h2 className="text-2xl font-semibold mb-4">Aún no tienes pedidos</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Comienza a explorar nuestras hermosas colecciones de joyería y realiza tu primer pedido.
            </p>
            <Button onClick={() => window.location.href = '/shop'}>
              <ShoppingBag className="h-4 w-4 mr-2" />
              Comenzar a Comprar
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <CardTitle className="flex items-center gap-2 flex-wrap">
                        Pedido #{order.order_number}
                        <Badge className={`${getStatusColor(order.status)} border`}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(order.status)}
                            {getStatusLabel(order.status)}
                          </div>
                        </Badge>
                      </CardTitle>
                      <CardDescription className="flex items-center gap-4 mt-2 flex-wrap">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(order.created_at)}
                        </div>
                        {order.payment_status && (
                          <Badge variant="outline" className={getPaymentStatusColor(order.payment_status)}>
                            <CreditCard className="h-3 w-3 mr-1" />
                            {getPaymentStatusLabel(order.payment_status)}
                          </Badge>
                        )}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">
                        {formatPrice(order.total, order.currency)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {order.order_items.reduce((sum, item) => sum + item.quantity, 0)} productos
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
                            src={item.product_image || '/placeholder.svg'}
                            alt={item.product_name}
                            className="w-16 h-16 object-cover rounded-md"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">
                            {item.product_name}
                          </h4>
                          {item.selected_size && (
                            <p className="text-sm text-muted-foreground">
                              Talla: {item.selected_size}
                            </p>
                          )}
                          {item.selected_material && (
                            <p className="text-sm text-muted-foreground">
                              Material: {item.selected_material}
                            </p>
                          )}
                          {item.selected_color && (
                            <p className="text-sm text-muted-foreground">
                              Color: {item.selected_color}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-sm">Cantidad: {item.quantity}</span>
                            <span className="text-sm">
                              {formatPrice(item.unit_price, order.currency)} c/u
                            </span>
                            <span className="text-sm font-medium">
                              {formatPrice(item.subtotal, order.currency)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-6" />

                  {/* Order Summary */}
                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal:</span>
                      <span>{formatPrice(order.subtotal, order.currency)}</span>
                    </div>
                    {order.shipping_cost > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Envío:</span>
                        <span>{formatPrice(order.shipping_cost, order.currency)}</span>
                      </div>
                    )}
                    {order.tax > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Impuestos:</span>
                        <span>{formatPrice(order.tax, order.currency)}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-bold">
                      <span>Total:</span>
                      <span>{formatPrice(order.total, order.currency)}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                      {order.payment_method && (
                        <span>Método de pago: {getPaymentMethodLabel(order.payment_method)}</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          // TODO: Implementar vista de detalles
                          toast({
                            title: "Próximamente",
                            description: "La vista de detalles estará disponible pronto",
                          });
                        }}
                      >
                        Ver Detalles
                      </Button>
                      {order.status === 'delivered' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            // TODO: Implementar reorden
                            toast({
                              title: "Próximamente",
                              description: "La función de reordenar estará disponible pronto",
                            });
                          }}
                        >
                          Reordenar
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
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Package, 
  Eye, 
  Search,
  Filter,
  Download,
  Calendar,
  CreditCard,
  MapPin,
  User,
  Phone,
  Mail
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface OrderItem {
  id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  product_name: string;
  product_image: string | null;
  selected_size: string | null;
  selected_material: string | null;
  selected_color: string | null;
}

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  status: string;
  payment_status: string;
  payment_method: string;
  payment_id: string | null;
  total: number;
  subtotal: number;
  shipping_cost: number;
  tax: number;
  currency: string;
  shipping_street: string | null;
  shipping_city: string | null;
  shipping_state: string | null;
  shipping_country: string | null;
  shipping_zip_code: string | null;
  created_at: string;
  paid_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  notes: string | null;
  order_items: OrderItem[];
}

export const OrderManagement = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { toast } = useToast();

  const fetchOrders = async () => {
    try {
      console.log('📦 Fetching all orders...');
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            quantity,
            unit_price,
            subtotal,
            product_name,
            product_image,
            selected_size,
            selected_material,
            selected_color
          )
        `)
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

      console.log('✅ Orders fetched:', data?.length || 0);
      setOrders(data || []);
      setFilteredOrders(data || []);
    } catch (error) {
      console.error('❌ Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    let filtered = orders;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(order =>
        order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer_email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  }, [searchQuery, statusFilter, orders]);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      const updateData: any = { status: newStatus };
      
      if (newStatus === 'shipped' && !orders.find(o => o.id === orderId)?.shipped_at) {
        updateData.shipped_at = new Date().toISOString();
      }
      if (newStatus === 'delivered' && !orders.find(o => o.id === orderId)?.delivered_at) {
        updateData.delivered_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);

      if (error) {
        console.error('Error updating order status:', error);
        toast({
          title: "Error",
          description: "No se pudo actualizar el estado",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Éxito",
        description: "Estado actualizado correctamente",
      });

      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: currency === 'USD' ? 'USD' : 'PEN',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      approved: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const exportToCSV = () => {
    const csv = [
      ['Order Number', 'Customer', 'Email', 'Status', 'Payment Status', 'Total', 'Date'].join(','),
      ...filteredOrders.map(order => [
        order.order_number,
        order.customer_name,
        order.customer_email,
        order.status,
        order.payment_status,
        order.total,
        formatDate(order.created_at)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Order Management</CardTitle>
          <CardDescription>Loading orders...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Order Management</CardTitle>
              <CardDescription>
                Manage all customer orders ({orders.length} total)
              </CardDescription>
            </div>
            <Button onClick={exportToCSV} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by order number, customer name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Orders Table */}
          {filteredOrders.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No orders found</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">#{order.order_number}</div>
                          <div className="text-sm text-muted-foreground">
                            {order.order_items.length} items
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{order.customer_name}</div>
                          <div className="text-sm text-muted-foreground">
                            {order.customer_email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={order.status}
                          onValueChange={(value) => handleStatusUpdate(order.id, value)}
                        >
                          <SelectTrigger className="w-[130px]">
                            <SelectValue>
                              <Badge className={getStatusColor(order.status)}>
                                {order.status}
                              </Badge>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="shipped">Shipped</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPaymentStatusColor(order.payment_status)}>
                          {order.payment_status}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatPrice(order.total, order.currency)}
                      </TableCell>
                      <TableCell>{formatDate(order.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedOrder(order)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Order Details - #{order.order_number}</DialogTitle>
                              <DialogDescription>
                                Complete order information and items
                              </DialogDescription>
                            </DialogHeader>
                            
                            {selectedOrder && (
                              <div className="space-y-6">
                                {/* Customer Info */}
                                <div className="grid grid-cols-2 gap-4">
                                  <Card>
                                    <CardHeader className="pb-3">
                                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        Customer Information
                                      </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2 text-sm">
                                      <div>
                                        <span className="text-muted-foreground">Name:</span>
                                        <p className="font-medium">{selectedOrder.customer_name}</p>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Mail className="h-3 w-3 text-muted-foreground" />
                                        <span className="text-muted-foreground">Email:</span>
                                        <p>{selectedOrder.customer_email}</p>
                                      </div>
                                      {selectedOrder.customer_phone && (
                                        <div className="flex items-center gap-2">
                                          <Phone className="h-3 w-3 text-muted-foreground" />
                                          <span className="text-muted-foreground">Phone:</span>
                                          <p>{selectedOrder.customer_phone}</p>
                                        </div>
                                      )}
                                    </CardContent>
                                  </Card>

                                  <Card>
                                    <CardHeader className="pb-3">
                                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                                        <MapPin className="h-4 w-4" />
                                        Shipping Address
                                      </CardTitle>
                                    </CardHeader>
                                    <CardContent className="text-sm">
                                      <p>{selectedOrder.shipping_street}</p>
                                      <p>{selectedOrder.shipping_city}, {selectedOrder.shipping_state}</p>
                                      <p>{selectedOrder.shipping_zip_code}</p>
                                      <p>{selectedOrder.shipping_country}</p>
                                    </CardContent>
                                  </Card>
                                </div>

                                {/* Payment Info */}
                                <Card>
                                  <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                                      <CreditCard className="h-4 w-4" />
                                      Payment Information
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Method:</span>
                                      <span className="font-medium capitalize">{selectedOrder.payment_method}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Payment ID:</span>
                                      <span className="font-mono text-xs">{selectedOrder.payment_id}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Status:</span>
                                      <Badge className={getPaymentStatusColor(selectedOrder.payment_status)}>
                                        {selectedOrder.payment_status}
                                      </Badge>
                                    </div>
                                  </CardContent>
                                </Card>

                                {/* Order Items */}
                                <Card>
                                  <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium">Order Items</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="space-y-3">
                                      {selectedOrder.order_items.map((item) => (
                                        <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
                                          <img
                                            src={item.product_image || '/placeholder.svg'}
                                            alt={item.product_name}
                                            className="w-16 h-16 object-cover rounded"
                                          />
                                          <div className="flex-1">
                                            <p className="font-medium">{item.product_name}</p>
                                            {item.selected_size && (
                                              <p className="text-sm text-muted-foreground">Size: {item.selected_size}</p>
                                            )}
                                            <p className="text-sm">
                                              {item.quantity} x {formatPrice(item.unit_price, selectedOrder.currency)}
                                            </p>
                                          </div>
                                          <div className="text-right font-medium">
                                            {formatPrice(item.subtotal, selectedOrder.currency)}
                                          </div>
                                        </div>
                                      ))}
                                    </div>

                                    {/* Order Summary */}
                                    <div className="mt-4 space-y-2 pt-4 border-t">
                                      <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Subtotal:</span>
                                        <span>{formatPrice(selectedOrder.subtotal, selectedOrder.currency)}</span>
                                      </div>
                                      {selectedOrder.shipping_cost > 0 && (
                                        <div className="flex justify-between text-sm">
                                          <span className="text-muted-foreground">Shipping:</span>
                                          <span>{formatPrice(selectedOrder.shipping_cost, selectedOrder.currency)}</span>
                                        </div>
                                      )}
                                      {selectedOrder.tax > 0 && (
                                        <div className="flex justify-between text-sm">
                                          <span className="text-muted-foreground">Tax:</span>
                                          <span>{formatPrice(selectedOrder.tax, selectedOrder.currency)}</span>
                                        </div>
                                      )}
                                      <div className="flex justify-between font-bold text-lg pt-2 border-t">
                                        <span>Total:</span>
                                        <span>{formatPrice(selectedOrder.total, selectedOrder.currency)}</span>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>

                                {/* Timeline */}
                                <Card>
                                  <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                                      <Calendar className="h-4 w-4" />
                                      Order Timeline
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Created:</span>
                                      <span>{formatDate(selectedOrder.created_at)}</span>
                                    </div>
                                    {selectedOrder.paid_at && (
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Paid:</span>
                                        <span>{formatDate(selectedOrder.paid_at)}</span>
                                      </div>
                                    )}
                                    {selectedOrder.shipped_at && (
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Shipped:</span>
                                        <span>{formatDate(selectedOrder.shipped_at)}</span>
                                      </div>
                                    )}
                                    {selectedOrder.delivered_at && (
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Delivered:</span>
                                        <span>{formatDate(selectedOrder.delivered_at)}</span>
                                      </div>
                                    )}
                                  </CardContent>
                                </Card>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
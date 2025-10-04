import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip as RechartsTooltip
} from 'recharts';
import { 
  TrendingUp, 
  Package, 
  Users, 
  ShoppingCart, 
  DollarSign,
  Star,
  AlertTriangle
} from 'lucide-react';

interface AnalyticsData {
  totalProducts: number;
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  featuredProducts: number;
  outOfStockProducts: number;
  lowStockProducts: number;
  categoryDistribution: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  recentActivity: Array<{
    type: string;
    description: string;
    timestamp: string;
  }>;
}

export const Analytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      console.log('📊 Fetching analytics data...');
      
      // Fetch products data
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*');

      if (productsError) {
        console.error('❌ Error fetching products:', productsError);
      }

      // Fetch users data - simplificado sin user_roles
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('id, user_id, created_at');

      if (usersError) {
        console.error('❌ Error fetching users:', usersError);
      }

      // Fetch orders data - FIXED: Usar 'total' en lugar de 'total_amount'
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id, total, currency, status, payment_status, created_at');

      if (ordersError) {
        console.error('❌ Error fetching orders:', ordersError);
      }

      console.log('📦 Orders fetched:', orders?.length || 0);
      console.log('💰 Orders data:', orders);

      // Fetch category sections for distribution
      const { data: sections, error: sectionsError } = await supabase
        .from('category_sections')
        .select(`
          name,
          subcategories(
            products(id)
          )
        `);

      if (sectionsError) {
        console.error('❌ Error fetching sections:', sectionsError);
      }

      // Calculate analytics
      const totalProducts = products?.length || 0;
      const totalUsers = users?.length || 0;
      const totalOrders = orders?.length || 0;
      
      // FIXED: Calcular revenue correctamente desde la columna 'total'
      const totalRevenue = orders?.reduce((sum, order) => {
        // Asegurarse de que total es un número
        const orderTotal = typeof order.total === 'number' ? order.total : parseFloat(order.total) || 0;
        return sum + orderTotal;
      }, 0) || 0;

      console.log('💵 Total Revenue calculated:', totalRevenue);
      
      const featuredProducts = products?.filter(p => p.featured).length || 0;
      const outOfStockProducts = products?.filter(p => !p.in_stock).length || 0;
      const lowStockProducts = products?.filter(p => p.in_stock && p.stock_quantity < 5).length || 0;

      // Category distribution
      const colors = ['#8B7355', '#A8C090', '#F4E4BC', '#E8B4B8', '#B8A8C8', '#C8D4B8'];
      const categoryDistribution = sections?.map((section: any, index: number) => ({
        name: section.name.toUpperCase(),
        value: section.subcategories?.reduce((sum: number, sub: any) => sum + (sub.products?.length || 0), 0) || 0,
        color: colors[index % colors.length]
      })).filter((cat: any) => cat.value > 0) || []; // Solo mostrar categorías con productos

      console.log('📊 Category distribution:', categoryDistribution);

      // Recent activity (últimas 3 actividades reales)
      const recentActivity = [];
      
      // Últimos productos agregados
      if (products && products.length > 0) {
        const sortedProducts = [...products].sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        if (sortedProducts[0]) {
          recentActivity.push({
            type: 'product',
            description: 'New product added to catalog',
            timestamp: sortedProducts[0].created_at
          });
        }
      }

      // Últimos usuarios registrados
      if (users && users.length > 0) {
        const sortedUsers = [...users].sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        if (sortedUsers[0]) {
          recentActivity.push({
            type: 'user',
            description: 'New user registered',
            timestamp: sortedUsers[0].created_at
          });
        }
      }

      // Últimas órdenes completadas
      if (orders && orders.length > 0) {
        const sortedOrders = [...orders].sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        if (sortedOrders[0]) {
          recentActivity.push({
            type: 'order',
            description: 'Order completed successfully',
            timestamp: sortedOrders[0].created_at
          });
        }
      }

      setAnalytics({
        totalProducts,
        totalUsers,
        totalOrders,
        totalRevenue,
        featuredProducts,
        outOfStockProducts,
        lowStockProducts,
        categoryDistribution,
        recentActivity
      });
      
      console.log('✅ Analytics data loaded successfully');
    } catch (error) {
      console.error('❌ Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Custom label para el PIE chart
  const renderCustomLabel = (entry: any) => {
    return `${entry.name}: ${entry.value}`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analytics</CardTitle>
          <CardDescription>Loading analytics...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analytics</CardTitle>
          <CardDescription>Failed to load analytics data</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const statsCards = [
    {
      title: 'Total Products',
      value: analytics.totalProducts,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Total Users',
      value: analytics.totalUsers,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Total Orders',
      value: analytics.totalOrders,
      icon: ShoppingCart,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(analytics.totalRevenue),
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    }
  ];

  const alertCards = [
    {
      title: 'Featured Products',
      value: analytics.featuredProducts,
      icon: Star,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Out of Stock',
      value: analytics.outOfStockProducts,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Low Stock',
      value: analytics.lowStockProducts,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {alertCards.map((alert, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {alert.title}
                  </p>
                  <p className="text-xl font-bold">
                    {alert.value}
                  </p>
                </div>
                <div className={`p-2 rounded-lg ${alert.bgColor}`}>
                  <alert.icon className={`h-5 w-5 ${alert.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution - FIXED PIE CHART */}
        <Card>
          <CardHeader>
            <CardTitle>Products by Category</CardTitle>
            <CardDescription>Distribution of products across categories</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.categoryDistribution.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No products in categories yet
              </div>
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.categoryDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analytics.categoryDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      formatter={(value: any) => [`${value} products`, 'Count']}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      formatter={(value, entry: any) => `${value}: ${entry.payload.value}`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest system activities</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.recentActivity.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No recent activity
              </div>
            ) : (
              <div className="space-y-4">
                {analytics.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="p-2 bg-primary/10 rounded-full">
                      {activity.type === 'product' && <Package className="h-4 w-4 text-primary" />}
                      {activity.type === 'user' && <Users className="h-4 w-4 text-primary" />}
                      {activity.type === 'order' && <ShoppingCart className="h-4 w-4 text-primary" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(activity.timestamp)}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {activity.type}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
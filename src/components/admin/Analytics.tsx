import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
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
      // Fetch products data
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*');

      if (productsError) {
        console.error('Error fetching products:', productsError);
        return;
      }

      // Fetch users data
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('*');

      if (usersError) {
        console.error('Error fetching users:', usersError);
        return;
      }

      // Fetch orders data
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*');

      if (ordersError) {
        console.error('Error fetching orders:', ordersError);
        return;
      }

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
        console.error('Error fetching sections:', sectionsError);
        return;
      }

      // Calculate analytics
      const totalProducts = products?.length || 0;
      const totalUsers = users?.length || 0;
      const totalOrders = orders?.length || 0;
      const totalRevenue = orders?.reduce((sum, order) => sum + order.total_amount, 0) || 0;
      const featuredProducts = products?.filter(p => p.featured).length || 0;
      const outOfStockProducts = products?.filter(p => !p.in_stock).length || 0;
      const lowStockProducts = products?.filter(p => p.in_stock && p.stock_quantity < 5).length || 0;

      // Category distribution
      const colors = ['#8B7355', '#A8C090', '#F4E4BC', '#E8B4B8', '#B8A8C8', '#C8D4B8'];
      const categoryDistribution = sections?.map((section, index) => ({
        name: section.name,
        value: section.subcategories?.reduce((sum, sub) => sum + (sub.products?.length || 0), 0) || 0,
        color: colors[index % colors.length]
      })) || [];

      // Recent activity (simulated)
      const recentActivity = [
        {
          type: 'product',
          description: 'New product added to catalog',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString()
        },
        {
          type: 'user',
          description: 'New user registered',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
        },
        {
          type: 'order',
          description: 'Order completed successfully',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString()
        }
      ];

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
    } catch (error) {
      console.error('Error fetching analytics:', error);
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
    return new Date(dateString).toLocaleDateString();
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
        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Products by Category</CardTitle>
            <CardDescription>Distribution of products across categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.categoryDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analytics.categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest system activities</CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
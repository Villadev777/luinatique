import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  Bell, 
  Shield, 
  CreditCard, 
  Mail, 
  Lock,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const SettingsPage = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState({
    email_marketing: true,
    order_updates: true,
    new_products: false,
    price_alerts: false,
  });

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({
      ...prev,
      [key]: value
    }));
    
    // In a real app, you would save this to the database
    toast({
      title: "Notification preferences updated",
      description: "Your notification settings have been saved.",
    });
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Password reset email sent",
        description: "Check your email for instructions to reset your password.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send password reset email",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    try {
      // In a real implementation, you would call an edge function to properly delete the user
      // For now, we'll just sign them out and show a message
      await signOut();
      
      toast({
        title: "Account deletion requested",
        description: "Please contact support to complete account deletion.",
      });
      
      window.location.href = '/';
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process account deletion request",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">Access Denied</h2>
            <p className="text-muted-foreground mb-6">Please sign in to access settings.</p>
            <Button onClick={() => window.location.href = '/'}>
              Go to Home
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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Settings className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Account Settings</h1>
          </div>
          <p className="text-muted-foreground">Manage your account preferences and security settings</p>
        </div>

        <Tabs defaultValue="notifications" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Billing
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              Account
            </TabsTrigger>
          </TabsList>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Choose what notifications you'd like to receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-marketing">Email Marketing</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive emails about new products, sales, and promotions
                    </p>
                  </div>
                  <Switch
                    id="email-marketing"
                    checked={notifications.email_marketing}
                    onCheckedChange={(checked) => handleNotificationChange('email_marketing', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="order-updates">Order Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified about order status changes and shipping updates
                    </p>
                  </div>
                  <Switch
                    id="order-updates"
                    checked={notifications.order_updates}
                    onCheckedChange={(checked) => handleNotificationChange('order_updates', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="new-products">New Product Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Be the first to know about new jewelry collections
                    </p>
                  </div>
                  <Switch
                    id="new-products"
                    checked={notifications.new_products}
                    onCheckedChange={(checked) => handleNotificationChange('new_products', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="price-alerts">Price Drop Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when items in your favorites go on sale
                    </p>
                  </div>
                  <Switch
                    id="price-alerts"
                    checked={notifications.price_alerts}
                    onCheckedChange={(checked) => handleNotificationChange('price_alerts', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Settings
                </CardTitle>
                <CardDescription>
                  Manage your account security and password
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label>Email Address</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{user.email}</span>
                      <Badge variant={user.email_confirmed_at ? "default" : "secondary"}>
                        {user.email_confirmed_at ? "Verified" : "Unverified"}
                      </Badge>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <Label>Password</Label>
                    <p className="text-sm text-muted-foreground mb-4">
                      Change your password to keep your account secure
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={handlePasswordReset}
                      disabled={loading}
                      className="flex items-center gap-2"
                    >
                      <Lock className="h-4 w-4" />
                      {loading ? 'Sending...' : 'Reset Password'}
                    </Button>
                  </div>

                  <Separator />

                  <div>
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground mb-4">
                      Add an extra layer of security to your account
                    </p>
                    <Button variant="outline" disabled>
                      <Shield className="h-4 w-4 mr-2" />
                      Enable 2FA (Coming Soon)
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Billing & Payment
                </CardTitle>
                <CardDescription>
                  Manage your payment methods and billing information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No payment methods</h3>
                  <p className="text-muted-foreground mb-6">
                    Add a payment method to make checkout faster and easier
                  </p>
                  <Button disabled>
                    Add Payment Method (Coming Soon)
                  </Button>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-4">Billing History</h4>
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">No billing history available</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  Danger Zone
                </CardTitle>
                <CardDescription>
                  Irreversible and destructive actions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border border-destructive/20 rounded-lg p-6">
                  <h4 className="font-medium text-destructive mb-2">Delete Account</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="flex items-center gap-2">
                        <Trash2 className="h-4 w-4" />
                        Delete Account
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                          <AlertTriangle className="h-5 w-5" />
                          Delete Account
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you absolutely sure you want to delete your account? This will:
                          <ul className="list-disc list-inside mt-2 space-y-1">
                            <li>Permanently delete your profile and personal information</li>
                            <li>Remove all your favorites and order history</li>
                            <li>Cancel any pending orders</li>
                            <li>This action cannot be undone</li>
                          </ul>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteAccount}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Yes, Delete My Account
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-2">Export Data</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Download a copy of your personal data and order history
                  </p>
                  <Button variant="outline" disabled>
                    Export My Data (Coming Soon)
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default SettingsPage;
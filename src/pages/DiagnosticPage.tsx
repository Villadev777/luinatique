import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, Globe, Database } from 'lucide-react';

const DiagnosticPage: React.FC = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const isLocalhost = window.location.hostname === 'localhost';
  const currentUrl = window.location.origin;

  const checks = [
    {
      name: 'Environment',
      status: isLocalhost ? 'development' : 'production',
      icon: Globe,
      details: `Running on: ${currentUrl}`
    },
    {
      name: 'Supabase URL',
      status: supabaseUrl ? 'configured' : 'missing',
      icon: Database,
      details: supabaseUrl || 'Not configured'
    },
    {
      name: 'Supabase Anon Key',
      status: anonKey ? 'configured' : 'missing',
      icon: Database,
      details: anonKey ? `${anonKey.substring(0, 20)}...` : 'Not configured'
    },
    {
      name: 'Production Configuration',
      status: !isLocalhost && supabaseUrl && !supabaseUrl.includes('localhost') ? 'valid' : 'invalid',
      icon: CheckCircle,
      details: 'Checking production environment setup'
    }
  ];

  const testSupabaseConnection = async () => {
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        headers: {
          'apikey': anonKey,
          'Authorization': `Bearer ${anonKey}`
        }
      });
      
      console.log('Supabase connection test:', response.status);
      alert(`Supabase connection: ${response.ok ? 'SUCCESS' : 'FAILED'} (${response.status})`);
    } catch (error) {
      console.error('Supabase connection error:', error);
      alert(`Connection failed: ${error}`);
    }
  };

  const testEdgeFunction = async () => {
    try {
      const testData = {
        items: [{
          id: 'test',
          title: 'Test Product',
          quantity: 1,
          currency_id: 'PEN',
          unit_price: 100
        }],
        payer: {
          email: 'test@example.com',
          name: 'Test User'
        },
        back_urls: {
          success: `${currentUrl}/payment/success`,
          failure: `${currentUrl}/payment/failure`,
          pending: `${currentUrl}/payment/pending`,
        }
      };

      const response = await fetch(`${supabaseUrl}/functions/v1/mercadopago-create-preference`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${anonKey}`,
        },
        body: JSON.stringify(testData),
      });

      console.log('Edge Function test:', response.status);
      const result = await response.text();
      console.log('Edge Function response:', result);
      
      alert(`Edge Function test: ${response.ok ? 'SUCCESS' : 'FAILED'} (${response.status})\nResponse: ${result.substring(0, 200)}...`);
    } catch (error) {
      console.error('Edge Function test error:', error);
      alert(`Edge Function failed: ${error}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'configured':
      case 'valid':
      case 'production':
        return 'text-green-600';
      case 'development':
        return 'text-blue-600';
      case 'missing':
      case 'invalid':
        return 'text-red-600';
      default:
        return 'text-yellow-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'configured':
      case 'valid':
      case 'production':
        return CheckCircle;
      case 'missing':
      case 'invalid':
        return XCircle;
      default:
        return AlertCircle;
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Configuration Diagnostic</h1>
          <p className="text-muted-foreground">
            Verify your Supabase and MercadoPago configuration
          </p>
        </div>

        <div className="grid gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Environment Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {checks.map((check) => {
                  const Icon = getStatusIcon(check.status);
                  return (
                    <div key={check.name} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Icon className={`h-5 w-5 ${getStatusColor(check.status)}`} />
                        <div>
                          <h3 className="font-medium">{check.name}</h3>
                          <p className="text-sm text-muted-foreground">{check.details}</p>
                        </div>
                      </div>
                      <Badge variant={check.status === 'configured' || check.status === 'valid' || check.status === 'production' ? 'default' : 'destructive'}>
                        {check.status}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Connection Tests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button onClick={testSupabaseConnection} className="w-full" disabled={!supabaseUrl || !anonKey}>
                  Test Supabase Connection
                </Button>
                
                <Button onClick={testEdgeFunction} variant="outline" className="w-full" disabled={!supabaseUrl || !anonKey}>
                  Test MercadoPago Edge Function
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Configuration Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Configuration Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2">For Netlify Production:</h4>
                  <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                    <li>Go to Netlify Dashboard → Site settings → Environment variables</li>
                    <li>Add: <code>VITE_SUPABASE_URL = https://lunatique.supabase.co</code></li>
                    <li>Add: <code>VITE_SUPABASE_ANON_KEY = your_anon_key</code></li>
                    <li>Redeploy your site</li>
                  </ol>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">To get your Anon Key:</h4>
                  <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                    <li>Go to Supabase Dashboard → Project Settings → API</li>
                    <li>Copy the <strong>anon/public</strong> key (NOT service_role)</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DiagnosticPage;
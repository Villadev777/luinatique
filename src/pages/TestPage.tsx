import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';

interface TestResult {
  name: string;
  status: 'loading' | 'success' | 'error' | 'idle';
  message: string;
  details?: any;
}

const TestPage: React.FC = () => {
  const [tests, setTests] = useState<TestResult[]>([
    { name: 'Supabase Connection', status: 'idle', message: 'Not tested' },
    { name: 'MercadoPago Create Preference', status: 'idle', message: 'Not tested' },
    { name: 'Environment Variables', status: 'idle', message: 'Not tested' }
  ]);

  const updateTest = (index: number, result: Partial<TestResult>) => {
    setTests(prev => prev.map((test, i) => i === index ? { ...test, ...result } : test));
  };

  const testSupabaseConnection = async () => {
    updateTest(0, { status: 'loading', message: 'Testing connection...' });
    
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !anonKey) {
        throw new Error('Missing environment variables');
      }

      // Test basic connection
      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        headers: {
          'apikey': anonKey,
          'Authorization': `Bearer ${anonKey}`
        }
      });

      if (response.ok) {
        updateTest(0, { 
          status: 'success', 
          message: 'Connection successful',
          details: { url: supabaseUrl }
        });
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      updateTest(0, { 
        status: 'error', 
        message: error instanceof Error ? error.message : 'Connection failed'
      });
    }
  };

  const testMercadoPagoFunction = async () => {
    updateTest(1, { status: 'loading', message: 'Testing Edge Function...' });
    
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !anonKey) {
        throw new Error('Missing environment variables');
      }

      const testPreference = {
        items: [{
          id: 'test-item',
          title: 'Test Product',
          quantity: 1,
          currency_id: 'PEN',
          unit_price: 100,
          description: 'Test product for Edge Function',
        }],
        payer: {
          email: 'test@example.com',
          name: 'Test User'
        },
        back_urls: {
          success: `${window.location.origin}/payment/success`,
          failure: `${window.location.origin}/payment/failure`,
          pending: `${window.location.origin}/payment/pending`,
        },
        auto_return: 'approved'
      };

      console.log('Testing with URL:', `${supabaseUrl}/functions/v1/mercadopago-create-preference`);
      console.log('Using auth header:', `Bearer ${anonKey.substring(0, 10)}...`);

      const response = await fetch(`${supabaseUrl}/functions/v1/mercadopago-create-preference`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${anonKey}`,
        },
        body: JSON.stringify(testPreference),
      });

      console.log('Response status:', response.status);
      const responseText = await response.text();
      console.log('Response text:', responseText);

      if (response.ok) {
        const data = JSON.parse(responseText);
        updateTest(1, { 
          status: 'success', 
          message: 'Edge Function working!',
          details: { 
            preferenceId: data.id,
            initPoint: data.sandbox_init_point 
          }
        });
      } else {
        throw new Error(`HTTP ${response.status}: ${responseText}`);
      }
    } catch (error) {
      console.error('Edge Function test error:', error);
      updateTest(1, { 
        status: 'error', 
        message: error instanceof Error ? error.message : 'Function test failed'
      });
    }
  };

  const testEnvironmentVariables = () => {
    updateTest(2, { status: 'loading', message: 'Checking variables...' });
    
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    const issues: string[] = [];
    
    if (!supabaseUrl) issues.push('VITE_SUPABASE_URL missing');
    if (!anonKey) issues.push('VITE_SUPABASE_ANON_KEY missing');
    if (supabaseUrl && !supabaseUrl.includes('supabase.co')) {
      issues.push('Invalid Supabase URL format');
    }
    
    if (issues.length === 0) {
      updateTest(2, { 
        status: 'success', 
        message: 'All variables configured',
        details: { 
          url: supabaseUrl,
          keyLength: anonKey?.length 
        }
      });
    } else {
      updateTest(2, { 
        status: 'error', 
        message: `Issues: ${issues.join(', ')}`
      });
    }
  };

  const runAllTests = async () => {
    testEnvironmentVariables();
    await testSupabaseConnection();
    await testMercadoPagoFunction();
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    const variants = {
      loading: 'default',
      success: 'default',
      error: 'destructive',
      idle: 'secondary'
    } as const;

    const labels = {
      loading: 'Testing...',
      success: 'Passed',
      error: 'Failed',
      idle: 'Pending'
    };

    return (
      <Badge variant={variants[status]} className={
        status === 'success' ? 'bg-green-100 text-green-800 border-green-300' : ''
      }>
        {labels[status]}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">System Tests</h1>
          <p className="text-muted-foreground">
            Test your Supabase and MercadoPago integration
          </p>
        </div>

        <div className="grid gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Configuration Status</span>
                <Button onClick={runAllTests} className="ml-4">
                  Run All Tests
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tests.map((test, index) => (
                  <div key={test.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(test.status)}
                      <div>
                        <h3 className="font-medium">{test.name}</h3>
                        <p className="text-sm text-muted-foreground">{test.message}</p>
                        {test.details && (
                          <pre className="text-xs bg-muted p-2 rounded mt-2 max-w-md overflow-auto">
                            {JSON.stringify(test.details, null, 2)}
                          </pre>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(test.status)}
                      {test.status === 'idle' && index === 0 && (
                        <Button variant="outline" size="sm" onClick={testSupabaseConnection}>
                          Test
                        </Button>
                      )}
                      {test.status === 'idle' && index === 1 && (
                        <Button variant="outline" size="sm" onClick={testMercadoPagoFunction}>
                          Test
                        </Button>
                      )}
                      {test.status === 'idle' && index === 2 && (
                        <Button variant="outline" size="sm" onClick={testEnvironmentVariables}>
                          Test
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Environment Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Supabase URL:</strong><br />
                  <code className="text-xs bg-muted p-1 rounded">
                    {import.meta.env.VITE_SUPABASE_URL || 'Not configured'}
                  </code>
                </div>
                <div>
                  <strong>Anon Key:</strong><br />
                  <code className="text-xs bg-muted p-1 rounded">
                    {import.meta.env.VITE_SUPABASE_ANON_KEY 
                      ? `${import.meta.env.VITE_SUPABASE_ANON_KEY.substring(0, 20)}...` 
                      : 'Not configured'}
                  </code>
                </div>
                <div>
                  <strong>Environment:</strong><br />
                  <code className="text-xs bg-muted p-1 rounded">
                    {import.meta.env.MODE}
                  </code>
                </div>
                <div>
                  <strong>Base URL:</strong><br />
                  <code className="text-xs bg-muted p-1 rounded">
                    {window.location.origin}
                  </code>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TestPage;
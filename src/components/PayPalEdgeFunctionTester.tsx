import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { CheckCircle, XCircle, AlertCircle, Loader2, Play } from 'lucide-react';

interface EdgeFunctionTest {
  name: string;
  endpoint: string;
  status: 'pending' | 'success' | 'error' | 'testing';
  response?: any;
  error?: string;
}

const PayPalEdgeFunctionTester: React.FC = () => {
  const [tests, setTests] = useState<EdgeFunctionTest[]>([
    {
      name: 'PayPal Create Order',
      endpoint: '/functions/v1/paypal-create-order',
      status: 'pending'
    },
    {
      name: 'PayPal Capture Order',
      endpoint: '/functions/v1/paypal-capture-order',
      status: 'pending'
    }
  ]);

  const updateTestStatus = (index: number, status: EdgeFunctionTest['status'], response?: any, error?: string) => {
    setTests(prev => prev.map((test, i) => 
      i === index ? { ...test, status, response, error } : test
    ));
  };

  const testEdgeFunction = async (index: number) => {
    const test = tests[index];
    updateTestStatus(index, 'testing');

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !anonKey) {
        updateTestStatus(index, 'error', null, 'Variables de Supabase no configuradas');
        return;
      }

      console.log(`🧪 Testing ${test.name} at ${supabaseUrl}${test.endpoint}`);

      // Test with OPTIONS first (CORS preflight)
      const optionsResponse = await fetch(`${supabaseUrl}${test.endpoint}`, {
        method: 'OPTIONS',
        headers: {
          'Authorization': `Bearer ${anonKey}`,
          'Content-Type': 'application/json',
          'Origin': window.location.origin
        }
      });

      console.log(`OPTIONS Response for ${test.name}:`, {
        status: optionsResponse.status,
        headers: Object.fromEntries(optionsResponse.headers.entries())
      });

      // Test with POST (actual call)
      const postResponse = await fetch(`${supabaseUrl}${test.endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${anonKey}`,
          'Content-Type': 'application/json',
          'Origin': window.location.origin
        },
        body: JSON.stringify({
          test: true,
          purpose: 'diagnostic'
        })
      });

      const responseText = await postResponse.text();
      let responseData;
      
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = responseText;
      }

      console.log(`POST Response for ${test.name}:`, {
        status: postResponse.status,
        statusText: postResponse.statusText,
        data: responseData
      });

      if (optionsResponse.ok || postResponse.ok || postResponse.status < 500) {
        updateTestStatus(index, 'success', {
          options: {
            status: optionsResponse.status,
            headers: Object.fromEntries(optionsResponse.headers.entries())
          },
          post: {
            status: postResponse.status,
            statusText: postResponse.statusText,
            data: responseData
          }
        });
      } else {
        updateTestStatus(index, 'error', {
          options: optionsResponse.status,
          post: postResponse.status,
          data: responseData
        }, `HTTP ${postResponse.status}: ${postResponse.statusText}`);
      }

    } catch (error) {
      console.error(`Error testing ${test.name}:`, error);
      updateTestStatus(index, 'error', null, error instanceof Error ? error.message : 'Error desconocido');
    }
  };

  const testAllFunctions = async () => {
    for (let i = 0; i < tests.length; i++) {
      await testEdgeFunction(i);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait between tests
    }
  };

  const getStatusIcon = (status: EdgeFunctionTest['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'testing':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      default:
        return <div className="h-4 w-4 rounded-full bg-gray-300" />;
    }
  };

  const getStatusBadge = (status: EdgeFunctionTest['status']) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Funcionando</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'testing':
        return <Badge variant="outline">Probando...</Badge>;
      default:
        return <Badge variant="secondary">Pendiente</Badge>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🅿️ Tester de Edge Functions PayPal
          </CardTitle>
          <p className="text-muted-foreground">
            Diagnóstico específico para las Edge Functions de PayPal en Supabase
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-6">
            <Button onClick={testAllFunctions} className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              Probar Todas las Funciones
            </Button>
          </div>

          <div className="space-y-4">
            {tests.map((test, index) => (
              <Card key={test.name} className="border-l-4 border-l-blue-500">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div>
                        <h3 className="font-semibold">{test.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Endpoint: {test.endpoint}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {getStatusIcon(test.status)}
                      {getStatusBadge(test.status)}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => testEdgeFunction(index)}
                        disabled={test.status === 'testing'}
                      >
                        <Play className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {test.error && (
                    <div className="mt-3 p-3 bg-red-50 rounded text-sm text-red-700">
                      <strong>Error:</strong> {test.error}
                    </div>
                  )}

                  {test.response && (
                    <div className="mt-3">
                      <details className="group">
                        <summary className="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-800">
                          Ver Detalles de Respuesta
                        </summary>
                        <div className="mt-2 p-3 bg-muted rounded text-xs">
                          <pre className="whitespace-pre-wrap overflow-x-auto">
                            {JSON.stringify(test.response, null, 2)}
                          </pre>
                        </div>
                      </details>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded">
            <h4 className="font-semibold text-blue-900 mb-2">Información de Debug:</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p><strong>Supabase URL:</strong> {import.meta.env.VITE_SUPABASE_URL}</p>
              <p><strong>Has Anon Key:</strong> {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅' : '❌'}</p>
              <p><strong>Origin:</strong> {window.location.origin}</p>
              <p><strong>Timestamp:</strong> {new Date().toISOString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PayPalEdgeFunctionTester;
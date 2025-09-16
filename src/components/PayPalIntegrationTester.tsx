import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  CheckCircle, 
  XCircle, 
  Loader2, 
  PlayCircle,
  Database,
  CreditCard,
  Globe
} from 'lucide-react';

interface TestResult {
  name: string;
  status: 'idle' | 'running' | 'success' | 'error';
  message?: string;
  duration?: number;
}

const PayPalIntegrationTester: React.FC = () => {
  const [tests, setTests] = useState<TestResult[]>([
    { name: 'Configuración de Variables de Entorno', status: 'idle' },
    { name: 'Conexión a Edge Functions', status: 'idle' },
    { name: 'Creación de Orden PayPal', status: 'idle' },
    { name: 'Conexión a Base de Datos', status: 'idle' },
    { name: 'SDK de PayPal', status: 'idle' },
  ]);

  const updateTest = (index: number, update: Partial<TestResult>) => {
    setTests(prev => prev.map((test, i) => 
      i === index ? { ...test, ...update } : test
    ));
  };

  const runTest = async (index: number) => {
    const startTime = Date.now();
    updateTest(index, { status: 'running', message: 'Ejecutando...' });

    try {
      switch (index) {
        case 0:
          await testEnvironmentVariables();
          break;
        case 1:
          await testEdgeFunctionsConnection();
          break;
        case 2:
          await testPayPalOrderCreation();
          break;
        case 3:
          await testDatabaseConnection();
          break;
        case 4:
          await testPayPalSDK();
          break;
      }

      const duration = Date.now() - startTime;
      updateTest(index, { 
        status: 'success', 
        message: 'Test completado exitosamente',
        duration 
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      updateTest(index, { 
        status: 'error', 
        message: error instanceof Error ? error.message : 'Error desconocido',
        duration 
      });
    }
  };

  const testEnvironmentVariables = async () => {
    const requiredVars = [
      'VITE_SUPABASE_URL',
      'VITE_SUPABASE_ANON_KEY',
      'VITE_PAYPAL_CLIENT_ID',
      'VITE_PAYPAL_MODE'
    ];

    const missing = requiredVars.filter(varName => !import.meta.env[varName]);
    
    if (missing.length > 0) {
      throw new Error(`Variables faltantes: ${missing.join(', ')}`);
    }

    // Validate values
    if (!import.meta.env.VITE_SUPABASE_URL.includes('supabase.co')) {
      throw new Error('VITE_SUPABASE_URL no es válida');
    }

    if (!import.meta.env.VITE_PAYPAL_CLIENT_ID.startsWith('A')) {
      throw new Error('VITE_PAYPAL_CLIENT_ID no parece válido');
    }
  };

  const testEdgeFunctionsConnection = async () => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const functionsUrl = `${supabaseUrl}/functions/v1`;

    // Test health endpoint or simple function
    const response = await fetch(`${functionsUrl}/paypal-create-order`, {
      method: 'OPTIONS',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Edge Functions no responden: ${response.status}`);
    }
  };

  const testPayPalOrderCreation = async () => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const functionsUrl = `${supabaseUrl}/functions/v1`;

    const testOrder = {
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'USD',
          value: '10.00'
        },
        items: [{
          name: 'Test Product',
          unit_amount: {
            currency_code: 'USD',
            value: '10.00'
          },
          quantity: '1'
        }]
      }],
      customer_email: 'test@example.com',
      customer_name: 'Test Customer'
    };

    const response = await fetch(`${functionsUrl}/paypal-create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(testOrder),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Error creando orden: ${error}`);
    }

    const result = await response.json();
    if (!result.id) {
      throw new Error('La orden no se creó correctamente');
    }
  };

  const testDatabaseConnection = async () => {
    // Since we can't directly test the database from frontend,
    // we'll check if the Supabase client can be initialized
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY
      );

      // Try a simple query to test connection
      const { error } = await supabase.from('orders').select('count').limit(1);
      
      if (error) {
        throw new Error(`Error de base de datos: ${error.message}`);
      }
    } catch (error) {
      throw new Error('No se puede conectar a Supabase');
    }
  };

  const testPayPalSDK = async () => {
    return new Promise<void>((resolve, reject) => {
      // Check if PayPal SDK can be loaded
      if (window.paypal) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${import.meta.env.VITE_PAYPAL_CLIENT_ID}&currency=USD`;
      
      script.onload = () => {
        if (window.paypal) {
          resolve();
        } else {
          reject(new Error('PayPal SDK no se cargó correctamente'));
        }
      };
      
      script.onerror = () => {
        reject(new Error('Error cargando PayPal SDK'));
      };

      document.head.appendChild(script);
    });
  };

  const runAllTests = async () => {
    for (let i = 0; i < tests.length; i++) {
      await runTest(i);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'running':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <div className="h-4 w-4 rounded-full border-2 border-gray-300" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    switch (status) {
      case 'running':
        return <Badge variant="outline" className="text-blue-600">Ejecutando</Badge>;
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Exitoso</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="secondary">Pendiente</Badge>;
    }
  };

  const allTestsComplete = tests.every(test => test.status === 'success' || test.status === 'error');
  const hasErrors = tests.some(test => test.status === 'error');

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                PayPal Integration Tester
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Verifica que la integración de PayPal esté configurada correctamente
              </p>
            </div>
            <Button 
              onClick={runAllTests}
              disabled={tests.some(test => test.status === 'running')}
              className="flex items-center gap-2"
            >
              <PlayCircle className="h-4 w-4" />
              Ejecutar Todos
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tests.map((test, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(test.status)}
                  <div>
                    <h4 className="font-medium">{test.name}</h4>
                    {test.message && (
                      <p className={`text-sm mt-1 ${
                        test.status === 'error' ? 'text-red-600' : 'text-muted-foreground'
                      }`}>
                        {test.message}
                      </p>
                    )}
                    {test.duration && (
                      <p className="text-xs text-muted-foreground">
                        Duración: {test.duration}ms
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(test.status)}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => runTest(index)}
                    disabled={test.status === 'running'}
                  >
                    {test.status === 'running' ? 'Ejecutando...' : 'Ejecutar'}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {allTestsComplete && (
            <div className="mt-6 p-4 rounded-lg border">
              {hasErrors ? (
                <div className="flex items-center gap-2 text-red-600">
                  <XCircle className="h-5 w-5" />
                  <span className="font-medium">
                    Algunos tests fallaron. Revisa la configuración.
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">
                    ¡Todos los tests pasaron! PayPal está listo para usar.
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Información de Configuración</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p><strong>Supabase URL:</strong> {import.meta.env.VITE_SUPABASE_URL || 'No configurado'}</p>
              <p><strong>PayPal Client ID:</strong> {import.meta.env.VITE_PAYPAL_CLIENT_ID ? `${import.meta.env.VITE_PAYPAL_CLIENT_ID.substring(0, 10)}...` : 'No configurado'}</p>
              <p><strong>PayPal Mode:</strong> {import.meta.env.VITE_PAYPAL_MODE || 'No configurado'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PayPalIntegrationTester;
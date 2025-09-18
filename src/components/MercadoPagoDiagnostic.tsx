import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { CheckCircle, XCircle, AlertCircle, Loader2, Play, Eye } from 'lucide-react';
import { mercadoPagoService } from '../lib/mercadopago';
import { CheckoutData } from '../types/mercadopago';

interface DiagnosticResult {
  status: 'success' | 'error' | 'warning' | 'pending';
  message: string;
  details?: any;
}

interface DiagnosticTest {
  id: string;
  name: string;
  description: string;
  result?: DiagnosticResult;
  running?: boolean;
}

const MercadoPagoDiagnostic: React.FC = () => {
  const [tests, setTests] = useState<DiagnosticTest[]>([
    {
      id: 'env-check',
      name: 'Variables de Entorno',
      description: 'Verificar que todas las variables estén configuradas'
    },
    {
      id: 'supabase-connection',
      name: 'Conexión a Supabase',
      description: 'Verificar conectividad con Supabase'
    },
    {
      id: 'edge-functions',
      name: 'Edge Functions',
      description: 'Verificar que las Edge Functions respondan'
    },
    {
      id: 'preference-creation',
      name: 'Creación de Preferencia',
      description: 'Probar creación de preferencia con datos de test'
    },
    {
      id: 'full-flow',
      name: 'Flujo Completo',
      description: 'Simular flujo completo de checkout'
    }
  ]);

  const [showDetails, setShowDetails] = useState<string | null>(null);

  const updateTestResult = (testId: string, result: DiagnosticResult) => {
    setTests(prev => prev.map(test => 
      test.id === testId 
        ? { ...test, result, running: false }
        : test
    ));
  };

  const setTestRunning = (testId: string, running: boolean) => {
    setTests(prev => prev.map(test => 
      test.id === testId 
        ? { ...test, running }
        : test
    ));
  };

  const testEnvironmentVariables = async () => {
    setTestRunning('env-check', true);
    
    try {
      const requiredVars = {
        'VITE_SUPABASE_URL': import.meta.env.VITE_SUPABASE_URL,
        'VITE_SUPABASE_ANON_KEY': import.meta.env.VITE_SUPABASE_ANON_KEY,
      };

      const missingVars = Object.entries(requiredVars)
        .filter(([key, value]) => !value)
        .map(([key]) => key);

      if (missingVars.length > 0) {
        updateTestResult('env-check', {
          status: 'error',
          message: `Variables faltantes: ${missingVars.join(', ')}`,
          details: requiredVars
        });
        return;
      }

      // Check environment details
      const envDetails = {
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
        hasAnonKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
        currentHost: window.location.hostname,
        isLocalhost: window.location.hostname === 'localhost',
        protocol: window.location.protocol
      };

      updateTestResult('env-check', {
        status: 'success',
        message: 'Todas las variables están configuradas',
        details: envDetails
      });

    } catch (error) {
      updateTestResult('env-check', {
        status: 'error',
        message: `Error verificando variables: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        details: error
      });
    }
  };

  const testSupabaseConnection = async () => {
    setTestRunning('supabase-connection', true);
    
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !anonKey) {
        updateTestResult('supabase-connection', {
          status: 'error',
          message: 'Variables de Supabase no configuradas'
        });
        return;
      }

      // Test basic connection
      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        headers: {
          'apikey': anonKey,
          'Authorization': `Bearer ${anonKey}`
        }
      });

      if (response.ok) {
        updateTestResult('supabase-connection', {
          status: 'success',
          message: 'Conexión a Supabase exitosa',
          details: {
            url: supabaseUrl,
            status: response.status
          }
        });
      } else {
        updateTestResult('supabase-connection', {
          status: 'error',
          message: `Error de conexión: ${response.status} ${response.statusText}`,
          details: {
            status: response.status,
            statusText: response.statusText
          }
        });
      }

    } catch (error) {
      updateTestResult('supabase-connection', {
        status: 'error',
        message: `Error de red: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        details: error
      });
    }
  };

  const testEdgeFunctions = async () => {
    setTestRunning('edge-functions', true);
    
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !anonKey) {
        updateTestResult('edge-functions', {
          status: 'error',
          message: 'Variables de Supabase no configuradas'
        });
        return;
      }

      // Test edge function availability with a minimal request
      const response = await fetch(`${supabaseUrl}/functions/v1/mercadopago-create-preference`, {
        method: 'OPTIONS', // Use OPTIONS to test without creating actual preference
        headers: {
          'Authorization': `Bearer ${anonKey}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Edge function test response:', {
        status: response.status,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (response.ok || response.status === 404) {
        updateTestResult('edge-functions', {
          status: 'success',
          message: 'Edge Functions están disponibles',
          details: {
            status: response.status,
            headers: Object.fromEntries(response.headers.entries())
          }
        });
      } else {
        updateTestResult('edge-functions', {
          status: 'warning',
          message: `Edge Function responde pero con status: ${response.status}`,
          details: {
            status: response.status,
            statusText: response.statusText
          }
        });
      }

    } catch (error) {
      updateTestResult('edge-functions', {
        status: 'error',
        message: `Error probando Edge Functions: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        details: error
      });
    }
  };

  const testPreferenceCreation = async () => {
    setTestRunning('preference-creation', true);
    
    try {
      const testData: CheckoutData = {
        items: [
          {
            id: 'test-product-1',
            title: 'Producto de Prueba - Diagnóstico',
            quantity: 1,
            price: 10.50,
            description: 'Producto de prueba para diagnóstico de MercadoPago',
            image: 'https://via.placeholder.com/150'
          }
        ],
        customer: {
          email: 'test_user_123456@testuser.com',
          name: 'Usuario de Prueba Diagnóstico',
          phone: '+51987654321'
        },
        shippingAddress: {
          street: 'Av. Test',
          number: '123',
          zipCode: '15001',
          city: 'Lima',
          state: 'Lima'
        }
      };

      console.log('Testing preference creation with data:', testData);

      const preference = await mercadoPagoService.createPreference(testData);
      
      console.log('Preference created successfully:', preference);

      updateTestResult('preference-creation', {
        status: 'success',
        message: 'Preferencia creada exitosamente',
        details: {
          id: preference.id,
          hasInitPoint: !!preference.init_point,
          hasSandboxPoint: !!preference.sandbox_init_point,
          external_reference: preference.external_reference
        }
      });

    } catch (error) {
      console.error('Error creating test preference:', error);
      
      updateTestResult('preference-creation', {
        status: 'error',
        message: `Error creando preferencia: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        details: error
      });
    }
  };

  const testFullFlow = async () => {
    setTestRunning('full-flow', true);
    
    try {
      // First create a preference
      const testData: CheckoutData = {
        items: [
          {
            id: 'flow-test-1',
            title: 'Test Flujo Completo',
            quantity: 2,
            price: 25.99
          }
        ],
        customer: {
          email: 'fullflow_test@testuser.com',
          name: 'Full Flow Test User'
        }
      };

      const preference = await mercadoPagoService.createPreference(testData);
      
      // Calculate totals
      const total = mercadoPagoService.calculateTotal(testData.items);
      const formattedPrice = mercadoPagoService.formatPrice(total);

      updateTestResult('full-flow', {
        status: 'success',
        message: 'Flujo completo validado exitosamente',
        details: {
          preference_id: preference.id,
          total: total,
          formatted_price: formattedPrice,
          redirect_urls: {
            sandbox: preference.sandbox_init_point,
            production: preference.init_point
          },
          can_redirect: !!(preference.sandbox_init_point || preference.init_point)
        }
      });

    } catch (error) {
      updateTestResult('full-flow', {
        status: 'error',
        message: `Error en flujo completo: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        details: error
      });
    }
  };

  const runTest = (testId: string) => {
    switch (testId) {
      case 'env-check':
        testEnvironmentVariables();
        break;
      case 'supabase-connection':
        testSupabaseConnection();
        break;
      case 'edge-functions':
        testEdgeFunctions();
        break;
      case 'preference-creation':
        testPreferenceCreation();
        break;
      case 'full-flow':
        testFullFlow();
        break;
    }
  };

  const runAllTests = async () => {
    for (const test of tests) {
      await new Promise(resolve => setTimeout(resolve, 500)); // Delay between tests
      runTest(test.id);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for test to complete
    }
  };

  const getStatusIcon = (status?: DiagnosticResult['status'], running?: boolean) => {
    if (running) return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
    
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <div className="h-4 w-4 rounded-full bg-gray-300" />;
    }
  };

  const getStatusBadge = (status?: DiagnosticResult['status'], running?: boolean) => {
    if (running) return <Badge variant="outline">Ejecutando...</Badge>;
    
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Exitoso</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800">Advertencia</Badge>;
      default:
        return <Badge variant="secondary">Pendiente</Badge>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔍 Diagnóstico de Integración MercadoPago
          </CardTitle>
          <p className="text-muted-foreground">
            Esta herramienta verificará todos los componentes de la integración con MercadoPago
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-6">
            <Button onClick={runAllTests} className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              Ejecutar Todas las Pruebas
            </Button>
          </div>

          <div className="space-y-4">
            {tests.map((test, index) => (
              <Card key={test.id} className="border-l-4 border-l-transparent data-[status=success]:border-l-green-500 data-[status=error]:border-l-red-500 data-[status=warning]:border-l-yellow-500" data-status={test.result?.status}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-semibold">{test.name}</h3>
                        <p className="text-sm text-muted-foreground">{test.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {getStatusIcon(test.result?.status, test.running)}
                      {getStatusBadge(test.result?.status, test.running)}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => runTest(test.id)}
                        disabled={test.running}
                      >
                        <Play className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {test.result && (
                    <div className="mt-3 pl-11">
                      <p className={`text-sm ${
                        test.result.status === 'success' ? 'text-green-700' :
                        test.result.status === 'error' ? 'text-red-700' :
                        test.result.status === 'warning' ? 'text-yellow-700' :
                        'text-gray-700'
                      }`}>
                        {test.result.message}
                      </p>

                      {test.result.details && (
                        <div className="mt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowDetails(showDetails === test.id ? null : test.id)}
                            className="flex items-center gap-1 text-xs"
                          >
                            <Eye className="h-3 w-3" />
                            {showDetails === test.id ? 'Ocultar' : 'Ver'} Detalles
                          </Button>
                          
                          {showDetails === test.id && (
                            <div className="mt-2 p-3 bg-muted rounded text-xs">
                              <pre className="whitespace-pre-wrap overflow-x-auto">
                                {JSON.stringify(test.result.details, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <Separator className="my-6" />

          <div className="text-sm text-muted-foreground space-y-2">
            <h4 className="font-semibold text-foreground">Información sobre las pruebas:</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li><strong>Variables de Entorno:</strong> Verifica que VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY estén configuradas</li>
              <li><strong>Conexión a Supabase:</strong> Prueba la conectividad básica con tu instancia de Supabase</li>
              <li><strong>Edge Functions:</strong> Verifica que las funciones de MercadoPago estén desplegadas y respondan</li>
              <li><strong>Creación de Preferencia:</strong> Intenta crear una preferencia de pago real con datos de prueba</li>
              <li><strong>Flujo Completo:</strong> Simula todo el proceso de checkout hasta obtener URLs de pago</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MercadoPagoDiagnostic;
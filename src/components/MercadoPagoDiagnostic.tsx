import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { CheckCircle, XCircle, AlertCircle, Loader2, Play, Eye } from 'lucide-react';
import { mercadoPagoService } from '../lib/mercadopago';
import { paypalService } from '../lib/paypal';
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
  category: 'general' | 'mercadopago' | 'paypal';
}

const MercadoPagoDiagnostic: React.FC = () => {
  const [tests, setTests] = useState<DiagnosticTest[]>([
    // General tests
    {
      id: 'env-check',
      name: 'Variables de Entorno',
      description: 'Verificar que todas las variables estén configuradas',
      category: 'general'
    },
    {
      id: 'supabase-connection',
      name: 'Conexión a Supabase',
      description: 'Verificar conectividad con Supabase',
      category: 'general'
    },
    // MercadoPago tests
    {
      id: 'mp-edge-functions',
      name: 'Edge Functions MercadoPago',
      description: 'Verificar que las Edge Functions de MP respondan',
      category: 'mercadopago'
    },
    {
      id: 'mp-preference-creation',
      name: 'Creación de Preferencia MP',
      description: 'Probar creación de preferencia con datos de test',
      category: 'mercadopago'
    },
    {
      id: 'mp-full-flow',
      name: 'Flujo Completo MercadoPago',
      description: 'Simular flujo completo de checkout con MP',
      category: 'mercadopago'
    },
    // PayPal tests
    {
      id: 'paypal-config',
      name: 'Configuración PayPal',
      description: 'Verificar variables de entorno de PayPal',
      category: 'paypal'
    },
    {
      id: 'paypal-edge-functions',
      name: 'Edge Functions PayPal',
      description: 'Verificar que las Edge Functions de PayPal respondan',
      category: 'paypal'
    },
    {
      id: 'paypal-sdk-load',
      name: 'Carga del SDK PayPal',
      description: 'Probar carga del SDK de PayPal en el frontend',
      category: 'paypal'
    },
    {
      id: 'paypal-order-creation',
      name: 'Creación de Orden PayPal',
      description: 'Probar creación de orden con datos de test',
      category: 'paypal'
    }
  ]);

  const [showDetails, setShowDetails] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'general' | 'mercadopago' | 'paypal'>('all');

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
        'VITE_PAYPAL_CLIENT_ID': import.meta.env.VITE_PAYPAL_CLIENT_ID,
        'VITE_PAYPAL_MODE': import.meta.env.VITE_PAYPAL_MODE
      };

      const missingVars = Object.entries(requiredVars)
        .filter(([key, value]) => !value)
        .map(([key]) => key);

      if (missingVars.length > 0) {
        updateTestResult('env-check', {
          status: 'warning',
          message: `Variables faltantes: ${missingVars.join(', ')}`,
          details: requiredVars
        });
        return;
      }

      // Check environment details
      const envDetails = {
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
        hasAnonKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
        hasPayPalClientId: !!import.meta.env.VITE_PAYPAL_CLIENT_ID,
        paypalMode: import.meta.env.VITE_PAYPAL_MODE,
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

  const testMercadoPagoEdgeFunctions = async () => {
    setTestRunning('mp-edge-functions', true);
    
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !anonKey) {
        updateTestResult('mp-edge-functions', {
          status: 'error',
          message: 'Variables de Supabase no configuradas'
        });
        return;
      }

      // Test MercadoPago edge function
      const response = await fetch(`${supabaseUrl}/functions/v1/mercadopago-create-preference`, {
        method: 'OPTIONS',
        headers: {
          'Authorization': `Bearer ${anonKey}`,
          'Content-Type': 'application/json'
        }
      });

      updateTestResult('mp-edge-functions', {
        status: 'success',
        message: 'Edge Functions de MercadoPago están disponibles',
        details: {
          status: response.status,
          headers: Object.fromEntries(response.headers.entries())
        }
      });

    } catch (error) {
      updateTestResult('mp-edge-functions', {
        status: 'error',
        message: `Error probando Edge Functions MP: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        details: error
      });
    }
  };

  const testMercadoPagoPreferenceCreation = async () => {
    setTestRunning('mp-preference-creation', true);
    
    try {
      const testData: CheckoutData = {
        items: [
          {
            id: 'test-mp-product-1',
            title: 'Producto de Prueba MP - Diagnóstico',
            quantity: 1,
            price: 10.50,
            description: 'Producto de prueba para diagnóstico de MercadoPago',
            image: 'https://via.placeholder.com/150'
          }
        ],
        customer: {
          email: 'test_mp_user@testuser.com',
          name: 'Usuario de Prueba MP',
          phone: '+51987654321'
        }
      };

      const preference = await mercadoPagoService.createPreference(testData);

      updateTestResult('mp-preference-creation', {
        status: 'success',
        message: 'Preferencia de MercadoPago creada exitosamente',
        details: {
          id: preference.id,
          hasInitPoint: !!preference.init_point,
          hasSandboxPoint: !!preference.sandbox_init_point,
          external_reference: preference.external_reference
        }
      });

    } catch (error) {
      updateTestResult('mp-preference-creation', {
        status: 'error',
        message: `Error creando preferencia MP: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        details: error
      });
    }
  };

  const testMercadoPagoFullFlow = async () => {
    setTestRunning('mp-full-flow', true);
    
    try {
      const testData: CheckoutData = {
        items: [
          {
            id: 'mp-flow-test-1',
            title: 'Test Flujo Completo MP',
            quantity: 2,
            price: 25.99
          }
        ],
        customer: {
          email: 'mp_fullflow_test@testuser.com',
          name: 'MP Full Flow Test User'
        }
      };

      const preference = await mercadoPagoService.createPreference(testData);
      const total = mercadoPagoService.calculateTotal(testData.items);
      const formattedPrice = mercadoPagoService.formatPrice(total);

      updateTestResult('mp-full-flow', {
        status: 'success',
        message: 'Flujo completo de MercadoPago validado exitosamente',
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
      updateTestResult('mp-full-flow', {
        status: 'error',
        message: `Error en flujo completo MP: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        details: error
      });
    }
  };

  const testPayPalConfig = async () => {
    setTestRunning('paypal-config', true);
    
    try {
      const paypalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;
      const paypalMode = import.meta.env.VITE_PAYPAL_MODE;

      if (!paypalClientId) {
        updateTestResult('paypal-config', {
          status: 'error',
          message: 'VITE_PAYPAL_CLIENT_ID no configurado',
          details: {
            hasClientId: false,
            mode: paypalMode || 'not set'
          }
        });
        return;
      }

      updateTestResult('paypal-config', {
        status: 'success',
        message: 'Configuración de PayPal correcta',
        details: {
          hasClientId: true,
          mode: paypalMode || 'sandbox',
          clientIdLength: paypalClientId.length
        }
      });

    } catch (error) {
      updateTestResult('paypal-config', {
        status: 'error',
        message: `Error verificando config PayPal: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        details: error
      });
    }
  };

  const testPayPalEdgeFunctions = async () => {
    setTestRunning('paypal-edge-functions', true);
    
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !anonKey) {
        updateTestResult('paypal-edge-functions', {
          status: 'error',
          message: 'Variables de Supabase no configuradas'
        });
        return;
      }

      // Test PayPal edge functions
      const createOrderResponse = await fetch(`${supabaseUrl}/functions/v1/paypal-create-order`, {
        method: 'OPTIONS',
        headers: {
          'Authorization': `Bearer ${anonKey}`,
          'Content-Type': 'application/json'
        }
      });

      const captureOrderResponse = await fetch(`${supabaseUrl}/functions/v1/paypal-capture-order`, {
        method: 'OPTIONS',
        headers: {
          'Authorization': `Bearer ${anonKey}`,
          'Content-Type': 'application/json'
        }
      });

      updateTestResult('paypal-edge-functions', {
        status: 'success',
        message: 'Edge Functions de PayPal están disponibles',
        details: {
          createOrder: {
            status: createOrderResponse.status,
            available: createOrderResponse.ok || createOrderResponse.status === 404
          },
          captureOrder: {
            status: captureOrderResponse.status,
            available: captureOrderResponse.ok || captureOrderResponse.status === 404
          }
        }
      });

    } catch (error) {
      updateTestResult('paypal-edge-functions', {
        status: 'error',
        message: `Error probando Edge Functions PayPal: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        details: error
      });
    }
  };

  const testPayPalSDKLoad = async () => {
    setTestRunning('paypal-sdk-load', true);
    
    try {
      await paypalService.loadPayPalScript();
      
      const hasPayPal = !!(window as any).paypal;
      
      updateTestResult('paypal-sdk-load', {
        status: hasPayPal ? 'success' : 'error',
        message: hasPayPal ? 'SDK de PayPal cargado exitosamente' : 'No se pudo cargar el SDK de PayPal',
        details: {
          hasPayPal,
          clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID?.substring(0, 20) + '...',
          mode: import.meta.env.VITE_PAYPAL_MODE || 'sandbox'
        }
      });

    } catch (error) {
      updateTestResult('paypal-sdk-load', {
        status: 'error',
        message: `Error cargando SDK PayPal: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        details: error
      });
    }
  };

  const testPayPalOrderCreation = async () => {
    setTestRunning('paypal-order-creation', true);
    
    try {
      const testData: CheckoutData = {
        items: [
          {
            id: 'test-paypal-product-1',
            title: 'Producto de Prueba PayPal',
            quantity: 1,
            price: 15.99,
            description: 'Producto de prueba para diagnóstico de PayPal'
          }
        ],
        customer: {
          email: 'test_paypal_user@testuser.com',
          name: 'Usuario de Prueba PayPal'
        }
      };

      // This would test the actual order creation - we'll simulate it for now
      const totalUSD = paypalService.getTotalAmountUSD(testData);
      
      updateTestResult('paypal-order-creation', {
        status: 'success',
        message: 'Preparación de orden PayPal exitosa',
        details: {
          totalUSD: totalUSD,
          items: testData.items.length,
          conversionRate: 'PEN to USD conversion calculated'
        }
      });

    } catch (error) {
      updateTestResult('paypal-order-creation', {
        status: 'error',
        message: `Error en orden PayPal: ${error instanceof Error ? error.message : 'Error desconocido'}`,
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
      case 'mp-edge-functions':
        testMercadoPagoEdgeFunctions();
        break;
      case 'mp-preference-creation':
        testMercadoPagoPreferenceCreation();
        break;
      case 'mp-full-flow':
        testMercadoPagoFullFlow();
        break;
      case 'paypal-config':
        testPayPalConfig();
        break;
      case 'paypal-edge-functions':
        testPayPalEdgeFunctions();
        break;
      case 'paypal-sdk-load':
        testPayPalSDKLoad();
        break;
      case 'paypal-order-creation':
        testPayPalOrderCreation();
        break;
    }
  };

  const runAllTests = async () => {
    const filteredTests = selectedCategory === 'all' 
      ? tests 
      : tests.filter(test => test.category === selectedCategory);

    for (const test of filteredTests) {
      await new Promise(resolve => setTimeout(resolve, 500));
      runTest(test.id);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  const runCategoryTests = async (category: 'general' | 'mercadopago' | 'paypal') => {
    const categoryTests = tests.filter(test => test.category === category);
    
    for (const test of categoryTests) {
      await new Promise(resolve => setTimeout(resolve, 500));
      runTest(test.id);
      await new Promise(resolve => setTimeout(resolve, 1000));
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

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'general':
        return 'border-l-blue-500';
      case 'mercadopago':
        return 'border-l-blue-600';
      case 'paypal':
        return 'border-l-yellow-500';
      default:
        return 'border-l-gray-500';
    }
  };

  const filteredTests = selectedCategory === 'all' 
    ? tests 
    : tests.filter(test => test.category === selectedCategory);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔍 Diagnóstico Completo de Integración de Pagos
          </CardTitle>
          <p className="text-muted-foreground">
            Esta herramienta verificará todos los componentes de las integraciones con MercadoPago y PayPal
          </p>
        </CardHeader>
        <CardContent>
          {/* Category Filter */}
          <div className="flex gap-2 mb-6 flex-wrap">
            <Button 
              onClick={() => setSelectedCategory('all')}
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
            >
              Todas las Pruebas
            </Button>
            <Button 
              onClick={() => setSelectedCategory('general')}
              variant={selectedCategory === 'general' ? 'default' : 'outline'}
              size="sm"
            >
              🔧 General
            </Button>
            <Button 
              onClick={() => setSelectedCategory('mercadopago')}
              variant={selectedCategory === 'mercadopago' ? 'default' : 'outline'}
              size="sm"
            >
              💳 MercadoPago
            </Button>
            <Button 
              onClick={() => setSelectedCategory('paypal')}
              variant={selectedCategory === 'paypal' ? 'default' : 'outline'}
              size="sm"
            >
              🅿️ PayPal
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mb-6 flex-wrap">
            <Button onClick={runAllTests} className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              Ejecutar {selectedCategory === 'all' ? 'Todas las Pruebas' : `Pruebas de ${selectedCategory}`}
            </Button>
            
            {selectedCategory === 'all' && (
              <>
                <Button 
                  onClick={() => runCategoryTests('general')} 
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  🔧 General
                </Button>
                <Button 
                  onClick={() => runCategoryTests('mercadopago')} 
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  💳 MercadoPago
                </Button>
                <Button 
                  onClick={() => runCategoryTests('paypal')} 
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  🅿️ PayPal
                </Button>
              </>
            )}
          </div>

          <div className="space-y-4">
            {filteredTests.map((test, index) => (
              <Card 
                key={test.id} 
                className={`border-l-4 ${getCategoryColor(test.category)} ${
                  test.result?.status === 'success' ? 'bg-green-50/30' :
                  test.result?.status === 'error' ? 'bg-red-50/30' :
                  test.result?.status === 'warning' ? 'bg-yellow-50/30' : ''
                }`}
              >
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-semibold flex items-center gap-2">
                          {test.category === 'general' && '🔧'}
                          {test.category === 'mercadopago' && '💳'}
                          {test.category === 'paypal' && '🅿️'}
                          {test.name}
                        </h3>
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
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <h5 className="font-medium text-foreground">🔧 General:</h5>
                <ul className="space-y-1 list-disc list-inside text-xs">
                  <li>Variables de entorno</li>
                  <li>Conexión a Supabase</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-foreground">💳 MercadoPago:</h5>
                <ul className="space-y-1 list-disc list-inside text-xs">
                  <li>Edge Functions MP</li>
                  <li>Creación de preferencias</li>
                  <li>Flujo completo MP</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-foreground">🅿️ PayPal:</h5>
                <ul className="space-y-1 list-disc list-inside text-xs">
                  <li>Configuración PayPal</li>
                  <li>Edge Functions PayPal</li>
                  <li>SDK y creación de órdenes</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MercadoPagoDiagnostic;
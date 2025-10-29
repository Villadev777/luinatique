import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Copy, Download, AlertCircle } from 'lucide-react';

const MercadoPagoFullDiagnostic: React.FC = () => {
  const [diagnosticData, setDiagnosticData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  const runFullDiagnostic = async () => {
    setIsLoading(true);
    setDiagnosticData(null);

    const fullDiagnostic = {
      timestamp: new Date().toISOString(),
      browser: {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
      },
      environment: {
        origin: window.location.origin,
        hostname: window.location.hostname,
        isDevelopment: window.location.hostname === 'localhost',
      },
      config: {
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
        hasAnonKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
        anonKeyPreview: import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 20) + '...',
      },
      request: null as any,
      response: null as any,
      error: null as any,
    };

    try {
      // ============================================
      // 1. PREPARAR EL REQUEST COMPLETO
      // ============================================
      const requestPayload = {
        items: [
          {
            id: 'diagnostic-001',
            title: 'Producto de Prueba Diagnóstico MercadoPago',
            quantity: 1,
            unit_price: 100.00,
            currency_id: 'PEN',
            description: 'Prueba de diagnóstico completo para MercadoPago Checkout Pro',
            picture_url: 'https://lunatiqueshop.netlify.app/logo.png'
          }
        ],
        payer: {
          email: 'test_diagnostico_mp@testuser.com',
          name: 'Usuario de Diagnóstico',
          phone: {
            number: '+51987654321'
          },
          address: {
            street_name: 'Av. Javier Prado Este',
            street_number: 1234,
            zip_code: '15036'
          }
        },
        back_urls: {
          success: `${window.location.origin}/payment/success`,
          failure: `${window.location.origin}/payment/failure`,
          pending: `${window.location.origin}/payment/pending`
        },
        auto_return: 'approved',
        notification_url: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mercadopago-webhook`,
        statement_descriptor: 'LUINATIQUE',
        external_reference: `DIAGNOSTIC_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        expires: true,
        expiration_date_to: (() => {
          const exp = new Date();
          exp.setHours(exp.getHours() + 24);
          return exp.toISOString();
        })(),
        payment_methods: {
          installments: 12,
          excluded_payment_types: [],
          excluded_payment_methods: []
        },
        metadata: {
          source: 'luinatique_diagnostic',
          test_type: 'full_diagnostic',
          timestamp: new Date().toISOString()
        }
      };

      fullDiagnostic.request = {
        url: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mercadopago-create-preference`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer [HIDDEN - Ver en consola]',
        },
        body: requestPayload,
        bodyJSON: JSON.stringify(requestPayload, null, 2),
      };

      console.log('📤 REQUEST COMPLETO A EDGE FUNCTION:');
      console.log('URL:', fullDiagnostic.request.url);
      console.log('Headers:', {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      });
      console.log('Body:', requestPayload);
      console.log('Body JSON:', JSON.stringify(requestPayload, null, 2));

      // ============================================
      // 2. HACER LA LLAMADA Y CAPTURAR RESPONSE
      // ============================================
      const startTime = performance.now();
      
      const response = await fetch(fullDiagnostic.request.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(requestPayload),
      });

      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);

      // Capturar headers de respuesta
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      // Capturar body de respuesta
      const responseText = await response.text();
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        responseData = { rawText: responseText };
      }

      fullDiagnostic.response = {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
        body: responseData,
        bodyJSON: JSON.stringify(responseData, null, 2),
        responseTime: `${responseTime}ms`,
      };

      console.log('📥 RESPONSE COMPLETO DE EDGE FUNCTION:');
      console.log('Status:', response.status, response.statusText);
      console.log('Headers:', responseHeaders);
      console.log('Body:', responseData);
      console.log('Body JSON:', JSON.stringify(responseData, null, 2));
      console.log('Response Time:', `${responseTime}ms`);

      // ============================================
      // 3. ANÁLISIS DEL RESPONSE
      // ============================================
      if (response.ok && responseData) {
        fullDiagnostic.analysis = {
          success: true,
          preferenceId: responseData.id,
          hasInitPoint: !!responseData.init_point,
          hasSandboxPoint: !!responseData.sandbox_init_point,
          mode: responseData.init_point ? 'PRODUCCIÓN' : 'SANDBOX',
          urls: {
            production: responseData.init_point,
            sandbox: responseData.sandbox_init_point,
          },
          // Extraer User ID del preference ID
          extractedUserId: responseData.id ? responseData.id.split('-')[0] : 'No disponible',
          debugInfo: responseData._debug,
        };

        console.log('✅ ANÁLISIS:');
        console.log('Modo:', fullDiagnostic.analysis.mode);
        console.log('Preference ID:', fullDiagnostic.analysis.preferenceId);
        console.log('User ID extraído:', fullDiagnostic.analysis.extractedUserId);
        console.log('URLs:', fullDiagnostic.analysis.urls);
      } else {
        fullDiagnostic.error = {
          hasError: true,
          status: response.status,
          message: responseData.error || responseData.message || 'Error desconocido',
          details: responseData.details || responseData,
        };

        console.error('❌ ERROR:');
        console.error('Status:', response.status);
        console.error('Message:', fullDiagnostic.error.message);
        console.error('Details:', fullDiagnostic.error.details);
      }

      setDiagnosticData(fullDiagnostic);

    } catch (error) {
      console.error('❌ ERROR EN DIAGNÓSTICO:', error);
      fullDiagnostic.error = {
        hasError: true,
        message: error instanceof Error ? error.message : 'Error desconocido',
        stack: error instanceof Error ? error.stack : undefined,
      };
      setDiagnosticData(fullDiagnostic);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (data: any, label: string) => {
    const text = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess(label);
      setTimeout(() => setCopySuccess(null), 2000);
    });
  };

  const downloadReport = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      ...diagnosticData,
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mercadopago-diagnostic-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">🔍 MercadoPago - Diagnóstico Completo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              Esta herramienta capturará y mostrará toda la información necesaria:
              <ul className="list-disc ml-6 mt-2">
                <li><strong>REQUEST completo</strong> enviado a MercadoPago</li>
                <li><strong>RESPONSE completo</strong> recibido de MercadoPago</li>
                <li><strong>User ID / Collector ID</strong> extraído</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="flex gap-4">
            <Button 
              onClick={runFullDiagnostic} 
              disabled={isLoading}
              className="flex-1"
              size="lg"
            >
              {isLoading ? '⏳ Ejecutando...' : '🚀 Ejecutar Diagnóstico Completo'}
            </Button>
            
            {diagnosticData && (
              <Button 
                onClick={downloadReport}
                variant="outline"
                size="lg"
              >
                <Download className="h-4 w-4 mr-2" />
                Descargar Reporte
              </Button>
            )}
          </div>

          {diagnosticData && (
            <div className="space-y-6">
              {/* ============================================ */}
              {/* 1. REQUEST COMPLETO */}
              {/* ============================================ */}
              <Card className="border-2 border-blue-500">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">📤 1. REQUEST COMPLETO</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(diagnosticData.request.body, 'request')}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      {copySuccess === 'request' ? '✓ Copiado' : 'Copiar JSON'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">URL:</h4>
                    <div className="bg-gray-100 p-3 rounded font-mono text-xs break-all">
                      {diagnosticData.request.url}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Headers:</h4>
                    <div className="bg-gray-100 p-3 rounded">
                      <pre className="text-xs overflow-auto">
                        {JSON.stringify(diagnosticData.request.headers, null, 2)}
                      </pre>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Body (JSON):</h4>
                    <div className="bg-gray-100 p-3 rounded max-h-96 overflow-auto">
                      <pre className="text-xs">{diagnosticData.request.bodyJSON}</pre>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* ============================================ */}
              {/* 2. RESPONSE COMPLETO */}
              {/* ============================================ */}
              <Card className="border-2 border-green-500">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">📥 2. RESPONSE COMPLETO</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(diagnosticData.response.body, 'response')}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      {copySuccess === 'response' ? '✓ Copiado' : 'Copiar JSON'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-semibold">Status:</p>
                      <p className={`text-lg font-bold ${diagnosticData.response.ok ? 'text-green-600' : 'text-red-600'}`}>
                        {diagnosticData.response.status} {diagnosticData.response.statusText}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Response Time:</p>
                      <p className="text-lg font-bold">{diagnosticData.response.responseTime}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Headers:</h4>
                    <div className="bg-gray-100 p-3 rounded">
                      <pre className="text-xs overflow-auto max-h-40">
                        {JSON.stringify(diagnosticData.response.headers, null, 2)}
                      </pre>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Body (JSON):</h4>
                    <div className="bg-gray-100 p-3 rounded max-h-96 overflow-auto">
                      <pre className="text-xs">{diagnosticData.response.bodyJSON}</pre>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* ============================================ */}
              {/* 3. USER ID / COLLECTOR ID */}
              {/* ============================================ */}
              {diagnosticData.analysis && (
                <Card className="border-2 border-purple-500">
                  <CardHeader>
                    <CardTitle className="text-lg">👤 3. USER ID / COLLECTOR ID (cust_id)</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Alert className="bg-purple-50">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>User ID extraído del Preference ID:</strong>
                        <div className="mt-2 p-3 bg-white rounded border-2 border-purple-300">
                          <p className="text-2xl font-bold text-purple-700 font-mono">
                            {diagnosticData.analysis.extractedUserId}
                          </p>
                        </div>
                      </AlertDescription>
                    </Alert>

                    <div className="bg-gray-100 p-4 rounded space-y-2">
                      <p><strong>Preference ID completo:</strong> {diagnosticData.analysis.preferenceId}</p>
                      <p><strong>Modo:</strong> <span className="font-bold text-lg">{diagnosticData.analysis.mode}</span></p>
                      <p><strong>Init Point (Producción):</strong> {diagnosticData.analysis.hasInitPoint ? '✓ Disponible' : '✗ No disponible'}</p>
                      <p><strong>Sandbox Init Point:</strong> {diagnosticData.analysis.hasSandboxPoint ? '✓ Disponible' : '✗ No disponible'}</p>
                    </div>

                    {diagnosticData.analysis.debugInfo && (
                      <div>
                        <h4 className="font-semibold mb-2">Debug Info adicional:</h4>
                        <div className="bg-gray-100 p-3 rounded">
                          <pre className="text-xs overflow-auto">
                            {JSON.stringify(diagnosticData.analysis.debugInfo, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* ============================================ */}
              {/* ERROR (si existe) */}
              {/* ============================================ */}
              {diagnosticData.error && (
                <Card className="border-2 border-red-500">
                  <CardHeader>
                    <CardTitle className="text-lg text-red-600">❌ ERROR DETECTADO</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Alert className="bg-red-50">
                      <AlertDescription>
                        <strong>Mensaje:</strong>
                        <p className="mt-2">{diagnosticData.error.message}</p>
                      </AlertDescription>
                    </Alert>

                    {diagnosticData.error.details && (
                      <div>
                        <h4 className="font-semibold mb-2">Detalles del error:</h4>
                        <div className="bg-gray-100 p-3 rounded">
                          <pre className="text-xs overflow-auto max-h-60">
                            {JSON.stringify(diagnosticData.error.details, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* ============================================ */}
              {/* REPORTE COMPLETO PARA COPIAR */}
              {/* ============================================ */}
              <Card className="border-2 border-gray-500">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">📋 Reporte Completo</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(diagnosticData, 'full')}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      {copySuccess === 'full' ? '✓ Copiado' : 'Copiar Todo'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-100 p-3 rounded max-h-96 overflow-auto">
                    <pre className="text-xs">{JSON.stringify(diagnosticData, null, 2)}</pre>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      {/* INSTRUCCIONES ADICIONALES */}
      <Card>
        <CardHeader>
          <CardTitle>📖 Cómo obtener tu cust_id manualmente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              Si necesitas verificar tu <strong>cust_id</strong> (Collector ID) directamente desde MercadoPago:
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Método 1: Desde el Dashboard</h4>
              <ol className="list-decimal ml-6 space-y-1 text-sm">
                <li>Ve a: <a href="https://www.mercadopago.com.pe/developers/panel" className="text-blue-600 underline" target="_blank">https://www.mercadopago.com.pe/developers/panel</a></li>
                <li>Click en "Tus integraciones" → Tu aplicación</li>
                <li>En la sección de credenciales, verás tu "User ID" o "Collector ID"</li>
              </ol>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Método 2: Mediante API</h4>
              <div className="bg-gray-100 p-3 rounded">
                <p className="text-sm mb-2">Ejecuta esto en la consola del navegador (F12):</p>
                <pre className="text-xs overflow-auto">
{`fetch('https://api.mercadopago.com/users/me', {
  headers: {
    'Authorization': 'Bearer TU_ACCESS_TOKEN_AQUI'
  }
})
.then(r => r.json())
.then(data => {
  console.log('User ID:', data.id);
  console.log('Nickname:', data.nickname);
  console.log('Email:', data.email);
});`}
                </pre>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Método 3: Desde el Preference ID</h4>
              <p className="text-sm">
                El primer número antes del primer guión en cualquier Preference ID es tu User ID.
                Ejemplo: <code className="bg-gray-200 px-2 py-1 rounded">2122991696-040223fa-...</code> → User ID: <strong>2122991696</strong>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MercadoPagoFullDiagnostic;

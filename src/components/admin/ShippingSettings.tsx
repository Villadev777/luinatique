import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useShippingSettings } from '@/hooks/useShippingSettings';
import { Truck, DollarSign, Package, Save, RefreshCw, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const ShippingSettings: React.FC = () => {
  const { 
    settings, 
    loading, 
    error, 
    updateSettings, 
    fetchSettings 
  } = useShippingSettings();

  const [formData, setFormData] = useState({
    free_shipping_threshold: settings.free_shipping_threshold,
    standard_shipping_cost: settings.standard_shipping_cost,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Update form when settings change
  useEffect(() => {
    setFormData({
      free_shipping_threshold: settings.free_shipping_threshold,
      standard_shipping_cost: settings.standard_shipping_cost,
    });
  }, [settings]);

  // Detect changes
  useEffect(() => {
    const changed = 
      formData.free_shipping_threshold !== settings.free_shipping_threshold ||
      formData.standard_shipping_cost !== settings.standard_shipping_cost;
    setHasChanges(changed);
  }, [formData, settings]);

  const handleInputChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSettings({
        free_shipping_threshold: formData.free_shipping_threshold,
        standard_shipping_cost: formData.standard_shipping_cost,
      });
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setFormData({
      free_shipping_threshold: settings.free_shipping_threshold,
      standard_shipping_cost: settings.standard_shipping_cost,
    });
    setHasChanges(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error al cargar la configuración: {error}
          <Button 
            variant="outline" 
            size="sm" 
            className="ml-4"
            onClick={() => fetchSettings()}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reintentar
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Configuración de Envíos</h2>
        <p className="text-muted-foreground">
          Administra los costos de envío y umbrales para envío gratis
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Current Settings Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Configuración Actual
            </CardTitle>
            <CardDescription>
              Valores actualmente en uso en la tienda
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Truck className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Envío Gratis desde</p>
                  <p className="text-sm text-muted-foreground">Umbral para envío gratuito</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">S/ {settings.free_shipping_threshold.toFixed(2)}</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Costo de Envío</p>
                  <p className="text-sm text-muted-foreground">Para pedidos menores</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">S/ {settings.standard_shipping_cost.toFixed(2)}</p>
              </div>
            </div>

            <Separator />

            <div className="text-sm text-muted-foreground space-y-2">
              <p>💡 <strong>Ejemplo:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Compra de S/ 30 → Envío: S/ {settings.standard_shipping_cost.toFixed(2)}</li>
                <li>Compra de S/ {settings.free_shipping_threshold.toFixed(2)} o más → Envío: GRATIS</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Edit Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Editar Configuración
            </CardTitle>
            <CardDescription>
              Los cambios se aplicarán inmediatamente en todo el sitio
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="threshold">Umbral para Envío Gratis (S/)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">S/</span>
                <Input
                  id="threshold"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.free_shipping_threshold}
                  onChange={handleInputChange('free_shipping_threshold')}
                  className="pl-9"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Los clientes obtendrán envío gratis si su compra es igual o mayor a este monto
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost">Costo de Envío Estándar (S/)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">S/</span>
                <Input
                  id="cost"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.standard_shipping_cost}
                  onChange={handleInputChange('standard_shipping_cost')}
                  className="pl-9"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Costo de envío para pedidos que no califiquen para envío gratis
              </p>
            </div>

            <Separator />

            <div className="flex gap-2">
              <Button 
                onClick={handleSave} 
                disabled={!hasChanges || isSaving}
                className="flex-1"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar Cambios
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleReset}
                disabled={!hasChanges || isSaving}
              >
                Cancelar
              </Button>
            </div>

            {hasChanges && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Tienes cambios sin guardar
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>ℹ️ Información Importante</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            <strong>🔄 Aplicación inmediata:</strong> Los cambios se reflejarán automáticamente en:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Carrito de compras</li>
            <li>Página de checkout</li>
            <li>Proceso de pago (MercadoPago y PayPal)</li>
            <li>Cálculo de totales en órdenes</li>
          </ul>
          <p className="mt-4">
            <strong>💡 Recomendaciones:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Evita cambios frecuentes para no confundir a los clientes</li>
            <li>Considera promociones estacionales ajustando estos valores</li>
            <li>Monitorea el impacto en tus ventas después de cada cambio</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
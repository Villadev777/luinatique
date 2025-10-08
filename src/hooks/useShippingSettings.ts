import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export interface ShippingSettings {
  id: string;
  free_shipping_threshold: number;
  standard_shipping_cost: number;
  currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Default fallback values if DB is not available
const DEFAULT_SETTINGS: Omit<ShippingSettings, 'id' | 'created_at' | 'updated_at'> = {
  free_shipping_threshold: 50,
  standard_shipping_cost: 9.99,
  currency: 'PEN',
  is_active: true,
};

export const useShippingSettings = () => {
  const [settings, setSettings] = useState<ShippingSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch shipping settings
  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('shipping_settings')
        .select('*')
        .eq('is_active', true)
        .single();

      if (fetchError) {
        console.error('Error fetching shipping settings:', fetchError);
        setError(fetchError.message);
        // Use default settings as fallback
        return null;
      }

      setSettings(data);
      return data;
    } catch (err) {
      console.error('Unexpected error fetching shipping settings:', err);
      setError('Error inesperado al cargar la configuración');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update shipping settings (admin only)
  const updateSettings = async (updates: Partial<Omit<ShippingSettings, 'id' | 'created_at' | 'updated_at'>>) => {
    try {
      if (!settings) {
        throw new Error('No hay configuración para actualizar');
      }

      const { data, error: updateError } = await supabase
        .from('shipping_settings')
        .update(updates)
        .eq('id', settings.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating shipping settings:', updateError);
        toast({
          title: 'Error',
          description: 'No se pudo actualizar la configuración de envío',
          variant: 'destructive',
        });
        throw updateError;
      }

      setSettings(data);
      toast({
        title: '✅ Configuración actualizada',
        description: 'Los cambios se aplicarán inmediatamente en todo el sitio',
      });

      return data;
    } catch (err) {
      console.error('Error updating settings:', err);
      throw err;
    }
  };

  // Calculate shipping cost based on current settings
  const calculateShipping = (subtotal: number): number => {
    const threshold = settings?.free_shipping_threshold ?? DEFAULT_SETTINGS.free_shipping_threshold;
    const cost = settings?.standard_shipping_cost ?? DEFAULT_SETTINGS.standard_shipping_cost;
    
    return subtotal >= threshold ? 0 : cost;
  };

  // Get current threshold
  const getFreeShippingThreshold = (): number => {
    return settings?.free_shipping_threshold ?? DEFAULT_SETTINGS.free_shipping_threshold;
  };

  // Get current shipping cost
  const getShippingCost = (): number => {
    return settings?.standard_shipping_cost ?? DEFAULT_SETTINGS.standard_shipping_cost;
  };

  // Check if free shipping applies
  const isFreeShipping = (subtotal: number): boolean => {
    const threshold = getFreeShippingThreshold();
    return subtotal >= threshold;
  };

  // Calculate amount needed for free shipping
  const getAmountNeededForFreeShipping = (subtotal: number): number => {
    const threshold = getFreeShippingThreshold();
    if (subtotal >= threshold) return 0;
    return threshold - subtotal;
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings: settings ?? { ...DEFAULT_SETTINGS, id: '', created_at: '', updated_at: '' },
    loading,
    error,
    fetchSettings,
    updateSettings,
    calculateShipping,
    getFreeShippingThreshold,
    getShippingCost,
    isFreeShipping,
    getAmountNeededForFreeShipping,
  };
};
/**
 * Shipping configuration utilities
 * Este archivo proporciona funciones para acceder a la configuración de envío
 * desde la base de datos de forma síncrona para uso en servicios.
 */

import { supabase } from '@/integrations/supabase/client';

// Cache para la configuración de envío
let cachedSettings: {
  free_shipping_threshold: number;
  standard_shipping_cost: number;
  lastFetch: number;
} | null = null;

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

// Valores por defecto (fallback)
const DEFAULT_FREE_SHIPPING_THRESHOLD = 50;
const DEFAULT_SHIPPING_COST = 9.99;

/**
 * Obtiene la configuración de envío desde la base de datos
 * con caché para mejorar el rendimiento
 */
export async function getShippingConfig(): Promise<{
  freeShippingThreshold: number;
  shippingCost: number;
}> {
  try {
    // Verificar si el caché es válido
    if (cachedSettings && Date.now() - cachedSettings.lastFetch < CACHE_DURATION) {
      return {
        freeShippingThreshold: cachedSettings.free_shipping_threshold,
        shippingCost: cachedSettings.standard_shipping_cost,
      };
    }

    // Obtener desde Supabase
    const { data, error } = await supabase
      .from('shipping_settings')
      .select('free_shipping_threshold, standard_shipping_cost')
      .eq('is_active', true)
      .single();

    if (error || !data) {
      console.warn('Using default shipping config due to error:', error);
      return {
        freeShippingThreshold: DEFAULT_FREE_SHIPPING_THRESHOLD,
        shippingCost: DEFAULT_SHIPPING_COST,
      };
    }

    // Actualizar caché
    cachedSettings = {
      free_shipping_threshold: data.free_shipping_threshold,
      standard_shipping_cost: data.standard_shipping_cost,
      lastFetch: Date.now(),
    };

    return {
      freeShippingThreshold: data.free_shipping_threshold,
      shippingCost: data.standard_shipping_cost,
    };
  } catch (error) {
    console.error('Error fetching shipping config:', error);
    return {
      freeShippingThreshold: DEFAULT_FREE_SHIPPING_THRESHOLD,
      shippingCost: DEFAULT_SHIPPING_COST,
    };
  }
}

/**
 * Invalida el caché de configuración de envío
 * Llama esto después de actualizar la configuración en el admin
 */
export function invalidateShippingCache(): void {
  cachedSettings = null;
}

/**
 * Calcula el costo de envío basado en el subtotal
 */
export async function calculateShipping(subtotal: number): Promise<number> {
  const config = await getShippingConfig();
  return subtotal >= config.freeShippingThreshold ? 0 : config.shippingCost;
}
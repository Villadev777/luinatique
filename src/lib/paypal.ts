import { 
  PayPalOrder, 
  PayPalOrderResponse, 
  PayPalCaptureResponse,
  PayPalButtonsOptions
} from '../types/paypal';
import { CartItem, CheckoutData } from '../types/mercadopago';
import { getShippingConfig } from './shippingConfig';

// Get Supabase URL from environment
const getSupabaseUrl = () => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  
  if (!url) {
    console.error('VITE_SUPABASE_URL not found in environment variables');
    throw new Error('Supabase URL not configured');
  }
  
  return url;
};

// Get PayPal configuration from environment
const getPayPalConfig = () => {
  const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;
  const isProduction = import.meta.env.VITE_PAYPAL_MODE === 'production';
  
  if (!clientId) {
    throw new Error('PayPal Client ID not configured');
  }
  
  return {
    clientId,
    isProduction,
    currency: 'USD', // PayPal works better with USD for international transactions
    apiUrl: `${getSupabaseUrl()}/functions/v1`,
  };
};

export class PayPalService {
  private static instance: PayPalService;
  private config = getPayPalConfig();
  
  // 🔧 Tasa de cambio PEN a USD (actualizar según necesidad)
  private readonly EXCHANGE_RATE = 0.267; // 1 PEN ≈ 0.267 USD

  static getInstance(): PayPalService {
    if (!PayPalService.instance) {
      PayPalService.instance = new PayPalService();
    }
    return PayPalService.instance;
  }

  /**
   * Calcula el costo de envío en USD basado en el subtotal en PEN
   * 🆕 AHORA USA CONFIGURACIÓN DINÁMICA DE LA BASE DE DATOS
   */
  private async calculateShippingUSD(subtotalPEN: number): Promise<number> {
    const config = await getShippingConfig();
    
    if (subtotalPEN >= config.freeShippingThreshold) {
      console.log('🎉 Free shipping applied (order qualifies)');
      return 0;
    }
    
    const shippingUSD = this.convertPENToUSD(config.shippingCost);
    console.log(`📦 Shipping cost: S/ ${config.shippingCost} = $${shippingUSD.toFixed(2)} USD`);
    return shippingUSD;
  }

  /**
   * Load PayPal SDK script
   */
  async loadPayPalScript(): Promise<void> {
    if (window.paypal) {
      return; // Already loaded
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${this.config.clientId}&currency=${this.config.currency}&disable-funding=credit,card`;
      script.async = true;
      
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load PayPal SDK'));
      
      document.head.appendChild(script);
    });
  }

  /**
   * Convert cart items to PayPal order format
   * 🔧 CORREGIDO: Calcula correctamente el envío basado en subtotal PEN
   */
  async buildPayPalOrder(checkoutData: CheckoutData): Promise<PayPalOrder> {
    const items = checkoutData.items.map(item => ({
      name: item.title,
      unit_amount: {
        currency_code: this.config.currency,
        value: this.convertPENToUSD(item.price).toFixed(2),
      },
      quantity: item.quantity.toString(),
      description: item.description || item.title,
      category: 'PHYSICAL_GOODS' as const,
    }));

    const itemTotal = items.reduce((total, item) => 
      total + (parseFloat(item.unit_amount.value) * parseInt(item.quantity)), 0
    );
    
    // 🔧 CORRECCIÓN IMPORTANTE: Calcular subtotal en PEN primero
    const subtotalPEN = checkoutData.items.reduce((total, item) => 
      total + (item.price * item.quantity), 0
    );
    
    // 🆕 Usar el subtotal en PEN para determinar si el envío es gratis (configuración dinámica)
    const shipping = await this.calculateShippingUSD(subtotalPEN);
    
    const tax = itemTotal * 0; // Sin impuestos adicionales en USD
    const totalAmount = itemTotal + shipping + tax;
    
    console.log('💰 PayPal Order Breakdown:', {
      subtotalPEN: `S/ ${subtotalPEN.toFixed(2)}`,
      itemTotalUSD: `$${itemTotal.toFixed(2)}`,
      shippingUSD: `$${shipping.toFixed(2)}`,
      freeShippingApplied: shipping === 0,
      totalUSD: `$${totalAmount.toFixed(2)}`
    });

    return {
      intent: 'CAPTURE',
      purchase_units: [{
        reference_id: `LUINA_${Date.now()}`,
        amount: {
          currency_code: this.config.currency,
          value: totalAmount.toFixed(2),
          breakdown: {
            item_total: {
              currency_code: this.config.currency,
              value: itemTotal.toFixed(2),
            },
            shipping: {
              currency_code: this.config.currency,
              value: shipping.toFixed(2),
            },
            tax_total: {
              currency_code: this.config.currency,
              value: tax.toFixed(2),
            },
          },
        },
        items,
        ...(checkoutData.shippingAddress && {
          shipping: {
            name: {
              full_name: checkoutData.customer.name,
            },
            address: {
              address_line_1: checkoutData.shippingAddress.street,
              address_line_2: checkoutData.shippingAddress.number,
              admin_area_2: checkoutData.shippingAddress.city,
              admin_area_1: checkoutData.shippingAddress.state,
              postal_code: checkoutData.shippingAddress.zipCode,
              country_code: 'PE',
            },
          },
        }),
      }],
      application_context: {
        brand_name: 'LUNATIQUE',
        landing_page: 'NO_PREFERENCE',
        user_action: 'PAY_NOW',
        return_url: `${window.location.origin}/payment/success`,
        cancel_url: `${window.location.origin}/payment/failure`,
      },
    };
  }

  /**
   * Create PayPal order
   */
  async createOrder(checkoutData: CheckoutData): Promise<string> {
    try {
      const order = await this.buildPayPalOrder(checkoutData);
      
      console.log('Creating PayPal order:', order);

      const response = await fetch(`${this.config.apiUrl}/paypal-create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(order),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('PayPal create order error:', errorData);
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data: PayPalOrderResponse = await response.json();
      console.log('PayPal order created:', data);
      
      return data.id;
    } catch (error) {
      console.error('Error creating PayPal order:', error);
      throw new Error('Failed to create PayPal order: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  /**
   * Capture PayPal order after approval
   */
  async captureOrder(orderID: string): Promise<PayPalCaptureResponse> {
    try {
      console.log('Capturing PayPal order:', orderID);

      const response = await fetch(`${this.config.apiUrl}/paypal-capture-order/${orderID}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('PayPal capture order error:', errorData);
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data: PayPalCaptureResponse = await response.json();
      console.log('PayPal order captured:', data);
      
      return data;
    } catch (error) {
      console.error('Error capturing PayPal order:', error);
      throw new Error('Failed to capture PayPal order: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  /**
   * Create PayPal buttons configuration
   */
  createButtonsConfig(
    checkoutData: CheckoutData,
    onSuccess: (details: PayPalCaptureResponse) => void,
    onError: (error: any) => void
  ): PayPalButtonsOptions {
    return {
      createOrder: () => this.createOrder(checkoutData),
      onApprove: async (data) => {
        try {
          const details = await this.captureOrder(data.orderID);
          onSuccess(details);
        } catch (error) {
          onError(error);
        }
      },
      onError: (err) => {
        console.error('PayPal button error:', err);
        onError(err);
      },
      onCancel: (data) => {
        console.log('PayPal payment cancelled:', data);
        // Redirect to failure page for cancellation
        window.location.href = '/payment/failure';
      },
      style: {
        layout: 'vertical',
        color: 'gold',
        shape: 'rect',
        label: 'paypal',
        tagline: false,
      },
    };
  }

  /**
   * Convert PEN to USD
   * 🔧 Tasa actualizada y con mejor precisión
   */
  private convertPENToUSD(penAmount: number): number {
    return penAmount * this.EXCHANGE_RATE;
  }

  /**
   * Format price for display
   */
  formatPrice(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: this.config.currency,
    }).format(amount);
  }

  /**
   * Get the total amount in USD for display
   */
  getTotalAmountUSD(checkoutData: CheckoutData): number {
    const penTotal = checkoutData.items.reduce(
      (total, item) => total + (item.price * item.quantity), 0
    );
    return this.convertPENToUSD(penTotal);
  }
  
  /**
   * Get shipping cost in USD based on PEN subtotal
   * 🆕 AHORA USA CONFIGURACIÓN DINÁMICA
   */
  async getShippingCostUSD(subtotalPEN: number): Promise<number> {
    return await this.calculateShippingUSD(subtotalPEN);
  }
}

// Export singleton instance
export const paypalService = PayPalService.getInstance();
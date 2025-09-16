import { 
  PayPalOrder, 
  PayPalOrderResponse, 
  PayPalCaptureResponse,
  PayPalButtonsOptions
} from '../types/paypal';
import { CartItem, CheckoutData } from '../types/mercadopago';

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
  };
};

export class PayPalService {
  private static instance: PayPalService;
  private config = getPayPalConfig();

  static getInstance(): PayPalService {
    if (!PayPalService.instance) {
      PayPalService.instance = new PayPalService();
    }
    return PayPalService.instance;
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
   */
  buildPayPalOrder(checkoutData: CheckoutData): PayPalOrder {
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

    const shipping = itemTotal >= 50 ? 0 : 2.99; // $2.99 shipping or free over $50
    const tax = itemTotal * 0.08; // 8% tax
    const totalAmount = itemTotal + shipping + tax;

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
      const order = this.buildPayPalOrder(checkoutData);
      
      console.log('Creating PayPal order:', order);

      const response = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(order),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: PayPalOrderResponse = await response.json();
      console.log('PayPal order created:', data);
      
      return data.id;
    } catch (error) {
      console.error('Error creating PayPal order:', error);
      throw new Error('Failed to create PayPal order');
    }
  }

  /**
   * Capture PayPal order after approval
   */
  async captureOrder(orderID: string): Promise<PayPalCaptureResponse> {
    try {
      console.log('Capturing PayPal order:', orderID);

      const response = await fetch(`/api/paypal/capture-order/${orderID}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: PayPalCaptureResponse = await response.json();
      console.log('PayPal order captured:', data);
      
      return data;
    } catch (error) {
      console.error('Error capturing PayPal order:', error);
      throw new Error('Failed to capture PayPal order');
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
        // Redirect to cancel page or show message
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
   * Convert PEN to USD (approximate rate)
   * In production, you should use a real-time exchange rate API
   */
  private convertPENToUSD(penAmount: number): number {
    const exchangeRate = 0.27; // Approximate PEN to USD rate
    return penAmount * exchangeRate;
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
}

// Export singleton instance
export const paypalService = PayPalService.getInstance();
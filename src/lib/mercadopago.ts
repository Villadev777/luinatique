import { 
  PreferenceRequest, 
  PreferenceResponse, 
  PaymentStatus,
  CheckoutData,
  CartItem 
} from '../types/mercadopago';

// Get Supabase URL from environment - NUNCA usar localhost en producción
const getSupabaseUrl = () => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  
  if (!url) {
    console.error('VITE_SUPABASE_URL not found in environment variables');
    throw new Error('Supabase URL not configured');
  }
  
  // Asegurar que nunca usemos localhost en producción
  if (url.includes('localhost') && window.location.hostname !== 'localhost') {
    console.error('Localhost URL detected in production environment');
    throw new Error('Invalid Supabase URL configuration for production');
  }
  
  return url;
};

const MERCADOPAGO_API_URL = `${getSupabaseUrl()}/functions/v1`;

export class MercadoPagoService {
  private static instance: MercadoPagoService;

  static getInstance(): MercadoPagoService {
    if (!MercadoPagoService.instance) {
      MercadoPagoService.instance = new MercadoPagoService();
    }
    return MercadoPagoService.instance;
  }

  /**
   * Crea una preferencia de pago en MercadoPago
   */
  async createPreference(checkoutData: CheckoutData): Promise<PreferenceResponse> {
    try {
      const preferenceData: PreferenceRequest = this.buildPreferenceRequest(checkoutData);
      
      console.log('Creating preference with data:', preferenceData);
      console.log('API URL:', `${MERCADOPAGO_API_URL}/mercadopago-create-preference`);
      console.log('Environment check:', {
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
        hasAnonKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
        currentHost: window.location.hostname
      });
      
      const response = await fetch(`${MERCADOPAGO_API_URL}/mercadopago-create-preference`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(preferenceData),
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const preference: PreferenceResponse = await response.json();
      console.log('Preference created successfully:', preference);
      return preference;
    } catch (error) {
      console.error('Error creating MercadoPago preference:', error);
      throw new Error('Error al crear la preferencia de pago: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  }

  /**
   * Obtiene el estado de un pago
   */
  async getPaymentStatus(paymentId: string): Promise<PaymentStatus> {
    try {
      const response = await fetch(`${MERCADOPAGO_API_URL}/mercadopago-get-payment/${paymentId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const payment: PaymentStatus = await response.json();
      return payment;
    } catch (error) {
      console.error('Error getting payment status:', error);
      throw new Error('Error al obtener el estado del pago');
    }
  }

  /**
   * Procesa el callback de éxito/fallo del pago
   */
  async processPaymentCallback(params: URLSearchParams): Promise<PaymentStatus | null> {
    const collection_id = params.get('collection_id');
    const collection_status = params.get('collection_status');
    const payment_id = params.get('payment_id');
    const status = params.get('status');
    const external_reference = params.get('external_reference');
    const payment_type = params.get('payment_type');
    const merchant_order_id = params.get('merchant_order_id');
    const preference_id = params.get('preference_id');
    const site_id = params.get('site_id');
    const processing_mode = params.get('processing_mode');
    const merchant_account_id = params.get('merchant_account_id');

    console.log('Processing payment callback with params:', {
      collection_id,
      collection_status,
      payment_id,
      status,
      external_reference,
      payment_type,
      preference_id
    });

    // Si tenemos un payment_id, obtenemos los detalles del pago
    if (payment_id) {
      try {
        return await this.getPaymentStatus(payment_id);
      } catch (error) {
        console.error('Error processing payment callback:', error);
      }
    }

    // Si no hay payment_id pero tenemos otros datos, creamos un objeto básico
    if (collection_status && external_reference) {
      return {
        id: collection_id || payment_id || '',
        status: this.mapCollectionStatusToPaymentStatus(collection_status),
        status_detail: collection_status,
        external_reference: external_reference,
        preference_id: preference_id || '',
        payment_method_id: payment_type || '',
        payment_type_id: payment_type || '',
        transaction_amount: 0, // Se debe obtener de tu base de datos
        date_created: new Date().toISOString(),
        payer: {
          id: '',
          email: '',
          identification: {
            type: '',
            number: ''
          }
        }
      };
    }

    return null;
  }

  /**
   * Construye el objeto de preferencia para MercadoPago
   */
  private buildPreferenceRequest(checkoutData: CheckoutData): PreferenceRequest {
    const baseUrl = window.location.origin;
    
    const preference: PreferenceRequest = {
      items: checkoutData.items.map(item => ({
        id: item.id,
        title: item.title,
        quantity: item.quantity,
        currency_id: 'PEN', // Perú - Soles
        unit_price: item.price,
        description: item.description,
        picture_url: item.image,
      })),
      payer: {
        email: checkoutData.customer.email,
        name: checkoutData.customer.name,
        phone: checkoutData.customer.phone ? {
          number: checkoutData.customer.phone
        } : undefined,
        address: checkoutData.shippingAddress ? {
          street_name: checkoutData.shippingAddress.street,
          street_number: parseInt(checkoutData.shippingAddress.number),
          zip_code: checkoutData.shippingAddress.zipCode,
        } : undefined,
      },
      back_urls: {
        success: `${baseUrl}/payment/success`,
        failure: `${baseUrl}/payment/failure`,
        pending: `${baseUrl}/payment/pending`,
      },
      auto_return: 'approved',
      notification_url: `${getSupabaseUrl()}/functions/v1/mercadopago-webhook`,
      statement_descriptor: 'LUINATIQUE',
      external_reference: this.generateExternalReference(),
      expires: true,
      expiration_date_to: this.getExpirationDate(),
      payment_methods: {
        installments: 12,
        excluded_payment_types: [
          // Puedes excluir tipos de pago si lo deseas
          // { id: 'ticket' }, // Excluir pagos en efectivo
        ],
      },
      shipments: checkoutData.shippingAddress ? {
        mode: 'me2',
        receiver_address: {
          zip_code: checkoutData.shippingAddress.zipCode,
          street_number: parseInt(checkoutData.shippingAddress.number),
          street_name: checkoutData.shippingAddress.street,
          city_name: checkoutData.shippingAddress.city,
          state_name: checkoutData.shippingAddress.state,
          country_name: 'Perú',
        },
      } : undefined,
      metadata: {
        customer_email: checkoutData.customer.email,
        order_timestamp: new Date().toISOString(),
      },
    };

    console.log('Built preference request:', preference);
    return preference;
  }

  /**
   * Genera una referencia externa única
   */
  private generateExternalReference(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `LUINA_${timestamp}_${random}`;
  }

  /**
   * Obtiene la fecha de expiración (24 horas desde ahora)
   */
  private getExpirationDate(): string {
    const expiration = new Date();
    expiration.setHours(expiration.getHours() + 24);
    return expiration.toISOString();
  }

  /**
   * Mapea el collection_status al formato de PaymentStatus
   */
  private mapCollectionStatusToPaymentStatus(collectionStatus: string): PaymentStatus['status'] {
    const statusMap: { [key: string]: PaymentStatus['status'] } = {
      'approved': 'approved',
      'pending': 'pending',
      'in_process': 'in_process',
      'rejected': 'rejected',
      'cancelled': 'cancelled',
      'refunded': 'refunded',
      'charged_back': 'charged_back',
    };

    return statusMap[collectionStatus] || 'pending';
  }

  /**
   * Redirige al checkout de MercadoPago
   */
  redirectToCheckout(preference: PreferenceResponse, useSandbox: boolean = true): void {
    const checkoutUrl = useSandbox ? preference.sandbox_init_point : preference.init_point;
    console.log('Redirecting to checkout:', checkoutUrl);
    window.location.href = checkoutUrl;
  }

  /**
   * Calcula el total de un carrito
   */
  calculateTotal(items: CartItem[]): number {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  /**
   * Formatea un precio para mostrar
   */
  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(price);
  }
}

// Export singleton instance
export const mercadoPagoService = MercadoPagoService.getInstance();
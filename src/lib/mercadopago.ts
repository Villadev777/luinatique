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
   * Verifica la configuración del servicio
   */
  async checkConfiguration(): Promise<{
    isConfigured: boolean;
    environment: 'development' | 'production';
    issues: string[];
  }> {
    const issues: string[] = [];
    
    // Check environment variables
    if (!import.meta.env.VITE_SUPABASE_URL) {
      issues.push('VITE_SUPABASE_URL not configured');
    }
    
    if (!import.meta.env.VITE_SUPABASE_ANON_KEY) {
      issues.push('VITE_SUPABASE_ANON_KEY not configured');
    }

    const environment = window.location.hostname === 'localhost' ? 'development' : 'production';
    
    return {
      isConfigured: issues.length === 0,
      environment,
      issues
    };
  }

  /**
   * Crea una preferencia de pago en MercadoPago
   */
  async createPreference(checkoutData: CheckoutData): Promise<PreferenceResponse> {
    try {
      const preferenceData: PreferenceRequest = this.buildPreferenceRequest(checkoutData);
      
      console.log('🚀 Creating MercadoPago preference...');
      console.log('📝 Preference data:', preferenceData);
      console.log('🔗 API URL:', `${MERCADOPAGO_API_URL}/mercadopago-create-preference`);
      
      const config = await this.checkConfiguration();
      console.log('⚙️ Configuration check:', config);

      if (!config.isConfigured) {
        throw new Error(`Configuration issues: ${config.issues.join(', ')}`);
      }
      
      const response = await fetch(`${MERCADOPAGO_API_URL}/mercadopago-create-preference`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(preferenceData),
      });

      console.log('📥 Response received:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        url: response.url
      });
      
      let responseData;
      const responseText = await response.text();
      
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ Failed to parse response as JSON:', responseText);
        throw new Error(`Invalid JSON response: ${responseText.substring(0, 200)}...`);
      }

      if (!response.ok) {
        console.error('❌ MercadoPago API Error:', {
          status: response.status,
          statusText: response.statusText,
          body: responseData
        });
        
        // Provide more specific error messages based on status
        let errorMessage = 'Error al crear la preferencia de pago';
        
        switch (response.status) {
          case 400:
            errorMessage = `Datos inválidos: ${responseData.error || 'Verifique los datos del producto'}`;
            break;
          case 401:
            errorMessage = 'Token de MercadoPago inválido o expirado';
            break;
          case 403:
            errorMessage = 'Acceso denegado. Verifique las credenciales de MercadoPago';
            break;
          case 404:
            errorMessage = 'Servicio no encontrado. Verifique que las Edge Functions estén desplegadas';
            break;
          case 500:
            errorMessage = `Error del servidor: ${responseData.details || responseData.error || 'Error interno'}`;
            break;
          default:
            errorMessage = `Error HTTP ${response.status}: ${responseData.error || response.statusText}`;
        }
        
        throw new Error(errorMessage);
      }

      const preference: PreferenceResponse = responseData;
      console.log('✅ Preference created successfully:', {
        id: preference.id,
        hasInitPoint: !!preference.init_point,
        hasSandboxPoint: !!preference.sandbox_init_point,
        external_reference: preference.external_reference
      });
      
      return preference;
    } catch (error) {
      console.error('❌ Error creating MercadoPago preference:', error);
      
      // Enhance error messages for better UX
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Error de conexión: No se pudo conectar al servidor. Verifique su conexión a internet.');
      }
      
      throw error instanceof Error ? error : new Error('Error desconocido al crear la preferencia');
    }
  }

  /**
   * Obtiene el estado de un pago
   */
  async getPaymentStatus(paymentId: string): Promise<PaymentStatus> {
    try {
      console.log('🔍 Getting payment status for ID:', paymentId);
      
      const response = await fetch(`${MERCADOPAGO_API_URL}/mercadopago-get-payment/${paymentId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Error getting payment status:', errorData);
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const payment: PaymentStatus = await response.json();
      console.log('✅ Payment status retrieved:', payment);
      return payment;
    } catch (error) {
      console.error('❌ Error getting payment status:', error);
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

    console.log('🔄 Processing payment callback with params:', {
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
        console.error('❌ Error processing payment callback:', error);
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
        source: 'luinatique_web',
        version: '1.0.0'
      },
    };

    console.log('🏗️ Built preference request:', preference);
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
   * Detecta automáticamente si debe usar PRODUCCIÓN o SANDBOX
   */
  redirectToCheckout(preference: PreferenceResponse): void {
    // DETECCIÓN AUTOMÁTICA: 
    // - Si existe sandbox_init_point → Usar SANDBOX (token TEST)
    // - Si solo existe init_point → Usar PRODUCCIÓN (token real)
    const hasSandbox = !!preference.sandbox_init_point;
    const hasProduction = !!preference.init_point;
    
    let checkoutUrl: string | undefined;
    let mode: 'SANDBOX' | 'PRODUCCIÓN' | 'UNKNOWN';
    
    if (hasSandbox) {
      // Token TEST - Usar sandbox
      checkoutUrl = preference.sandbox_init_point;
      mode = 'SANDBOX';
    } else if (hasProduction) {
      // Token PRODUCCIÓN - Usar producción
      checkoutUrl = preference.init_point;
      mode = 'PRODUCCIÓN';
    } else {
      mode = 'UNKNOWN';
    }
    
    console.log('🔗 Redirecting to checkout:', {
      mode,
      checkoutUrl,
      hasProductionUrl: hasProduction,
      hasSandboxUrl: hasSandbox,
      preference_id: preference.id
    });
    
    if (!checkoutUrl) {
      console.error('❌ No checkout URL available');
      console.error('Preference response:', preference);
      throw new Error('URL de checkout no disponible. Verifica tu configuración de MercadoPago.');
    }
    
    // Mensaje informativo según el modo
    if (mode === 'PRODUCCIÓN') {
      console.warn('⚠️ MODO PRODUCCIÓN: Los pagos serán REALES');
      console.warn('⚠️ Solo usa tarjetas reales en este modo');
    } else if (mode === 'SANDBOX') {
      console.log('✅ MODO SANDBOX: Usa tarjetas de prueba');
      console.log('💳 Tarjeta de prueba: 5031 7557 3453 0604');
    }
    
    // Redirigir a MercadoPago
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

  /**
   * Obtiene información de debug del servicio
   */
  getDebugInfo() {
    return {
      apiUrl: MERCADOPAGO_API_URL,
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
      hasAnonKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
      environment: window.location.hostname === 'localhost' ? 'development' : 'production',
      currentUrl: window.location.href,
      timestamp: new Date().toISOString()
    };
  }
}

// Export singleton instance
export const mercadoPagoService = MercadoPagoService.getInstance();
// 🎯 MercadoPago Service - Estructura verificada con n8n CEPEBAN
// ✨ Mejoras: DNI obligatorio, metadata enriquecida, category_id, mejor logging
// 🆕 BUNDLE: Agrupación automática de productos con precio < S/ 10
import { 
  PreferenceRequest, 
  PreferenceResponse, 
  PaymentStatus,
  CheckoutData,
  CartItem,
  OrderMetadata 
} from '../types/mercadopago';
import { getShippingConfig } from './shippingConfig';

// Get Supabase URL from environment
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

// Función para obtener la URL base correcta
const getBaseUrl = () => {
  if (window.location.hostname !== 'localhost') {
    return window.location.origin;
  }
  return window.location.origin;
};

const MERCADOPAGO_API_URL = `${getSupabaseUrl()}/functions/v1`;

// 🆕 Constantes de validación para PRODUCCIÓN
const MIN_PRODUCT_PRICE = 10; // Mínimo S/ 10 por producto
const MIN_ORDER_TOTAL = 15; // Mínimo S/ 15 para la orden completa

export class MercadoPagoService {
  private static instance: MercadoPagoService;

  static getInstance(): MercadoPagoService {
    if (!MercadoPagoService.instance) {
      MercadoPagoService.instance = new MercadoPagoService();
    }
    return MercadoPagoService.instance;
  }

  async checkConfiguration(): Promise<{
    isConfigured: boolean;
    environment: 'development' | 'production';
    issues: string[];
  }> {
    const issues: string[] = [];
    
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

  async calculateShipping(subtotal: number): Promise<number> {
    const config = await getShippingConfig();
    return subtotal >= config.freeShippingThreshold ? 0 : config.shippingCost;
  }

  async createPreference(checkoutData: CheckoutData): Promise<PreferenceResponse> {
    try {
      // ✨ Validar DNI antes de crear preferencia
      if (!checkoutData.customer.dni) {
        throw new Error('El DNI es obligatorio para procesar el pago');
      }

      // Validar monto mínimo
      const subtotal = this.calculateTotal(checkoutData.items);
      const shippingCost = await this.calculateShipping(subtotal);
      const total = subtotal + shippingCost;
      
      if (total < MIN_ORDER_TOTAL) {
        throw new Error(`El monto mínimo de compra es S/ ${MIN_ORDER_TOTAL}`);
      }

      const preferenceData: PreferenceRequest = await this.buildPreferenceRequest(checkoutData);
      
      console.log('🚀 Creating MercadoPago preference...');
      console.log('📝 Preference data:', JSON.stringify(preferenceData, null, 2));
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
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Error de conexión: No se pudo conectar al servidor. Verifique su conexión a internet.');
      }
      
      throw error instanceof Error ? error : new Error('Error desconocido al crear la preferencia');
    }
  }

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

    if (payment_id) {
      try {
        return await this.getPaymentStatus(payment_id);
      } catch (error) {
        console.error('❌ Error processing payment callback:', error);
      }
    }

    if (collection_status && external_reference) {
      return {
        id: collection_id || payment_id || '',
        status: this.mapCollectionStatusToPaymentStatus(collection_status),
        status_detail: collection_status,
        external_reference: external_reference,
        preference_id: preference_id || '',
        payment_method_id: payment_type || '',
        payment_type_id: payment_type || '',
        transaction_amount: 0,
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
   * 🎯 SOLUCIÓN BUNDLE: Agrupar productos de bajo precio
   * 
   * Estrategia:
   * 1. Si hay items < S/ 10 y el subtotal >= S/ 10 → Crear bundle
   * 2. Si hay items < S/ 10 y el subtotal < S/ 10 → Error (agregar más productos)
   * 3. Si todos los items >= S/ 10 → Enviar normalmente
   */
  private async buildPreferenceRequest(checkoutData: CheckoutData): Promise<PreferenceRequest> {
    const baseUrl = getBaseUrl();
    
    console.log('🏗️ Building preference with base URL:', baseUrl);
    
    // Calcular subtotal
    const subtotal = checkoutData.items.reduce((total, item) => 
      total + (item.price * item.quantity), 0
    );
    
    // Obtener configuración dinámica
    const shippingCost = await this.calculateShipping(subtotal);
    
    console.log('📦 Shipping calculation:', {
      subtotal: subtotal.toFixed(2),
      shippingCost: shippingCost.toFixed(2),
      isFreeShipping: shippingCost === 0
    });
    
    // ✨ Generar ID único al estilo CEPEBAN
    const timestamp = new Date().getTime();
    const userId = checkoutData.customer.email.split('@')[0];
    const baseId = `LUINA-${userId}-${timestamp}`;
    
    // ✅ ESTRATEGIA: Si hay items con precio < S/ 10, agrupar en un bundle
    const hasLowPriceItems = checkoutData.items.some(item => item.price < MIN_PRODUCT_PRICE);
    
    let items: any[];
    
    if (hasLowPriceItems && subtotal >= MIN_PRODUCT_PRICE) {
      // ✅ Crear un bundle con todos los productos
      console.log('📦 Creando bundle por productos de precio bajo');
      
      const itemsDescription = checkoutData.items
        .map(item => `${item.quantity}x ${item.title}`)
        .join(', ');
      
      items = [{
        id: `${baseId}-bundle`,
        title: 'Compra Múltiple',
        description: itemsDescription.substring(0, 256),
        category_id: 'fashion',
        quantity: 1,
        currency_id: 'PEN',
        unit_price: Math.round(subtotal * 100) / 100,
        picture_url: checkoutData.items[0].image
      }];
      
      console.log('✅ Bundle creado:', {
        total: subtotal,
        items: itemsDescription
      });
      
    } else if (hasLowPriceItems && subtotal < MIN_PRODUCT_PRICE) {
      // ❌ Total es menor al mínimo incluso agrupado
      throw new Error(
        `El total de la compra (S/ ${subtotal.toFixed(2)}) es menor al mínimo requerido de S/ ${MIN_PRODUCT_PRICE}. ` +
        `Agregue más productos al carrito.`
      );
      
    } else {
      // ✅ Todos los productos cumplen el mínimo - enviar normalmente
      items = checkoutData.items.map(item => ({
        id: `${baseId}-${item.id}`,
        title: item.title.substring(0, 256),
        description: item.description || `${item.title} - Lunatique Shop`,
        category_id: 'fashion',
        quantity: item.quantity,
        currency_id: 'PEN',
        unit_price: Math.round(item.price * 100) / 100,
        picture_url: item.image
      }));
    }
    
    // Agregar envío como item si no es gratis
    if (shippingCost > 0) {
      items.push({
        id: `${baseId}-shipping`,
        title: 'Costo de Envío',
        description: 'Envío a domicilio',
        category_id: 'services',
        quantity: 1,
        currency_id: 'PEN',
        unit_price: shippingCost
      });
      console.log('✅ Added shipping item:', shippingCost);
    }
    
    // ✨ Separar nombre completo en name y surname
    const fullName = checkoutData.customer.name || 'Cliente';
    const nameParts = fullName.trim().split(' ');
    const name = nameParts[0];
    const surname = nameParts.slice(1).join(' ') || name;
    
    // ✨ Validar street_number
    const streetNumber = checkoutData.shippingAddress?.number 
      ? parseInt(checkoutData.shippingAddress.number) || 1 
      : 1;
    
    // ✨ CRÍTICO: Construir payer con identification obligatoria
    const preference: PreferenceRequest = {
      items,
      payer: {
        name: name,
        surname: surname,
        email: checkoutData.customer.email,
        phone: checkoutData.customer.phone ? {
          number: checkoutData.customer.phone
        } : undefined,
        identification: {
          type: 'DNI',
          number: checkoutData.customer.dni
        },
        address: checkoutData.shippingAddress ? {
          street_name: checkoutData.shippingAddress.street,
          street_number: streetNumber,
          zip_code: checkoutData.shippingAddress.zipCode
        } : undefined
      },
      back_urls: {
        success: `${baseUrl}/payment/success`,
        pending: `${baseUrl}/payment/success`,
        failure: `${baseUrl}/payment/success`
      },
      auto_return: 'approved',
      notification_url: `${getSupabaseUrl()}/functions/v1/mercadopago-webhook`,
      external_reference: baseId,
      metadata: {
        user_id: checkoutData.customer.email.replace('@', '_at_'),
        dni: checkoutData.customer.dni,
        phone: checkoutData.customer.phone || '',
        address: checkoutData.shippingAddress?.street || '',
        email: checkoutData.customer.email,
        full_name: fullName,
        timestamp: timestamp.toString(),
        source: 'lunatique_web',
        version: '2.1.0',
        subtotal: subtotal.toFixed(2),
        shipping_cost: shippingCost.toFixed(2),
        items_count: checkoutData.items.length,
        environment: window.location.hostname === 'localhost' ? 'development' : 'production'
      } as OrderMetadata,
      payment_methods: {
        installments: 12,
        excluded_payment_types: []
      },
      shipments: checkoutData.shippingAddress ? {
        mode: 'me2',
        receiver_address: {
          zip_code: checkoutData.shippingAddress.zipCode,
          street_number: streetNumber,
          street_name: checkoutData.shippingAddress.street,
          city_name: checkoutData.shippingAddress.city || 'Lima',
          state_name: checkoutData.shippingAddress.state || 'Lima',
          country_name: 'Perú'
        }
      } : undefined,
      statement_descriptor: 'LUNATIQUE',
      expires: true,
      expiration_date_to: this.getExpirationDate()
    };

    console.log('🏗️ Built preference (n8n-compatible):', JSON.stringify(preference, null, 2));
    return preference;
  }

  private generateExternalReference(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `LUINA_${timestamp}_${random}`;
  }

  private getExpirationDate(): string {
    const expiration = new Date();
    expiration.setHours(expiration.getHours() + 24);
    return expiration.toISOString();
  }

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

  redirectToCheckout(preference: PreferenceResponse): void {
    const hasProduction = !!preference.init_point;
    const hasSandbox = !!preference.sandbox_init_point;
    
    let checkoutUrl: string | undefined;
    let mode: 'SANDBOX' | 'PRODUCCIÓN' | 'UNKNOWN';
    
    // Detectar modo basándose en qué URL está disponible
    if (hasSandbox && !hasProduction) {
      checkoutUrl = preference.sandbox_init_point;
      mode = 'SANDBOX';
      console.log('✅ Token TEST detectado - Usando modo SANDBOX');
      console.log('💳 Usa tarjetas de prueba de MercadoPago');
    } else if (hasProduction) {
      checkoutUrl = preference.init_point;
      mode = 'PRODUCCIÓN';
      console.log('✅ Token PRODUCCIÓN detectado - Usando modo PRODUCCIÓN');
      console.warn('⚠️ ADVERTENCIA: Los pagos serán REALES');
    } else {
      mode = 'UNKNOWN';
      console.error('❌ No hay URLs disponibles en la preferencia');
    }
    
    console.log('🔗 Redirecting to checkout:', {
      mode,
      checkoutUrl,
      hasProductionUrl: hasProduction,
      hasSandboxUrl: hasSandbox,
      preference_id: preference.id,
      production_url: preference.init_point || 'N/A',
      sandbox_url: preference.sandbox_init_point || 'N/A'
    });
    
    if (!checkoutUrl) {
      console.error('❌ No checkout URL available');
      console.error('Preference response:', preference);
      throw new Error('URL de checkout no disponible. Verifica tu configuración de MercadoPago.');
    }
    
    // Mensaje según el modo
    if (mode === 'PRODUCCIÓN') {
      console.warn('⚠️ MODO PRODUCCIÓN: Los pagos serán REALES');
      console.warn('⚠️ Solo usa tarjetas reales en este modo');
    } else if (mode === 'SANDBOX') {
      console.log('✅ MODO SANDBOX: Usa tarjetas de prueba');
      console.log('💳 Tarjeta de prueba APPROVED: 5031 7557 3453 0604');
      console.log('🔐 Código de seguridad: 123');
      console.log('📅 Fecha: Cualquier fecha futura');
    }
    
    // Delay antes de redirigir
    console.log('⏳ Esperando 500ms antes de redirigir...');
    setTimeout(() => {
      console.log('➡️ Redirigiendo a:', checkoutUrl);
      
      try {
        window.location.assign(checkoutUrl!);
      } catch (error) {
        console.error('❌ Error al redirigir con assign:', error);
        console.log('🔄 Intentando con href como fallback...');
        window.location.href = checkoutUrl!;
      }
    }, 500);
  }

  calculateTotal(items: CartItem[]): number {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(price);
  }

  getDebugInfo() {
    return {
      apiUrl: MERCADOPAGO_API_URL,
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
      hasAnonKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
      environment: window.location.hostname === 'localhost' ? 'development' : 'production',
      currentUrl: window.location.href,
      baseUrl: getBaseUrl(),
      timestamp: new Date().toISOString(),
      minProductPrice: MIN_PRODUCT_PRICE,
      minOrderTotal: MIN_ORDER_TOTAL,
      version: '2.2.0-bundle-strategy'
    };
  }
}

// Export singleton instance
export const mercadoPagoService = MercadoPagoService.getInstance();

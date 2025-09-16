export interface MercadoPagoConfig {
  accessToken: string;
  environment: 'sandbox' | 'production';
}

export interface PreferenceItem {
  id?: string;
  title: string;
  category_id?: string;
  quantity: number;
  currency_id: string;
  unit_price: number;
  description?: string;
  picture_url?: string;
}

export interface Payer {
  name?: string;
  surname?: string;
  email?: string;
  phone?: {
    area_code?: string;
    number?: string;
  };
  identification?: {
    type?: string;
    number?: string;
  };
  address?: {
    street_name?: string;
    street_number?: number;
    zip_code?: string;
  };
}

export interface BackUrls {
  success?: string;
  failure?: string;
  pending?: string;
}

export interface PaymentMethods {
  excluded_payment_methods?: Array<{
    id: string;
  }>;
  excluded_payment_types?: Array<{
    id: string;
  }>;
  installments?: number;
  default_payment_method_id?: string;
  default_installments?: number;
}

export interface PreferenceRequest {
  items: PreferenceItem[];
  payer?: Payer;
  back_urls?: BackUrls;
  auto_return?: 'approved' | 'all';
  payment_methods?: PaymentMethods;
  notification_url?: string;
  statement_descriptor?: string;
  external_reference?: string;
  expires?: boolean;
  expiration_date_from?: string;
  expiration_date_to?: string;
  marketplace?: string;
  marketplace_fee?: number;
  differential_pricing?: {
    id: number;
  };
  binary_mode?: boolean;
  taxes?: Array<{
    type: string;
    value: number;
  }>;
  shipments?: {
    mode?: string;
    local_pickup?: boolean;
    dimensions?: string;
    receiver_address?: {
      zip_code?: string;
      street_number?: number;
      street_name?: string;
      floor?: string;
      apartment?: string;
      city_name?: string;
      state_name?: string;
      country_name?: string;
    };
  };
  metadata?: Record<string, any>;
}

export interface PreferenceResponse {
  id: string;
  init_point: string;
  sandbox_init_point: string;
  date_created: string;
  items: PreferenceItem[];
  payer: Payer;
  back_urls: BackUrls;
  auto_return: string;
  payment_methods: PaymentMethods;
  notification_url: string;
  statement_descriptor: string;
  external_reference: string;
  expires: boolean;
  expiration_date_from: string;
  expiration_date_to: string;
  collector_id: number;
  client_id: string;
  marketplace: string;
  marketplace_fee: number;
  operation_type: string;
  additional_info: string;
  purpose: string;
}

export interface PaymentStatus {
  id: string;
  status: 'pending' | 'approved' | 'authorized' | 'in_process' | 'in_mediation' | 'rejected' | 'cancelled' | 'refunded' | 'charged_back';
  status_detail: string;
  external_reference: string;
  preference_id: string;
  payment_method_id: string;
  payment_type_id: string;
  transaction_amount: number;
  date_created: string;
  date_approved?: string;
  payer: {
    id: string;
    email: string;
    identification: {
      type: string;
      number: string;
    };
  };
}

export interface PaymentNotification {
  action: 'payment.created' | 'payment.updated';
  api_version: string;
  data: {
    id: string;
  };
  date_created: string;
  id: number;
  live_mode: boolean;
  type: 'payment';
  user_id: string;
}

export interface CartItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
  description?: string;
}

export interface CheckoutData {
  items: CartItem[];
  customer: {
    email: string;
    name?: string;
    phone?: string;
  };
  shippingAddress?: {
    street: string;
    number: string;
    zipCode: string;
    city: string;
    state: string;
  };
}
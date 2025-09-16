// PayPal integration types
export interface PayPalOrder {
  intent: 'CAPTURE' | 'AUTHORIZE';
  purchase_units: PayPalPurchaseUnit[];
  application_context?: {
    brand_name?: string;
    landing_page?: 'LOGIN' | 'BILLING' | 'NO_PREFERENCE';
    user_action?: 'PAY_NOW' | 'CONTINUE';
    return_url?: string;
    cancel_url?: string;
  };
}

export interface PayPalPurchaseUnit {
  reference_id?: string;
  amount: {
    currency_code: string;
    value: string;
    breakdown?: {
      item_total?: {
        currency_code: string;
        value: string;
      };
      shipping?: {
        currency_code: string;
        value: string;
      };
      tax_total?: {
        currency_code: string;
        value: string;
      };
    };
  };
  items?: PayPalItem[];
  shipping?: {
    name?: {
      full_name: string;
    };
    address?: {
      address_line_1: string;
      address_line_2?: string;
      admin_area_2: string; // city
      admin_area_1: string; // state
      postal_code: string;
      country_code: string;
    };
  };
}

export interface PayPalItem {
  name: string;
  unit_amount: {
    currency_code: string;
    value: string;
  };
  quantity: string;
  description?: string;
  category?: 'DIGITAL_GOODS' | 'PHYSICAL_GOODS';
}

export interface PayPalOrderResponse {
  id: string;
  status: 'CREATED' | 'SAVED' | 'APPROVED' | 'VOIDED' | 'COMPLETED' | 'PAYER_ACTION_REQUIRED';
  links: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
}

export interface PayPalCaptureResponse {
  id: string;
  status: 'COMPLETED' | 'DECLINED' | 'PARTIALLY_REFUNDED' | 'PENDING' | 'REFUNDED';
  purchase_units: Array<{
    reference_id: string;
    payments: {
      captures: Array<{
        id: string;
        status: string;
        amount: {
          currency_code: string;
          value: string;
        };
      }>;
    };
  }>;
  payer: {
    name?: {
      given_name: string;
      surname: string;
    };
    email_address?: string;
    payer_id: string;
  };
}

// PayPal SDK types for window object
declare global {
  interface Window {
    paypal?: {
      Buttons: (options: PayPalButtonsOptions) => {
        render: (selector: string) => Promise<void>;
      };
    };
  }
}

export interface PayPalButtonsOptions {
  createOrder: () => Promise<string>;
  onApprove: (data: { orderID: string }) => Promise<void>;
  onError?: (err: any) => void;
  onCancel?: (data: { orderID: string }) => void;
  style?: {
    layout?: 'vertical' | 'horizontal';
    color?: 'gold' | 'blue' | 'silver' | 'white' | 'black';
    shape?: 'rect' | 'pill';
    label?: 'paypal' | 'checkout' | 'buynow' | 'pay' | 'installment';
    tagline?: boolean;
  };
}
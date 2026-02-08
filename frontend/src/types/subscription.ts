export interface SubscriptionLine {
    id: number;
    subscription_id: number;
    product_id?: number;
    product_name_snapshot: string;
    unit_price_snapshot: number;
    quantity: number;
    tax_percent: number;
    discount_percent: number;
    line_total: number;
}

export interface SubscriptionLineCreate {
    product_id?: number;
    product_name_snapshot: string;
    unit_price_snapshot: number;
    quantity: number;
    tax_percent?: number;
    discount_percent?: number;
    line_total: number;
}

export interface Subscription {
    id: number;
    subscription_number: string; // Added
    customer_id: number;         // Added
    plan_id: number;
    status: string; // Changed from 'draft' | 'active'
    start_date: string;          // Added
    end_date?: string;          // Added
    next_billing_date?: string;  // Changed from required
    subtotal?: number;           // Added
    tax_total?: number;          // Added
    discount_total?: number;     // Added
    grand_total?: number;        // Added
    created_at?: string;         // Added
    confirmed_at?: string;       // Added
    closed_at?: string;          // Added
    subscription_lines?: SubscriptionLine[]; // Added
}

export interface SubscriptionCreate {
    subscription_number: string;
    customer_id?: number;
    plan_id: number;
    status?: string; // Optional, defaults to "draft" in backend
    start_date: string;
    end_date?: string;
    payment_terms?: string; // Added
    subscription_lines: SubscriptionLineCreate[];
}

export interface SubscriptionConfirmResponse {
    status: string;
    invoice_id: number;
    next_billing_date: string;
    confirmed_at: string;
    subtotal: number;
    tax_total: number;
    discount_total: number;
    grand_total: number;
}
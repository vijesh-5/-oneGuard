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
    subscription_number: string;
    customer_id: number;
    plan_id: number;
    status: 'draft' | 'quotation' | 'confirmed' | 'active' | 'closed';
    start_date: string;
    end_date?: string;
    next_billing_date?: string;
    payment_terms?: string;
    subtotal: number;
    tax_total: number;
    discount_total: number;
    grand_total: number;
    created_at: string;
    confirmed_at?: string;
    closed_at?: string;
    subscription_lines: SubscriptionLine[];
}

export interface SubscriptionCreate {
    subscription_number: string;
    customer_id: number;
    plan_id: number;
    status?: string;
    start_date: string;
    end_date?: string;
    payment_terms?: string;
    subscription_lines: SubscriptionLineCreate[];
}
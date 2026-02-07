import { Payment } from './financials';

export interface InvoiceLine {
    id: number;
    invoice_id: number;
    product_name: string;
    unit_price: number;
    quantity: number;
    tax_percent: number;
    discount_percent: number;
    line_total: number;
}

export interface Invoice {
    id: number;
    invoice_number: string;
    subscription_id: number;
    customer_id: number;
    issue_date: string;
    due_date: string;
    status: 'draft' | 'confirmed' | 'paid' | 'cancelled';
    subtotal: number;
    tax_total: number;
    discount_total: number;
    grand_total: number;
    invoice_lines: InvoiceLine[];
    payments: Payment[];
}
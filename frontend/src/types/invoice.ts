export interface Invoice {
    id: number;
    subscription_id: number;
    grand_total: number;
    status: 'paid' | 'pending' | 'overdue' | 'draft' | 'confirmed' | 'cancelled';
    due_date: string;
    issue_date: string;
    payment_method?: string;
    paid_date?: string;
}

export interface InvoicePay {
    payment_method: string;
}

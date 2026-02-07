export interface Invoice {
    id: number;
    subscription_id: number;
    amount: number;
    status: 'paid' | 'pending' | 'overdue';
    due_date: string;
    payment_method?: string;
    paid_date?: string;
}

export interface Tax {
    id: number;
    name: string;
    percent: number;
    is_active: boolean;
}

export interface Discount {
    id: number;
    name: string;
    type: string;
    value: number;
    start_date?: string;
    end_date?: string;
    usage_limit?: number;
}

export interface Payment {
    id: number;
    invoice_id: number;
    amount: number;
    method: string;
    reference_id?: string;
    status: 'pending' | 'completed' | 'failed';
    payment_date: string;
}

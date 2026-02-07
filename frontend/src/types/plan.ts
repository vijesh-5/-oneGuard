export interface Plan {
    id: number;
    product_id: number;
    name: string;
    interval: string;
    price: number;
    billing_cycle: string;
    renewal_allowed: boolean;
    pause_allowed: boolean;
    validity_start_date?: string;
    validity_end_date?: string;
}

export interface PlanCreate {
    product_id: number;
    name: string;
    interval: string;
    price: number;
    billing_cycle: string;
    renewal_allowed?: boolean;
    pause_allowed?: boolean;
    validity_start_date?: string;
    validity_end_date?: string;
}

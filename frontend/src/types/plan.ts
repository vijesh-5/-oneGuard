export interface Plan {
    id: number;
    product_id: number;
    name: string;
    billing_period: string; // Changed from interval
    price: number;
    min_quantity: number;
    auto_close: boolean;
    pausable: boolean;
    renewable: boolean;
    start_date?: string;
    end_date?: string;
}

export interface PlanCreate {
    product_id: number;
    name: string;
    billing_period: string; // Changed from interval
    price: number;
    min_quantity?: number;
    auto_close?: boolean;
    pausable?: boolean;
    renewable?: boolean;
    start_date?: string;
    end_date?: string;
}

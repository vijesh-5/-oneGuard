export interface Product {
    id: number;
    name: string;
    base_price: number;
    type?: string;
    description?: string;
    is_active: boolean;
    created_at: string;
}

export interface ProductCreate {
    name: string;
    base_price: number;
    type?: string;
    description?: string;
    is_active?: boolean;
}
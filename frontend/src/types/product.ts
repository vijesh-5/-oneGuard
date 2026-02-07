export interface Product {
    id: number;
    name: string;
    base_price: number;
    is_active: boolean;
    description: string;
    type: string;
}

export interface ProductCreate {
    name: string;
    base_price: number;
    is_active?: boolean;
    description?: string;
    type?: string;
}

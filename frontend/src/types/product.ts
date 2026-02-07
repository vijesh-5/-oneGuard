export interface Product {
    id: number;
    name: string;
    base_price: number;
}

export interface ProductCreate {
    name: string;
    base_price: number;
}

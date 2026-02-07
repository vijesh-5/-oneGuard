export interface Plan {
    id: number;
    product_id: number;
    name: string;
    interval: string;
    price: number;
}

export interface PlanCreate {
    product_id: number;
    name: string;
    interval: string;
    price: number;
}

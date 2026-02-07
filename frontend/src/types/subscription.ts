export interface Subscription {
    id: number;
    customer_name: string;
    plan_id: number;
    status: 'draft' | 'active';
    start_date: string;
    next_billing_date: string;
}

export interface SubscriptionCreate {
    customer_name: string;
    plan_id: number;
}

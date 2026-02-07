import { Subscription, SubscriptionCreate } from '../types/subscription';
// import api from './api';

const MOCK_SUBS: Subscription[] = [
    { id: 101, customer_name: 'John Doe', plan_id: 1, status: 'active', start_date: '2023-01-01', next_billing_date: '2023-02-01' }
];

const SubscriptionService = {
    getAll: async (): Promise<Subscription[]> => {
        await new Promise(resolve => setTimeout(resolve, 300));
        return [...MOCK_SUBS];
        // return (await api.get('/subscriptions')).data;
    },

    create: async (data: SubscriptionCreate): Promise<Subscription> => {
        await new Promise(resolve => setTimeout(resolve, 600));
        
        // Mock Logic for dates
        const start = new Date().toISOString().split('T')[0];
        const next = new Date();
        next.setMonth(next.getMonth() + 1);

        const newSub: Subscription = {
            id: Date.now(),
            ...data,
            status: 'draft',
            start_date: start,
            next_billing_date: next.toISOString().split('T')[0]
        };
        MOCK_SUBS.push(newSub);
        return newSub;
        // return (await api.post('/subscriptions', data)).data;
    }
};

export default SubscriptionService;

import { Plan, PlanCreate } from '../types/plan';
import api from './api';

// const MOCK_PLANS: Plan[] = [
//     { id: 1, product_id: 1, name: 'Standard Monthly', interval: 'monthly', price: 10.99 },
//     { id: 2, product_id: 1, name: 'Standard Yearly', interval: 'yearly', price: 120.00 },
//     { id: 3, product_id: 2, name: 'Premium Student', interval: 'monthly', price: 4.99 },
// ];

const PlanService = {
    getAll: async (): Promise<Plan[]> => {
        // await new Promise(resolve => setTimeout(resolve, 300));
        // return [...MOCK_PLANS];
        return (await api.get('/plans/')).data;
    },

    create: async (data: PlanCreate): Promise<Plan> => {
        // await new Promise(resolve => setTimeout(resolve, 500));
        // const newPlan = { id: Date.now(), ...data };
        // MOCK_PLANS.push(newPlan);
        // return newPlan;
        return (await api.post('/plans/', data)).data;
    }
};

export default PlanService;

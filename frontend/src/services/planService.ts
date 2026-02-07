import { Plan, PlanCreate } from '../types/plan';
import api from './api';

const PlanService = {
    getAll: async (): Promise<Plan[]> => {
        const response = await api.get('/plans/');
        return response.data;
    },

    getById: async (id: number): Promise<Plan> => {
        const response = await api.get(`/plans/${id}`);
        return response.data;
    },

    getByProductId: async (productId: number): Promise<Plan[]> => {
        const response = await api.get(`/plans/product/${productId}`);
        return response.data;
    },

    create: async (data: PlanCreate): Promise<Plan> => {
        const response = await api.post('/plans/', data);
        return response.data;
    },

    update: async (id: number, data: Partial<PlanCreate>): Promise<Plan> => {
        const response = await api.patch(`/plans/${id}`, data);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/plans/${id}`);
    }
};

export default PlanService;
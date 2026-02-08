import { Subscription, SubscriptionCreate } from '../types/subscription';
import api from './api';

const SubscriptionService = {
    getAll: async (): Promise<Subscription[]> => {
        const response = await api.get('/subscriptions/');
        return response.data;
    },

    getById: async (id: number): Promise<Subscription> => {
        const response = await api.get(`/subscriptions/${id}`);
        return response.data;
    },

    create: async (data: SubscriptionCreate): Promise<Subscription> => {
        const response = await api.post('/subscriptions/', data);
        return response.data;
    },

    confirm: async (id: number): Promise<Subscription> => {
        const response = await api.patch(`/subscriptions/${id}/confirm`);
        return response.data;
    },

    update: async (id: number, data: Partial<SubscriptionCreate>): Promise<Subscription> => {
        const response = await api.patch(`/subscriptions/${id}`, data);
        return response.data;
    },

    cancel: async (id: number): Promise<void> => {
        await api.patch(`/subscriptions/${id}/cancel`);
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/subscriptions/${id}`);
    }
};

export default SubscriptionService;
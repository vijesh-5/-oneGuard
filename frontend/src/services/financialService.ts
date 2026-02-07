import { Tax, Discount, Payment } from '../types/financials';
import api from './api';

export const TaxService = {
    getAll: async (): Promise<Tax[]> => {
        const response = await api.get('/taxes/');
        return response.data;
    },
    create: async (data: Partial<Tax>): Promise<Tax> => {
        const response = await api.post('/taxes/', data);
        return response.data;
    }
};

export const DiscountService = {
    getAll: async (): Promise<Discount[]> => {
        const response = await api.get('/discounts/');
        return response.data;
    },
    create: async (data: Partial<Discount>): Promise<Discount> => {
        const response = await api.post('/discounts/', data);
        return response.data;
    }
};

export const PaymentService = {
    getAll: async (): Promise<Payment[]> => {
        const response = await api.get('/payments/');
        return response.data;
    },
    create: async (data: Partial<Payment>): Promise<Payment> => {
        const response = await api.post('/payments/', data);
        return response.data;
    }
};

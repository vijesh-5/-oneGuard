import { Invoice } from '../types/invoice';
import api from './api';

const InvoiceService = {
    getAll: async (): Promise<Invoice[]> => {
        const response = await api.get('/invoices/');
        return response.data;
    },

    getById: async (id: number): Promise<Invoice> => {
        const response = await api.get(`/invoices/${id}`);
        return response.data;
    },

    updateStatus: async (id: number, status: string): Promise<Invoice> => {
        const response = await api.patch(`/invoices/${id}/status`, { status });
        return response.data;
    }
};

export default InvoiceService;
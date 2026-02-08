import { Invoice } from '../types/invoice';
import api from './api';

const InvoiceService = {
    getAll: async (): Promise<Invoice[]> => {
        return (await api.get('/invoices/')).data;
    },
    // Adding a getById method for consistency and use in Invoice.tsx
    getById: async (invoiceId: number): Promise<Invoice> => {
        return (await api.get(`/invoices/${invoiceId}/`)).data;
    },
    pay: async (invoiceId: number, paymentMethod: string): Promise<Invoice> => {
        return (await api.patch(`/invoices/${invoiceId}/pay`, { payment_method: paymentMethod })).data;
    }
};

export default InvoiceService;
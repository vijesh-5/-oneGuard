import { Invoice } from '../types/invoice';
// import api from './api';

const MOCK_INVOICES: Invoice[] = [
    { id: 5001, subscription_id: 101, amount: 10.99, status: 'paid', due_date: '2023-01-01' },
    { id: 5002, subscription_id: 101, amount: 10.99, status: 'pending', due_date: '2023-02-01' },
];

const InvoiceService = {
    getAll: async (): Promise<Invoice[]> => {
        await new Promise(resolve => setTimeout(resolve, 300));
        return [...MOCK_INVOICES];
        // return (await api.get('/invoices')).data;
    }
};

export default InvoiceService;

import api from './api';

export interface Customer {
    id: number;
    owner_id: number;
    name: string;
    email: string;
    portal_user_id?: number;
}

export interface CustomerCreate {
    name: string;
    email: string;
    portal_user_id?: number;
}

const CustomerService = {
    getAll: async (): Promise<Customer[]> => {
        const response = await api.get<Customer[]>('/customers/');
        return response.data;
    },

    getById: async (id: number): Promise<Customer> => {
        const response = await api.get<Customer>(`/customers/${id}`);
        return response.data;
    },

    create: async (customer: CustomerCreate): Promise<Customer> => {
        const response = await api.post<Customer>('/customers/', customer);
        return response.data;
    },

    invite: async (id: number): Promise<{username: string, password: string, portal_url: string}> => {
        const response = await api.post<{username: string, password: string, portal_url: string}>(`/customers/${id}/invite`);
        return response.data;
    }
};

export default CustomerService;

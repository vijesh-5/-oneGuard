import { Product, ProductCreate } from '../types/product';
import api from './api';

const ProductService = {
    getAll: async (): Promise<Product[]> => {
        const response = await api.get('/products/');
        return response.data;
    },

    getById: async (id: number): Promise<Product> => {
        const response = await api.get(`/products/${id}`);
        return response.data;
    },

    create: async (data: ProductCreate): Promise<Product> => {
        const response = await api.post('/products/', data);
        return response.data;
    },

    update: async (id: number, data: Partial<ProductCreate>): Promise<Product> => {
        const response = await api.patch(`/products/${id}`, data);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/products/${id}`);
    }
};

export default ProductService;
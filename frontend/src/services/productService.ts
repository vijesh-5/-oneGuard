import { Product, ProductCreate } from '../types/product';
// import api from './api';

const MOCK_PRODUCTS: Product[] = [
    { id: 1, name: 'Netflix Standard', base_price: 10.99 },
    { id: 2, name: 'Spotify Premium', base_price: 9.99 },
    { id: 3, name: 'Adobe Creative Cloud', base_price: 59.99 },
];

const ProductService = {
    getAll: async (): Promise<Product[]> => {
        await new Promise(resolve => setTimeout(resolve, 300));
        return [...MOCK_PRODUCTS];
        // return (await api.get('/products')).data;
    },

    create: async (data: ProductCreate): Promise<Product> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const newProduct = { id: Date.now(), ...data };
        MOCK_PRODUCTS.push(newProduct);
        return newProduct;
        // return (await api.post('/products', data)).data;
    }
};

export default ProductService;

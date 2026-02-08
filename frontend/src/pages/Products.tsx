import React, { useState, useEffect } from 'react';
import { Product, ProductCreate } from '../types/product';
import ProductService from '../services/productService';

const Products: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [newProduct, setNewProduct] = useState<ProductCreate>({
        name: '',
        base_price: 0,
        type: 'service',
        description: '',
        is_active: true
    });
    const [editingProductId, setEditingProductId] = useState<number | null>(null);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const data = await ProductService.getAll();
            setProducts(data);
        } catch (error) {
            console.error("Failed to fetch products", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        let processedValue: any = value;
        if (type === 'number') {
            processedValue = value === '' ? 0 : parseFloat(value);
        } else if (type === 'checkbox') {
            processedValue = (e.target as HTMLInputElement).checked;
        }

        setNewProduct(prev => ({
            ...prev,
            [name]: processedValue
        }));
    };

    const handleEdit = (product: Product) => {
        // Populate form with product data
        setNewProduct({
            name: product.name,
            base_price: product.base_price,
            type: product.type || 'service',
            description: product.description || '',
            is_active: product.is_active
        });
        setEditingProductId(product.id);
        setIsFormVisible(true);
    };

    const handleCancel = () => {
        setIsFormVisible(false);
        setEditingProductId(null);
        setNewProduct({ name: '', base_price: 0, type: 'service', description: '', is_active: true });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingProductId) {
                await ProductService.update(editingProductId, newProduct);
            } else {
                await ProductService.create(newProduct);
            }

            // Reset
            setNewProduct({
                name: '',
                base_price: 0,
                type: 'service',
                description: '',
                is_active: true
            });
            setEditingProductId(null);
            setIsFormVisible(false);
            fetchProducts();
        } catch (error) {
            console.error(editingProductId ? "Failed to update product" : "Failed to create product", error);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-4xl font-bold text-white tracking-tight">Products & Services</h2>
                    <p className="mt-2 text-slate-400">Manage your product catalog and default pricing.</p>
                </div>
                <button
                    onClick={() => {
                        if (isFormVisible) handleCancel();
                        else setIsFormVisible(true);
                    }}
                    className="btn-neon inline-flex items-center px-6 py-2.5 rounded-lg shadow-lg"
                >
                    {isFormVisible ? 'Cancel' : 'Create Product'}
                </button>
            </div>

            {isFormVisible && (
                <div className="glass-neon p-8 rounded-2xl mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-cyan-500 rounded-full"></span>
                        Product Details
                    </h3>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Product Name</label>
                            <input
                                type="text"
                                name="name"
                                required
                                value={newProduct.name}
                                onChange={handleInputChange}
                                className="input-glass w-full rounded-lg p-3"
                                placeholder="e.g. Premium Subscription"
                            />
                        </div>
                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Product Type</label>
                            <select
                                name="type"
                                value={newProduct.type}
                                onChange={handleInputChange}
                                className="input-glass w-full rounded-lg p-3 bg-slate-900"
                            >
                                <option value="service">Service</option>
                                <option value="digital">Digital Product</option>
                                <option value="physical">Physical Product</option>
                            </select>
                        </div>
                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Base Price (USD)</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-slate-500 sm:text-sm">$</span>
                                </div>
                                <input
                                    type="number"
                                    name="base_price"
                                    required
                                    min="0"
                                    step="0.01"
                                    value={newProduct.base_price || ''}
                                    onChange={handleInputChange}
                                    className="input-glass w-full pl-7 pr-12 rounded-lg p-3"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
                            <textarea
                                name="description"
                                rows={3}
                                value={newProduct.description}
                                onChange={handleInputChange}
                                className="input-glass w-full rounded-lg p-3"
                                placeholder="Enter product details..."
                            />
                        </div>
                        <div className="col-span-2 pt-4">
                            <button
                                type="submit"
                                className="w-full inline-flex justify-center py-3.5 px-4 rounded-lg shadow-lg text-sm font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 transition-all duration-300"
                            >
                                Confirm & Save Product
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="glass-panel overflow-hidden rounded-2xl">
                {loading ? (
                    <div className="p-12 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
                        <p className="mt-4 text-slate-400">Syncing with ERP...</p>
                    </div>
                ) : products.length === 0 ? (
                    <div className="p-16 text-center text-slate-500">
                        <div className="mb-4">
                            <span className="inline-block p-4 rounded-full bg-slate-800/50 text-slate-600">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                            </span>
                        </div>
                        <p className="text-lg font-medium text-slate-400">No products found</p>
                        <p className="text-sm mt-1">Create your first product to get started.</p>
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-slate-800">
                        <thead className="bg-slate-900/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Product</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Type</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Base Price</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {products.map((product) => (
                                <tr key={product.id} className="table-row-hover group">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">{product.name}</div>
                                        <div className="text-xs text-slate-500 truncate max-w-xs">{product.description || 'No description'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 border border-slate-700 text-slate-300 capitalize">
                                            {product.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2.5 py-1 rounded-md text-xs font-medium border ${product.is_active ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                                            {product.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-200">
                                        ${product.base_price.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleEdit(product)} className="text-cyan-500 hover:text-cyan-400 mr-4 transition-colors">Edit</button>
                                        <button className="text-slate-500 hover:text-slate-300 transition-colors">Configure Plans</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default Products;
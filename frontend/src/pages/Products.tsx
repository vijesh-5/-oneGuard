import React, { useState, useEffect } from 'react';
import { Product, ProductCreate } from '../types/product';
import ProductService from '../services/productService';

const Products: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [newProduct, setNewProduct] = useState<ProductCreate>({ name: '', base_price: 0, is_active: true, description: '', type: '' });
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<number | null>(null);

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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        // Handle checkbox separately
        const checked = (e.target as HTMLInputElement).checked;
        
        setNewProduct(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : (name === 'base_price' ? parseFloat(value) : value)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                await ProductService.update(editingId, newProduct);
            } else {
                await ProductService.create(newProduct);
            }
            resetForm();
            fetchProducts();
        } catch (error) {
            console.error("Failed to save product", error);
            alert("Failed to save product.");
        }
    };

    const handleEdit = (product: Product) => {
        setNewProduct({
            name: product.name,
            base_price: product.base_price,
            is_active: product.is_active,
            description: product.description,
            type: product.type
        });
        setEditingId(product.id);
        setIsFormVisible(true);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            try {
                await ProductService.delete(id);
                fetchProducts();
            } catch (error) {
                console.error("Failed to delete product", error);
                alert("Failed to delete product.");
            }
        }
    };

    const resetForm = () => {
        setNewProduct({ name: '', base_price: 0, is_active: true, description: '', type: '' });
        setEditingId(null);
        setIsFormVisible(false);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Products</h2>
                    <p className="text-slate-500 text-sm mt-1 font-medium">Configure and manage your service catalog.</p>
                </div>
                <button 
                    onClick={() => {
                        if (isFormVisible) resetForm();
                        else setIsFormVisible(true);
                    }}
                    className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm ${isFormVisible ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-200'}`}
                >
                    {isFormVisible ? 'Discard' : 'New Product'}
                </button>
            </div>

            {isFormVisible && (
                <div className="premium-card executive-shadow p-8">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">{editingId ? 'Modify Product' : 'Initialize Product'}</h3>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Product Identifier</label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={newProduct.name}
                                    onChange={handleInputChange}
                                    className="w-full h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all px-4 text-sm font-medium"
                                    placeholder="e.g. Enterprise Cloud Compute"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Base Unit Price</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">$</span>
                                    <input
                                        type="number"
                                        name="base_price"
                                        required
                                        min="0"
                                        step="0.01"
                                        value={newProduct.base_price}
                                        onChange={handleInputChange}
                                        className="w-full h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all pl-8 pr-4 text-sm font-medium"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Executive Summary</label>
                            <textarea
                                name="description"
                                value={newProduct.description || ''}
                                onChange={handleInputChange}
                                rows={3}
                                className="w-full rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all p-4 text-sm font-medium"
                                placeholder="Describe the service capabilities..."
                            ></textarea>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Classification</label>
                                <input
                                    type="text"
                                    name="type"
                                    value={newProduct.type || ''}
                                    onChange={handleInputChange}
                                    className="w-full h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all px-4 text-sm font-medium"
                                    placeholder="e.g. Infrastructure, Software, Support"
                                />
                            </div>
                            <div className="flex items-center pt-6">
                                <label className="group flex items-center space-x-3 cursor-pointer">
                                    <div className={`w-10 h-6 rounded-full transition-colors relative ${newProduct.is_active ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${newProduct.is_active ? 'left-5' : 'left-1'}`}></div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        name="is_active"
                                        hidden
                                        checked={newProduct.is_active !== undefined ? newProduct.is_active : true}
                                        onChange={handleInputChange}
                                    />
                                    <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors">Enabled for provisioning</span>
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 space-x-4">
                            {editingId && (
                                <button type="button" onClick={resetForm} className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">Cancel Edit</button>
                            )}
                            <button
                                type="submit"
                                className="bg-slate-900 text-white px-10 py-3 rounded-xl text-sm font-bold hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200 active:scale-95"
                            >
                                {editingId ? 'Finalize Changes' : 'Publish Product'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="premium-card executive-shadow min-h-[400px]">
                {loading ? (
                    <div className="p-20 flex flex-col items-center justify-center space-y-4">
                        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-slate-400 font-medium text-sm">Synchronizing inventory...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/50">
                                    <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest">ID</th>
                                    <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest">Nominal Specification</th>
                                    <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest">Type</th>
                                    <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest">Base Rate</th>
                                    <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4 text-right text-[11px] font-bold text-slate-500 uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {products.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-20 text-center text-slate-400 font-medium">No products registered in the catalog yet.</td>
                                    </tr>
                                ) : (
                                    products.map((product) => (
                                        <tr key={product.id} className="hover:bg-slate-50/80 transition-colors group">
                                            <td className="px-6 py-4 whitespace-nowrap text-[12px] font-bold text-slate-400 uppercase tracking-tighter">#{product.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-bold text-slate-900">{product.name}</div>
                                                <div className="text-[11px] font-medium text-slate-400 truncate max-w-xs mt-0.5">{product.description || 'No description provided.'}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100">
                                                    {product.type || 'Standard'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-slate-900">
                                                ${product.base_price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`status-pill ${
                                                    product.is_active 
                                                    ? 'status-pill-success' 
                                                    : 'status-pill-neutral opacity-50'
                                                }`}>
                                                    {product.is_active ? 'Active' : 'Archived'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <div className="flex justify-end space-x-3">
                                                    <button 
                                                        onClick={() => handleEdit(product)}
                                                        className="text-[11px] font-bold text-slate-400 uppercase tracking-wider hover:text-indigo-600 transition-colors"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(product.id)}
                                                        className="text-[11px] font-bold text-slate-400 uppercase tracking-wider hover:text-rose-600 transition-colors"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Products;

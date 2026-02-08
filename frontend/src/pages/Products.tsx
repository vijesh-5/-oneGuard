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
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Products</h2>
                <button 
                    onClick={() => {
                        if (isFormVisible) resetForm();
                        else setIsFormVisible(true);
                    }}
                    className={`${isFormVisible ? 'bg-gray-500 hover:bg-gray-600' : 'bg-indigo-600 hover:bg-indigo-700'} text-white px-5 py-2 rounded-lg transition-colors duration-200 shadow-sm font-medium`}
                >
                    {isFormVisible ? 'Cancel' : 'Add Product'}
                </button>
            </div>

            {isFormVisible && (
                <div className="bg-white p-8 rounded-xl shadow-lg mb-8 border border-gray-100 animate-fade-in-down">
                    <h3 className="text-xl font-bold mb-6 text-gray-800 border-b pb-2">{editingId ? 'Edit Product' : 'Create New Product'}</h3>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={newProduct.name}
                                    onChange={handleInputChange}
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition duration-150 ease-in-out sm:text-sm p-2 border"
                                    placeholder="Product Name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Base Price ($)</label>
                                <input
                                    type="number"
                                    name="base_price"
                                    required
                                    min="0"
                                    step="0.01"
                                    value={newProduct.base_price}
                                    onChange={handleInputChange}
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition duration-150 ease-in-out sm:text-sm p-2 border"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                name="description"
                                value={newProduct.description || ''}
                                onChange={handleInputChange}
                                rows={3}
                                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition duration-150 ease-in-out sm:text-sm p-2 border"
                                placeholder="Describe the product..."
                            ></textarea>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                <input
                                    type="text"
                                    name="type"
                                    value={newProduct.type || ''}
                                    onChange={handleInputChange}
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition duration-150 ease-in-out sm:text-sm p-2 border"
                                    placeholder="e.g. Service, Digital, Physical"
                                />
                            </div>
                            <div className="flex items-center pt-6">
                                <label className="inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="is_active"
                                        checked={newProduct.is_active !== undefined ? newProduct.is_active : true}
                                        onChange={handleInputChange}
                                        className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded transition duration-150 ease-in-out"
                                    />
                                    <span className="ml-2 text-gray-900 font-medium">Active Status</span>
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 shadow-md transition-all duration-200 font-medium flex items-center"
                            >
                                {editingId ? 'Update Product' : 'Create Product'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white shadow-xl rounded-xl overflow-hidden border border-gray-100">
                {loading ? (
                    <div className="p-10 text-center text-gray-500 animate-pulse">Loading products...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {products.map((product) => (
                                    <tr key={product.id} className="hover:bg-gray-50/80 transition-colors duration-150">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{product.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-semibold text-gray-900">{product.name}</div>
                                            <div className="text-xs text-gray-500 truncate max-w-xs">{product.description}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                                                {product.type || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            ${product.base_price.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                product.is_active 
                                                ? 'bg-green-100 text-green-800 border border-green-200' 
                                                : 'bg-gray-100 text-gray-800 border border-gray-200'
                                            }`}>
                                                {product.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button 
                                                onClick={() => handleEdit(product)}
                                                className="text-indigo-600 hover:text-indigo-900 mr-4 transition-colors font-medium"
                                            >
                                                Edit
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(product.id)}
                                                className="text-red-600 hover:text-red-900 transition-colors font-medium"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {products.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                                            No products found. Click "Add Product" to create one.
                                        </td>
                                    </tr>
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

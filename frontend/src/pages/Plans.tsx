import React, { useState, useEffect } from 'react';
import { Plan, PlanCreate } from '../types/plan';
import { Product } from '../types/product';
import PlanService from '../services/planService';
import ProductService from '../services/productService';

const Plans: React.FC = () => {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [newPlan, setNewPlan] = useState<PlanCreate>({ product_id: 0, name: '', interval: 'monthly', price: 0 });
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [fetchedPlans, fetchedProducts] = await Promise.all([
                PlanService.getAll(),
                ProductService.getAll()
            ]);
            setPlans(fetchedPlans);
            setProducts(fetchedProducts);
            if (fetchedProducts.length > 0) {
                setNewPlan(prev => ({ ...prev, product_id: fetchedProducts[0].id }));
            }
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewPlan(prev => ({
            ...prev,
            [name]: name === 'price' || name === 'product_id' ? parseFloat(value) : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await PlanService.create(newPlan);
            setNewPlan({ product_id: products[0]?.id || 0, name: '', interval: 'monthly', price: 0 });
            setIsFormVisible(false);
            fetchData();
        } catch (error) {
            console.error("Failed to create plan", error);
        }
    };

    const getProductName = (id: number) => {
        return products.find(p => p.id === id)?.name || 'Unknown Product';
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Billing Plans</h2>
                <button 
                    onClick={() => setIsFormVisible(!isFormVisible)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                    {isFormVisible ? 'Cancel' : 'Add Plan'}
                </button>
            </div>

            {isFormVisible && (
                <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                    <h3 className="text-lg font-semibold mb-4">Create New Plan</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Product</label>
                            <select
                                name="product_id"
                                value={newPlan.product_id}
                                onChange={handleInputChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                            >
                                {products.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Plan Name</label>
                            <input
                                type="text"
                                name="name"
                                required
                                placeholder="e.g. Monthly Basic"
                                value={newPlan.name}
                                onChange={handleInputChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Interval</label>
                            <select
                                name="interval"
                                value={newPlan.interval}
                                onChange={handleInputChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                            >
                                <option value="monthly">Monthly</option>
                                <option value="yearly">Yearly</option>
                                <option value="quarterly">Quarterly</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Price</label>
                            <input
                                type="number"
                                name="price"
                                required
                                min="0"
                                step="0.01"
                                value={newPlan.price}
                                onChange={handleInputChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                            />
                        </div>
                        <button 
                            type="submit"
                            className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                        >
                            Save Plan
                        </button>
                    </form>
                </div>
            )}

            <div className="bg-white shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                {loading ? (
                     <div className="p-6 text-center text-gray-500">Loading plans...</div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interval</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {plans.map((plan) => (
                                <tr key={plan.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{getProductName(plan.product_id)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{plan.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{plan.interval}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${plan.price.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default Plans;

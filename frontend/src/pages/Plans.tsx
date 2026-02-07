import React, { useState, useEffect } from 'react';
import { Plan, PlanCreate } from '../types/plan';
import { Product } from '../types/product';
import PlanService from '../services/planService';
import ProductService from '../services/productService';

const Plans: React.FC = () => {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [newPlan, setNewPlan] = useState<PlanCreate>({ 
        product_id: 0, 
        name: '', 
        billing_period: 'monthly', 
        price: 0,
        min_quantity: 1,
        auto_close: false,
        pausable: false,
        renewable: true
    });
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
        const { name, value, type } = e.target;
        
        let processedValue: any = value;
        if (type === 'number') {
            processedValue = value === '' ? 0 : parseFloat(value);
        } else if (type === 'checkbox') {
            processedValue = (e.target as HTMLInputElement).checked;
        }

        setNewPlan(prev => ({
            ...prev,
            [name]: processedValue
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await PlanService.create(newPlan);
            setNewPlan({ 
                product_id: products[0]?.id || 0, 
                name: '', 
                billing_period: 'monthly', 
                price: 0,
                min_quantity: 1,
                auto_close: false,
                pausable: false,
                renewable: true
            });
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
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-extrabold text-gray-900">Billing Plans</h2>
                    <p className="mt-1 text-sm text-gray-500">Define recurring billing rules for your products.</p>
                </div>
                <button 
                    onClick={() => setIsFormVisible(!isFormVisible)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-bold rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                >
                    {isFormVisible ? 'Cancel' : 'Create Plan'}
                </button>
            </div>

            {isFormVisible && (
                <div className="bg-white p-8 rounded-2xl shadow-lg mb-10 border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-6">New Billing Configuration</h3>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700">Associated Product</label>
                            <select
                                name="product_id"
                                value={newPlan.product_id}
                                onChange={handleInputChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border p-2.5"
                            >
                                {products.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700">Plan Display Name</label>
                            <input
                                type="text"
                                name="name"
                                required
                                placeholder="e.g. Pro Monthly"
                                value={newPlan.name}
                                onChange={handleInputChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border p-2.5"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700">Billing Period</label>
                            <select
                                name="billing_period"
                                value={newPlan.billing_period}
                                onChange={handleInputChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border p-2.5"
                            >
                                <option value="monthly">Monthly</option>
                                <option value="yearly">Yearly</option>
                                <option value="quarterly">Quarterly</option>
                                <option value="weekly">Weekly</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700">Recurring Price (USD)</label>
                            <input
                                type="number"
                                name="price"
                                required
                                min="0"
                                step="0.01"
                                value={newPlan.price || ''}
                                onChange={handleInputChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border p-2.5"
                            />
                        </div>

                        <div className="col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-xl">
                            <label className="flex items-center space-x-3 cursor-pointer">
                                <input type="checkbox" name="renewable" checked={newPlan.renewable} onChange={handleInputChange} className="h-4 w-4 text-indigo-600 rounded" />
                                <span className="text-sm font-medium text-gray-700">Auto-Renew</span>
                            </label>
                            <label className="flex items-center space-x-3 cursor-pointer">
                                <input type="checkbox" name="pausable" checked={newPlan.pausable} onChange={handleInputChange} className="h-4 w-4 text-indigo-600 rounded" />
                                <span className="text-sm font-medium text-gray-700">Pausable</span>
                            </label>
                            <label className="flex items-center space-x-3 cursor-pointer">
                                <input type="checkbox" name="auto_close" checked={newPlan.auto_close} onChange={handleInputChange} className="h-4 w-4 text-indigo-600 rounded" />
                                <span className="text-sm font-medium text-gray-700">Auto-Close</span>
                            </label>
                        </div>

                        <div className="col-span-2">
                            <button 
                                type="submit"
                                className="w-full inline-flex justify-center py-3 px-4 border border-transparent shadow-sm text-sm font-bold rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
                            >
                                Activate Billing Plan
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
                {loading ? (
                     <div className="p-12 text-center text-gray-500">Syncing plans...</div>
                ) : plans.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">No plans configured yet.</div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Target Product</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Plan Name</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Period</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Price</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-50">
                            {plans.map((plan) => (
                                <tr key={plan.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-900 font-bold">{getProductName(plan.product_id)}</td>
                                    <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-600 font-medium">{plan.name}</td>
                                    <td className="px-6 py-5 whitespace-nowrap">
                                        <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700">
                                            {plan.billing_period}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 whitespace-nowrap text-sm font-bold text-gray-900">${plan.price.toFixed(2)}</td>
                                    <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                                        <button className="text-indigo-600 hover:text-indigo-900 font-bold">Configure</button>
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

export default Plans;
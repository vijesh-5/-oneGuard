import React, { useState, useEffect } from 'react';
import { Subscription, SubscriptionCreate } from '../types/subscription';
import { Product } from '../types/product';
import { Plan } from '../types/plan';
import SubscriptionService from '../services/subscriptionService';
import ProductService from '../services/productService';
import PlanService from '../services/planService';

const Subscriptions: React.FC = () => {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [plans, setPlans] = useState<Plan[]>([]);
    
    // Form State
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState<number>(0);
    const [newSub, setNewSub] = useState<SubscriptionCreate>({ customer_name: '', plan_id: 0 });
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [fetchedSubs, fetchedProducts, fetchedPlans] = await Promise.all([
                SubscriptionService.getAll(),
                ProductService.getAll(),
                PlanService.getAll()
            ]);
            setSubscriptions(fetchedSubs);
            setProducts(fetchedProducts);
            setPlans(fetchedPlans);
            if (fetchedProducts.length > 0) setSelectedProductId(fetchedProducts[0].id);
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Filter plans based on selected product
    const availablePlans = plans.filter(p => p.product_id === selectedProductId);

    const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const pId = parseInt(e.target.value);
        setSelectedProductId(pId);
        // Reset plan selection when product changes
        setNewSub(prev => ({ ...prev, plan_id: 0 }));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewSub(prev => ({
            ...prev,
            [name]: name === 'plan_id' ? parseInt(value) : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await SubscriptionService.create(newSub);
            setIsFormVisible(false);
            setNewSub({ customer_name: '', plan_id: 0 });
            fetchData();
        } catch (error) {
            console.error("Failed to create subscription", error);
        }
    };

    const getPlanName = (planId: number) => {
        const plan = plans.find(p => p.id === planId);
        if (!plan) return 'Unknown Plan';
        const product = products.find(p => p.id === plan.product_id);
        return `${product?.name} - ${plan.name}`;
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Subscriptions</h2>
                <button 
                    onClick={() => setIsFormVisible(!isFormVisible)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                    {isFormVisible ? 'Cancel' : 'New Subscription'}
                </button>
            </div>

            {isFormVisible && (
                <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                    <h3 className="text-lg font-semibold mb-4">Create Subscription</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Customer Name</label>
                            <input
                                type="text"
                                name="customer_name"
                                required
                                value={newSub.customer_name}
                                onChange={handleInputChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Select Product</label>
                            <select
                                value={selectedProductId}
                                onChange={handleProductChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                            >
                                {products.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Select Plan</label>
                            <select
                                name="plan_id"
                                required
                                value={newSub.plan_id}
                                onChange={handleInputChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                            >
                                <option value="">-- Choose a Plan --</option>
                                {availablePlans.map(p => (
                                    <option key={p.id} value={p.id}>{p.name} (${p.price})</option>
                                ))}
                            </select>
                        </div>

                        <button 
                            type="submit"
                            disabled={!newSub.plan_id || !newSub.customer_name}
                            className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400"
                        >
                            Create Subscription
                        </button>
                    </form>
                </div>
            )}

            <div className="bg-white shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                {loading ? (
                    <div className="p-6 text-center text-gray-500">Loading subscriptions...</div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan Details</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Bill</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {subscriptions.map((sub) => (
                                <tr key={sub.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{sub.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{sub.customer_name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getPlanName(sub.plan_id)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            sub.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {sub.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sub.next_billing_date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default Subscriptions;

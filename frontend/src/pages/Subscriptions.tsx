import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Subscription, SubscriptionCreate } from '../types/subscription';
import { Product } from '../types/product';
import { Plan } from '../types/plan';
import SubscriptionService from '../services/subscriptionService';
import ProductService from '../services/productService';
import PlanService from '../services/planService';

const Subscriptions: React.FC = () => {
    const navigate = useNavigate();
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [plans, setPlans] = useState<Plan[]>([]);
    
    // Form State
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState<number>(0);
    const [newSub, setNewSub] = useState<SubscriptionCreate>({ customer_name: '', plan_id: 0, items: [] });
    const [currentStep, setCurrentStep] = useState(1);
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

    const handleNext = () => {
        // Basic validation before moving to the next step
        if (currentStep === 1 && !newSub.customer_name) return;
        if (currentStep === 2 && !newSub.plan_id) return;
        if (currentStep === 3 && newSub.items.length === 0) return; // Ensure at least one item is added
        setCurrentStep(prev => prev + 1);
    };

    const handlePrevious = () => {
        setCurrentStep(prev => prev - 1);
    };

    const handleItemChange = (productId: number, quantity: number) => {
        setNewSub(prev => {
            const existingItemIndex = prev.items.findIndex(item => item.product_id === productId);
            if (quantity <= 0) {
                return { ...prev, items: prev.items.filter(item => item.product_id !== productId) };
            } else if (existingItemIndex > -1) {
                const updatedItems = [...prev.items];
                updatedItems[existingItemIndex] = { ...updatedItems[existingItemIndex], quantity };
                return { ...prev, items: updatedItems };
            } else {
                return { ...prev, items: [...prev.items, { product_id: productId, quantity }] };
            }
        });
    };

    const handleSubmit = async () => { // Removed 'e: React.FormEvent' as it's now internal to the wizard
        try {
            const createdSubscription = await SubscriptionService.create(newSub); // Assume API returns created sub
            alert('Subscription created successfully!');
            setIsFormVisible(false);
            setNewSub({ customer_name: '', plan_id: 0, items: [] }); // Reset with items
            setCurrentStep(1); // Reset wizard step
            fetchData();
            navigate(`/invoices/${createdSubscription.id}`); // Redirect to invoice page
        } catch (error) {
            console.error("Failed to create subscription", error);
            alert('Failed to create subscription.');
        }
    };

    const getPlanName = (planId: number) => {
        const plan = plans.find(p => p.id === planId);
        if (!plan) return 'Unknown Plan';
        const product = products.find(p => p.id === plan.product_id);
        return `${product?.name} - ${plan.name}`;
    };

    const calculateTotalPrice = () => {
        let total = 0;
        const selectedPlan = plans.find(p => p.id === newSub.plan_id);
        if (selectedPlan) {
            total += selectedPlan.price;
        }

        newSub.items.forEach(item => {
            const product = products.find(p => p.id === item.product_id);
            if (product) {
                total += product.base_price * item.quantity;
            }
        });
        return total.toFixed(2);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Subscriptions</h2>
                <button 
                    onClick={() => { setIsFormVisible(!isFormVisible); setCurrentStep(1); setNewSub({ customer_name: '', plan_id: 0, items: [] }); }} // Reset form and step
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                    {isFormVisible ? 'Cancel' : 'New Subscription'}
                </button>
            </div>

            {isFormVisible && (
                <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                    <h3 className="text-lg font-semibold mb-4">Create Subscription - Step {currentStep} of 4</h3>
                    
                    {currentStep === 1 && (
                        <div className="space-y-4">
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
                            <button
                                onClick={handleNext}
                                disabled={!newSub.customer_name}
                                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
                            >
                                Next
                            </button>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="space-y-4">
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
                            <div className="flex justify-between">
                                <button
                                    onClick={handlePrevious}
                                    className="bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-500"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={handleNext}
                                    disabled={!newSub.plan_id}
                                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div className="space-y-4">
                            <p className="text-sm text-gray-600">Select products and quantities for this subscription.</p>
                            {products.filter(p => p.id === selectedProductId).map(product => (
                                <div key={product.id} className="flex items-center space-x-4">
                                    <span className="font-medium">{product.name}</span>
                                    <input
                                        type="number"
                                        min="0"
                                        value={newSub.items.find(item => item.product_id === product.id)?.quantity || 0}
                                        onChange={(e) => handleItemChange(product.id, parseInt(e.target.value))}
                                        className="w-24 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                                    />
                                </div>
                            ))}
                             <div className="flex justify-between">
                                <button
                                    onClick={handlePrevious}
                                    className="bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-500"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={handleNext}
                                    disabled={newSub.items.length === 0}
                                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}

                    {currentStep === 4 && (
                        <div className="space-y-4">
                            <h4 className="text-lg font-semibold">Subscription Summary</h4>
                            <p><strong>Customer:</strong> {newSub.customer_name}</p>
                            <p><strong>Plan:</strong> {getPlanName(newSub.plan_id)}</p>
                            <p><strong>Items:</strong></p>
                            <ul className="list-disc list-inside">
                                {newSub.items.map(item => {
                                    const prod = products.find(p => p.id === item.product_id);
                                    return (
                                        <li key={item.product_id}>{prod?.name} x {item.quantity}</li>
                                    );
                                })}
                            </ul>
                            <p className="text-lg font-bold">Total Price: ${calculateTotalPrice()}</p>
                            <div className="flex justify-between">
                                <button
                                    onClick={handlePrevious}
                                    className="bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-500"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={handleSubmit} // Final submit
                                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                                >
                                    Confirm Subscription
                                </button>
                            </div>
                        </div>
                    )}
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

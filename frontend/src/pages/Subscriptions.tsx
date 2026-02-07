import React, { useState, useEffect } from 'react';
import { Subscription, SubscriptionCreate, SubscriptionLineCreate } from '../types/subscription';
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
    const [newSub, setNewSub] = useState<SubscriptionCreate>({ 
        subscription_number: `SUB-${Date.now()}`,
        customer_id: 1, // Mocked for now
        plan_id: 0,
        start_date: new Date().toISOString().split('T')[0],
        subscription_lines: []
    });
    
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

    const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const pId = parseInt(e.target.value);
        setSelectedProductId(pId);
        setNewSub(prev => ({ ...prev, plan_id: 0 }));
    };

    const handlePlanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const planId = parseInt(e.target.value);
        const plan = plans.find(p => p.id === planId);
        const product = products.find(p => p.id === plan?.product_id);

        if (plan && product) {
            // Automatically add the main plan as the first line
            const mainLine: SubscriptionLineCreate = {
                product_id: product.id,
                product_name_snapshot: `${product.name} (${plan.name})`,
                unit_price_snapshot: plan.price,
                quantity: 1,
                tax_percent: 0, // Default
                discount_percent: 0,
                line_total: plan.price
            };

            setNewSub(prev => ({
                ...prev,
                plan_id: planId,
                subscription_lines: [mainLine]
            }));
        }
    };

    const handleConfirm = async (id: number) => {
        try {
            await SubscriptionService.confirm(id);
            fetchData();
            alert("Subscription confirmed! Invoice has been generated.");
        } catch (error) {
            console.error("Failed to confirm subscription", error);
            alert("Error confirming subscription.");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await SubscriptionService.create(newSub);
            setIsFormVisible(false);
            setNewSub({ 
                subscription_number: `SUB-${Date.now()}`,
                customer_id: 1,
                plan_id: 0,
                start_date: new Date().toISOString().split('T')[0],
                subscription_lines: []
            });
            fetchData();
        } catch (error) {
            console.error("Failed to create subscription", error);
        }
    };

    const availablePlans = plans.filter(p => p.product_id === selectedProductId);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-extrabold text-gray-900">Subscriptions</h2>
                    <p className="mt-1 text-sm text-gray-500">Manage recurring contracts and lifecycle.</p>
                </div>
                <button 
                    onClick={() => setIsFormVisible(!isFormVisible)}
                    className="inline-flex items-center px-6 py-2.5 border border-transparent text-sm font-bold rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
                >
                    {isFormVisible ? 'Cancel' : '＋ New Subscription'}
                </button>
            </div>

            {isFormVisible && (
                <div className="bg-white p-8 rounded-2xl shadow-xl mb-10 border border-indigo-50 animate-in fade-in slide-in-from-top-4 duration-300">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                        <span className="bg-indigo-100 text-indigo-700 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">1</span>
                        Subscription Configuration
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700">Subscription ID</label>
                                <input
                                    type="text"
                                    readOnly
                                    value={newSub.subscription_number}
                                    className="mt-1 block w-full rounded-lg border-gray-200 bg-gray-50 text-gray-500 sm:text-sm border p-3 cursor-not-allowed"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700">Select Base Product</label>
                                <select
                                    value={selectedProductId}
                                    onChange={handleProductChange}
                                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border p-3"
                                >
                                    <option value={0}>-- Choose Product --</option>
                                    {products.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700">Select Billing Plan</label>
                                <select
                                    name="plan_id"
                                    required
                                    disabled={!selectedProductId}
                                    value={newSub.plan_id}
                                    onChange={handlePlanChange}
                                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border p-3 disabled:bg-gray-50 disabled:text-gray-400"
                                >
                                    <option value={0}>-- Choose Plan --</option>
                                    {availablePlans.map(p => (
                                        <option key={p.id} value={p.id}>{p.name} - ${p.price}/{p.billing_period}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {newSub.subscription_lines.length > 0 && (
                            <div className="mt-8 border-t border-gray-100 pt-8 animate-in fade-in duration-500">
                                <h4 className="text-md font-bold text-gray-800 mb-4">Financial Preview</h4>
                                <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                                    <table className="min-w-full">
                                        <thead>
                                            <tr className="text-xs font-bold text-gray-500 uppercase tracking-wider text-left">
                                                <th className="pb-4">Line Item</th>
                                                <th className="pb-4">Qty</th>
                                                <th className="pb-4">Unit Price</th>
                                                <th className="pb-4 text-right">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {newSub.subscription_lines.map((line, idx) => (
                                                <tr key={idx}>
                                                    <td className="py-3 text-sm font-medium text-gray-900">{line.product_name_snapshot}</td>
                                                    <td className="py-3 text-sm text-gray-600">{line.quantity}</td>
                                                    <td className="py-3 text-sm text-gray-600">${line.unit_price_snapshot.toFixed(2)}</td>
                                                    <td className="py-3 text-sm font-bold text-gray-900 text-right">${line.line_total.toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr className="border-t-2 border-gray-200">
                                                <td colSpan={3} className="pt-4 text-sm font-bold text-gray-900 text-right">Estimated Grand Total:</td>
                                                <td className="pt-4 text-lg font-extrabold text-indigo-600 text-right">
                                                    ${newSub.subscription_lines.reduce((acc, l) => acc + l.line_total, 0).toFixed(2)}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        )}

                        <button 
                            type="submit"
                            disabled={!newSub.plan_id}
                            className="w-full bg-indigo-600 text-white py-4 px-6 rounded-xl font-extrabold shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 transition-all disabled:bg-gray-300 disabled:shadow-none uppercase tracking-widest text-sm"
                        >
                            Generate Subscription Draft
                        </button>
                    </form>
                </div>
            )}

            <div className="bg-white shadow-2xl rounded-3xl overflow-hidden border border-gray-100">
                {loading ? (
                    <div className="p-20 text-center">
                        <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                        <p className="mt-4 text-gray-500 font-medium">Loading ERP records...</p>
                    </div>
                ) : subscriptions.length === 0 ? (
                    <div className="p-20 text-center">
                        <div className="text-gray-300 mb-4">
                            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <p className="text-gray-500 text-lg">No active subscriptions found.</p>
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Contract #</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Lifecycle</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Total Value</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Next Billing</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-50">
                            {subscriptions.map((sub) => (
                                <tr key={sub.id} className="hover:bg-indigo-50/30 transition-colors">
                                    <td className="px-6 py-5 whitespace-nowrap">
                                        <div className="text-sm font-bold text-gray-900">{sub.subscription_number}</div>
                                        <div className="text-xs text-gray-500">ID: {sub.id}</div>
                                    </td>
                                    <td className="px-6 py-5 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-tighter ${
                                            sub.status === 'active' ? 'bg-green-100 text-green-700' :
                                            sub.status === 'draft' ? 'bg-gray-100 text-gray-600' :
                                            'bg-yellow-100 text-yellow-700'
                                        }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full mr-2 ${
                                                sub.status === 'active' ? 'bg-green-500' :
                                                sub.status === 'draft' ? 'bg-gray-400' :
                                                'bg-yellow-500'
                                            }`}></span>
                                            {sub.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 whitespace-nowrap text-sm font-bold text-gray-900">
                                        ${sub.grand_total.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-600">
                                        {sub.next_billing_date || 'Not scheduled'}
                                    </td>
                                    <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                                        {sub.status === 'draft' && (
                                            <button 
                                                onClick={() => handleConfirm(sub.id)}
                                                className="inline-flex items-center px-4 py-2 border border-transparent text-xs font-bold rounded-lg text-white bg-green-600 hover:bg-green-700 shadow-sm transition-all"
                                            >
                                                Confirm & Bill
                                            </button>
                                        )}
                                        {sub.status === 'active' && (
                                            <button className="text-indigo-600 hover:text-indigo-900 font-bold">View Invoices</button>
                                        )}
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

export default Subscriptions;
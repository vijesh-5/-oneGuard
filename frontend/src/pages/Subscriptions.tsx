import React, { useState, useEffect } from 'react';
import { Subscription, SubscriptionCreate, SubscriptionLineCreate } from '../types/subscription';
import { Product } from '../types/product';
import { Plan } from '../types/plan';
import SubscriptionService from '../services/subscriptionService';
import ProductService from '../services/productService';
import PlanService from '../services/planService';
import { useAuth } from '../context/AuthContext';
import { useLabels } from '../hooks/useLabels';
import axios from 'axios';

const Subscriptions: React.FC = () => {
    const { token } = useAuth();
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [customers, setCustomers] = useState<any[]>([]);

    // Form State
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState<number>(0);
    const [newSub, setNewSub] = useState<SubscriptionCreate>({
        subscription_number: `SUB-${Date.now()}`,
        customer_id: 0,
        plan_id: 0,
        start_date: new Date().toISOString().split('T')[0],
        subscription_lines: []
    });

    const [loading, setLoading] = useState(true);

    const labels = useLabels();

    const fetchData = async () => {
        setLoading(true);
        try {
            const [fetchedSubs, fetchedProducts, fetchedPlans, fetchedCustomers] = await Promise.all([
                SubscriptionService.getAll(),
                ProductService.getAll(),
                PlanService.getAll(),
                axios.get('http://localhost:8000/customers/', { headers: { Authorization: `Bearer ${token}` } }).then(res => res.data)
            ]);
            setSubscriptions(fetchedSubs);
            setProducts(fetchedProducts);
            setPlans(fetchedPlans);
            setCustomers(fetchedCustomers);
            if (fetchedProducts.length > 0) setSelectedProductId(fetchedProducts[0].id);
            if (fetchedCustomers.length > 0) setNewSub(prev => ({ ...prev, customer_id: fetchedCustomers[0].id }));
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchData();
        }
    }, [token]);

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
        } else {
            setNewSub(prev => ({
                ...prev,
                plan_id: planId,
                subscription_lines: []
            }));
        }
    };

    const handleCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const customerId = parseInt(e.target.value);
        setNewSub(prev => ({ ...prev, customer_id: customerId }));
    };

    const handleConfirm = async (id: number) => {
        try {
            await SubscriptionService.confirm(id);
            fetchData();
            alert(`${labels.subscription} confirmed! ${labels.invoice} has been generated.`);
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
                customer_id: customers.length > 0 ? customers[0].id : 0, // Reset to first customer or 0
                plan_id: 0,
                start_date: new Date().toISOString().split('T')[0],
                subscription_lines: []
            });
            setSelectedProductId(products.length > 0 ? products[0].id : 0); // Reset selected product
            fetchData();
        } catch (error) {
            console.error("Failed to create subscription", error);
        }
    };

    const getCustomerName = (customerId: number) => {
        const customer = customers.find(c => c.id === customerId);
        return customer ? customer.name : `${labels.customer} ID: ${customerId}`;
    };

    const availablePlans = plans.filter(p => p.product_id === selectedProductId);


    const handleQuickAdd = async (serviceName: string, price: number, category: string) => {
        if (!confirm(`Quick Add ${serviceName} for $${price}/month?`)) return;

        try {
            await axios.post('http://localhost:8000/catalog/add', {
                name: serviceName,
                price: price,
                interval: "monthly",
                category: category,
                start_date: new Date().toISOString().split('T')[0]
            }, { headers: { Authorization: `Bearer ${token}` } });

            alert(`Successfully subscribed to ${serviceName}!`);
            fetchData();
        } catch (error) {
            console.error("Quick Add failed", error);
            alert("Failed to quick add subscription.");
        }
    };

    const popularServices = [
        { name: "Netflix", price: 15.49, category: "Streaming", color: "from-red-600 to-rose-600" },
        { name: "Spotify", price: 10.99, category: "Music", color: "from-green-500 to-emerald-600" },
        { name: "YouTube Premium", price: 13.99, category: "Video", color: "from-red-500 to-red-600" },
        { name: "ChatGPT Plus", price: 20.00, category: "AI", color: "from-teal-500 to-emerald-500" },
        { name: "Amazon Prime", price: 14.99, category: "Shopping", color: "from-blue-400 to-blue-600" },
        { name: "Apple One", price: 19.95, category: "Bundle", color: "from-gray-800 to-black" }
    ];

    return (
        <div className="space-y-8">
            {/* Quick Add Section for Personal Mode mainly, but useful for all */}
            <div className="animate-fade-in">
                <h3 className="text-lg font-bold text-slate-300 mb-4 flex items-center gap-2">
                    <span className="p-1 rounded bg-cyan-500/10 text-cyan-400">⚡</span>
                    Quick Add Popular Services
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {popularServices.map((service) => (
                        <button
                            key={service.name}
                            onClick={() => handleQuickAdd(service.name, service.price, service.category)}
                            className="group relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50 p-4 hover:border-slate-600 transition-all hover:shadow-lg hover:shadow-cyan-500/10 text-left"
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
                            <p className="font-bold text-white text-sm relative z-10">{service.name}</p>
                            <p className="text-xs text-slate-400 mt-1 relative z-10">${service.price}/mo</p>
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                                <span className="text-cyan-400 text-xs font-bold">ADD</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-4xl font-bold text-white tracking-tight">{labels.subscriptions}</h2>
                    <p className="mt-2 text-slate-400">Manage recurring contracts and lifecycle.</p>
                </div>
                <button
                    onClick={() => setIsFormVisible(!isFormVisible)}
                    className="btn-neon inline-flex items-center px-6 py-2.5 rounded-lg shadow-lg"
                >
                    {isFormVisible ? 'Cancel' : '＋ New Subscription'}
                </button>
            </div>

            {isFormVisible && (
                <div className="glass-neon p-8 rounded-2xl mb-10 animate-in fade-in slide-in-from-top-4 duration-300">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                        <span className="bg-cyan-500 text-slate-900 font-bold w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">1</span>
                        Subscription Configuration
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5">Subscription ID</label>
                                <input
                                    type="text"
                                    readOnly
                                    value={newSub.subscription_number}
                                    className="input-glass w-full rounded-lg p-3 opacity-60 cursor-not-allowed"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5">Select Base Product</label>
                                <select
                                    value={selectedProductId}
                                    onChange={handleProductChange}
                                    className="input-glass w-full rounded-lg p-3 bg-slate-900"
                                >
                                    <option value={0}>-- Choose Product --</option>
                                    {products.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5">{labels.customer}</label>
                                <select
                                    name="customer_id"
                                    required
                                    value={newSub.customer_id}
                                    onChange={handleCustomerChange}
                                    className="input-glass w-full rounded-lg p-3 bg-slate-900"
                                >
                                    <option value="">Select a {labels.customer}</option>
                                    {customers.map(c => (
                                        <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5">Select Billing Plan</label>
                                <select
                                    name="plan_id"
                                    required
                                    disabled={!selectedProductId}
                                    value={newSub.plan_id}
                                    onChange={handlePlanChange}
                                    className="input-glass w-full rounded-lg p-3 bg-slate-900 disabled:opacity-50"
                                >
                                    <option value={0}>-- Choose Plan --</option>
                                    {availablePlans.map(p => (
                                        <option key={p.id} value={p.id}>{p.name} - ${p.price}/{p.billing_period}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {newSub.subscription_lines.length > 0 && (
                            <div className="mt-8 border-t border-slate-700/50 pt-8 animate-in fade-in duration-500">
                                <h4 className="text-md font-bold text-white mb-4">Financial Preview</h4>
                                <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700/50">
                                    <table className="min-w-full">
                                        <thead>
                                            <tr className="text-xs font-bold text-slate-400 uppercase tracking-wider text-left">
                                                <th className="pb-4">Line Item</th>
                                                <th className="pb-4">Qty</th>
                                                <th className="pb-4">Unit Price</th>
                                                <th className="pb-4 text-right">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800">
                                            {newSub.subscription_lines.map((line, idx) => (
                                                <tr key={idx}>
                                                    <td className="py-3 text-sm font-medium text-slate-200">{line.product_name_snapshot}</td>
                                                    <td className="py-3 text-sm text-slate-400">{line.quantity}</td>
                                                    <td className="py-3 text-sm text-slate-400">${line.unit_price_snapshot.toFixed(2)}</td>
                                                    <td className="py-3 text-sm font-bold text-white text-right">${line.line_total.toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr className="border-t-2 border-slate-700">
                                                <td colSpan={3} className="pt-4 text-sm font-bold text-slate-300 text-right">Estimated Grand Total:</td>
                                                <td className="pt-4 text-lg font-extrabold text-cyan-400 text-right text-glow">
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
                            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-4 px-6 rounded-xl font-extrabold shadow-lg hover:from-cyan-500 hover:to-blue-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-sm"
                        >
                            Generate Subscription Draft
                        </button>
                    </form>
                </div>
            )}

            <div className="glass-panel overflow-hidden rounded-2xl">
                {loading ? (
                    <div className="p-20 text-center">
                        <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-cyan-500"></div>
                        <p className="mt-4 text-slate-400 font-medium">Loading ERP records...</p>
                    </div>
                ) : subscriptions.length === 0 ? (
                    <div className="p-20 text-center">
                        <div className="text-slate-600 mb-4">
                            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <p className="text-slate-500 text-lg">No active subscriptions found.</p>
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-slate-800">
                        <thead className="bg-slate-900/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Contract #</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Lifecycle</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Total Value</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Next Billing</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {subscriptions.map((sub) => (
                                <tr key={sub.id} className="table-row-hover group">
                                    <td className="px-6 py-5 whitespace-nowrap">
                                        <div className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">{sub.subscription_number}</div>
                                        <div className="text-xs text-slate-500 font-medium">{labels.customer}: {getCustomerName(sub.customer_id)}</div>
                                    </td>
                                    <td className="px-6 py-5 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-tighter border ${sub.status === 'active' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                                            sub.status === 'draft' ? 'bg-slate-500/10 border-slate-500/20 text-slate-400' :
                                                'bg-amber-500/10 border-amber-500/20 text-amber-400'
                                            }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full mr-2 ${sub.status === 'active' ? 'bg-green-500' :
                                                sub.status === 'draft' ? 'bg-slate-500' :
                                                    'bg-amber-500'
                                                }`}></span>
                                            {sub.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 whitespace-nowrap text-sm font-bold text-slate-200">
                                        ${sub.grand_total.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-5 whitespace-nowrap text-sm text-slate-500">
                                        {sub.next_billing_date || 'Not scheduled'}
                                    </td>
                                    <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                                        {sub.status === 'draft' && (
                                            <button
                                                onClick={() => handleConfirm(sub.id)}
                                                className="inline-flex items-center px-4 py-2 border border-transparent text-xs font-bold rounded-lg text-slate-900 bg-cyan-500 hover:bg-cyan-400 shadow-lg shadow-cyan-500/20 transition-all"
                                            >
                                                Confirm & Bill
                                            </button>
                                        )}
                                        {(sub.status === 'active' || sub.status === 'confirmed') && (
                                            <>
                                                <button className="text-cyan-500 hover:text-white font-bold mr-3 transition-colors">View Invoices</button>
                                                <button
                                                    onClick={async () => {
                                                        if (confirm('Are you sure you want to cancel this subscription?')) {
                                                            try {
                                                                await SubscriptionService.cancel(sub.id);
                                                                fetchData();
                                                            } catch (e) { console.error(e); alert('Failed to cancel'); }
                                                        }
                                                    }}
                                                    className="text-rose-500 hover:text-rose-400 font-bold transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div >
    );
};

export default Subscriptions;
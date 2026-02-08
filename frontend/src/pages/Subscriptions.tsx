import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Subscription, SubscriptionCreate } from '../types/subscription';
import { Product } from '../types/product';
import { Plan } from '../types/plan';
import SubscriptionService from '../services/subscriptionService';
import ProductService from '../services/productService';
import PlanService from '../services/planService';
import CustomerService, { Customer } from '../services/customerService';
import { useLabels } from '../hooks/useLabels';

const Subscriptions: React.FC = () => {
    const navigate = useNavigate();
    const labels = useLabels();
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    
    // Form State
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState<number>(0);
    
    const generateSubscriptionNumber = (): string => {
        return `SUB-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    };

    const [newSub, setNewSub] = useState<SubscriptionCreate>({
        subscription_number: generateSubscriptionNumber(),
        plan_id: 0,
        customer_id: 0,
        start_date: new Date().toISOString().split('T')[0], // Current date
        subscription_lines: [], // Aligned with backend
    });

    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [fetchedSubs, fetchedProducts, fetchedPlans, fetchedCustomers] = await Promise.all([
                SubscriptionService.getAll(),
                ProductService.getAll(),
                PlanService.getAll(),
                CustomerService.getAll()
            ]);
            setSubscriptions(fetchedSubs);
            setProducts(fetchedProducts);
            setPlans(fetchedPlans);
            setCustomers(fetchedCustomers);
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
            [name]: name === 'plan_id' || name === 'customer_id' ? parseInt(value) : value
        }));
    };

    const handleNext = () => {
        // Basic validation before moving to the next step
        if (currentStep === 1 && (!newSub.subscription_number || !newSub.start_date)) return;
        if (currentStep === 2 && !newSub.plan_id) return;
        if (currentStep === 3 && newSub.subscription_lines.length === 0) return; // Ensure at least one item is added
        setCurrentStep(prev => prev + 1);
    };

    const handlePrevious = () => {
        setCurrentStep(prev => prev - 1);
    };

    const handleItemChange = (productId: number, quantity: number) => {
        setNewSub(prev => {
            const product = products.find(p => p.id === productId);
            if (!product) return prev; // Should not happen if productId is valid

            const existingItemIndex = prev.subscription_lines.findIndex(item => item.product_id === productId);

            if (quantity <= 0) {
                return { ...prev, subscription_lines: prev.subscription_lines.filter(item => item.product_id !== productId) };
            } else if (existingItemIndex > -1) {
                const updatedLines = [...prev.subscription_lines];
                const updatedLine = {
                    ...updatedLines[existingItemIndex],
                    quantity: quantity,
                    line_total: product.base_price * quantity * (1 + (updatedLines[existingItemIndex].tax_percent || 0) / 100 - (updatedLines[existingItemIndex].discount_percent || 0) / 100)
                };
                updatedLines[existingItemIndex] = updatedLine;
                return { ...prev, subscription_lines: updatedLines };
            } else {
                // Default tax/discount for new line item
                const tax_percent = 0; // Assuming 0% tax for simplicity for now
                const discount_percent = 0; // Assuming 0% discount for simplicity for now
                const line_total = product.base_price * quantity * (1 + tax_percent / 100 - discount_percent / 100);

                return {
                    ...prev,
                    subscription_lines: [
                        ...prev.subscription_lines,
                        {
                            product_id: productId,
                            product_name_snapshot: product.name,
                            unit_price_snapshot: product.base_price,
                            quantity: quantity,
                            tax_percent: tax_percent,
                            discount_percent: discount_percent,
                            line_total: line_total
                        }
                    ]
                };
            }
        });
    };

    const handleSubmit = async () => { // Removed 'e: React.FormEvent' as it's now internal to the wizard
        try {
            // Ensure status is set, if not provided in newSub, backend will default
            const payload = { ...newSub, status: newSub.status || 'draft' };

            const createdSubscription = await SubscriptionService.create(payload); // Assume API returns created sub
            
            // Now confirm the subscription to generate the invoice
            const confirmedSubscription = await SubscriptionService.confirm(createdSubscription.id);
            
            alert('Subscription created and confirmed successfully!');
            setIsFormVisible(false);
            setNewSub({ // Reset form
                subscription_number: generateSubscriptionNumber(),
                plan_id: 0,
                customer_id: 0,
                start_date: new Date().toISOString().split('T')[0],
                subscription_lines: [],
            });
            setCurrentStep(1); // Reset wizard step
            fetchData();
            window.dispatchEvent(new CustomEvent('dashboardRefresh')); // Dispatch event to refresh dashboard
            navigate(`/invoices/${confirmedSubscription.invoice_id}`);
        } catch (error: any) {
            console.error("Failed to create subscription", error);
            const message = error.response?.data?.detail || 'Failed to create subscription.';
            alert(message);
            // Regenerate subscription number to prevent unique constraint violation on retry
            setNewSub(prev => ({ ...prev, subscription_number: generateSubscriptionNumber() }));
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

        newSub.subscription_lines.forEach(line => {
            total += line.line_total;
        });
        return total.toFixed(2);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Subscriptions</h2>
                    <p className="text-slate-500 text-sm mt-1 font-medium">Provision and manage recurring services.</p>
                </div>
                <button 
                    onClick={() => { setIsFormVisible(!isFormVisible); setCurrentStep(1); setNewSub({
                        subscription_number: generateSubscriptionNumber(),
                        plan_id: 0,
                        customer_id: 0,
                        start_date: new Date().toISOString().split('T')[0],
                        subscription_lines: [],
                    }); }}
                    className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm ${isFormVisible ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-200'}`}
                >
                    {isFormVisible ? 'Dismiss Wizard' : 'Create Subscription'}
                </button>
            </div>

            {isFormVisible && (
                <div className="premium-card executive-shadow overflow-visible">
                    <div className="border-b border-slate-100 bg-slate-50/50 px-8 py-4 flex justify-between items-center">
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Provisioning Wizard</h3>
                        <div className="flex space-x-2">
                            {[1, 2, 3, 4].map(step => (
                                <div key={step} className={`w-8 h-1.5 rounded-full transition-all duration-500 ${step <= currentStep ? 'bg-indigo-600' : 'bg-slate-200'}`}></div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="p-8">
                        <div className="mb-8">
                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">Step {currentStep} of 4</span>
                            <h4 className="text-xl font-bold text-slate-900 mt-1">
                                {currentStep === 1 && `Select ${labels?.customer} & Details`}
                                {currentStep === 2 && 'Choose Service Plan'}
                                {currentStep === 3 && 'Configure Line Items'}
                                {currentStep === 4 && 'Review & Finalize'}
                            </h4>
                        </div>
                        
                        {currentStep === 1 && (
                            <div className="max-w-xl space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{labels?.customer}</label>
                                    <select
                                        name="customer_id"
                                        required
                                        value={newSub.customer_id}
                                        onChange={handleInputChange}
                                        className="w-full h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all px-4 text-sm font-medium"
                                    >
                                        <option value={0}>Choose a {labels?.customer}</option>
                                        {customers.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Reference ID</label>
                                        <input
                                            type="text"
                                            name="subscription_number"
                                            required
                                            value={newSub.subscription_number}
                                            onChange={handleInputChange}
                                            className="w-full h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all px-4 text-sm font-medium"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Start Date</label>
                                        <input
                                            type="date"
                                            name="start_date"
                                            required
                                            value={newSub.start_date}
                                            onChange={handleInputChange}
                                            className="w-full h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all px-4 text-sm font-medium"
                                        />
                                    </div>
                                </div>
                                <div className="pt-4">
                                    <button
                                        onClick={handleNext}
                                        disabled={!newSub.subscription_number || !newSub.start_date || !newSub.customer_id}
                                        className="bg-slate-900 text-white px-8 py-3 rounded-xl text-sm font-bold hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200 active:scale-95 disabled:bg-slate-200 disabled:shadow-none"
                                    >
                                        Continue
                                    </button>
                                </div>
                            </div>
                        )}

                        {currentStep === 2 && (
                            <div className="max-w-xl space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Service Category</label>
                                    <select
                                        value={selectedProductId}
                                        onChange={handleProductChange}
                                        className="w-full h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all px-4 text-sm font-medium"
                                    >
                                        {products.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tier / Plan</label>
                                    <div className="grid grid-cols-1 gap-3">
                                        {availablePlans.map(p => (
                                            <button
                                                key={p.id}
                                                onClick={() => setNewSub(prev => ({ ...prev, plan_id: p.id }))}
                                                className={`flex justify-between items-center p-4 border rounded-xl transition-all ${newSub.plan_id === p.id ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-200 hover:border-slate-300 bg-white'}`}
                                            >
                                                <div className="text-left">
                                                    <p className="text-sm font-bold text-slate-900">{p.name}</p>
                                                    <p className="text-xs font-medium text-slate-500">Standard service tier</p>
                                                </div>
                                                <span className="text-sm font-black text-indigo-600">${p.price}/mo</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex justify-between pt-4">
                                    <button onClick={handlePrevious} className="text-slate-500 text-sm font-bold hover:text-slate-900">Go Back</button>
                                    <button
                                        onClick={handleNext}
                                        disabled={!newSub.plan_id}
                                        className="bg-slate-900 text-white px-8 py-3 rounded-xl text-sm font-bold hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200 active:scale-95 disabled:bg-slate-200"
                                    >
                                        Configuration
                                    </button>
                                </div>
                            </div>
                        )}

                        {currentStep === 3 && (
                            <div className="max-w-2xl space-y-6">
                                <p className="text-sm font-medium text-slate-500">Adjust quantities for the selected infrastructure products.</p>
                                <div className="space-y-3">
                                    {products.filter(p => p.id === selectedProductId).map(product => (
                                        <div key={product.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-slate-50/30">
                                            <div>
                                                <span className="text-sm font-bold text-slate-900">{product.name}</span>
                                                <p className="text-[11px] font-medium text-slate-400 mt-0.5">${product.base_price.toFixed(2)} per unit</p>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <button onClick={() => handleItemChange(product.id, Math.max(0, (newSub.subscription_lines.find(item => item.product_id === product.id)?.quantity || 0) - 1))} className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-white">-</button>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    readOnly
                                                    value={newSub.subscription_lines.find(item => item.product_id === product.id)?.quantity || 0}
                                                    className="w-12 text-center text-sm font-black bg-transparent"
                                                />
                                                <button onClick={() => handleItemChange(product.id, (newSub.subscription_lines.find(item => item.product_id === product.id)?.quantity || 0) + 1)} className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-white">+</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between pt-4">
                                    <button onClick={handlePrevious} className="text-slate-500 text-sm font-bold hover:text-slate-900">Go Back</button>
                                    <button
                                        onClick={handleNext}
                                        disabled={newSub.subscription_lines.length === 0}
                                        className="bg-slate-900 text-white px-8 py-3 rounded-xl text-sm font-bold hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200 active:scale-95 disabled:bg-slate-200"
                                    >
                                        Review Summary
                                    </button>
                                </div>
                            </div>
                        )}

                        {currentStep === 4 && (
                            <div className="max-w-2xl">
                                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 space-y-6">
                                    <div className="grid grid-cols-2 gap-8 pb-6 border-b border-slate-200/60">
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reference</label>
                                            <p className="text-sm font-bold text-slate-900 mt-1">{newSub.subscription_number}</p>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Commencement</label>
                                            <p className="text-sm font-bold text-slate-900 mt-1">{newSub.start_date}</p>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Service Plan</label>
                                            <p className="text-sm font-bold text-slate-900 mt-1">{getPlanName(newSub.plan_id)}</p>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Status</label>
                                            <p className="text-sm font-bold text-slate-900 mt-1">Pending Confirmation</p>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Line Item Breakdown</label>
                                        {newSub.subscription_lines.map(item => (
                                            <div key={item.product_id} className="flex justify-between items-center text-sm font-medium">
                                                <span className="text-slate-600">{item.product_name_snapshot} <span className="text-slate-400 ml-1">×{item.quantity}</span></span>
                                                <span className="text-slate-900 font-bold">${item.line_total.toFixed(2)}</span>
                                            </div>
                                        ))}
                                        <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                                            <span className="text-sm font-black text-slate-900 uppercase tracking-tight">Projected Total</span>
                                            <span className="text-2xl font-black text-indigo-600">${calculateTotalPrice()}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-between pt-8">
                                    <button onClick={handlePrevious} className="text-slate-500 text-sm font-bold hover:text-slate-900">Review Config</button>
                                    <button
                                        onClick={handleSubmit}
                                        className="bg-indigo-600 text-white px-10 py-4 rounded-xl text-sm font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95"
                                    >
                                        Confirm & Provision
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="premium-card executive-shadow min-h-[400px]">
                {loading ? (
                    <div className="p-20 flex flex-col items-center justify-center space-y-4">
                        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-slate-400 font-medium text-sm">Querying active provisions...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/50">
                                    <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest">ID</th>
                                    <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest">Reference</th>
                                    <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest">{labels?.customer}</th>
                                    <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest">Tier Details</th>
                                    <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest">Renewal</th>
                                    <th className="px-6 py-4 text-right text-[11px] font-bold text-slate-500 uppercase tracking-widest">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {subscriptions.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-20 text-center text-slate-400 font-medium">No active subscriptions found.</td>
                                    </tr>
                                ) : (
                                    subscriptions.map((sub) => (
                                        <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors group">
                                            <td className="px-6 py-4 whitespace-nowrap text-[12px] font-bold text-slate-400 uppercase tracking-tighter">#{sub.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">{sub.subscription_number}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-600">
                                                {customers.find(c => c.id === sub.customer_id)?.name || 'Unknown'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-500">{getPlanName(sub.plan_id)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`status-pill ${
                                                    sub.status === 'active' ? 'status-pill-success' : 'status-pill-warning'
                                                }`}>
                                                    {sub.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-400">{sub.next_billing_date}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-black text-slate-900">${sub.grand_total?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
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

export default Subscriptions;

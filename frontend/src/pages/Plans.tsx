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
        billing_period: 'monthly', // Changed from interval
        price: 0,
        renewable: true,
        pausable: true,
        start_date: '', // Changed from validity_start_date
        end_date: '' // Changed from validity_end_date
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
        const checked = (e.target as HTMLInputElement).checked;
        
        setNewPlan(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : (name === 'price' || name === 'product_id' ? (value === '' ? 0 : parseFloat(value)) : value)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await PlanService.create(newPlan);
            setNewPlan({
                product_id: products[0]?.id || 0,
                name: '',
                billing_period: 'monthly', // Changed from interval
                price: 0,
                renewable: true,
                pausable: true,
                start_date: '', // Changed from validity_start_date
                end_date: '' // Changed from validity_end_date
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
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Billing Plans</h2>
                    <p className="text-slate-500 text-sm mt-1 font-medium">Define recurring billing structures and service tiers.</p>
                </div>
                <button 
                    onClick={() => setIsFormVisible(!isFormVisible)}
                    className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm ${isFormVisible ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-200'}`}
                >
                    {isFormVisible ? 'Discard' : 'New Billing Plan'}
                </button>
            </div>

            {isFormVisible && (
                <div className="premium-card executive-shadow p-8">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Plan Specification</h3>
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Associated Product</label>
                                    <select
                                        name="product_id"
                                        value={newPlan.product_id}
                                        onChange={handleInputChange}
                                        className="w-full h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all px-4 text-sm font-medium"
                                    >
                                        {products.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Plan Designation</label>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        placeholder="e.g. Professional Tier - Annual"
                                        value={newPlan.name}
                                        onChange={handleInputChange}
                                        className="w-full h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all px-4 text-sm font-medium"
                                    />
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Billing Frequency</label>
                                        <select
                                            name="billing_period"
                                            value={newPlan.billing_period}
                                            onChange={handleInputChange}
                                            className="w-full h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all px-4 text-sm font-medium capitalize"
                                        >
                                            <option value="monthly">Monthly</option>
                                            <option value="yearly">Yearly</option>
                                            <option value="quarterly">Quarterly</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Recurring Price</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">$</span>
                                            <input
                                                type="number"
                                                name="price"
                                                required
                                                min="0"
                                                step="0.01"
                                                value={newPlan.price}
                                                onChange={handleInputChange}
                                                className="w-full h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all pl-8 pr-4 text-sm font-medium"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-8 pt-2">
                                    <label className="group flex items-center space-x-3 cursor-pointer">
                                        <div className={`w-10 h-6 rounded-full transition-colors relative ${newPlan.renewable ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${newPlan.renewable ? 'left-5' : 'left-1'}`}></div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            name="renewable"
                                            hidden
                                            checked={newPlan.renewable}
                                            onChange={(e) => setNewPlan(prev => ({ ...prev, renewable: e.target.checked }))}
                                        />
                                        <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors">Renewable</span>
                                    </label>
                                    <label className="group flex items-center space-x-3 cursor-pointer">
                                        <div className={`w-10 h-6 rounded-full transition-colors relative ${newPlan.pausable ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${newPlan.pausable ? 'left-5' : 'left-1'}`}></div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            name="pausable"
                                            hidden
                                            checked={newPlan.pausable}
                                            onChange={(e) => setNewPlan(prev => ({ ...prev, pausable: e.target.checked }))}
                                        />
                                        <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors">Pausable</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Campaign Commencement</label>
                                <input
                                    type="date"
                                    name="start_date"
                                    value={newPlan.start_date || ''}
                                    onChange={handleInputChange}
                                    className="w-full h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all px-4 text-sm font-medium"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Campaign Termination</label>
                                <input
                                    type="date"
                                    name="end_date"
                                    value={newPlan.end_date || ''}
                                    onChange={handleInputChange}
                                    className="w-full h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all px-4 text-sm font-medium"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                className="bg-slate-900 text-white px-10 py-3 rounded-xl text-sm font-bold hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200 active:scale-95"
                            >
                                Publish Billing Plan
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="premium-card executive-shadow min-h-[400px]">
                {loading ? (
                    <div className="p-20 flex flex-col items-center justify-center space-y-4">
                        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-slate-400 font-medium text-sm">Querying billing configurations...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/50">
                                    <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest">Product</th>
                                    <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest">Plan Designation</th>
                                    <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest">Cycle</th>
                                    <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest">Rate</th>
                                    <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest">Features</th>
                                    <th className="px-6 py-4 text-right text-[11px] font-bold text-slate-500 uppercase tracking-widest">Validity</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {plans.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-20 text-center text-slate-400 font-medium">No billing plans defined yet.</td>
                                    </tr>
                                ) : (
                                    plans.map((plan) => (
                                        <tr key={plan.id} className="hover:bg-slate-50/80 transition-colors group">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">{getProductName(plan.product_id)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-600">{plan.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
                                                    {plan.billing_period}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-slate-900">${plan.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex space-x-2">
                                                    {plan.renewable && <span className="status-pill status-pill-success scale-75 origin-left">Auto-Renew</span>}
                                                    {plan.pausable && <span className="status-pill status-pill-info scale-75 origin-left">Pausable</span>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <div className="flex flex-col items-end">
                                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">Starts: {plan.start_date || 'Live'}</span>
                                                    <span className="text-[10px] font-medium text-slate-300 uppercase tracking-tighter">Ends: {plan.end_date || 'Indefinite'}</span>
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

export default Plans;

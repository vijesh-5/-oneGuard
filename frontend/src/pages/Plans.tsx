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
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-4xl font-bold text-white tracking-tight">Billing Plans</h2>
                    <p className="mt-2 text-slate-400">Define recurring billing rules for your products.</p>
                </div>
                <button
                    onClick={() => setIsFormVisible(!isFormVisible)}
                    className="btn-neon inline-flex items-center px-6 py-2.5 rounded-lg shadow-lg"
                >
                    {isFormVisible ? 'Cancel' : 'Create Plan'}
                </button>
            </div>

            {isFormVisible && (
                <div className="glass-neon p-8 rounded-2xl mb-10 animate-in fade-in slide-in-from-top-4 duration-300">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-cyan-500 rounded-full"></span>
                        New Billing Configuration
                    </h3>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Associated Product</label>
                            <select
                                name="product_id"
                                value={newPlan.product_id}
                                onChange={handleInputChange}
                                className="input-glass w-full rounded-lg p-3 bg-slate-900"
                            >
                                {products.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Plan Display Name</label>
                            <input
                                type="text"
                                name="name"
                                required
                                placeholder="e.g. Pro Monthly"
                                value={newPlan.name}
                                onChange={handleInputChange}
                                className="input-glass w-full rounded-lg p-3"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Billing Period</label>
                            <select
                                name="billing_period"
                                value={newPlan.billing_period}
                                onChange={handleInputChange}
                                className="input-glass w-full rounded-lg p-3 bg-slate-900"
                            >
                                <option value="monthly">Monthly</option>
                                <option value="yearly">Yearly</option>
                                <option value="quarterly">Quarterly</option>
                                <option value="weekly">Weekly</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Recurring Price (USD)</label>
                            <input
                                type="number"
                                name="price"
                                required
                                min="0"
                                step="0.01"
                                value={newPlan.price || ''}
                                onChange={handleInputChange}
                                className="input-glass w-full rounded-lg p-3"
                            />
                        </div>

                        <div className="col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                            <label className="flex items-center space-x-3 cursor-pointer group">
                                <input type="checkbox" name="renewable" checked={newPlan.renewable} onChange={handleInputChange} className="h-5 w-5 text-cyan-500 rounded border-slate-600 bg-slate-800 focus:ring-cyan-500/50 focus:ring-offset-0" />
                                <span className="text-sm font-medium text-slate-300 group-hover:text-cyan-400 transition-colors">Auto-Renew</span>
                            </label>
                            <label className="flex items-center space-x-3 cursor-pointer group">
                                <input type="checkbox" name="pausable" checked={newPlan.pausable} onChange={handleInputChange} className="h-5 w-5 text-cyan-500 rounded border-slate-600 bg-slate-800 focus:ring-cyan-500/50 focus:ring-offset-0" />
                                <span className="text-sm font-medium text-slate-300 group-hover:text-cyan-400 transition-colors">Pausable</span>
                            </label>
                            <label className="flex items-center space-x-3 cursor-pointer group">
                                <input type="checkbox" name="auto_close" checked={newPlan.auto_close} onChange={handleInputChange} className="h-5 w-5 text-cyan-500 rounded border-slate-600 bg-slate-800 focus:ring-cyan-500/50 focus:ring-offset-0" />
                                <span className="text-sm font-medium text-slate-300 group-hover:text-cyan-400 transition-colors">Auto-Close</span>
                            </label>
                        </div>

                        <div className="col-span-2 pt-4">
                            <button
                                type="submit"
                                className="w-full inline-flex justify-center py-3.5 px-4 rounded-lg shadow-lg text-sm font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 transition-all duration-300"
                            >
                                Activate Billing Plan
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="glass-panel overflow-hidden rounded-2xl overflow-x-auto">
                {loading ? (
                    <div className="p-12 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
                        <p className="mt-4 text-slate-400">Syncing plans...</p>
                    </div>
                ) : plans.length === 0 ? (
                    <div className="p-16 text-center text-slate-500">
                        <div className="mb-4">
                            <span className="inline-block p-4 rounded-full bg-slate-800/50 text-slate-600">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                            </span>
                        </div>
                        <p className="text-lg font-medium text-slate-400">No plans configured yet</p>
                        <p className="text-sm mt-1">Create a plan to start selling your products.</p>
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-slate-800">
                        <thead className="bg-slate-900/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Target Product</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Plan Name</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Period</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Price</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {plans.map((plan) => (
                                <tr key={plan.id} className="table-row-hover group">
                                    <td className="px-6 py-5 whitespace-nowrap text-sm text-white font-bold group-hover:text-cyan-400 transition-colors">{getProductName(plan.product_id)}</td>
                                    <td className="px-6 py-5 whitespace-nowrap text-sm text-slate-400 font-medium">{plan.name}</td>
                                    <td className="px-6 py-5 whitespace-nowrap">
                                        <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-800 border border-slate-700 text-cyan-400">
                                            {plan.billing_period}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 whitespace-nowrap text-sm font-bold text-slate-200">${plan.price.toFixed(2)}</td>
                                    <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                                        <button className="text-cyan-500 hover:text-cyan-400 transition-colors font-bold">Configure</button>
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
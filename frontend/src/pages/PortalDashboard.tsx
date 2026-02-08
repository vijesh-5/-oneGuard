import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import SubscriptionService from '../services/subscriptionService';
import InvoiceService from '../services/invoiceService';
import { Subscription } from '../types/subscription';
import { Invoice } from '../types/invoice';
import { useLabels } from '../hooks/useLabels';

const PortalDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const labels = useLabels();
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [subs, invs] = await Promise.all([
                    SubscriptionService.getAll(),
                    InvoiceService.getAll()
                ]);
                setSubscriptions(subs);
                setInvoices(invs);
            } catch (error) {
                console.error("Failed to fetch portal data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleLogout = () => {
        logout();
        window.location.href = '/login';
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50 font-sans animate-in fade-in duration-700">
            <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200/60 executive-shadow h-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <span className="text-2xl font-black text-slate-900 tracking-tight">
                            <span className="text-indigo-600">-</span>oneGuard
                        </span>
                        <span className="bg-indigo-50 text-indigo-600 text-[10px] uppercase font-black px-2.5 py-1 rounded-lg border border-indigo-100 tracking-widest">Portal</span>
                    </div>
                    <div className="flex items-center space-x-6">
                        <div className="hidden sm:flex flex-col items-end">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Authenticated as</span>
                            <span className="text-sm font-bold text-slate-900">{user?.full_name || user?.username || user?.email}</span>
                        </div>
                        <button 
                            onClick={handleLogout} 
                            className="text-xs font-black text-slate-400 hover:text-rose-600 transition-colors uppercase tracking-widest"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-16">
                {/* Executive Hero */}
                <div className="bg-slate-900 rounded-[2rem] p-10 sm:p-16 text-white shadow-2xl overflow-hidden relative group">
                    <div className="relative z-10 max-w-2xl">
                        <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">Enterprise Hub</h2>
                        <p className="text-slate-400 text-lg font-medium leading-relaxed">Centralized management of your corporate {labels?.subscriptions} and financial records.</p>
                        <div className="mt-10 flex space-x-4">
                            <div className="px-6 py-3 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10">
                                <span className="block text-[10px] font-bold text-indigo-300 uppercase tracking-widest">Active Contracts</span>
                                <span className="text-2xl font-black text-white">{subscriptions.length}</span>
                            </div>
                            <div className="px-6 py-3 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10">
                                <span className="block text-[10px] font-bold text-emerald-300 uppercase tracking-widest">Recent Invoices</span>
                                <span className="text-2xl font-black text-white">{invoices.length}</span>
                            </div>
                        </div>
                    </div>
                    {/* Abstract Decorative Elements */}
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-indigo-600/20 to-transparent"></div>
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500 rounded-full opacity-20 blur-[100px] group-hover:opacity-30 transition-opacity duration-1000"></div>
                </div>

                {/* Subscriptions Grid */}
                <section className="space-y-8">
                    <div className="flex items-end justify-between px-2">
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Active {labels?.subscriptions}</h3>
                            <p className="text-slate-500 text-sm font-medium mt-1">Live monitoring of your provisioned services.</p>
                        </div>
                    </div>
                    
                    {subscriptions.length === 0 ? (
                        <div className="premium-card p-20 text-center border-dashed">
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-sm text-center">No active {labels?.subscriptions} assigned to this profile.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {subscriptions.map((sub) => (
                                <div key={sub.id} className="premium-card executive-shadow p-8 hover:-translate-y-1 transition-all duration-300 bg-white group">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1 block">Contract Certificate</span>
                                            <h4 className="text-xl font-black text-slate-900 tracking-tighter">#{sub.subscription_number}</h4>
                                        </div>
                                        <span className={`status-pill ${
                                            sub.status === 'active' ? 'status-pill-success' : 'status-pill-neutral'
                                        }`}>
                                            {sub.status}
                                        </span>
                                    </div>
                                    <div className="space-y-4 pt-6 border-t border-slate-50">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Aggregate Value</span>
                                            <span className="text-lg font-black text-slate-900">${(sub.grand_total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Next Settlement</span>
                                            <span className="text-sm font-black text-slate-700">{sub.next_billing_date || 'N/A'}</span>
                                        </div>
                                    </div>
                                    <button className="w-full mt-8 py-3 rounded-xl bg-slate-50 text-slate-900 text-xs font-black uppercase tracking-widest hover:bg-slate-100 transition-colors">
                                        View Details
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Invoices Record */}
                <section className="space-y-8">
                    <div className="flex items-end justify-between px-2">
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Recent Financial Records</h3>
                            <p className="text-slate-500 text-sm font-medium mt-1">Validated {labels?.invoices} and transaction history.</p>
                        </div>
                    </div>

                    <div className="premium-card executive-shadow overflow-hidden bg-white">
                        {invoices.length === 0 ? (
                            <div className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest text-sm">Historical records unavailable.</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead>
                                        <tr className="border-b border-slate-100 bg-slate-50/50">
                                            <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">Record ID</th>
                                            <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">Execution Date</th>
                                            <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">Gross total</th>
                                            <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">Settlement Status</th>
                                            <th className="px-6 py-4 text-right text-[11px] font-bold text-slate-400 uppercase tracking-widest">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {invoices.map((inv) => (
                                            <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors group">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-slate-900">
                                                    #{inv.id}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-500">
                                                    {inv.issue_date}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-[15px] font-black text-slate-900">
                                                    ${inv.grand_total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`status-pill ${
                                                        inv.status === 'paid' ? 'status-pill-success' : 
                                                        inv.status === 'overdue' ? 'status-pill-danger' : 
                                                        'status-pill-warning'
                                                    }`}>
                                                        {inv.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    {inv.status !== 'paid' ? (
                                                        <button className="bg-slate-900 text-white px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200 active:scale-95">
                                                            Settle Invoice
                                                        </button>
                                                    ) : (
                                                        <button className="text-xs font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-800 transition-colors">
                                                            Download Receipt
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default PortalDashboard;

import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLabels } from '../hooks/useLabels';

const Dashboard: React.FC = () => {
    const { user, setMode } = useAuth();
    const labels = useLabels();

    const [activeSubscriptions, setActiveSubscriptions] = useState(0);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [unpaidInvoices, setUnpaidInvoices] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await api.get('/dashboard/stats');
                const data = response.data;
                setActiveSubscriptions(data.active_subscriptions);
                setTotalRevenue(data.total_revenue);
                setUnpaidInvoices(data.unpaid_invoices);
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData(); // Initial fetch

        const handleDashboardRefresh = () => {
            fetchData();
        };

        window.addEventListener('dashboardRefresh', handleDashboardRefresh);

        return () => {
            window.removeEventListener('dashboardRefresh', handleDashboardRefresh);
        };
    }, [user?.mode]);


    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Executive Summary</h2>
                    <p className="text-slate-500 text-sm mt-1 font-medium">Real-time overview of your {user?.mode} operations.</p>
                </div>
                
                <div className="flex items-center p-1.5 bg-white border border-slate-200/60 rounded-xl shadow-sm executive-shadow">
                    <button 
                        onClick={() => user?.mode !== 'personal' && setMode('personal')}
                        className={`text-xs font-bold px-4 py-2 rounded-lg transition-all ${user?.mode === 'personal' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Personal
                    </button>
                    <button 
                        onClick={() => user?.mode !== 'business' && setMode('business')}
                        className={`text-xs font-bold px-4 py-2 rounded-lg transition-all ${user?.mode === 'business' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Business
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="premium-card p-8 h-40 animate-pulse bg-slate-100/50"></div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="premium-card p-8 flex justify-between items-start">
                        <div>
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Active {labels?.subscriptions}</h3>
                            <p className="text-5xl font-black text-slate-900 mt-4 tracking-tighter">{activeSubscriptions}</p>
                        </div>
                        <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                        </div>
                    </div>

                    <div className="premium-card p-8 flex justify-between items-start">
                        <div>
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total {labels?.income}</h3>
                            <p className="text-5xl font-black text-slate-900 mt-4 tracking-tighter">${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                        </div>
                        <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                    </div>

                    <div className="premium-card p-8 flex justify-between items-start">
                        <div>
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Unpaid {labels?.invoices}</h3>
                            <p className="text-5xl font-black text-slate-900 mt-4 tracking-tighter">{unpaidInvoices}</p>
                        </div>
                        <div className="p-3 bg-rose-50 rounded-xl text-rose-600">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
                <div className="premium-card p-8 min-h-[300px] flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center">
                        <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                    </div>
                    <h4 className="text-lg font-bold text-slate-900">Activity Overview</h4>
                    <p className="text-slate-400 text-sm max-w-xs">Detailed analytics and growth metrics will appear here as your data matures.</p>
                </div>
                <div className="premium-card p-8 min-h-[300px] flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center">
                        <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </div>
                    <h4 className="text-lg font-bold text-slate-900">Quick Actions</h4>
                    <p className="text-slate-400 text-sm max-w-xs">Use the navigation menu to manage your {labels?.subscriptions} and {labels?.invoices}.</p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

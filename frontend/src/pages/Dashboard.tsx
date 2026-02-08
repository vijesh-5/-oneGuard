import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useLabels } from '../hooks/useLabels';
import { useAuth } from '../context/AuthContext';

interface DashboardStats {
    active_subscriptions: number;
    mrr: number;
    pending_invoices_count: number;
    pending_invoices_amount: number;
    recent_activity: {
        id: number;
        description: string;
        date: string;
        status: string;
    }[];
}

const Dashboard: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const labels = useLabels();
    const { user } = useAuth();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/stats/dashboard');
                setStats(response.data);
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return (
        <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );

    if (!stats) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                <p>Unable to load dashboard data.</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-4 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-end justify-between">
                <div>
                    <h2 className="text-4xl font-bold text-white tracking-tight">Dashboard</h2>
                    <p className="mt-2 text-slate-400">Welcome back to Command Center.</p>
                </div>
                <div className="hidden sm:block">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Metric Card 1: Active Subscriptions */}
                <div className="glass-card rounded-2xl p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <svg className="w-24 h-24 text-cyan-500 transform translate-x-4 -translate-y-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    </div>
                    <div>
                        <div className="flex items-center mb-4">
                            <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400 mr-3 border border-cyan-500/20">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                            </div>
                            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">{labels.subscriptions}</h3>
                        </div>
                        <p className="text-3xl font-bold text-white tracking-tight">{stats?.active_subscriptions || 0}</p>
                        <p className="text-xs text-cyan-400 mt-2 font-medium flex items-center shadow-glow">
                            Active
                        </p>
                    </div>
                </div>

                {/* Metric Card 2: MRR */}
                <div className="glass-card rounded-2xl p-6 relative overflow-hidden group border-cyan-500/30">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <svg className="w-24 h-24 text-blue-500 transform translate-x-4 -translate-y-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div className="relative">
                        <div className="flex items-center mb-4">
                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 mr-3 border border-blue-500/20">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">{labels.mrr}</h3>
                        </div>
                        <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 tracking-tight">${stats?.mrr.toFixed(2) || '0.00'}</p>
                        <p className="text-xs text-blue-400 mt-2 font-medium">
                            {user?.mode === 'business' ? 'Monthly Recurring Revenue' : 'Total Monthly Cost'}
                        </p>
                    </div>
                </div>

                {/* Metric Card 3: Pending Revenue/Bills */}
                <div className="glass-card rounded-2xl p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <svg className="w-24 h-24 text-amber-500 transform translate-x-4 -translate-y-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div>
                        <div className="flex items-center mb-4">
                            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500 mr-3 border border-amber-500/20">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Pending {labels.invoices}</h3>
                        </div>
                        <p className="text-3xl font-bold text-white tracking-tight">${stats?.pending_invoices_amount.toFixed(2) || '0.00'}</p>
                        <p className="text-xs text-amber-500 mt-2 font-medium">
                            Total {user?.mode === 'business' ? 'Receivable' : 'Payable'}
                        </p>
                    </div>
                </div>

                {/* Metric Card 4: Invoices/Bills Count */}
                <div className="glass-card rounded-2xl p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <svg className="w-24 h-24 text-rose-500 transform translate-x-4 -translate-y-4" fill="currentColor" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </div>
                    <div>
                        <div className="flex items-center mb-4">
                            <div className="p-2 bg-rose-500/10 rounded-lg text-rose-500 mr-3 border border-rose-500/20">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            </div>
                            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">{labels.invoices} Count</h3>
                        </div>
                        <p className="text-3xl font-bold text-white tracking-tight">{stats?.pending_invoices_count || 0}</p>
                        <p className="text-xs text-rose-500 mt-2 font-medium">
                            Awaiting payment
                        </p>
                    </div>
                </div>
            </div>

            <div className="glass-panel rounded-2xl p-8">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-cyan-500 rounded-full"></span>
                        Recent Activity
                    </h3>
                    <button className="text-sm text-cyan-400 font-medium hover:text-cyan-300 hover:underline transition-colors">View All History</button>
                </div>
                <div className="flow-root">
                    <ul className="-mb-8">
                        {stats?.recent_activity.map((activity, idx) => (
                            <li key={activity.id}>
                                <div className="relative pb-8">
                                    {idx !== stats.recent_activity.length - 1 ? (
                                        <span className="absolute top-4 left-4 -ml-px h-full w-px bg-slate-800" aria-hidden="true"></span>
                                    ) : null}
                                    <div className="relative flex space-x-4">
                                        <div>
                                            <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-2 ring-slate-900 ${activity.status === 'active' ? 'bg-green-500/20 text-green-400' :
                                                activity.status === 'cancelled' ? 'bg-rose-500/20 text-rose-400' :
                                                    'bg-slate-800 text-slate-400'
                                                }`}>
                                                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                    {activity.status === 'active' ? (
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    ) : (
                                                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                                    )}
                                                </svg>
                                            </span>
                                        </div>
                                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                            <div>
                                                <p className="text-sm font-medium text-slate-200">{activity.description}</p>
                                                <p className="text-xs text-slate-500">Status: <span className={`font-medium capitalize ${activity.status === 'active' ? 'text-green-400' : 'text-slate-400'}`}>{activity.status}</span></p>
                                            </div>
                                            <div className="text-right text-xs whitespace-nowrap text-slate-500">
                                                <time dateTime={activity.date}>{new Date(activity.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</time>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))}
                        {(!stats?.recent_activity || stats.recent_activity.length === 0) && (
                            <li className="py-8 text-center bg-slate-900/40 rounded-xl border border-dashed border-slate-700">
                                <p className="text-slate-400 text-sm">No recent activity detected.</p>
                                <p className="text-slate-600 text-xs mt-1">Systems are functioning normally.</p>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;

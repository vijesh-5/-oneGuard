import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

interface PortalStats {
    customer_name: string;
    total_invoices: number;
    pending_invoices: number;
    active_subscriptions: number;
    total_due: number;
}

const PortalDashboard: React.FC = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState<PortalStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get<PortalStats>('/portal/dashboard');
                setStats(response.data);
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchStats();
        }
    }, [user]);

    if (loading) {
        return <div className="p-10 text-slate-400">Loading dashboard...</div>;
    }

    if (!stats) {
        return <div className="p-10 text-red-400">Failed to load data. Please contact support.</div>;
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold text-white">Welcome back, {stats.customer_name}</h2>
                <p className="mt-2 text-slate-400">Here is an overview of your account status.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.15-1.46-3.27-3.4h1.96c.1 1.05.69 1.64 1.83 1.64 1.22 0 1.66-.56 1.66-1.34 0-.82-.71-1.22-2.86-1.75-2.12-.51-3.53-1.57-3.53-3.37 0-1.51 1.25-2.67 2.96-3.13V4.8h2.67v1.93c1.55.33 2.76 1.25 3.01 3h-1.94c-.07-.76-.56-1.29-1.48-1.29-1.01 0-1.48.55-1.48 1.14 0 .75.76 1.12 2.77 1.58 2.27.53 3.65 1.58 3.65 3.52 0 1.63-1.39 2.82-3.14 3.19z" /></svg>
                    </div>
                    <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">Total Due</div>
                    <div className="mt-2 text-3xl font-bold text-white">${stats.total_due.toFixed(2)}</div>
                </div>

                <div className="glass-panel p-6 rounded-2xl">
                    <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">Active Subscriptions</div>
                    <div className="mt-2 text-3xl font-bold text-cyan-400">{stats.active_subscriptions}</div>
                </div>

                <div className="glass-panel p-6 rounded-2xl">
                    <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">Pending Invoices</div>
                    <div className="mt-2 text-3xl font-bold text-yellow-500">{stats.pending_invoices}</div>
                </div>

                <div className="glass-panel p-6 rounded-2xl">
                    <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">Total Invoices</div>
                    <div className="mt-2 text-3xl font-bold text-white">{stats.total_invoices}</div>
                </div>
            </div>
        </div>
    );
};

export default PortalDashboard;

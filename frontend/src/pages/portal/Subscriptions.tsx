import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Subscription } from '../../types/subscription';

const PortalSubscriptions: React.FC = () => {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSubs = async () => {
            try {
                const response = await api.get<Subscription[]>('/portal/subscriptions');
                setSubscriptions(response.data);
            } catch (error) {
                console.error("Failed to fetch subscriptions", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSubs();
    }, []);

    if (loading) return <div className="p-10 text-slate-400">Loading subscriptions...</div>;

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white">Active Subscriptions</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subscriptions.map((sub) => (
                    <div key={sub.id} className="glass-panel p-6 rounded-2xl hover:border-cyan-500/30 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-white">{sub.subscription_number}</h3>
                                <p className="text-xs text-slate-500">Started {sub.start_date}</p>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${sub.status === 'active' ? 'bg-green-500/10 text-green-400' : 'bg-slate-500/10 text-slate-400'
                                }`}>
                                {sub.status}
                            </span>
                        </div>

                        <div className="space-y-2 mb-4">
                            {sub.subscription_lines.map(line => (
                                <div key={line.id} className="flex justify-between text-sm">
                                    <span className="text-slate-400">{line.product_name_snapshot}</span>
                                    <span className="text-slate-200 font-medium">${line.line_total.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>

                        <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
                            <span className="text-slate-500 text-sm">Total per cycle</span>
                            <span className="text-xl font-bold text-white">${sub.grand_total.toFixed(2)}</span>
                        </div>
                    </div>
                ))}

                {subscriptions.length === 0 && (
                    <div className="col-span-full p-10 text-center text-slate-500 glass-panel rounded-2xl">
                        No active subscriptions.
                    </div>
                )}
            </div>
        </div>
    );
};

export default PortalSubscriptions;

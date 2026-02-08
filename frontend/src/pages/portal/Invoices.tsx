import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Invoice } from '../../types/invoice';

const PortalInvoices: React.FC = () => {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                const response = await api.get<Invoice[]>('/portal/invoices');
                setInvoices(response.data);
            } catch (error) {
                console.error("Failed to fetch invoices", error);
            } finally {
                setLoading(false);
            }
        };
        fetchInvoices();
    }, []);

    if (loading) return <div className="p-10 text-slate-400">Loading invoices...</div>;

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white">My Invoices</h2>

            <div className="glass-panel overflow-hidden rounded-2xl">
                <table className="min-w-full divide-y divide-slate-800">
                    <thead className="bg-slate-900/50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Invoice #</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Date</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Amount</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-widest">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        {invoices.map((inv) => (
                            <tr key={inv.id} className="table-row-hover group">
                                <td className="px-6 py-5 text-sm font-bold text-white">{inv.invoice_number}</td>
                                <td className="px-6 py-5 text-sm text-slate-400">{inv.issue_date}</td>
                                <td className="px-6 py-5 text-sm font-bold text-slate-200">${inv.grand_total.toFixed(2)}</td>
                                <td className="px-6 py-5">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase ${inv.status === 'paid' ? 'bg-green-500/10 text-green-400' :
                                        inv.status === 'confirmed' ? 'bg-blue-500/10 text-blue-400' :
                                            'bg-slate-500/10 text-slate-400'
                                        }`}>
                                        {inv.status}
                                    </span>
                                </td>
                                <td className="px-6 py-5 text-right">
                                    <button className="text-cyan-400 hover:text-cyan-300 text-xs font-bold uppercase transition-colors">Download PDF</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {invoices.length === 0 && (
                    <div className="p-10 text-center text-slate-500">No invoices found.</div>
                )}
            </div>
        </div>
    );
};

export default PortalInvoices;

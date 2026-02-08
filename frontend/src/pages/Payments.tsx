import React, { useState, useEffect } from 'react';
import { Payment } from '../types/financials';
import { PaymentService } from '../services/financialService';

const Payments: React.FC = () => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPayments = async () => {
            setLoading(true);
            try {
                const data = await PaymentService.getAll();
                setPayments(data);
            } catch (error) {
                console.error("Failed to fetch payments", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPayments();
    }, []);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h2 className="text-3xl font-extrabold text-white">Payment History</h2>
                <p className="mt-1 text-sm text-slate-400">View all transactions and payment statuses.</p>
            </div>

            <div className="glass-panel rounded-2xl overflow-hidden overflow-x-auto">
                {loading ? (
                    <div className="p-20 text-center">
                        <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-500"></div>
                        <p className="mt-4 text-slate-400 font-medium">Loading transactions...</p>
                    </div>
                ) : payments.length === 0 ? (
                    <div className="p-20 text-center text-slate-500">
                        No payments recorded yet.
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-slate-800">
                        <thead className="bg-slate-900/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Date</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Invoice #</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Amount</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Method</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {payments.map((payment) => (
                                <tr key={payment.id} className="hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                                        {new Date(payment.payment_date).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-cyan-400 font-bold">
                                        #{payment.invoice_id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-white">
                                        ${payment.amount.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400 uppercase">
                                        {payment.method}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${payment.status === 'completed' ? 'bg-green-500/10 text-green-400 border border-green-500/20 shadow-[0_0_10px_-4px_theme(colors.green.500)]' :
                                            payment.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                                                'bg-red-500/10 text-red-400 border border-red-500/20'
                                            }`}>
                                            {payment.status}
                                        </span>
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

export default Payments;

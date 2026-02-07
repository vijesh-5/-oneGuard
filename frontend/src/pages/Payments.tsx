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
                <h2 className="text-3xl font-extrabold text-gray-900">Payment History</h2>
                <p className="mt-1 text-sm text-gray-500">View all transactions and payment statuses.</p>
            </div>

            <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
                {loading ? (
                    <div className="p-20 text-center">
                        <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                        <p className="mt-4 text-gray-500 font-medium">Loading transactions...</p>
                    </div>
                ) : payments.length === 0 ? (
                    <div className="p-20 text-center text-gray-500">
                        No payments recorded yet.
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Date</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Invoice #</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Amount</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Method</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-50">
                            {payments.map((payment) => (
                                <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-600">
                                        {new Date(payment.payment_date).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-5 whitespace-nowrap text-sm text-indigo-600 font-bold">
                                        #{payment.invoice_id}
                                    </td>
                                    <td className="px-6 py-5 whitespace-nowrap text-sm font-bold text-gray-900">
                                        ${payment.amount.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-600 uppercase">
                                        {payment.method}
                                    </td>
                                    <td className="px-6 py-5 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-tighter ${
                                            payment.status === 'completed' ? 'bg-green-100 text-green-700' : 
                                            payment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
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

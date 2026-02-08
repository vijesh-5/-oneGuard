import React, { useState, useEffect } from 'react';
import { Invoice } from '../types/invoice';
import { useAuth } from '../context/AuthContext';
import { useLabels } from '../hooks/useLabels';
import axios from 'axios';
const Invoices: React.FC = () => {
    const { token } = useAuth();
    const [invoices, setInvoices] = useState<any[]>([]);
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(null);
    const [paymentForm, setPaymentForm] = useState({
        amount: 0,
        method: 'credit_card',
        reference_id: ''
    });

    const labels = useLabels();

    const fetchInvoices = async () => {
        setLoading(true);
        try {
            const [invoicesRes, customersRes] = await Promise.all([
                axios.get('http://localhost:8000/invoices/', { headers: { Authorization: `Bearer ${token} ` } }),
                axios.get('http://localhost:8000/customers/', { headers: { Authorization: `Bearer ${token} ` } })
            ]);
            setInvoices(invoicesRes.data);
            setCustomers(customersRes.data);
        } catch (error) {
            console.error('Error fetching invoices:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchInvoices();
        }
    }, [token]);

    const getCustomerName = (id: number) => customers.find(c => c.id === id)?.name || `${labels.customer} #${id} `;

    const openPaymentModal = (invoice: Invoice) => {
        setSelectedInvoiceId(invoice.id);
        setPaymentForm({
            amount: invoice.grand_total, // Default to full amount
            method: 'credit_card',
            reference_id: ''
        });
        setIsPaymentModalOpen(true);
    };

    const handlePaymentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedInvoiceId) return;

        try {
            // Use a simulated payment endpoint or a real one if available
            // Assuming we added a method to InvoiceService or PaymentService
            // For now, let's use the simulation endpoint directly via fetch or api service?
            // Checking invoiceService logic available... currently only getAll, getById, updateStatus.
            // I should probably use a direct API call here or add to InvoiceService.
            // Let's assume I will add `InvoiceService.registerPayment`.

            // Wait, I can't modify InvoiceService in this same tool call block easily without risk.
            // But I can define the call here using the raw fetch or similar if needed, 
            // but cleaner to use Service.

            // Let's assume I will update InvoiceService next.
            // Or I can just simulate it here with updateStatus if I didn't want to use the 'simulate' endpoint?
            // The plan said "Call PaymentService.create (or simulate)".
            // I'll assume PaymentService exists or I will create it. 
            // Actually, I don't see PaymentService in the file list I examined.
            // I'll create `PaymentService` in a separate step?
            // No, I'll put the logic here using fetch for now to be safe, or import api.
            // Ah, I can import `api` from `../ services / api`.

            const response = await import('../services/api').then(m => m.default.post('/payments/simulate', {
                invoice_id: selectedInvoiceId,
                amount: paymentForm.amount,
                method: paymentForm.method,
                reference_id: paymentForm.reference_id
            }));

            if (response.status === 201) {
                alert("Payment registered successfully!");
                setIsPaymentModalOpen(false);
                fetchInvoices();
            }
        } catch (error) {
            console.error("Failed to register payment", error);
            alert("Failed to register payment.");
        }
    };

    return (
        <div className="space-y-8 relative">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-4xl font-bold text-white tracking-tight">{labels.invoices}</h2>
                    <p className="mt-2 text-slate-400">Track payments and manage immutable financial records.</p>
                </div>
            </div>

            <div className="glass-panel overflow-hidden rounded-2xl">
                {loading ? (
                    <div className="p-20 text-center">
                        <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-cyan-500"></div>
                        <p className="mt-4 text-slate-400 font-medium">Syncing financial ledger...</p>
                    </div>
                ) : invoices.length === 0 ? (
                    <div className="p-20 text-center text-slate-500">
                        <div className="mb-4">
                            <span className="inline-block p-4 rounded-full bg-slate-800/50 text-slate-600">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            </span>
                        </div>
                        <p className="text-lg font-medium text-slate-400">No invoices generated yet</p>
                        <p className="text-sm mt-1">Confirm a subscription to create an invoice.</p>
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-slate-800">
                        <thead className="bg-slate-900/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">{labels.invoice} #</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">{labels.customer}</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">{labels.subscription}</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Total Amount</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Due Date</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {invoices.map((invoice) => (
                                <tr key={invoice.id} className="table-row-hover group">
                                    <td className="px-6 py-5 whitespace-nowrap">
                                        <div className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">{invoice.invoice_number}</div>
                                        <div className="text-xs text-slate-500 font-medium">Issued: {invoice.issue_date}</div>
                                    </td>
                                    <td className="px-6 py-5 whitespace-nowrap text-sm text-slate-300 font-bold">
                                        {getCustomerName(invoice.customer_id)}
                                    </td>
                                    <td className="px-6 py-5 whitespace-nowrap text-sm text-slate-400">
                                        #{invoice.subscription_id}
                                    </td>
                                    <td className="px-6 py-5 whitespace-nowrap">
                                        <div className="text-sm font-bold text-slate-200">${invoice.grand_total.toFixed(2)}</div>
                                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Tax: ${invoice.tax_total.toFixed(2)}</div>
                                    </td>
                                    <td className="px-6 py-5 whitespace-nowrap">
                                        <span className={`inline - flex items - center px - 3 py - 1 rounded - full text - xs font - bold uppercase tracking - tighter border ${invoice.status === 'paid' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                                            invoice.status === 'confirmed' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                                                invoice.status === 'cancelled' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-slate-500/10 border-slate-500/20 text-slate-400'
                                            } `}>
                                            {invoice.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 whitespace-nowrap text-sm text-slate-500">
                                        {invoice.due_date}
                                    </td>
                                    <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                                        {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                                            <button
                                                onClick={() => openPaymentModal(invoice)}
                                                className="inline-flex items-center px-4 py-2 border border-transparent text-xs font-bold rounded-lg text-slate-900 bg-cyan-500 hover:bg-cyan-400 shadow-lg shadow-cyan-500/20 transition-all"
                                            >
                                                Register Payment
                                            </button>
                                        )}
                                        <button className="ml-3 text-slate-500 hover:text-slate-300 font-bold text-xs uppercase transition-colors">PDF</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Payment Modal */}
            {isPaymentModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity" aria-hidden="true" onClick={() => setIsPaymentModalOpen(false)}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom glass-neon rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <form onSubmit={handlePaymentSubmit}>
                                <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2" id="modal-title">
                                        <span className="w-1.5 h-6 bg-cyan-500 rounded-full"></span>
                                        Register Payment
                                    </h3>
                                    <div className="mt-4 space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Amount Received</label>
                                            <div className="relative rounded-md shadow-sm">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <span className="text-slate-500 sm:text-sm">$</span>
                                                </div>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    required
                                                    value={paymentForm.amount}
                                                    onChange={e => setPaymentForm({ ...paymentForm, amount: parseFloat(e.target.value) })}
                                                    className="input-glass w-full pl-7 pr-12 rounded-lg p-3"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Payment Method</label>
                                            <select
                                                value={paymentForm.method}
                                                onChange={e => setPaymentForm({ ...paymentForm, method: e.target.value })}
                                                className="input-glass w-full rounded-lg p-3 bg-slate-900"
                                            >
                                                <option value="credit_card">Credit Card</option>
                                                <option value="bank_transfer">Bank Transfer</option>
                                                <option value="cash">Cash</option>
                                                <option value="check">Check</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Reference ID / Note</label>
                                            <input
                                                type="text"
                                                value={paymentForm.reference_id}
                                                onChange={e => setPaymentForm({ ...paymentForm, reference_id: e.target.value })}
                                                placeholder="e.g. TXN-12345"
                                                className="input-glass w-full rounded-lg p-3"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-slate-900/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-slate-800">
                                    <button
                                        type="submit"
                                        className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-base font-bold text-white hover:from-cyan-500 hover:to-blue-500 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm transition-all"
                                    >
                                        Confirm Payment
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsPaymentModalOpen(false)}
                                        className="mt-3 w-full inline-flex justify-center rounded-lg border border-slate-700 shadow-sm px-4 py-2 bg-slate-800 text-base font-medium text-slate-300 hover:bg-slate-700 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-all"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Invoices;
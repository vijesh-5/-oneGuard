import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Invoice } from '../types/invoice';
import InvoiceService from '../services/invoiceService';

const InvoiceDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');

    useEffect(() => {
        const fetchInvoice = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const data = await InvoiceService.getById(parseInt(id));
                setInvoice(data);
            } catch (error) {
                console.error("Failed to fetch invoice", error);
                alert("Failed to load invoice details.");
                navigate('/invoices');
            } finally {
                setLoading(false);
            }
        };

        fetchInvoice();
    }, [id, navigate]);

    const handleMarkAsPaid = async () => {
        if (!invoice) return;
        if (!selectedPaymentMethod) {
            alert('Please select a payment method.');
            return;
        }

        try {
            const updatedInvoice = await InvoiceService.pay(invoice.id, selectedPaymentMethod);
            setInvoice(updatedInvoice);
            alert(`Invoice ${invoice.id} marked as paid.`);
            window.dispatchEvent(new CustomEvent('dashboardRefresh'));
        } catch (error) {
            console.error(`Failed to mark invoice ${invoice.id} as paid`, error);
            alert(`Failed to mark invoice ${invoice.id} as paid.`);
        }
    };

    if (loading) {
        return <div className="p-6 text-center text-gray-500">Loading invoice details...</div>;
    }

    if (!invoice) {
        return <div className="p-6 text-center text-gray-500">Invoice not found.</div>;
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <button
                onClick={() => navigate('/invoices')}
                className="group flex items-center space-x-2 text-[11px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors"
            >
                <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
                <span>Return to Records</span>
            </button>

            <div className="premium-card executive-shadow bg-white overflow-hidden">
                <div className="px-8 py-10 border-b border-slate-100 flex justify-between items-start">
                    <div className="space-y-1">
                        <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest leading-none block">Financial Statement</span>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tighter">
                            Invoice #{invoice.id}
                        </h3>
                        <p className="text-sm font-medium text-slate-400">
                            Contract Association: <span className="text-slate-900 font-bold">#{invoice.subscription_id}</span>
                        </p>
                    </div>
                    <div className="flex flex-col items-end space-y-3">
                        <span className={`status-pill ${
                            invoice.status === 'paid' ? 'status-pill-success' :
                            invoice.status === 'overdue' ? 'status-pill-danger' : 'status-pill-warning'
                        }`}>
                            {invoice.status.toUpperCase()}
                        </span>
                    </div>
                </div>
                
                <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="space-y-1.5">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">Settlement Status</span>
                            <span className="text-sm font-black text-slate-900 capitalize">{invoice.status}</span>
                        </div>
                        <div className="space-y-1.5">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">Release Date</span>
                            <span className="text-sm font-black text-slate-900">{invoice.issue_date as unknown as string}</span>
                        </div>
                        <div className="space-y-1.5">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">Maturity Date</span>
                            <span className="text-sm font-black text-slate-900">{invoice.due_date as unknown as string}</span>
                        </div>
                        <div className="space-y-1.5">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">Aggregate Total</span>
                            <span className="text-lg font-black text-slate-900">${invoice.grand_total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                    </div>

                    {invoice.status === 'paid' && (
                        <div className="mt-10 p-6 bg-emerald-50/50 rounded-2xl border border-emerald-100 flex items-center space-x-4">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                            </div>
                            <div>
                                <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest block">Payment Confirmed</span>
                                <p className="text-sm font-bold text-emerald-900">
                                    Settled via {invoice.payment_method} on {invoice.paid_date as unknown as string}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
                
                {invoice.status !== 'paid' && (
                    <div className="bg-slate-50/50 p-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="max-w-md">
                            <p className="text-sm font-bold text-slate-900">Immediate Settlement Required</p>
                            <p className="text-xs font-medium text-slate-500 mt-1">Please select your preferred secure payment method to finalize this transaction.</p>
                        </div>
                        <div className="flex items-center space-x-4 w-full md:w-auto">
                            <select
                                className="h-11 rounded-xl border-slate-200 bg-white focus:bg-white transition-all px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600"
                                value={selectedPaymentMethod}
                                onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                            >
                                <option value="">Select Method</option>
                                <option value="UPI">UPI Security Net</option>
                                <option value="Netbanking">Corporate Netbanking</option>
                                <option value="Card">Premium Credit/Debit</option>
                            </select>
                            <button
                                onClick={handleMarkAsPaid}
                                className="h-11 bg-slate-900 text-white px-8 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200 active:scale-95 whitespace-nowrap"
                            >
                                Authorize Payment
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InvoiceDetails;

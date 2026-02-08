import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Invoice } from '../types/invoice';
import InvoiceService from '../services/invoiceService';
import CustomerService, { Customer } from '../services/customerService';
import { useLabels } from '../hooks/useLabels';

const Invoices: React.FC = () => {
    const labels = useLabels();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<{[key: number]: string}>({}); // State to hold selected payment method for each invoice

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [fetchedInvoices, fetchedCustomers] = await Promise.all([
                    InvoiceService.getAll(),
                    CustomerService.getAll()
                ]);
                setInvoices(fetchedInvoices);
                setCustomers(fetchedCustomers);
            } catch (error) {
                console.error("Failed to fetch data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleMarkAsPaid = async (invoiceId: number) => {
        const paymentMethod = selectedPaymentMethod[invoiceId];
        if (!paymentMethod) {
            alert('Please select a payment method.');
            return;
        }

        try {
            await InvoiceService.pay(invoiceId, paymentMethod);
            alert(`Invoice ${invoiceId} marked as paid via ${paymentMethod}.`);
            // Refresh invoices to show updated status
            const updatedInvoices = invoices.map(inv => 
                inv.id === invoiceId 
                ? { ...inv, status: 'paid', payment_method: paymentMethod, paid_date: new Date().toISOString().split('T')[0] } 
                : inv
            ) as Invoice[]; // Type assertion to avoid partial updates issue if interface is strict
            setInvoices(updatedInvoices);
            setSelectedPaymentMethod(prev => { // Clear selected payment method for this invoice
                const newMethods = { ...prev };
                delete newMethods[invoiceId];
                return newMethods;
            });
            window.dispatchEvent(new CustomEvent('dashboardRefresh')); // Dispatch event to refresh dashboard
        } catch (error) {
            console.error(`Failed to mark invoice ${invoiceId} as paid`, error);
            alert(`Failed to mark invoice ${invoiceId} as paid.`);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">{labels?.invoices}</h2>
                    <p className="text-slate-500 text-sm mt-1 font-medium">Manage and track your financial transactions.</p>
                </div>
            </div>

            <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-4 flex items-start space-x-3 text-amber-800">
                <svg className="w-5 h-5 mt-0.5 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <div className="text-sm">
                    <p className="font-bold">Record Immutable</p>
                    <p className="opacity-80">These invoices are legal records with frozen pricing for auditing purposes.</p>
                </div>
            </div>

            <div className="premium-card executive-shadow min-h-[400px]">
                {loading ? (
                    <div className="p-20 flex flex-col items-center justify-center space-y-4">
                        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-slate-400 font-medium text-sm">Collating financial records...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/50">
                                    <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest">{labels?.invoice} ID</th>
                                    <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest">{labels?.customer}</th>
                                    <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest">Amount</th>
                                    <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest">Due Date</th>
                                    <th className="px-6 py-4 text-right text-[11px] font-bold text-slate-500 uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {invoices.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-20 text-center text-slate-400 font-medium">No invoices found.</td>
                                    </tr>
                                ) : (
                                    invoices.map((invoice) => (
                                        <tr key={invoice.id} className="hover:bg-slate-50/80 transition-colors group">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Link to={`/invoices/${invoice.id}`} className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors">#{invoice.id}</Link>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-600">
                                                {invoice.customer ? invoice.customer.name : (customers.find(c => c.id === invoice.customer_id)?.name || 'Unknown')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-slate-900">
                                                ${invoice.grand_total !== undefined ? invoice.grand_total.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0.00'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`status-pill ${
                                                    invoice.status === 'paid' ? 'status-pill-success' : 
                                                    invoice.status === 'overdue' ? 'status-pill-danger' : 
                                                    'status-pill-neutral'
                                                }`}>
                                                    {invoice.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-500">{invoice.due_date}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                {invoice.status !== 'paid' ? (
                                                    <div className="flex items-center justify-end space-x-2">
                                                        <select
                                                            className="text-[12px] h-8 rounded-lg border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-medium py-0 px-2"
                                                            value={selectedPaymentMethod[invoice.id] || ''}
                                                            onChange={(e) => setSelectedPaymentMethod(prev => ({ ...prev, [invoice.id]: e.target.value }))}
                                                        >
                                                            <option value="">Select Method</option>
                                                            <option value="UPI">UPI</option>
                                                            <option value="Netbanking">Netbanking</option>
                                                            <option value="Card">Card</option>
                                                        </select>
                                                        <button
                                                            onClick={() => handleMarkAsPaid(invoice.id)}
                                                            className="bg-slate-900 text-white px-3 py-1.5 h-8 rounded-lg text-[12px] font-bold hover:bg-indigo-600 transition-all shadow-sm active:scale-95 disabled:bg-slate-200"
                                                            disabled={!selectedPaymentMethod[invoice.id]}
                                                        >
                                                            Pay Invoice
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-end opacity-60">
                                                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight italic">Paid via {invoice.payment_method}</span>
                                                        <span className="text-[10px] text-slate-400">{invoice.paid_date}</span>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Invoices;

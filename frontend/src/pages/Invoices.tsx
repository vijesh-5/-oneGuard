import React, { useState, useEffect } from 'react';
import { Invoice } from '../types/invoice';
import InvoiceService from '../services/invoiceService';

const Invoices: React.FC = () => {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchInvoices = async () => {
        setLoading(true);
        try {
            const data = await InvoiceService.getAll();
            setInvoices(data);
        } catch (error) {
            console.error("Failed to fetch invoices", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoices();
    }, []);

    const handleMarkPaid = async (id: number) => {
        try {
            await InvoiceService.updateStatus(id, 'paid');
            fetchInvoices();
        } catch (error) {
            console.error("Failed to update invoice status", error);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h2 className="text-3xl font-extrabold text-gray-900">Billing & Invoices</h2>
                <p className="mt-1 text-sm text-gray-500">Track payments and manage immutable financial records.</p>
            </div>

            <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
                {loading ? (
                    <div className="p-20 text-center">
                        <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                        <p className="mt-4 text-gray-500 font-medium">Syncing financial ledger...</p>
                    </div>
                ) : invoices.length === 0 ? (
                    <div className="p-20 text-center text-gray-500">
                        No invoices generated yet. Confirm a subscription to create an invoice.
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Invoice #</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Subscription</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Total Amount</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Due Date</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-50">
                            {invoices.map((invoice) => (
                                <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-5 whitespace-nowrap">
                                        <div className="text-sm font-bold text-gray-900">{invoice.invoice_number}</div>
                                        <div className="text-xs text-gray-500 font-medium">Issued: {invoice.issue_date}</div>
                                    </td>
                                    <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-600">
                                        #{invoice.subscription_id}
                                    </td>
                                    <td className="px-6 py-5 whitespace-nowrap">
                                        <div className="text-sm font-bold text-gray-900">${invoice.grand_total.toFixed(2)}</div>
                                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Tax: ${invoice.tax_total.toFixed(2)}</div>
                                    </td>
                                    <td className="px-6 py-5 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-tighter ${
                                            invoice.status === 'paid' ? 'bg-green-100 text-green-700' : 
                                            invoice.status === 'confirmed' ? 'bg-blue-100 text-blue-700' : 
                                            invoice.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                                        }`}>
                                            {invoice.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-600">
                                        {invoice.due_date}
                                    </td>
                                    <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                                        {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                                            <button 
                                                onClick={() => handleMarkPaid(invoice.id)}
                                                className="inline-flex items-center px-4 py-2 border border-transparent text-xs font-bold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all"
                                            >
                                                Register Payment
                                            </button>
                                        )}
                                        <button className="ml-3 text-gray-400 hover:text-gray-600 font-bold text-xs uppercase">PDF</button>
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

export default Invoices;
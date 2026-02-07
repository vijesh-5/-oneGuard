import React, { useState, useEffect } from 'react';
import { Invoice } from '../types/invoice';
import InvoiceService from '../services/invoiceService';

const Invoices: React.FC = () => {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<{[key: number]: string}>({}); // State to hold selected payment method for each invoice

    useEffect(() => {
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

        fetchInvoices();
    }, []);

    const handleMarkAsPaid = async (invoiceId: number) => {
        const paymentMethod = selectedPaymentMethod[invoiceId];
        if (!paymentMethod) {
            alert('Please select a payment method.');
            return;
        }

        try {
            // Assuming InvoiceService has an update method
            // This might need to be created/implemented in invoiceService.ts
            await InvoiceService.update(invoiceId, { status: 'paid', payment_method: paymentMethod, paid_date: new Date().toISOString().split('T')[0] });
            alert(`Invoice ${invoiceId} marked as paid via ${paymentMethod}.`);
            // Refresh invoices to show updated status
            const updatedInvoices = invoices.map(inv => 
                inv.id === invoiceId 
                ? { ...inv, status: 'paid', payment_method: paymentMethod, paid_date: new Date().toISOString().split('T')[0] } 
                : inv
            );
            setInvoices(updatedInvoices);
            setSelectedPaymentMethod(prev => { // Clear selected payment method for this invoice
                const newMethods = { ...prev };
                delete newMethods[invoiceId];
                return newMethods;
            });
        } catch (error) {
            console.error(`Failed to mark invoice ${invoiceId} as paid`, error);
            alert(`Failed to mark invoice ${invoiceId} as paid.`);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Invoices</h2>
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6" role="alert">
                <p className="font-bold">Important Information</p>
                <p>Invoice is a legal record. Prices are frozen.</p>
            </div>
            <div className="bg-white shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                {loading ? (
                    <div className="p-6 text-center text-gray-500">Loading invoices...</div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sub ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {invoices.map((invoice) => (
                                <tr key={invoice.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{invoice.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{invoice.subscription_id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${invoice.amount.toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            invoice.status === 'paid' ? 'bg-green-100 text-green-800' : 
                                            invoice.status === 'overdue' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                                        }`}>
                                            {invoice.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{invoice.due_date}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {invoice.status !== 'paid' ? (
                                            <div className="flex items-center space-x-2">
                                                <select
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
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
                                                    className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600"
                                                >
                                                    Mark as Paid
                                                </button>
                                            </div>
                                        ) : (
                                            <span>Paid ({invoice.payment_method} on {invoice.paid_date})</span>
                                        )}
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

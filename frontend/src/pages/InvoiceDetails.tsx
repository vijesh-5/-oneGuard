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
        <div className="container mx-auto px-4 py-8">
            <button
                onClick={() => navigate('/invoices')}
                className="mb-4 text-indigo-600 hover:text-indigo-800"
            >
                &larr; Back to Invoices
            </button>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                    <div>
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                            Invoice #{invoice.id}
                        </h3>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">
                            Subscription: #{invoice.subscription_id}
                        </p>
                    </div>
                    <div>
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                            invoice.status === 'overdue' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                            {invoice.status.toUpperCase()}
                        </span>
                    </div>
                </div>
                <div className="border-t border-gray-200">
                    <dl>
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Status</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{invoice.status}</dd>
                        </div>
                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Issue Date</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{invoice.issue_date as unknown as string}</dd>
                        </div>
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Due Date</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{invoice.due_date as unknown as string}</dd>
                        </div>
                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                             <dt className="text-sm font-medium text-gray-500">Total Amount</dt>
                             <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-bold">${invoice.grand_total.toFixed(2)}</dd>
                        </div>
                         {invoice.status === 'paid' && (
                            <div className="bg-green-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500">Payment Info</dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                    Paid via {invoice.payment_method} on {invoice.paid_date as unknown as string}
                                </dd>
                            </div>
                        )}
                    </dl>
                </div>
                
                 {/* Action Section */}
                 {invoice.status !== 'paid' && (
                    <div className="bg-gray-50 px-4 py-4 sm:px-6 flex items-center justify-end space-x-4">
                        <select
                            className="block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                            value={selectedPaymentMethod}
                            onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                        >
                            <option value="">Select Payment Method</option>
                            <option value="UPI">UPI</option>
                            <option value="Netbanking">Netbanking</option>
                            <option value="Card">Card</option>
                        </select>
                        <button
                            onClick={handleMarkAsPaid}
                            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                        >
                            Pay Inline
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InvoiceDetails;

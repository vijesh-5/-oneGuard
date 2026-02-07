import React, { useState, useEffect } from 'react';
import SubscriptionService from '../services/subscriptionService';
import InvoiceService from '../services/invoiceService';
import { Subscription } from '../types/subscription';
import { Invoice } from '../types/invoice';

const Dashboard: React.FC = () => {
    const [activeSubscriptions, setActiveSubscriptions] = useState(0);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [unpaidInvoices, setUnpaidInvoices] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch subscriptions
                const subs: Subscription[] = await SubscriptionService.getAll();
                setActiveSubscriptions(subs.filter(sub => sub.status === 'active').length);

                // Fetch invoices
                const invoices: Invoice[] = await InvoiceService.getAll();
                const unpaid = invoices.filter(inv => inv.status !== 'paid');
                setUnpaidInvoices(unpaid.length);
                
                // Calculate total revenue from paid invoices (simplistic for now)
                const paidInvoices = invoices.filter(inv => inv.status === 'paid');
                const revenue = paidInvoices.reduce((sum, inv) => sum + inv.amount, 0);
                setTotalRevenue(revenue);

            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="container mx-auto px-4 py-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h2>
            {loading ? (
                <div className="p-6 text-center text-gray-500">Loading dashboard data...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center justify-center">
                        <h3 className="text-lg font-semibold text-gray-700">Active Subscriptions</h3>
                        <p className="text-4xl font-bold text-indigo-600 mt-2">{activeSubscriptions}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center justify-center">
                        <h3 className="text-lg font-semibold text-gray-700">Total Revenue</h3>
                        <p className="text-4xl font-bold text-green-600 mt-2">${totalRevenue.toFixed(2)}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center justify-center">
                        <h3 className="text-lg font-semibold text-gray-700">Unpaid Invoices</h3>
                        <p className="text-4xl font-bold text-red-600 mt-2">{unpaidInvoices}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;

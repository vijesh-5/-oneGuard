import { useAuth } from '../context/AuthContext';

export const useLabels = () => {
    const { user } = useAuth();
    const mode = user?.mode || 'business';

    const labels = {
        business: {
            customer: 'Customer',
            customers: 'Customers',
            invoice: 'Invoice',
            invoices: 'Invoices',
            subscription: 'Subscription',
            subscriptions: 'Subscribers',
            revenue: 'Revenue',
            income: 'Income',
            mrr: 'MRR',
        },
        personal: {
            customer: 'Vendor',
            customers: 'Vendors',
            invoice: 'Bill',
            invoices: 'Bills',
            subscription: 'Subscription',
            subscriptions: 'Subscriptions',
            revenue: 'Spending',
            income: 'Expense',
            mrr: 'Monthly Spending',
        },
        client: {
            customer: 'Profile',
            customers: 'Profiles',
            invoice: 'Invoice',
            invoices: 'Invoices',
            subscription: 'Subscription',
            subscriptions: 'Subscriptions',
            revenue: 'Total Due',
            income: 'Payments',
            mrr: 'Monthly Cost',
        }
    };

    return labels[mode];
};

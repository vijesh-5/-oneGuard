import { useAuth } from '../context/AuthContext';

export const useLabels = () => {
    const { user } = useAuth();
    const mode = user?.mode || 'business';

    const labels: Record<string, any> = {
        business: {
            customer: 'Customer',
            customers: 'Customers',
            invoice: 'Invoice',
            invoices: 'Invoices',
            subscription: 'Subscription',
            subscriptions: 'Subscriptions',
            sales: 'Sales',
            income: 'Income',
            thisMonth: 'This Month',
        },
        personal: {
            customer: 'Payee',
            customers: 'Payees',
            invoice: 'Bill',
            invoices: 'Bills',
            subscription: 'Recurring Expense',
            subscriptions: 'Recurring Expenses',
            sales: 'Expenses',
            income: 'Income',
            thisMonth: 'This Month',
        },
        portal: {
            customer: 'Service Provider',
            customers: 'Service Providers',
            invoice: 'Invoice',
            invoices: 'Invoices',
            subscription: 'Subscription',
            subscriptions: 'Subscriptions',
            sales: 'Payments',
            income: 'Balance',
            thisMonth: 'Active',
        }
    };

    return labels[mode] || labels.business;
};

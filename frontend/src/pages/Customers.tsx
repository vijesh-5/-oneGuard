import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useLabels } from '../hooks/useLabels';
import { Plus, Search, Mail, Phone, Building, MapPin } from 'lucide-react';

interface Customer {
    id: number;
    name: string;
    email: string;
    phone: string;
    company_name: string;
    address: string;
}

const Customers: React.FC = () => {
    const { token } = useAuth();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const [newCustomer, setNewCustomer] = useState({
        name: '',
        email: '',
        phone: '',
        company_name: '',
        address: ''
    });

    useEffect(() => {
        if (token) {
            fetchCustomers();
        }
    }, [token]);

    const labels = useLabels();

    const fetchCustomers = async () => {
        try {
            const response = await axios.get('http://localhost:8000/customers/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCustomers(response.data);
        } catch (error) {
            console.error('Error fetching customers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setNewCustomer(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:8000/customers/', newCustomer, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIsFormVisible(false);
            setNewCustomer({ name: '', email: '', phone: '', company_name: '', address: '' });
            fetchCustomers();
        } catch (error) {
            console.error('Error creating customer:', error);
            alert(`Failed to create ${labels.customer.toLowerCase()}. Email might already exist.`);
        }
    };

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.company_name && c.company_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-8 relative">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-4xl font-bold text-white tracking-tight">{labels.customers}</h2>
                    <p className="mt-2 text-slate-400">Manage your {labels.customer.toLowerCase()} relationships and profiles.</p>
                </div>
                <button
                    onClick={() => setIsFormVisible(true)}
                    className="btn-neon inline-flex items-center gap-2 px-6 py-2.5 rounded-lg shadow-lg"
                >
                    <Plus size={18} />
                    Add {labels.customer}
                </button>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-slate-500" />
                </div>
                <input
                    type="text"
                    placeholder={`Search ${labels.customers.toLowerCase()}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-glass w-full pl-10 rounded-lg p-3"
                />
            </div>

            <div className="glass-panel overflow-hidden rounded-2xl">
                {loading ? (
                    <div className="p-20 text-center">
                        <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-cyan-500"></div>
                        <p className="mt-4 text-slate-400 font-medium">Loading {labels.customers.toLowerCase()}...</p>
                    </div>
                ) : customers.length === 0 ? (
                    <div className="p-20 text-center text-slate-500">
                        <div className="mb-4 inline-block p-4 rounded-full bg-slate-800/50 text-slate-600">
                            <Building size={32} />
                        </div>
                        <p className="text-lg font-medium text-slate-400">No {labels.customers.toLowerCase()} found</p>
                        <p className="text-sm mt-1">Add your first {labels.customer.toLowerCase()} to get started.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                        {filteredCustomers.map((customer) => (
                            <div key={customer.id} className="glass-card p-6 rounded-xl flex flex-col h-full relative group">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-cyan-500/20">
                                            {customer.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-white leading-tight group-hover:text-cyan-400 transition-colors">{customer.name}</h3>
                                            {customer.company_name && (
                                                <p className="text-sm text-slate-400">{customer.company_name}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 flex-1">
                                    <div className="flex items-center gap-3 text-sm text-slate-300">
                                        <Mail size={16} className="text-slate-500" />
                                        <span className="truncate">{customer.email}</span>
                                    </div>
                                    {customer.phone && (
                                        <div className="flex items-center gap-3 text-sm text-slate-300">
                                            <Phone size={16} className="text-slate-500" />
                                            <span>{customer.phone}</span>
                                        </div>
                                    )}
                                    {customer.address && (
                                        <div className="flex items-start gap-3 text-sm text-slate-300">
                                            <MapPin size={16} className="text-slate-500 mt-0.5" />
                                            <span className="line-clamp-2">{customer.address}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
                                    <button className="text-xs font-bold text-cyan-500 uppercase tracking-wider hover:text-cyan-300 transition-colors">
                                        View Profile
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Customer Modal */}
            {isFormVisible && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity" aria-hidden="true" onClick={() => setIsFormVisible(false)}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom glass-neon rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <form onSubmit={handleSubmit}>
                                <div className="px-6 py-6">
                                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                        <span className="w-1.5 h-6 bg-cyan-500 rounded-full"></span>
                                        Add New {labels.customer}
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
                                            <input
                                                type="text"
                                                name="name"
                                                required
                                                value={newCustomer.name}
                                                onChange={handleInputChange}
                                                className="input-glass w-full rounded-lg p-3"
                                                placeholder="John Doe"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
                                            <input
                                                type="email"
                                                name="email"
                                                required
                                                value={newCustomer.email}
                                                onChange={handleInputChange}
                                                className="input-glass w-full rounded-lg p-3"
                                                placeholder="john@example.com"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-300 mb-1.5">Phone (Optional)</label>
                                                <input
                                                    type="text"
                                                    name="phone"
                                                    value={newCustomer.phone}
                                                    onChange={handleInputChange}
                                                    className="input-glass w-full rounded-lg p-3"
                                                    placeholder="+1 (555) 000-0000"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-300 mb-1.5">Company (Optional)</label>
                                                <input
                                                    type="text"
                                                    name="company_name"
                                                    value={newCustomer.company_name}
                                                    onChange={handleInputChange}
                                                    className="input-glass w-full rounded-lg p-3"
                                                    placeholder="Acme Corp"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Address (Optional)</label>
                                            <textarea
                                                name="address"
                                                value={newCustomer.address}
                                                onChange={handleInputChange}
                                                rows={3}
                                                className="input-glass w-full rounded-lg p-3"
                                                placeholder="123 Main St, City, Country"
                                            ></textarea>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-slate-900/50 px-6 py-4 flex flex-row-reverse gap-3 border-t border-slate-800">
                                    <button
                                        type="submit"
                                        className="btn-neon inline-flex justify-center rounded-lg shadow-sm px-6 py-2.5 text-sm font-bold"
                                    >
                                        Create {labels.customer}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsFormVisible(false)}
                                        className="inline-flex justify-center rounded-lg border border-slate-700 shadow-sm px-4 py-2.5 bg-slate-800 text-sm font-medium text-slate-300 hover:bg-slate-700 transition-all"
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

export default Customers;

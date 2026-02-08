import React, { useState, useEffect } from 'react';
import CustomerService, { Customer, CustomerCreate } from '../services/customerService';
import { useLabels } from '../hooks/useLabels';

const Customers: React.FC = () => {
    const labels = useLabels();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [newCustomer, setNewCustomer] = useState<CustomerCreate>({ name: '', email: '' });
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [loading, setLoading] = useState(true);
    const [inviteResult, setInviteResult] = useState<{username: string, password: string, portal_url: string} | null>(null);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

    const handleInvite = async (customer: Customer) => {
        if (!window.confirm(`Are you sure you want to invite ${customer.name} to the Client Portal? This will generate new credentials.`)) return;
        try {
            const result = await CustomerService.invite(customer.id);
            setInviteResult(result);
            setIsInviteModalOpen(true);
            fetchCustomers(); // Refresh to show "Active" status
        } catch (error: any) {
            console.error("Failed to invite customer", error);
            alert(error.response?.data?.detail || "Failed to invite customer.");
        }
    };

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const data = await CustomerService.getAll();
            setCustomers(data);
        } catch (error) {
            console.error("Failed to fetch customers", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewCustomer(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await CustomerService.create(newCustomer);
            resetForm();
            fetchCustomers();
        } catch (error) {
            console.error("Failed to save customer", error);
            alert("Failed to save.");
        }
    };

    const resetForm = () => {
        setNewCustomer({ name: '', email: '' });
        setIsFormVisible(false);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">{labels?.customers}</h2>
                    <p className="text-slate-500 text-sm mt-1 font-medium">Manage your client base and portal access.</p>
                </div>
                <button 
                    onClick={() => {
                        if (isFormVisible) resetForm();
                        else setIsFormVisible(true);
                    }}
                    className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm ${isFormVisible ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-200'}`}
                >
                    {isFormVisible ? 'Dismiss' : `Add ${labels?.customer}`}
                </button>
            </div>

            {isFormVisible && (
                <div className="premium-card executive-shadow p-8">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">New Client Profile</h3>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Legal Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={newCustomer.name}
                                    onChange={handleInputChange}
                                    className="w-full h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all px-4 text-sm font-medium"
                                    placeholder={`${labels?.customer} Name`}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Communication Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    value={newCustomer.email}
                                    onChange={handleInputChange}
                                    className="w-full h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all px-4 text-sm font-medium"
                                    placeholder="email@example.com"
                                />
                            </div>
                        </div>
                        
                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                className="bg-slate-900 text-white px-8 py-3 rounded-xl text-sm font-bold hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200 active:scale-95"
                            >
                                Register {labels?.customer}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="premium-card executive-shadow min-h-[400px]">
                {loading ? (
                    <div className="p-20 flex flex-col items-center justify-center space-y-4">
                        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-slate-400 font-medium text-sm">Retrieving client database...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/50">
                                    <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest">ID</th>
                                    <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest">Name</th>
                                    <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest">Email</th>
                                    <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest">Portal Access</th>
                                    <th className="px-6 py-4 text-right text-[11px] font-bold text-slate-500 uppercase tracking-widest">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {customers.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-20 text-center text-slate-400 font-medium">No clients found. Start by adding your first {labels?.customer}.</td>
                                    </tr>
                                ) : (
                                    customers.map((customer) => (
                                        <tr key={customer.id} className="hover:bg-slate-50/80 transition-colors group">
                                            <td className="px-6 py-4 whitespace-nowrap text-[12px] font-bold text-slate-400 uppercase tracking-tighter">#{customer.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-bold text-slate-900">{customer.name}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-600">
                                                {customer.email}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`status-pill ${
                                                    customer.portal_user_id ? 'status-pill-success' : 'status-pill-neutral opacity-50'
                                                }`}>
                                                    {customer.portal_user_id ? 'Active' : 'Uninvited'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <div className="flex justify-end space-x-3">
                                                    <button className="text-[11px] font-bold text-slate-400 uppercase tracking-wider hover:text-indigo-600 transition-colors">Edit</button>
                                                    {!customer.portal_user_id && (
                                                        <button 
                                                            onClick={() => handleInvite(customer)}
                                                            className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider hover:text-emerald-700 transition-colors border border-emerald-100 bg-emerald-50 px-2 py-1 rounded-lg"
                                                        >
                                                            Invite
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Invite Modal */}
            {isInviteModalOpen && inviteResult && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm overflow-y-auto h-full w-full flex items-center justify-center z-[100] animate-in fade-in duration-300">
                    <div className="relative p-8 border border-slate-200 w-full max-w-md shadow-2xl rounded-2xl bg-white animate-in zoom-in-95 duration-300">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 mb-4">
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Portal Invitation Ready</h3>
                            <p className="text-sm text-slate-500 mb-6">
                                Share these credentials securely with the client.
                            </p>
                            
                            <div className="text-left bg-slate-50 border border-slate-100 p-5 rounded-xl space-y-4 mb-8">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Access URL</label>
                                    <a href={inviteResult.portal_url} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-indigo-600 hover:underline block truncate">{inviteResult.portal_url}</a>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Username</label>
                                        <p className="text-sm font-bold text-slate-900">{inviteResult.username}</p>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Temp Password</label>
                                        <p className="text-sm font-mono font-black text-emerald-600 bg-white border border-emerald-100 px-2 py-0.5 rounded inline-block">{inviteResult.password}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <button
                                className="w-full py-3 bg-slate-900 text-white text-sm font-bold rounded-xl shadow-lg hover:bg-slate-800 transition-all active:scale-95"
                                onClick={() => setIsInviteModalOpen(false)}
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Customers;

import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    CreditCard,
    LogOut,
    Menu,
    Bell,
    FileText,
    Shield
} from 'lucide-react';

const PortalLayout: React.FC = () => {
    const { logout, user } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="flex h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500/30 selection:text-cyan-200 overflow-hidden">
            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-40 w-72 bg-slate-900/80 backdrop-blur-xl border-r border-slate-800 transition-transform duration-300 ease-in-out lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex flex-col h-full">
                    {/* Brand */}
                    <div className="h-20 flex items-center px-8 border-b border-slate-800">
                        <div className="flex items-center gap-3">
                            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20">
                                <Shield className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                                    Client Portal
                                </h1>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-4 mb-2">Menu</div>

                        <Link to="/portal/dashboard" className={`nav-item ${isActive('/portal/dashboard') ? 'active' : ''}`}>
                            <LayoutDashboard className="w-5 h-5" />
                            <span>Dashboard</span>
                        </Link>

                        <Link to="/portal/invoices" className={`nav-item ${isActive('/portal/invoices') ? 'active' : ''}`}>
                            <FileText className="w-5 h-5" />
                            <span>My Invoices</span>
                        </Link>

                        <Link to="/portal/subscriptions" className={`nav-item ${isActive('/portal/subscriptions') ? 'active' : ''}`}>
                            <CreditCard className="w-5 h-5" />
                            <span>Subscriptions</span>
                        </Link>
                    </nav>

                    {/* User Profile */}
                    <div className="p-4 border-t border-slate-800 bg-slate-900/50">
                        <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer group">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20">
                                {user?.email?.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-white truncate group-hover:text-cyan-400 transition-colors">{user?.email}</p>
                                <p className="text-xs text-slate-500 truncate">Client Account</p>
                            </div>
                            <button onClick={logout} className="p-2 text-slate-400 hover:text-red-400 transition-colors">
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 lg:pl-72 transition-all duration-300">
                {/* Header */}
                <header className="h-20 bg-slate-900/50 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-8 sticky top-0 z-20">
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="lg:hidden p-2 -ml-2 text-slate-400 hover:text-white"
                    >
                        <Menu className="w-6 h-6" />
                    </button>

                    <div className="flex items-center gap-4 ml-auto">
                        <button className="relative p-2 text-slate-400 hover:text-cyan-400 transition-colors rounded-lg hover:bg-slate-800/50">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                        </button>
                    </div>
                </header>

                <main className="flex-1 overflow-auto p-8 relative">
                    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default PortalLayout;

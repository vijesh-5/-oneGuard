import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const Signup: React.FC = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        try {
            await authService.signup(username, email, password);
            alert('Registration successful! Please log in.');
            navigate('/login');
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Registration failed.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50/50 p-6 animate-in fade-in duration-700">
            <div className="w-full max-w-lg space-y-8">
                <div className="text-center space-y-3">
                    <div className="flex justify-center">
                        <span className="text-3xl font-black tracking-tight text-slate-900">
                            <span className="text-indigo-600">-</span>oneGuard
                        </span>
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Organization Enrollment</h2>
                    <p className="text-slate-500 text-sm font-medium">Initialize your executive subscription intelligence platform.</p>
                </div>

                <div className="premium-card executive-shadow p-8 bg-white">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1" htmlFor="username">Personnel Name</label>
                                <input
                                    type="text"
                                    placeholder="Username"
                                    className="w-full h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all px-4 text-sm font-medium focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 outline-none"
                                    id="username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1" htmlFor="email">Corporate Email</label>
                                <input
                                    type="email"
                                    placeholder="email@company.com"
                                    className="w-full h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all px-4 text-sm font-medium focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 outline-none"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1" htmlFor="password">Security Key</label>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all px-4 text-sm font-medium focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 outline-none"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1" htmlFor="confirmPassword">Verify Key</label>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all px-4 text-sm font-medium focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 outline-none"
                                    id="confirmPassword"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-rose-50 border border-rose-100 text-rose-600 text-[12px] font-bold py-3 px-4 rounded-xl flex items-center animate-in fade-in zoom-in-95">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full h-12 flex justify-center items-center rounded-xl text-sm font-bold text-white transition-all shadow-lg bg-slate-900 hover:bg-indigo-600 shadow-slate-200 hover:shadow-indigo-200 active:scale-95"
                        >
                            Complete Enrollment
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                        <p className="text-sm text-slate-500 font-medium">
                            Already registered? {' '}
                            <a href="/login" className="text-indigo-600 hover:text-indigo-700 font-bold transition-colors underline decoration-2 underline-offset-4">
                                Personnel Authentication
                            </a>
                        </p>
                    </div>
                </div>

                <div className="text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Restricted System &copy; 2026 OneGuard Global</p>
                </div>
            </div>
        </div>
    );
};

export default Signup;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginRequest } from '../types/auth';
import AuthService from '../services/authService';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginRequest>({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
       const token = await AuthService.login(formData);
       localStorage.setItem('token', token.access_token);
       navigate('/');
    } catch (err) {
       console.error(err);
       setError('Please enter valid credentials');
    } finally {
       setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50/50 p-6 animate-in fade-in duration-700">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <span className="text-3xl font-black tracking-tight text-slate-900">
              <span className="text-indigo-600">-</span>oneGuard
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Intelligence Access</h2>
          <p className="text-slate-500 text-sm font-medium">Continue to your premium executive dashboard.</p>
        </div>

        <div className="premium-card executive-shadow p-8 bg-white">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Personnel Identifier</label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  autoComplete="username"
                  className="w-full h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all px-4 text-sm font-medium focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 outline-none"
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Security Credentials</label>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  className="w-full h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all px-4 text-sm font-medium focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 outline-none"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
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
              disabled={loading}
              className={`w-full h-12 flex justify-center items-center rounded-xl text-sm font-bold text-white transition-all shadow-lg active:scale-95 ${loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-slate-900 hover:bg-indigo-600 shadow-slate-200 hover:shadow-indigo-200'}`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                'Authenticate'
              )}
            </button>
          </form>
          
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500 font-medium">
              Access restricted. {' '}
              <a href="/signup" className="text-indigo-600 hover:text-indigo-700 font-bold transition-colors underline decoration-2 underline-offset-4">
                Initialize Account
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

export default Login;

import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Customers from './pages/Customers';
import Products from './pages/Products';
import Plans from './pages/Plans';
import Subscriptions from './pages/Subscriptions';
import Invoices from './pages/Invoices';
import InvoiceDetails from './pages/InvoiceDetails';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useLabels } from './hooks/useLabels';


import PortalDashboard from './pages/PortalDashboard'; // Import PortalDashboard

function AppContent() {
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useAuth();
  const labels = useLabels();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (isAuthenticated && user?.mode === 'portal') {
      return <PortalDashboard />;
  }

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200/60 executive-shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <div className="flex items-center space-x-5">
            <Link to="/" className="flex items-center space-x-2 group">
              <span className="text-xl font-black tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                <span className="text-indigo-600">-</span>oneGuard
              </span>
            </Link>
            {user?.mode && (
              <span className={`status-pill ${
                user.mode === 'business' ? 'status-pill-info' : 
                user.mode === 'personal' ? 'status-pill-warning' : 
                'status-pill-success'
              }`}>
                {user.mode}
              </span>
            )}
          </div>
          
          <nav className="hidden md:flex items-center space-x-1">
            {isAuthenticated && (
              <>
                <Link to="/dashboard" className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/50 rounded-lg transition-all">Dashboard</Link>
                <Link to="/" className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/50 rounded-lg transition-all">{labels?.subscriptions || 'Subscriptions'}</Link>
                <Link to="/customers" className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/50 rounded-lg transition-all">{labels?.customers || 'Customers'}</Link>
                <Link to="/invoices" className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/50 rounded-lg transition-all">{labels?.invoices || 'Invoices'}</Link>
                
                <div className="h-4 w-px bg-slate-200 mx-3"></div>
                
                <div className="relative group">
                    <button className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/50 rounded-lg transition-all flex items-center">
                      Advanced
                      <svg className="ml-1.5 h-3.5 w-3.5 opacity-50 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    <div className="absolute right-0 pt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 z-50">
                        <div className="bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 executive-shadow">
                            <Link to="/products" className="block px-4 py-2 text-sm text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/50 transition-colors font-medium">Products</Link>
                            <Link to="/plans" className="block px-4 py-2 text-sm text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/50 transition-colors font-medium">Plans</Link>
                        </div>
                    </div>
                </div>

                <div className="h-4 w-px bg-slate-200 mx-3"></div>

                <button 
                  onClick={handleLogout} 
                  className="px-3 py-2 text-sm font-bold text-slate-400 hover:text-rose-600 hover:bg-rose-50/50 rounded-lg transition-all uppercase tracking-wider text-[11px]"
                >
                  Logout
                </button>
              </>
            )}
            {!isAuthenticated && (
              <Link to="/login" className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-all shadow-sm hover:shadow-indigo-200">
                Log in
              </Link>
            )}
          </nav>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
         <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/products" element={<Products />} />
              <Route path="/plans" element={<Plans />} />
              <Route path="/invoices" element={<Invoices />} />
              <Route path="/invoices/:id" element={<InvoiceDetails />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/" element={<Subscriptions />} />
            </Route>
         </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

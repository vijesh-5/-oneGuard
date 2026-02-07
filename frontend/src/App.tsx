import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Login from './pages/Login';
import Products from './pages/Products';
import Plans from './pages/Plans';
import Subscriptions from './pages/Subscriptions';
import Invoices from './pages/Invoices';
import Payments from './pages/Payments';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <div className="flex items-center">
                <span className="text-2xl font-black tracking-tighter text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg">
                  -oneGuard
                </span>
                <nav className="ml-10 flex space-x-8">
                  <Link to="/" className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">Subscriptions</Link>
                  <Link to="/products" className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">Products</Link>
                  <Link to="/plans" className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">Plans</Link>
                  <Link to="/invoices" className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">Invoices</Link>
                  <Link to="/payments" className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">Payments</Link>
                </nav>
              </div>
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-sm font-bold text-white bg-indigo-600 px-5 py-2.5 rounded-full hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all">
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </header>
        <main className="py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
             <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/products" element={<Products />} />
                <Route path="/plans" element={<Plans />} />
                <Route path="/invoices" element={<Invoices />} />
                <Route path="/payments" element={<Payments />} />
                <Route path="/" element={<Subscriptions />} />
             </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;

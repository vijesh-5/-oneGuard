import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Login from './pages/Login';
import Products from './pages/Products';
import Plans from './pages/Plans';
import Subscriptions from './pages/Subscriptions';
import Invoices from './pages/Invoices';
import Dashboard from './pages/Dashboard'; // Import Dashboard

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">
              -oneGuard
            </h1>
            <nav className="space-x-4">
              <Link to="/dashboard" className="text-gray-600 hover:text-gray-900">Dashboard</Link> {/* Add Dashboard link */}
              <Link to="/" className="text-gray-600 hover:text-gray-900">Subscriptions</Link>
              <Link to="/products" className="text-gray-600 hover:text-gray-900">Products</Link>
              <Link to="/plans" className="text-gray-600 hover:text-gray-900">Plans</Link>
              <Link to="/invoices" className="text-gray-600 hover:text-gray-900">Invoices</Link>
              <Link to="/login" className="text-indigo-600 hover:text-indigo-900">Login</Link>
            </nav>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
             <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/products" element={<Products />} />
                <Route path="/plans" element={<Plans />} />
                <Route path="/invoices" element={<Invoices />} />
                <Route path="/dashboard" element={<Dashboard />} /> {/* Add Dashboard route */}
                <Route path="/" element={<Subscriptions />} />
             </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;

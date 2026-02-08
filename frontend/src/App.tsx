import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import PortalLayout from './components/PortalLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import Customers from './pages/Customers';
import Plans from './pages/Plans';
import Subscriptions from './pages/Subscriptions';
import Invoices from './pages/Invoices';
import Payments from './pages/Payments';
import Dashboard from './pages/Dashboard';

import PortalDashboard from './pages/portal/Dashboard';
import PortalInvoices from './pages/portal/Invoices';
import PortalSubscriptions from './pages/portal/Subscriptions';

import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

const RootRedirector = () => {
  const { user, loading } = useAuth();
  if (loading) return null; // Or a spinner
  if (!user) return <Navigate to="/login" />;

  if (user.mode === 'client') {
    return <Navigate to="/portal/dashboard" />;
  } else {
    return <Navigate to="/dashboard" />;
  }
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/" element={<RootRedirector />} />

          {/* Protected Portal Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/portal" element={<PortalLayout />}>
              <Route path="dashboard" element={<PortalDashboard />} />
              <Route path="invoices" element={<PortalInvoices />} />
              <Route path="subscriptions" element={<PortalSubscriptions />} />
              <Route index element={<PortalDashboard />} />
            </Route>
          </Route>

          {/* Protected Admin Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/subscriptions" element={<Subscriptions />} />
              <Route path="/products" element={<Products />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/plans" element={<Plans />} />
              <Route path="/invoices" element={<Invoices />} />
              <Route path="/payments" element={<Payments />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;

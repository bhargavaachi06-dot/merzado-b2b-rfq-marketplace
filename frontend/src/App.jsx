import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import Login from './pages/Login';
import Register from './pages/Register';

// Buyer Pages
import BuyerDashboard from './pages/buyer/BuyerDashboard';
import CreateRFQ from './pages/buyer/CreateRFQ';
import EditRFQ from './pages/buyer/EditRFQ';
import MyRFQs from './pages/buyer/MyRFQs';
import RFQDetails from './pages/buyer/RFQDetails';

// Supplier Pages
import SupplierDashboard from './pages/supplier/SupplierDashboard';
import BrowseRFQs from './pages/supplier/BrowseRFQs';
import SupplierRFQDetails from './pages/supplier/SupplierRFQDetails';
import MyQuotations from './pages/supplier/MyQuotations';

const RootRedirect = () => {
  const { isAuthenticated, isBuyer, isSupplier, loading } = useAuth();

  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (isBuyer) return <Navigate to="/buyer/dashboard" replace />;
  if (isSupplier) return <Navigate to="/supplier/dashboard" replace />;
  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <main className="flex-grow-1">
        <Routes>
          {/* Root Redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* Public Authentication Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Buyer Routes */}
          <Route
            path="/buyer/dashboard"
            element={
              <ProtectedRoute requiredRole="BUYER">
                <BuyerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/buyer/create-rfq"
            element={
              <ProtectedRoute requiredRole="BUYER">
                <CreateRFQ />
              </ProtectedRoute>
            }
          />
          <Route
            path="/buyer/my-rfqs"
            element={
              <ProtectedRoute requiredRole="BUYER">
                <MyRFQs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/buyer/edit-rfq/:id"
            element={
              <ProtectedRoute requiredRole="BUYER">
                <EditRFQ />
              </ProtectedRoute>
            }
          />
          <Route
            path="/buyer/rfqs/:id"
            element={
              <ProtectedRoute requiredRole="BUYER">
                <RFQDetails />
              </ProtectedRoute>
            }
          />

          {/* Protected Supplier Routes */}
          <Route
            path="/supplier/dashboard"
            element={
              <ProtectedRoute requiredRole="SUPPLIER">
                <SupplierDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/supplier/browse"
            element={
              <ProtectedRoute requiredRole="SUPPLIER">
                <BrowseRFQs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/supplier/rfqs/:id"
            element={
              <ProtectedRoute requiredRole="SUPPLIER">
                <SupplierRFQDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/supplier/my-quotations"
            element={
              <ProtectedRoute requiredRole="SUPPLIER">
                <MyQuotations />
              </ProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <footer className="py-3 bg-white border-top text-center text-muted small mt-auto">
        <div className="container">
          <span>&copy; {new Date().getFullYear()} MERZADO RFQ Marketplace. Built with Django REST Framework & React Vite.</span>
        </div>
      </footer>
    </div>
  );
}

export default App;

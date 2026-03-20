import { Route, Routes, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ProductManagement from './pages/ProductManagement';
import Login from './pages/Login';
import { useAuthStore } from './store/useAuthStore';

// Protective Wrapper for Private Routes
const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/auth/login" replace />;
};

export default function App() {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/auth/login" element={<Login />} />

      {/* Private Routes */}
      <Route 
        path="/" 
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/products" 
        element={
          <PrivateRoute>
            <ProductManagement />
          </PrivateRoute>
        } 
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}


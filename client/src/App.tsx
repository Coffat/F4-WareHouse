import { Route, Routes, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import ProductManagement from './pages/ProductManagement'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/products" element={<ProductManagement />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}


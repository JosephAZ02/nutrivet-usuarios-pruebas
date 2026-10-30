// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ProductsPage from './pages/ProductsPage';
import InventoryPage from './pages/InventoryPage';
import NewSalePage from './pages/NewSalePage';

import RouteProtection from './components/organism/RouteProtection';
import 'bootstrap/dist/css/bootstrap.min.css';
import ReportsPage from './pages/ReportsPage';
import AppLayout from './components/templates/AppLayout';

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/login" element={<LoginPage />} />


        <Route element={<RouteProtection />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/new-sale" element={<NewSalePage />} />
          </Route>
        </Route>

        <Route path="/forgot-password" element={<ForgotPasswordPage />} />


        <Route path="/" element={<Navigate to="/dashboard" replace />} />


        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
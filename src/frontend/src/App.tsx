// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';

import RouteProtection from './components/organism/RouteProtection';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/login" element={<LoginPage />} />


        <Route element={<RouteProtection />}>
          <Route path="/dashboard" element={<DashboardPage />} />



        </Route>

        <Route path="/forgot-password" element={<ForgotPasswordPage />} />


        <Route path="/" element={<Navigate to="/dashboard" replace />} />


        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
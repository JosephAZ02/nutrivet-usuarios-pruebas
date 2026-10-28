// src/components/ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function RouteProtection() {
    const { isAuthenticated } = useAuth();

  
    
    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
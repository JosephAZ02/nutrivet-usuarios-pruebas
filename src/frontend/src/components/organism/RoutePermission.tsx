


import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';


export default function RoutePermission({ requiredPermission }: { requiredPermission: string }) {
  const { hasPermission } = useAuth();

  if (!hasPermission(requiredPermission)) {
    
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
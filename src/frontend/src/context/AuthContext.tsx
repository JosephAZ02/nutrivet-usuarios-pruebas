// src/context/AuthContext.tsx
import { createContext, useState, useEffect, useContext, type ReactNode } from 'react';
import { AuthService } from '../services/AuthService';
import type { LoginRequest } from '../interfaces/Auth';

interface AuthContextType {
  token: string | null;
  permissions: string[];
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedPermissions = localStorage.getItem('permissions');
    if (storedToken && storedPermissions) {
      setToken(storedToken);
      setPermissions(JSON.parse(storedPermissions));
    }
    setLoading(false);
  }, []);

  const login = async (credentials: LoginRequest) => {
    const data = await AuthService.login(credentials);
    localStorage.setItem('token', data.token);
    localStorage.setItem('permissions', JSON.stringify(data.permissions));
    setToken(data.token);
    setPermissions(data.permissions);
  };

  const logout = () => {
    AuthService.logout();
    localStorage.removeItem('permissions');
    setToken(null);
    setPermissions([]);
  };

  const hasPermission = (permission: string) => {
    return permissions.includes(permission);
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <AuthContext.Provider value={{ token, permissions, isAuthenticated: !!token, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => useContext(AuthContext);
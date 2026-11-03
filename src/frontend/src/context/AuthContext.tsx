// src/context/AuthContext.tsx
import { createContext, useState, useEffect, useContext, type ReactNode } from 'react';
import { AuthService } from '../services/AuthService';
import type { LoginRequest } from '../interfaces/Auth';

interface AuthContextType {
  token: string | null;
  permissions: string[];
  user: { name: string; username: string } | null;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [user, setUser] = useState<{ name: string; username: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedPermissions = localStorage.getItem('permissions');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedPermissions && storedUser) {
      setToken(storedToken);
      setPermissions(JSON.parse(storedPermissions));
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (credentials: LoginRequest) => {
    const data = await AuthService.login(credentials);
    const userData = { name: data.name, username: data.username };

    localStorage.setItem('token', data.token);
    localStorage.setItem('permissions', JSON.stringify(data.permissions));
    localStorage.setItem('user', JSON.stringify(userData));

    setToken(data.token);
    setPermissions(data.permissions);
    setUser(userData);
  };

  const logout = () => {
    AuthService.logout();
    localStorage.removeItem('permissions');
    localStorage.removeItem('user');
    setToken(null);
    setPermissions([]);
    setUser(null);
  };

  const hasPermission = (permission: string) => permissions.includes(permission);

  if (loading) return <div>Cargando...</div>;

  return (
    <AuthContext.Provider value={{ token, permissions, user, isAuthenticated: !!token, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
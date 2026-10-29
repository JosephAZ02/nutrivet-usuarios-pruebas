// src/context/AuthContext.tsx
import { createContext, useState, useEffect, type ReactNode, useContext } from 'react';
import { AuthService } from '../services/AuthService';
import type { LoginRequest } from '../interfaces/Auth';


interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);



export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Al cargar la app, revisamos si ya hay un token guardado
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
    setLoading(false);
  }, []);

  const login = async (credentials: LoginRequest) => {
    const data = await AuthService.login(credentials);
    localStorage.setItem('token', data.token);
    setToken(data.token);
  };

  const logout = () => {
    AuthService.logout();
    setToken(null);
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <AuthContext.Provider value={{ token, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};


export function useAuth() {
    return useContext(AuthContext);
}
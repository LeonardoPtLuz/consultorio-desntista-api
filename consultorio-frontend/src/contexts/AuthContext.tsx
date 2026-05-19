import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../lib/api';

interface UserInfo {
  name: string;
  role: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserInfo | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const savedUser = localStorage.getItem('user');
    if (token) {
      setIsAuthenticated(true);
      if (savedUser) setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await api.post('/api/auth/login', { email, password });

      const { accessToken, refreshToken, name, role } = res.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      const userInfo = { name, role };

      localStorage.setItem('user', JSON.stringify(userInfo));
      setUser(userInfo);
      setIsAuthenticated(true);
    } catch (err: any) {
      console.error('Erro no login:', err.response?.data || err);
      throw err; // para o componente de login capturar e mostrar mensagem
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  if (loading) return null;

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
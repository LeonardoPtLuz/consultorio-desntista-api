import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import api from '../lib/api';
import { LoginResponse, User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data } = await api.post<LoginResponse>('/auth/login', { email, password });

      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);

      const userData: User = {
        name: data.name,
        role: data.role as 'ADMIN' | 'DENTISTA' | 'RECEPCIONISTA',
        email
      };

      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      // Redireciona para o dashboard após login bem-sucedido
      window.location.href = '/dashboard';

    } catch (error: any) {
      console.error('Login error:', error.response?.data || error);
      throw error; // Deixa o componente LoginPage tratar o erro
    }
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
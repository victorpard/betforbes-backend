import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService, AuthResponse, LoginRequest, RegisterRequest } from '../services/apiService';
import { toast } from 'react-toastify';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isPremium: boolean;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  clearError: () => {},
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!user;

  // Reidrata e valida o token ao montar
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('accessToken');
      if (!storedToken) {
        apiService.clearAuthData();
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Assume apiService.validateToken usa o token armazenado internamente
        const response = await apiService.validateToken();
        if (response.success && response.user) {
          setUser(response.user);
          console.log('✅ AuthContext: Token válido');
        } else {
          setUser(null);
          apiService.clearAuthData();
          console.log('🔴 AuthContext: Token inválido');
        }
      } catch (err) {
        console.error('❌ AuthContext: Erro na validação do token', err);
        setUser(null);
        apiService.clearAuthData();
      } finally {
        setIsLoading(false);
      }
    };
    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('🔐 AuthContext: Iniciando login...');
      const res = await apiService.login({ email, password } as LoginRequest) as AuthResponse;
      console.log('📦 AuthContext: Resposta do login:', res);

      if (!res.success || !res.data.tokens.accessToken) {
        throw new Error(res.message || 'Falha no login');
      }

      // apiService.login já persiste o token e configura headers
      setUser(res.data.user);
      toast.success('🎉 Login realizado com sucesso!');
      console.log('✅ AuthContext: Login bem-sucedido');
    } catch (err: any) {
      console.error('❌ AuthContext: Erro no login:', err);
      setUser(null);
      const msg = err.response?.data?.message || err.message || 'Erro ao fazer login';
      setError(msg);
      apiService.clearAuthData();
      toast.error(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiService.register({ name, email, password } as RegisterRequest) as AuthResponse;
      if (!res.success || !res.data.tokens.accessToken) {
        throw new Error(res.message || 'Falha no registro');
      }

      // apiService.register já persiste o token e configura headers
      setUser(res.data.user);
      toast.success('🎉 Registro realizado com sucesso!');
      console.log('✅ AuthContext: Registro bem-sucedido');
    } catch (err: any) {
      console.error('❌ AuthContext: Erro no registro:', err);
      const msg = err.response?.data?.message || err.message || 'Erro ao registrar';
      setError(msg);
      apiService.clearAuthData();
      toast.error(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      console.log('🔒 AuthContext: Logout iniciado');
      await apiService.logout();
    } catch (err) {
      console.error('❌ AuthContext: Erro no logout', err);
    } finally {
      setUser(null);
      apiService.clearAuthData();
      toast.info('Você saiu da conta.');
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        error,
        login,
        register,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  return context;
};

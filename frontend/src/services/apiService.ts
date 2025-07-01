// API Service para integração com backend BetForbes
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

interface AuthResponse {
  success: boolean;
  user?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    isPremium: boolean;
    isAdmin: boolean;
  };
  token?: string;
  refreshToken?: string;
  message?: string;
}

interface ApiError {
  message: string;
  status: number;
}

class ApiService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('betforbes_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Erro de rede' }));
      throw {
        message: errorData.message || `Erro HTTP ${response.status}`,
        status: response.status,
      } as ApiError;
    }
    return response.json();
  }

  // Login com backend real
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(credentials),
      });

      const data = await this.handleResponse<AuthResponse>(response);
      
      // Salvar token se login bem-sucedido
      if (data.success && data.token) {
        localStorage.setItem('betforbes_token', data.token);
        if (data.refreshToken) {
          localStorage.setItem('betforbes_refresh_token', data.refreshToken);
        }
      }

      return data;
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  }

  // Registro com backend real
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(userData),
      });

      const data = await this.handleResponse<AuthResponse>(response);
      
      // Salvar token se registro bem-sucedido
      if (data.success && data.token) {
        localStorage.setItem('betforbes_token', data.token);
        if (data.refreshToken) {
          localStorage.setItem('betforbes_refresh_token', data.refreshToken);
        }
      }

      return data;
    } catch (error) {
      console.error('Erro no registro:', error);
      throw error;
    }
  }

  // Validar token com backend
  async validateToken(): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/validate`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      return this.handleResponse<AuthResponse>(response);
    } catch (error) {
      console.error('Erro na validação do token:', error);
      // Se token inválido, limpar storage
      this.clearAuthData();
      throw error;
    }
  }

  // Refresh token
  async refreshToken(): Promise<AuthResponse> {
    try {
      const refreshToken = localStorage.getItem('betforbes_refresh_token');
      if (!refreshToken) {
        throw { message: 'Refresh token não encontrado', status: 401 } as ApiError;
      }

      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await this.handleResponse<AuthResponse>(response);
      
      // Atualizar tokens
      if (data.success && data.token) {
        localStorage.setItem('betforbes_token', data.token);
        if (data.refreshToken) {
          localStorage.setItem('betforbes_refresh_token', data.refreshToken);
        }
      }

      return data;
    } catch (error) {
      console.error('Erro no refresh token:', error);
      this.clearAuthData();
      throw error;
    }
  }

  // Logout
  async logout(): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });
    } catch (error) {
      console.error('Erro no logout:', error);
    } finally {
      this.clearAuthData();
    }
  }

  // Limpar dados de autenticação
  clearAuthData(): void {
    localStorage.removeItem('betforbes_token');
    localStorage.removeItem('betforbes_refresh_token');
    localStorage.removeItem('betforbes_auth');
    sessionStorage.clear();
  }

  // Verificar se tem token válido
  hasValidToken(): boolean {
    const token = localStorage.getItem('betforbes_token');
    if (!token) return false;

    try {
      // Decodificar JWT para verificar expiração
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Date.now() / 1000;
      return payload.exp > now;
    } catch {
      return false;
    }
  }

  // Obter dados do usuário do backend
  async getUserProfile(): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      return this.handleResponse<AuthResponse>(response);
    } catch (error) {
      console.error('Erro ao obter perfil do usuário:', error);
      throw error;
    }
  }
}

export const apiService = new ApiService();
export type { LoginRequest, RegisterRequest, AuthResponse, ApiError };


import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  message: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name?: string;
  last_name?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

class AuthService {
  private getAuthHeaders() {
    const token = this.getToken();
    return token ? { Authorization: `Token ${token}` } : {};
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  removeToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await axios.post(`${API_URL}/api/auth/register/`, data);
    if (response.data.token) {
      this.setToken(response.data.token);
    }
    return response.data;
  }

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await axios.post(`${API_URL}/api/auth/login/`, data);
    if (response.data.token) {
      this.setToken(response.data.token);
    }
    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await axios.post(`${API_URL}/api/auth/logout/`, {}, {
        headers: this.getAuthHeaders()
      });
    } finally {
      this.removeToken();
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await axios.get(`${API_URL}/api/auth/profile/`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      this.removeToken();
      return null;
    }
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await axios.patch(`${API_URL}/api/auth/profile/`, data, {
      headers: this.getAuthHeaders()
    });
    return response.data;
  }

  async changePassword(oldPassword: string, newPassword: string, newPasswordConfirm: string): Promise<void> {
    await axios.post(`${API_URL}/api/auth/change-password/`, {
      old_password: oldPassword,
      new_password: newPassword,
      new_password_confirm: newPasswordConfirm
    }, {
      headers: this.getAuthHeaders()
    });
  }

  async checkAuth(): Promise<boolean> {
    try {
      await axios.get(`${API_URL}/api/auth/check/`, {
        headers: this.getAuthHeaders()
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const authService = new AuthService();

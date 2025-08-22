import api, { endpoints } from './api';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  phone: string;
  password: string;
  userType: 'parent' | 'delivery' | 'school' | 'caterer';
  // Common required fields for all user types
  doorNo?: string;
  address?: string;
  locationName?: string;
  // Parent specific
  houseNo?: string;
  cityName?: string;
  // Delivery specific
  name?: string;
  vehicleType?: string;
  vehicleNumber?: string;
  serviceArea?: string;
  // School specific
  schoolName?: string;
  schoolId?: string;
  contactPerson?: string;
  establishedYear?: string;
  classes?: string;
  // Caterer specific
  businessName?: string;
  contactPersonCaterer?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: any;
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post(endpoints.login, credentials);
    
    if (response.data.token) {
      localStorage.setItem('lunchbox_token', response.data.token);
      localStorage.setItem('lunchbox_user_id', response.data.user.id);
    }
    
    return response.data;
  }

  async register(userData: RegisterData): Promise<AuthResponse> {
    const response = await api.post(endpoints.register, userData);
    
    if (response.data.token) {
      localStorage.setItem('lunchbox_token', response.data.token);
      localStorage.setItem('lunchbox_user_id', response.data.user.id);
    }
    
    return response.data;
  }

  async getProfile() {
    const response = await api.get(endpoints.profile);
    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await api.post(endpoints.logout);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('lunchbox_token');
      localStorage.removeItem('lunchbox_user_id');
    }
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('lunchbox_token');
  }

  getToken(): string | null {
    return localStorage.getItem('lunchbox_token');
  }

  getUserId(): string | null {
    return localStorage.getItem('lunchbox_user_id');
  }
}

export default new AuthService();
import { User } from '../types';

export const TOKEN_KEY = 'token';
export const USER_KEY = 'user';

export const authUtils = {
  // Token management
  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  removeToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  },

  // User management
  setUser(user: User): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  getUser(): User | null {
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  },

  removeUser(): void {
    localStorage.removeItem(USER_KEY);
  },

  // Authentication status
  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.getUser();
  },

  // Role-based access
  hasRole(role: string): boolean {
    const user = this.getUser();
    return user?.role === role;
  },

  isCustomer(): boolean {
    return this.hasRole('customer');
  },

  isBaker(): boolean {
    return this.hasRole('baker');
  },

  isDeliveryPerson(): boolean {
    return this.hasRole('delivery_person');
  },

  isAdmin(): boolean {
    return this.hasRole('admin');
  },

  // Logout
  logout(): void {
    this.removeToken();
    this.removeUser();
  },

  // Helper for API calls
  getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
};
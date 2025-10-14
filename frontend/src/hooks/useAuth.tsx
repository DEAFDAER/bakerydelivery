import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, LoginRequest, RegisterRequest, AuthResponse } from '../types';
import { apiService } from '../services/api';
import { authUtils } from '../utils/auth';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing authentication on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = authUtils.getToken();
      const storedUser = authUtils.getUser();

      if (token && storedUser) {
        try {
          // Verify token is still valid
          await apiService.getCurrentUser();
          setUser(storedUser);
        } catch (error) {
          // Token is invalid, clear storage
          authUtils.logout();
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginRequest) => {
    try {
      setLoading(true);
      const response: AuthResponse = await apiService.login(credentials);
      
      // Set token first and update axios instance
      authUtils.setToken(response.access_token);
      apiService.setAuthToken(response.access_token);

      // Now get user profile with the token
      const userProfile = await apiService.getCurrentUser();
      authUtils.setUser(userProfile as User);
      setUser(userProfile as User);

      toast.success('Login successful!');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterRequest) => {
    try {
      setLoading(true);
      const newUser = await apiService.register(userData);

      toast.success('Registration successful! Please login.');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Registration failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authUtils.logout();
    setUser(null);
    toast.success('Logged out successfully');
  };

  const isAuthenticated = !!user;
  const hasRole = (role: string) => user?.role === role;

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated,
    hasRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

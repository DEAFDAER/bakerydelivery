import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import {
  User,
  Product,
  Category,
  Order,
  Delivery,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  UserProfile,
  ProductFormData,
  CategoryFormData,
  OrderFormData,
  DeliveryFormData,
  DashboardStats,
  ProductFilters,
  OrderFilters
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

class ApiService {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for auth token
    this.axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Add response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: any) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  setAuthToken(token: string | null) {
    if (token) {
      this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.axiosInstance.defaults.headers.common['Authorization'];
    }
  }

  // Authentication
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.axiosInstance.post('/api/auth/login-form', credentials);
    return response.data;
  }

  async register(userData: RegisterRequest): Promise<User> {
    const response: AxiosResponse<User> = await this.axiosInstance.post('/api/auth/register', userData);
    return response.data;
  }

  async getCurrentUser(): Promise<UserProfile> {
    const response: AxiosResponse<UserProfile> = await this.axiosInstance.get('/api/auth/me');
    return response.data;
  }

  // Products
  async getProducts(filters?: Omit<ProductFilters, 'category_id'|'category_name'>): Promise<Product[]> {
    const params = {
      min_price: filters?.min_price,
      max_price: filters?.max_price,
      in_stock: filters?.in_stock,
      search: filters?.search
    };
    
    const response: AxiosResponse<Product[]> = await this.axiosInstance.get('/api/products/', { params });
    return response.data;
  }

  async getProduct(id: number): Promise<Product> {
    const response: AxiosResponse<Product> = await this.axiosInstance.get(`/api/products/${id}`);
    return response.data;
  }

  async createProduct(productData: ProductFormData): Promise<Product> {
    const response: AxiosResponse<Product> = await this.axiosInstance.post('/api/products/', productData);
    return response.data;
  }

  async updateProduct(id: number, productData: Partial<ProductFormData>): Promise<Product> {
    const response: AxiosResponse<Product> = await this.axiosInstance.put(`/api/products/${id}`, productData);
    return response.data;
  }

  async deleteProduct(id: number): Promise<void> {
    await this.axiosInstance.delete(`/api/products/${id}`);
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    const response: AxiosResponse<Category[]> = await this.axiosInstance.get('/api/categories/');
    return response.data;
  }

  async createCategory(categoryData: CategoryFormData): Promise<Category> {
    const response: AxiosResponse<Category> = await this.axiosInstance.post('/api/categories/', categoryData);
    return response.data;
  }

  // Orders
  async getOrders(filters?: OrderFilters): Promise<Order[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    const response: AxiosResponse<Order[]> = await this.axiosInstance.get(`/api/orders/?${params}`);
    return response.data;
  }

  async getOrder(id: number): Promise<Order> {
    const response: AxiosResponse<Order> = await this.axiosInstance.get(`/api/orders/${id}`);
    return response.data;
  }

  async createOrder(orderData: OrderFormData): Promise<Order> {
    const response: AxiosResponse<Order> = await this.axiosInstance.post('/api/orders/', orderData);
    return response.data;
  }

  async updateOrderStatus(id: number, status: string): Promise<void> {
    await this.axiosInstance.put(`/api/orders/${id}/status`, { status });
  }

  async getAllOrders(filters?: OrderFilters): Promise<Order[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    const response: AxiosResponse<Order[]> = await this.axiosInstance.get(`/api/orders/admin/all?${params}`);
    return response.data;
  }

  // Deliveries
  async getDeliveries(): Promise<Delivery[]> {
    const response: AxiosResponse<Delivery[]> = await this.axiosInstance.get('/api/deliveries/');
    return response.data;
  }

  async getDelivery(id: number): Promise<Delivery> {
    const response: AxiosResponse<Delivery> = await this.axiosInstance.get(`/api/deliveries/${id}`);
    return response.data;
  }

  async createDelivery(deliveryData: DeliveryFormData): Promise<Delivery> {
    const response: AxiosResponse<Delivery> = await this.axiosInstance.post('/api/deliveries/', deliveryData);
    return response.data;
  }

  async updateDeliveryStatus(id: number, status: string, location?: { latitude: number; longitude: number }): Promise<void> {
    await this.axiosInstance.put(`/api/deliveries/${id}/status`, {
      status,
      location_latitude: location?.latitude,
      location_longitude: location?.longitude
    });
  }

  async getAvailableDeliveryPersonnel(): Promise<User[]> {
    const response: AxiosResponse<User[]> = await this.axiosInstance.get('/api/deliveries/available/personnel');
    return response.data;
  }

  // Users
  async getUsers(): Promise<User[]> {
    const response: AxiosResponse<User[]> = await this.axiosInstance.get('/api/users/');
    return response.data;
  }

  async getUser(id: number): Promise<User> {
    const response: AxiosResponse<User> = await this.axiosInstance.get(`/api/users/${id}`);
    return response.data;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const response: AxiosResponse<User> = await this.axiosInstance.put(`/api/users/${id}`, userData);
    return response.data;
  }

  async deactivateUser(id: number): Promise<void> {
    await this.axiosInstance.delete(`/api/users/${id}`);
  }

  async getUserProfile(): Promise<User> {
    const response: AxiosResponse<User> = await this.axiosInstance.get('/api/users/profile/me');
    return response.data;
  }

  async updateUserProfile(userData: Partial<User>): Promise<User> {
    const response: AxiosResponse<User> = await this.axiosInstance.put('/api/users/profile/me', userData);
    return response.data;
  }

  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    // This would typically be a dedicated endpoint
    // For now, we'll calculate stats from existing endpoints
    const orders = await this.getAllOrders();
    const users = await this.getUsers();

    return {
      total_orders: orders.length,
      total_revenue: orders.reduce((sum, order) => sum + order.final_amount, 0),
      total_customers: users.filter(u => u.role === 'customer').length,
      pending_orders: orders.filter(o => o.status === 'pending').length,
      completed_orders: orders.filter(o => ['delivered', 'completed'].includes(o.status)).length,
      completed_deliveries: orders.filter(o => o.status === 'delivered').length,
    };
  }
}

export const apiService = new ApiService();
export default apiService;
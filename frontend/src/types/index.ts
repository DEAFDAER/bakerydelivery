// API Types matching the backend models

export interface User {
  id: number;
  email: string;
  username: string;
  full_name: string;
  phone?: string;
  address?: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export type UserRole = 'customer' | 'baker' | 'delivery_person' | 'admin';

export interface Category {
  id: number;
  name: string;
  description?: string;
  image_url?: string;
  is_active: boolean;
  created_at: string;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  stock_quantity: number;
  is_available: boolean;
  baker_id: number;
  category_id: number;
  created_at: string;
  updated_at: string;
  category?: Category;
  baker?: User;
}

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  total_price: number;
  product: Product;
}

export interface Order {
  id: number;
  customer_id: number;
  total_amount: number;
  delivery_fee: number;
  tax_amount: number;
  discount_amount: number;
  final_amount: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  delivery_address: string;
  delivery_instructions?: string;
  estimated_delivery_time?: string;
  actual_delivery_time?: string;
  created_at: string;
  updated_at: string;
  customer: User;
  items: OrderItem[];
  delivery?: Delivery;
}

export interface Delivery {
  id: number;
  order_id: number;
  delivery_person_id?: number;
  status: string;
  assigned_at: string;
  picked_up_at?: string;
  delivered_at?: string;
  delivery_notes?: string;
  location_latitude?: number;
  location_longitude?: number;
  order: Order;
  delivery_person?: User;
}

// Form Data Types
export interface ProductFormData {
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  stock_quantity: number;
  is_available?: boolean;
  baker_email: string;
}

export interface ProductFilters {
  category_id?: number;
  category_name?: string;
  min_price?: number;
  max_price?: number;
  in_stock?: boolean;
  search?: string;
}

export interface ProfileFormData {
  email?: string;
  username?: string;
  full_name?: string;
  phone?: string;
  address?: string;
  current_password?: string;
  new_password?: string;
}

// Category Form Types
export interface CategoryFormData {
  name: string;
  description?: string;
  image_url?: string;
  is_active?: boolean;
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  full_name: string;
  password: string;
  phone?: string;
  address?: string;
  role: UserRole;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface UserProfile {
  id: number;
  email: string;
  username: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
}

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// Form Types
export interface OrderFormData {
  delivery_address: string;
  delivery_instructions?: string;
  items: Array<{
    product_id: number;
    quantity: number;
  }>;
}

export interface DeliveryFormData {
  order_id: number;
  delivery_person_id?: number;
  delivery_notes?: string;
}

// Dashboard Types
export interface DashboardStats {
  total_orders: number;
  total_revenue: number;
  total_customers: number;
  pending_orders: number;
  completed_orders: number;
  completed_deliveries: number;
  recent_orders?: Order[];
  top_products?: Product[];
  revenue_by_category?: Array<{
    category: string;
    revenue: number;
  }>;
}

// Location Types for Maps
export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

// Filter and Search Types
export interface OrderFilters {
  status?: OrderStatus;
  date_from?: string;
  date_to?: string;
  customer_id?: number;
}
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from models.models import UserRole, OrderStatus, PaymentStatus

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: str
    phone: Optional[str] = None
    address: Optional[str] = None
    role: UserRole = UserRole.CUSTOMER

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    full_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    is_active: Optional[bool] = None

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Category Schemas
class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    is_active: bool = True

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = None

class CategoryResponse(CategoryBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Product Schemas
class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    image_url: Optional[str] = None
    stock_quantity: int = 0
    is_available: bool = True
    baker_id: int
    category_id: int

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    image_url: Optional[str] = None
    stock_quantity: Optional[int] = None
    is_available: Optional[bool] = None
    category_id: Optional[int] = None

class ProductResponse(ProductBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    baker: Optional[UserResponse] = None
    category: Optional[CategoryResponse] = None

    class Config:
        from_attributes = True

# Order Item Schemas
class OrderItemBase(BaseModel):
    product_id: int
    quantity: int
    unit_price: float
    total_price: float

class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int

class OrderItemResponse(OrderItemBase):
    id: int
    order_id: int
    created_at: datetime
    product: Optional[ProductResponse] = None

    class Config:
        from_attributes = True

# Order Schemas
class OrderBase(BaseModel):
    customer_id: int
    total_amount: float
    delivery_fee: float = 0.0
    tax_amount: float = 0.0
    discount_amount: float = 0.0
    final_amount: float
    delivery_address: str
    delivery_instructions: Optional[str] = None

class OrderCreate(BaseModel):
    delivery_address: str
    delivery_instructions: Optional[str] = None
    items: List[OrderItemCreate]

class OrderUpdate(BaseModel):
    status: Optional[OrderStatus] = None
    payment_status: Optional[PaymentStatus] = None
    estimated_delivery_time: Optional[datetime] = None
    actual_delivery_time: Optional[datetime] = None

class OrderResponse(OrderBase):
    id: int
    status: OrderStatus
    payment_status: PaymentStatus
    estimated_delivery_time: Optional[datetime] = None
    actual_delivery_time: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    customer: Optional[UserResponse] = None
    items: List[OrderItemResponse] = []
    delivery: Optional['DeliveryResponse'] = None

    class Config:
        from_attributes = True

# Delivery Schemas
class DeliveryBase(BaseModel):
    order_id: int
    delivery_person_id: Optional[int] = None
    status: str = "pending"
    delivery_notes: Optional[str] = None
    location_latitude: Optional[float] = None
    location_longitude: Optional[float] = None

class DeliveryCreate(BaseModel):
    order_id: int
    delivery_person_id: Optional[int] = None
    delivery_notes: Optional[str] = None

class DeliveryUpdate(BaseModel):
    delivery_person_id: Optional[int] = None
    status: Optional[str] = None
    delivery_notes: Optional[str] = None
    location_latitude: Optional[float] = None
    location_longitude: Optional[float] = None
    picked_up_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None

class DeliveryResponse(DeliveryBase):
    id: int
    assigned_at: datetime
    picked_up_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    order: Optional[OrderResponse] = None
    delivery_person: Optional[UserResponse] = None

    class Config:
        from_attributes = True

# Auth Schemas
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class RegisterRequest(BaseModel):
    email: EmailStr
    username: str
    full_name: str
    password: str
    phone: Optional[str] = None
    address: Optional[str] = None
    role: UserRole = UserRole.CUSTOMER

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class TokenData(BaseModel):
    email: Optional[str] = None

# Dashboard Schemas
class DashboardStats(BaseModel):
    total_orders: int = 0
    total_revenue: float = 0.0
    total_customers: int = 0
    pending_orders: int = 0
    completed_orders: int = 0
    completed_deliveries: int = 0
    recent_orders: List[OrderResponse] = []
    top_products: List[ProductResponse] = []
    revenue_by_category: List[dict] = []

# Pagination Schemas
class PaginatedResponse(BaseModel):
    items: List[dict]
    total: int
    page: int
    size: int
    pages: int

# Update forward references
OrderResponse.model_rebuild()
DeliveryResponse.model_rebuild()

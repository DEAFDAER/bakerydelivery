from typing import List, Optional, TypeVar, Generic
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from models.models import User, Product, Category, Order, OrderItem, Delivery
from models.schemas import (
    UserCreate, UserUpdate, UserResponse,
    CategoryCreate, CategoryUpdate, CategoryResponse,
    ProductCreate, ProductUpdate, ProductResponse,
    OrderCreate, OrderUpdate, OrderResponse,
    OrderItemCreate, OrderItemResponse,
    DeliveryCreate, DeliveryUpdate, DeliveryResponse,
    DashboardStats
)
from utils.auth import get_password_hash, verify_password
from datetime import datetime, timedelta
import math

T = TypeVar('T')

class BaseService(Generic[T]):
    """Base service class for common CRUD operations."""
    
    def __init__(self, model_class):
        self.model_class = model_class
    
    def get(self, db: Session, id: int) -> Optional[T]:
        return db.query(self.model_class).filter(self.model_class.id == id).first()
    
    def get_all(self, db: Session, skip: int = 0, limit: int = 100) -> List[T]:
        return db.query(self.model_class).offset(skip).limit(limit).all()
    
    def create(self, db: Session, obj_in: dict) -> T:
        db_obj = self.model_class(**obj_in)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def update(self, db: Session, db_obj: T, obj_in: dict) -> T:
        for field, value in obj_in.items():
            if hasattr(db_obj, field) and value is not None:
                setattr(db_obj, field, value)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def delete(self, db: Session, id: int) -> bool:
        obj = db.query(self.model_class).filter(self.model_class.id == id).first()
        if obj:
            db.delete(obj)
            db.commit()
            return True
        return False

class UserService(BaseService[User]):
    def __init__(self):
        super().__init__(User)
    
    def get_by_email(self, db: Session, email: str) -> Optional[User]:
        return db.query(User).filter(User.email == email).first()
    
    def get_by_username(self, db: Session, username: str) -> Optional[User]:
        return db.query(User).filter(User.username == username).first()
    
    def create_user(self, db: Session, user: UserCreate) -> User:
        hashed_password = get_password_hash(user.password)
        user_data = user.dict()
        user_data.pop('password')
        user_data['hashed_password'] = hashed_password
        return self.create(db, user_data)
    
    def update_user(self, db: Session, user_id: int, user_update: UserUpdate) -> Optional[User]:
        user = self.get(db, user_id)
        if not user:
            return None
        
        update_data = user_update.dict(exclude_unset=True)
        return self.update(db, user, update_data)
    
    def get_users_by_role(self, db: Session, role: str, skip: int = 0, limit: int = 100) -> List[User]:
        return db.query(User).filter(User.role == role).offset(skip).limit(limit).all()

class CategoryService(BaseService[Category]):
    def __init__(self):
        super().__init__(Category)
    
    def get_active_categories(self, db: Session) -> List[Category]:
        return db.query(Category).filter(Category.is_active == True).all()
    
    def get_by_name(self, db: Session, name: str) -> Optional[Category]:
        return db.query(Category).filter(Category.name == name).first()

class ProductService(BaseService[Product]):
    def __init__(self):
        super().__init__(Product)
    
    def get_available_products(self, db: Session, skip: int = 0, limit: int = 100) -> List[Product]:
        return db.query(Product).filter(
            Product.is_available == True,
            Product.stock_quantity > 0
        ).offset(skip).limit(limit).all()
    
    def get_products_by_category(self, db: Session, category_id: int, skip: int = 0, limit: int = 100) -> List[Product]:
        return db.query(Product).filter(
            Product.category_id == category_id,
            Product.is_available == True
        ).offset(skip).limit(limit).all()
    
    def get_products_by_baker(self, db: Session, baker_id: int, skip: int = 0, limit: int = 100) -> List[Product]:
        return db.query(Product).filter(Product.baker_id == baker_id).offset(skip).limit(limit).all()
    
    def search_products(self, db: Session, search_term: str, skip: int = 0, limit: int = 100) -> List[Product]:
        return db.query(Product).filter(
            Product.name.ilike(f"%{search_term}%"),
            Product.is_available == True
        ).offset(skip).limit(limit).all()
    
    def update_stock(self, db: Session, product_id: int, quantity_change: int) -> Optional[Product]:
        product = self.get(db, product_id)
        if not product:
            return None
        
        new_stock = product.stock_quantity + quantity_change
        if new_stock < 0:
            return None
        
        product.stock_quantity = new_stock
        product.is_available = new_stock > 0
        db.commit()
        db.refresh(product)
        return product

class OrderService(BaseService[Order]):
    def __init__(self):
        super().__init__(Order)
    
    def create_order(self, db: Session, order_data: OrderCreate, customer_id: int) -> Order:
        # Calculate totals
        total_amount = 0.0
        order_items_data = []
        
        for item in order_data.items:
            product = db.query(Product).filter(Product.id == item.product_id).first()
            if not product or product.stock_quantity < item.quantity:
                raise ValueError(f"Insufficient stock for product {product.name if product else 'Unknown'}")
            
            unit_price = product.price
            item_total = unit_price * item.quantity
            total_amount += item_total
            
            order_items_data.append({
                'product_id': item.product_id,
                'quantity': item.quantity,
                'unit_price': unit_price,
                'total_price': item_total
            })
        
        # Calculate delivery fee, tax, and final amount
        delivery_fee = 50.0  # Fixed delivery fee
        tax_amount = total_amount * 0.12  # 12% tax
        final_amount = total_amount + delivery_fee + tax_amount
        
        # Create order
        order_dict = {
            'customer_id': customer_id,
            'total_amount': total_amount,
            'delivery_fee': delivery_fee,
            'tax_amount': tax_amount,
            'discount_amount': 0.0,
            'final_amount': final_amount,
            'delivery_address': order_data.delivery_address,
            'delivery_instructions': order_data.delivery_instructions
        }
        
        order = self.create(db, order_dict)
        
        # Create order items and update stock
        for item_data in order_items_data:
            order_item = OrderItem(order_id=order.id, **item_data)
            db.add(order_item)
            
            # Update product stock
            product_service = ProductService()
            product_service.update_stock(db, item_data['product_id'], -item_data['quantity'])
        
        db.commit()
        db.refresh(order)
        return order
    
    def get_orders_by_customer(self, db: Session, customer_id: int, skip: int = 0, limit: int = 100) -> List[Order]:
        return db.query(Order).filter(Order.customer_id == customer_id).order_by(desc(Order.created_at)).offset(skip).limit(limit).all()
    
    def get_orders_by_status(self, db: Session, status: str, skip: int = 0, limit: int = 100) -> List[Order]:
        return db.query(Order).filter(Order.status == status).order_by(desc(Order.created_at)).offset(skip).limit(limit).all()
    
    def update_order_status(self, db: Session, order_id: int, status: str) -> Optional[Order]:
        order = self.get(db, order_id)
        if not order:
            return None
        
        order.status = status
        if status == "delivered":
            order.actual_delivery_time = datetime.utcnow()
        
        db.commit()
        db.refresh(order)
        return order

class DeliveryService(BaseService[Delivery]):
    def __init__(self):
        super().__init__(Delivery)
    
    def create_delivery(self, db: Session, delivery_data: DeliveryCreate) -> Delivery:
        delivery_dict = delivery_data.dict()
        return self.create(db, delivery_dict)
    
    def get_deliveries_by_person(self, db: Session, delivery_person_id: int, skip: int = 0, limit: int = 100) -> List[Delivery]:
        return db.query(Delivery).filter(Delivery.delivery_person_id == delivery_person_id).offset(skip).limit(limit).all()
    
    def get_pending_deliveries(self, db: Session, skip: int = 0, limit: int = 100) -> List[Delivery]:
        return db.query(Delivery).filter(Delivery.status == "pending").offset(skip).limit(limit).all()
    
    def assign_delivery(self, db: Session, delivery_id: int, delivery_person_id: int) -> Optional[Delivery]:
        delivery = self.get(db, delivery_id)
        if not delivery:
            return None
        
        delivery.delivery_person_id = delivery_person_id
        delivery.status = "assigned"
        db.commit()
        db.refresh(delivery)
        return delivery
    
    def update_delivery_status(self, db: Session, delivery_id: int, status: str, notes: str = None) -> Optional[Delivery]:
        delivery = self.get(db, delivery_id)
        if not delivery:
            return None
        
        delivery.status = status
        if notes:
            delivery.delivery_notes = notes
        
        if status == "picked_up":
            delivery.picked_up_at = datetime.utcnow()
        elif status == "delivered":
            delivery.delivered_at = datetime.utcnow()
        
        db.commit()
        db.refresh(delivery)
        return delivery

class DashboardService:
    @staticmethod
    def get_dashboard_stats(db: Session) -> DashboardStats:
        # Get basic counts
        total_orders = db.query(Order).count()
        total_customers = db.query(User).filter(User.role == "customer").count()
        pending_orders = db.query(Order).filter(Order.status == "pending").count()
        completed_orders = db.query(Order).filter(Order.status == "delivered").count()
        completed_deliveries = db.query(Delivery).filter(Delivery.status == "delivered").count()
        
        # Calculate total revenue
        total_revenue_result = db.query(func.sum(Order.final_amount)).filter(Order.status == "delivered").scalar()
        total_revenue = float(total_revenue_result) if total_revenue_result else 0.0
        
        # Get recent orders
        recent_orders = db.query(Order).order_by(desc(Order.created_at)).limit(5).all()
        
        # Get top products (by order count)
        top_products_query = db.query(
            Product,
            func.sum(OrderItem.quantity).label('total_ordered')
        ).join(OrderItem).group_by(Product.id).order_by(desc('total_ordered')).limit(5).all()
        
        top_products = [product for product, _ in top_products_query]
        
        # Get revenue by category
        revenue_by_category = db.query(
            Category.name,
            func.sum(OrderItem.total_price).label('revenue')
        ).join(Product).join(OrderItem).join(Order).filter(
            Order.status == "delivered"
        ).group_by(Category.name).all()
        
        revenue_by_category_list = [
            {"category": category, "revenue": float(revenue)}
            for category, revenue in revenue_by_category
        ]
        
        return DashboardStats(
            total_orders=total_orders,
            total_revenue=total_revenue,
            total_customers=total_customers,
            pending_orders=pending_orders,
            completed_orders=completed_orders,
            completed_deliveries=completed_deliveries,
            recent_orders=recent_orders,
            top_products=top_products,
            revenue_by_category=revenue_by_category_list
        )

# Initialize services
user_service = UserService()
category_service = CategoryService()
product_service = ProductService()
order_service = OrderService()
delivery_service = DeliveryService()
dashboard_service = DashboardService()

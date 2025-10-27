from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from config.database import get_db
from models.schemas import DashboardStats
from models.models import User
from utils.auth import get_current_active_user, require_admin, require_role
from utils.services import dashboard_service

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get dashboard statistics (admin only)."""
    stats = dashboard_service.get_dashboard_stats(db)
    return stats

@router.get("/baker/stats")
async def get_baker_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("baker"))
):
    """Get baker-specific statistics."""
    from sqlalchemy import func
    from models.models import Product, OrderItem, Order
    
    # Get baker's products count
    total_products = db.query(Product).filter(Product.baker_id == current_user.id).count()
    available_products = db.query(Product).filter(
        Product.baker_id == current_user.id,
        Product.is_available == True,
        Product.stock_quantity > 0
    ).count()
    
    # Get baker's orders count
    baker_orders_query = db.query(Order).join(OrderItem).join(Product).filter(
        Product.baker_id == current_user.id
    )
    
    total_orders = baker_orders_query.count()
    pending_orders = baker_orders_query.filter(Order.status == "pending").count()
    preparing_orders = baker_orders_query.filter(Order.status == "preparing").count()
    ready_orders = baker_orders_query.filter(Order.status == "ready").count()
    
    # Get baker's revenue
    revenue_result = db.query(func.sum(OrderItem.total_price)).join(Order).join(Product).filter(
        Product.baker_id == current_user.id,
        Order.status == "delivered"
    ).scalar()
    
    total_revenue = float(revenue_result) if revenue_result else 0.0
    
    return {
        "total_products": total_products,
        "available_products": available_products,
        "total_orders": total_orders,
        "pending_orders": pending_orders,
        "preparing_orders": preparing_orders,
        "ready_orders": ready_orders,
        "total_revenue": total_revenue
    }

@router.get("/delivery-person/stats")
async def get_delivery_person_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("delivery_person"))
):
    """Get delivery person-specific statistics."""
    from sqlalchemy import func
    from models.models import Delivery
    
    # Get delivery person's deliveries count
    total_deliveries = db.query(Delivery).filter(Delivery.delivery_person_id == current_user.id).count()
    pending_deliveries = db.query(Delivery).filter(
        Delivery.delivery_person_id == current_user.id,
        Delivery.status == "pending"
    ).count()
    assigned_deliveries = db.query(Delivery).filter(
        Delivery.delivery_person_id == current_user.id,
        Delivery.status == "assigned"
    ).count()
    completed_deliveries = db.query(Delivery).filter(
        Delivery.delivery_person_id == current_user.id,
        Delivery.status == "delivered"
    ).count()
    
    return {
        "total_deliveries": total_deliveries,
        "pending_deliveries": pending_deliveries,
        "assigned_deliveries": assigned_deliveries,
        "completed_deliveries": completed_deliveries
    }

@router.get("/customer/stats")
async def get_customer_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get customer-specific statistics."""
    from sqlalchemy import func
    from models.models import Order
    
    # Get customer's orders count
    total_orders = db.query(Order).filter(Order.customer_id == current_user.id).count()
    pending_orders = db.query(Order).filter(
        Order.customer_id == current_user.id,
        Order.status == "pending"
    ).count()
    completed_orders = db.query(Order).filter(
        Order.customer_id == current_user.id,
        Order.status == "delivered"
    ).count()
    
    # Get customer's total spent
    total_spent_result = db.query(func.sum(Order.final_amount)).filter(
        Order.customer_id == current_user.id,
        Order.status == "delivered"
    ).scalar()
    
    total_spent = float(total_spent_result) if total_spent_result else 0.0
    
    return {
        "total_orders": total_orders,
        "pending_orders": pending_orders,
        "completed_orders": completed_orders,
        "total_spent": total_spent
    }

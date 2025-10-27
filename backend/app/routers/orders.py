from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from config.database import get_db
from models.schemas import OrderResponse, OrderCreate, OrderUpdate
from models.models import Order, User, OrderStatus
from utils.auth import get_current_active_user, require_role
from utils.services import order_service

router = APIRouter(prefix="/orders", tags=["orders"])

@router.get("/", response_model=List[OrderResponse])
async def get_orders(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    status: Optional[str] = Query(None),
    customer_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get orders."""
    # Admin can see all orders, others can only see their own
    if current_user.role.value == "admin":
        if status:
            orders = order_service.get_orders_by_status(db, status, skip, limit)
        elif customer_id:
            orders = order_service.get_orders_by_customer(db, customer_id, skip, limit)
        else:
            orders = order_service.get_all(db, skip, limit)
    else:
        # Non-admin users can only see their own orders
        orders = order_service.get_orders_by_customer(db, current_user.id, skip, limit)
    
    return [OrderResponse.from_orm(order) for order in orders]

@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get order by ID."""
    order = order_service.get(db, order_id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Users can only view their own orders unless they're admin
    if order.customer_id != current_user.id and current_user.role.value != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    return OrderResponse.from_orm(order)

@router.post("/", response_model=OrderResponse)
async def create_order(
    order_data: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new order."""
    try:
        order = order_service.create_order(db, order_data, current_user.id)
        return OrderResponse.from_orm(order)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.put("/{order_id}", response_model=OrderResponse)
async def update_order(
    order_id: int,
    order_update: OrderUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update order status."""
    order = order_service.get(db, order_id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Only admin, baker, or delivery person can update order status
    if current_user.role.value not in ["admin", "baker", "delivery_person"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Customers can only cancel their own pending orders
    if current_user.role.value == "customer":
        if order.customer_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions"
            )
        if order_update.status and order_update.status != OrderStatus.CANCELLED:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Customers can only cancel orders"
            )
        if order.status != OrderStatus.PENDING:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Can only cancel pending orders"
            )
    
    updated_order = order_service.update(db, order, order_update.dict(exclude_unset=True))
    return OrderResponse.from_orm(updated_order)

@router.patch("/{order_id}/status")
async def update_order_status(
    order_id: int,
    new_status: str = Query(..., description="New order status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update order status."""
    order = order_service.get(db, order_id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Only admin, baker, or delivery person can update order status
    if current_user.role.value not in ["admin", "baker", "delivery_person"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    updated_order = order_service.update_order_status(db, order_id, new_status)
    if not updated_order:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid status or order not found"
        )
    
    return OrderResponse.from_orm(updated_order)

@router.get("/customer/my-orders", response_model=List[OrderResponse])
async def get_my_orders(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get current user's orders."""
    orders = order_service.get_orders_by_customer(db, current_user.id, skip, limit)
    return [OrderResponse.from_orm(order) for order in orders]

@router.get("/status/{status}", response_model=List[OrderResponse])
async def get_orders_by_status(
    status: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("baker"))
):
    """Get orders by status (baker/admin only)."""
    orders = order_service.get_orders_by_status(db, status, skip, limit)
    return [OrderResponse.from_orm(order) for order in orders]

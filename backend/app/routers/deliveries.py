from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from config.database import get_db
from models.schemas import DeliveryResponse, DeliveryCreate, DeliveryUpdate
from models.models import Delivery, User
from utils.auth import get_current_active_user, require_role
from utils.services import delivery_service

router = APIRouter(prefix="/deliveries", tags=["deliveries"])

@router.get("/", response_model=List[DeliveryResponse])
async def get_deliveries(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    status: Optional[str] = Query(None),
    delivery_person_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get deliveries."""
    if current_user.role.value == "admin":
        if delivery_person_id:
            deliveries = delivery_service.get_deliveries_by_person(db, delivery_person_id, skip, limit)
        elif status:
            if status == "pending":
                deliveries = delivery_service.get_pending_deliveries(db, skip, limit)
            else:
                deliveries = delivery_service.get_all(db, skip, limit)
                deliveries = [d for d in deliveries if d.status == status]
        else:
            deliveries = delivery_service.get_all(db, skip, limit)
    elif current_user.role.value == "delivery_person":
        deliveries = delivery_service.get_deliveries_by_person(db, current_user.id, skip, limit)
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    return [DeliveryResponse.from_orm(delivery) for delivery in deliveries]

@router.get("/{delivery_id}", response_model=DeliveryResponse)
async def get_delivery(
    delivery_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get delivery by ID."""
    delivery = delivery_service.get(db, delivery_id)
    if not delivery:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Delivery not found"
        )
    
    # Only admin, delivery person assigned to this delivery, or customer who placed the order can view
    if (current_user.role.value != "admin" and 
        delivery.delivery_person_id != current_user.id and 
        delivery.order.customer_id != current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    return DeliveryResponse.from_orm(delivery)

@router.post("/", response_model=DeliveryResponse)
async def create_delivery(
    delivery_data: DeliveryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    """Create a new delivery (admin only)."""
    # Verify the order exists
    from utils.services import order_service
    order = order_service.get(db, delivery_data.order_id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order not found"
        )
    
    # Check if delivery already exists for this order
    existing_delivery = db.query(Delivery).filter(Delivery.order_id == delivery_data.order_id).first()
    if existing_delivery:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Delivery already exists for this order"
        )
    
    delivery = delivery_service.create_delivery(db, delivery_data)
    return DeliveryResponse.from_orm(delivery)

@router.put("/{delivery_id}", response_model=DeliveryResponse)
async def update_delivery(
    delivery_id: int,
    delivery_update: DeliveryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update delivery."""
    delivery = delivery_service.get(db, delivery_id)
    if not delivery:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Delivery not found"
        )
    
    # Only admin or assigned delivery person can update
    if (current_user.role.value != "admin" and 
        delivery.delivery_person_id != current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    updated_delivery = delivery_service.update(db, delivery, delivery_update.dict(exclude_unset=True))
    return DeliveryResponse.from_orm(updated_delivery)

@router.patch("/{delivery_id}/assign")
async def assign_delivery(
    delivery_id: int,
    delivery_person_id: int = Query(..., description="ID of delivery person to assign"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    """Assign delivery to a delivery person (admin only)."""
    # Verify delivery person exists and has correct role
    delivery_person = db.query(User).filter(
        User.id == delivery_person_id,
        User.role == "delivery_person",
        User.is_active == True
    ).first()
    
    if not delivery_person:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid delivery person"
        )
    
    delivery = delivery_service.assign_delivery(db, delivery_id, delivery_person_id)
    if not delivery:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Delivery not found"
        )
    
    return DeliveryResponse.from_orm(delivery)

@router.patch("/{delivery_id}/status")
async def update_delivery_status(
    delivery_id: int,
    status: str = Query(..., description="New delivery status"),
    notes: Optional[str] = Query(None, description="Delivery notes"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update delivery status."""
    delivery = delivery_service.get(db, delivery_id)
    if not delivery:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Delivery not found"
        )
    
    # Only admin or assigned delivery person can update status
    if (current_user.role.value != "admin" and 
        delivery.delivery_person_id != current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    updated_delivery = delivery_service.update_delivery_status(db, delivery_id, status, notes)
    if not updated_delivery:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid status or delivery not found"
        )
    
    return DeliveryResponse.from_orm(updated_delivery)

@router.get("/delivery-person/my-deliveries", response_model=List[DeliveryResponse])
async def get_my_deliveries(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("delivery_person"))
):
    """Get current delivery person's deliveries."""
    deliveries = delivery_service.get_deliveries_by_person(db, current_user.id, skip, limit)
    return [DeliveryResponse.from_orm(delivery) for delivery in deliveries]

@router.get("/pending/list", response_model=List[DeliveryResponse])
async def get_pending_deliveries(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    """Get pending deliveries (admin only)."""
    deliveries = delivery_service.get_pending_deliveries(db, skip, limit)
    return [DeliveryResponse.from_orm(delivery) for delivery in deliveries]

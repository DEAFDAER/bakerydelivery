from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from config.database import get_db
from models.schemas import ProductResponse, ProductCreate, ProductUpdate
from models.models import Product, User
from utils.auth import get_current_active_user, require_role
from utils.services import product_service

router = APIRouter(prefix="/products", tags=["products"])

@router.get("/", response_model=List[ProductResponse])
async def get_products(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    category_id: Optional[int] = Query(None),
    baker_id: Optional[int] = Query(None),
    available_only: bool = Query(True),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Get all products with optional filtering."""
    if search:
        products = product_service.search_products(db, search, skip, limit)
    elif category_id:
        products = product_service.get_products_by_category(db, category_id, skip, limit)
    elif baker_id:
        products = product_service.get_products_by_baker(db, baker_id, skip, limit)
    elif available_only:
        products = product_service.get_available_products(db, skip, limit)
    else:
        products = product_service.get_all(db, skip, limit)
    
    return [ProductResponse.from_orm(product) for product in products]

@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(
    product_id: int,
    db: Session = Depends(get_db)
):
    """Get product by ID."""
    product = product_service.get(db, product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    return ProductResponse.from_orm(product)

@router.post("/", response_model=ProductResponse)
async def create_product(
    product_data: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("baker"))
):
    """Create a new product (baker only)."""
    # Verify the category exists
    from utils.services import category_service
    category = category_service.get(db, product_data.category_id)
    if not category:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category not found"
        )
    
    # Set baker_id to current user
    product_dict = product_data.dict()
    product_dict['baker_id'] = current_user.id
    
    product = product_service.create(db, product_dict)
    return ProductResponse.from_orm(product)

@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: int,
    product_update: ProductUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update product."""
    product = product_service.get(db, product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Only baker who created the product or admin can update
    if product.baker_id != current_user.id and current_user.role.value != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Verify category if being updated
    if product_update.category_id:
        from utils.services import category_service
        category = category_service.get(db, product_update.category_id)
        if not category:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Category not found"
            )
    
    updated_product = product_service.update(db, product, product_update.dict(exclude_unset=True))
    return ProductResponse.from_orm(updated_product)

@router.delete("/{product_id}")
async def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete product."""
    product = product_service.get(db, product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Only baker who created the product or admin can delete
    if product.baker_id != current_user.id and current_user.role.value != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    product_service.delete(db, product_id)
    return {"message": "Product deleted successfully"}

@router.patch("/{product_id}/stock")
async def update_stock(
    product_id: int,
    quantity_change: int = Query(..., description="Positive to add stock, negative to remove"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("baker"))
):
    """Update product stock (baker only)."""
    product = product_service.get(db, product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Only baker who created the product or admin can update stock
    if product.baker_id != current_user.id and current_user.role.value != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    updated_product = product_service.update_stock(db, product_id, quantity_change)
    if not updated_product:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient stock"
        )
    
    return ProductResponse.from_orm(updated_product)

@router.get("/baker/my-products", response_model=List[ProductResponse])
async def get_my_products(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("baker"))
):
    """Get current baker's products."""
    products = product_service.get_products_by_baker(db, current_user.id, skip, limit)
    return [ProductResponse.from_orm(product) for product in products]

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from config.database import get_db
from models.schemas import CategoryResponse, CategoryCreate, CategoryUpdate
from models.models import Category
from utils.auth import get_current_active_user, require_admin
from utils.services import category_service

router = APIRouter(prefix="/categories", tags=["categories"])

@router.get("/", response_model=List[CategoryResponse])
async def get_categories(
    active_only: bool = Query(True),
    db: Session = Depends(get_db)
):
    """Get all categories."""
    if active_only:
        categories = category_service.get_active_categories(db)
    else:
        categories = category_service.get_all(db)
    return [CategoryResponse.from_orm(category) for category in categories]

@router.get("/{category_id}", response_model=CategoryResponse)
async def get_category(
    category_id: int,
    db: Session = Depends(get_db)
):
    """Get category by ID."""
    category = category_service.get(db, category_id)
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    return CategoryResponse.from_orm(category)

@router.post("/", response_model=CategoryResponse)
async def create_category(
    category_data: CategoryCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_admin)
):
    """Create a new category (admin only)."""
    # Check if category name already exists
    existing_category = category_service.get_by_name(db, category_data.name)
    if existing_category:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category name already exists"
        )
    
    category = category_service.create(db, category_data.dict())
    return CategoryResponse.from_orm(category)

@router.put("/{category_id}", response_model=CategoryResponse)
async def update_category(
    category_id: int,
    category_update: CategoryUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(require_admin)
):
    """Update category (admin only)."""
    category = category_service.get(db, category_id)
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    # Check if new name conflicts with existing category
    if category_update.name and category_update.name != category.name:
        existing_category = category_service.get_by_name(db, category_update.name)
        if existing_category and existing_category.id != category_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Category name already exists"
            )
    
    updated_category = category_service.update(db, category, category_update.dict(exclude_unset=True))
    return CategoryResponse.from_orm(updated_category)

@router.delete("/{category_id}")
async def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_admin)
):
    """Delete category (admin only)."""
    category = category_service.get(db, category_id)
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    # Check if category has products
    from models.models import Product
    products_count = db.query(Product).filter(Product.category_id == category_id).count()
    if products_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete category with {products_count} products. Please reassign or delete products first."
        )
    
    category_service.delete(db, category_id)
    return {"message": "Category deleted successfully"}

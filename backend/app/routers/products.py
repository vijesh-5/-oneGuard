from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models import Product as DBProduct, User
from ..schemas import Product, ProductCreate
from ..dependencies import get_current_user

router = APIRouter()

@router.post("/", response_model=Product, status_code=status.HTTP_201_CREATED)
def create_product(product: ProductCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_product = DBProduct(
        name=product.name,
        base_price=product.base_price,
        type=product.type,
        description=product.description,
        is_active=product.is_active,
        user_id=current_user.id
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@router.get("/", response_model=List[Product])
def read_products(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    products = db.query(DBProduct).filter(DBProduct.user_id == current_user.id).offset(skip).limit(limit).all()
    return products

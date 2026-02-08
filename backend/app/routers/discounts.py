from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

from ..database import get_db
from ..models import Discount as DBDiscount, User
from ..schemas import Discount, DiscountCreate
from ..dependencies import get_current_user

router = APIRouter()

@router.post("/", response_model=Discount, status_code=status.HTTP_201_CREATED)
def create_discount(discount: DiscountCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_discount = DBDiscount(
        name=discount.name,
        type=discount.type,
        value=discount.value,
        start_date=discount.start_date,
        end_date=discount.end_date,
        usage_limit=discount.usage_limit,
        user_id=current_user.id
    )
    db.add(db_discount)
    db.commit()
    db.refresh(db_discount)
    return db_discount

@router.get("/", response_model=List[Discount])
def read_discounts(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    discounts = db.query(DBDiscount).filter(DBDiscount.user_id == current_user.id).offset(skip).limit(limit).all()
    return discounts

@router.get("/discounts/{discount_id}", response_model=Discount)
def read_discount(discount_id: int, db: Session = Depends(get_db)):
    discount = db.query(DBDiscount).filter(DBDiscount.id == discount_id).first()
    if discount is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Discount not found")
    return discount

@router.patch("/discounts/{discount_id}", response_model=Discount)
def update_discount(discount_id: int, discount: DiscountCreate, db: Session = Depends(get_db)):
    db_discount = db.query(DBDiscount).filter(DBDiscount.id == discount_id).first()
    if db_discount is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Discount not found")
    
    db_discount.name = discount.name
    db_discount.type = discount.type
    db_discount.value = discount.value
    db_discount.start_date = discount.start_date
    db_discount.end_date = discount.end_date
    db_discount.usage_limit = discount.usage_limit
    
    db.commit()
    db.refresh(db_discount)
    return db_discount

@router.delete("/discounts/{discount_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_discount(discount_id: int, db: Session = Depends(get_db)):
    db_discount = db.query(DBDiscount).filter(DBDiscount.id == discount_id).first()
    if db_discount is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Discount not found")
    db.delete(db_discount)
    db.commit()
    return {"ok": True}
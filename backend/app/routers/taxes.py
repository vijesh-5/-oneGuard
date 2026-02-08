from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models import Tax as DBTax, User
from ..schemas import Tax, TaxCreate
from ..auth_utils import get_current_user

router = APIRouter()

@router.post("/taxes/", response_model=Tax, status_code=status.HTTP_201_CREATED)
def create_tax(tax: TaxCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_tax = DBTax(name=tax.name, percent=tax.percent, is_active=tax.is_active, owner_id=current_user.id)
    db.add(db_tax)
    db.commit()
    db.refresh(db_tax)
    return db_tax

@router.get("/taxes/", response_model=List[Tax])
def read_taxes(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    taxes = db.query(DBTax).filter(DBTax.owner_id == current_user.id).offset(skip).limit(limit).all()
    return taxes

@router.get("/taxes/{tax_id}", response_model=Tax)
def read_tax(tax_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    tax = db.query(DBTax).filter(DBTax.id == tax_id, DBTax.owner_id == current_user.id).first()
    if tax is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tax not found")
    return tax

@router.patch("/taxes/{tax_id}", response_model=Tax)
def update_tax(tax_id: int, tax: TaxCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_tax = db.query(DBTax).filter(DBTax.id == tax_id, DBTax.owner_id == current_user.id).first()
    if db_tax is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tax not found")
    
    db_tax.name = tax.name
    db_tax.percent = tax.percent
    db_tax.is_active = tax.is_active
    
    db.commit()
    db.refresh(db_tax)
    return db_tax

@router.delete("/taxes/{tax_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_tax(tax_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_tax = db.query(DBTax).filter(DBTax.id == tax_id, DBTax.owner_id == current_user.id).first()
    if db_tax is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tax not found")
    db.delete(db_tax)
    db.commit()
    return {"ok": True}
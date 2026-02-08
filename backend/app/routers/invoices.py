from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models import Invoice as DBInvoice, User
from ..schemas import Invoice
from ..dependencies import get_current_user

router = APIRouter()

@router.get("/", response_model=List[Invoice])
def read_invoices(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    invoices = db.query(DBInvoice).filter(DBInvoice.user_id == current_user.id).offset(skip).limit(limit).all()
    return invoices

@router.get("/{invoice_id}", response_model=Invoice)
def read_invoice(invoice_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    invoice = db.query(DBInvoice).filter(DBInvoice.id == invoice_id, DBInvoice.user_id == current_user.id).first()
    if not invoice:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not found")
    return invoice

@router.patch("/{invoice_id}/status", response_model=Invoice)
def update_invoice_status(invoice_id: int, status: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    invoice = db.query(DBInvoice).filter(DBInvoice.id == invoice_id, DBInvoice.user_id == current_user.id).first()
    if not invoice:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not found")
    
    allowed_statuses = ["draft", "confirmed", "paid", "cancelled"]
    if status not in allowed_statuses:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid status. Must be one of {allowed_statuses}")
        
    invoice.status = status
    db.commit()
    db.refresh(invoice)
    return invoice

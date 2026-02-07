from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models import Invoice as DBInvoice
from ..schemas import Invoice

router = APIRouter()

@router.get("/", response_model=List[Invoice])
def read_invoices(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    invoices = db.query(DBInvoice).offset(skip).limit(limit).all()
    return invoices

@router.get("/{invoice_id}", response_model=Invoice)
def read_invoice(invoice_id: int, db: Session = Depends(get_db)):
    invoice = db.query(DBInvoice).filter(DBInvoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not found")
    return invoice

@router.patch("/{invoice_id}/status", response_model=Invoice)
def update_invoice_status(invoice_id: int, status: str, db: Session = Depends(get_db)):
    invoice = db.query(DBInvoice).filter(DBInvoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not found")
    
    allowed_statuses = ["draft", "confirmed", "paid", "cancelled"]
    if status not in allowed_statuses:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid status. Must be one of {allowed_statuses}")
        
    invoice.status = status
    db.commit()
    db.refresh(invoice)
    return invoice

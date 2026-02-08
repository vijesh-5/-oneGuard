from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import date, datetime

from ..database import get_db
from ..models import Invoice as DBInvoice, InvoiceLine as DBInvoiceLine, User
from ..schemas import Invoice as SchemaInvoice, InvoiceLine as SchemaInvoiceLine, InvoicePay
from ..auth_utils import get_current_user

router = APIRouter()

@router.get("/", response_model=List[SchemaInvoice], tags=["invoices"])
def read_invoices(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    invoices = db.query(DBInvoice).filter(DBInvoice.customer_id == current_user.id).offset(skip).limit(limit).all()
    return invoices

@router.get("/{invoice_id}", response_model=SchemaInvoice, tags=["invoices"])
def read_invoice(invoice_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    invoice = db.query(DBInvoice).filter(DBInvoice.id == invoice_id).first()
    if invoice is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not found")
    
    # Verify ownership
    if invoice.customer_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not found")
        
    return invoice

@router.patch("/{invoice_id}/pay", response_model=SchemaInvoice, tags=["invoices"])
def pay_invoice(invoice_id: int, payment_data: InvoicePay, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    invoice = db.query(DBInvoice).filter(DBInvoice.id == invoice_id).first()
    if invoice is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not found")
    
    # Verify ownership
    if invoice.customer_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not found")

    if invoice.status == "paid":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invoice is already paid")

    # Update invoice status
    invoice.status = "paid"
    invoice.payment_method = payment_data.payment_method
    invoice.paid_date = date.today()

    # Create Payment record
    from ..models import Payment as DBPayment
    new_payment = DBPayment(
        invoice_id=invoice.id,
        amount=invoice.grand_total,
        method=payment_data.payment_method,
        status="success",
        payment_date=datetime.utcnow()
    )
    db.add(new_payment)

    db.commit()
    db.refresh(invoice)
    return invoice

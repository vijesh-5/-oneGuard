from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, date # Import date

from ..database import get_db
from ..models import Payment as DBPayment, Invoice as DBInvoice, User, Customer as DBCustomer
from ..schemas import Payment, PaymentCreate, PaymentBase, InvoiceUpdate, Invoice # Import Invoice
from ..auth_utils import get_current_user

router = APIRouter()

@router.post("/payments/", response_model=Payment, status_code=status.HTTP_201_CREATED)
def create_payment(payment: PaymentCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_invoice = db.query(DBInvoice).join(DBCustomer).filter(DBInvoice.id == payment.invoice_id, DBCustomer.owner_id == current_user.id).first()
    if not db_invoice:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not found")

    db_payment = DBPayment(
        invoice_id=payment.invoice_id,
        amount=payment.amount,
        method=payment.method,
        reference_id=payment.reference_id,
        status=payment.status,
        payment_date=datetime.utcnow() # Always use server-side time for payment_date
    )
    db.add(db_payment)
    db.commit()
    db.refresh(db_payment)
    return db_payment

@router.get("/payments/", response_model=List[Payment])
def read_payments(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    payments = db.query(DBPayment).join(DBInvoice).join(DBCustomer).filter(DBCustomer.owner_id == current_user.id).offset(skip).limit(limit).all()
    return payments

@router.get("/payments/{payment_id}", response_model=Payment)
def read_payment(payment_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    payment = db.query(DBPayment).join(DBInvoice).join(DBCustomer).filter(DBPayment.id == payment_id, DBCustomer.owner_id == current_user.id).first()
    if payment is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment not found")
    return payment

# Simulation endpoint as per guide
@router.post("/payments/simulate", response_model=Payment, status_code=status.HTTP_201_CREATED)
def simulate_payment(payment_details: PaymentBase, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # This is a simplified simulation. In a real scenario, this would involve
    # calling an external payment gateway and handling its response.
    # For now, we'll just create a payment record with 'success' status
    # and link it to an existing invoice.

    db_invoice = db.query(DBInvoice).join(DBCustomer).filter(DBInvoice.id == payment_details.invoice_id, DBCustomer.owner_id == current_user.id).first()
    if not db_invoice:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not found")

    db_payment = DBPayment(
        invoice_id=payment_details.invoice_id,
        amount=payment_details.amount,
        method=payment_details.method,
        reference_id=payment_details.reference_id,
        status="success", # Simulated success
        payment_date=datetime.utcnow()
    )
    db.add(db_payment)
    db.commit()
    db.refresh(db_payment)

    # Optional: Update invoice status to 'paid' if amount matches grand_total, etc.
    # This logic would be part of a more robust payment processing flow.
    # For now, just create the payment.

    return db_payment

@router.patch("/payments/{payment_id}", response_model=Payment)
def update_payment(payment_id: int, payment_update: PaymentCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_payment = db.query(DBPayment).join(DBInvoice).join(DBCustomer).filter(DBPayment.id == payment_id, DBCustomer.owner_id == current_user.id).first()
    if db_payment is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment not found")
    
    # Update fields
    for key, value in payment_update.dict(exclude_unset=True).items():
        setattr(db_payment, key, value)
    
    db.commit()
    db.refresh(db_payment)
    return db_payment

@router.delete("/payments/{payment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_payment(payment_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_payment = db.query(DBPayment).join(DBInvoice).join(DBCustomer).filter(DBPayment.id == payment_id, DBCustomer.owner_id == current_user.id).first()
    if db_payment is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment not found")
    db.delete(db_payment)
    db.commit()
    return {"ok": True}
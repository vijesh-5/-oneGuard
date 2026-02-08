from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import User, Customer, Invoice, Subscription
from ..dependencies import get_current_user
from ..schemas import Invoice as InvoiceSchema, Subscription as SubscriptionSchema

router = APIRouter(
    prefix="/portal",
    tags=["portal"],
    responses={404: {"description": "Not found"}},
)

def get_current_customer(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> Customer:
    # Find the customer profile linked to this user
    customer = db.query(Customer).filter(Customer.portal_user_id == current_user.id).first()
    if not customer:
        raise HTTPException(status_code=403, detail="No customer profile linked to this user.")
    return customer

@router.get("/dashboard")
def get_portal_dashboard(customer: Customer = Depends(get_current_customer), db: Session = Depends(get_db)):
    # Calculate stats for the portal user
    total_invoices = len(customer.invoices)
    pending_invoices = sum(1 for inv in customer.invoices if inv.status != 'paid' and inv.status != 'cancelled')
    active_subscriptions = sum(1 for sub in customer.subscriptions if sub.status == 'active')
    total_due = sum(inv.grand_total for inv in customer.invoices if inv.status != 'paid' and inv.status != 'cancelled')
    
    return {
        "customer_name": customer.name,
        "total_invoices": total_invoices,
        "pending_invoices": pending_invoices,
        "active_subscriptions": active_subscriptions,
        "total_due": total_due
    }

@router.get("/invoices", response_model=List[InvoiceSchema])
def get_portal_invoices(customer: Customer = Depends(get_current_customer)):
    return customer.invoices

@router.get("/subscriptions", response_model=List[SubscriptionSchema])
def get_portal_subscriptions(customer: Customer = Depends(get_current_customer)):
    return customer.subscriptions

@router.post("/link-request")
def request_link(email: str, db: Session = Depends(get_db)):
    # In a real app, this would send an email to the business admin or check for an invite code.
    # For this MVP, we might simulate a self-service link if the email matches a customer email?
    # Or strict invite only.
    # Let's assume strict invite: Admin sets portal_user_id.
    # But for testing, maybe an endpoint to "claim" a customer profile if email matches?
    pass

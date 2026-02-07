from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import date, timedelta

from ..database import get_db
from ..models import Subscription as DBSubscription, Plan as DBPlan, Invoice as DBInvoice
from ..schemas import Subscription, SubscriptionCreate, SubscriptionConfirm

router = APIRouter()

def calculate_next_billing_date(start_date: date, interval: str) -> date:
    if interval == "monthly":
        # Advance month, handle end of month cases
        next_month = start_date.month + 1
        next_year = start_date.year
        if next_month > 12:
            next_month = 1
            next_year += 1
        # Try to keep the same day of the month, but adjust if it's past the end of the next month
        try:
            return date(next_year, next_month, start_date.day)
        except ValueError:
            # e.g., Jan 31 -> Feb 28/29
            return date(next_year, next_month, 1) + timedelta(days=date(next_year, next_month + 1, 1).day - 1 if next_month < 12 else date(next_year + 1, 1, 1).day - 1) - timedelta(days=1)
    elif interval == "yearly":
        return date(start_date.year + 1, start_date.month, start_date.day)
    else:
        raise ValueError(f"Unknown interval: {interval}")

@router.post("/subscriptions/", response_model=Subscription, status_code=status.HTTP_201_CREATED)
def create_subscription(subscription: SubscriptionCreate, db: Session = Depends(get_db)):
    db_subscription = DBSubscription(
        customer_name=subscription.customer_name,
        plan_id=subscription.plan_id,
        status="draft", # Initial status is draft
        start_date=date.today(), # Set start date to today
        next_billing_date=date.today() # Placeholder, will be calculated on confirmation
    )
    db.add(db_subscription)
    db.commit()
    db.refresh(db_subscription)
    return db_subscription

@router.patch("/subscriptions/{subscription_id}/confirm", response_model=SubscriptionConfirm)
def confirm_subscription(subscription_id: int, db: Session = Depends(get_db)):
    db_subscription = db.query(DBSubscription).filter(DBSubscription.id == subscription_id).first()
    if not db_subscription:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subscription not found")

    if db_subscription.status == "active":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Subscription is already active")

    plan = db.query(DBPlan).filter(DBPlan.id == db_subscription.plan_id).first()
    if not plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Associated plan not found")

    db_subscription.status = "active"
    db_subscription.next_billing_date = calculate_next_billing_date(db_subscription.start_date, plan.interval)
    db.commit()
    db.refresh(db_subscription)

    # Create an invoice for the newly confirmed subscription
    new_invoice = DBInvoice(
        subscription_id=db_subscription.id,
        invoice_date=date.today(),
        amount=plan.price, # Use the plan's price as the invoice amount
        status="pending",
        due_date=date.today() + timedelta(days=30) # Example: due in 30 days
    )
    db.add(new_invoice)
    db.commit()
    db.refresh(new_invoice)

    return SubscriptionConfirm(status=db_subscription.status, next_billing_date=db_subscription.next_billing_date)

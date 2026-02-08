

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import date, timedelta, datetime
import random # For generating invoice_number for now

from ..database import get_db
from ..models import Subscription as DBSubscription, Plan as DBPlan, Invoice as DBInvoice, SubscriptionLine as DBSubscriptionLine, InvoiceLine as DBInvoiceLine, Product as DBProduct, User
from ..schemas import Subscription, SubscriptionCreate, SubscriptionConfirm, SubscriptionLineCreate, InvoiceCreate, InvoiceLineCreate, Invoice
from ..dependencies import get_current_user

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

@router.post("/", response_model=Subscription, status_code=status.HTTP_201_CREATED)
def create_subscription(subscription: SubscriptionCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Verify plan belongs to user
    plan = db.query(DBPlan).filter(DBPlan.id == subscription.plan_id, DBPlan.user_id == current_user.id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")

    # Calculate totals from subscription lines
    subtotal = 0.0
    tax_total = 0.0
    discount_total = 0.0
    grand_total = 0.0

    for line_data in subscription.subscription_lines:
        line_subtotal = line_data.unit_price_snapshot * line_data.quantity
        line_discount_amount = line_subtotal * (line_data.discount_percent / 100.0)
        line_tax_amount = (line_subtotal - line_discount_amount) * (line_data.tax_percent / 100.0)
        
        line_data.line_total = line_subtotal - line_discount_amount + line_tax_amount
        
        subtotal += line_subtotal
        tax_total += line_tax_amount
        discount_total += line_discount_amount
        grand_total += line_data.line_total

    db_subscription = DBSubscription(
        subscription_number=subscription.subscription_number,
        customer_id=subscription.customer_id,
        plan_id=subscription.plan_id,
        status=subscription.status,
        start_date=subscription.start_date,
        end_date=subscription.end_date,
        payment_terms=subscription.payment_terms,
        subtotal=subtotal,
        tax_total=tax_total,
        discount_total=discount_total,
        grand_total=grand_total,
        created_at=datetime.utcnow(),
        user_id=current_user.id
    )
    db.add(db_subscription)
    db.commit()
    db.refresh(db_subscription) # Refresh to get the subscription ID

    # Create subscription lines
    for line_data in subscription.subscription_lines:
        db_subscription_line = DBSubscriptionLine(
            subscription_id=db_subscription.id,
            product_id=line_data.product_id,
            product_name_snapshot=line_data.product_name_snapshot,
            unit_price_snapshot=line_data.unit_price_snapshot,
            quantity=line_data.quantity,
            tax_percent=line_data.tax_percent,
            discount_percent=line_data.discount_percent,
            line_total=line_data.line_total
        )
        db.add(db_subscription_line)
    
    db.commit()
    db.refresh(db_subscription) # Refresh again to include lines

    return db_subscription

@router.get("/", response_model=List[Subscription])
def read_subscriptions(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    subscriptions = db.query(DBSubscription).filter(DBSubscription.user_id == current_user.id).offset(skip).limit(limit).all()
    return subscriptions

@router.get("/{subscription_id}", response_model=Subscription)
def read_subscription(subscription_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_subscription = db.query(DBSubscription).filter(DBSubscription.id == subscription_id, DBSubscription.user_id == current_user.id).first()
    if not db_subscription:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subscription not found")
    return db_subscription

@router.patch("/{subscription_id}/confirm", response_model=SubscriptionConfirm)
def confirm_subscription(subscription_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_subscription = db.query(DBSubscription).filter(DBSubscription.id == subscription_id, DBSubscription.user_id == current_user.id).first()
    if not db_subscription:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subscription not found")

    # Only allow confirmation from 'draft' or 'quotation' status
    if db_subscription.status not in ["draft", "quotation"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Subscription cannot be confirmed from status '{db_subscription.status}'")

    plan = db.query(DBPlan).filter(DBPlan.id == db_subscription.plan_id).first()
    if not plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Associated plan not found")

    # Re-calculate totals from current subscription lines for confirmation (Confirmation Engine Step 1)
    # Ensure subscription_lines are loaded
    db.refresh(db_subscription, attribute_names=['subscription_lines'])

    subtotal = 0.0
    tax_total = 0.0
    discount_total = 0.0
    grand_total = 0.0

    if not db_subscription.subscription_lines:
         raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot confirm subscription without any subscription lines.")

    for line in db_subscription.subscription_lines:
        # Recalculate line totals just in case (e.g., if price/quantity were updated directly)
        line_subtotal = line.unit_price_snapshot * line.quantity
        line_discount_amount = line_subtotal * (line.discount_percent / 100.0)
        line_tax_amount = (line_subtotal - line_discount_amount) * (line.tax_percent / 100.0)
        
        current_line_total = line_subtotal - line_discount_amount + line_tax_amount
        
        subtotal += line_subtotal
        tax_total += line_tax_amount
        discount_total += line_discount_amount
        grand_total += current_line_total

    db_subscription.subtotal = subtotal
    db_subscription.tax_total = tax_total
    db_subscription.discount_total = discount_total
    db_subscription.grand_total = grand_total
    db_subscription.status = "active" # Set status to active upon confirmation
    db_subscription.confirmed_at = datetime.utcnow() # Record confirmation time

    # Set next billing date (Confirmation Engine Step 2)
    # Use plan's billing_period from the current plan
    db_subscription.next_billing_date = calculate_next_billing_date(db_subscription.start_date, plan.billing_period)
    
    # NOTE: No commit here, we want to do everything in one transaction

    # Generate Invoice (Confirmation Engine Step 3)
    # Improved Invoice Numbering: INV-YYYYMMDD-{SubscriptionID}-{RandomSuffix}
    today_str = date.today().strftime("%Y%m%d")
    random_suffix = random.randint(100, 999)
    invoice_number = f"INV-{today_str}-{db_subscription.id}-{random_suffix}"
    
    new_invoice = DBInvoice(
        invoice_number=invoice_number,
        subscription_id=db_subscription.id,
        customer_id=db_subscription.customer_id, # Link customer from subscription
        issue_date=date.today(),
        due_date=date.today() + timedelta(days=30), # Example: due in 30 days
        status="pending", # Initial status for the invoice
        subtotal=db_subscription.subtotal,
        tax_total=db_subscription.tax_total,
        discount_total=db_subscription.discount_total,
        grand_total=db_subscription.grand_total,
        user_id=current_user.id
    )
    db.add(new_invoice)
    db.flush() # Flush to generate new_invoice.id without committing transaction
    
    # Create Invoice Lines from Subscription Lines
    for sub_line in db_subscription.subscription_lines:
        db_invoice_line = DBInvoiceLine(
            invoice_id=new_invoice.id,
            product_name=sub_line.product_name_snapshot,
            unit_price=sub_line.unit_price_snapshot,
            quantity=sub_line.quantity,
            tax_percent=sub_line.tax_percent,
            discount_percent=sub_line.discount_percent,
            line_total=sub_line.line_total
        )
        db.add(db_invoice_line)
    
    # Validate final state before commit
    # e.g., check if grand_total matches
    
    try:
        db.commit()
        db.refresh(db_subscription)
        # db.refresh(new_invoice) # Optional if we needed to return the invoice
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Transaction failed: {str(e)}")

    return SubscriptionConfirm(
        status=db_subscription.status,
        next_billing_date=db_subscription.next_billing_date,
        confirmed_at=db_subscription.confirmed_at,
        subtotal=db_subscription.subtotal,
        tax_total=db_subscription.tax_total,
        discount_total=db_subscription.discount_total,
        grand_total=db_subscription.grand_total
    )

@router.post("/process-renewals", status_code=status.HTTP_200_OK)
def process_renewals(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Check for active subscriptions that are due for renewal (next_billing_date <= today).
    Generate new invoices for them and advance the billing date.
    Scoped to current_user.
    """
    today = date.today()
    
    # 1. Find active subscriptions due for renewal belonging to current user
    due_subscriptions = db.query(DBSubscription).filter(
        DBSubscription.status == "active",
        DBSubscription.next_billing_date <= today,
        DBSubscription.user_id == current_user.id
    ).all()
    
    processed_count = 0
    errors = []

    for sub in due_subscriptions:
        try:
            # Check if subscription has an end_date and if we passed it
            if sub.end_date and sub.next_billing_date > sub.end_date:
                sub.status = "closed"
                sub.closed_at = datetime.utcnow()
                db.add(sub)
                continue

            # Generate Invoice for the next period
            today_str = date.today().strftime("%Y%m%d")
            random_suffix = random.randint(100, 999)
            invoice_number = f"INV-{today_str}-{sub.id}-{random_suffix}"
            
            new_invoice = DBInvoice(
                invoice_number=invoice_number,
                subscription_id=sub.id,
                customer_id=sub.customer_id,
                issue_date=today,
                due_date=today + timedelta(days=30), # Default 30 days due
                status="pending",
                subtotal=sub.subtotal,
                tax_total=sub.tax_total,
                discount_total=sub.discount_total,
                grand_total=sub.grand_total,
                user_id=current_user.id
            )
            db.add(new_invoice)
            db.flush() 

            # Create Invoice Lines (Clone from Subscription Lines)
            # Ensure lines are loaded
            if not sub.subscription_lines:
                 db.refresh(sub, attribute_names=['subscription_lines'])

            for sub_line in sub.subscription_lines:
                db_invoice_line = DBInvoiceLine(
                    invoice_id=new_invoice.id,
                    product_name=sub_line.product_name_snapshot,
                    unit_price=sub_line.unit_price_snapshot,
                    quantity=sub_line.quantity,
                    tax_percent=sub_line.tax_percent,
                    discount_percent=sub_line.discount_percent,
                    line_total=sub_line.line_total
                )
                db.add(db_invoice_line)
            
            # Advance next_billing_date
            # We need the plan to know the interval
            if not sub.plan:
                 db.refresh(sub, attribute_names=['plan'])
            
            sub.next_billing_date = calculate_next_billing_date(sub.next_billing_date, sub.plan.billing_period)
            
            db.commit() # Commit per subscription to isolate failures
            processed_count += 1
            
        except Exception as e:
            db.rollback()
            errors.append(f"Failed to renew Subscription {sub.id}: {str(e)}")

    return {
        "processed_count": processed_count,
        "errors": errors
    }

@router.patch("/{subscription_id}/cancel", response_model=Subscription)
def cancel_subscription(subscription_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_subscription = db.query(DBSubscription).filter(DBSubscription.id == subscription_id, DBSubscription.user_id == current_user.id).first()
    if not db_subscription:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subscription not found")

    if db_subscription.status not in ["active", "confirmed"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Cannot cancel subscription in status '{db_subscription.status}'")

    db_subscription.status = "cancelled"
    # Optionally set end_date to today effectively validating the cancellation immediately
    db_subscription.closed_at = datetime.utcnow()
    
    db.commit()
    db.refresh(db_subscription)
    
    return db_subscription

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import date, timedelta, datetime
import random # For generating invoice_number for now

from ..database import get_db
from ..models import Subscription as DBSubscription, Plan as DBPlan, Invoice as DBInvoice, SubscriptionLine as DBSubscriptionLine, InvoiceLine as DBInvoiceLine, Product as DBProduct, User, Customer as DBCustomer
from ..schemas import Subscription, SubscriptionCreate, SubscriptionConfirm, SubscriptionLineCreate, InvoiceCreate, InvoiceLineCreate, Invoice
from ..auth_utils import get_current_user

router = APIRouter()

@router.get("/", response_model=List[Subscription], tags=["subscriptions"])
def read_subscriptions(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.mode == 'portal':
         subscriptions = db.query(DBSubscription).join(DBCustomer).filter(DBCustomer.portal_user_id == current_user.id).offset(skip).limit(limit).all()
    else:
         # Filter subscriptions where the customer is owned by the current user
         subscriptions = db.query(DBSubscription).join(DBCustomer).filter(DBCustomer.owner_id == current_user.id).offset(skip).limit(limit).all()
    return subscriptions

@router.get("/{subscription_id}", response_model=Subscription, tags=["subscriptions"])
def read_subscription(subscription_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    subscription = db.query(DBSubscription).join(DBCustomer).filter(DBSubscription.id == subscription_id).first()
    if not subscription:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subscription not found")
    
    # Verify ownership
    if current_user.mode == 'portal':
         if subscription.customer.portal_user_id != current_user.id:
             raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subscription not found")
    elif subscription.customer.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subscription not found")
        
    return subscription


def calculate_next_billing_date(start_date: date, interval: str) -> date:
    if interval == "monthly":
        months_to_add = 1
    elif interval == "quarterly":
        months_to_add = 3
    elif interval == "yearly":
        return date(start_date.year + 1, start_date.month, start_date.day)
    else:
        raise ValueError(f"Unknown interval: {interval}")

    # For monthly and quarterly, handle month/year wrapping
    next_month = start_date.month + months_to_add
    next_year = start_date.year
    while next_month > 12:
        next_month -= 12
        next_year += 1
    
    # Try to keep the same day of the month, but adjust if it's past the end of the destination month
    try:
        return date(next_year, next_month, start_date.day)
    except ValueError:
        # If the day is invalid for the target month (e.g. Jan 31 -> Feb), 
        # find the last day of that month
        if next_month == 12:
            return date(next_year + 1, 1, 1) - timedelta(days=1)
        else:
            return date(next_year, next_month + 1, 1) - timedelta(days=1)

@router.post("/", response_model=Subscription, status_code=status.HTTP_201_CREATED)
def create_subscription(subscription: SubscriptionCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Validate Customer
    if not subscription.customer_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Customer ID is required")

    customer = db.query(DBCustomer).filter(DBCustomer.id == subscription.customer_id, DBCustomer.owner_id == current_user.id).first()
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")

    # Validate Plan ownership
    plan = db.query(DBPlan).filter(DBPlan.id == subscription.plan_id, DBPlan.owner_id == current_user.id).first()
    if not plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plan not found")

    # Calculate totals from subscription lines
    subtotal = 0.0
    tax_total = 0.0
    discount_total = 0.0
    grand_total = 0.0

    for line_data in subscription.subscription_lines:
        # Validate Product ownership
        product = db.query(DBProduct).filter(DBProduct.id == line_data.product_id, DBProduct.owner_id == current_user.id).first()
        if not product:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Product with ID {line_data.product_id} not found")
        
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
        customer_id=customer.id, # Use validated customer ID
        plan_id=subscription.plan_id,
        status=subscription.status,
        start_date=subscription.start_date,
        end_date=subscription.end_date,
        payment_terms=subscription.payment_terms,
        subtotal=subtotal,
        tax_total=tax_total,
        discount_total=discount_total,
        grand_total=grand_total,
        created_at=datetime.utcnow()
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

@router.patch("/{subscription_id}/confirm", response_model=SubscriptionConfirm)
def confirm_subscription(subscription_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        db_subscription = db.query(DBSubscription).filter(DBSubscription.id == subscription_id).first()
        if not db_subscription:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subscription not found")

        # Verify ownership via Customer
        # We need to join with Customer or access the relationship
        if db_subscription.customer.owner_id != current_user.id:
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
        
        db.commit()
        db.refresh(db_subscription)

        # Generate Invoice (Confirmation Engine Step 3)
        # Generate a unique invoice number (simple random for now, should be sequential in production)
        invoice_number = f"INV-{random.randint(100000, 999999)}-{db_subscription.id}"
        
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
            grand_total=db_subscription.grand_total
        )
        db.add(new_invoice)
        db.commit()
        db.refresh(new_invoice)

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
        
        db.commit()
        db.refresh(new_invoice) # Refresh invoice to load new lines

        return SubscriptionConfirm(
            status=db_subscription.status,
            invoice_id=new_invoice.id, # Include invoice_id in the response
            next_billing_date=db_subscription.next_billing_date,
            confirmed_at=db_subscription.confirmed_at,
            subtotal=db_subscription.subtotal,
            tax_total=db_subscription.tax_total,
            discount_total=db_subscription.discount_total,
            grand_total=db_subscription.grand_total
        )
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

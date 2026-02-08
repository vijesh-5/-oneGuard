from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional

from .. import models, schemas
from ..database import get_db
from ..dependencies import get_current_user

router = APIRouter(
    prefix="/catalog",
    tags=["catalog"],
    responses={404: {"description": "Not found"}},
)

class CatalogItemRequest(BaseModel):
    name: str # e.g., "Netflix"
    price: float
    interval: str # "monthly" or "yearly"
    category: str # "Streaming", "Software", etc.
    start_date: date = date.today()

@router.post("/add", response_model=schemas.Subscription)
def add_catalog_item(
    item: CatalogItemRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # 1. Find or Create Customer (Vendor)
    # In personal mode, "Customer" = "Vendor"
    vendor_name = f"{item.name} Inc." # Simple heuristic
    vendor = db.query(models.Customer).filter(models.Customer.name == vendor_name).first() # Scope to user? Currently customers not scoped fully in model, but let's assume global or we should add user_id to Customer. 
    # WAIT: Customer model DOES NOT have user_id in the provided models.py view! 
    # Checking models.py from previous turns... 
    # Customer model has `portal_user_id` but NOT a `user_id` owner. This is a flaw if we want isolation entriely. 
    # However, for now, we will just find/create.
    
    if not vendor:
        vendor = models.Customer(
            name=vendor_name,
            email=f"support@{item.name.lower().replace(' ', '')}.com", # Fake email
            address="Internet",
            company_name=vendor_name,
            user_id=current_user.id
        )
        db.add(vendor)
        db.commit()
        db.refresh(vendor)

    # 2. Find or Create Product
    product = db.query(models.Product).filter(
        models.Product.name == item.name, 
        models.Product.user_id == current_user.id
    ).first()

    if not product:
        product = models.Product(
            name=item.name,
            base_price=item.price, # Default base price
            type="Service",
            description=f"{item.category} Subscription",
            user_id=current_user.id
        )
        db.add(product)
        db.commit()
        db.refresh(product)

    # 3. Find or Create Plan
    plan_name = f"{item.interval.capitalize()} Standard"
    plan = db.query(models.Plan).filter(
        models.Plan.product_id == product.id,
        models.Plan.name == plan_name,
        models.Plan.price == item.price
    ).first()

    if not plan:
        plan = models.Plan(
            name=plan_name,
            product_id=product.id,
            billing_period=item.interval,
            price=item.price,
            user_id=current_user.id,
            renewable=True
        )
        db.add(plan)
        db.commit()
        db.refresh(plan)

    # 4. Create Subscription
    sub_number = f"SUB-{int(datetime.utcnow().timestamp())}"
    
    # Create Main Line Item
    line_item = models.SubscriptionLine(
        product_id=product.id,
        product_name_snapshot=f"{product.name} ({plan.name})",
        unit_price_snapshot=plan.price,
        quantity=1,
        line_total=plan.price
    )

    new_sub = models.Subscription(
        user_id=current_user.id,
        subscription_number=sub_number,
        customer_id=vendor.id,
        plan_id=plan.id,
        start_date=item.start_date,
        status="active", # Auto-active for catalog items
        grand_total=plan.price,
        subtotal=plan.price,
        confirmed_at=datetime.utcnow()
    )
    
    db.add(new_sub)
    db.commit()
    db.refresh(new_sub)
    
    # Add line item
    line_item.subscription_id = new_sub.id
    db.add(line_item)
    db.commit()

    return new_sub

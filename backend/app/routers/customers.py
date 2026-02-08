from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from .. import models, schemas
from ..database import get_db
from ..dependencies import get_current_user

router = APIRouter(
    prefix="/customers",
    tags=["customers"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=schemas.Customer)
def create_customer(
    customer: schemas.CustomerCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Check if customer email already exists for this user (optional, but good practice)
    db_customer = db.query(models.Customer).filter(
        models.Customer.user_id == current_user.id,
        models.Customer.email == customer.email
    ).first()
    
    if db_customer:
        raise HTTPException(status_code=400, detail="Customer with this email already exists")

    new_customer = models.Customer(**customer.dict(), user_id=current_user.id)
    db.add(new_customer)
    db.commit()
    db.refresh(new_customer)
    return new_customer

@router.get("/", response_model=List[schemas.Customer])
def read_customers(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    customers = db.query(models.Customer).filter(models.Customer.user_id == current_user.id).offset(skip).limit(limit).all()
    return customers

@router.get("/{customer_id}", response_model=schemas.Customer)
def read_customer(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    customer = db.query(models.Customer).filter(
        models.Customer.id == customer_id,
        models.Customer.user_id == current_user.id
    ).first()
    if customer is None:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer

@router.delete("/{customer_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_customer(customer_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    customer = db.query(models.Customer).filter(
        models.Customer.id == customer_id,
        models.Customer.user_id == current_user.id
    ).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    db.delete(customer)
    db.commit()
    return None

class CustomerLinkRequest(BaseModel):
    email: str

@router.post("/{customer_id}/link-user", response_model=schemas.Customer)
def link_portal_user(customer_id: int, link_request: CustomerLinkRequest, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Verify customer exists and belongs to the current user
    customer = db.query(models.Customer).filter(
        models.Customer.id == customer_id,
        models.Customer.user_id == current_user.id
    ).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found or does not belong to you")
    
    # Verify user exists
    user_to_link = db.query(models.User).filter(models.User.email == link_request.email).first()
    if not user_to_link:
        raise HTTPException(status_code=404, detail="User with this email not found. User must register first.")
    
    # Check if user is already linked to another customer? (Optional constraint)
    # existing_link = db.query(models.Customer).filter(models.Customer.portal_user_id == user_to_link.id).first()
    # if existing_link and existing_link.id != customer_id:
    #     raise HTTPException(status_code=400, detail="User is already linked to another customer.")

    customer.portal_user_id = user_to_link.id
    
    # Update user mode to 'client' so they see the portal
    user_to_link.mode = 'client'
    
    db.commit()
    db.refresh(customer)
    return customer

@router.put("/{customer_id}", response_model=schemas.Customer)
def update_customer(
    customer_id: int,
    customer_update: schemas.CustomerCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    db_customer = db.query(models.Customer).filter(
        models.Customer.id == customer_id,
        models.Customer.user_id == current_user.id
    ).first()
    
    if db_customer is None:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    for key, value in customer_update.dict().items():
        setattr(db_customer, key, value)
    
    db.commit()
    db.refresh(db_customer)
    return db_customer

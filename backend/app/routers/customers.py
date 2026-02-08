from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas
from ..database import get_db
from ..auth_utils import get_current_user, get_password_hash
import secrets
import string

router = APIRouter(
    prefix="/customers",
    tags=["customers"],
    responses={404: {"description": "Not found"}},
)

@router.get("/", response_model=List[schemas.Customer])
def read_customers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    customers = db.query(models.Customer).filter(models.Customer.owner_id == current_user.id).offset(skip).limit(limit).all()
    return customers

@router.post("/", response_model=schemas.Customer, status_code=status.HTTP_201_CREATED)
def create_customer(customer: schemas.CustomerCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_customer = models.Customer(**customer.dict(), owner_id=current_user.id)
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    return db_customer

@router.get("/{customer_id}", response_model=schemas.Customer)
def read_customer(customer_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    customer = db.query(models.Customer).filter(models.Customer.id == customer_id, models.Customer.owner_id == current_user.id).first()
    if customer is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")
    return customer

@router.post("/{customer_id}/invite", response_model=schemas.CustomerInviteResponse)
def invite_customer(customer_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    customer = db.query(models.Customer).filter(models.Customer.id == customer_id, models.Customer.owner_id == current_user.id).first()
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")
    
    if customer.portal_user_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Customer already has a portal account")

    # Create Portal User
    alphabet = string.ascii_letters + string.digits
    password = ''.join(secrets.choice(alphabet) for i in range(12))
    hashed_password = get_password_hash(password)
    
    # Ensure unique username
    base_username = customer.email.split('@')[0]
    username = base_username
    counter = 1
    while db.query(models.User).filter(models.User.username == username).first():
        username = f"{base_username}{counter}"
        counter += 1

    # Check if email is already taken by a regular user
    existing_user_email = db.query(models.User).filter(models.User.email == customer.email).first()
    email = customer.email
    if existing_user_email:
        email = f"{base_username}+{counter}@example.com" 

    portal_user = models.User(
        username=username,
        email=email,
        hashed_password=hashed_password,
        mode="portal"
    )
    
    try:
        db.add(portal_user)
        db.commit()
        db.refresh(portal_user)
    except Exception:
        db.rollback()
        # Retry with modified email if unique constraint failed in race condition
        portal_user.email = f"portal_{customer.id}_{customer.email}"
        db.add(portal_user)
        db.commit()
        db.refresh(portal_user)

    # Link to Customer
    customer.portal_user_id = portal_user.id
    db.commit()

    return {
        "username": username,
        "password": password,
        "portal_url": "http://localhost:5173/login" 
    }

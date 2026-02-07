from pydantic import BaseModel
from typing import Optional
from datetime import date

class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    message: str
    access_token: Optional[str] = None
    token_type: str = "bearer"

class ProductBase(BaseModel):
    name: str
    base_price: float

class ProductCreate(ProductBase):
    pass

class Product(ProductBase):
    id: int

    class Config:
        orm_mode = True

class PlanBase(BaseModel):
    product_id: int
    name: str
    interval: str
    price: float

class PlanCreate(PlanBase):
    pass

class Plan(PlanBase):
    id: int

    class Config:
        orm_mode = True

class SubscriptionBase(BaseModel):
    customer_name: str
    plan_id: int

class SubscriptionCreate(SubscriptionBase):
    pass

class Subscription(SubscriptionBase):
    id: int
    status: str
    start_date: date
    next_billing_date: date

    class Config:
        orm_mode = True

class SubscriptionConfirm(BaseModel):
    status: str
    next_billing_date: date

class InvoiceBase(BaseModel):
    subscription_id: int
    amount: float
    status: str = "pending"
    invoice_date: date
    due_date: date

class InvoiceCreate(InvoiceBase):
    pass

class Invoice(InvoiceBase):
    id: int

    class Config:
        orm_mode = True

from pydantic import BaseModel
from typing import List, Optional
from datetime import date, datetime # Import datetime for Product schema

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
    type: Optional[str] = None
    description: Optional[str] = None
    is_active: bool = True

class ProductCreate(ProductBase):
    pass

class Product(ProductBase):
    id: int
    created_at: datetime # This will be set by the database

    class Config:
        orm_mode = True

class PlanBase(BaseModel):
    product_id: int
    name: str
    billing_period: str
    price: float
    min_quantity: int = 1
    auto_close: bool = False
    pausable: bool = False
    renewable: bool = True
    start_date: Optional[date] = None
    end_date: Optional[date] = None

class PlanCreate(PlanBase):
    pass

class Plan(PlanBase):
    id: int

    class Config:
        orm_mode = True

class SubscriptionBase(BaseModel):
    subscription_number: str
    customer_id: int
    plan_id: int
    status: str = "draft" # "draft", "quotation", "confirmed", "active", "closed"
    start_date: date
    end_date: Optional[date] = None
    payment_terms: Optional[str] = None

class SubscriptionCreate(SubscriptionBase):
    subscription_lines: List["SubscriptionLineCreate"] = [] # New field

class Subscription(SubscriptionBase):
    id: int
    next_billing_date: Optional[date] = None
    subtotal: float = 0.0
    tax_total: float = 0.0
    discount_total: float = 0.0
    grand_total: float = 0.0
    created_at: datetime
    confirmed_at: Optional[datetime] = None
    closed_at: Optional[datetime] = None
    subscription_lines: List["SubscriptionLine"] = [] # Add subscription lines
    invoices: List["Invoice"] = [] # Add invoices to response

    class Config:
        orm_mode = True

class SubscriptionConfirm(BaseModel):
    status: str
    next_billing_date: Optional[date] = None
    confirmed_at: Optional[datetime] = None
    subtotal: float = 0.0
    tax_total: float = 0.0
    discount_total: float = 0.0
    grand_total: float = 0.0

class SubscriptionLineBase(BaseModel):
    product_id: Optional[int] = None
    product_name_snapshot: str
    unit_price_snapshot: float
    quantity: int
    tax_percent: float = 0.0
    discount_percent: float = 0.0
    line_total: float

class SubscriptionLineCreate(SubscriptionLineBase):
    pass

class SubscriptionLine(SubscriptionLineBase):
    id: int
    subscription_id: int

    class Config:
        orm_mode = True


class InvoiceBase(BaseModel):
    invoice_number: str
    subscription_id: int
    customer_id: int
    issue_date: date
    due_date: date
    status: str = "draft" # "draft", "confirmed", "paid", "cancelled"
    subtotal: float = 0.0
    tax_total: float = 0.0
    discount_total: float = 0.0
    grand_total: float = 0.0

class InvoiceCreate(InvoiceBase):
    pass

class Invoice(InvoiceBase):
    id: int
    invoice_lines: List["InvoiceLine"] = [] # Add invoice lines
    payments: List["Payment"] = [] # Add payments

    class Config:
        orm_mode = True

class InvoiceLineBase(BaseModel):
    product_name: str
    unit_price: float
    quantity: int
    tax_percent: float = 0.0
    discount_percent: float = 0.0
    line_total: float

class InvoiceLineCreate(InvoiceLineBase):
    pass

class InvoiceLine(InvoiceLineBase):
    id: int
    invoice_id: int

    class Config:
        orm_mode = True

class PaymentBase(BaseModel):
    invoice_id: int
    amount: float
    method: str
    reference_id: Optional[str] = None
    status: str = "pending"
    payment_date: Optional[datetime] = None

class PaymentCreate(PaymentBase):
    pass

class Payment(PaymentBase):
    id: int
    invoice_id: int # Linked to Invoice

    class Config:
        orm_mode = True

# --- Auth Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class UserBase(BaseModel):
    email: str

class UserCreate(UserBase):
    password: str
    mode: str = "business"

class User(UserBase):
    id: int
    is_active: bool
    mode: str

    class Config:
        orm_mode = True

class TaxBase(BaseModel):
    name: str
    percent: float
    is_active: bool = True

class TaxCreate(TaxBase):
    pass

class Tax(TaxBase):
    id: int

    class Config:
        orm_mode = True

class DiscountBase(BaseModel):
    name: str
    type: str
    value: float
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    usage_limit: Optional[int] = None

class DiscountCreate(DiscountBase):
    pass

class Discount(DiscountBase):
    id: int

    class Config:
        orm_mode = True

class PaymentBase(BaseModel):
    invoice_id: int
    amount: float
    method: str
    reference_id: Optional[str] = None
    status: str = "pending"
    payment_date: Optional[datetime] = None

class PaymentCreate(PaymentBase):
    pass

class Payment(PaymentBase):
    id: int

    class Config:
        orm_mode = True

    class Config:
        orm_mode = True

class CustomerBase(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    company_name: Optional[str] = None
    address: Optional[str] = None
    portal_user_id: Optional[int] = None

class CustomerCreate(CustomerBase):
    pass

class Customer(CustomerBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True



Subscription.update_forward_refs()

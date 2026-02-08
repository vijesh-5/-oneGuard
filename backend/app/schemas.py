from pydantic import BaseModel
from typing import List, Optional
from datetime import date, datetime # Import datetime for Product schema

# User Schemas
class UserBase(BaseModel):
    username: str
    email: str

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        orm_mode = True

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class LoginRequest(BaseModel):
    username: str
    password: str

# LoginResponse is replaced by Token for successful logins, but we might keep it for error messages if needed.
# For now, let's assume successful login directly returns Token.

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
    customer_id: Optional[int] = None
    plan_id: int
    status: str = "draft" # "draft", "quotation", "confirmed", "active", "closed"
    start_date: date
    end_date: Optional[date] = None
    payment_terms: Optional[str] = None

class SubscriptionCreate(SubscriptionBase):
    subscription_lines: List["SubscriptionLineCreate"] = [] # New field

class Subscription(SubscriptionBase):
    id: int
    customer_id: int # Override to be required in response if needed, but Optional is fine for base
    next_billing_date: Optional[date] = None
    subtotal: float = 0.0
    tax_total: float = 0.0
    discount_total: float = 0.0
    grand_total: float = 0.0
    created_at: datetime
    confirmed_at: Optional[datetime] = None
    closed_at: Optional[datetime] = None
    subscription_lines: List["SubscriptionLine"] = [] # Add subscription lines

    class Config:
        orm_mode = True

class SubscriptionConfirm(BaseModel):
    status: str
    invoice_id: int # Added for frontend redirect
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
    customer_id: Optional[int] = None
    issue_date: date
    due_date: date
    status: str = "draft" # "draft", "confirmed", "paid", "cancelled"
    subtotal: float = 0.0
    tax_total: float = 0.0
    discount_total: float = 0.0
    grand_total: float = 0.0
    payment_method: Optional[str] = None # NEW
    paid_date: Optional[date] = None # NEW

class InvoiceCreate(InvoiceBase):
    pass

class InvoicePay(BaseModel):
    payment_method: str

class InvoiceUpdate(BaseModel): # NEW
    status: Optional[str] = None
    payment_method: Optional[str] = None
    paid_date: Optional[date] = None

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
    payment_date: datetime

class PaymentCreate(PaymentBase):
    pass

class Payment(PaymentBase):
    id: int

    class Config:
        orm_mode = True





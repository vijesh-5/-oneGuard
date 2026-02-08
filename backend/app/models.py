from sqlalchemy import Column, Integer, String, Float, ForeignKey, Date, Boolean, DateTime
from sqlalchemy.orm import relationship # Import relationship
from datetime import datetime # Import datetime for created_at default
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    subscriptions = relationship("Subscription", back_populates="customer")
    invoices = relationship("Invoice", back_populates="customer")


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    base_price = Column(Float)
    # New fields
    type = Column(String)
    description = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    plans = relationship("Plan", back_populates="product") # Add relationship to plans

class Plan(Base):
    __tablename__ = "plans"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    name = Column(String, index=True) # e.g., "Monthly Basic"
    billing_period = Column(String) # daily / weekly / monthly / yearly
    price = Column(Float) # The existing price field is reused
    min_quantity = Column(Integer, default=1)
    auto_close = Column(Boolean, default=False)
    pausable = Column(Boolean, default=False)
    renewable = Column(Boolean, default=True)
    start_date = Column(Date, nullable=True) # Plan availability start
    end_date = Column(Date, nullable=True)   # Plan availability end

    product = relationship("Product", back_populates="plans") # Add relationship to product

class Subscription(Base):
    __tablename__ = "subscriptions"
    id = Column(Integer, primary_key=True, index=True)
    subscription_number = Column(String, unique=True, index=True)
    customer_id = Column(Integer, ForeignKey("users.id")) # Link to User model

    status = Column(String, default="draft") # "draft", "quotation", "confirmed", "active", "closed" (expanded states)
    start_date = Column(Date)
    end_date = Column(Date, nullable=True) # NEW
    next_billing_date = Column(Date, nullable=True) # Can be null if not yet active or closed

    payment_terms = Column(String, nullable=True) # NEW

    subtotal = Column(Float, default=0.0) # NEW
    tax_total = Column(Float, default=0.0) # NEW
    discount_total = Column(Float, default=0.0) # NEW
    grand_total = Column(Float, default=0.0) # NEW

    created_at = Column(DateTime, default=datetime.utcnow) # NEW, for record creation
    confirmed_at = Column(DateTime, nullable=True) # NEW
    closed_at = Column(DateTime, nullable=True) # NEW

    plan_id = Column(Integer, ForeignKey("plans.id"))
    plan = relationship("Plan")
    invoices = relationship("Invoice", back_populates="subscription") # Add relationship to invoices
    subscription_lines = relationship("SubscriptionLine", back_populates="subscription") # NEW relationship
    customer = relationship("User", back_populates="subscriptions") # Relationship to User

class SubscriptionLine(Base):
    __tablename__ = "subscription_lines"

    id = Column(Integer, primary_key=True, index=True)
    subscription_id = Column(Integer, ForeignKey("subscriptions.id"))
    product_id = Column(Integer, ForeignKey("products.id"), nullable=True) # Snapshot: can be null if product is deleted
    product_name_snapshot = Column(String)
    unit_price_snapshot = Column(Float)
    quantity = Column(Integer)
    tax_percent = Column(Float, default=0.0)
    discount_percent = Column(Float, default=0.0)
    line_total = Column(Float)

    subscription = relationship("Subscription", back_populates="subscription_lines")
    product = relationship("Product") # Optional: to get current product info if needed


class Invoice(Base):
    __tablename__ = "invoices"
    id = Column(Integer, primary_key=True, index=True)
    invoice_number = Column(String, unique=True, index=True) # NEW
    subscription_id = Column(Integer, ForeignKey("subscriptions.id"))
    customer_id = Column(Integer, ForeignKey("users.id")) # Link to User model

    issue_date = Column(Date) # Renamed from invoice_date
    due_date = Column(Date)

    status = Column(String, default="draft") # NEW states: "draft", "confirmed", "paid", "cancelled"

    paid_date = Column(Date, nullable=True) # NEW

    subtotal = Column(Float, default=0.0) # NEW
    tax_total = Column(Float, default=0.0) # NEW
    discount_total = Column(Float, default=0.0) # NEW
    grand_total = Column(Float, default=0.0) # NEW

    subscription = relationship("Subscription", back_populates="invoices")
    invoice_lines = relationship("InvoiceLine", back_populates="invoice") # NEW relationship
    payments = relationship("Payment", back_populates="invoice") # NEW relationship
    customer = relationship("User", back_populates="invoices") # Relationship to User

class InvoiceLine(Base):
    __tablename__ = "invoice_lines"

    id = Column(Integer, primary_key=True, index=True)
    invoice_id = Column(Integer, ForeignKey("invoices.id"))
    product_name = Column(String)
    unit_price = Column(Float)
    quantity = Column(Integer)
    tax_percent = Column(Float, default=0.0)
    discount_percent = Column(Float, default=0.0)
    line_total = Column(Float)

    invoice = relationship("Invoice", back_populates="invoice_lines")

class Tax(Base):
    __tablename__ = "taxes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    percent = Column(Float)
    is_active = Column(Boolean, default=True)

class Discount(Base):
    __tablename__ = "discounts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    type = Column(String) # e.g., "percentage", "fixed_amount"
    value = Column(Float)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    usage_limit = Column(Integer, nullable=True)

class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    invoice_id = Column(Integer, ForeignKey("invoices.id"))
    amount = Column(Float)
    method = Column(String) # e.g., "cash", "card", "upi", "netbanking"
    reference_id = Column(String, nullable=True)
    status = Column(String, default="pending") # e.g., "pending", "success", "failed"
    payment_date = Column(DateTime, default=datetime.utcnow)

    invoice = relationship("Invoice", back_populates="payments")


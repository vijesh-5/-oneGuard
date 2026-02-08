from sqlalchemy import Column, Integer, String, Float, ForeignKey, Date, Boolean, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    mode = Column(String, default="business") # 'business' or 'personal'

    # Relationships
    owned_customers = relationship("Customer", foreign_keys="Customer.owner_id", back_populates="owner")
    # For portal users, this links to the customer record they represent
    customer_profile = relationship("Customer", foreign_keys="Customer.portal_user_id", back_populates="portal_user", uselist=False)

class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id")) # The business user who owns this customer record
    name = Column(String, index=True)
    email = Column(String, index=True)
    portal_user_id = Column(Integer, ForeignKey("users.id"), nullable=True) # Optional link to a real user for portal access

    owner = relationship("User", foreign_keys=[owner_id], back_populates="owned_customers")
    portal_user = relationship("User", foreign_keys=[portal_user_id], back_populates="customer_profile")
    
    subscriptions = relationship("Subscription", back_populates="customer")
    invoices = relationship("Invoice", back_populates="customer")

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    base_price = Column(Float)
    type = Column(String)
    description = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=True) # owner_id added for multi-tenancy

    owner = relationship("User")
    plans = relationship("Plan", back_populates="product")

class Plan(Base):
    __tablename__ = "plans"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    name = Column(String, index=True)
    billing_period = Column(String)
    price = Column(Float)
    min_quantity = Column(Integer, default=1)
    auto_close = Column(Boolean, default=False)
    pausable = Column(Boolean, default=False)
    renewable = Column(Boolean, default=True)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=True) # owner_id added for multi-tenancy

    owner = relationship("User")
    product = relationship("Product", back_populates="plans")

class Subscription(Base):
    __tablename__ = "subscriptions"
    id = Column(Integer, primary_key=True, index=True)
    subscription_number = Column(String, unique=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id")) # Re-pointed to customers
    
    status = Column(String, default="draft")
    start_date = Column(Date)
    end_date = Column(Date, nullable=True)
    next_billing_date = Column(Date, nullable=True)
    payment_terms = Column(String, nullable=True)

    subtotal = Column(Float, default=0.0)
    tax_total = Column(Float, default=0.0)
    discount_total = Column(Float, default=0.0)
    grand_total = Column(Float, default=0.0)

    created_at = Column(DateTime, default=datetime.utcnow)
    confirmed_at = Column(DateTime, nullable=True)
    closed_at = Column(DateTime, nullable=True)

    plan_id = Column(Integer, ForeignKey("plans.id"))
    plan = relationship("Plan")
    invoices = relationship("Invoice", back_populates="subscription")
    subscription_lines = relationship("SubscriptionLine", back_populates="subscription")
    customer = relationship("Customer", back_populates="subscriptions") # Relationship to Customer

class SubscriptionLine(Base):
    __tablename__ = "subscription_lines"

    id = Column(Integer, primary_key=True, index=True)
    subscription_id = Column(Integer, ForeignKey("subscriptions.id"))
    product_id = Column(Integer, ForeignKey("products.id"), nullable=True)
    product_name_snapshot = Column(String)
    unit_price_snapshot = Column(Float)
    quantity = Column(Integer)
    tax_percent = Column(Float, default=0.0)
    discount_percent = Column(Float, default=0.0)
    line_total = Column(Float)

    subscription = relationship("Subscription", back_populates="subscription_lines")
    product = relationship("Product")

class Invoice(Base):
    __tablename__ = "invoices"
    id = Column(Integer, primary_key=True, index=True)
    invoice_number = Column(String, unique=True, index=True)
    subscription_id = Column(Integer, ForeignKey("subscriptions.id"))
    customer_id = Column(Integer, ForeignKey("customers.id")) # Re-pointed to customers

    issue_date = Column(Date)
    due_date = Column(Date)
    status = Column(String, default="draft")
    paid_date = Column(Date, nullable=True)

    subtotal = Column(Float, default=0.0)
    tax_total = Column(Float, default=0.0)
    discount_total = Column(Float, default=0.0)
    grand_total = Column(Float, default=0.0)

    subscription = relationship("Subscription", back_populates="invoices")
    invoice_lines = relationship("InvoiceLine", back_populates="invoice")
    payments = relationship("Payment", back_populates="invoice")
    customer = relationship("Customer", back_populates="invoices") # Relationship to Customer

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
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=True) # owner_id added for multi-tenancy

    owner = relationship("User")

class Discount(Base):
    __tablename__ = "discounts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    type = Column(String)
    value = Column(Float)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    usage_limit = Column(Integer, nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=True) # owner_id added for multi-tenancy

    owner = relationship("User")

class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    invoice_id = Column(Integer, ForeignKey("invoices.id"))
    amount = Column(Float)
    method = Column(String)
    reference_id = Column(String, nullable=True)
    status = Column(String, default="pending")
    payment_date = Column(DateTime, default=datetime.utcnow)

    invoice = relationship("Invoice", back_populates="payments")


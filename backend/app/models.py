from sqlalchemy import Column, Integer, String, Float, ForeignKey, Date
from sqlalchemy.orm import relationship # Import relationship
from backend.app.database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    base_price = Column(Float)

    plans = relationship("Plan", back_populates="product") # Add relationship to plans

class Plan(Base):
    __tablename__ = "plans"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    name = Column(String, index=True) # e.g., "Monthly Basic"
    interval = Column(String) # "monthly", "yearly"
    price = Column(Float)

    product = relationship("Product", back_populates="plans") # Add relationship to product

class Subscription(Base):
    __tablename__ = "subscriptions"
    id = Column(Integer, primary_key=True, index=True)
    customer_name = Column(String, index=True)
    plan_id = Column(Integer, ForeignKey("plans.id"))
    status = Column(String, default="draft") # "draft", "active", "cancelled"
    start_date = Column(Date)
    next_billing_date = Column(Date)

    plan = relationship("Plan")
    invoices = relationship("Invoice", back_populates="subscription") # Add relationship to invoices

class Invoice(Base):
    __tablename__ = "invoices"
    id = Column(Integer, primary_key=True, index=True)
    subscription_id = Column(Integer, ForeignKey("subscriptions.id"))
    invoice_date = Column(Date)
    amount = Column(Float)
    status = Column(String, default="pending") # "pending", "paid", "due", "void"
    due_date = Column(Date)

    subscription = relationship("Subscription", back_populates="invoices")

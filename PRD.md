# -oneGuard: Hackathon Master Plan (Python Edition)

**Team Size:** 2 Developers
**Time Limit:** 24 Hours
**Stack:** Python (FastAPI) + React (Vite) + PostgreSQL

---

## 1. Architecture Overview

We will use a **Decoupled Architecture**. This allows Dev A (Backend) and Dev B (Frontend) to work simultaneously with minimal blocking.

*   **Database:** PostgreSQL (Relational data is crucial for Subscriptions/Invoices).
*   **Backend:** FastAPI (Python). Exposes a REST API and auto-generates Swagger docs (`/docs`).
*   **Frontend:** React + Vite (TypeScript recommended). Consumes the JSON API.

```mermaid
[React Frontend]  <-- JSON -->  [FastAPI Backend]  <-- SQL -->  [PostgreSQL DB]
      |                                |
   (Dev B)                          (Dev A)
```

---

## 2. Folder Structure

We will enforce a strict structure to avoid merge conflicts.

```text
-oneGuard/
├── backend/                  # OWNED BY DEV A
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py           # Entry point
│   │   ├── database.py       # DB Connection (SQLAlchemy)
│   │   ├── models.py         # Database Tables (ORM)
│   │   ├── schemas.py        # Pydantic Models (Validation)
│   │   └── routers/          # API Endpoints
│   │       ├── auth.py
│   │       ├── products.py
│   │       └── subscriptions.py
│   ├── requirements.txt
│   └── .env
│
├── frontend/                 # OWNED BY DEV B
│   ├── src/
│   │   ├── components/       # Reusable UI (Button, Input, Card)
│   │   ├── pages/            # Full Pages (Dashboard, Login, ProductList)
│   │   ├── services/         # API Calls (axios/fetch wrappers)
│   │   ├── types/            # TypeScript Interfaces
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── tailwind.config.js
│
└── PRD.md
```

---

## 3. Current State of Backend Features (Post-Hackathon Refinement)

The backend has undergone significant enhancements to build a robust, auditable, and production-ready subscription management system. All data models have been upgraded, and new modules for Tax, Discount, Subscription Lines, Invoice Lines, and Payments have been integrated. The core "Confirmation Engine" for subscriptions has been fully implemented.

**Key Achievements:**

*   **Product Model Upgrade:** Enhanced `Product` model with fields like `type`, `description`, `is_active`, `created_at`.
*   **Plan Model Upgrade:** `Plan` model now includes detailed billing intelligence such as `billing_period`, `min_quantity`, `auto_close`, `pausable`, `renewable`, `start_date`, `end_date`.
*   **Tax Management (NEW):** Implemented a full CRUD module for managing tax rates (`Tax` model, schemas, and API endpoints).
*   **Discount Management (NEW):** Implemented a full CRUD module for managing discount rules (`Discount` model, schemas, and API endpoints).
*   **Subscription Model (Major Upgrade):** `Subscription` model now tracks comprehensive details including `subscription_number`, `customer_id`, `end_date`, `payment_terms`, and all financial totals (`subtotal`, `tax_total`, `discount_total`, `grand_total`), along with lifecycle timestamps.
*   **Subscription Lines (NEW):** Introduced `SubscriptionLine` model to snapshot product details (name, price) at the time of subscription, ensuring historical accuracy. Integrated into subscription creation.
*   **Invoice Model (Professional Standard):** `Invoice` model upgraded with `invoice_number`, `customer_id`, `issue_date`, expanded `status` options, and detailed financial totals.
*   **Invoice Lines (NEW):** Introduced `InvoiceLine` model for immutable, detailed breakdown of invoice items.
*   **Payment Module (NEW):** Implemented `Payment` model and API for tracking payments against invoices, including a simulation endpoint (`/payments/simulate`).
*   **Confirmation Engine:** The `PATCH /subscriptions/{id}/confirm` endpoint now fully automates:
    *   Calculation of all financial totals for the subscription.
    *   Setting of the `next_billing_date`.
    *   Generation of a unique `invoice_number`.
    *   Creation of a detailed, immutable `Invoice` and associated `InvoiceLine`s.
*   **Backend Infrastructure Refinements:**
    *   `backend/requirements.txt` is populated and dependencies are managed.
    *   Database initialization (`create_all_tables()`) is automated on startup.
    *   CORS configured for frontend development.
    *   All module imports are resolved to relative paths.
    *   WSL/Windows host access issues addressed.



## 4. Detailed Data Models (Reference for Dev A)

**`models.py` (SQLAlchemy)**

```python
from sqlalchemy import Column, Integer, String, Float, ForeignKey, Date, Boolean, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

# --- Product Model ---
class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    base_price = Column(Float)
    type = Column(String)
    description = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    plans = relationship("Plan", back_populates="product")

# --- Plan Model ---
class Plan(Base):
    __tablename__ = "plans"
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    name = Column(String, index=True)
    billing_period = Column(String) # daily / weekly / monthly / yearly
    price = Column(Float)
    min_quantity = Column(Integer, default=1)
    auto_close = Column(Boolean, default=False)
    pausable = Column(Boolean, default=False)
    renewable = Column(Boolean, default=True)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    product = relationship("Product", back_populates="plans")

# --- Subscription Model ---
class Subscription(Base):
    __tablename__ = "subscriptions"
    id = Column(Integer, primary_key=True, index=True)
    subscription_number = Column(String, unique=True, index=True)
    customer_id = Column(Integer) # Assuming future Customer model
    plan_id = Column(Integer, ForeignKey("plans.id"))
    status = Column(String, default="draft") # "draft", "quotation", "confirmed", "active", "closed"
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
    plan = relationship("Plan")
    invoices = relationship("Invoice", back_populates="subscription")
    subscription_lines = relationship("SubscriptionLine", back_populates="subscription")

# --- SubscriptionLine Model ---
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

# --- Invoice Model ---
class Invoice(Base):
    __tablename__ = "invoices"
    id = Column(Integer, primary_key=True, index=True)
    invoice_number = Column(String, unique=True, index=True)
    subscription_id = Column(Integer, ForeignKey("subscriptions.id"))
    customer_id = Column(Integer) # Assuming future Customer model
    issue_date = Column(Date)
    due_date = Column(Date)
    status = Column(String, default="draft") # "draft", "confirmed", "paid", "cancelled"
    subtotal = Column(Float, default=0.0)
    tax_total = Column(Float, default=0.0)
    discount_total = Column(Float, default=0.0)
    grand_total = Column(Float, default=0.0)
    subscription = relationship("Subscription", back_populates="invoices")
    invoice_lines = relationship("InvoiceLine", back_populates="invoice")
    payments = relationship("Payment", back_populates="invoice")

# --- InvoiceLine Model ---
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

# --- Tax Model ---
class Tax(Base):
    __tablename__ = "taxes"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    percent = Column(Float)
    is_active = Column(Boolean, default=True)

# --- Discount Model ---
class Discount(Base):
    __tablename__ = "discounts"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    type = Column(String) # e.g., "percentage", "fixed_amount"
    value = Column(Float)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    usage_limit = Column(Integer, nullable=True)

# --- Payment Model ---
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
```

## 5. API Endpoints (Reference for Dev B)

This section outlines the current API endpoints and their expected behavior. Frontend development should align with these contracts.

| Method | Path | Body (Request Schema) | Response (Response Schema) | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/auth/login` | `LoginRequest` | `LoginResponse` | Authenticate user with username and password, returns access token. |
| `GET` | `/products/` | - | `List[Product]` | Retrieve a list of all products. |
| `POST` | `/products/` | `ProductCreate` | `Product` | Create a new product with full details. |
| `GET` | `/products/{product_id}` | - | `Product` | Retrieve details of a specific product. |
| `PATCH` | `/products/{product_id}` | `ProductCreate` | `Product` | Update details of a specific product. |
| `DELETE` | `/products/{product_id}` | - | `{"ok": True}` | Delete a specific product. |
| `GET` | `/plans/` | - | `List[Plan]` | Retrieve a list of all plans. |
| `POST` | `/plans/` | `PlanCreate` | `Plan` | Create a new plan with full details. |
| `GET` | `/plans/{plan_id}` | - | `Plan` | Retrieve details of a specific plan. |
| `PATCH` | `/plans/{plan_id}` | `PlanCreate` | `Plan` | Update details of a specific plan. |
| `DELETE` | `/plans/{plan_id}` | - | `{"ok": True}` | Delete a specific plan. |
| `GET` | `/subscriptions/` | - | `List[Subscription]` | Retrieve a list of all subscriptions. |
| `POST` | `/subscriptions/` | `SubscriptionCreate` | `Subscription` | Create a new subscription with line items (initial status "draft" or "quotation"). |
| `GET` | `/subscriptions/{subscription_id}` | - | `Subscription` | Retrieve details of a specific subscription. |
| `PATCH` | `/subscriptions/{subscription_id}/confirm` | - | `SubscriptionConfirm` | Confirms a draft/quotation subscription, calculates totals, generates invoice, and sets next billing date. |
| `GET` | `/taxes/` | - | `List[Tax]` | Retrieve a list of all tax rates. |
| `POST` | `/taxes/` | `TaxCreate` | `Tax` | Create a new tax rate. |
| `GET` | `/taxes/{tax_id}` | - | `Tax` | Retrieve details of a specific tax rate. |
| `PATCH` | `/taxes/{tax_id}` | `TaxCreate` | `Tax` | Update details of a specific tax rate. |
| `DELETE` | `/taxes/{tax_id}` | - | `{"ok": True}` | Delete a specific tax rate. |
| `GET` | `/discounts/` | - | `List[Discount]` | Retrieve a list of all discount rules. |
| `POST` | `/discounts/` | `DiscountCreate` | `Discount` | Create a new discount rule. |
| `GET` | `/discounts/{discount_id}` | - | `Discount` | Retrieve details of a specific discount rule. |
| `PATCH` | `/discounts/{discount_id}` | `DiscountCreate` | `Discount` | Update details of a specific discount rule. |
| `DELETE` | `/discounts/{discount_id}` | - | `{"ok": True}` | Delete a specific discount rule. |
| `GET` | `/payments/` | - | `List[Payment]` | Retrieve a list of all payments. |
| `POST` | `/payments/` | `PaymentCreate` | `Payment` | Record a new payment. |
| `GET` | `/payments/{payment_id}` | - | `Payment` | Retrieve details of a specific payment. |
| `PATCH` | `/payments/{payment_id}` | `PaymentCreate` | `Payment` | Update details of a specific payment. |
| `DELETE` | `/payments/{payment_id}` | - | `{"ok": True}` | Delete a specific payment. |
| `POST` | `/payments/simulate` | `PaymentBase` | `Payment` | Simulate a payment transaction. |
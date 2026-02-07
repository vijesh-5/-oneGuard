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

## 3. Work Split & Task Assignment

**Strategy:**
*   **Dev A (Backend Lead):** Focuses on Data, Logic, and API.
*   **Dev B (Frontend Lead):** Focuses on UX, Routing, and Integration.
*   **Handshake:** Dev A defines the `schemas.py` (API Contract) *first*. Dev B builds the UI mocking these schemas until the API is ready.

### Phase 1: Setup (First 2 Hours) - *Pair Programming*
*   **Together:** Initialize Git repo. Create `backend` and `frontend` folders.
*   **Dev A:** Set up local PostgreSQL, virtualenv, install `fastapi uvicorn sqlalchemy psycopg2-binary`.
*   **Dev B:** Run `npm create vite@latest frontend`, install `axios react-router-dom tailwindcss`.

### Phase 2: Core Development (Hours 2-12) - *Parallel Execution*

| Feature | Dev A (Backend) Tasks | Dev B (Frontend) Tasks |
| :--- | :--- | :--- |
| **Auth** | Implement `POST /login` (Simple Mock or JWT). <br> **Commit:** `feat(auth): add login endpoint` | Create Login Page UI. <br> **Commit:** `feat(ui): add login form` |
| **Products** | Create `Product` DB Model. Implement `GET/POST /products`. <br> **Commit:** `feat(api): product CRUD` | Create "Add Product" Form & Product List Table. <br> **Commit:** `feat(ui): product management` |
| **Plans** | Create `Plan` Model (linked to Product). Implement `GET/POST /plans`. <br> **Commit:** `feat(api): plan CRUD` | Create Plan configuration modal/page. <br> **Commit:** `feat(ui): plan setup` |

### Phase 3: The "Subscription" Logic (Hours 12-18) - *Complex*

| Feature | Dev A (Backend) Tasks | Dev B (Frontend) Tasks |
| :--- | :--- | :--- |
| **Sub Logic** | Create `Subscription` Model. <br> **Critical:** Logic to calculate `next_billing_date` based on Plan interval. <br> **Commit:** `feat(logic): subscription engine` | "Create Subscription" Wizard. <br> Dropdown to select Customer -> Product -> Plan. <br> **Commit:** `feat(ui): sub wizard` |
| **Invoicing** | Trigger: When Sub is `Confirmed`, create `Invoice` record. <br> **Commit:** `feat(logic): auto-invoice` | Invoice View Page. Display calculated totals (Tax/Discount). <br> **Commit:** `feat(ui): invoice display` |

### Phase 4: Integration & Polish (Hours 18-24)

*   **Dev A:** Add CORS middleware to allow Frontend requests. Refine Error messages.
*   **Dev B:** Hook up the "Create Subscription" button to the real API. Fix styling bugs.
*   **Together:** Walk through the "Happy Path" (Create Product -> Create Plan -> Subscribe -> Invoice).

---

## 4. Detailed Data Models (Reference for Dev A)

**`models.py` (SQLAlchemy)**

```python
class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    base_price = Column(Float)

class Plan(Base):
    __tablename__ = "plans"
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    name = Column(String) # e.g., "Monthly Basic"
    interval = Column(String) # "monthly", "yearly"
    price = Column(Float)

class Subscription(Base):
    __tablename__ = "subscriptions"
    id = Column(Integer, primary_key=True, index=True)
    customer_name = Column(String)
    plan_id = Column(Integer, ForeignKey("plans.id"))
    status = Column(String) # "draft", "active"
    start_date = Column(Date)
    next_billing_date = Column(Date)
```

## 5. API Endpoints (Reference for Dev B)

| Method | Path | Body | Response |
| :--- | :--- | :--- | :--- |
| `GET` | `/products` | - | `[{id: 1, name: "Netflix", ...}]` |
| `POST` | `/products` | `{name: "Netflix", base_price: 10}` | `{id: 1, ...}` |
| `POST` | `/plans` | `{product_id: 1, interval: "monthly", price: 12}` | `{id: 5, ...}` |
| `POST` | `/subscriptions` | `{customer: "John", plan_id: 5}` | `{id: 101, status: "draft"}` |
| `PATCH` | `/subscriptions/{id}/confirm` | - | `{status: "active", next_bill: "2026-03-07"}` |
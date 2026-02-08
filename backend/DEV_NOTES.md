# Backend Development Notes

This document summarizes the work completed on the backend, highlights key improvements and architectural choices, and outlines remaining tasks for future development.

## 1. Summary of Backend Work Done

The following features and infrastructure components have been implemented:

*   **Environment Setup:**
    *   Created a Python virtual environment (`.venv`).
    *   Installed core dependencies: `fastapi`, `uvicorn`, `sqlalchemy`, `psycopg2-binary`.
    *   Integrated `python-dotenv` for robust environment variable management from `.env` files.
*   **Database Integration:**
    *   Configured SQLAlchemy (`backend/app/database.py`) with an engine, `SessionLocal`, and a declarative `Base` for ORM models.
    *   Implemented a `get_db` dependency for FastAPI to manage database sessions.
    *   Added a `create_all_tables()` function to programmatically create database schemas based on defined models.
*   **Authentication Module:**
    *   **Implemented JWT (JSON Web Token) based authentication system.**
    *   **User Model (`backend/app/models.py`):** Defined a `User` model with `id`, `username`, `email`, `hashed_password`, `is_active`, and `created_at`.
    *   **Authentication Schemas (`backend/app/schemas.py`):** Added `UserCreate`, `UserResponse`, and `Token` schemas for request/response validation and JWT structure.
    *   **Authentication Utilities (`backend/app/auth_utils.py`):** Implemented functions for:
        *   Password hashing and verification using `passlib[bcrypt]`.
        *   JWT creation (`create_access_token`) and decoding (`decode_access_token`) using `python-jose`.
        *   Dependency functions (`get_current_user`, `get_current_active_user`) for extracting and validating user information from JWT tokens.
    *   **Authentication Router (`backend/app/routers/auth.py`):**
        *   `POST /auth/signup`: Endpoint for user registration, including username/email uniqueness checks and password hashing.
        *   `POST /auth/token`: Endpoint for user login, verifying credentials and issuing a JWT access token.
        *   `GET /auth/users/me`: Protected endpoint to retrieve the current authenticated user's profile, demonstrating JWT authorization.
    *   **Configuration (`backend/app/config.py`):** Centralized JWT `SECRET_KEY`, `ALGORITHM`, and `ACCESS_TOKEN_EXPIRE_MINUTES`.
*   **Product Management Module (`backend/app/routers/products.py`):**
    *   Defined the `Product` SQLAlchemy model (`backend/app/models.py`) with `id`, `name`, and `base_price`.
    *   Created `ProductBase`, `ProductCreate`, and `Product` Pydantic schemas for API request/response validation.
    *   Implemented `GET /products` to list all products.
    *   Implemented `POST /products` to create new products.
*   **Plan Management Module (`backend/app/routers/plans.py`):**
    *   Defined the `Plan` SQLAlchemy model (`backend/app/models.py`) linked to `Product` via `product_id` (foreign key), including `name`, `interval`, and `price`.
    *   Created `PlanBase`, `PlanCreate`, and `Plan` Pydantic schemas.
    *   Implemented `GET /plans` to list all plans.
    *   Implemented `POST /plans` to create new plans.
*   **Subscription Management Module (`backend/app/routers/subscriptions.py`):**
    *   Defined the `Subscription` SQLAlchemy model (`backend/app/models.py`) linked to `Plan` via `plan_id`, including `customer_name`, `status`, `start_date`, and `next_billing_date`.
    *   Created `SubscriptionBase`, `SubscriptionCreate`, `Subscription`, and `SubscriptionConfirm` Pydantic schemas.
    *   Implemented `POST /subscriptions` to create a new subscription (initially in "draft" status).
    *   Implemented `PATCH /subscriptions/{id}/confirm` to activate a subscription and calculate its `next_billing_date` based on the associated plan's interval.
*   **Invoicing Module (Integrated within Subscriptions):**
    *   Defined the `Invoice` SQLAlchemy model (`backend/app/models.py`) linked to `Subscription`, including `invoice_date`, `amount`, `status`, and `due_date`.
    *   Created `InvoiceBase`, `InvoiceCreate`, and `Invoice` Pydantic schemas.
    *   Integrated automatic `Invoice` creation within the `PATCH /subscriptions/{id}/confirm` endpoint, generating an initial "pending" invoice when a subscription becomes active.
*   **CORS Middleware:**
    *   Added `CORSMiddleware` to `backend/app/main.py` to allow cross-origin requests, configured for local development origins (`http://localhost`, `http://localhost:3000`).
*   **.gitignore:**
    *   Created and configured `/.gitignore` in the project root to exclude common development artifacts, virtual environments, build directories, and sensitive environment files.
*   **.env File:**
    *   Created `backend/.env` to store the `DATABASE_URL` for flexible database configuration.
*   **Product Model Upgrade:**
    *   `Product` model (`backend/app/models.py`) upgraded with `type`, `description`, `is_active`, and `created_at` fields.
    *   `ProductBase`, `ProductCreate`, `Product` Pydantic schemas (`backend/app/schemas.py`) updated.
    *   `POST /products` endpoint (`backend/app/routers/products.py`) modified to handle new fields.
*   **Plan Model Upgrade:**
    *   `Plan` model (`backend/app/models.py`) upgraded with `billing_period` (replacing `interval`), `min_quantity`, `auto_close`, `pausable`, `renewable`, `start_date`, and `end_date` fields.
    *   `PlanBase`, `PlanCreate`, `Plan` Pydantic schemas (`backend/app/schemas.py`) updated.
    *   `POST /plans` endpoint (`backend/app/routers/plans.py`) modified to handle new fields.
*   **Tax Management Module (NEW):**
    *   New `Tax` model (`backend/app/models.py`) with `name`, `percent`, `is_active`.
    *   `TaxBase`, `TaxCreate`, `Tax` Pydantic schemas (`backend/app/schemas.py`) added.
    *   New `backend/app/routers/taxes.py` created for CRUD operations (`GET /taxes`, `POST /taxes`, `PATCH /taxes/{id}`, `DELETE /taxes/{id}`).
    *   `taxes` router included in `backend/app/main.py`.
*   **Discount Management Module (NEW):**
    *   New `Discount` model (`backend/app/models.py`) with `name`, `type`, `value`, `start_date`, `end_date`, `usage_limit`.
    *   `DiscountBase`, `DiscountCreate`, `Discount` Pydantic schemas (`backend/app/schemas.py`) added.
    *   New `backend/app/routers/discounts.py` created for CRUD operations (`GET /discounts`, `POST /discounts`, `PATCH /discounts/{id}`, `DELETE /discounts/{id}`).
    *   `discounts` router included in `backend/app/main.py`.
*   **Subscription Model Major Upgrade:**
    *   `Subscription` model (`backend/app/models.py`) upgraded with `subscription_number`, `customer_id`, `end_date`, `payment_terms`, `subtotal`, `tax_total`, `discount_total`, `grand_total`, `created_at`, `confirmed_at`, `closed_at`.
    *   `SubscriptionBase`, `SubscriptionCreate`, `Subscription`, `SubscriptionConfirm` Pydantic schemas (`backend/app/schemas.py`) updated.
*   **Subscription Lines Module (NEW):**
    *   New `SubscriptionLine` model (`backend/app/models.py`) for snapshotting product details (`product_name_snapshot`, `unit_price_snapshot`) within a subscription, including `quantity`, `tax_percent`, `discount_percent`, `line_total`.
    *   `SubscriptionLineBase`, `SubscriptionLineCreate`, `SubscriptionLine` Pydantic schemas (`backend/app/schemas.py`) added.
    *   `Subscription` schema updated to include `subscription_lines: List["SubscriptionLine"]`.
    *   `POST /subscriptions` endpoint (`backend/app/routers/subscriptions.py`) modified to accept `SubscriptionLineCreate` objects, calculate line totals, and persist `DBSubscriptionLine`s.
*   **Invoice Model Professional Standard:**
    *   `Invoice` model (`backend/app/models.py`) upgraded with `invoice_number`, `customer_id`, `issue_date` (renamed from `invoice_date`), expanded `status` states, `subtotal`, `tax_total`, `discount_total`, `grand_total`.
    *   `InvoiceBase`, `InvoiceCreate`, `Invoice` Pydantic schemas (`backend/app/schemas.py`) updated.
*   **Invoice Lines Module (NEW):**
    *   New `InvoiceLine` model (`backend/app/models.py`) for immutable invoice details (`product_name`, `unit_price`, `quantity`, `tax_percent`, `discount_percent`, `line_total`).
    *   `InvoiceLineBase`, `InvoiceLineCreate`, `InvoiceLine` Pydantic schemas (`backend/app/schemas.py`) added.
    *   `Invoice` schema updated to include `invoice_lines: List["InvoiceLine"]`.
*   **Payment Module (NEW):**
    *   New `Payment` model (`backend/app/models.py`) with `invoice_id`, `amount`, `method`, `reference_id`, `status`, `payment_date`.
    *   `PaymentBase`, `PaymentCreate`, `Payment` Pydantic schemas (`backend/app/schemas.py`) added.
    *   New `backend/app/routers/payments.py` created for CRUD and `simulate` operation (`POST /payments/simulate`).
    *   `payments` router included in `backend/app/main.py`.
    *   `Invoice` schema updated to include `payments: List["Payment"]`.
*   **Confirmation Engine Implementation:**
    *   `PATCH /subscriptions/{id}/confirm` endpoint (`backend/app/routers/subscriptions.py`) fully implemented to:
        *   Re-calculate `subtotal`, `tax_total`, `discount_total`, `grand_total` based on `SubscriptionLine`s.
        *   Generate a unique `invoice_number`.
        *   Create `DBInvoice` with all financial totals.
        *   Create `DBInvoiceLine`s from `DBSubscriptionLine`s, ensuring snapshotting.

## 2. Improvements/Refinements

*   **Modular Architecture:** The backend is organized into `routers`, `models`, `schemas`, and `database` modules, promoting a clean separation of concerns.
*   **FastAPI Best Practices:** Utilizes FastAPI's dependency injection system for database sessions and Pydantic for robust data validation and serialization.
*   **Error Handling:** Standard `HTTPException`s are used for common API error conditions, providing clear status codes and details.
*   **Environment Variable Management:** Centralized `load_dotenv()` call in `database.py` ensures that the database connection string is loaded correctly and consistently.
*   **Dependency Management:** `backend/requirements.txt` was populated with specific versions of required packages (`fastapi`, `uvicorn`, `python-dotenv`, `sqlalchemy`, `psycopg2-binary`, `passlib[bcrypt]`, `python-jose`) and confirmed successful installation within the virtual environment.
*   **Database Initialization:** Ensured `create_all_tables()` is called on application startup in `backend/app/main.py` for automatic schema creation during development.
*   **CORS Configuration:** Updated `CORSMiddleware` origins in `backend/app/main.py` to include `http://localhost:5173` to resolve frontend/backend communication issues.
*   **Module Import Resolution:** Corrected absolute module imports (e.g., `backend.app.routers`) to relative imports (e.g., `from .routers` or `from ..schemas`) across `backend/app/main.py`, `backend/app/routers/*.py`, `backend/app/models.py`, and `backend/app/database.py` to resolve `ModuleNotFoundError` issues and a `SyntaxError`.
*   **WSL/Windows Host Access:** Identified and provided solution for accessing the backend running in WSL from a Windows host browser by using the WSL instance's IP address and suggesting Windows Firewall configuration.

## 3. Remaining/Future Tasks

*   **User Management:**
    *   Implement CRUD (Create, Read, Update, Delete) endpoints for managing users (beyond just signup).
*   **Comprehensive Invoice Management:**
    *   Add dedicated endpoints (`GET /invoices`, `GET /invoices/{id}`, `PATCH /invoices/{id}/status`) for retrieving and managing invoice details and statuses.
    *   Implement logic for recurring invoice generation based on subscription cycles.
*   **Payment Processing Integration:**
    *   Integrate with a third-party payment gateway (e.g., Stripe, PayPal) for handling actual payments, webhooks, and payment status updates.
    *   This is a significant task and was out of scope for the initial hackathon phase.
*   **Advanced Input Validation:**
    *   Implement more detailed Pydantic validators (e.g., for valid `interval` types in `Plan`, specific date formats).
*   **Pagination, Filtering, and Sorting:**
    *   Enhance list endpoints (`/products`, `/plans`, `/subscriptions`, `/invoices`) to support pagination, filtering by various criteria, and sorting.
*   **Testing:**
    *   Develop comprehensive unit tests for all models, services, and utility functions.
    *   Implement integration tests for API endpoints to ensure correct behavior and data flow.
*   **Deployment:**
    *   Create Dockerfiles for containerization.
    *   Set up production-ready environment configurations (e.g., Gunicorn for Uvicorn, proper logging).
*   **Refine `next_billing_date` Calculation:**
    *   Address edge cases for `next_billing_date` calculation more robustly (e.g., leap years, month-end differences for varying month lengths).
*   **Graceful Database Shutdown:**
    *   Implement mechanisms to ensure database connections are properly closed upon application shutdown.
*   **API Documentation Refinement:**
    *   Add more detailed descriptions and examples to FastAPI's auto-generated Swagger/OpenAPI documentation.
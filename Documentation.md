# Product Overview: -oneGuard Subscription Management System

This document provides a simple explanation of how the -oneGuard system works, designed for anyone who isn't a software developer.

## What is -oneGuard?

-oneGuard is a system designed to help businesses manage their customer subscriptions, products, pricing plans, and invoices. Think of it as the brain behind offering services that customers pay for regularly (like a monthly software subscription or an annual membership).

## How Does it Work? (Core Concepts)

The system is built around a few key ideas that work together:

1.  **Products:** These are the services or items your business offers. They now have more details like their type, a description, and whether they are currently active.
    *   *Example:* "Basic Cloud Storage" (Type: 'Digital Service'), "Premium Support Package" (Type: 'Support').
    *   *System's Role:* The system keeps track of what products are available and their comprehensive details.

2.  **Pricing Plans:** For each Product, you can have different ways customers can subscribe, often with different prices and billing cycles. Plans now include rules about when they are available, minimum quantities, and if they can be paused or renewed.
    *   *Example:* For "Basic Cloud Storage," you might have a "Monthly" plan at $10 or an "Annual" plan at $100.
    *   *System's Role:* It defines how often customers are billed (e.g., "monthly", "yearly"), the cost, and detailed lifecycle behavior.

3.  **Tax Rules:** These define any applicable taxes that need to be added to the price.
    *   *Example:* "VAT 20%" or "Sales Tax 7%."
    *   *System's Role:* Manages different tax rates and applies them to calculations.

4.  **Discount Rules:** These allow for special offers or deductions on prices.
    *   *Example:* "New Customer 10% Off" or "$5 Flat Discount."
    *   *System's Role:* Manages various types of discounts and applies them to calculations.

5.  **Subscriptions:** When a customer signs up for a Product's Pricing Plan, they create a Subscription. This records who is subscribing to what, for how long, and their payment terms. It also holds the total costs, including tax and discounts.
    *   *Example:* "John Doe" has a "Monthly" subscription to "Basic Cloud Storage" with "Net 30" payment terms.
    *   *System's Role:* It tracks customer details, the specific plan chosen, start/end dates, billing dates, payment terms, and all calculated financial totals (subtotal, tax, discount, grand total). Subscriptions move through states like 'draft', 'quotation', 'confirmed', and 'active'.

6.  **Subscription Lines:** Each item within a Subscription is detailed here. Crucially, these lines take a "snapshot" of the product's name and price at the time of subscription.
    *   *Example:* For John Doe's subscription, one line might be "Basic Cloud Storage - $10/month" with a quantity of 1.
    *   *System's Role:* Ensures that even if a product's price changes later, the original subscription details remain accurate for historical records and financial consistency.

7.  **Invoices:** Every time a customer needs to pay for their active subscription, an Invoice is generated. This is a frozen record of the exact transaction.
    *   *Example:* A monthly bill (Invoice Number: INV-12345) for "John Doe's" "Basic Cloud Storage" subscription.
    *   *System's Role:* Automatically creates detailed bills with a unique number, due date, status (draft, confirmed, paid, cancelled), and all financial totals.

8.  **Invoice Lines:** Just like subscriptions, invoices have lines that detail each item being billed. These are also "snapshots" to ensure the invoice remains an exact historical record.
    *   *Example:* For Invoice INV-12345, an invoice line details "Basic Cloud Storage - $10" with applied tax/discount.
    *   *System's Role:* Provides an immutable breakdown of what was charged for each item on the invoice.

9.  **Payments:** Records actual payments made by customers against an invoice.
    *   *Example:* A payment of $10 received on March 1st for Invoice INV-12345 via 'Credit Card'.
    *   *System's Role:* Tracks payment amounts, methods, reference IDs, status, and dates, linking them to specific invoices.

## What Has Been Achieved So Far?

The core engine for a robust and auditable subscription management system is now significantly enhanced. This includes:

*   **Comprehensive Data Models:** Fully upgraded the database structure for Products, Plans, Subscriptions, and Invoices. New dedicated models for Tax, Discount, Subscription Lines, Invoice Lines, and Payments have been integrated.
*   **Detailed Product & Plan Definitions:** Products now capture more attributes (type, description, active status), and Plans define detailed billing intelligence, availability, and lifecycle behaviors (e.g., pausable, renewable).
*   **Auditable Subscriptions:** Subscriptions now track customer details, unique numbers, comprehensive financial totals (subtotal, tax, discount, grand total), and key timestamps (created, confirmed, closed), supporting robust reporting.
*   **Snapshot-based Financial Accuracy:** Implemented Subscription Lines and Invoice Lines that capture exact product/price details at the time of creation. This ensures that historical subscriptions and invoices remain financially correct even if product prices or details change in the future.
*   **Centralized Confirmation Engine:** The process for confirming a subscription has been built. When a subscription is confirmed, the system now automatically:
    *   Calculates all financial totals (subtotal, tax, discount, grand total).
    *   Sets the next billing date based on the plan's billing period.
    *   Generates a unique invoice number.
    *   Creates a detailed, immutable Invoice with all financial specifics.
    *   Generates individual Invoice Lines mirroring the Subscription's details.
*   **Tax & Discount Management:** Basic CRUD (Create, Read, Update, Delete) functionality for managing tax rates and discount rules is implemented.
*   **Payment Tracking:** A new module for tracking payments against invoices is in place, including a simulation endpoint for future payment gateway integration.
*   **Robust Backend Infrastructure:** The system is built using modern technology (FastAPI) with proper database integration (SQLAlchemy), environment variable management, and efficient routing for all new modules. It's configured to handle cross-origin requests securely for local development.
*   **WSL/Windows Host Connectivity:** Solutions have been identified and implemented to ensure the backend running in a Linux environment (WSL) is accessible from a Windows host browser.

This enhanced system provides a highly granular and financially accurate foundation for managing complex subscription lifecycles.

## What's Next? (Future Enhancements)

This is just the beginning! Here are some key areas for future development:

*   **User Accounts & Security:** Allow real users to sign up, log in securely, and manage their own subscriptions.
*   **Full Billing Cycle:** Automatically generate invoices for ongoing subscriptions without manual intervention.
*   **Payment Integration:** Connect with payment services (like Stripe) to actually process payments.
*   **Advanced Reporting:** Tools to view and analyze subscriptions, revenue, and customer data.
*   **User Interface:** A complete and user-friendly website (frontend) for customers and administrators to manage everything easily.

This system provides a strong base upon which to build a complete and powerful subscription management solution.
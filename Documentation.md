# Product Overview: -oneGuard Subscription Management System

This document provides a simple explanation of how the -oneGuard system works, designed for anyone who isn't a software developer.

## What is -oneGuard?

-oneGuard is a system designed to help businesses manage their customer subscriptions, products, pricing plans, and invoices. Think of it as the brain behind offering services that customers pay for regularly (like a monthly software subscription or an annual membership).

## How Does it Work? (Core Concepts)

The system is built around a few key ideas that work together:

1.  **Products:** These are the services or items your business offers.
    *   *Example:* "Basic Cloud Storage," "Premium Support Package," "Pro Analytics Tool."
    *   *System's Role:* The system keeps track of what products are available and their basic details.

2.  **Pricing Plans:** For each Product, you can have different ways customers can subscribe, often with different prices and billing cycles.
    *   *Example:* For "Basic Cloud Storage," you might have a "Monthly" plan at $10 or an "Annual" plan at $100.
    *   *System's Role:* It defines how often customers are billed (monthly, yearly) and the cost for each option.

3.  **Subscriptions:** When a customer signs up for a Product's Pricing Plan, they create a Subscription. This records who is subscribing to what.
    *   *Example:* "John Doe" has a "Monthly" subscription to "Basic Cloud Storage."
    *   *System's Role:* It tracks customer names, the specific plan they chose, when their subscription started, and when they will be billed next. Subscriptions start as 'drafts' and become 'active' once confirmed.

4.  **Invoices:** Every time a customer needs to pay for their active subscription, an Invoice is generated.
    *   *Example:* A monthly bill for "John Doe's" "Basic Cloud Storage."
    *   *System's Role:* Automatically creates bills for active subscriptions, including the amount due, the date it's issued, and when it's due.

## What Has Been Achieved So Far?

The foundational parts of this system are now set up and working. This includes:

*   **Core Building Blocks:** The system can now define Products (what you sell), Plans (how you sell them), Subscriptions (who bought what), and Invoices (what they owe).
*   **Customer Sign-up (Initial):** You can create new customer subscriptions. These start as drafts.
*   **Activating Subscriptions:** Subscriptions can be confirmed, which automatically sets their next billing date and creates the first invoice.
*   **Secure Foundation:** The system is built using modern technology (FastAPI) and has been configured to talk to a database to store all this information. It's also set up securely for development, allowing the frontend (the part customers interact with) to connect to it safely.
*   **Connectivity Ready:** We've ensured both the backend (the 'brain') and the frontend (the 'face') can communicate properly, even across different environments like a Windows computer and a Linux (WSL) development setup.

## What's Next? (Future Enhancements)

This is just the beginning! Here are some key areas for future development:

*   **User Accounts & Security:** Allow real users to sign up, log in securely, and manage their own subscriptions.
*   **Full Billing Cycle:** Automatically generate invoices for ongoing subscriptions without manual intervention.
*   **Payment Integration:** Connect with payment services (like Stripe) to actually process payments.
*   **Advanced Reporting:** Tools to view and analyze subscriptions, revenue, and customer data.
*   **User Interface:** A complete and user-friendly website (frontend) for customers and administrators to manage everything easily.

This system provides a strong base upon which to build a complete and powerful subscription management solution.
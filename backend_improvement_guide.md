
# Backend Improvement Guide – Subscription Management System

## Purpose
This document defines the structural and logical upgrades required to make the
core modules production-like, audit safe, and aligned with ERP expectations.

Focus areas:
- Correct lifecycle handling
- Snapshot based invoicing
- Clean financial calculations
- Future readiness for online payments (UPI / Netbanking simulation)

---

## Core Principle (MUST FOLLOW)
A Subscription can change in the future.
An Invoice must NEVER change once generated.

Therefore invoices copy data, they do not depend on live product prices.
This is mandatory for financial correctness.

---

## 1. Product Model (Upgrade)

Fields:
- id
- name
- type
- description
- is_active
- created_at

Why:
Products may be discontinued but old invoices must still display them.

---

## 2. Plan Model (Upgrade)
Fields:
- id
- product_id
- name
- billing_period (daily / weekly / monthly / yearly)
- price
- min_quantity
- auto_close (bool)
- pausable (bool)
- renewable (bool)
- start_date
- end_date

Why:
Defines the billing intelligence and allowed lifecycle behavior.

---

## 3. Subscription Model (Major Upgrade)

Fields:
- id
- subscription_number
- customer_id
- plan_id

- status (draft / quotation / confirmed / active / closed)

- start_date
- end_date
- next_billing_date

- payment_terms

- subtotal
- tax_total
- discount_total
- grand_total

- created_at
- confirmed_at
- closed_at

Why:
Now you can support reporting, revenue calculations, audits,
and proper lifecycle transitions.

---

## 4. Subscription Lines (NEW)

Fields:
- id
- subscription_id
- product_id

- product_name_snapshot
- unit_price_snapshot

- quantity
- tax_percent
- discount_percent
- line_total

Why snapshot:
If product price changes tomorrow, historical subscriptions remain correct.

---

## 5. Confirmation Engine

When subscription becomes CONFIRMED:

You must:
1. calculate totals
2. set next billing date
3. generate invoice

This is the ERP heart.

---

## 6. Invoice Model (Professional Standard)

Fields:
- id
- invoice_number
- subscription_id
- customer_id

- issue_date
- due_date

- status (draft / confirmed / paid / cancelled)

- subtotal
- tax_total
- discount_total
- grand_total

Invoice is frozen history.

---

## 7. Invoice Lines (NEW)

Fields:
- id
- invoice_id

- product_name
- unit_price
- quantity
- tax_percent
- discount_percent

- line_total

Notice:
No product_id because invoice must survive product edits.

---

## 8. Payment Model (Future Ready)

Fields:
- id
- invoice_id

- amount
- method (cash / card / upi / netbanking)
- reference_id
- status (pending / success / failed)

- payment_date

---

### Future Upgrade Room (Postman Simulation)

POST /payments/simulate

Body:
{
  invoice_id,
  method,
  reference_id
}

Later you can plug real gateway.

---

## 9. Tax & Discount (Simple but Extensible)

Tax:
- id
- name
- percent
- is_active

Discount:
- id
- name
- type
- value
- start_date
- end_date
- usage_limit

---

## 10. Mandatory Practices

- Use enums, never free text.
- Always store totals.
- Never recompute old invoices.
- Add timestamps everywhere.

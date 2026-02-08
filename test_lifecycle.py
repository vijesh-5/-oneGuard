import requests
import datetime

BASE_URL = "http://localhost:8000"

def run_test():
    # 1. Create Product
    print("Creating Product...")
    timestamp = datetime.datetime.now().timestamp()
    prod_res = requests.post(f"{BASE_URL}/products/", json={
        "name": f"Gold Membership {timestamp}",
        "base_price": 100.0,
        "type": "service",
        "description": "Premium access",
        "is_active": True
    })
    if prod_res.status_code not in [200, 201]:
        print(f"Failed to create product: {prod_res.text}")
        return
    product_id = prod_res.json()["id"]
    print(f"Product ID: {product_id}")

    # 2. Create Plan
    print("\nCreating Plan...")
    plan_res = requests.post(f"{BASE_URL}/plans/", json={
        "product_id": product_id,
        "name": "Monthly Gold",
        "billing_period": "monthly",
        "price": 90.0,
        "min_quantity": 1,
        "auto_close": False,
        "pausable": True,
        "renewable": True
    })
    if plan_res.status_code not in [200, 201]:
        print(f"Failed to create plan: {plan_res.text}")
        return
    plan_id = plan_res.json()["id"]
    print(f"Plan ID: {plan_id}")

    # 3. Create Subscription
    print("\nCreating Subscription...")
    sub_res = requests.post(f"{BASE_URL}/subscriptions/", json={
        "subscription_number": f"SUB-{datetime.datetime.now().timestamp()}",
        "customer_id": 1,
        "plan_id": plan_id,
        "status": "draft",
        "start_date": str(datetime.date.today()),
        "payment_terms": "NET30",
        "subscription_lines": [
            {
                "product_id": product_id,
                "product_name_snapshot": "Gold Membership",
                "unit_price_snapshot": 90.0,
                "quantity": 1,
                "tax_percent": 10.0,
                "discount_percent": 0.0,
                "line_total": 99.0
            }
        ]
    })
    if sub_res.status_code != 201:
        print(f"Failed to create subscription: {sub_res.text}")
        return
    sub_id = sub_res.json()["id"]
    print(f"Subscription ID: {sub_id}")

    # 4. Confirm Subscription
    print("\nConfirming Subscription...")
    confirm_res = requests.patch(f"{BASE_URL}/subscriptions/{sub_id}/confirm")
    if confirm_res.status_code != 200:
        print(f"Failed to confirm subscription: {confirm_res.text}")
        return
    
    data = confirm_res.json()
    print("Confirmation Result:")
    print(f"Status: {data['status']}")
    print(f"Next Billing Date: {data['next_billing_date']}")
    print(f"Grand Total: {data['grand_total']}")

    
    if not data['next_billing_date']:
        print("ERROR: Next billing date not set!")

    # 5. Simulate Payment
    print("\nSimulating Payment...")
    # Find invoice ID (need to fetch subscription to see invoices, or just assume we know logic)
    # Ideally fetching subscription to get invoice ID
    sub_details = requests.get(f"{BASE_URL}/subscriptions/{sub_id}").json()
    if not sub_details['invoices']:
        print("ERROR: No invoices found for subscription!")
        return
    invoice_id = sub_details['invoices'][0]['id']
    grand_total = sub_details['invoices'][0]['grand_total']

    pay_res = requests.post(f"{BASE_URL}/payments/simulate", json={
        "invoice_id": invoice_id,
        "amount": grand_total,
        "method": "credit_card",
        "reference_id": "REF-123"
    })
    
    if pay_res.status_code != 201:
        print(f"Failed to simulate payment: {pay_res.text}")
    else:
        print("Payment simulated successfully.")

    # 6. Verify Invoice Status
    # Re-fetch subscription or invoice to check status
    sub_details_after_pay = requests.get(f"{BASE_URL}/subscriptions/{sub_id}").json()
    invoice_status = sub_details_after_pay['invoices'][0]['status']
    print(f"Invoice Status after payment: {invoice_status}")
    if invoice_status != 'paid':
        print("ERROR: Invoice status should be 'paid'!")

    # 7. Cancel Subscription
    print("\nCancelling Subscription...")
    cancel_res = requests.patch(f"{BASE_URL}/subscriptions/{sub_id}/cancel")
    if cancel_res.status_code == 200:
        print("Subscription cancelled successfully.")
        print(f"Status: {cancel_res.json()['status']}")
    else:
         print(f"Failed to cancel: {cancel_res.text}")

    # 8. Test Renewals (Bonus)
    print("\nTesting Renewals...")
    # Create a new subscription for renewal testing
    print("Creating Renewable Subscription...")
    timestamp = datetime.datetime.now().timestamp()
    sub_res_2 = requests.post(f"{BASE_URL}/subscriptions/", json={
        "subscription_number": f"SUB-REN-{timestamp}",
        "customer_id": 1,
        "plan_id": plan_id,
        "status": "draft",
        "start_date": str(datetime.date.today() - datetime.timedelta(days=35)), # Started last month
        "payment_terms": "NET30",
        "subscription_lines": [{"product_id": product_id, "product_name_snapshot": "Gold", "unit_price_snapshot": 100.0, "quantity": 1, "line_total": 100.0}]
    })
    sub_id_2 = sub_res_2.json()["id"]
    requests.patch(f"{BASE_URL}/subscriptions/{sub_id_2}/confirm")
    
    # Manually hack the next_billing_date to be yesterday (via DB or if we had an endpoint)
    # Since we can't easily hack DB via API, we'll rely on the fact that Confirm sets next_billing_date based on Start Date?
    # No, Confirm sets next_billing_date = start_date + interval.
    # If start_date was 35 days ago (monthly), next_billing_date should have been 5 days ago.
    # Let's see if confirm utilizes the start_date provided or resets it. 
    # Logic in subscriptions.py: `db_subscription.next_billing_date = calculate_next_billing_date(db_subscription.start_date, plan.billing_period)`
    # So if start_date is old, next_billing_date will be old (e.g. 5 days ago).
    
    # Trigger Renewal
    renew_res = requests.post(f"{BASE_URL}/subscriptions/process-renewals")
    if renew_res.status_code == 200:
        print("Renewals processed.")
        print(renew_res.json())
        if renew_res.json()['processed_count'] > 0:
            print("SUCCESS: Renewal processed a subscription.")
        else:
            print("WARNING: No subscriptions renewed. Check date logic.")
    else:
        print(f"Failed to process renewals: {renew_res.text}")

if __name__ == "__main__":
    run_test()

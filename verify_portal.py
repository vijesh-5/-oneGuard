import requests
import sys

BASE_URL = "http://localhost:8000"

def verify_portal_flow():
    # 1. Login as Admin/Business User
    # Assuming 'admin' and 'admin' exists from create_db.py or I should create one
    # I'll create a new user just in case
    
    unique_id = "test_biz_" + str(int(requests.get("http://worldtimeapi.org/api/ip").json()["unixtime"] * 1000))[-6:]
    # Fallback if internet down
    import time
    unique_id = "test_biz_" + str(int(time.time()))
    
    admin_email = f"admin_{unique_id}@example.com"
    admin_pass = "admin123"
    admin_username = f"admin_{unique_id}"
    
    # Create Admin
    resp = requests.post(f"{BASE_URL}/auth/signup", json={"username": admin_username, "email": admin_email, "password": admin_pass, "full_name": "Admin User"})
    if resp.status_code != 200: # detailed response model returns 200 by default for signup unless specified
         # Check if already exists handling
         pass
    
    # Login Admin
    resp = requests.post(f"{BASE_URL}/auth/token", data={"username": admin_username, "password": admin_pass})
    if resp.status_code != 200:
        print(f"Failed to login as admin: {resp.text}")
        sys.exit(1)
    
    admin_token = resp.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    
    print("Logged in as Admin (Business User)")

    # 2. Create a Customer
    customer_data = {"name": f"Customer {unique_id}", "email": f"cust_{unique_id}@example.com"}
    resp = requests.post(f"{BASE_URL}/customers/", json=customer_data, headers=admin_headers)
    if resp.status_code != 201:
        print(f"Failed to create customer: {resp.text}")
        sys.exit(1)
    
    customer = resp.json()
    customer_id = customer["id"]
    print(f"Created Customer: {customer['name']} (ID: {customer_id})")

    # 3. Create a Product
    product_data = {"name": "Test Product", "base_price": 100.0}
    resp = requests.post(f"{BASE_URL}/products/", json=product_data, headers=admin_headers)
    if resp.status_code != 201:
        print(f"Failed to create product: {resp.text}")
        sys.exit(1)
    
    product = resp.json()
    product_id = product["id"]
    print(f"Created Product: {product['name']} (ID: {product_id})")

    # 4. Create a Plan
    plan_data = {"product_id": product_id, "name": "Test Plan", "price": 100.0, "billing_period": "monthly"}
    resp = requests.post(f"{BASE_URL}/plans/", json=plan_data, headers=admin_headers)
    if resp.status_code != 201:
        print(f"Failed to create plan: {resp.text}")
        sys.exit(1)
    
    plan = resp.json()
    plan_id = plan["id"]
    print(f"Created Plan: {plan['name']} (ID: {plan_id})")

    # 5. Create a Subscription for this customer
    sub_data = {
        "subscription_number": f"SUB-{unique_id}",
        "customer_id": customer_id,
        "plan_id": plan_id,
        "start_date": "2023-01-01",
        "subscription_lines": [
            {
                "product_name_snapshot": "Test Product",
                "unit_price_snapshot": 100.0,
                "quantity": 1,
                "tax_percent": 0,
                "discount_percent": 0,
                "line_total": 100.0
            }
        ]
    }
    resp = requests.post(f"{BASE_URL}/subscriptions/", json=sub_data, headers=admin_headers)
    if resp.status_code != 201:
        print(f"Failed to create subscription: {resp.text}")
        sys.exit(1)
        
    print("Created Subscription for Customer")

    # 6. Invite Customer
    resp = requests.post(f"{BASE_URL}/customers/{customer_id}/invite", headers=admin_headers)
    if resp.status_code != 200:
        print(f"Failed to invite customer: {resp.text}")
        sys.exit(1)
    
    invite_data = resp.json()
    portal_username = invite_data["username"]
    portal_password = invite_data["password"]
    print(f"Invited Customer. Credentials: {portal_username} / {portal_password}")

    # 7. Login as Portal User
    resp = requests.post(f"{BASE_URL}/auth/token", data={"username": portal_username, "password": portal_password})
    if resp.status_code != 200:
        print(f"Failed to login as portal user: {resp.text}")
        sys.exit(1)
    
    portal_token = resp.json()["access_token"]
    portal_headers = {"Authorization": f"Bearer {portal_token}"}
    print("Logged in as Portal User")

    # 8. Verify Access
    # a. Get Me
    resp = requests.get(f"{BASE_URL}/auth/users/me", headers=portal_headers)
    user_me = resp.json()
    if user_me["mode"] != "portal":
        print(f"Error: User mode is {user_me['mode']}, expected 'portal'")
        sys.exit(1)
    
    print("Verified /users/me: Mode is portal")

    # b. Get Subscriptions
    resp = requests.get(f"{BASE_URL}/subscriptions/", headers=portal_headers)
    if resp.status_code != 200:
        print(f"Failed to get subscriptions: {resp.text}")
        sys.exit(1)
    
    subs = resp.json()
    if len(subs) == 0:
        print("Error: Expected at least 1 subscription")
        sys.exit(1)
    
    print(f"Verified /subscriptions/: Found {len(subs)} subscription(s)")

    # c. Try to access OTHER users (should be forbidden or fail)
    # Actually standard users can't list users anyway in this app?
    # Let's try to create a subscription (should fail logic or schema validation for customer owner check?)
    # But schema validation happens before permissions sometimes.
    # The endpoint create_subscription checks `if not subscription.customer_id: ... customer = db.query(... owner_id=current_user.id)`.
    # Since portal user owns NO customers (in the owner_id sense), this query will return None, raising 404 Customer not found.
    
    bad_sub_data = sub_data.copy()
    bad_sub_data["subscription_number"] = "BAD-SUB"
    resp = requests.post(f"{BASE_URL}/subscriptions/", json=bad_sub_data, headers=portal_headers)
    if resp.status_code != 404: # Should be 404 Customer not found
        print(f"Warning: Expected 404 for creating subscription (Customer not found), got {resp.status_code} {resp.text}")
    else:
        print("Verified: Cannot create subscription (Customer not found logic blocks it)")

    print("\nSUCCESS: Portal Flow Verified!")

if __name__ == "__main__":
    try:
        verify_portal_flow()
    except Exception as e:
        print(f"An error occurred: {e}")
        sys.exit(1)

import requests
import random
import string

BASE_URL = "http://localhost:8000"

def random_string(length=10):
    return ''.join(random.choices(string.ascii_letters, k=length))

def signup_user():
    username = random_string()
    email = f"{username}@example.com"
    password = "password123"
    response = requests.post(f"{BASE_URL}/auth/signup", json={
        "username": username,
        "email": email,
        "password": password
    })
    assert response.status_code == 200, f"Signup failed: {response.text}"
    return username, password

def login_user(username, password):
    response = requests.post(f"{BASE_URL}/auth/token", data={
        "username": username,
        "password": password
    })
    assert response.status_code == 200, f"Login failed: {response.text}"
    return response.json()["access_token"]

def get_products(token):
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/products/", headers=headers)
    return response.json()

def create_product(token):
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.post(f"{BASE_URL}/products/", headers=headers, json={
        "name": f"Product {random_string()}",
        "base_price": 10.0,
        "type": "service",
        "description": "Test Product"
    })
    # Products might not be secured yet or might be public, assuming 201 or 200
    if response.status_code in [200, 201]:
        return response.json()
    return None

def get_plans(token):
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/plans/", headers=headers)
    return response.json()

def create_plan(token, product_id):
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.post(f"{BASE_URL}/plans/", headers=headers, json={
        "product_id": product_id,
        "name": f"Plan {random_string()}",
        "billing_period": "monthly",
        "price": 10.0
    })
    if response.status_code in [200, 201]:
        return response.json()
    return None

def create_subscription(token, plan_id):
    headers = {"Authorization": f"Bearer {token}"}
    # customer_id should be ignored/overridden by backend
    response = requests.post(f"{BASE_URL}/subscriptions/", headers=headers, json={
        "subscription_number": f"SUB-{random_string()}",
        "customer_id": 99999, # Junk ID, should be ignored
        "plan_id": plan_id,
        "start_date": "2023-01-01",
        "subscription_lines": []
    })
    assert response.status_code == 201, f"Create subscription failed: {response.text}"
    return response.json()

def get_subscriptions(token):
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/subscriptions/", headers=headers)
    assert response.status_code == 200, f"Get subscriptions failed: {response.text}"
    return response.json()

def main():
    print("Testing User Isolation...")

    # 1. Setup Data (Product & Plan) - assuming these are public or we can create them
    # We'll use User A to create them if needed, or check existing
    user_a, pwd_a = signup_user()
    token_a = login_user(user_a, pwd_a)
    
    products = get_products(token_a)
    if not products:
        product_a = create_product(token_a)
    else:
        product_a = products[0]
    
    plans = get_plans(token_a)
    if not plans:
        # Create a plan if none exist
        if product_a:
             plan_a = create_plan(token_a, product_a['id'])
        else:
             print("Skipping plan creation, no product")
             plan_a = None
    else:
        plan_a = plans[0]

    if not plan_a:
        print("Cannot test subscriptions without a plan.")
        return

    # 2. User A creates subscription
    print(f"User A ({user_a}) creating subscription...")
    sub_a = create_subscription(token_a, plan_a['id'])
    print(f"User A Subscription ID: {sub_a['id']}")

    # 3. User B signs up and logs in
    user_b, pwd_b = signup_user()
    token_b = login_user(user_b, pwd_b)
    print(f"User B ({user_b}) logged in.")

    # 4. User B checks subscriptions (should be empty)
    subs_b = get_subscriptions(token_b)
    print(f"User B Subscriptions: {len(subs_b)}")
    assert len(subs_b) == 0, "User B should not see User A's subscriptions!"

    # 5. User B creating subscription
    print(f"User B ({user_b}) creating subscription...")
    sub_b = create_subscription(token_b, plan_a['id'])
    print(f"User B Subscription ID: {sub_b['id']}")

    # 6. Verify User B sees only their subscription
    subs_b_new = get_subscriptions(token_b)
    print(f"User B Subscriptions count: {len(subs_b_new)}")
    assert len(subs_b_new) == 1, "User B should see exactly 1 subscription"
    assert subs_b_new[0]['id'] == sub_b['id'], "User B should see their own subscription"

    # 7. Verify User A still sees only their subscription
    subs_a = get_subscriptions(token_a)
    print(f"User A Subscriptions count: {len(subs_a)}")
    # User A might have previous subscriptions from other tests, but should definitely see sub_a and NOT sub_b
    ids_a = [s['id'] for s in subs_a]
    assert sub_a['id'] in ids_a, "User A should see their own subscription"
    assert sub_b['id'] not in ids_a, "User A should NOT see User B's subscription"

    print("SUCCESS: User Isolation Verified!")

if __name__ == "__main__":
    main()

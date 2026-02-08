#!/bin/bash
set -e

BASE_URL="http://localhost:8000"

echo "1. Registering User A..."
curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email": "usera@example.com", "password": "passwordA", "full_name": "User A"}' > /dev/null

echo "2. Logging in User A..."
TOKEN_A=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=usera@example.com&password=passwordA" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

echo "Token A: $TOKEN_A"

echo "3. Creating Product for User A..."
curl -s -X POST "$BASE_URL/products/" \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Product A",
    "base_price": 100.0,
    "type": "service",
    "description": "User A Product",
    "is_active": true
  }' > /dev/null

echo "4. Registering User B..."
curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email": "userb@example.com", "password": "passwordB", "full_name": "User B"}' > /dev/null

echo "5. Logging in User B..."
TOKEN_B=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=userb@example.com&password=passwordB" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

echo "Token B: $TOKEN_B"

echo "6. Fetching Products for User B (Expect Empty)..."
PRODUCTS_B=$(curl -s -X GET "$BASE_URL/products/" \
  -H "Authorization: Bearer $TOKEN_B")

echo "Products B: $PRODUCTS_B"

if [ "$PRODUCTS_B" == "[]" ]; then
  echo "SUCCESS: User B sees no products."
else
  echo "FAILURE: User B sees products: $PRODUCTS_B"
  exit 1
fi

echo "7. Fetching Products for User A (Expect 1)..."
PRODUCTS_A=$(curl -s -X GET "$BASE_URL/products/" \
  -H "Authorization: Bearer $TOKEN_A")

echo "Products A: $PRODUCTS_A"

if [[ "$PRODUCTS_A" == *"Product A"* ]]; then
  echo "SUCCESS: User A sees their product."
else
  echo "FAILURE: User A does not see their product."
  exit 1
fi

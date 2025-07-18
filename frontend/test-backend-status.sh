#!/bin/bash

echo "Testing Backend Services Status"
echo "================================"

# Test Eureka Server
echo -n "Eureka Server (8761): "
curl -s -o /dev/null -w "%{http_code}" http://localhost:8761/actuator/health || echo "DOWN"
echo ""

# Test API Gateway
echo -n "API Gateway (8085): "
curl -s -o /dev/null -w "%{http_code}" http://localhost:8085/actuator/health || echo "DOWN"
echo ""

# Test User Service
echo -n "User Service (9091): "
curl -s -o /dev/null -w "%{http_code}" http://localhost:9091/actuator/health || echo "DOWN"
echo ""

# Test Auth endpoints through API Gateway
echo ""
echo "Testing Auth Endpoints via API Gateway:"
echo "--------------------------------------"

echo -n "POST /auth/register: "
response=$(curl -s -w "\n%{http_code}" -X POST http://localhost:8085/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","firstName":"Test","lastName":"User"}')
status_code=$(echo "$response" | tail -n 1)
body=$(echo "$response" | head -n -1)
echo "$status_code"
if [ "$status_code" != "201" ] && [ "$status_code" != "200" ]; then
  echo "  Response: $body"
fi

echo -n "POST /auth/login: "
response=$(curl -s -w "\n%{http_code}" -X POST http://localhost:8085/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}')
status_code=$(echo "$response" | tail -n 1)
body=$(echo "$response" | head -n -1)
echo "$status_code"
if [ "$status_code" != "200" ]; then
  echo "  Response: $body"
fi

echo ""
echo "Summary:"
echo "--------"
echo "If you see 403 Forbidden for auth endpoints, the backend security"
echo "configuration needs to be updated to allow public access to:"
echo "  - POST /auth/register"
echo "  - POST /auth/login"
echo "  - POST /auth/refresh"
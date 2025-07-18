# Playwright Testing Guide

This directory contains both E2E (End-to-End) web tests and API tests using Playwright.

## Structure

```
tests/
├── e2e/              # Web UI tests
│   ├── auth.spec.ts  # Authentication flow tests
│   └── booking.spec.ts # Booking flow tests
├── api/              # API tests
│   ├── auth-api.spec.ts # Authentication API tests
│   └── flight-api.spec.ts # Flight API tests
└── fixtures/         # Shared test data and utilities
    ├── test-data.ts  # Test data constants
    └── api-helpers.ts # API testing utilities
```

## Running Tests

```bash
# Run all tests
npm test

# Run only E2E web tests
npm run test:e2e

# Run only API tests
npm run test:api

# Open Playwright UI mode
npm run test:ui

# Debug tests
npm run test:debug

# View test report
npm run test:report
```

## Test Requirements

Before running tests, ensure:

1. **Frontend** is running on http://localhost:5173
2. **Eureka Server** is running on http://localhost:8761
3. **API Gateway** is running on http://localhost:8085
4. **All backend services** are running:
   - User Service (port 9091)
   - Flight Service (port 9092)
   - Booking Service (port 9093)
   - Payment Service (port 9094)
5. **Database** is properly set up with test data

## Writing Tests

### E2E Web Tests
- Use page objects for better organization
- Test complete user flows
- Include both happy path and error scenarios
- Use data-testid attributes for reliable element selection

### API Tests
- Test all endpoints with various scenarios
- Include authentication tests
- Test error responses and edge cases
- Use the APIHelpers class for common operations

## Test Data

Test data is defined in `fixtures/test-data.ts`. Ensure test users exist in the database:

- Regular user: test@example.com
- Admin user: admin@booking.com

## CI/CD Integration

Tests can be integrated into CI/CD pipelines. The configuration supports:
- Parallel test execution
- Retry on failure (in CI mode)
- HTML reporting
- Screenshot on failure
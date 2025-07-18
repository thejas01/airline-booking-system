import { test, expect } from '@playwright/test';
import { APIHelpers } from '../fixtures/api-helpers';
import { testUsers } from '../fixtures/test-data';

test.describe('Authentication API', () => {
  let apiHelper: APIHelpers;

  test.beforeEach(async ({ request }) => {
    apiHelper = new APIHelpers(request, 'http://localhost:8085');
  });

  test('POST /auth/register - should register a new user', async ({ request }) => {
    const uniqueEmail = `test${Date.now()}@example.com`;
    const userData = {
      ...testUsers.valid,
      email: uniqueEmail
    };

    const response = await apiHelper.register(userData);
    
    // Log response details for debugging
    console.log('Response status:', response.status());
    console.log('Response headers:', response.headers());
    
    if (!response.ok()) {
      const errorBody = await response.text();
      console.log('Error response body:', errorBody);
    }
    
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(201);
    
    const data = await response.json();
    expect(data).toHaveProperty('message');
    expect(data.message).toContain('success');
  });

  test('POST /auth/register - should fail with existing email', async ({ request }) => {
    const userData = testUsers.valid;

    const response = await apiHelper.register(userData);
    
    expect(response.ok()).toBeFalsy();
    expect(response.status()).toBe(400);
    
    const data = await response.json();
    expect(data).toHaveProperty('error');
  });

  test('POST /auth/login - should login with valid credentials', async ({ request }) => {
    const response = await request.post('http://localhost:8085/auth/login', {
      data: {
        email: testUsers.valid.email,
        password: testUsers.valid.password
      }
    });

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('accessToken');
    expect(data).toHaveProperty('refreshToken');
    expect(data).toHaveProperty('user');
    expect(data.user.email).toBe(testUsers.valid.email);
  });

  test('POST /auth/login - should fail with invalid credentials', async ({ request }) => {
    const response = await request.post('http://localhost:8085/auth/login', {
      data: {
        email: testUsers.invalid.email,
        password: testUsers.invalid.password
      }
    });

    expect(response.ok()).toBeFalsy();
    expect(response.status()).toBe(401);
    
    const data = await response.json();
    expect(data).toHaveProperty('error');
  });

  test('POST /auth/refresh - should refresh access token', async ({ request }) => {
    // First login to get tokens
    const loginResponse = await request.post('http://localhost:8085/auth/login', {
      data: {
        email: testUsers.valid.email,
        password: testUsers.valid.password
      }
    });
    
    const loginData = await loginResponse.json();
    const refreshToken = loginData.refreshToken;

    // Use refresh token to get new access token
    const response = await request.post('http://localhost:8085/auth/refresh', {
      data: {
        refreshToken: refreshToken
      }
    });

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('accessToken');
    expect(data).toHaveProperty('refreshToken');
  });

  test('POST /auth/logout - should logout successfully', async () => {
    // Login first
    const token = await apiHelper.login(testUsers.valid.email, testUsers.valid.password);
    expect(token).toBeTruthy();

    // Logout
    const response = await apiHelper.postWithAuth('/auth/logout', {});
    
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
  });

  test('DELETE /auth/delete-account - should delete user account', async ({ request }) => {
    // Create a new user for deletion test
    const uniqueEmail = `delete${Date.now()}@example.com`;
    const userData = {
      ...testUsers.valid,
      email: uniqueEmail
    };

    // Register new user
    await apiHelper.register(userData);

    // Login as the new user
    const token = await apiHelper.login(uniqueEmail, testUsers.valid.password);
    apiHelper.setAuthToken(token);

    // Delete account
    const response = await apiHelper.deleteWithAuth('/auth/delete-account');
    
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    // Verify cannot login with deleted account
    const loginResponse = await request.post('http://localhost:8085/auth/login', {
      data: {
        email: uniqueEmail,
        password: testUsers.valid.password
      }
    });
    
    expect(loginResponse.ok()).toBeFalsy();
  });

  test('Protected endpoints should require authentication', async ({ request }) => {
    // Try to access protected endpoint without token
    const response = await request.get('http://localhost:8085/bookings');
    
    expect(response.ok()).toBeFalsy();
    expect(response.status()).toBe(401);
  });

  test('Protected endpoints should work with valid token', async () => {
    // Login to get token
    await apiHelper.login(testUsers.valid.email, testUsers.valid.password);

    // Access protected endpoint with token
    const response = await apiHelper.getWithAuth('/bookings');
    
    // Should not return 401
    expect(response.status()).not.toBe(401);
  });
});
import { test, expect } from '@playwright/test';
import { APIHelpers } from '../fixtures/api-helpers';
import { testUsers, testFlights } from '../fixtures/test-data';

test.describe('Flight API', () => {
  let apiHelper: APIHelpers;
  let adminApiHelper: APIHelpers;

  test.beforeEach(async ({ request }) => {
    apiHelper = new APIHelpers(request, 'http://localhost:8085');
    adminApiHelper = new APIHelpers(request, 'http://localhost:8085');
    
    // Login as regular user
    await apiHelper.login(testUsers.valid.email, testUsers.valid.password);
    
    // Login as admin for admin-only endpoints
    await adminApiHelper.login(testUsers.admin.email, testUsers.admin.password);
  });

  test('GET /flights - should get all flights', async ({ request }) => {
    const response = await request.get('http://localhost:8085/flights');
    
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
  });

  test('GET /flights/search - should search flights', async ({ request }) => {
    const response = await request.get('http://localhost:8085/flights/search', {
      params: {
        departure: 'New York',
        arrival: 'London',
        date: '2024-12-25'
      }
    });
    
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
  });

  test('GET /flights/:id - should get flight by ID', async ({ request }) => {
    // First get all flights to get a valid ID
    const flightsResponse = await request.get('http://localhost:8085/flights');
    const flights = await flightsResponse.json();
    
    if (flights.length > 0) {
      const flightId = flights[0].id;
      const response = await request.get(`http://localhost:8085/flights/${flightId}`);
      
      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('id', flightId);
      expect(data).toHaveProperty('flightNumber');
      expect(data).toHaveProperty('price');
    }
  });

  test('GET /flights/:id - should return 404 for non-existent flight', async ({ request }) => {
    const response = await request.get('http://localhost:8085/flights/non-existent-id');
    
    expect(response.ok()).toBeFalsy();
    expect(response.status()).toBe(404);
  });

  test('POST /admin/flights - should add new flight (admin only)', async () => {
    const response = await adminApiHelper.postWithAuth('/admin/flights', testFlights.sample);
    
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(201);
    
    const data = await response.json();
    expect(data).toHaveProperty('id');
    expect(data).toHaveProperty('flightNumber', testFlights.sample.flightNumber);
  });

  test('POST /admin/flights - should fail for non-admin user', async () => {
    const response = await apiHelper.postWithAuth('/admin/flights', testFlights.sample);
    
    expect(response.ok()).toBeFalsy();
    expect(response.status()).toBe(403);
  });

  test('PUT /admin/flights/:id - should update flight (admin only)', async ({ request }) => {
    // First get a flight to update
    const flightsResponse = await request.get('http://localhost:8085/flights');
    const flights = await flightsResponse.json();
    
    if (flights.length > 0) {
      const flightId = flights[0].id;
      const updatedData = {
        ...flights[0],
        price: 999.99
      };
      
      const response = await adminApiHelper.putWithAuth(`/admin/flights/${flightId}`, updatedData);
      
      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('price', 999.99);
    }
  });

  test('DELETE /admin/flights/:id - should delete flight (admin only)', async ({ request }) => {
    // First create a flight to delete
    const createResponse = await adminApiHelper.postWithAuth('/admin/flights', {
      ...testFlights.sample,
      flightNumber: 'DEL001'
    });
    
    if (createResponse.ok()) {
      const createdFlight = await createResponse.json();
      const flightId = createdFlight.id;
      
      // Delete the flight
      const response = await adminApiHelper.deleteWithAuth(`/admin/flights/${flightId}`);
      
      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);
      
      // Verify flight is deleted
      const getResponse = await request.get(`http://localhost:8085/flights/${flightId}`);
      expect(getResponse.status()).toBe(404);
    }
  });

  test('Flight search with filters', async ({ request }) => {
    const response = await request.get('http://localhost:8085/flights/search', {
      params: {
        departure: 'New York',
        arrival: 'London',
        date: '2024-12-25',
        minPrice: 100,
        maxPrice: 1000,
        airline: 'Test Airlines'
      }
    });
    
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
    
    // Verify filters are applied
    data.forEach((flight: any) => {
      expect(flight.price).toBeGreaterThanOrEqual(100);
      expect(flight.price).toBeLessThanOrEqual(1000);
    });
  });
});
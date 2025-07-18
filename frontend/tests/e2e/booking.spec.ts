import { test, expect } from '@playwright/test';
import { testUsers, testFlights, testBooking } from '../fixtures/test-data';

test.describe('Booking Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/');
    await page.fill('input[type="email"]', testUsers.valid.email);
    await page.fill('input[type="password"]', testUsers.valid.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/flights');
  });

  test('should search for flights', async ({ page }) => {
    // Fill search form
    await page.fill('input[placeholder="New York, London, etc."]', 'New York');
    await page.fill('input[placeholder="Paris, Tokyo, etc."]', 'London');
    
    // Select date (assuming date picker)
    const dateInput = page.locator('input[type="date"]');
    await dateInput.fill('2024-12-25');
    
    // Search
    await page.click('button:has-text("Search Flights")');
    
    // Should show results
    await expect(page.locator('.space-y-4')).toBeVisible();
  });

  test('should display flight details', async ({ page }) => {
    // Navigate to a flight
    const flightCard = page.locator('.bg-white').first();
    await expect(flightCard).toBeVisible();
    
    // Check flight information is displayed
    await expect(flightCard).toContainText('$');
    await expect(flightCard.locator('button:has-text("Book Now")')).toBeVisible();
  });

  test('should book a flight', async ({ page }) => {
    // Click book now on first available flight
    await page.click('button:has-text("Book Now")').first();
    
    // Should navigate to booking page
    await page.waitForURL('**/booking/**');
    
    // Fill passenger details
    await page.fill('input[placeholder="John"]', testBooking.passengers[0].firstName);
    await page.fill('input[placeholder="Doe"]', testBooking.passengers[0].lastName);
    await page.fill('input[placeholder="john@example.com"]', testBooking.passengers[0].email);
    await page.fill('input[placeholder="+1234567890"]', testBooking.passengers[0].phone);
    
    // Add another passenger
    await page.click('button:has-text("Add Passenger")');
    const secondPassenger = page.locator('.space-y-4').nth(1);
    await secondPassenger.locator('input[placeholder="John"]').fill(testBooking.passengers[1].firstName);
    await secondPassenger.locator('input[placeholder="Doe"]').fill(testBooking.passengers[1].lastName);
    await secondPassenger.locator('input[placeholder="john@example.com"]').fill(testBooking.passengers[1].email);
    await secondPassenger.locator('input[placeholder="+1234567890"]').fill(testBooking.passengers[1].phone);
    
    // Proceed to payment
    await page.click('button:has-text("Proceed to Payment")');
  });

  test('should handle payment', async ({ page }) => {
    // Navigate to payment (assuming we're on a booking page)
    await page.goto('/booking/123'); // Replace with actual booking ID
    
    // Fill payment details
    await page.fill('input[placeholder="1234 5678 9012 3456"]', testBooking.payment.cardNumber);
    await page.fill('input[placeholder="John Doe"]', testBooking.payment.cardHolder);
    await page.fill('input[placeholder="MM"]', testBooking.payment.expiryMonth);
    await page.fill('input[placeholder="YY"]', testBooking.payment.expiryYear.slice(-2));
    await page.fill('input[placeholder="123"]', testBooking.payment.cvv);
    
    // Submit payment
    await page.click('button:has-text("Complete Payment")');
    
    // Should show success message
    await expect(page.locator('text=Payment successful')).toBeVisible();
  });

  test('should view booking history', async ({ page }) => {
    // Navigate to bookings
    await page.click('a:has-text("My Bookings")');
    
    await page.waitForURL('**/bookings');
    
    // Should show bookings list
    await expect(page.locator('h1')).toContainText('My Bookings');
    
    // Check if bookings are displayed
    const bookingsList = page.locator('.space-y-4');
    await expect(bookingsList).toBeVisible();
  });

  test('should cancel a booking', async ({ page }) => {
    // Navigate to bookings
    await page.goto('/bookings');
    
    // Click on a booking to view details (if bookings exist)
    const booking = page.locator('.bg-white').first();
    if (await booking.isVisible()) {
      await booking.click();
      
      // Click cancel button
      await page.click('button:has-text("Cancel Booking")');
      
      // Confirm cancellation
      await page.click('button:has-text("Yes, Cancel")');
      
      // Should show cancellation success
      await expect(page.locator('text=Booking cancelled')).toBeVisible();
    }
  });

  test('should handle form validation', async ({ page }) => {
    // Try to book without filling required fields
    await page.click('button:has-text("Book Now")').first();
    await page.waitForURL('**/booking/**');
    
    // Try to proceed without filling passenger details
    await page.click('button:has-text("Proceed to Payment")');
    
    // Should show validation errors
    await expect(page.locator('text=required')).toBeVisible();
  });
});
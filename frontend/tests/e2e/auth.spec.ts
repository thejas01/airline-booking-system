import { test, expect } from '@playwright/test';
import { testUsers } from '../fixtures/test-data';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login page by default', async ({ page }) => {
    await expect(page.locator('h2')).toContainText('Welcome Back');
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('should navigate to register page', async ({ page }) => {
    await page.click('text=Create an account');
    await expect(page.locator('h2')).toContainText('Create Account');
    await expect(page.locator('input[placeholder="John"]')).toBeVisible();
    await expect(page.locator('input[placeholder="Doe"]')).toBeVisible();
  });

  test('should register a new user', async ({ page }) => {
    await page.click('text=Create an account');
    
    // Generate unique email for test
    const uniqueEmail = `test${Date.now()}@example.com`;
    
    await page.fill('input[placeholder="John"]', testUsers.valid.firstName);
    await page.fill('input[placeholder="Doe"]', testUsers.valid.lastName);
    await page.fill('input[type="email"]', uniqueEmail);
    await page.fill('input[type="password"]', testUsers.valid.password);
    
    await page.click('button[type="submit"]');
    
    // Should redirect to login after successful registration
    await expect(page.locator('h2')).toContainText('Welcome Back');
    await expect(page.locator('.text-green-600')).toContainText('Registration successful');
  });

  test('should show validation errors for invalid registration', async ({ page }) => {
    await page.click('text=Create an account');
    
    // Submit empty form
    await page.click('button[type="submit"]');
    
    // Check for validation messages
    await expect(page.locator('form')).toContainText('required');
  });

  test('should login with valid credentials', async ({ page }) => {
    // Note: This test assumes a user exists in the database
    // In a real scenario, you'd set up test data before running
    await page.fill('input[type="email"]', testUsers.valid.email);
    await page.fill('input[type="password"]', testUsers.valid.password);
    
    await page.click('button[type="submit"]');
    
    // Should redirect to flights page after successful login
    await page.waitForURL('**/flights');
    await expect(page.locator('h1')).toContainText('Find Your Next Flight');
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.fill('input[type="email"]', testUsers.invalid.email);
    await page.fill('input[type="password"]', testUsers.invalid.password);
    
    await page.click('button[type="submit"]');
    
    // Should show error message
    await expect(page.locator('.text-red-600')).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.fill('input[type="email"]', testUsers.valid.email);
    await page.fill('input[type="password"]', testUsers.valid.password);
    await page.click('button[type="submit"]');
    
    await page.waitForURL('**/flights');
    
    // Click logout button
    await page.click('button:has-text("Logout")');
    
    // Should redirect to login page
    await expect(page.locator('h2')).toContainText('Welcome Back');
  });

  test('should persist authentication on page reload', async ({ page }) => {
    // Login first
    await page.fill('input[type="email"]', testUsers.valid.email);
    await page.fill('input[type="password"]', testUsers.valid.password);
    await page.click('button[type="submit"]');
    
    await page.waitForURL('**/flights');
    
    // Reload page
    await page.reload();
    
    // Should still be on flights page
    await expect(page.locator('h1')).toContainText('Find Your Next Flight');
  });

  test('should redirect to login when accessing protected routes without auth', async ({ page }) => {
    // Try to access flights page directly
    await page.goto('/flights');
    
    // Should redirect to login
    await expect(page.locator('h2')).toContainText('Welcome Back');
  });
});
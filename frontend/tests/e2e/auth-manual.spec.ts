import { test, expect } from '@playwright/test';

test.describe('Manual Authentication Test', () => {
  test('verify backend authentication endpoints', async ({ page }) => {
    // Navigate to the frontend
    await page.goto('/');
    
    // Check if login page loads
    await expect(page.locator('h2')).toContainText('Welcome Back');
    
    // Try to navigate to register page
    await page.click('text=Create an account');
    await expect(page.locator('h2')).toContainText('Create Account');
    
    // Fill in registration form
    await page.fill('input[placeholder="John"]', 'Test');
    await page.fill('input[placeholder="Doe"]', 'User');
    await page.fill('input[type="email"]', `test${Date.now()}@example.com`);
    await page.fill('input[type="password"]', 'Test123!@#');
    
    // Try to submit and see what happens
    await page.click('button[type="submit"]');
    
    // Wait a bit to see the response
    await page.waitForTimeout(2000);
    
    // Take a screenshot to see what's happening
    await page.screenshot({ path: 'auth-test-result.png', fullPage: true });
    
    // Log any error messages
    const errorElement = page.locator('.text-red-600');
    if (await errorElement.isVisible()) {
      const errorText = await errorElement.textContent();
      console.log('Error message:', errorText);
    }
    
    // Check if we're still on register page or redirected
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);
  });
});
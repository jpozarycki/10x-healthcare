import { test, expect } from '@playwright/test';

test.describe('Login functionality', () => {
  test('displays login form', async ({ page }) => {
    await page.goto('/auth/login');
    
    // Check that form elements are visible
    await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });
  
  test('shows error with invalid credentials', async ({ page }) => {
    await page.goto('/auth/login');
    
    // Fill in the form with invalid credentials
    await page.getByRole('textbox', { name: /email/i }).fill('invalid@example.com');
    await page.getByLabel(/password/i).fill('wrongpassword');
    
    // Submit the form
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Check for error message
    await expect(page.getByText(/invalid email or password/i)).toBeVisible({ timeout: 5000 });
  });
  
  // Note: This test would need a test account or mocked auth in a real scenario
  test.skip('successful login redirects to dashboard', async ({ page }) => {
    await page.goto('/auth/login');
    
    // Fill in the form with valid credentials
    await page.getByRole('textbox', { name: /email/i }).fill('test@example.com');
    await page.getByLabel(/password/i).fill('password123');
    
    // Submit the form
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Check that we've been redirected to the dashboard
    await expect(page).toHaveURL(/.*dashboard.*/);
  });
}); 
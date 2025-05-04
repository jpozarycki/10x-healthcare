import { test, expect } from '@playwright/test';

test.describe('Login functionality', () => {
  test('displays login form', async ({ page }) => {
    await page.goto('/auth/login');
    
    // Check that form elements are visible
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });
  
  test('shows error with invalid credentials', async ({ page }) => {
    await page.goto('/auth/login');
    
    // Fill in the form with invalid credentials
    await page.getByLabel('Email').fill('invalid@example.com');
    await page.getByLabel('Password').fill('wrongpassword');
    
    // Submit the form
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Check for error modal - using text content instead of role
    await expect(page.getByText('Authentication Failed')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Incorrect login data')).toBeVisible();
    
    // Verify the Close button is also visible
    await expect(page.getByRole('button', { name: 'Close' })).toBeVisible();
  });
  
  test('successful login redirects to medications (dashboard disabled)', async ({ page }) => {
    // Set longer timeout for this test
    test.setTimeout(60000);
    
    await page.goto('/auth/login');
    
    // Make sure the form is fully loaded
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    
    // Fill in the form with valid credentials
    await page.getByLabel('Email').fill(process.env.E2E_USERNAME);
    await page.getByLabel('Password').fill(process.env.E2E_PASSWORD);
    
    // Click the submit button
    await page.getByRole('button', { name: /sign in/i }).click();
    
    try {
      // Wait for success message to appear
      await expect(page.getByText('Authentication Successful')).toBeVisible({ timeout: 15000 });
      await expect(page.getByText('Login successful! Redirecting to medications...')).toBeVisible();
      
      // Wait for navigation to medications (with a longer timeout)
      await expect(async () => {
        const url = page.url();
        expect(url).toContain('/medications');
      }).toPass({ timeout: 20000 });
    } catch (error) {
      throw error;
    }
  });
}); 
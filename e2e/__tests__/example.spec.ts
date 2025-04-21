import { test, expect } from '@playwright/test';

test('basic navigation test', async ({ page }) => {
  // Navigate to the homepage
  await page.goto('/');
  
  // Check that the page has loaded
  await expect(page).toHaveTitle(/MedMinder\+/);
});

test('navigation works', async ({ page }) => {
  // Navigate to the homepage
  await page.goto('/');
  
  // Check for navigation elements
  const navElement = page.getByRole('navigation');
  await expect(navElement).toBeVisible();
}); 
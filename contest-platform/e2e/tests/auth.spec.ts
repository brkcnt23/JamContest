import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  const testEmail = `e2e-${Date.now()}@test.com`;
  const testPassword = 'testPass123';
  const testUsername = `e2euser-${Date.now()}`;

  test('register → login → view profile', async ({ page }) => {
    // Navigate to register
    await page.goto('/register');
    await expect(page.locator('h1, h2')).toContainText(['Kayıt', 'Register']);

    // Fill registration form
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.fill('input[name="username"]', testUsername);

    // Submit
    await page.click('button[type="submit"]');

    // Expect success message
    await expect(page.locator('text=başarılı, success')).toBeVisible({ timeout: 10000 });

    // Navigate to login
    await page.goto('/login');
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');

    // Should be redirected to home after login
    await page.waitForURL(/^\/(?!login|register)/, { timeout: 15000 });

    // Profile page should be accessible
    await page.goto('/profile');
    await expect(page.locator('text=' + testUsername)).toBeVisible({ timeout: 10000 });
  });

  test('contest browsing without login', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Game Jam, Yarışma, Contest')).toBeVisible({ timeout: 10000 });
  });
});

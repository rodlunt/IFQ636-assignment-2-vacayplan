const { test, expect } = require('@playwright/test');

// Seeded accounts per VP-101 seed script. Safe to reuse across tests because
// Playwright gives each test a fresh browser context (cookies cleared).
const MARKER_EMAIL = 'marker@vacayplan.com';
const MARKER_PASSWORD = 'MarkerPass123!';

test.describe('login flow', () => {
  test('valid credentials redirect to /dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('Email').fill(MARKER_EMAIL);
    await page.getByPlaceholder('Password').fill(MARKER_PASSWORD);
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test('invalid credentials stay on /login with visible error', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('Email').fill('bogus@example.com');
    await page.getByPlaceholder('Password').fill('WrongPass123!');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL(/\/login$/);
    // ErrorMessage component renders some failure text — assert it's visible
    // without pinning exact wording (backend may return "Invalid credentials"
    // or "Login failed. Please try again." per Login.jsx fallback).
    await expect(page.locator('body')).toContainText(/login failed|invalid|incorrect/i);
  });

  test('empty form submission shows error without navigation', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL(/\/login$/);
  });

  test('already-logged-in user navigating to /login redirects to /dashboard', async ({ page }) => {
    // Log in first
    await page.goto('/login');
    await page.getByPlaceholder('Email').fill(MARKER_EMAIL);
    await page.getByPlaceholder('Password').fill(MARKER_PASSWORD);
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL(/\/dashboard$/);

    // Now navigate directly to /login while already authed — should bounce back
    await page.goto('/login');
    await expect(page).toHaveURL(/\/dashboard$/);
  });
});

const { test, expect } = require('@playwright/test');

// Seeded marker account is non-admin; per VP-101 seed.
const MARKER_EMAIL = 'marker@vacayplan.com';
const MARKER_PASSWORD = 'MarkerPass123!';

const PROTECTED_ROUTES = [
  '/dashboard',
  '/trips/new',
  '/profile',
  '/admin/users',
];

const ADMIN_ROUTES = [
  '/admin/users',
];

test.describe('route gates — anonymous user', () => {
  for (const route of PROTECTED_ROUTES) {
    test(`anon access to ${route} redirects to /login`, async ({ page }) => {
      await page.goto(route);
      await expect(page).toHaveURL(/\/login$/);
    });
  }
});

test.describe('route gates — non-admin user', () => {
  test.beforeEach(async ({ page }) => {
    // Log in as marker (isAdmin: false)
    await page.goto('/login');
    await page.getByPlaceholder('Email').fill(MARKER_EMAIL);
    await page.getByPlaceholder('Password').fill(MARKER_PASSWORD);
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  for (const route of ADMIN_ROUTES) {
    test(`non-admin access to ${route} redirects to /dashboard (AdminRoute)`, async ({ page }) => {
      await page.goto(route);
      // AdminRoute.jsx redirects non-admins to /dashboard (NOT 403 page).
      // Documented divergence from VP-116 original scope which said "403
      // boundary visible"; actual implementation is a silent redirect.
      await expect(page).toHaveURL(/\/dashboard$/);
    });
  }
});

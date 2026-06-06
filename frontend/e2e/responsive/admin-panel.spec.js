const { test, expect } = require('@playwright/test');

const ADMIN_EMAIL = 'admin@vacayplan.com';
const ADMIN_PASSWORD = 'AdminPass123!';

const loginAsAdmin = async (page) => {
  await page.goto('/login');
  await page.getByPlaceholder('Email').fill(ADMIN_EMAIL);
  await page.getByPlaceholder('Password').fill(ADMIN_PASSWORD);
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.goto('/admin/users');
};

test.describe('responsive: Admin Panel', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('Breadcrumb + heading + Admin Mode badge + + Add User CTA render at all viewports', async ({ page }) => {
    await expect(page.getByRole('navigation', { name: 'Breadcrumb' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Admin · Users' })).toBeVisible();
    await expect(page.getByText('Admin Mode')).toBeVisible();
    await expect(page.getByRole('button', { name: '+ Add User' })).toBeVisible();
  });

  test('4 admin stats tiles render at all viewports', async ({ page }) => {
    const stats = page.getByRole('region', { name: 'Admin stats' });
    await expect(stats.getByText('Total Users')).toBeVisible();
    await expect(stats.getByText('Total Trips')).toBeVisible();
    await expect(stats.getByText('Active Trips')).toBeVisible();
    await expect(stats.getByText('Flagged Items')).toBeVisible();
  });

  test('All Trips section renders at all viewports', async ({ page }) => {
    await expect(page.getByRole('region', { name: 'All trips' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'All Trips' })).toBeVisible();
  });
});

const { test, expect } = require('@playwright/test');

const ADMIN_EMAIL = 'admin@vacayplan.com';
const ADMIN_PASSWORD = 'AdminPass123!';

const loginAsAdmin = async (page) => {
  await page.goto('/login');
  await page.getByPlaceholder('Email').fill(ADMIN_EMAIL);
  await page.getByPlaceholder('Password').fill(ADMIN_PASSWORD);
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
};

test.describe('admin user list view', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/users');
  });

  test('renders "Admin · Users" heading', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /Admin.+Users/ }),
    ).toBeVisible();
  });

  test('renders "+ Add User" button', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: '+ Add User' }),
    ).toBeVisible();
  });

  test('user table renders with required columns', async ({ page }) => {
    const columns = ['Email', 'Role', 'Status', 'Registered', 'Actions'];
    for (const col of columns) {
      await expect(
        page.getByRole('columnheader', { name: col }),
      ).toBeVisible();
    }
  });

  test('at least one user row is present (seeded admin + marker)', async ({ page }) => {
    // Seeded users guarantee >=2 rows
    const rows = page.locator('tbody tr');
    await expect(rows.first()).toBeVisible();
    const count = await rows.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test('seeded admin appears in the table as Admin role', async ({ page }) => {
    const adminRow = page.locator('tbody tr', {
      hasText: ADMIN_EMAIL,
    });
    await expect(adminRow).toBeVisible();
    await expect(adminRow.getByText('Admin', { exact: true })).toBeVisible();
  });
});

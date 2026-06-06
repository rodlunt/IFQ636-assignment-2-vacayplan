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

let authToken = null;

test.beforeAll(async ({ request, baseURL }) => {
  const res = await request.post(`${baseURL}/api/auth/login`, {
    data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
  });
  const body = await res.json();
  authToken = body.token;
});

const uniqueEmail = (prefix = 'e2e-create-admin') =>
  `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}@example.com`;

const deleteUserByEmail = async (request, baseURL, email) => {
  // Find the user via the admin list endpoint, then delete by ID
  const listRes = await request.get(`${baseURL}/api/admin/users`, {
    headers: { Authorization: `Bearer ${authToken}` },
  });
  const users = await listRes.json();
  const target = users.find((u) => u.email === email);
  if (target) {
    await request.delete(`${baseURL}/api/admin/users/${target._id}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
  }
};

test.describe('admin Create User modal', () => {
  let createdEmail = null;

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/users');
  });

  test.afterEach(async ({ request, baseURL }) => {
    if (createdEmail) {
      await deleteUserByEmail(request, baseURL, createdEmail).catch(() => {});
      createdEmail = null;
    }
  });

  test('+ Add User button opens the Create User modal', async ({ page }) => {
    await page.getByRole('button', { name: '+ Add User' }).click();
    const dialog = page.getByRole('dialog', { name: 'Create New User' });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('heading', { name: 'Create New User' })).toBeVisible();
  });

  test('valid form creates a user and shows it in the table', async ({ page }) => {
    createdEmail = uniqueEmail();
    await page.getByRole('button', { name: '+ Add User' }).click();
    const dialog = page.getByRole('dialog', { name: 'Create New User' });
    await dialog.getByLabel('Full name').fill('E2E Test User');
    await dialog.getByLabel('Email').fill(createdEmail);
    await dialog.getByLabel('Password').fill('TestPass123!');
    await dialog.getByRole('button', { name: 'Create User' }).click();

    // Modal closes + new row appears
    await expect(dialog).not.toBeVisible();
    await expect(page.getByText(createdEmail)).toBeVisible();
  });

  test('isAdmin checkbox creates user with Admin role', async ({ page }) => {
    createdEmail = uniqueEmail('e2e-create-as-admin');
    await page.getByRole('button', { name: '+ Add User' }).click();
    const dialog = page.getByRole('dialog', { name: 'Create New User' });
    await dialog.getByLabel('Full name').fill('E2E Admin Test');
    await dialog.getByLabel('Email').fill(createdEmail);
    await dialog.getByLabel('Password').fill('TestPass123!');
    await dialog.getByLabel('Make this user an administrator').check();
    await dialog.getByRole('button', { name: 'Create User' }).click();

    await expect(dialog).not.toBeVisible();
    const newRow = page.locator('tbody tr', { hasText: createdEmail });
    await expect(newRow).toBeVisible();
    await expect(newRow.getByText('Admin', { exact: true })).toBeVisible();
  });

  test('duplicate email shows visible error and stays in modal', async ({ page }) => {
    await page.getByRole('button', { name: '+ Add User' }).click();
    const dialog = page.getByRole('dialog', { name: 'Create New User' });
    await dialog.getByLabel('Full name').fill('Dup Attempt');
    // Reuse seeded admin email — guaranteed duplicate
    await dialog.getByLabel('Email').fill(ADMIN_EMAIL);
    await dialog.getByLabel('Password').fill('TestPass123!');
    await dialog.getByRole('button', { name: 'Create User' }).click();

    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText(/already|exists|registered/i);
  });

  test('Cancel button closes modal without creating', async ({ page }) => {
    await page.getByRole('button', { name: '+ Add User' }).click();
    const dialog = page.getByRole('dialog', { name: 'Create New User' });
    await dialog.getByLabel('Full name').fill('Should Not Be Created');
    await dialog.getByRole('button', { name: 'Cancel' }).click();
    await expect(dialog).not.toBeVisible();
    await expect(
      page.locator('tbody tr', { hasText: 'Should Not Be Created' }),
    ).toHaveCount(0);
  });
});

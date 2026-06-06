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

const uniqueEmail = (prefix = 'e2e-update-admin') =>
  `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}@example.com`;

const createUserViaApi = async (request, baseURL, email) => {
  const res = await request.post(`${baseURL}/api/admin/users`, {
    headers: { Authorization: `Bearer ${authToken}` },
    data: {
      name: 'E2E Update Target',
      email,
      password: 'TestPass123!',
    },
  });
  return res.json();
};

const setUserStatusViaApi = async (request, baseURL, userId, status) => {
  await request.patch(`${baseURL}/api/admin/users/${userId}`, {
    headers: { Authorization: `Bearer ${authToken}` },
    data: { status },
  });
};

const deleteUserViaApi = async (request, baseURL, userId) => {
  await request.delete(`${baseURL}/api/admin/users/${userId}`, {
    headers: { Authorization: `Bearer ${authToken}` },
  });
};

test.describe('admin Deactivate / Reactivate flow', () => {
  let createdUser = null;

  test.beforeEach(async ({ request, baseURL, page }) => {
    createdUser = await createUserViaApi(request, baseURL, uniqueEmail());
    await loginAsAdmin(page);
    await page.goto('/admin/users');
  });

  test.afterEach(async ({ request, baseURL }) => {
    if (createdUser?._id) {
      await deleteUserViaApi(request, baseURL, createdUser._id).catch(() => {});
      createdUser = null;
    }
  });

  test('Deactivate row button opens confirm dialog', async ({ page }) => {
    await page
      .getByRole('button', { name: `Deactivate ${createdUser.email}` })
      .click();
    const dialog = page.getByRole('dialog', { name: 'Deactivate user?' });
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText(createdUser.email);
  });

  test('Confirm Deactivate changes row status to Deactivated', async ({ page }) => {
    await page
      .getByRole('button', { name: `Deactivate ${createdUser.email}` })
      .click();
    const dialog = page.getByRole('dialog', { name: 'Deactivate user?' });
    await dialog.getByRole('button', { name: 'Deactivate' }).click();
    await expect(dialog).not.toBeVisible();

    const row = page.locator('tbody tr', { hasText: createdUser.email });
    await expect(row.getByText('Deactivated')).toBeVisible();
    // Row action toggles to "Reactivate"
    await expect(
      page.getByRole('button', { name: `Reactivate ${createdUser.email}` }),
    ).toBeVisible();
  });

  test('Reactivate row button restores Active status', async ({ page, request, baseURL }) => {
    // Pre-deactivate via API so the row starts in the deactivated state
    await setUserStatusViaApi(request, baseURL, createdUser._id, 'deactivated');
    await page.reload();

    await page
      .getByRole('button', { name: `Reactivate ${createdUser.email}` })
      .click();
    const dialog = page.getByRole('dialog', { name: 'Reactivate user?' });
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: 'Reactivate' }).click();
    await expect(dialog).not.toBeVisible();

    const row = page.locator('tbody tr', { hasText: createdUser.email });
    await expect(row.getByText('Active', { exact: true })).toBeVisible();
  });

  test('Cancel in confirm dialog leaves status unchanged', async ({ page }) => {
    await page
      .getByRole('button', { name: `Deactivate ${createdUser.email}` })
      .click();
    const dialog = page.getByRole('dialog', { name: 'Deactivate user?' });
    await dialog.getByRole('button', { name: 'Cancel' }).click();
    await expect(dialog).not.toBeVisible();

    const row = page.locator('tbody tr', { hasText: createdUser.email });
    await expect(row.getByText('Active', { exact: true })).toBeVisible();
  });
});

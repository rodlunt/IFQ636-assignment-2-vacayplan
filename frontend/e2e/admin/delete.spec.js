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

const uniqueEmail = () =>
  `e2e-delete-admin-${Date.now()}-${Math.floor(Math.random() * 1000)}@example.com`;

const createUserViaApi = async (request, baseURL, email) => {
  const res = await request.post(`${baseURL}/api/admin/users`, {
    headers: { Authorization: `Bearer ${authToken}` },
    data: {
      name: 'E2E Delete Target',
      email,
      password: 'TestPass123!',
    },
  });
  return res.json();
};

const deleteUserViaApi = async (request, baseURL, userId) => {
  await request.delete(`${baseURL}/api/admin/users/${userId}`, {
    headers: { Authorization: `Bearer ${authToken}` },
  });
};

test.describe('admin Delete user flow with type-email double-confirm', () => {
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

  test('Delete row button opens "Delete user permanently?" dialog', async ({ page }) => {
    await page
      .getByRole('button', { name: `Delete ${createdUser.email}` })
      .click();
    const dialog = page.getByRole('dialog', { name: 'Delete user permanently?' });
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText(createdUser.email);
  });

  test('Delete permanently button is disabled until typed email matches', async ({ page }) => {
    await page
      .getByRole('button', { name: `Delete ${createdUser.email}` })
      .click();
    const dialog = page.getByRole('dialog', { name: 'Delete user permanently?' });
    const confirmBtn = dialog.getByRole('button', { name: 'Delete permanently' });
    await expect(confirmBtn).toBeDisabled();

    // Wrong email — still disabled
    const emailInput = dialog.locator('#confirm-delete-email');
    await emailInput.fill('wrong@example.com');
    await expect(confirmBtn).toBeDisabled();

    // Correct email — enabled
    await emailInput.fill(createdUser.email);
    await expect(confirmBtn).toBeEnabled();
  });

  test('Typing matching email + Confirm deletes user from table', async ({ page }) => {
    const userEmail = createdUser.email;
    await page
      .getByRole('button', { name: `Delete ${userEmail}` })
      .click();
    const dialog = page.getByRole('dialog', { name: 'Delete user permanently?' });
    await dialog.locator('#confirm-delete-email').fill(userEmail);
    await dialog.getByRole('button', { name: 'Delete permanently' }).click();

    await expect(dialog).not.toBeVisible();
    // User row should be gone from table
    await expect(
      page.locator('tbody tr', { hasText: userEmail }),
    ).toHaveCount(0);

    // Mark as deleted so afterEach doesn't try to clean up again
    createdUser = null;
  });

  test('Cancel in confirm dialog leaves user intact', async ({ page }) => {
    const userEmail = createdUser.email;
    await page
      .getByRole('button', { name: `Delete ${userEmail}` })
      .click();
    const dialog = page.getByRole('dialog', { name: 'Delete user permanently?' });
    await dialog.locator('#confirm-delete-email').fill(userEmail);
    await dialog.getByRole('button', { name: 'Cancel' }).click();
    await expect(dialog).not.toBeVisible();

    // User row should still exist
    await expect(
      page.locator('tbody tr', { hasText: userEmail }),
    ).toBeVisible();
  });
});

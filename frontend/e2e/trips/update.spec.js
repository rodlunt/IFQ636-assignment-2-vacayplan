const { test, expect } = require('@playwright/test');

const MARKER_EMAIL = 'marker@vacayplan.com';
const MARKER_PASSWORD = 'MarkerPass123!';

const loginAsMarker = async (page) => {
  await page.goto('/login');
  await page.getByPlaceholder('Email').fill(MARKER_EMAIL);
  await page.getByPlaceholder('Password').fill(MARKER_PASSWORD);
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
};

let authToken = null;

test.beforeAll(async ({ request, baseURL }) => {
  const res = await request.post(`${baseURL}/api/auth/login`, {
    data: { email: MARKER_EMAIL, password: MARKER_PASSWORD },
  });
  const body = await res.json();
  authToken = body.token;
});

test.describe('trip update flow', () => {
  let createdTrip;

  test.beforeEach(async ({ request, baseURL, page }) => {
    const res = await request.post(`${baseURL}/api/trips`, {
      headers: { Authorization: `Bearer ${authToken}` },
      data: {
        destination: `e2e-update-orig-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        startDate: '2026-10-01',
        endDate: '2026-10-08',
        budget: 2000,
      },
    });
    createdTrip = await res.json();
    await loginAsMarker(page);
  });

  test.afterEach(async ({ request, baseURL }) => {
    if (createdTrip?._id) {
      await request.delete(`${baseURL}/api/trips/${createdTrip._id}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
    }
  });

  test('update destination → save → new destination visible on detail page', async ({ page }) => {
    const newDestination = `e2e-update-new-${Date.now()}`;
    await page.goto(`/trips/${createdTrip._id}/edit`);
    await expect(page.getByRole('heading', { name: 'Edit Trip' })).toBeVisible();

    const destInput = page.getByLabel(/Destination/);
    await destInput.fill(newDestination);
    await page.getByRole('button', { name: /Save changes/ }).click();

    await expect(page).toHaveURL(new RegExp(`/trips/${createdTrip._id}$`));
    await expect(
      page.getByRole('heading', { name: new RegExp(newDestination) }),
    ).toBeVisible();
  });

  test('update budget → save → new budget visible on detail page', async ({ page }) => {
    await page.goto(`/trips/${createdTrip._id}/edit`);

    const budgetInput = page.getByLabel(/Budget/);
    await budgetInput.fill('9999');
    await page.getByRole('button', { name: /Save changes/ }).click();

    await expect(page).toHaveURL(new RegExp(`/trips/${createdTrip._id}$`));
    // Currency formatter renders 9,999 (AUD, no decimals)
    await expect(page.locator('body')).toContainText(/\$9,999/);
  });

  test('empty destination shows client-side error and stays on edit page', async ({ page }) => {
    await page.goto(`/trips/${createdTrip._id}/edit`);
    await page.getByLabel(/Destination/).fill('');
    await page.getByRole('button', { name: /Save changes/ }).click();
    await expect(page).toHaveURL(new RegExp(`/trips/${createdTrip._id}/edit$`));
    await expect(page.locator('body')).toContainText(/destination is required/i);
  });

  test('cancel button returns to /trips/:id without saving', async ({ page }) => {
    await page.goto(`/trips/${createdTrip._id}/edit`);
    await page.getByLabel(/Destination/).fill('Cancelled Edit');
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page).toHaveURL(new RegExp(`/trips/${createdTrip._id}$`));
    // Original destination should still be visible (not the cancelled edit)
    await expect(
      page.getByRole('heading', { name: new RegExp(createdTrip.destination) }),
    ).toBeVisible();
  });
});

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

test.describe('trip delete flow', () => {
  let createdTrip;

  test.beforeEach(async ({ request, baseURL, page }) => {
    const res = await request.post(`${baseURL}/api/trips`, {
      headers: { Authorization: `Bearer ${authToken}` },
      data: {
        destination: `e2e-delete-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        startDate: '2026-11-01',
        endDate: '2026-11-08',
      },
    });
    createdTrip = await res.json();
    await loginAsMarker(page);
  });

  test.afterEach(async ({ request, baseURL }) => {
    if (createdTrip?._id) {
      // Try to clean up — ignore 404 if test already deleted the trip
      await request
        .delete(`${baseURL}/api/trips/${createdTrip._id}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        })
        .catch(() => {});
    }
  });

  test('Delete button opens confirm dialog', async ({ page }) => {
    await page.goto(`/trips/${createdTrip._id}`);
    await page.getByRole('button', { name: 'Delete' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(
      page.getByRole('heading', { name: /Delete this trip\?/ }),
    ).toBeVisible();
  });

  test('Cancel inside dialog closes it without deleting', async ({ page }) => {
    await page.goto(`/trips/${createdTrip._id}`);
    await page.getByRole('button', { name: 'Delete' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: 'Cancel' }).click();
    await expect(dialog).not.toBeVisible();
    // Trip should still exist + page still on detail
    await expect(page).toHaveURL(new RegExp(`/trips/${createdTrip._id}$`));
  });

  test('Confirm Delete removes trip + redirects to /dashboard with toast', async ({ page }) => {
    await page.goto(`/trips/${createdTrip._id}`);
    await page.getByRole('button', { name: 'Delete' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: 'Delete' }).click();

    // Dashboard receives ?deleted=1, shows toast, then strips the query
    // param via setSearchParams(replace: true). Assert toast visible first,
    // then check URL settled to /dashboard (with or without trailing query).
    await expect(page.getByRole('status')).toHaveText('Trip deleted.');
    await expect(page).toHaveURL(/\/dashboard($|\?)/);
  });

  test('after delete, navigating back to /trips/:id shows "not found"', async ({ page, request, baseURL }) => {
    // Delete via API directly (faster path), then verify the UI 404
    await request.delete(`${baseURL}/api/trips/${createdTrip._id}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    await page.goto(`/trips/${createdTrip._id}`);
    await expect(page.locator('body')).toContainText(/not found/i);
  });
});

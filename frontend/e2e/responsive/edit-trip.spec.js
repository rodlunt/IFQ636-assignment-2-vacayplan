const { test, expect } = require('@playwright/test');

const MARKER_EMAIL = 'marker@vacayplan.com';
const MARKER_PASSWORD = 'MarkerPass123!';

let authToken = null;
let createdTrip = null;

test.beforeAll(async ({ request, baseURL }) => {
  const res = await request.post(`${baseURL}/api/auth/login`, {
    data: { email: MARKER_EMAIL, password: MARKER_PASSWORD },
  });
  const body = await res.json();
  authToken = body.token;

  const createRes = await request.post(`${baseURL}/api/trips`, {
    headers: { Authorization: `Bearer ${authToken}` },
    data: {
      destination: `e2e-responsive-edit-${Date.now()}`,
      startDate: '2026-10-01',
      endDate: '2026-10-10',
      budget: 2000,
    },
  });
  createdTrip = await createRes.json();
});

test.afterAll(async ({ request, baseURL }) => {
  if (createdTrip?._id && authToken) {
    await request.delete(`${baseURL}/api/trips/${createdTrip._id}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
  }
});

const loginAsMarker = async (page) => {
  await page.goto('/login');
  await page.getByPlaceholder('Email').fill(MARKER_EMAIL);
  await page.getByPlaceholder('Password').fill(MARKER_PASSWORD);
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
};

test.describe('responsive: EditTrip', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsMarker(page);
    await page.goto(`/trips/${createdTrip._id}/edit`);
  });

  test('EditTrip form renders all fields + CTA at all viewports', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Edit Trip' })).toBeVisible();
    await expect(page.getByLabel(/Destination/)).toBeVisible();
    await expect(page.getByLabel(/Start date/)).toBeVisible();
    await expect(page.getByLabel(/End date/)).toBeVisible();
    await expect(page.getByLabel(/Budget/)).toBeVisible();
    await expect(page.getByRole('button', { name: /Save changes/ })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
  });
});

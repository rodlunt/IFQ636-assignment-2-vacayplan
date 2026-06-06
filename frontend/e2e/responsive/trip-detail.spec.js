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
      destination: `e2e-responsive-${Date.now()}`,
      startDate: '2026-09-01',
      endDate: '2026-09-08',
      budget: 1500,
      notes: 'Responsive viewport trip',
      status: 'active',
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

test.describe('responsive: TripDetail', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsMarker(page);
    await page.goto(`/trips/${createdTrip._id}`);
  });

  test('hero cover, stats row, breadcrumb, and tabs render at all viewports', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: new RegExp(createdTrip.destination) }),
    ).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Breadcrumb' })).toBeVisible();
    const statsSection = page.getByRole('region', { name: 'Trip stats' });
    await expect(statsSection.getByText('Days Until')).toBeVisible();
    await expect(statsSection.getByText('Nights')).toBeVisible();
    await expect(statsSection.getByText('Budget')).toBeVisible();
  });

  test('Activities heading + tab list render at all viewports', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Activities' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Overview' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Itinerary' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Budget' })).toBeVisible();
  });
});

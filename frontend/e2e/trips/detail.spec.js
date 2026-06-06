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

const createTripViaApi = async (request, baseURL, overrides = {}) => {
  const res = await request.post(`${baseURL}/api/trips`, {
    headers: { Authorization: `Bearer ${authToken}` },
    data: {
      destination: `e2e-detail-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      startDate: '2026-09-01',
      endDate: '2026-09-08',
      budget: 1500,
      notes: 'Test notes for detail spec',
      ...overrides,
    },
  });
  return res.json();
};

const deleteTripViaApi = async (request, baseURL, tripId) => {
  await request.delete(`${baseURL}/api/trips/${tripId}`, {
    headers: { Authorization: `Bearer ${authToken}` },
  });
};

test.describe('trip detail view', () => {
  let createdTrip;

  test.beforeEach(async ({ request, baseURL, page }) => {
    createdTrip = await createTripViaApi(request, baseURL);
    await loginAsMarker(page);
  });

  test.afterEach(async ({ request, baseURL }) => {
    if (createdTrip?._id) {
      await deleteTripViaApi(request, baseURL, createdTrip._id);
    }
  });

  test('renders destination heading + dates + budget + notes', async ({ page }) => {
    await page.goto(`/trips/${createdTrip._id}`);
    await expect(
      page.getByRole('heading', { name: new RegExp(createdTrip.destination) }),
    ).toBeVisible();
    // Post-VP-99 the page has multiple "Dates" / "Budget" text nodes (stats tile +
    // TripInfo row + BudgetTracker section). Scope each lookup via .first()
    // to satisfy strict mode while still asserting the labels render.
    await expect(page.getByText(/Dates/).first()).toBeVisible();
    await expect(page.getByText(/Budget/).first()).toBeVisible();
    // Notes render in both the Overview tab (default selected) and the TripInfo
    // aside, post-VP-99. Scope to .first() — assertion intent is "notes are
    // visible somewhere on the page", not "notes appear exactly once".
    await expect(page.getByText('Test notes for detail spec').first()).toBeVisible();
  });

  test('back link returns to /dashboard', async ({ page }) => {
    await page.goto(`/trips/${createdTrip._id}`);
    await page.getByRole('link', { name: /Back to dashboard/ }).first().click();
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test('renders Edit link pointing to /trips/:id/edit', async ({ page }) => {
    await page.goto(`/trips/${createdTrip._id}`);
    const editLink = page.getByRole('link', { name: 'Edit' });
    await expect(editLink).toBeVisible();
    await expect(editLink).toHaveAttribute(
      'href',
      `/trips/${createdTrip._id}/edit`,
    );
  });

  test('Activities section is rendered', async ({ page }) => {
    await page.goto(`/trips/${createdTrip._id}`);
    await expect(
      page.getByRole('heading', { name: 'Activities' }),
    ).toBeVisible();
  });

  test('non-existent trip ID shows "Trip not found" error', async ({ page }) => {
    await page.goto('/trips/000000000000000000000000');
    await expect(page.locator('body')).toContainText(/not found/i);
  });
});

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

const uniqueDestination = () =>
  `e2e-trip-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

const futureDates = () => {
  // 30 days out, 7-day trip
  const start = new Date();
  start.setDate(start.getDate() + 30);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  const iso = (d) => d.toISOString().slice(0, 10);
  return { start: iso(start), end: iso(end) };
};

test.describe('trip create flow', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsMarker(page);
  });

  test('valid form creates a trip and lands on dashboard with the trip visible', async ({ page }) => {
    const destination = uniqueDestination();
    const { start, end } = futureDates();

    await page.goto('/trips/new');
    await expect(page.getByRole('heading', { name: 'Add New Trip' })).toBeVisible();

    await page.getByLabel(/Destination/).fill(destination);
    await page.getByLabel(/Start date/).fill(start);
    await page.getByLabel(/End date/).fill(end);
    await page.getByRole('button', { name: /Create Trip/ }).click();

    await expect(page).toHaveURL(/\/dashboard$/);
    // Post-VP-96 the new trip's destination appears in BOTH the TripCard grid
    // AND the UpcomingDeparturesCard list (when startDate is in the future).
    // Scope to .first() — the assertion intent is "the trip is on the dashboard".
    await expect(page.getByText(destination).first()).toBeVisible();
  });

  test('missing destination shows client-side error and stays on /trips/new', async ({ page }) => {
    const { start, end } = futureDates();
    await page.goto('/trips/new');
    await page.getByLabel(/Start date/).fill(start);
    await page.getByLabel(/End date/).fill(end);
    await page.getByRole('button', { name: /Create Trip/ }).click();
    await expect(page).toHaveURL(/\/trips\/new$/);
    await expect(page.locator('body')).toContainText(/destination is required/i);
  });

  test('end date before start date shows client-side error', async ({ page }) => {
    await page.goto('/trips/new');
    await page.getByLabel(/Destination/).fill('Date Order Test');
    await page.getByLabel(/Start date/).fill('2026-08-15');
    await page.getByLabel(/End date/).fill('2026-08-10');
    await page.getByRole('button', { name: /Create Trip/ }).click();
    await expect(page).toHaveURL(/\/trips\/new$/);
    await expect(page.locator('body')).toContainText(/end date must be on or after/i);
  });

  test('cancel button returns to /dashboard without creating', async ({ page }) => {
    await page.goto('/trips/new');
    await page.getByLabel(/Destination/).fill('Cancel Test Trip');
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
    // Cancelled trip should NOT appear (not submitted)
    await expect(page.getByText('Cancel Test Trip')).not.toBeVisible();
  });
});

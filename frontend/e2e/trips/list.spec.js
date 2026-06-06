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

test.describe('trips dashboard / list view', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsMarker(page);
  });

  test('renders "My Trips" heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'My Trips' })).toBeVisible();
  });

  test('+ Add Trip link is visible and navigates to /trips/new', async ({ page }) => {
    const addLink = page.getByRole('link', { name: '+ Add Trip' });
    await expect(addLink).toBeVisible();
    await addLink.click();
    await expect(page).toHaveURL(/\/trips\/new$/);
    await expect(page.getByRole('heading', { name: 'Add New Trip' })).toBeVisible();
  });

  test('dashboard either shows empty state or trip cards (assertion-tolerant)', async ({ page }) => {
    // Marker may or may not have trips depending on prior test runs / seed state.
    // Assert one OR the other is present, not a specific count.
    // Post-VP-96 the Dashboard has multiple <ul>s (TripCard grid + UpcomingDeparturesCard),
    // so scope the "trips list" lookup to the section under the "My Trips" heading via
    // the closest list to that heading.
    const emptyState = page.getByText(/No trips yet/i);
    const myTripsHeading = page.getByRole('heading', { name: 'My Trips' });
    const tripsList = myTripsHeading.locator('xpath=following::ul[1]');
    await expect(emptyState.or(tripsList)).toBeVisible();
  });
});

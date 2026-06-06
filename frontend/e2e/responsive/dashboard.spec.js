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

test.describe('responsive: Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsMarker(page);
  });

  test('renders the GreetingBlock + Add Trip CTA at all viewports', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Good (morning|afternoon|evening)/ })).toBeVisible();
    await expect(page.getByRole('link', { name: '+ Add Trip' })).toBeVisible();
  });

  test('renders 4 stats tiles at all viewports', async ({ page }) => {
    const statsSection = page.getByRole('region', { name: 'Trip stats' });
    await expect(statsSection.getByText('Total Trips')).toBeVisible();
    await expect(statsSection.getByText('Days Until')).toBeVisible();
    await expect(statsSection.getByText('Total Budgeted')).toBeVisible();
    await expect(statsSection.getByText('Countries')).toBeVisible();
  });

  test('My Trips heading is present at all viewports', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'My Trips' })).toBeVisible();
  });
});

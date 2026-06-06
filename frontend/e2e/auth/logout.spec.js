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

test.describe('logout flow', () => {
  test('logout button clears session and redirects to /login', async ({ page }) => {
    await loginAsMarker(page);
    await page.getByRole('button', { name: 'Logout' }).click();
    await expect(page).toHaveURL(/\/login$/);
  });

  test('after logout, protected routes redirect back to /login', async ({ page }) => {
    await loginAsMarker(page);
    await page.getByRole('button', { name: 'Logout' }).click();
    await expect(page).toHaveURL(/\/login$/);

    // Session should be cleared; protected route is no longer accessible
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login$/);
  });

  test('after logout, localStorage no longer holds the user', async ({ page }) => {
    await loginAsMarker(page);
    // Confirm user is in localStorage post-login
    const beforeLogout = await page.evaluate(() => window.localStorage.getItem('vacationplan_user'));
    expect(beforeLogout).toBeTruthy();

    await page.getByRole('button', { name: 'Logout' }).click();
    await expect(page).toHaveURL(/\/login$/);

    // After logout, the storage key should be cleared
    const afterLogout = await page.evaluate(() => window.localStorage.getItem('vacationplan_user'));
    expect(afterLogout).toBeNull();
  });
});

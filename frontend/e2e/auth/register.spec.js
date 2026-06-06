const { test, expect } = require('@playwright/test');

// Each successful registration leaves a new user record. Unique timestamped
// emails per run avoid collisions on retries. Cleanup is intentionally deferred
// to keep this spec self-contained; an afterAll hook with admin API delete
// can be added later via VP-118 admin admin tests once that ticket lands.
const uniqueEmail = () => `e2e-register-${Date.now()}-${Math.floor(Math.random() * 1000)}@example.com`;

test.describe('register flow', () => {
  test('new email registers + auto-logs-in + lands on /dashboard', async ({ page }) => {
    const email = uniqueEmail();
    await page.goto('/register');
    await page.getByPlaceholder('Name').fill('E2E Register');
    await page.getByPlaceholder('Email').fill(email);
    await page.getByPlaceholder('Password', { exact: true }).fill('TestPass123!');
    await page.getByPlaceholder('Confirm password').fill('TestPass123!');
    await page.getByRole('button', { name: 'Register' }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test('duplicate email shows visible error + stays on /register', async ({ page }) => {
    await page.goto('/register');
    await page.getByPlaceholder('Name').fill('Marker Dup Attempt');
    // Reuse seeded marker account email — guaranteed duplicate
    await page.getByPlaceholder('Email').fill('marker@vacayplan.com');
    await page.getByPlaceholder('Password', { exact: true }).fill('TestPass123!');
    await page.getByPlaceholder('Confirm password').fill('TestPass123!');
    await page.getByRole('button', { name: 'Register' }).click();
    await expect(page).toHaveURL(/\/register$/);
    await expect(page.locator('body')).toContainText(/already|exists|registered|in use/i);
  });

  test('password mismatch shows client-side error', async ({ page }) => {
    await page.goto('/register');
    await page.getByPlaceholder('Name').fill('Mismatch Test');
    await page.getByPlaceholder('Email').fill(uniqueEmail());
    await page.getByPlaceholder('Password', { exact: true }).fill('TestPass123!');
    await page.getByPlaceholder('Confirm password').fill('Different456!');
    await page.getByRole('button', { name: 'Register' }).click();
    await expect(page).toHaveURL(/\/register$/);
    await expect(page.locator('body')).toContainText(/match/i);
  });

  test('missing fields show client-side error', async ({ page }) => {
    await page.goto('/register');
    await page.getByRole('button', { name: 'Register' }).click();
    await expect(page).toHaveURL(/\/register$/);
    await expect(page.locator('body')).toContainText(/required|all fields/i);
  });

  test('short password shows client-side error', async ({ page }) => {
    await page.goto('/register');
    await page.getByPlaceholder('Name').fill('Short Pwd Test');
    await page.getByPlaceholder('Email').fill(uniqueEmail());
    await page.getByPlaceholder('Password', { exact: true }).fill('abc');
    await page.getByPlaceholder('Confirm password').fill('abc');
    await page.getByRole('button', { name: 'Register' }).click();
    await expect(page).toHaveURL(/\/register$/);
    await expect(page.locator('body')).toContainText(/6 characters|at least/i);
  });

  test('already-logged-in user navigating to /register redirects to /dashboard', async ({ page }) => {
    // Log in first (uses seeded marker account)
    await page.goto('/login');
    await page.getByPlaceholder('Email').fill('marker@vacayplan.com');
    await page.getByPlaceholder('Password').fill('MarkerPass123!');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL(/\/dashboard$/);

    // Now navigate directly to /register while already authed — should bounce back
    await page.goto('/register');
    await expect(page).toHaveURL(/\/dashboard$/);
  });
});

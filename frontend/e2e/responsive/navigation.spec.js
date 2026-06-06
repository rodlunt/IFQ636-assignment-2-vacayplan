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

test.describe('responsive navigation chrome', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsMarker(page);
  });

  test('desktop shows Sidebar; mobile shows BottomNav', async ({ page, viewport }) => {
    const sidebar = page.getByRole('complementary', { name: 'Primary navigation' });
    const bottomNav = page.getByRole('navigation', { name: 'Bottom navigation' });

    const isMobile = viewport && viewport.width < 768;

    if (isMobile) {
      await expect(bottomNav).toBeVisible();
      await expect(sidebar).toBeHidden();
    } else {
      await expect(sidebar).toBeVisible();
      await expect(bottomNav).toBeHidden();
    }
  });
});

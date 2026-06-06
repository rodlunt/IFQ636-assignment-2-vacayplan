const { test, expect } = require('@playwright/test');

test.describe('smoke', () => {
  test('home page responds + has body + has title', async ({ page }) => {
    const response = await page.goto('/');
    expect(response, 'navigation should yield a response').not.toBeNull();
    expect(response.status(), `expected 2xx/3xx, got ${response.status()}`).toBeLessThan(400);

    await expect(page.locator('body')).toBeVisible();

    const title = await page.title();
    expect(title.length, 'page title should be non-empty').toBeGreaterThan(0);
  });
});

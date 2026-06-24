const { test } = require('@playwright/test');
const { playAudit } = require('playwright-lighthouse');

// Lighthouse audit layer - LOCAL, advisory, NOT part of CI and NOT graded.
// An extra layer of testing over and above the unit, API, and e2e suites.
//
// Each test runs a full Lighthouse audit (Performance, Accessibility, Best
// Practices, SEO) against a key page and writes an HTML report into
// ./lighthouse-report/. Thresholds are ADVISORY: a score below the threshold
// prints a warning but does NOT fail the run - this is a QA signal, not a gate.
//
// Requires the app running locally (frontend + backend + DB). See README.md
// in this folder. Reuses the seeded marker/admin accounts from the e2e suite.

const PORT = 9222;

const MARKER = { email: 'marker@vacayplan.com', password: 'MarkerPass123!' };
const ADMIN = { email: 'admin@vacayplan.com', password: 'AdminPass123!' };

const thresholds = {
    performance: 50,
    accessibility: 80,
    'best-practices': 70,
    seo: 70,
};

const reportFor = (name) => ({
    formats: { html: true },
    name: `lighthouse-${name}`,
    directory: 'lighthouse-report',
});

const login = async (page, creds) => {
    await page.goto('/login');
    await page.getByPlaceholder('Email').fill(creds.email);
    await page.getByPlaceholder('Password').fill(creds.password);
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL(/\/dashboard$/);
};

const audit = (page, name) =>
    playAudit({ page, port: PORT, thresholds, reports: reportFor(name) });

test.describe('Lighthouse audits (local, advisory, not CI)', () => {
    test('login page (public)', async ({ page }) => {
        await page.goto('/login');
        await audit(page, 'login');
    });

    test('dashboard (authenticated marker)', async ({ page }) => {
        await login(page, MARKER);
        await page.goto('/dashboard');
        await audit(page, 'dashboard');
    });

    test('trip detail (authenticated marker)', async ({ page, request, baseURL }) => {
        await login(page, MARKER);

        // Create a throwaway trip via the API, audit its detail page, then
        // clean it up so the audit does not leave data behind.
        const loginRes = await request.post(`${baseURL}/api/auth/login`, { data: MARKER });
        const { token } = await loginRes.json();
        const tripRes = await request.post(`${baseURL}/api/trips`, {
            headers: { Authorization: `Bearer ${token}` },
            data: {
                destination: 'Lighthouse Audit Trip',
                startDate: '2026-09-01',
                endDate: '2026-09-08',
            },
        });
        const trip = await tripRes.json();

        try {
            await page.goto(`/trips/${trip._id}`);
            await audit(page, 'trip-detail');
        } finally {
            await request.delete(`${baseURL}/api/trips/${trip._id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
        }
    });

    test('admin users (authenticated admin)', async ({ page }) => {
        await login(page, ADMIN);
        await page.goto('/admin/users');
        await audit(page, 'admin-users');
    });
});

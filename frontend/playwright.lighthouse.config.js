const { defineConfig } = require('@playwright/test');

// Separate Playwright config for the Lighthouse audit layer.
//
// This is DELIBERATELY isolated from the main e2e suite:
//   - testDir points at ./lighthouse, NOT ./e2e, so the CI e2e workflow
//     (e2e.yml runs `playwright test`, which uses playwright.config.js with
//     testDir ./e2e) never picks these up.
//   - There is no GitHub Actions workflow for this config. It is a local,
//     on-demand QA layer only, with no bearing on CI or marks.
//
// Lighthouse drives Chrome over the remote-debugging protocol, so Chromium
// is launched with a fixed debugging port and the run is serial (workers: 1)
// to avoid two audits competing for that port.
const BASE_URL =
    process.env.LH_BASE_URL || process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

module.exports = defineConfig({
    testDir: './lighthouse',
    fullyParallel: false,
    workers: 1,
    retries: 0,
    // Lighthouse audits plus login can exceed Playwright's 30s default on
    // slower machines or pages, so give each test generous headroom.
    timeout: 120000,
    reporter: 'list',
    use: {
        baseURL: BASE_URL,
        launchOptions: {
            args: ['--remote-debugging-port=9222'],
        },
    },
    projects: [
        {
            name: 'lighthouse-chromium',
            use: { browserName: 'chromium' },
        },
    ],
});

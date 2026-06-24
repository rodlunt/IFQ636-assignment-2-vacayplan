# Lighthouse audit layer (local, not CI, not graded)

An extra layer of testing, over and above the unit, API, and e2e suites. It
runs Google Lighthouse against the key pages and produces HTML reports covering
Performance, Accessibility, Best Practices, and SEO.

This is **not wired into CI** and has **no bearing on marks**. It is a local,
on-demand QA signal you run when you want it.

## What it audits

Four representative pages (driven through real authenticated sessions, reusing
the seeded `marker` and `admin` accounts from the e2e suite):

| Page | Route | Auth |
|------|-------|------|
| Login | `/login` | public |
| Dashboard | `/dashboard` | marker |
| Trip detail | `/trips/:id` | marker (throwaway trip created + deleted via API) |
| Admin users | `/admin/users` | admin |

## One-time setup

Lighthouse needs the headless-shell browser, which the standard browser
install may not have pulled:

```bash
cd frontend
npx playwright install chromium chromium-headless-shell
```

## Run it (against a same-origin full stack)

**Important:** the trip-detail audit makes same-origin `/api` calls, so it only
works against an origin that serves **both** the app and the API on the same
host - i.e. the deployed app behind nginx, the same setup the `e2e:live` script
targets. A split local frontend (`:3000`) + backend (`:5001`) has no `/api`
proxy, so the trip-detail audit fails there.

Point it at the live deploy (or any same-origin full stack):

```bash
cd frontend
LH_BASE_URL=http://<live-host> npm run test:lighthouse
```

Verified working against the live EC2 deploy with all four audits passing.
Example scores: Performance 93, Accessibility 97, Best Practices 78, SEO 100.

The seeded `marker@vacayplan.com` and `admin@vacayplan.com` accounts must exist
on whatever backend that origin uses.

## Output

HTML reports are written to `frontend/lighthouse-report/` (gitignored). Open
`lighthouse-<page>.html` in a browser, or screenshot the score rings for the
report/video as beyond-rubric evidence.

## Thresholds

Thresholds are **advisory** (`audit.spec.js`): a score below the threshold
prints a warning but does **not** fail the run. Adjust them in `audit.spec.js`
if you want a different signal. Do not turn them into a hard gate here - that
would defeat the "extra, non-blocking layer" intent.

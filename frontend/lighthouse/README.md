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

## Prerequisites

Unlike the unit tests (which run on mocks), Lighthouse needs the **real app
running locally**:

1. Backend running with a working `backend/.env` (MongoDB Atlas connection).
2. Frontend running (`npm start`, default `http://localhost:3000`).
3. Seeded users present (`marker@vacayplan.com`, `admin@vacayplan.com`). Run the
   backend seed scripts if needed (`npm run seed` in `backend/`).

## Run it

From `frontend/`:

```bash
npm run test:lighthouse
```

Audit a different target (e.g. the live deploy) with:

```bash
LH_BASE_URL=http://<host> npm run test:lighthouse
```

## Output

HTML reports are written to `frontend/lighthouse-report/` (gitignored). Open
`lighthouse-<page>.html` in a browser, or screenshot the score rings for the
report/video as beyond-rubric evidence.

## Thresholds

Thresholds are **advisory** (`audit.spec.js`): a score below the threshold
prints a warning but does **not** fail the run. Adjust them in `audit.spec.js`
if you want a different signal. Do not turn them into a hard gate here - that
would defeat the "extra, non-blocking layer" intent.

# VacayPlan — IFQ636 Assignment 2

A full-stack vacation planner that lets a traveller capture each trip, schedule day-organised activities within the trip's date range, and review the full itinerary on one surface. An administrator role moderates user accounts.

This repository is the **team build for IFQ636 Assignment 2**, extending the VacayPlan base. Team: Rodney (`rodlunt`), Lance (`LDMasina`), Joseph (`jrmilburn`). *(First names only while the repo is public pre-submission; full names go in the Part C declaration.)*

**Tech stack:** Node.js + Express + Mongoose (backend), React 18 + Tailwind CSS + Headless UI (frontend), MongoDB Atlas (persistence), JWT (auth), AWS EC2 + GitHub Actions self-hosted runner (deploy).

**How we work:** see [`CONTRIBUTING.md`](CONTRIBUTING.md) for branching, pull-request, and merge rules, and the planning docs in [`planning/`](planning/). Work is tracked on GitHub Issues and the project board.

---

## Public URL

**Live deploy:** http://3.26.14.122/

Deployed continuously from `main` on every push via GitHub Actions and PM2 behind Nginx (see report CI/CD section).

---

## Test credentials

Two accounts are seeded into the production database on every CI/CD deploy. Sign in at http://3.26.14.122/login with either:

| Role | Email | Password |
|---|---|---|
| Regular user | `marker@vacayplan.com` | `MarkerPass123!` |
| Admin | `admin@vacayplan.com` | `AdminPass123!` |

The admin account unlocks the admin panel (user list with deactivate / reactivate / delete, plus an All Trips view). Both accounts persist across deploys; the seed is idempotent and never resets passwords if the user already exists.

The `marker` account also has three canonical demo trips seeded (Bali active, Tokyo planning, Paris completed) so the dashboard is populated immediately on sign-in.

---

## Project setup (local development)

### Prerequisites

- Node.js 22.x (the deploy target — earlier versions may work for dev, untested)
- npm for the root and backend, plus Yarn (Classic) for the frontend, which is Yarn-managed (`yarn.lock`) and built with Yarn in CI/CD. The root `install-all` script npm-installs all three as a dev convenience.
- A MongoDB connection string (MongoDB Atlas free tier is the simplest option)

### Steps

```bash
# 1. Clone
git clone https://github.com/rodlunt/IFQ636-assignment-2-vacayplan.git
cd IFQ636-assignment-2-vacayplan

# 2. Install dependencies (root + backend + frontend)
npm run install-all

# 3. Configure backend environment
cp backend/.env.example backend/.env
# Edit backend/.env and set MONGO_URI to your MongoDB connection string.
# JWT_SECRET and PORT have working defaults in the example file.

# 4. (Optional) Seed users + demo trips
cd backend
npm run seed         # creates marker + admin users (idempotent)
npm run seed:trips   # creates 3 demo trips on the marker account (idempotent)
cd ..

# 5. Run backend + frontend concurrently
npm start            # production mode: backend on :5001, frontend on :3000
# OR
npm run dev          # dev mode with nodemon backend hot-reload

# 6. Open http://localhost:3000 in a browser and sign in with one of the test accounts above
```

### Environment variables (backend/.env)

| Variable | Purpose | Default |
|---|---|---|
| `MONGO_URI` | MongoDB connection string | (required, no default) |
| `JWT_SECRET` | Token signing secret | provided in `.env.example` for dev |
| `PORT` | Backend port | `5001` |

In production these are injected via the `PROD` GitHub Actions environment secret at deploy time; the local `.env` is not committed.

**Team convention:** for local dev each member uses their **own** MongoDB Atlas free cluster (or their own DB user) — no shared secrets, nobody shares their `.env`. The shared cluster is used only by the live deploy, via GitHub Actions Secrets. Run `npm run seed` after pointing `MONGO_URI` at your cluster to populate the test accounts and demo trips.

---

## Running the test suites

```bash
# Backend (Mocha + Chai + Sinon)
cd backend && npm test

# Frontend e2e (Playwright, against the live deploy by default)
cd frontend && npm run e2e:live
```

The Playwright pack runs four browser projects (chromium, firefox, mobile-chromium, tablet-chromium) and asserts auth, CRUD, admin, and responsive flows against http://3.26.14.122.

---

## Build for production

```bash
cd frontend && CI=true npm run build
```

Output lands in `frontend/build/` and is rsynced to the EC2 PM2-served path by the deploy job. Local builds are useful for warning-checking before pushing to `main`.

---

## Repository layout

```
backend/      Express API + Mongoose models + Mocha suite
frontend/     React + Tailwind + Playwright pack
deploy/       Nginx site config used by the deploy job
.github/      CI/CD workflows (ci.yml = test+deploy, e2e.yml = manual e2e)
```

---

## Related project resources

- **Project board (kanban):** https://github.com/users/rodlunt/projects/12
- **Issues:** tracked in this repo; filter by person or assignment section using the saved VS Code queries in `.vscode/settings.json` (install the recommended GitHub Pull Requests and Issues extension)
- **Planning docs:** [`planning/`](planning/) — delivery plan, checklist, live report notes, meeting log
- **Working report draft:** [`document_draft.md`](document_draft.md)
- **Wireframes:** [`planning/wireframes/`](planning/wireframes/) — HTML low-fidelity wireframes for Dashboard, Trip Detail, and Edit Trip (desktop + mobile)

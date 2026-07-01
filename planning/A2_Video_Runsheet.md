# A2 Team Video Runsheet (30 minutes)

Planning doc for the team video submission. The video is **30 minutes total**,
about **10 minutes per member**, each demonstrating their own part with faces on
camera. One member uploads the final cut to Canvas Studio.

> **Status: DRAFT proposal.** The segment split below is mapped from what each of
> us has actually built so far. Confirm and adjust the split at the next Saturday
> sync before anyone records. Timings are targets, not hard cuts.

## Format and logistics

- **Runtime:** 30 minutes total (aim 28-30 to leave headroom). Per-member segments ~8.5 min each, plus a shared open and close.
- **On camera:** each member's face must be visible while presenting their segment (rubric requirement).
- **Live demo:** the running product must be shown live in a browser with the **public IP / live URL visible** in the address bar. Fill the current URL in here before recording: `http://3.26.14.122/`.
- **Recording approach:** each member records their own segment (screen share + webcam), then one member assembles the segments into a single file and uploads. This keeps the per-member "own part" requirement clean and avoids one long live take.
- **Upload:** Canvas Studio, into "Assignment 2: Video submission". One member submits on behalf of the team.

## Timing plan

| # | Segment | Owner | Target | Running total |
|---|---|---|---|---|
| 1 | Opening: team, project, live URL | Shared (Rodney leads) | 2:00 | 2:00 |
| 2 | CI/CD, unit testing, auth/admin + patterns | Rodney | 8:30 | 10:30 |
| 3 | SRS, trips + State pattern, trip API tests | Lance | 8:30 | 19:00 |
| 4 | Activities + weather, OOP, discussion | Joe | 8:30 | 27:30 |
| 5 | Collaboration evidence + reflection close | Shared (each speaks briefly) | 2:30 | 30:00 |

## Segment detail

### 1. Opening (shared, lead: Rodney) - 2:00

- Introduce the three of us by name (faces on camera).
- One sentence on VacayPlan: trip planning with activities, itinerary, and weather.
- Open the live site in a browser, show the public URL in the address bar, log in, show the dashboard. This is the "product is live" evidence.

### 2. Rodney - 8:30

- **CI/CD pipeline + deploy (Step 7):** walk `.github/workflows/ci.yml`, show a green Actions run, `pm2 status` on the EC2 box, and the live URL serving the latest build. Mention the separate PR Checks workflow that gates pull requests.
- **Unit testing (Step 5):** run the mocha suite (180 passing), then `npm run coverage` to show the c8 table (99.54% statements, 99.26% branches, 100% functions). Screenshot both for the report.
- **Postman - auth + admin folder (Step 6):** run the Auth and Admin requests, including the failure cases (401/403).
- **Patterns owned:** Singleton (`config/db.js`), Decorator (`middleware/ownershipDecorator.js` wrapping trip/activity handlers with ownership checks), Chain of Responsibility (the `protect` -> `adminProtect` -> `validate` middleware chain).

### 3. Lance - 8:30

- **SRS highlights (Step 2):** walk the requirements (2.6 functional, 2.7 non-functional), the complete system diagram (2.9), and the STRIDE risk table (2.11).
- **Trips + State pattern:** demo trip CRUD live, then the State pattern lifecycle (planning -> active -> completed) and show an invalid backward transition being rejected.
- **Patterns owned:** State (`state/tripState.js`), Facade (`services/` cascade deletes for trip and user), Simple Factory (`factories/userResponseFactory.js` centralising auth/admin response shapes).
- **Postman - trips folder (Step 6):** run the Trip requests including the state-transition validity cases and the wrong-owner 404.
- **Report contribution:** the requirements write-up and the APA reference list.

### 4. Joe - 8:30

- **Activities + weather:** demo adding an activity within a trip's date range, then the destination forecast.
- **Patterns owned:** Adapter (`adapters/weatherAdapter.js` wrapping Open-Meteo) and Builder (`builders/tripBuilders.js` assembling trip queries and partial updates).
- **OOP principles (Step 3.2):** use the State and Adapter hierarchies to show inheritance and polymorphism, and the adapter's public/private split for encapsulation.
- **Postman - activities + weather folder (Step 6):** run the activity CRUD and weather requests, including the non-owner 404 and the out-of-window forecast case.
- **Report contribution:** the discussion and conclusion.

### 5. Collaboration evidence + close (shared) - 2:30

- **Collaboration (Step 4, 10 pts):** show the GitHub network/commit graph, the list of merged PRs with cross-member reviews, and at least **two genuine resolved merge conflicts**. Mention the meeting log / cadence.
- Each member gives one sentence of **reflection** (a decision or challenge from their part).
- Thank-you and sign-off.

## Rubric coverage check

Confirm every graded area appears once before recording:

| Rubric area | Covered in |
|---|---|
| Design patterns + OOP (28) | Segments 2, 3, 4 (patterns split by owner) |
| SRS (10) | Segment 3 |
| API testing / Postman (12) | Segments 2, 3, 4 (each demos their folder) |
| Unit testing (12) | Segment 2 |
| CI/CD + deploy (12) | Segments 1, 2 |
| Team collaboration (10) | Segment 5 |
| Report + reflection (16) | Segments 3, 4, 5 |

## Pre-record checklist

- [ ] Split confirmed at the sync (who demos what)
- [ ] Live URL filled in and confirmed reachable
- [ ] Test logins ready (regular user + admin)
- [ ] Each member has their screen-share + webcam recording set up
- [ ] Demo data seeded so screens are not empty
- [ ] Segments recorded, assembled, total runtime checked (<=30 min)
- [ ] Uploaded to Canvas Studio; link captured for the report

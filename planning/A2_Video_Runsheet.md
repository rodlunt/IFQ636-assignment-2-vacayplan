# A2 Team Video Runsheet (10 minutes)

Planning doc for the team video submission. The brief requires a **single 10-minute team video** (Canvas Studio), where each of the three of us demonstrates our own part with faces on camera. One member assembles and uploads the final cut.

> **Status: DRAFT proposal.** The segment split below is mapped from what each of us built. Confirm at the next sync before recording. Timings are targets, not hard cuts.

## Format and logistics

- **Runtime:** **3:20 per member (hard)** across three segments = **10:00** exactly, which fits the nominal 10 minutes with no tolerance needed. The team intro folds into the top of Rodney's segment, the collaboration evidence and sign-off fold into the end of Joe's segment, and each member gives a one-line reflection inside their own segment, so there is no separate opening or closing block. Aim to finish a few seconds under 10:00, since the marker may stop at the cap.
- **On camera:** each member's face must be visible while presenting their segment.
- **Live demo:** show the running product live in a browser with the **public URL visible** in the address bar (`http://3.26.14.122/`), and show the **Figma / UI design** (the 2.8 wireframes) so the demo covers both the design and the working app.
- **Recording approach:** each member records their own segment (screen share + webcam); one member assembles the segments into a single file and uploads. Keeps the per-member "own part" requirement clean.
- **Upload:** Canvas Studio, into "Assignment 2: Video submission". One member submits on behalf of the team.

## Timing plan

| # | Segment | Owner | Target | Running total |
|---|---|---|---|---|
| 1 | Intro + CI/CD, unit testing, auth/admin Postman + patterns | Rodney | 3:20 | 3:20 |
| 2 | SRS + design, trips + State pattern, trip Postman | Lance | 3:20 | 6:40 |
| 3 | Activities + weather, OOP, activity Postman + collaboration + sign-off | Joe | 3:20 | 10:00 |

## Segment detail

Each per-member segment is a hard 3:20, so keep it fast: show the thing working, name the pattern, move on. Lean on the report for depth.

### 1. Rodney - 3:20

- **Intro (~0:15):** the three of us by name (faces on camera); one sentence on VacayPlan (trip planning with activities, itinerary, weather); open the live site with the public URL in the address bar and log in - the "product is live" evidence.
- **CI/CD + deploy (Step 7):** show a green GitHub Actions run and `pm2 status` on EC2 serving the live URL; mention the separate PR Checks workflow that gates pull requests.
- **Unit testing (Step 5):** run the mocha suite (180 passing) and glance at the c8 coverage table (99.54% statements, 99.26% branches, 100% functions).
- **Postman - auth + admin (Step 6):** run the folder; the requests now assert their status, including the 401/403 error cases.
- **Patterns owned:** Singleton (`config/db.js`), Decorator (`middleware/ownershipDecorator.js` wrapping trip/activity handlers with ownership checks), Chain of Responsibility (the `protect` -> `adminProtect` -> `validate` middleware chain).
- One-line reflection.

### 2. Lance - 3:20

- **SRS + design (Step 2):** quick tour of the requirements (2.6 functional, 2.7 non-functional), the complete system diagram (2.9), the STRIDE risk table (2.11), and the UI wireframes / Figma design (2.8).
- **Trips + State pattern:** demo trip CRUD live, then the State pattern lifecycle (planning -> active -> completed) and show an invalid backward transition being rejected.
- **Patterns owned:** State (`state/tripState.js`), Facade (`services/` cascade deletes for trip and user), Simple Factory (`factories/userResponseFactory.js` centralising auth/admin response shapes).
- **Postman - trips (Step 6):** run the Trip folder, including the state-transition validity cases and the wrong-owner 404.
- One-line reflection.

### 3. Joe - 3:20

- **Activities + weather:** demo adding an activity within a trip's date range, then the destination forecast.
- **Patterns owned:** Adapter (`adapters/weatherAdapter.js` wrapping Open-Meteo) and Builder (`builders/tripBuilders.js` assembling trip queries and partial updates).
- **OOP principles (Step 3.2):** use the State and Adapter class hierarchies to show inheritance and polymorphism, and the adapter's public/private split for encapsulation.
- **Postman - activities + weather (Step 6):** run the folder, including the non-owner 404 and the out-of-window forecast case.
- One-line reflection.
- **Collaboration + sign-off (~0:25):** flash the commit graph, merged PRs with cross-member reviews, and the resolved merge conflicts; one line on the meeting cadence (depth is in Appendix A). All three on camera for a quick thank-you and sign-off.

## Rubric coverage check

Confirm every graded area appears before recording:

| Rubric area | Covered in |
|---|---|
| Design patterns + OOP (28) | Segments 1, 2, 3 (patterns split by owner; OOP in 3) |
| SRS + UI design (10) | Segment 2 |
| API testing / Postman (12) | Segments 1, 2, 3 (each demos their folder) |
| Unit testing (12) | Segment 1 |
| CI/CD + deploy (12) | Segment 1 |
| Team collaboration (10) | Segment 3 (close) |
| Report + reflection (16) | Reflections in Segments 1, 2, 3 |

## Pre-record checklist

- [ ] Split confirmed at the sync (who demos what)
- [ ] Live URL filled in and confirmed reachable
- [ ] Figma / UI design ready to show
- [ ] Test logins ready (regular user + admin)
- [ ] Each member has their screen-share + webcam recording set up
- [ ] Demo data seeded so screens are not empty
- [ ] Segments recorded, assembled, total runtime checked (<=10:00)
- [ ] Uploaded to Canvas Studio; link captured for the report

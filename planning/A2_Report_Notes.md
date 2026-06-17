# A2 Report: Live Notes for Template Sections

**Purpose:** As work progresses, facts, decisions, references, GenAI uses, and reflection moments get captured here against the template section they feed. By write-up day the prose should mostly assemble from this file.

**Discipline:** Update at the end of every work session AND whenever a non-obvious decision is made or a noteworthy issue is encountered. Never fabricate, leave `*(populate when…)*` placeholders rather than speculative prose. Append to existing section entries; never duplicate sections.

**Template section mapping:** headings below match `IFQ636 Assignment 2 template.docx` exactly (extracted 2026-06-04). Word budget per `IFQ636_Assignments.md` A2 word budget (target ~3000, range 2700–3300).

> **GROUP ASSIGNMENT, team allocated 2026-06-04; kickoff held 2026-06-06.** Members: Rodney, Lance, Joseph (see Team contacts below). **Base project decided: VacayPlan** (`rodlunt/vacationplan_IFQ636`), extended in the new shared repo `IFQ636-assignment-2-vacayplan` (public).

---

## Cover Page / Submission Fields

| Field | Value | Status |
|-------|-------|--------|
| Team members (names + student IDs) | Rodney; Lance; Joseph — *(full names + student IDs held privately for the Part C declaration, not published in this public repo)* | 🟡 partial |
| Base A1 project chosen | **VacayPlan** (`rodlunt/vacationplan_IFQ636`), agreed 2026-06-06 | ✅ |
| Shared GitHub repo URL | https://github.com/rodlunt/IFQ636-assignment-2-vacayplan (public) | ✅ |
| Project board (kanban) | https://github.com/users/rodlunt/projects/12 | ✅ |
| Public IP / live URL | *(populate after deploy)* | ⬜ |
| Postman collection link (GitHub) | *(populate after export)* | ⬜ |
| Figma / wireframe link | *(populate)* | ⬜ |
| Rodney's contribution scope | Patterns: Singleton (#52), Decorator (#56), Chain of Responsibility (#58); further roles (tests / CI-CD / SRS sections) pending split | 🟡 partial |

### Team contacts

Members: Rodney, Lance, Joseph ("Joe", He/Him). Full names, contact details (phone / email) are held privately in the WhatsApp group and Rodney's local notes — not published in this public repo.

*Confirm whether the team is exactly these three before locking Part C. Student IDs still needed from Lance and Joe for the Declaration of Contribution.*

**First meeting scheduled: Sat 6 Jun 2026, 3:00pm (20–30 min)**, outline a framework for how the team will structure its activities. Agenda in `A2_Meeting1_Agenda.md`. Logged in §4.2 below.

**Team channel:** WhatsApp group (central info point, confirmed 2026-06-04).
**Cadence (agreed 2026-06-06):** Tuesday email check-in (minimum) + standing Saturday 3pm AEST WhatsApp group call; WhatsApp for day-to-day in between. The night before the due night (Thu 2 Jul) is kept clear as a buffer / final-assembly session, with an availability sanity-check at the preceding sync to bring it forward if anyone has a clash.
**GitHub usernames:** Rodney `rodlunt`, Lance `LDMasina`, Joe `jrmilburn`.

**Base project (decided 2026-06-06), VacayPlan, verified live 2026-06-04:** public IP `http://3.106.8.108` up; logged in as `marker@vacayplan.com` via the live API and confirmed all 3 seeded trips present (Bali active 12–19 Jun, Tokyo planning 3–10 Sep, Paris completed Sep 2025). Base repo `rodlunt/vacationplan_IFQ636`; extended in the new shared repo `IFQ636-assignment-2-vacayplan` (public, clean base-import, not a fork).

---

## Section 1: Project overview (~150–200 words)

What it needs: describe the chosen real-world application; what it does, who it serves, why this base was chosen for extension.

VacayPlan is a full-stack vacation-planning web application for travellers to organise multi-day trips. It is built on Node.js, Express and MongoDB for the backend, React and TailwindCSS for the frontend and CI/CD using github actions to an AWS EC2 instance. An authenticated user creates a trip with a destination and date range, schedules activities and reviews the resulting day-by-day itinerary. As an extension of the initial implemention, a user can also view the weather forecast at their destination for the dates of their trip. A seperate administrator role moderates the platform, moderating user accounts and viewing all trips. The application therefore serves two audiences: everyday travellers planning holidays and an admin user responsible for platform oversight.

We chose to extend this base project as it was already structured in a way that made extension straightforward. Its clean seperation of trips, activities and user management lets each part of the system be reasoned about and modified in isolation. That structure gave each domain a natural home for new design patterns - such as Builder, Adapter and Decorator - allow us to strengthen the architecture and apply object-oriented principles without reworking the existing foundations.


---

## Section 2: SRS documentation (~600–800 words across 2.1–2.11)

### 2.1 Purpose
*(populate)*

### 2.2 Problem statement
*(populate, compelling problem definition is an HD signal)*

### 2.3 Scope
*(populate, clear system boundaries; what's in and out)*

### 2.4 User characteristics
*(populate, user types / personas)*

### 2.5 Constraints
*(populate, technical, platform, team, time constraints)*

### 2.6 Functional requirements
*(populate, complete enumeration; reuse/extend the A1 VacayPlan R-catalogue)*

### 2.7 Non-functional requirements (NFRs)
*(populate, performance, security, usability; A1 had N001–N005 for VacationPlan)*

### 2.8 User interface mockups/wireframes (Low Fidelity Design)
*(populate, LF wireframes; reuse the A1 VacayPlan Figma LF screens. Screenshot → 2.8 tracker)*

### 2.9 Complete system diagram
*(populate, full system architecture diagram. Screenshot → 2.9 tracker)*

### 2.10 Safety considerations
*(populate, failure modes, data-loss prevention, auth/access safety)*

### 2.11 Risk management
*(populate, risk table: risk, likelihood, impact, mitigation)*

---

## Section 3.1: Design pattern (~400–500 words), part of the 28-pt criterion

Requirement: **minimum 7 patterns**, each justified AND demonstrated in backend code. Pattern-count ladder: 7=HD, 6=D, 5=C, 4=P.

**Pattern selection (lock at Phase 1):** see `A2_Checklist.md` pattern tracker for the live committed list.

**Pattern selection locked** (ownership confirmed via email check-in; selection issue #21 closed with the full record - see its closing comment):

| Pattern | Category | Owner | Issue |
|---------|----------|-------|-------|
| Builder | Creational | Joe | #54 (merged, PR #64) |
| Factory Method | Creational | Lance | #53 (merged, PR #66) |
| Singleton | Creational | Rodney | #52 |
| Decorator | Structural | Rodney | #56 |
| Chain of Responsibility | Behavioural | Rodney | #58 |
| Facade | Structural | Lance | #55 |
| Adapter | Structural | Joe | #57 |
| State | Behavioural | Lance | #59 |

Lance's 3rd pattern confirmed as State (email 2026-06-09, reiterated at 13 Jun call). Anchor: `updateUserStatus` in `adminController` - trip status lifecycle. Zero overlap with CoR; zero net-new build. Proxy was considered but rejected due to overlap with CoR on the admin-auth path.

**Decided:** each member owns an individually attributable slice of the patterns (feeds the Part C contribution split).

**Talking points / justifications:** *(populate per committed pattern)*

- Adapter (structural): implemented in commit `37b337c`. `OpenMeteoWeatherAdapter` wraps the Open-Meteo geocoding and forecast API behind the `WeatherProvider` interface, reconciling the vendor's coordinate lookup, parallel-array response, and integer WMO weather codes into a normalised forecast DTO (`backend/adapters/weatherAdapter.js:49`, `backend/adapters/weatherAdapter.js:64`). The trip-scoped endpoint `GET /api/trips/:id/weather` resolves a trip's destination and dates through that interface without depending on the concrete vendor (`backend/controllers/weatherController.js:9`, `backend/routes/tripRoutes.js:17`). This fits VacayPlan because the trip detail page needs destination weather as a new feature while staying decoupled from any single provider; swapping vendors means adding another `WeatherProvider` subclass, leaving the controller, route, and frontend untouched.
- Builder (creational): implemented in commit `6965ef3`. `TripQueryBuilder` assembles the authenticated user's trip list query and newest-first sort before `getTrips` passes the built filter/sort to Mongoose (`backend/builders/tripBuilders.js:31`, `backend/controllers/tripController.js:28`). `TripUpdateBuilder` centralises partial update rules for `updateTrip`, applying only supplied non-null fields while preserving omitted values and falsey values such as `0` (`backend/builders/tripBuilders.js:12`, `backend/controllers/tripController.js:55`). This fits VacayPlan because trip update/query construction was previously inline controller assignment logic; moving construction behind fluent builders keeps the controller focused on request flow and makes the allowed update fields explicit.
- Factory Method (creational): commit `e0b85f0`. `UserResponseFactory` in `backend/factories/userResponseFactory.js` centralises user response construction previously duplicated inline across `authController.js` (registerUser, loginUser, updateUserProfile) and `adminController.js` (createUser, updateUserStatus). Type argument (`auth` or `admin`) controls output shape. Removes `id` vs `_id` inconsistency between controllers. Consumed by both controllers. Justified via Shvets (2021).
- Facade (structural): commit `30fe755`. `TripService` in `backend/services/tripService.js` encapsulates trip cascade delete (activities then trip) behind `deleteTripWithActivities(trip)`. `UserService` in `backend/services/userService.js` encapsulates user cascade delete (activities, trips, user, plus audit log) behind `deleteUserWithCascade(user, adminUser)`. Both `tripController.deleteTrip` and `adminController.deleteUser` now delegate to one service method instead of coordinating multiple models inline. Anchored to FR-11 (trip cascade) and FR-19 (user cascade). Justified via Shvets (2021).
- Singleton (creational): commit `ccd56e0`. `Database` class in `backend/config/db.js` turns the shared Mongoose connection from an accidental property (one call site) into a designed guarantee: `getInstance()` is the sole access point, the constructor throws on a second instantiation, and `connect()` stores the first connection promise and reuses it on every later call. `connectDB()` keeps its signature so `server.js` is unchanged - and `server.js` already guards startup behind `require.main`, so production has exactly one call site (latent invariant made explicit). Four unit tests in `backend/test/dbSingleton.test.js` prove instance identity, the construction guard, and the single-connection guarantee. Justified via Shvets (2021).
- Chain of Responsibility (behavioural): commit `c42bf6d`. `validate(rules)` in `backend/middleware/validateMiddleware.js` completes the admin pipeline: `protect` -> `adminProtect` -> `validate` -> handler. Each link follows the same contract - terminate with the appropriate error code or call `next()`. Validation previously sat duplicated inside controllers, enmeshed with business logic; the new link externalises it into the chain. Wired per route in `adminRoutes.js`; four unit tests verify the validate link in isolation; existing admin route tests pass unchanged through the new link. Justified via Shvets (2021).
- Decorator (structural): commit `e64ca7d`. `withOwnership(handler)` in `backend/middleware/ownershipDecorator.js` eliminates the trip-ownership check duplicated across 8 handlers (3 in tripController, 5 in activityController). The decorator fetches the trip, verifies `trip.userId === req.user._id`, attaches it as `req.trip`, then delegates to the wrapped handler - or terminates with 404. Routes wire it explicitly: `withOwnership(getTripById)` in `tripRoutes.js`, `withOwnership(addActivity)` etc. in `activityRoutes.js`. Controllers simplified to use `req.trip` rather than fetching the trip themselves. Four unit tests in `backend/test/ownershipDecorator.test.js` cover the happy path, 404 not-found, 404 not-owned, and tripId param alias. Justified via Shvets (2021).
- State (behavioural): commit `23a0d48`. `PlanningState`, `ActiveState`, and `CompletedState` in `backend/state/tripState.js` encapsulate which trip lifecycle transitions are valid (FR-10: planning -> active -> completed, completed is terminal). `tripController.updateTrip` checks this before applying a status change, rejecting invalid transitions with a 400 (NFR-10). Six unit tests in `backend/test/trip.test.js` cover valid and invalid transitions. Justified via Shvets (2021).

### 3.2 Implementation of OOP (~250–300 words)
Demonstrate Classes, Objects, Inheritance, Encapsulation, Polymorphism with code examples and justification.

**Talking points:** *(populate, point to specific classes/files demonstrating each principle)*

---

## Section 4: Team collaboration via GitHub (~200–250 words)

### 4.1 Team collaboration statement
*(populate, how the team organised work, branching model, review rules)*

### 4.2 Team collaboration evidence
Needs: feature branches; PRs; **minimum 2 merge conflicts resolved**; commit history graph; team meeting times and dates. All commits attributable to individuals.

**Meeting log (append per meeting):**
| Date | Attendees | Decisions | Action items (owner) |
|------|-----------|-----------|----------------------|
| 2026-06-06 3:00pm AEST | Rodney, Lance, Joe | Base project = VacayPlan; new shared repo `IFQ636-assignment-2-vacayplan` (public); cadence = Tue email + Sat 3pm AEST WhatsApp call + Thu 2 Jul buffer night kept clear (availability sanity-check at prior sync); git workflow = no squash-merge, one open PR at a time, branch-per-task, review before merge, own-identity commits | Rodney: create repo + add Lance/Joe; roles + student-ID collection carried to next sync |
| 2026-06-09 email check-in | Rodney, Lance, Joe | Pattern ownership confirmed (7 of 8): Rodney Singleton/Decorator/CoR (#52/#56/#58), Lance Factory Method/Facade (#53/#55), Joe Builder/Adapter (#54/#57); Proxy proposal flagged as overlapping CoR on the admin-auth path; options for Lance's 3rd = Proxy rescoped / Observer / Command / keep State; #21 closed with the record | Lance: lock 3rd pattern, land outcome in #59 |
| 2026-06-13 3:00pm AEST | Rodney, Lance, Joe | Sequencing resolved: Facade (#55, Lance) merges first, Decorator (#56, Rodney) follows - will be conflict #2 on tripController; CI/CD ownership: Lance (#60, includes AWS EC2 setup, aiming to start tonight); Postman collation: Joe; unit test table (#33): Lance; video: each member records own segment, Rodney stitches via OBS + uploads via Canvas Studio (Naveed to confirm stitch-and-upload is permitted); word-count rules confirmed (includes figures/tables text, excludes headings/refs/ToC/cover); test-inventory convention (#33) confirmed with team; Joe's Adapter PR #71 open; #59 confirmed as State (pre-call email: Lance reverted from Proxy to State - tripController/updateUserStatus anchor, zero overlap with CoR, zero net-new build) | Lance: open Facade PR; Lance: CI/CD setup (#60); Lance: SRS 2.6-2.7 + FR cascade + ID numbering fix; Joe: tag Rodney + Lance on PR #71; next meeting Tuesday 2026-06-17 |

**Merge-conflict log (need ≥2 genuine):**
| # | Branches | What conflicted | Who resolved | Commit/PR |
|---|----------|-----------------|--------------|-----------|
| 1 | feature/factory-method-user-response vs origin/main | document_draft.md (section 3.1), planning/A2_Checklist.md (pattern tracker rows 1-2), planning/A2_Report_Notes.md (talking points) | LDMasina | commit `394d5e5`, PR #66 |
| 2 | feature/facade-service-layer vs origin/main | planning/A2_Checklist.md (pattern tracker rows 5-6), planning/A2_Report_Notes.md (references section) | LDMasina | commit `4e2d810`, PR #72 |

---

## Section 5: Functional testing (only unit testing) (~200–250 words)

Mocha/Chai unit tests for all CRUD functions; terminal pass/fail screenshots (5.1).

**Test case table (ID, Expected Output, Actual Output):**
| Test Case ID | Function | Expected Output | Actual Output | Pass/Fail |
|--------------|----------|-----------------|---------------|-----------|
| TC-SIN-01 | `Database.getInstance()` | Same instance returned on every call | Same object reference returned | Pass |
| TC-SIN-02 | `new Database()` after instance exists | Throws on direct construction | Error thrown | Pass |
| TC-SIN-03 | `db.connect()` called twice | `mongoose.connect` called exactly once | One connection opened | Pass |
| TC-SIN-04 | `db.connect()` after established | Returns same connection promise | Existing promise reused | Pass |
| TC-BLD-01 | `TripQueryBuilder.build()` | Filter `{ userId }` and sort `{ createdAt: -1 }` | Correct filter and sort | Pass |
| TC-BLD-02 | `TripUpdateBuilder.build()` | Only present fields applied; falsey values (0, '') preserved | Partial update applied correctly | Pass |
| TC-FM-01 | `UserResponseFactory.create('auth')` | Response with `id`, `name`, `email`, `token`, `isAdmin` (boolean) | Correct auth shape returned | Pass |
| TC-FM-02 | `UserResponseFactory.create('auth')` isAdmin cast | `isAdmin` is strict boolean regardless of source type | Boolean cast applied | Pass |
| TC-FM-03 | `UserResponseFactory.create('admin')` | Response with `_id`, `name`, `email`, `isAdmin`; no `token` | Correct admin shape returned | Pass |
| TC-FM-04 | `UserResponseFactory.create('admin')` isAdmin cast | `isAdmin` is strict boolean | Boolean cast applied | Pass |
| TC-FM-05 | `UserResponseFactory.create('unknown')` | Throws for unrecognised type | Error thrown | Pass |
| TC-COR-01 | `validate([rules])` - all rules pass | `next()` called once; no error response sent | next() called; no status/json | Pass |
| TC-COR-02 | `validate([rules])` - rule fails | 400 returned; `next()` not called; chain stops | 400 JSON; chain stopped | Pass |
| TC-COR-03 | `requireUserFields` | Returns null when all fields present; error string when any missing | Correct per-field validation | Pass |
| TC-COR-04 | `requireValidStatus` | Returns null for `active`/`deactivated`; error string otherwise | Correct status validation | Pass |
| TC-FAC-01 | `TripService.deleteTripWithActivities()` | `Activity.deleteMany` and `trip.deleteOne` both called | Both called | Pass |
| TC-FAC-02 | `TripService.deleteTripWithActivities()` ordering | `Activity.deleteMany` called before `trip.deleteOne` | Correct deletion order | Pass |
| TC-FAC-03 | `UserService.deleteUserWithCascade()` | Activities, trips, then user deleted in sequence | Correct cascade order | Pass |
| TC-FAC-04 | `UserService.deleteUserWithCascade()` audit | `[AUDIT]` log written with user and admin identity | Audit log written | Pass |
| TC-ADP-01 | `OpenMeteoWeatherAdapter.getForecast()` nominal | Normalised forecast DTO with geocoded destination and daily data | Correct DTO returned | Pass |
| TC-ADP-02 | `getForecast()` destination parsing | Uses leading segment of "City, Country" for geocoding | Leading segment used | Pass |
| TC-ADP-03 | `getForecast()` country disambiguation | Country segment used to select correct geocoding candidate | Correct candidate selected | Pass |
| TC-ADP-04 | `getForecast()` no country given | Falls back to most populous geocoding candidate | Most populous selected | Pass |
| TC-ADP-05 | `getForecast()` unmapped WMO code | Maps unknown codes to "Unknown"; preserves zero precipitation | Unknown mapped; 0 preserved | Pass |
| TC-ADP-06 | `getForecast()` vendor omits daily data | Returns empty daily array | Empty array returned | Pass |
| TC-ADP-07 | `getForecast()` blank destination | Throws without making network call | Error thrown pre-network | Pass |
| TC-ADP-08 | `getForecast()` no location found | Throws when geocoding returns no match | Error thrown | Pass |
| TC-ADP-09 | `getForecast()` dates outside forecast window | Returns empty forecast | Empty forecast returned | Pass |
| TC-ADP-10 | `getForecast()` forecast request fails | Surfaces vendor error reason | Vendor error surfaced | Pass |
| TC-ADP-11 | `getForecast()` vendor timeout | Aborts and reports timeout | Timeout error thrown | Pass |
| TC-ADP-12 | `WeatherProvider` base class | Refuses direct use; error thrown on direct instantiation | Error thrown | Pass |
| TC-ADP-13 | `GET /api/trips/:id/weather` owned trip | 200 with forecast DTO | 200 with forecast | Pass |
| TC-ADP-14 | `GET /api/trips/:id/weather?q=place` | Uses `q` param as destination instead of trip destination | Override destination used | Pass |
| TC-ADP-15 | `GET /api/trips/:id/weather` trip not found | 404; provider not called | 404 returned | Pass |
| TC-ADP-16 | `GET /api/trips/:id/weather` another user's trip | 404 (no resource enumeration) | 404 returned | Pass |
| TC-ADP-17 | `GET /api/trips/:id/weather` no auth | 401 | 401 returned | Pass |
| TC-ADP-18 | `GET /api/trips/:id/weather` provider fails | 502 | 502 returned | Pass |
| TC-DEC-01 | `withOwnership` - user owns trip | Attaches trip to `req.trip`; calls wrapped handler | req.trip set; handler called once | Pass |
| TC-DEC-02 | `withOwnership` - trip not found | 404 `{ message: 'Trip not found' }`; handler not called | 404 returned; handler not called | Pass |
| TC-DEC-03 | `withOwnership` - user does not own trip | 404 `{ message: 'Trip not found' }`; handler not called | 404 returned; handler not called | Pass |
| TC-DEC-04 | `withOwnership` - activity route (`req.params.tripId`) | Resolves trip via `tripId` param; attaches to `req.trip`; calls handler | req.trip set; handler called once | Pass |
| TC-CRUD-01 | `createTrip` valid body | 201 with created trip document | 201 returned | Pass |
| TC-CRUD-02 | `getTrips` authenticated | 200 with user's trips ordered newest first | 200 ordered correctly | Pass |
| TC-CRUD-03 | `getTripById` owned | 200 with matching trip | 200 returned | Pass |
| TC-CRUD-04 | `getTripById` not owned | 404 (no resource enumeration) | 404 returned | Pass |
| TC-CRUD-05 | `updateTrip` owned | 200 with updated trip | 200 returned | Pass |
| TC-CRUD-06 | `updateTrip` partial body | Only supplied fields updated; omitted fields unchanged | Partial update applied | Pass |
| TC-CRUD-07 | `deleteTrip` owned | 204 No Content; trip and activities removed | 204 returned | Pass |
| TC-CRUD-08 | `deleteTrip` cascade ordering | Activities deleted before trip document | Correct cascade order | Pass |
| TC-CRUD-09 | `addActivity` valid | 201 with activity document | 201 returned | Pass |
| TC-CRUD-10 | `listActivitiesForTrip` | 200 with activities sorted by date then time | 200 sorted correctly | Pass |

**Talking points:** *(populate, test strategy, coverage of create/update/delete/fetch)*

---

## Section 6: API testing using Postman (~150–200 words)

All endpoints tested incl. error handling; exported collection committed to repo.

- 6.1: request collections + responses screenshots: *(populate → 6.1 tracker)*
- 6.2: GitHub link to exported collection: *(populate)*

**Talking points:** *(populate, endpoints covered, error-handling cases tested)*

---

## Section 7: CI/CD pipeline setup (~150–200 words)

GitHub Actions build/test/deploy; runs on push; public URL + pm2 status.

**Instance details:**
- Name: `VacayPlan_IFQ636_A2`, Instance ID: `i-06076d755ec7b3cbf`
- Public IP: `3.26.14.122`, type: t3.medium, Ubuntu 24.04 LTS
- Stack: Node 22.22.3 (nvm), yarn, PM2, nginx 1.24.0
- Repo cloned to `~/vacationplan_IFQ636/` (matches ci.yml rsync target paths)
- PM2 processes: `vacayplan-backend` (port 5001), `vacayplan-frontend` (port 3000, SPA mode)
- nginx reverse proxy: port 80 -> 3000 (frontend /), 5001 (backend /api)
- PM2 startup configured via systemd (`pm2-ubuntu.service`) -- survives reboots
- Self-hosted runner registered to team repo by Rod (admin-only token generation)
- GitHub Actions secrets set: MONGO_URI, JWT_SECRET, PORT, PROD

**Pipeline structure (ci.yml):**
- Trigger: push to main
- Single job: build + test + deploy on self-hosted runner
- Steps: checkout -> Node 22 setup -> stop PM2 -> backend install + audit -> frontend install + build (REACT_APP_API_URL=http://3.26.14.122) -> frontend audit -> deploy frontend via rsync -> run backend tests -> deploy backend via rsync -> write .env from PROD secret -> install backend deps at deploy path -> sync nginx config -> restart PM2 -> seed users + trips
- Deviations from unit template: secret echo step omitted (logs are public); yarn audit gates added (advisory, continue-on-error)

**Evidence captures:**
- 7.1 workflow YML: `planning/screenshots/2026-06-17-cicd-workflow-yml-ldmasina.png`
- 7.2 EC2 pm2 status: `planning/screenshots/2026-06-17-pm2-status-vacayplan-a2-ldmasina.png`
- 7.3 GitHub Run Test page: *(pending green CI/CD run)*
- 7.4 app first page, public IP: `planning/screenshots/2026-06-17-vacayplan-a2-live-browser-ldmasina.png`

**Talking points:** *(populate)*

---

## Section 8: Discussion and conclusion (~200–250 words)

Team discussion of the development process; conclusion.

**Talking points:** *(populate from the reflection running log below)*

---

## Section 9: Use of GenAI + Reflection + References

### Use of GenAI (mandatory disclosure)

Append every GenAI use: tool, prompt category, task, project area, how verified. Use the QUT CiteWrite AI-citation format for references.

| Date | Tool | Prompt category | Task | Project area | How verified |
|------|------|-----------------|------|--------------|--------------|
| 2026-06-13 | Claude Code | Copyediting | Copyedit of Rodney-drafted 3.1 Singleton and CoR paragraphs (CoR rationalised to ~95 words) | Report 3.1 | Facts checked against commits ccd56e0/c42bf6d and test files before approval |
| 2026-06-13 | Claude Code | Drafting | PR #70 description drafted from branch contents | GitHub workflow | Test count verified by running the suite (106 passing); reviewed before posting |
| 2026-06-13 | Claude Code | Data assembly | Test inventory table on #33 extended (per-file test counts, pending-branch rows) | Section 5 prep | Counts cross-checked against grep of each test file |
| 2026-06-13 | Claude Code | Diagram generation | 2.9 system overview + use case diagram drafted in diagrams.net format, A1-derived naming | SRS 2.8/2.9 | Components checked against codebase and branches; layout reviewed and hand-adjusted by Rodney |
| 2026-06-13 | Claude Code | Research summary | A2 task sheet and rubric reviewed to confirm SysML not required and figure obligations | Report planning | Read directly from the task sheet PDF and template |

### Reflection (running log: append verbatim, no embellishment)

Critical insight into the development process, challenges, decisions, learning. The marker wants genuine reflection, not a summary.

- 2026-06-04: A2 workspace created; A1 archived. *(append real moments as they happen)*
- 2026-06-13 (Rodney): After Joe suggested the weather API as the Adapter anchor, it was clear there is real benefit in wider ideas being included in the application - one person can't think of everything. It is almost an obvious addition, and not something I had seen in a travel application before, yet such an obviously beneficial one.
- 2026-06-13 (Rodney): Post-merge review of PR #66 caught a frontend regression that both green test suites missed (detail raised as a comment on the PR). Lesson: backend unit tests prove handler behaviour, not API contract safety - the frontend tests mock the old response shape, so a contract change can pass everything and still break the app.

### References (APA 7th: append as sources are used)

Shvets, A. (2021). *Chain of responsibility*. Refactoring.Guru. https://refactoring.guru/design-patterns/chain-of-responsibility
Shvets, A. (2021). *Facade*. Refactoring.Guru. https://refactoring.guru/design-patterns/facade
Shvets, A. (2021). *Factory method*. Refactoring.Guru. https://refactoring.guru/design-patterns/factory-method
Shvets, A. (2021). *Singleton*. Refactoring.Guru. https://refactoring.guru/design-patterns/singleton
Shvets, A. (2021). *State*. Refactoring.Guru. https://refactoring.guru/design-patterns/state
Shvets, A. (2021). *State in Python*. Refactoring.Guru. https://refactoring.guru/design-patterns/state/python/example

*(Note for final assembly: multiple same-author same-year Shvets entries need APA 2021a/2021b/... suffixes, assigned alphabetically by title, with in-text citations updated to match. Do once, at write-up, when the full set is known.)*

---

## Open questions for the team / coordinator

- ~~Word-count inclusion rules for A2~~ - **RESOLVED 2026-06-13**: Naveed confirmed includes body text + figures/tables text; excludes headings, references, ToC, title page. Figure captions count. Budget accordingly.
- Template numbering typo: API testing section lists two "6.2" headings, confirm intended 6.1/6.2 before submission.

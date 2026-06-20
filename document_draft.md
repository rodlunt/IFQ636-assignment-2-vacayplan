# IFQ636 A2 — Working Report Draft

Shared drafting surface for the team report. Headings below match the supplied
template (`documents/IFQ636 Assignment 2 template.docx`) exactly, so prose drops
straight into the template on build day.

**How to use this file**
- Draft prose under each heading. One person can own a section; note your initials
  in the heading while it is in progress (e.g. `## Project overview — RL drafting`).
- Raw material (facts, decisions, talking points, sources, GenAI uses) is captured
  live in [`planning/A2_Report_Notes.md`](planning/A2_Report_Notes.md). Pull from
  there; don't reconstruct at the end.
- Target ~3000 words (range 2700–3300). Per-section budgets are guides, not limits.
- Australian English. No AI-attribution anywhere. Cite in APA 7th. Page numbers on
  direct quotes and specific factual claims.
- The final report is built into the template via the python-docx pipeline, not by
  pasting from here into Word by hand.

> Status: section 3.1 underway (Builder and Factory Method written). All other sections still to draft.

---

## Project overview (~150-200 words)
*Real-world application, what it does, who it serves, why VacayPlan was chosen as the base to extend.*

*(draft here)*

---

## SRS documentation (~600-800 words total across 2.1-2.11)

### 2.1 Purpose (~40 words)
*(draft here)*

### 2.2 Problem statement (~80 words)
*(draft here)*

### 2.3 Scope (~60 words)
*(draft here)*

### 2.4 User characteristics (~50 words)
*(draft here)*

> **@jrmilburn** - the use case diagram belongs here. It shows the two actors (Traveller and Administrator) and their interactions with the system, which maps directly to user characteristics. Image is at `planning/diagrams/A2_system_diagram_use_case.png` - drop it in with a caption and a sentence introducing the actors when you draft this section.
>
> ![Figure 2: VacayPlan use case diagram](planning/diagrams/A2_system_diagram_use_case.png)

### 2.5 Constraints (~50 words)
*(draft here)*

### 2.6 Functional requirements (~30 words + table)
*(draft here)*

### 2.7 Non-functional requirements (~30 words + table)
*(draft here)*

### 2.8 User interface mockups/wireframes (~20 words + figure)
Low-fidelity wireframes for Dashboard, Trip Detail, and Edit Trip at desktop and mobile breakpoints. Red boxes mark pattern-backed additions.

![Fig 2a](planning/diagrams/wireframe-dashboard-desktop.png)
![Fig 2b](planning/diagrams/wireframe-dashboard-mobile.png)
![Fig 3a](planning/diagrams/wireframe-trip-detail-desktop.png)
![Fig 3b](planning/diagrams/wireframe-trip-detail-mobile.png)
![Fig 4a](planning/diagrams/wireframe-edit-trip-desktop.png)
![Fig 4b](planning/diagrams/wireframe-edit-trip-mobile.png)

### 2.9 Complete system diagram (~20 words + figure)
Figure 1 presents the complete VacayPlan system architecture. The React SPA communicates via HTTPS through an Nginx reverse proxy to the Express backend on AWS EC2, which connects to MongoDB Atlas and the Open-Meteo weather API via a CI/CD pipeline managed by GitHub Actions.

![Figure 1: VacayPlan complete system diagram](planning/diagrams/A2_system_diagram_2.9.png)

### 2.10 Safety considerations (~100 words)
VacayPlan's safety approach operates at three layers. At the network layer, Nginx terminates HTTPS before traffic reaches the Express backend; MongoDB Atlas uses TLS on all connections. At the application layer, every authenticated route passes through a three-link middleware chain - `protect` validates the JWT, `adminProtect` enforces role boundaries, and `validate` checks request shape before business logic executes. Trip and activity ownership is verified by `withOwnership` before handlers run, preventing cross-user data access. At the data layer, the Facade pattern ensures deletions cascade across related models, eliminating orphaned records. The weather adapter enforces an 8-second timeout against hung external requests.

### 2.11 Risk management (~60 words + table)
Risk management uses the STRIDE threat model. Each category maps to a VacayPlan-specific risk and the control in place, or a gap where none exists.

| Threat                  | VacayPlan risk                                            | Mitigation                                                       | Status    |
|:------------------------|:----------------------------------------------------------|:-----------------------------------------------------------------|:---------:|
| Spoofing                | Forged identity or stolen JWT accesses protected routes   | bcrypt hashing; JWT 30-day expiry; `protect` on every request    | Mitigated |
| Tampering               | User modifies another user's trip or activity             | `withOwnership` checks ownership before write handlers run       | Mitigated |
| Repudiation             | User denies a trip or activity change                     | No audit log implemented                                         | Gap       |
| Information disclosure  | Trip data exposed to wrong user; credentials leaked       | Ownership checks on all routes; TLS on Atlas; `.env` gitignored  | Mitigated |
| Denial of service       | Unbounded requests exhaust server; weather API hangs      | 8-second timeout on weather adapter; no bulk endpoints           | Mitigated |
| Elevation of privilege  | Regular user accesses admin-only routes                   | `adminProtect` checks `isAdmin`; admin routes mounted separately | Mitigated |

---

## Implementation (coding) using design pattern and OOP principles (~650-800 words)
*This is the 28-pt criterion.*

### 3.1 Design pattern (~400-500 words, currently ~891 - trim before submission)
*Minimum 7 patterns, each justified and demonstrated in backend code. Pattern-count ladder: 7=HD, 6=D, 5=C, 4=P. Live committed list lives in `planning/A2_Checklist.md` pattern tracker.*

Adapter is used as a structural pattern to wrap an external weather service. `WeatherProvider` defines the forecast interface the application depends on, and `OpenMeteoWeatherAdapter` translates Open-Meteo's coordinate-based, parallel-array, WMO-coded responses into a single normalised forecast object. The implementation lives in `backend/adapters/weatherAdapter.js` and is used by `backend/controllers/weatherController.js` to serve `GET /api/trips/:id/weather` (commit `37b337c`). This is appropriate for VacayPlan because trip weather is a new feature that should stay decoupled from any one vendor; changing weather providers means adding another `WeatherProvider` subclass without touching controllers, routes, or the frontend.

Builder is used as a creational pattern for trip query/update assembly. `TripQueryBuilder` builds the authenticated user's trip list filter and newest-first sort, while `TripUpdateBuilder` builds partial trip updates from request data without overwriting omitted fields. The implementation lives in `backend/builders/tripBuilders.js` and is used by `backend/controllers/tripController.js` in `getTrips` and `updateTrip` (commit `6965ef3`). This is appropriate for VacayPlan because controllers should coordinate HTTP flow, not repeatedly encode object construction rules for trip queries and update payloads.

Factory Method is used as a creational pattern to centralise user response object construction across VacayPlan's backend. Prior to this implementation, `authController.js` and `adminController.js` each built user response objects inline across five handler functions, producing inconsistent field names between controllers (notably `id` versus `_id`). `UserResponseFactory.create()` accepts a type argument and returns a guaranteed object shape, removing that inconsistency and keeping each controller focused on request flow. As Shvets (2021) notes, the pattern decouples creators from the objects they produce, which is precisely the problem this refactor addresses. The implementation lives in `backend/factories/userResponseFactory.js` (commit `e0b85f0`).

Facade is used as a structural pattern to hide the multi-model cascade complexity of trip and user deletion behind a simplified service interface. Prior to this implementation, `tripController.deleteTrip` and `adminController.deleteUser` each coordinated Trip, Activity, and User models inline, coupling HTTP flow logic directly to data management concerns. `TripService.deleteTripWithActivities()` and `UserService.deleteUserWithCascade()` encapsulate those operations behind single method calls, leaving each controller responsible only for request handling. As Shvets (2021) notes, the Facade pattern provides a simplified interface to a complex subsystem, which is precisely the separation this refactor achieves. The implementation lives in `backend/services/` (commit `30fe755`).

Singleton is used as a creational pattern to enforce a single Mongoose connection across the backend. The previous `connectDB()` opened one connection by coincidence of having a single call site rather than by design; this implementation makes that guarantee explicit. `Database.getInstance()` becomes the sole access point, direct construction of a second instance throws, and `connect()` stores the first connection and reuses it on every subsequent call. The implementation lives in `backend/config/db.js` (commit `ccd56e0`) with four unit tests in `backend/test/dbSingleton.test.js`, and `server.js` remains unchanged. A shared database connection is an expensive resource, and Singleton ensures a class has exactly one instance with a single global access point (Shvets, 2021), turning an accidental property of the codebase into a designed, testable guarantee.

Chain of Responsibility is used as a behavioural pattern to ensure admin requests clear authentication, authorisation, and request-shape validation before business logic runs. Express middleware itself embodies this pattern: `protect` and `adminProtect` already formed a latent chain, but validation sat duplicated inside the controllers, enmeshed with business logic. A new `validate(rules)` link completes the chain, with every link following the same contract - terminate with the appropriate error code, or pass the request along via `next()` (Shvets, 2021). The implementation lives in `backend/middleware/validateMiddleware.js`, wired per route in `adminRoutes.js` (commit `c42bf6d`, four unit tests); the existing admin route tests pass unchanged through the new link.

Decorator is used as a structural pattern to eliminate the ownership-check block duplicated across eight trip and activity handlers. Prior to this implementation, each of the three trip handlers (`getTripById`, `updateTrip`, `deleteTrip`) and all five activity handlers independently fetched the trip, returned 404 if not found, and re-verified that the requesting user owned the record - entwining authorisation with business logic in every function. `withOwnership(handler)` in `backend/middleware/ownershipDecorator.js` encapsulates those three steps - fetch, verify, attach as `req.trip` - and returns a new function that delegates to the original handler only when the guard passes. Routes declare the decoration explicitly: `withOwnership(getTripById)` reads as a statement of intent rather than an embedded conditional. As Shvets (2021) notes, the Decorator pattern attaches new behaviour to an object by placing it inside a wrapper; applied to Express handlers, the wrapper is a higher-order function and the added behaviour is the ownership guard. The implementation is wired in `backend/routes/tripRoutes.js` and `activityRoutes.js` (commit `e64ca7d`), with four unit tests in `backend/test/ownershipDecorator.test.js`.

State is used as a behavioural pattern to enforce the trip lifecycle defined in FR-10 (planning -> active -> completed, with completed as terminal). Without this pattern, enforcing valid transitions would require an if/else chain checked against `trip.status` inside `tripController.updateTrip` every time a status update is requested - the exact maintenance problem Shvets (2021) identifies, where "any change to the transition logic may require changing state conditionals in every method." Instead, `PlanningState`, `ActiveState`, and `CompletedState` in `backend/state/tripState.js` each implement `canTransitionTo(newStatus)`, mirroring the Context/State structure of the canonical Python example (Shvets, 2021) where concrete state classes encapsulate state-specific behaviour rather than the context handling it directly. `tripController.updateTrip` checks `isValidTransition()` before applying a status change via `TripUpdateBuilder`, rejecting invalid transitions with a 400 and descriptive message (NFR-10). The implementation lives in `backend/state/tripState.js` (commit `23a0d48`) with six unit tests in `backend/test/trip.test.js` covering valid forward transitions and rejected skips or backward moves.

### 3.2 Implementation of OOP (~250-300 words)
*Classes, Objects, Inheritance, Encapsulation, Polymorphism with code examples and justification.*

**Classes and objects.** VacayPlan's backend is structured around ES6 classes throughout. `Database` in `backend/config/db.js` is a clear example: the class defines the connection blueprint, and `Database.getInstance()` returns the single object that holds the live Mongoose connection state. `TripService` and `UserService` in `backend/services/` follow the same shape - each is defined as a class and exported as a constructed object instance, bundling related operations (cascade deletion, ownership verification) around shared state rather than scattering them as loose functions (Fig 3.2.1).

**Fig 3.2.1** — `Database` class declaration, `constructor()`, and `static getInstance()` in `backend/config/db.js`
![Fig 3.2.1](planning/screenshots/2026-06-19-oop-classes-db-rodlunt.png)

**Encapsulation.** `OpenMeteoWeatherAdapter` in `backend/adapters/weatherAdapter.js` exposes a single public method, `getForecast()`, and hides five internal methods behind the underscore convention: `_geocode()`, `_getJson()`, `_normaliseDaily()`, `_formatPlaceName()`, and `_pickBestMatch()`. The geocoding logic, HTTP request handling, and WMO-code translation are implementation details that callers never see. Controllers call `getForecast()` without knowing how the vendor response is structured - if Open-Meteo changed its format, only the adapter would need updating (Fig 3.2.2).

**Fig 3.2.2** — `getForecast()` as the sole public interface delegating to private `_geocode()`, `_getJson()`, and `_normaliseDaily()` in `backend/adapters/weatherAdapter.js`
![Fig 3.2.2](planning/screenshots/2026-06-19-oop-encapsulation-weather-rodlunt.png)

**Inheritance.** Two class hierarchies appear in the backend. `OpenMeteoWeatherAdapter extends WeatherProvider` in `backend/adapters/weatherAdapter.js`: `WeatherProvider` defines the `getForecast()` interface (throwing if not overridden), and the subclass provides the Open-Meteo implementation. `PlanningState`, `ActiveState`, and `CompletedState` all extend `TripState` in `backend/state/tripState.js`, each overriding `canTransitionTo(newStatus)` with its own rules. Both hierarchies use the same approach: an abstract base class enforces a contract; concrete subclasses provide the implementation (Fig 3.2.3).

**Fig 3.2.3** — `TripState` base class and three subclasses with `extends TripState` in `backend/state/tripState.js`
![Fig 3.2.3](planning/screenshots/2026-06-19-oop-inheritance-tripstate-rodlunt.png)

**Polymorphism.** The State hierarchy demonstrates runtime polymorphism. `isValidTransition()` in `tripState.js` calls `state.canTransitionTo(newStatus)` without knowing the concrete class - when the trip is in `PlanningState`, the call returns true only for `'active'`; the same call on `CompletedState` always returns false. The method signature is identical across all three subclasses; the correct implementation is resolved at runtime based on the actual object (Fig 3.2.4).

**Fig 3.2.4** — `isValidTransition()` delegating to `state.canTransitionTo(newStatus)` at runtime in `backend/state/tripState.js`
![Fig 3.2.4](planning/screenshots/2026-06-19-oop-polymorphism-tripstate-rodlunt.png)

---

## Team collaboration via GitHub (~200-250 words)

### 4.1 Team collaboration statement
*(draft here)*

### 4.2 Team collaboration evidence
*Feature branches; PRs; minimum 2 resolved merge conflicts; commit history graph; meeting times/dates. Meeting log + merge-conflict log are kept in `planning/A2_Report_Notes.md` §4.2.*

*(draft here — plus figures: commit graph, PR list, merge-conflict resolution)*

**Fig 4.2.1** — Kanban board (13 Jun) showing Blocked column in use with blocked-by comments and EPICs in flight
![Fig 4.2.1](planning/screenshots/2026-06-13-kanban-blocked-column.png)

**Fig 4.2.2** — PR #66 review thread showing review flag raised, fix PR #69 created, and approval cross-references
![Fig 4.2.2](planning/screenshots/2026-06-13-pr66-review-thread.png)

**Fig 4.2.3** — PR #66 fix reference confirming PR #69 closed the flagged issue and was approved
![Fig 4.2.3](planning/screenshots/2026-06-13-pr66-review-thread-fix-ref.png)

**Fig 4.2.4** — Issues board showing open tasks with assignees across all three team members
![Fig 4.2.4](planning/screenshots/2026-06-17-issues-board.png)

**Fig 4.2.5** — PR #71 multi-turn review thread: Joe requests review, Rodney flags conflict concern, Joe confirms resolution
![Fig 4.2.5](planning/screenshots/2026-06-17-pr71-discussion.png)

**Fig 4.2.6** — PR #74 merge conflict resolution comment documenting how the A2_Report_Notes.md conflict was resolved
![Fig 4.2.6](planning/screenshots/2026-06-17-pr74-conflict-resolution.png)

**Fig 4.2.7** — PR #81 team coordination: cross-team word count targets communicated via PR comment
![Fig 4.2.7](planning/screenshots/2026-06-17-pr81-team-comms.png)

**Fig 4.2.8** — Contributor graph showing commit activity from all three team members
![Fig 4.2.8](planning/screenshots/2026-06-17-network-graph.png)

---

## Functional testing (only unit testing) (~200-250 words)
*Mocha/Chai unit tests for all CRUD functions.*

### 5.1 Unit test results

VacayPlan's backend is tested using Mocha as the test runner and Chai for assertions, with Sinon providing stubs for MongoDB and external HTTP calls. The suite is organised by controller and middleware, with each file grouping related test cases under descriptive `describe` blocks. Tests cover the full set of CRUD operations for trips, activities, users, and auth, as well as edge cases including missing fields, invalid status transitions, wrong-owner access attempts, and upstream weather provider failures.

The Chain of Responsibility middleware (`protect`, `adminProtect`, `validate`) is tested in isolation to verify each link handles its responsibility correctly and passes control to the next link only when its own conditions are met. The State pattern transitions (`planning → active → completed`) are covered by six dedicated tests that assert both valid forward progressions and rejected backward or skip moves. The Adapter pattern (`OpenMeteoWeatherAdapter`) includes eleven tests covering geocoding, normalisation, timeout handling, and edge cases such as blank destinations and out-of-range dates.

All 142 tests pass with no failures or pending cases (Figs 5.1.1-5.1.2). The suite runs in under one second, confirming no test introduces blocking I/O. Tests are executed in CI on every push via GitHub Actions, providing continuous regression coverage across the team's branches.

**Fig 5.1.1** — Backend test suite output (top)
![Fig 5.1.1](planning/screenshots/2026-06-19-backend-tests-top-rodlunt.png)

**Fig 5.1.2** — Backend test suite output — 142 passing (bottom)
![Fig 5.1.2](planning/screenshots/2026-06-19-backend-tests-bottom-rodlunt.png)

---

## API testing using Postman (~150-200 words)
*All endpoints incl. error handling; exported collection committed.*

Using Postman, we tested all REST endpoints covering happy paths and error cases. The collection was created and shared in the repository so each team member could run their own tests independently. The endpoint groups Rodney covered were auth (`/api/auth/*`) and admin/CoR (`/api/admin/*`).

The endpoints in admin demonstrate the Chain of Responsibility (CoR) in action, where `protect` verifies a JWT has been issued and is valid (Figs 6.1.10-6.1.11) and `adminProtect` checks for admin privileges (Fig 6.1.12). At that point, the request reaches the handler. Each figure shows one link in the chain rejecting requests at the correct point.

The collection uses environment variables (`{{base_url}}`, `{{token}}`, `{{adminToken}}`) and test scripts that save tokens from login responses, so team members can import and run their own endpoints without manual setup.

### 6.1 Request/response screenshots

**Fig 6.1.1** — POST /api/auth/register — 201 Created
![Fig 6.1.1](planning/screenshots/2026-06-18-postman-auth-register-201-rodlunt.png)

**Fig 6.1.2** — POST /api/auth/register — 400 missing fields
![Fig 6.1.2](planning/screenshots/2026-06-18-postman-auth-register-400-rodlunt.png)

**Fig 6.1.3** — POST /api/auth/register — 409 duplicate email
![Fig 6.1.3](planning/screenshots/2026-06-18-postman-auth-register-409-rodlunt.png)

**Fig 6.1.4** — POST /api/auth/login — 200 happy path
![Fig 6.1.4](planning/screenshots/2026-06-18-postman-auth-login-200-rodlunt.png)

**Fig 6.1.5** — POST /api/auth/login — 401 wrong password
![Fig 6.1.5](planning/screenshots/2026-06-18-postman-auth-login-wrong-password-401-rodlunt.png)

**Fig 6.1.6** — POST /api/auth/login — 401 unknown user
![Fig 6.1.6](planning/screenshots/2026-06-18-postman-auth-login-unknown-user-401-rodlunt.png)

**Fig 6.1.7** — GET /api/auth/profile — 401 no JWT (CoR step 1: protect blocks)
![Fig 6.1.7](planning/screenshots/2026-06-18-postman-auth-profile-no-jwt-401-rodlunt.png)

**Fig 6.1.8** — GET /api/auth/profile — 200 happy path
![Fig 6.1.8](planning/screenshots/2026-06-18-postman-auth-profile-200-rodlunt.png)

**Fig 6.1.9** — PUT /api/auth/profile — 200 update
![Fig 6.1.9](planning/screenshots/2026-06-18-postman-auth-profile-update-200-rodlunt.png)

**Fig 6.1.10** — GET /api/admin/users — 401 no JWT (CoR step 1)
![Fig 6.1.10](planning/screenshots/2026-06-18-postman-admin-no-jwt-401-rodlunt.png)

**Fig 6.1.11** — GET /api/admin/users — 403 non-admin JWT (CoR step 2: adminProtect blocks)
![Fig 6.1.11](planning/screenshots/2026-06-18-postman-admin-non-admin-403-rodlunt.png)

**Fig 6.1.12** — POST /api/auth/login as admin — 200 (adminToken acquired)
![Fig 6.1.12](planning/screenshots/2026-06-18-postman-admin-login-200-rodlunt.png)

**Fig 6.1.13** — GET /api/admin/users — 200 all users
![Fig 6.1.13](planning/screenshots/2026-06-18-postman-admin-list-users-200-rodlunt.png)

**Fig 6.1.14** — GET /api/admin/users/:id — 200 single user
![Fig 6.1.14](planning/screenshots/2026-06-18-postman-admin-get-user-200-rodlunt.png)

**Fig 6.1.15** — POST /api/admin/users — 201 create user
![Fig 6.1.15](planning/screenshots/2026-06-18-postman-admin-create-user-201-rodlunt.png)

**Fig 6.1.16** — PATCH /api/admin/users/:id — 200 status deactivated
![Fig 6.1.16](planning/screenshots/2026-06-18-postman-admin-update-status-200-rodlunt.png)

**Fig 6.1.17** — GET /api/admin/trips — 200 all trips
![Fig 6.1.17](planning/screenshots/2026-06-18-postman-admin-list-trips-200-rodlunt.png)

**Fig 6.1.18** — DELETE /api/admin/users/:id — 204 no content
![Fig 6.1.18](planning/screenshots/2026-06-18-postman-admin-delete-user-204-rodlunt.png)

*(Figs 6.1.19-6.1.37 — Lance and Joe to fill in)*

| Fig | Endpoint | Status needed | Screenshot |
|-----|----------|---------------|------------|
| 6.1.19 | POST /api/trips — create (Lance) | 201 | TODO |
| 6.1.20 | GET /api/trips — list (Lance) | 200 | TODO |
| 6.1.21 | GET /api/trips/:id (Lance) | 200 | TODO |
| 6.1.22 | GET /api/trips/:id — wrong owner (Lance) | 404 | TODO |
| 6.1.23 | PUT /api/trips/:id — update (Lance) | 200 | TODO |
| 6.1.24 | PUT /api/trips/:id — planning→completed invalid (Lance) | 400 | TODO |
| 6.1.25 | PUT /api/trips/:id — planning→active valid (Lance) | 200 | TODO |
| 6.1.26 | PUT /api/trips/:id — active→planning invalid (Lance) | 400 | TODO |
| 6.1.27 | PUT /api/trips/:id — active→completed valid (Lance) | 200 | TODO |
| 6.1.28 | PUT /api/trips/:id — completed→planning invalid (Lance) | 400 | TODO |
| 6.1.29 | DELETE /api/trips/:id — cascade Facade (Lance) | 204 | TODO |
| 6.1.30 | POST /api/trips/:id/activities — create (Joe) | 201 | TODO |
| 6.1.31 | GET /api/trips/:id/activities — list (Joe) | 200 | TODO |
| 6.1.32 | PUT /api/trips/:id/activities/:actId — update (Joe) | 200 | TODO |
| 6.1.33 | PATCH /api/trips/:id/activities/:actId/status — booked (Joe) | 200 | TODO |
| 6.1.34 | PATCH /api/trips/:id/activities/:actId/status — invalid (Joe) | 400 | TODO |
| 6.1.35 | GET /api/trips/:id/activities — wrong owner (Joe) | 404 | TODO |
| 6.1.36 | DELETE /api/trips/:id/activities/:actId (Joe) | 204 | TODO |
| 6.1.37 | GET /api/trips/:id/weather — happy path (Joe) | 200 | TODO |

### 6.2 Exported collection

*(GitHub link to committed collection JSON — populate after export)*

---

## CI/CD pipeline setup (~150-200 words)
*GitHub Actions build/test/deploy on push; public URL; pm2 status.*

*(draft here — plus 7.1 workflow YML, 7.2 pm2 status, 7.3 Run Test page, 7.4 app with public IP)*

---

## Discussion and conclusion (~200-250 words)
*Team discussion of the development process; conclusion.*

*(draft here)*

---

## Use of GenAI + Reflection (~150-200 words, counted in total)
*Mandatory disclosure. Source table: `planning/A2_Report_Notes.md` §9. QUT CiteWrite AI-citation format.*

*(draft here)*

---

## Reflection
*Critical insight into the development process, challenges, decisions, learning. Source: the running reflection log in `planning/A2_Report_Notes.md` §9.*

*(draft here)*

---

## References
*APA 7th. Alphabetical, hanging indent. No invented references.*

Shvets, A. (2021). *Facade*. Refactoring.Guru.
    https://refactoring.guru/design-patterns/facade
Shvets, A. (2021). *Factory method*. Refactoring.Guru.
    https://refactoring.guru/design-patterns/factory-method

Shvets, A. (2021). *Chain of responsibility*. Refactoring.Guru.
    https://refactoring.guru/design-patterns/chain-of-responsibility

Shvets, A. (2021). *Decorator*. Refactoring.Guru.
    https://refactoring.guru/design-patterns/decorator

Shvets, A. (2021). *Singleton*. Refactoring.Guru.
    https://refactoring.guru/design-patterns/singleton

Shvets, A. (2021). *State*. Refactoring.Guru.
    https://refactoring.guru/design-patterns/state

Shvets, A. (2021). *State in Python*. Refactoring.Guru.
    https://refactoring.guru/design-patterns/state/python/example

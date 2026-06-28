# IFQ636 A2 - Working Report Draft

Shared drafting surface for the team report. Headings below match the supplied
template (`documents/IFQ636 Assignment 2 template.docx`) exactly, so prose drops
straight into the template on build day.

**How to use this file**
- Draft prose under each heading. One person can own a section; note your initials
  in the heading while it is in progress (e.g. `## Project overview - RL drafting`).
- Raw material (facts, decisions, talking points, sources, GenAI uses) is captured
  live in [`planning/A2_Report_Notes.md`](planning/A2_Report_Notes.md). Pull from
  there; don't reconstruct at the end.
- Target ~3000 words (range 2700-3300). Per-section budgets are guides, not limits.
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
VacayPlan lets independent travellers plan a trip in one place: record it, schedule activities within its dates, check the destination forecast, and review everything as a day-by-day itinerary. An administrator manages platform accounts.

### 2.2 Problem statement (~80 words)
Planning a multi-day trip ends up scattered across tools that were never built for it - notes apps, spreadsheets, booking emails, group chats, a weather site. None of them treat a trip as an object. Activities come loose of the days they belong to, the itinerary never exists as one view, and the forecast sits somewhere separate. Travellers hold the plan together in their heads. VacayPlan gives trip planning a single, trip-shaped home.

### 2.3 Scope (~60 words)
In scope: traveller authentication (register, log in, log out, update profile); full trip CRUD; activities scheduled within a trip's date range; the day-by-day itinerary view; a destination weather forecast; and an administrator panel for account management and trip visibility.
Out of scope: bookings, payments, and reservations; multi-user sharing or collaboration; native mobile apps; and email or push notifications. VacayPlan is a planning record, not a booking engine.

### 2.4 User characteristics (~50 words)
VacayPlan has two actors (use case diagram, Figure 2). The Traveller is a non-technical end user planning personal holidays. They expect a fast, self-explanatory interface on desktop or mobile, and own only their own trips and activities. The Administrator is a trusted operator who manages user accounts and can view all trips for moderation.

![Figure 2: VacayPlan use case diagram](planning/diagrams/A2_system_diagram_use_case.png)

### 2.5 Constraints (~50 words)
The build extends the existing VacayPlan base, so the stack is fixed: Node.js/Express, MongoDB Atlas, and React, deployed to a single AWS EC2 instance via a GitHub Actions CI/CD pipeline. External services such as Open-Meteo (which requires no API key) must be free-tier. Academic requirements include at least seven backend design patterns, OOP principles, and unit and API testing. Three people, roughly four weeks. Open-Meteo provides a running weather forecast of up to 16 days into the future, so trips beyond that will not have a forecast available.

### 2.6 Functional requirements (~30 words + table)
The following functional and non-functional requirements use "shall" statements per IEEE Std 830-1998 (Institute of Electrical and Electronics Engineers, 1998), grouped by domain across two user roles: traveller and administrator.

**Authentication**

| ID | Requirement |
|---|---|
| FR-01 | The system shall allow a user to register an account using a unique email address and password. |
| FR-02 | The system shall authenticate a registered user via email and password and issue a JSON Web Token (JWT) upon successful login. |
| FR-03 | The system shall restrict access to all protected routes to authenticated users only. |
| FR-04 | The system shall allow a user to log out, invalidating their active session token. |

**Trip management**

| ID | Requirement |
|---|---|
| FR-05 | The system shall allow a regular user to create a trip record with a destination, date range, budget, and status. |
| FR-06 | The system shall allow a regular user to view all trips associated with their account on a dashboard. |
| FR-07 | The system shall allow a regular user to update the details of an existing trip. |
| FR-08 | The system shall allow a regular user to delete a trip record from their account. |
| FR-09 | The system shall assign one of three statuses to each trip: planning, active, or completed. |
| FR-10 | The system shall enforce that trip status transitions follow the defined lifecycle: planning to active to completed. |
| FR-11 | The system shall remove all activities associated with a trip when that trip is permanently deleted. |

**Activity management**

| ID | Requirement |
|---|---|
| FR-12 | The system shall allow a regular user to add an activity to an existing trip, specifying a name, date, and description. |
| FR-13 | The system shall restrict activity dates to fall within the parent trip date range. |
| FR-14 | The system shall allow a regular user to view all activities associated with a trip, organised by day. |
| FR-15 | The system shall allow a regular user to update or delete an activity they have created. |

**Administration**

| ID | Requirement |
|---|---|
| FR-16 | The system shall provide an administrator with a user management panel listing all registered accounts. |
| FR-17 | The system shall allow an administrator to deactivate or reactivate a user account. |
| FR-18 | The system shall allow an administrator to permanently delete a user account. |
| FR-19 | The system shall remove all trips and activities associated with a user account when that account is permanently deleted. |
| FR-20 | The system shall allow an administrator to view all trips across all user accounts. |
| FR-21 | The system shall prevent a deactivated user from accessing protected routes until their account is reactivated. |
| FR-22 | The system shall return all API responses in a consistent JSON structure, with a standardised shape for user objects regardless of the operation type. |
| FR-23 | The system shall validate all incoming API requests before they reach business logic handlers. |

### 2.7 Non-functional requirements (~30 words + table)
The following non-functional requirements define the quality attributes VacayPlan shall maintain across all operating conditions.

**Performance**

| ID | Requirement |
|---|---|
| NFR-01 | The system shall return API responses for standard CRUD operations within 500 milliseconds under normal load conditions. |
| NFR-02 | The frontend dashboard shall render the full trip list within two seconds of a successful authentication event. |

**Reliability**

| ID | Requirement |
|---|---|
| NFR-03 | The system shall maintain a minimum uptime of 99% during the operational period, supported by PM2 process management on the EC2 deployment. |
| NFR-04 | The CI/CD pipeline shall automatically redeploy the application on every push to the main branch, ensuring the live environment reflects the latest stable build. |

**Security**

| ID | Requirement |
|---|---|
| NFR-05 | The system shall encrypt all user passwords using bcrypt before storage in the database. |
| NFR-06 | The system shall use JWT tokens with a defined expiry period to manage authenticated sessions, rejecting expired or malformed tokens. |
| NFR-07 | The system shall restrict all administrative operations to users with a verified administrator role, enforced at the middleware layer. |
| NFR-08 | The system shall not expose database credentials or JWT secrets in any client-accessible code or version control history. |
| NFR-13 | The system shall initialise a single shared database connection instance at application startup, reusing it across all subsequent operations for the lifetime of the process. |

**Usability**

| ID | Requirement |
|---|---|
| NFR-09 | The system shall provide a responsive user interface accessible on desktop and mobile browsers without requiring a native application installation. |
| NFR-10 | The system shall display meaningful error messages to the user when an operation fails, without exposing internal system details. |

**Scalability**

| ID | Requirement |
|---|---|
| NFR-11 | The system architecture shall support horizontal scaling by maintaining stateless API design, enabling additional backend instances to be added without session conflicts. |
| NFR-12 | The MongoDB Atlas database layer shall support collection growth without requiring schema migration, accommodating an increasing number of users and trips over time. |

**Availability**

| ID | Requirement |
|---|---|
| NFR-14 | Core trip planning features shall remain available when external data services are unavailable. |

### 2.8 User interface mockups/wireframes (~20 words + figure)
Low-fidelity wireframes for Dashboard, Trip Detail, and Edit Trip at desktop and mobile breakpoints. Red boxes mark pattern-backed additions.

![Fig 2a](planning/diagrams/wireframe-dashboard-desktop.png)
![Fig 2b](planning/diagrams/wireframe-dashboard-mobile.png)
![Fig 3a](planning/diagrams/wireframe-trip-detail-desktop.png)
![Fig 3b](planning/diagrams/wireframe-trip-detail-mobile.png)
![Fig 4a](planning/diagrams/wireframe-edit-trip-desktop.png)
![Fig 4b](planning/diagrams/wireframe-edit-trip-mobile.png)

### 2.9 Complete system diagram (~20 words + figure)
Figure 1 presents the complete VacayPlan system architecture. The React SPA communicates over HTTP through an Nginx reverse proxy to the Express backend on AWS EC2, which connects to MongoDB Atlas and the Open-Meteo weather API via a CI/CD pipeline managed by GitHub Actions.

![Figure 1: VacayPlan complete system diagram](planning/diagrams/A2_system_diagram_2.9.png)

### 2.10 Safety considerations (~100 words)
VacayPlan's safety approach operates at three layers. At the network layer, Nginx serves the app and reverse-proxies API calls to the Express backend on the EC2 public IP; the backend reaches MongoDB Atlas over TLS. The public endpoint is served over HTTP, in line with the unit's bare-IP deployment model; client-facing TLS is noted as a future hardening step. At the application layer, every authenticated route passes through a three-link middleware chain - `protect` validates the JWT, `adminProtect` enforces role boundaries, and `validate` checks request shape before business logic executes. Trip and activity ownership is verified by `withOwnership` before handlers run, preventing cross-user data access. At the data layer, the Facade pattern ensures deletions cascade across related models, eliminating orphaned records. The weather adapter enforces an 8-second timeout against hung external requests.

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

### 3.1 Design pattern (~400-500 words)
*Minimum 7 patterns, each justified and demonstrated in backend code. Pattern-count ladder: 7=HD, 6=D, 5=C, 4=P. Live committed list lives in `planning/A2_Checklist.md` pattern tracker.*

Adapter is used as a structural pattern to wrap the Open-Meteo weather service. `WeatherProvider` defines the forecast interface the application depends on, and `OpenMeteoWeatherAdapter` translates the vendor's coordinate-based, WMO-coded responses into a normalised forecast object. Changing providers means adding a new `WeatherProvider` subclass without touching controllers, routes, or the frontend. Implementation: `backend/adapters/weatherAdapter.js`, serving `GET /api/trips/:id/weather` (commit `37b337c`).

Builder is used as a creational pattern for trip query and update assembly. `TripQueryBuilder` constructs the authenticated user's trip-list filter with newest-first sort; `TripUpdateBuilder` builds partial updates from request data without overwriting omitted fields. Both keep controllers focused on HTTP coordination rather than object construction rules. Implementation: `backend/builders/tripBuilders.js`, used by `tripController.js` in `getTrips` and `updateTrip` (commit `6965ef3`).

Factory Method is used as a creational pattern to centralise user response construction. Previously, `authController.js` and `adminController.js` each built response objects inline, producing inconsistent field names (`id` vs `_id`) across five handlers. `UserResponseFactory.create()` returns a guaranteed object shape, removing that inconsistency and decoupling creators from the objects they produce (Shvets, 2021c). Implementation: `backend/factories/userResponseFactory.js` (commit `e0b85f0`).

Facade is used as a structural pattern to hide multi-model cascade complexity behind a simplified service interface. Previously, `tripController.deleteTrip` and `adminController.deleteUser` each coordinated Trip, Activity, and User models inline, coupling HTTP flow logic to data management. `TripService.deleteTripWithActivities()` and `UserService.deleteUserWithCascade()` encapsulate those cascades behind single calls, leaving each controller responsible only for request handling. Implementation: `backend/services/` (commit `30fe755`).

Singleton is used as a creational pattern to enforce a single Mongoose connection. The prior `connectDB()` relied on a single call site rather than an enforced guarantee; `Database.getInstance()` makes it explicit - direct construction of a second instance throws, and `connect()` reuses the stored connection on every call. Implementation: `backend/config/db.js` (commit `ccd56e0`), six unit tests in `backend/test/dbSingleton.test.js`.

Chain of Responsibility is used as a behavioural pattern to sequence authentication, authorisation, and validation before business logic runs. `protect` and `adminProtect` formed a latent chain; a new `validate(rules)` link completes it, with each link terminating on failure or passing control via `next()` (Shvets, 2021a). Implementation: `backend/middleware/validateMiddleware.js`, wired per route in `adminRoutes.js` (commit `c42bf6d`).

Decorator is used as a structural pattern to eliminate the ownership-check duplicated across eight trip and activity handlers. Each previously fetched the trip, returned 404 if absent, and re-verified ownership inline. `withOwnership(handler)` in `backend/middleware/ownershipDecorator.js` encapsulates those three steps and delegates to the original handler only when the guard passes - the wrapper adds behaviour without modifying the wrapped function (Shvets, 2021b). Implementation: `tripRoutes.js` and `activityRoutes.js` (commit `e64ca7d`).

State is used as a behavioural pattern to enforce the trip lifecycle defined in FR-10 (planning -> active -> completed, completed terminal). `PlanningState`, `ActiveState`, and `CompletedState` each implement `canTransitionTo(newStatus)`, encapsulating state-specific behaviour rather than scattering it as if/else chains in the controller (Shvets, 2021d). `tripController.updateTrip` rejects invalid transitions with a 400 response (NFR-10). Implementation: `backend/state/tripState.js` (commit `23a0d48`), nine unit tests across `backend/test/trip.test.js` (six API-level transition tests) and `backend/test/tripState.test.js` (three unit-level tests covering the base class guard, unknown status handling, and the full lifecycle matrix).

### 3.2 Implementation of OOP (~250-300 words)
*Classes, Objects, Inheritance, Encapsulation, Polymorphism with code examples and justification.*

**Classes and objects.** VacayPlan's backend is structured around ES6 classes throughout. `Database` in `backend/config/db.js` is a clear example: the class defines the connection blueprint, and `Database.getInstance()` returns the single object that holds the live Mongoose connection state. `TripService` and `UserService` in `backend/services/` follow the same shape - each is defined as a class and exported as a constructed object instance, bundling related operations (cascade deletion, ownership verification) around shared state rather than scattering them as loose functions (Fig 3.2.1).

**Fig 3.2.1** - `Database` class with `getInstance()` (db.js)
![Fig 3.2.1](planning/screenshots/2026-06-19-oop-classes-db-rodlunt.png)

**Encapsulation.** `OpenMeteoWeatherAdapter` in `backend/adapters/weatherAdapter.js` exposes a single public method, `getForecast()`, and hides five internal methods behind the underscore convention: `_geocode()`, `_getJson()`, `_normaliseDaily()`, `_formatPlaceName()`, and `_pickBestMatch()`. The geocoding logic, HTTP request handling, and WMO-code translation are implementation details that callers never see. Controllers call `getForecast()` without knowing how the vendor response is structured - if Open-Meteo changed its format, only the adapter would need updating (Fig 3.2.2).

**Fig 3.2.2** - `getForecast()` delegating to private helpers (weatherAdapter.js)
![Fig 3.2.2](planning/screenshots/2026-06-19-oop-encapsulation-weather-rodlunt.png)

**Inheritance.** Two class hierarchies appear in the backend. `OpenMeteoWeatherAdapter extends WeatherProvider` in `backend/adapters/weatherAdapter.js`: `WeatherProvider` defines the `getForecast()` interface (throwing if not overridden), and the subclass provides the Open-Meteo implementation. `PlanningState`, `ActiveState`, and `CompletedState` all extend `TripState` in `backend/state/tripState.js`, each overriding `canTransitionTo(newStatus)` with its own rules. Both hierarchies use the same approach: an abstract base class enforces a contract; concrete subclasses provide the implementation (Fig 3.2.3).

**Fig 3.2.3** - `TripState` base class and subclasses (tripState.js)
![Fig 3.2.3](planning/screenshots/2026-06-19-oop-inheritance-tripstate-rodlunt.png)

**Polymorphism.** The State hierarchy demonstrates runtime polymorphism. `isValidTransition()` in `tripState.js` calls `state.canTransitionTo(newStatus)` without knowing the concrete class - when the trip is in `PlanningState`, the call returns true only for `'active'`; the same call on `CompletedState` always returns false. The method signature is identical across all three subclasses; the correct implementation is resolved at runtime based on the actual object (Fig 3.2.4).

**Fig 3.2.4** - `isValidTransition()` calling `canTransitionTo()` (tripState.js)
![Fig 3.2.4](planning/screenshots/2026-06-19-oop-polymorphism-tripstate-rodlunt.png)

---

## Team collaboration via GitHub (~200-250 words)

### 4.1 Team collaboration statement
*(draft here)*

### 4.2 Team collaboration evidence
*Feature branches; PRs; minimum 2 resolved merge conflicts; commit history graph; meeting times/dates. Meeting log + merge-conflict log are kept in `planning/A2_Report_Notes.md` §4.2.*

The team worked one feature branch per task, merged through reviewed pull requests with ordinary merge commits (never squash) so per-decision history is preserved. The commit graph below shows feature branches merging into `main` with authorship across all three members; Appendix A lists every pull request with its branch, author, and reviewer, and the resolved merge conflicts.

**Fig 4.2.0** - Commit graph (VS Code Git Graph): feature branches merged into `main` via pull request, with per-commit authorship across the team
![Fig 4.2.0](planning/screenshots/2026-06-28-git-graph-vscode-rodlunt.png)

**Fig 4.2.1** - Kanban board (13 Jun) with Blocked column in use
![Fig 4.2.1](planning/screenshots/2026-06-13-kanban-blocked-column.png)

**Fig 4.2.2** - PR #66 review thread and fix PR #69
![Fig 4.2.2](planning/screenshots/2026-06-13-pr66-review-thread.png)

**Fig 4.2.3** - PR #66 fix closing the flagged issue
![Fig 4.2.3](planning/screenshots/2026-06-13-pr66-review-thread-fix-ref.png)

**Fig 4.2.4** - Issues board with assignees across the team
![Fig 4.2.4](planning/screenshots/2026-06-17-issues-board.png)

**Fig 4.2.5** - PR #71 multi-turn review thread
![Fig 4.2.5](planning/screenshots/2026-06-17-pr71-discussion.png)

**Fig 4.2.6** - PR #74 merge conflict resolution comment
![Fig 4.2.6](planning/screenshots/2026-06-17-pr74-conflict-resolution.png)

**Fig 4.2.7** - PR #81 word-count coordination comment
![Fig 4.2.7](planning/screenshots/2026-06-17-pr81-team-comms.png)

**Fig 4.2.8** - Contributor graph for all three members
![Fig 4.2.8](planning/screenshots/2026-06-17-network-graph.png)

---

## Functional testing (only unit testing) (~200-250 words)
*Mocha/Chai unit tests for all CRUD functions.*

### 5.1 Unit test results

VacayPlan's backend is tested using Mocha as the test runner and Chai for assertions, with Sinon providing stubs for MongoDB and external HTTP calls. The suite is organised by controller and middleware, with each file grouping related test cases under descriptive `describe` blocks. Tests cover the full set of CRUD operations for trips, activities, users, and auth, as well as edge cases including missing fields, invalid status transitions, wrong-owner access attempts, and upstream weather provider failures.

The Chain of Responsibility middleware (`protect`, `adminProtect`, `validate`) is tested in isolation to verify each link handles its responsibility correctly and passes control to the next link only when its own conditions are met. The State pattern transitions (`planning → active → completed`) are covered by six dedicated tests that assert both valid forward progressions and rejected backward or skip moves. The Adapter pattern (`OpenMeteoWeatherAdapter`) includes fifteen tests covering geocoding, normalisation, timeout handling, and edge cases such as blank destinations, unmatched regions, omitted metrics, and out-of-range dates.

All 180 tests pass with no failures or pending cases (Figs 5.1.1-5.1.2). The suite runs in under one second, confirming no test introduces blocking I/O. Tests are executed in CI on every push via GitHub Actions, providing continuous regression coverage across the team's branches.

Code coverage is measured with c8 and stands at 99.54% of statements, 99.26% of branches, and 100% of functions (Fig 5.1.3). The only uncovered code is the `server.js` bootstrap guard, which runs solely when the file is executed directly rather than under test, and one unreachable fall-through branch in the weather adapter's request helper.

**Fig 5.1.1** - Test suite output (top)
![Fig 5.1.1](planning/screenshots/2026-06-28-backend-tests-top-rodlunt.png)

**Fig 5.1.2** - Test suite output, 180 passing (bottom)
![Fig 5.1.2](planning/screenshots/2026-06-28-backend-tests-bottom-rodlunt.png)

**Fig 5.1.3** - c8 coverage summary
![Fig 5.1.3](planning/screenshots/2026-06-28-backend-coverage-rodlunt.png)

---

## API testing using Postman (~150-200 words)
*All endpoints incl. error handling; exported collection committed.*

Using Postman, we tested all REST endpoints covering happy paths and error cases. The collection was created and shared in the repository so each team member could run their own tests independently. The endpoint groups Rodney covered were auth (`/api/auth/*`) and admin/CoR (`/api/admin/*`).

The endpoints in admin demonstrate the Chain of Responsibility (CoR) in action, where `protect` verifies a JWT has been issued and is valid (Figs 6.1.10-6.1.11) and `adminProtect` checks for admin privileges (Fig 6.1.12). At that point, the request reaches the handler. Each figure shows one link in the chain rejecting requests at the correct point.

The collection uses environment variables (`{{base_url}}`, `{{token}}`, `{{adminToken}}`) and test scripts that save tokens from login responses, so team members can import and run their own endpoints without manual setup.

### 6.1 Request/response screenshots

**Fig 6.1.1** - POST /api/auth/register - 201
![Fig 6.1.1](planning/screenshots/2026-06-18-postman-auth-register-201-rodlunt.png)

**Fig 6.1.2** - POST /api/auth/register - 400 missing fields
![Fig 6.1.2](planning/screenshots/2026-06-18-postman-auth-register-400-rodlunt.png)

**Fig 6.1.3** - POST /api/auth/register - 409 duplicate email
![Fig 6.1.3](planning/screenshots/2026-06-18-postman-auth-register-409-rodlunt.png)

**Fig 6.1.4** - POST /api/auth/login - 200
![Fig 6.1.4](planning/screenshots/2026-06-18-postman-auth-login-200-rodlunt.png)

**Fig 6.1.5** - POST /api/auth/login - 401 wrong password
![Fig 6.1.5](planning/screenshots/2026-06-18-postman-auth-login-wrong-password-401-rodlunt.png)

**Fig 6.1.6** - POST /api/auth/login - 401 unknown user
![Fig 6.1.6](planning/screenshots/2026-06-18-postman-auth-login-unknown-user-401-rodlunt.png)

**Fig 6.1.7** - GET /api/auth/profile - 401 no JWT (CoR protect)
![Fig 6.1.7](planning/screenshots/2026-06-18-postman-auth-profile-no-jwt-401-rodlunt.png)

**Fig 6.1.8** - GET /api/auth/profile - 200
![Fig 6.1.8](planning/screenshots/2026-06-18-postman-auth-profile-200-rodlunt.png)

**Fig 6.1.9** - PUT /api/auth/profile - 200 update
![Fig 6.1.9](planning/screenshots/2026-06-18-postman-auth-profile-update-200-rodlunt.png)

**Fig 6.1.10** - GET /api/admin/users - 401 no JWT (CoR step 1)
![Fig 6.1.10](planning/screenshots/2026-06-18-postman-admin-no-jwt-401-rodlunt.png)

**Fig 6.1.11** - GET /api/admin/users - 403 non-admin (CoR step 2)
![Fig 6.1.11](planning/screenshots/2026-06-18-postman-admin-non-admin-403-rodlunt.png)

**Fig 6.1.12** - POST /api/auth/login as admin - 200
![Fig 6.1.12](planning/screenshots/2026-06-18-postman-admin-login-200-rodlunt.png)

**Fig 6.1.13** - GET /api/admin/users - 200 all users
![Fig 6.1.13](planning/screenshots/2026-06-18-postman-admin-list-users-200-rodlunt.png)

**Fig 6.1.14** - GET /api/admin/users/:id - 200
![Fig 6.1.14](planning/screenshots/2026-06-18-postman-admin-get-user-200-rodlunt.png)

**Fig 6.1.15** - POST /api/admin/users - 201 create
![Fig 6.1.15](planning/screenshots/2026-06-18-postman-admin-create-user-201-rodlunt.png)

**Fig 6.1.16** - PATCH /api/admin/users/:id - 200 deactivated
![Fig 6.1.16](planning/screenshots/2026-06-18-postman-admin-update-status-200-rodlunt.png)

**Fig 6.1.17** - GET /api/admin/trips - 200 all trips
![Fig 6.1.17](planning/screenshots/2026-06-18-postman-admin-list-trips-200-rodlunt.png)

**Fig 6.1.18** - DELETE /api/admin/users/:id - 204
![Fig 6.1.18](planning/screenshots/2026-06-18-postman-admin-delete-user-204-rodlunt.png)

**Fig 6.1.19** - POST /api/auth/login - 200 (token acquired)
![Fig 6.1.19](planning/screenshots/2026-06-20-postman-auth-login-200-ldmasina.png)

**Fig 6.1.20** - POST /api/trips - 201
![Fig 6.1.20](planning/screenshots/2026-06-20-postman-trips-create-201-ldmasina.png)

**Fig 6.1.21** - GET /api/trips - 200 all trips
![Fig 6.1.21](planning/screenshots/2026-06-20-postman-trips-list-200-ldmasina.png)

**Fig 6.1.22** - GET /api/trips/:id - 200
![Fig 6.1.22](planning/screenshots/2026-06-20-postman-trips-get-by-id-200-ldmasina.png)

**Fig 6.1.23** - GET /api/trips/:id - 404 wrong owner
![Fig 6.1.23](planning/screenshots/2026-06-20-postman-trips-wrong-owner-404-ldmasina.png)

**Fig 6.1.24** - PUT /api/trips/:id - 200 update
![Fig 6.1.24](planning/screenshots/2026-06-20-postman-trips-update-200-ldmasina.png)

**Fig 6.1.25** - PUT /api/trips/:id - 400 State planning->completed invalid
![Fig 6.1.25](planning/screenshots/2026-06-20-postman-state-planning-completed-invalid-400-ldmasina.png)

**Fig 6.1.26** - PUT /api/trips/:id - 200 State planning->active
![Fig 6.1.26](planning/screenshots/2026-06-20-postman-state-planning-active-valid-200-ldmasina.png)

**Fig 6.1.27** - PUT /api/trips/:id - 400 State active->planning invalid
![Fig 6.1.27](planning/screenshots/2026-06-20-postman-state-active-planning-invalid-400-ldmasina.png)

**Fig 6.1.28** - PUT /api/trips/:id - 200 State active->completed
![Fig 6.1.28](planning/screenshots/2026-06-20-postman-state-active-completed-valid-200-ldmasina.png)

**Fig 6.1.29** - PUT /api/trips/:id - 400 State completed->planning invalid
![Fig 6.1.29](planning/screenshots/2026-06-20-postman-state-completed-planning-invalid-400-ldmasina.png)

**Fig 6.1.30** - DELETE /api/trips/:id - 204 cascade (Facade)
![Fig 6.1.30](planning/screenshots/2026-06-20-postman-trips-delete-204-ldmasina.png)

**Fig 6.1.31** - GET /api/trips - 401 no JWT
![Fig 6.1.31](planning/screenshots/2026-06-20-postman-trips-no-jwt-401-ldmasina.png)

*(Figs 6.1.32-6.1.37 - Joe to fill in)*

| Fig | Endpoint | Status needed | Screenshot |
|-----|----------|---------------|------------|
| 6.1.19 | POST /api/trips - create (Lance) | 201 | TODO |
| 6.1.20 | GET /api/trips - list (Lance) | 200 | TODO |
| 6.1.21 | GET /api/trips/:id (Lance) | 200 | TODO |
| 6.1.22 | GET /api/trips/:id - wrong owner (Lance) | 404 | TODO |
| 6.1.23 | PUT /api/trips/:id - update (Lance) | 200 | TODO |
| 6.1.24 | PUT /api/trips/:id - planning→completed invalid (Lance) | 400 | TODO |
| 6.1.25 | PUT /api/trips/:id - planning→active valid (Lance) | 200 | TODO |
| 6.1.26 | PUT /api/trips/:id - active→planning invalid (Lance) | 400 | TODO |
| 6.1.27 | PUT /api/trips/:id - active→completed valid (Lance) | 200 | TODO |
| 6.1.28 | PUT /api/trips/:id - completed→planning invalid (Lance) | 400 | TODO |
| 6.1.29 | DELETE /api/trips/:id - cascade Facade (Lance) | 204 | TODO |
| 6.1.30 | POST /api/trips/:id/activities - create (Joe) | 201 | TODO |
| 6.1.31 | GET /api/trips/:id/activities - list (Joe) | 200 | TODO |
| 6.1.32 | PUT /api/trips/:id/activities/:actId - update (Joe) | 200 | TODO |
| 6.1.33 | PATCH /api/trips/:id/activities/:actId/status - booked (Joe) | 200 | TODO |
| 6.1.34 | PATCH /api/trips/:id/activities/:actId/status - invalid (Joe) | 400 | TODO |
| 6.1.35 | GET /api/trips/:id/activities - wrong owner (Joe) | 404 | TODO |
| 6.1.36 | DELETE /api/trips/:id/activities/:actId (Joe) | 204 | TODO |
| 6.1.37 | GET /api/trips/:id/weather - happy path (Joe) | 200 | TODO |

### 6.2 Exported collection

*(GitHub link to committed collection JSON - populate after export)*

---

## CI/CD pipeline setup (~150-200 words)
*GitHub Actions build/test/deploy on push; public URL; pm2 status.*

VacayPlan uses two GitHub Actions workflows with distinct responsibilities. `pr-checks.yml` runs on every pull request targeting main, executing the backend test suite and a frontend production build on a GitHub-hosted runner with no deployment or secret access, restoring PR-time test gating that the original single-workflow architecture lacked (Laster, 2023, Ch. 2).

`ci.yml` implements continuous deployment via a self-hosted runner on an AWS EC2 t3.medium instance running Ubuntu 24.04 LTS at public IP 3.26.14.122: every merge to main triggers an automated build, test, and deploy sequence without a manual approval gate (IFQ636 Module 1.14, 2026). The workflow covers Node 22 setup, dependency installation, React production build, Mocha and Chai test execution, rsync deployment, nginx synchronisation, and PM2 restart. Credentials are injected via GitHub Actions Secrets rather than hardcoded in the workflow file, consistent with security hardening practices that prohibit echoing secret values to public logs (Laster, 2023, Ch. 9; GitHub Inc., 2026). The instance is provisioned as Infrastructure as a Service, with the team managing all configuration above the cloud provider layer (IFQ636 Module 7.2, 2026). PM2 uses systemd startup to survive reboots, and nginx proxies port 80 to the frontend on port 3000 and the backend API on port 5001.

**Fig 7.1** - CI/CD workflow YML
![Fig 7.1](planning/screenshots/2026-06-17-cicd-workflow-yml-ldmasina.png)

**Fig 7.2** - EC2 PM2 status
![Fig 7.2](planning/screenshots/2026-06-17-pm2-status-vacayplan-a2-ldmasina.png)

**Fig 7.3** - GitHub Actions test run
![Fig 7.3](planning/screenshots/2026-06-18-cicd-run-job-steps-rodlunt.png)

**Fig 7.4** - App first page with public IP
![Fig 7.4](planning/screenshots/2026-06-17-vacayplan-a2-live-browser-ldmasina.png)

---

## Discussion and conclusion (218 words)
*Team discussion of the development process; conclusion.*

We organised development around short-lived feature branches and pull requests, which let the three of us work in parallel while keeping the main branch deployable. The benefit of this approach was that each merge into main was seen by at least 2 of the 3 members, significantly reducing the chance of issues. A post-merge review of PR #66 caught a frontend regression that both test suites had missed, which showed us that backend unit tests do not necessarily guarantee API contract safety. Resolving merge conflicts turned out to be productive in a similar way. When working through conflict #2, between Rodney's Chain of Responsibility entry and Lance's Facade branch, the reconciliation forced the implementation references up to date. The resulting documentation was more accurate than either branch in isolation.

Collaboration widened the design as well. The weather adapter gave us a sensible place to apply the Adapter pattern, as the existing design had no obvious fit for it. Finally, the pipeline was split into pr-checks.yml and ci.yml once it was clear a deploy-time gate could not be the only test gate.

Overall, VacayPlan is a working full-stack trip-planning application. It has been built on documented design patterns and OOP principles. Testing involved unit tests and Postman API checks, and every push was deployed through an automated CI/CD pipeline. 

---

## Use of GenAI + Reflection (~150-200 words, counted in total)
*Mandatory disclosure. Source table: `planning/A2_Report_Notes.md` §9. QUT CiteWrite AI-citation format.*

*(draft here)*

Joe's GenAI disclosure
Sample prompts (joe's work — Adapter + Builder):
- Design drafting — "draft a WeatherProvider interface and an Open-Meteo adapter so the app depends on a stable forecast contract, not the vendor's response shape"
- Code drafting — "map Open-Meteo's WMO weather codes to short summaries"
- Debugging — "guard the forecast call with a timeout/abort so a hung vendor request can't block a trip"
- Refactoring — "fold trip-list filtering into a fluent TripQueryBuilder"
- Copyediting and PR descriptions

AI-assisted tasks (joe):
- Adapter pattern (weather integration) code
- Builder pattern code
- SRS 2.1–2.5 prose
- Design-pattern paragraph copyedits (3.1)

How verified (joe):
- Code claims checked against README, backend models/routes/controllers, and the use-case diagram
- CI/CD pipeline tests
- npm test run between changes (106 passing)
- Task sheet read directly rather than paraphrased from memory


---

## Reflection
*Critical insight into the development process, challenges, decisions, learning. Source: the running reflection log in `planning/A2_Report_Notes.md` §9.*

*(draft here)*

---

## References
*APA 7th. Alphabetical, hanging indent. No invented references.*

GitHub Inc. (2026). *Secure use reference*. GitHub Docs.
    https://docs.github.com/en/actions/reference/security/secure-use

Institute of Electrical and Electronics Engineers. (1998). *IEEE recommended practice for software requirements specifications* (IEEE Std 830-1998).
    https://doi.org/10.1109/IEEESTD.1998.88286

IFQ636 Software Lifecycle Management, QUT. (2026). *1.14 DevOps and CI/CD pipelines*. Module 1.
    https://canvas.qutonline.edu.au/courses/2238/pages/1-dot-14-devops-and-ci-slash-cd-pipelines

IFQ636 Software Lifecycle Management, QUT. (2026). *7.2 Cloud infrastructure foundations*. Module 7.
    https://canvas.qutonline.edu.au/courses/2238/pages/7-dot-2-cloud-infrastructure-foundations

Laster, B. (2023). *Learning GitHub actions: automation and integration of CI/CD with GitHub* (1st ed.). O'Reilly Media.

Shvets, A. (2021a). *Chain of responsibility*. Refactoring.Guru.
    https://refactoring.guru/design-patterns/chain-of-responsibility

Shvets, A. (2021b). *Decorator*. Refactoring.Guru.
    https://refactoring.guru/design-patterns/decorator

Shvets, A. (2021c). *Factory method*. Refactoring.Guru.
    https://refactoring.guru/design-patterns/factory-method

Shvets, A. (2021d). *State*. Refactoring.Guru.
    https://refactoring.guru/design-patterns/state


---

## Appendix A: Branch and pull-request evidence

Every code change was developed on a dedicated feature branch (one branch per task) and merged into `main` through a reviewed pull request. Ordinary merge commits were used (never squash), so per-decision history is preserved on `main`; merged branches were then deleted, so the live branch list shows only `main`. The branch and merge topology is shown visually in the commit graph (Figure 4.2.0); the pull-request history below is the authoritative textual record.

### Headline numbers

| Metric | Value |
|---|---|
| Pull requests opened | 65 |
| Pull requests merged | 62 |
| Distinct feature branches | 63 |
| Genuine merge conflicts resolved on record | 7 |

**Commits and pull requests per member**

| Member | Commits | Pull requests |
|---|---|---|
| rodlunt (Rodney Lunt) | ~126 | 48 |
| LDMasina (Lance Masina) | ~54 | 9 |
| jrmilburn (Joseph Milburn) | ~33 | 8 |

**Branch prefixes**

| Prefix | Count |
|---|---|
| `docs/` | 34 |
| `fix/` | 10 |
| `pattern/` | 5 |
| `test/` | 5 |
| `chore/` | 4 |
| `feature/` | 3 |
| `hotfix/` | 2 |
| `feat/` | 2 |

### Pull request to branch evidence

| PR | Source branch | Author | Reviewed by | Merged | Title |
|---|---|---|---|---|---|
| #62 | `docs/vscode-issue-filters` | rodlunt | LDMasina | 2026-06-09 | Document VS Code issue filter setup |
| #63 | `chore/ignore-local-drafts` | rodlunt | - | 2026-06-10 | Ignore planning/local/ for local-only drafts |
| #64 | `pattern/builder-trip-query-update` | jrmilburn | rodlunt | 2026-06-11 | feat: Implement trip builder pattern |
| #65 | `docs/srs-requirements-2.6-2.7` | LDMasina | rodlunt | 2026-06-11 | docs: SRS sections 2.6 and 2.7 functional and non-functional requirements |
| #66 | `feature/factory-method-user-response` | LDMasina | rodlunt | 2026-06-12 | feat: Factory Method pattern - centralise user response construction |
| #68 | `docs/documentation-updates` | rodlunt | LDMasina | 2026-06-12 | docs: sync planning docs with locked pattern ownership |
| #69 | `fix/factory-admin-id-field` | LDMasina | rodlunt | 2026-06-12 | fix: restore '_id' field in admin response shape to match frontend contract |
| #70 | `pattern/singleton-db-connection` | rodlunt | jrmilburn | 2026-06-13 | feat: implement Singleton pattern for the database connection |
| #71 | `pattern/adapter` | jrmilburn | LDMasina, rodlunt | 2026-06-15 | feat: Add Open-Meteo weather forecast (Adapter pattern) |
| #72 | `docs/report-draft-updates` | rodlunt | jrmilburn | 2026-06-13 | docs: update figure placeholder, log GenAI entries, add screenshots and diagram |
| #73 | `pattern/chain-of-responsibility-middleware` | rodlunt | jrmilburn | 2026-06-13 | feat: implement Chain of Responsibility in the admin middleware pipeline |
| #74 | `docs/meeting-2-outcomes` | rodlunt | LDMasina | 2026-06-16 | docs: post meeting 2 updates - pattern ownership, role split, meeting log |
| #75 | `docs/srs-requirements-revision` | LDMasina | rodlunt | 2026-06-14 | docs: revise SRS 2.6-2.7 per Rod PR #65 feedback |
| #76 | `feature/facade-service-layer` | LDMasina | rodlunt | 2026-06-13 | feat: Facade pattern - service layer for cascade delete operations |
| #77 | `chore/update-cicd-ip-a2` | LDMasina | - | 2026-06-15 | chore: update CI/CD deploy target IP to A2 EC2 instance |
| #78 | `feature/state-trip-lifecycle` | LDMasina | rodlunt | 2026-06-15 | feat: implement State pattern for trip lifecycle (FR-10) |
| #79 | `pattern/chain-of-responsibility-middleware` | rodlunt | - | 2026-06-16 | feat: implement Decorator pattern - withOwnership handler wrapper |
| #80 | `docs/test-case-grid` | rodlunt | LDMasina | 2026-06-16 | docs: backfill unit test case grid (TC-SIN to TC-CRUD) |
| #81 | `docs/add-word-count-targets` | rodlunt | - | 2026-06-16 | docs: add per-section word count targets to document_draft headings |
| #82 | `docs/srs-2-10-2-11-draft` | rodlunt | jrmilburn | 2026-06-17 | docs: draft SRS 2.9-2.11 + diagram exports |
| #83 | `fix/trip-builder-comments` | jrmilburn | rodlunt | 2026-06-17 | Add comments to tripBuilder file |
| #84 | `docs/project-overview` | jrmilburn | rodlunt | 2026-06-17 | docs: Project overview |
| #85 | `fix/decorator-comment` | rodlunt | LDMasina | 2026-06-17 | docs: add Decorator pattern header comment to ownershipDecorator.js |
| #86 | `fix/edit-trip-status-save` | rodlunt | - | 2026-06-17 | fix: include status in EditTrip save payload |
| #87 | `docs/collaboration-evidence` | rodlunt | LDMasina | 2026-06-17 | docs: collaboration evidence screenshots and 4.2 placeholders |
| #88 | `fix/trip-hero-status-tone` | rodlunt | LDMasina | 2026-06-17 | fix: match Trip Detail status badge tone to trip state |
| #92 | `docs/readme-update` | rodlunt | LDMasina | 2026-06-17 | docs: update README - correct live URL and tidy stale references |
| #93 | `hotfix/mocha-exit-hang` | rodlunt | - | 2026-06-17 | fix: mocha --exit --timeout to unblock CI runner |
| #94 | `hotfix/jwt-secret-test-fallback` | rodlunt | - | 2026-06-17 | fix: mocha root hook JWT_SECRET fallback for local test runs |
| #95 | `docs/srs-narrative` | jrmilburn | rodlunt | 2026-06-18 | SRS narrative 2.1–2.5 (purpose, problem, scope, users, constraints) |
| #96 | `docs/cicd-evidence-7-3` | rodlunt | LDMasina | 2026-06-19 | docs: CI/CD evidence 7.3 + public IP |
| #97 | `feat/postman-auth-admin-endpoints` | rodlunt | - | 2026-06-18 | fix: return guards in protect middleware prevent double-response crash |
| #98 | `feat/postman-auth-admin-endpoints` | rodlunt | LDMasina | 2026-06-20 | docs: Postman collection + auth/admin screenshots for Section 6 |
| #99 | `fix/postman-collection-review` | rodlunt | LDMasina | 2026-06-20 | fix: Postman collection review fixes (fig numbering, admin creds, activities pre-request) |
| #100 | `docs/section-3-1-trim` | rodlunt | LDMasina | 2026-06-24 | docs: trim Section 3.1 design patterns to word target |
| #101 | `docs/section-3-2-oop` | rodlunt | LDMasina | 2026-06-20 | docs: Section 3.2 OOP write-up with inline code screenshots |
| #102 | `docs/section-4-2-collab-figures` | rodlunt | LDMasina | 2026-06-20 | docs: embed Section 4.2 collaboration figures |
| #103 | `chore/meeting-admin-20jun` | rodlunt | - | 2026-06-24 | chore: Sat 20 Jun meeting agenda + admin cleanup |
| #104 | `docs/postman-trip-screenshots-section-6` | LDMasina | rodlunt | 2026-06-24 | docs: add Section 6.1 trip CRUD and State pattern Postman figures (issue #90) |
| #105 | `docs/postman-activity-screenshots` | jrmilburn | LDMasina, rodlunt | 2026-06-28 | Postman: activity CRUD + weather test scripts (#91) |
| #106 | `chore/ci-pr-test-gate` | rodlunt | LDMasina | 2026-06-24 | ci: add PR Checks workflow to gate pull requests with tests |
| #107 | `docs/contributing-multi-pr` | rodlunt | jrmilburn | 2026-06-24 | docs: allow multiple concurrent PRs in contributing guide |
| #108 | `docs/srs-port-2-1-2-7` | rodlunt | jrmilburn | 2026-06-24 | docs: assemble SRS 2.1-2.7 into the report draft |
| #109 | `docs/fix-video-duration-30min` | rodlunt | jrmilburn | 2026-06-24 | docs: correct team video duration to 30 min (10 min per member) |
| #110 | `test/c8-coverage` | rodlunt | jrmilburn | 2026-06-24 | test: add c8 code coverage to the backend |
| #111 | `docs/video-runsheet` | rodlunt | jrmilburn, LDMasina | 2026-06-27 | docs: add 30-min team video runsheet (per-member segment plan) |
| #112 | `test/fill-coverage-gaps` | rodlunt | LDMasina | 2026-06-24 | test: cover getProfile and updateUserProfile (authController 62% -> 100%) |
| #114 | `docs/fix-2-10-https-claim` | rodlunt | LDMasina | 2026-06-24 | docs: correct 2.10 HTTPS claim to match the live HTTP deployment |
| #115 | `test/lighthouse-audits` | rodlunt | LDMasina | 2026-06-24 | test: add local Lighthouse audit layer (beyond-rubric, not CI) |
| #116 | `docs/loadtest-evidence` | rodlunt | jrmilburn | 2026-06-28 | docs: add load-test evidence screenshots (NFR-01 / Module 7) |
| #117 | `fix/pr-checks-frontend-yarn` | rodlunt | - | 2026-06-24 | fix(ci): PR Checks frontend step fails on npm ci - use yarn to match deploy |
| #118 | `docs/contributing-frontend-yarn` | rodlunt | - | 2026-06-25 | docs: correct CONTRIBUTING - frontend is yarn-managed, not npm |
| #119 | `docs/section-7-cicd-writeup` | LDMasina | - | 2026-06-24 | docs: draft Section 7 CI/CD write-up with two-workflow architecture |
| #120 | `docs/discussion-and-conclusion` | jrmilburn | rodlunt | 2026-06-28 | docs: discussion and conclusion write-up (Step 8) |
| #121 | `docs/genai-disclosure-joe` | jrmilburn | rodlunt | 2026-06-28 | docs: GenAI disclosure dot points (Joe — Adapter + Builder) |
| #122 | `docs/113-test-numbers-coverage` | rodlunt | jrmilburn | 2026-06-28 | docs: update 5.1/3.1 test numbers to 177 + coverage evidence |
| #123 | `docs/tidy-figure-labels` | rodlunt | jrmilburn | 2026-06-28 | docs: shorten figure captions + tidy formatting |
| #124 | `test/weatheradapter-branch-coverage` | rodlunt | jrmilburn | 2026-06-28 | test: cover weatherAdapter defensive branches (branches 97.78% -> 99.26%) |
| #125 | `test/15-postman-response-time` | rodlunt | - | 2026-06-28 | test(postman): response-time assertions on every request (#15) |
| #127 | `fix/postman-trip-delete-ordering` | rodlunt | - | 2026-06-28 | fix(postman): make the full collection run green end-to-end (#126) |
| #128 | `fix/ipv4-outbound-weather-geocoding` | rodlunt | - | 2026-06-28 | fix(backend): prefer IPv4 outbound so weather geocoding works |
| #129 | `fix/postman-trip-dates-in-window` | rodlunt | - | 2026-06-28 | fix(postman): in-window trip dates for a real weather forecast |
| #130 | `docs/genai-disclosure` | rodlunt | - | - (open) | docs: 9a Use of GenAI - combined team disclosure table |
| #131 | `docs/reflection` | rodlunt | - | - (open) | docs: 9b Reflection - conversational, per-member |
| #132 | `docs/postman-live-evidence` | rodlunt | - | - (open) | docs: live green-run evidence for the Postman collection (Fig 6.1.0) |

### Merge-conflict resolution records

Genuine conflicts arising from parallel work, resolved on record (commit + message):

| Commit | Resolution |
|---|---|
| `3ce58f0` | resolve conflicts with main - keep Shvets suffixes, nine unit tests, APA hanging indent |
| `ed9d9c5` | resolve conflict with main - integrate completed pattern rows into meeting-2 branch |
| `95e0963` | resolve conflicts with main - integrate State pattern and weather route |
| `9630c61` | resolve conflict with main - merge State pattern into adapter branch |
| `caf4d93` | resolve conflict with main - keep fuller meeting-2 notes |
| `4e2d810` | resolve conflicts with main - keep CoR and Facade checklist rows, add Facade and CoR references |
| `394d5e5` | resolve conflicts with main - keep Builder and Factory Method entries in all three files |

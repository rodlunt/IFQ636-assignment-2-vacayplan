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

### 3.1 Design pattern (~400-500 words)
*Minimum 7 patterns, each justified and demonstrated in backend code. Pattern-count ladder: 7=HD, 6=D, 5=C, 4=P. Live committed list lives in `planning/A2_Checklist.md` pattern tracker.*

Adapter is used as a structural pattern to wrap the Open-Meteo weather service. `WeatherProvider` defines the forecast interface the application depends on, and `OpenMeteoWeatherAdapter` translates the vendor's coordinate-based, WMO-coded responses into a normalised forecast object. Changing providers means adding a new `WeatherProvider` subclass without touching controllers, routes, or the frontend. Implementation: `backend/adapters/weatherAdapter.js`, serving `GET /api/trips/:id/weather` (commit `37b337c`).

Builder is used as a creational pattern for trip query and update assembly. `TripQueryBuilder` constructs the authenticated user's trip-list filter with newest-first sort; `TripUpdateBuilder` builds partial updates from request data without overwriting omitted fields. Both keep controllers focused on HTTP coordination rather than object construction rules. Implementation: `backend/builders/tripBuilders.js`, used by `tripController.js` in `getTrips` and `updateTrip` (commit `6965ef3`).

Factory Method is used as a creational pattern to centralise user response construction. Previously, `authController.js` and `adminController.js` each built response objects inline, producing inconsistent field names (`id` vs `_id`) across five handlers. `UserResponseFactory.create()` returns a guaranteed object shape, removing that inconsistency and decoupling creators from the objects they produce (Shvets, 2021). Implementation: `backend/factories/userResponseFactory.js` (commit `e0b85f0`).

Facade is used as a structural pattern to hide multi-model cascade complexity behind a simplified service interface. Previously, `tripController.deleteTrip` and `adminController.deleteUser` each coordinated Trip, Activity, and User models inline, coupling HTTP flow logic to data management. `TripService.deleteTripWithActivities()` and `UserService.deleteUserWithCascade()` encapsulate those cascades behind single calls, leaving each controller responsible only for request handling. Implementation: `backend/services/` (commit `30fe755`).

Singleton is used as a creational pattern to enforce a single Mongoose connection. The prior `connectDB()` relied on a single call site rather than an enforced guarantee; `Database.getInstance()` makes it explicit - direct construction of a second instance throws, and `connect()` reuses the stored connection on every call. Implementation: `backend/config/db.js` (commit `ccd56e0`), four unit tests in `backend/test/dbSingleton.test.js`.

Chain of Responsibility is used as a behavioural pattern to sequence authentication, authorisation, and validation before business logic runs. `protect` and `adminProtect` formed a latent chain; a new `validate(rules)` link completes it, with each link terminating on failure or passing control via `next()` (Shvets, 2021). Implementation: `backend/middleware/validateMiddleware.js`, wired per route in `adminRoutes.js` (commit `c42bf6d`).

Decorator is used as a structural pattern to eliminate the ownership-check duplicated across eight trip and activity handlers. Each previously fetched the trip, returned 404 if absent, and re-verified ownership inline. `withOwnership(handler)` in `backend/middleware/ownershipDecorator.js` encapsulates those three steps and delegates to the original handler only when the guard passes - the wrapper adds behaviour without modifying the wrapped function (Shvets, 2021). Implementation: `tripRoutes.js` and `activityRoutes.js` (commit `e64ca7d`).

State is used as a behavioural pattern to enforce the trip lifecycle defined in FR-10 (planning -> active -> completed, completed terminal). `PlanningState`, `ActiveState`, and `CompletedState` each implement `canTransitionTo(newStatus)`, encapsulating state-specific behaviour rather than scattering it as if/else chains in the controller (Shvets, 2021). `tripController.updateTrip` rejects invalid transitions with a 400 response (NFR-10). Implementation: `backend/state/tripState.js` (commit `23a0d48`), six unit tests covering valid progressions and rejected backward moves.

### 3.2 Implementation of OOP (~250-300 words)
*Classes, Objects, Inheritance, Encapsulation, Polymorphism with code examples and justification.*

*(draft here)*

---

## Team collaboration via GitHub (~200-250 words)

### 4.1 Team collaboration statement
*(draft here)*

### 4.2 Team collaboration evidence
*Feature branches; PRs; minimum 2 resolved merge conflicts; commit history graph; meeting times/dates. Meeting log + merge-conflict log are kept in `planning/A2_Report_Notes.md` §4.2.*

*(draft here — plus figures: commit graph, PR list, merge-conflict resolution)*

*(figure: kanban board 13 Jun - Blocked column in use with blocked-by comments, EPICs in flight - `planning/screenshots/2026-06-13-kanban-blocked-column.png`)*
*(figure: PR #66 review thread - review flag, fix PR #69, approval cross-references - `planning/screenshots/2026-06-13-pr66-review-thread.png` + `-fix-ref.png`)*
*(figure: current issues board showing open tasks with assignees - `planning/screenshots/2026-06-17-issues-board.png`)*
*(figure: PR #71 multi-turn review thread - Joe requests review, Rodney flags conflict concern, Joe confirms resolution with team thumbs-up - `planning/screenshots/2026-06-17-pr71-discussion.png`)*
*(figure: PR #74 merge conflict resolution - Rodney's comment documenting how the A2_Report_Notes.md conflict was resolved - `planning/screenshots/2026-06-17-pr74-conflict-resolution.png`)*
*(figure: PR #81 team coordination - cross-team word count targets communicated via PR comment - `planning/screenshots/2026-06-17-pr81-team-comms.png`)*
*(figure: contributor graph showing commit activity from all three team members - `planning/screenshots/2026-06-17-network-graph.png`)*

---

## Functional testing (only unit testing) (~200-250 words)
*Mocha/Chai unit tests for all CRUD functions.*

*(draft here — plus 5.1 terminal pass/fail screenshots and the test-case table)*

---

## API testing using Postman (~150-200 words)
*All endpoints incl. error handling; exported collection committed.*

*(draft here — plus 6.1 request/response screenshots and the 6.2 collection link)*

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

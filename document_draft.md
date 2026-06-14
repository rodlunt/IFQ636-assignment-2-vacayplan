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

## Project overview
*Budget ~150–200 words.* Real-world application, what it does, who it serves, why VacayPlan was chosen as the base to extend.

*(draft here)*

---

## SRS documentation
*Budget ~600–800 words across 2.1–2.11.*

### 2.1 Purpose
*(draft here)*

### 2.2 Problem statement
*(draft here)*

### 2.3 Scope
*(draft here)*

### 2.4 User characteristics
*(draft here)*

### 2.5 Constraints
*(draft here)*

### 2.6 Functional requirements
*(draft here)*

### 2.7 Non-functional requirements (NFRs)
*(draft here)*

### 2.8 User interface mockups/wireframes (Low Fidelity Design)
*(draft here — figure)*

### 2.9 Complete system diagram
*(draft here — figure)*

### 2.10 Safety considerations
*(draft here)*

### 2.11 Risk management
*(draft here — table)*

---

## Implementation (coding) using design pattern and OOP principles
*Budget ~650–800 words. This is the 28-pt criterion.*

### 3.1 Design pattern
*Minimum 7 patterns, each justified and demonstrated in backend code. Pattern-count ladder: 7=HD, 6=D, 5=C, 4=P. Live committed list lives in `planning/A2_Checklist.md` pattern tracker.*

Adapter is used as a structural pattern to wrap an external weather service. `WeatherProvider` defines the forecast interface the application depends on, and `OpenMeteoWeatherAdapter` translates Open-Meteo's coordinate-based, parallel-array, WMO-coded responses into a single normalised forecast object. The implementation lives in `backend/adapters/weatherAdapter.js` and is used by `backend/controllers/weatherController.js` to serve `GET /api/trips/:id/weather` (commit `37b337c`). This is appropriate for VacayPlan because trip weather is a new feature that should stay decoupled from any one vendor; changing weather providers means adding another `WeatherProvider` subclass without touching controllers, routes, or the frontend.

Builder is used as a creational pattern for trip query/update assembly. `TripQueryBuilder` builds the authenticated user's trip list filter and newest-first sort, while `TripUpdateBuilder` builds partial trip updates from request data without overwriting omitted fields. The implementation lives in `backend/builders/tripBuilders.js` and is used by `backend/controllers/tripController.js` in `getTrips` and `updateTrip` (commit `6965ef3`). This is appropriate for VacayPlan because controllers should coordinate HTTP flow, not repeatedly encode object construction rules for trip queries and update payloads.

Factory Method is used as a creational pattern to centralise user response object construction across VacayPlan's backend. Prior to this implementation, `authController.js` and `adminController.js` each built user response objects inline across five handler functions, producing inconsistent field names between controllers (notably `id` versus `_id`). `UserResponseFactory.create()` accepts a type argument and returns a guaranteed object shape, removing that inconsistency and keeping each controller focused on request flow. As Shvets (2021) notes, the pattern decouples creators from the objects they produce, which is precisely the problem this refactor addresses. The implementation lives in `backend/factories/userResponseFactory.js` (commit `e0b85f0`).

Facade is used as a structural pattern to hide the multi-model cascade complexity of trip and user deletion behind a simplified service interface. Prior to this implementation, `tripController.deleteTrip` and `adminController.deleteUser` each coordinated Trip, Activity, and User models inline, coupling HTTP flow logic directly to data management concerns. `TripService.deleteTripWithActivities()` and `UserService.deleteUserWithCascade()` encapsulate those operations behind single method calls, leaving each controller responsible only for request handling. As Shvets (2021) notes, the Facade pattern provides a simplified interface to a complex subsystem, which is precisely the separation this refactor achieves. The implementation lives in `backend/services/` (commit `30fe755`).

Singleton is used as a creational pattern to enforce a single Mongoose connection across the backend. The previous `connectDB()` opened one connection by coincidence of having a single call site rather than by design; this implementation makes that guarantee explicit. `Database.getInstance()` becomes the sole access point, direct construction of a second instance throws, and `connect()` stores the first connection and reuses it on every subsequent call. The implementation lives in `backend/config/db.js` (commit `ccd56e0`) with four unit tests in `backend/test/dbSingleton.test.js`, and `server.js` remains unchanged. A shared database connection is an expensive resource, and Singleton ensures a class has exactly one instance with a single global access point (Shvets, 2021), turning an accidental property of the codebase into a designed, testable guarantee.

Chain of Responsibility is used as a behavioural pattern to ensure admin requests clear authentication, authorisation, and request-shape validation before business logic runs. Express middleware itself embodies this pattern: `protect` and `adminProtect` already formed a latent chain, but validation sat duplicated inside the controllers, enmeshed with business logic. A new `validate(rules)` link completes the chain, with every link following the same contract - terminate with the appropriate error code, or pass the request along via `next()` (Shvets, 2021). The implementation lives in `backend/middleware/validateMiddleware.js`, wired per route in `adminRoutes.js` (commit `c42bf6d`, four unit tests); the existing admin route tests pass unchanged through the new link.

### 3.2 Implementation of OOP
*Classes, Objects, Inheritance, Encapsulation, Polymorphism with code examples and justification.*

*(draft here)*

---

## Team collaboration via GitHub
*Budget ~200–250 words.*

### 4.1 Team collaboration statement
*(draft here)*

### 4.2 Team collaboration evidence
*Feature branches; PRs; minimum 2 resolved merge conflicts; commit history graph; meeting times/dates. Meeting log + merge-conflict log are kept in `planning/A2_Report_Notes.md` §4.2.*

*(draft here — plus figures: commit graph, PR list, merge-conflict resolution)*

*(figure: kanban board 13 Jun - Blocked column in use with blocked-by comments, EPICs in flight - `planning/screenshots/2026-06-13-kanban-blocked-column.png`)*
*(figure: PR #66 review thread - review flag, fix PR #69, approval cross-references - `planning/screenshots/2026-06-13-pr66-review-thread.png` + `-fix-ref.png`)*

---

## Functional testing (only unit testing)
*Budget ~200–250 words. Mocha/Chai unit tests for all CRUD functions.*

*(draft here — plus 5.1 terminal pass/fail screenshots and the test-case table)*

---

## API testing using Postman
*Budget ~150–200 words. All endpoints incl. error handling; exported collection committed.*

*(draft here — plus 6.1 request/response screenshots and the 6.2 collection link)*

---

## CI/CD pipeline setup
*Budget ~150–200 words. GitHub Actions build/test/deploy on push; public URL; pm2 status.*

*(draft here — plus 7.1 workflow YML, 7.2 pm2 status, 7.3 Run Test page, 7.4 app with public IP)*

---

## Discussion and conclusion
*Budget ~200–250 words. Team discussion of the development process; conclusion.*

*(draft here)*

---

## Use of GenAI
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

Shvets, A. (2021). *Singleton*. Refactoring.Guru.
    https://refactoring.guru/design-patterns/singleton

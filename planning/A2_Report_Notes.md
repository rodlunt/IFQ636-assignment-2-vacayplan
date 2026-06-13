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

**Talking points:** *(populate after base-project decision)*

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
| *(Lance's 3rd - pending)* | - | Lance | #59 |

Lance's 3rd pattern is the one open slot: Proxy was proposed in place of State (#59), but Proxy overlaps Chain of Responsibility (#58) on the admin-auth path, and two patterns demonstrated on the same code risks a marker discounting one. Options under discussion: Proxy rescoped clear of the route middleware, Observer (anchored to the existing [AUDIT] log), Command (admin operations as command objects), or keep State.

**Decided:** each member owns an individually attributable slice of the patterns (feeds the Part C contribution split).

**Talking points / justifications:** *(populate per committed pattern)*

- Builder (creational): implemented in commit `6965ef3`. `TripQueryBuilder` assembles the authenticated user's trip list query and newest-first sort before `getTrips` passes the built filter/sort to Mongoose (`backend/builders/tripBuilders.js:31`, `backend/controllers/tripController.js:28`). `TripUpdateBuilder` centralises partial update rules for `updateTrip`, applying only supplied non-null fields while preserving omitted values and falsey values such as `0` (`backend/builders/tripBuilders.js:12`, `backend/controllers/tripController.js:55`). This fits VacayPlan because trip update/query construction was previously inline controller assignment logic; moving construction behind fluent builders keeps the controller focused on request flow and makes the allowed update fields explicit.
- Factory Method (creational): commit `e0b85f0`. `UserResponseFactory` in `backend/factories/userResponseFactory.js` centralises user response construction previously duplicated inline across `authController.js` (registerUser, loginUser, updateUserProfile) and `adminController.js` (createUser, updateUserStatus). Type argument (`auth` or `admin`) controls output shape. Removes `id` vs `_id` inconsistency between controllers. Consumed by both controllers. Justified via Shvets (2021).
- Singleton (creational): commit `ccd56e0`. `Database` class in `backend/config/db.js` turns the shared Mongoose connection from an accidental property (one call site) into a designed guarantee: `getInstance()` is the sole access point, the constructor throws on a second instantiation, and `connect()` stores the first connection promise and reuses it on every later call. `connectDB()` keeps its signature so `server.js` is unchanged - and `server.js` already guards startup behind `require.main`, so production has exactly one call site (latent invariant made explicit). Four unit tests in `backend/test/dbSingleton.test.js` prove instance identity, the construction guard, and the single-connection guarantee. Justified via Shvets (2021).

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

**Merge-conflict log (need ≥2 genuine):**
| # | Branches | What conflicted | Who resolved | Commit/PR |
|---|----------|-----------------|--------------|-----------|
| 1 | feature/factory-method-user-response vs origin/main | document_draft.md (section 3.1), planning/A2_Checklist.md (pattern tracker rows 1-2), planning/A2_Report_Notes.md (talking points) | LDMasina | commit `394d5e5`, PR #66 |

---

## Section 5: Functional testing (only unit testing) (~200–250 words)

Mocha/Chai unit tests for all CRUD functions; terminal pass/fail screenshots (5.1).

**Test case table (ID, Expected Output, Actual Output):**
| Test Case ID | Function | Expected Output | Actual Output | Pass/Fail |
|--------------|----------|-----------------|---------------|-----------|
| *(populate)* | | | | |

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

- 7.1 workflow YML: *(populate → tracker)*
- 7.2 EC2 pm2 status: *(populate → tracker)*
- 7.3 GitHub "Run Test" page: *(populate → tracker)*
- 7.4 app first page, public IP highlighted: *(populate → tracker)*

**Reusable from A1:** nginx + dual PM2 + self-hosted runner architecture (see archived `A1_Day3_SideTasks_Playbook.md` and the IFQ636 CI/CD memory). Adapt for the team repo.

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
| *(populate per use)* | | | | | |

### Reflection (running log: append verbatim, no embellishment)

Critical insight into the development process, challenges, decisions, learning. The marker wants genuine reflection, not a summary.

- 2026-06-04: A2 workspace created; A1 archived. *(append real moments as they happen)*
- 2026-06-13 (Rodney): After Joe suggested the weather API as the Adapter anchor, it was clear there is real benefit in wider ideas being included in the application - one person can't think of everything. It is almost an obvious addition, and not something I had seen in a travel application before, yet such an obviously beneficial one.
- 2026-06-13 (Rodney): Post-merge review of PR #66 caught a frontend regression that both green test suites missed (detail raised as a comment on the PR). Lesson: backend unit tests prove handler behaviour, not API contract safety - the frontend tests mock the old response shape, so a contract change can pass everything and still break the app.

### References (APA 7th: append as sources are used)

Shvets, A. (2021). *Factory method*. Refactoring.Guru. https://refactoring.guru/design-patterns/factory-method

Shvets, A. (2021). *Singleton*. Refactoring.Guru. https://refactoring.guru/design-patterns/singleton

*(Note for final assembly: multiple same-author same-year Shvets entries need APA 2021a/2021b/... suffixes, assigned alphabetically by title, with in-text citations updated to match. Do once, at write-up, when the full set is known.)*

---

## Open questions for the team / coordinator

- Word-count inclusion rules for A2, confirm same as A1 ruling (includes headings/tables/captions, excludes cover/ToC/references) or re-ask coordinator.
- Template numbering typo: API testing section lists two "6.2" headings, confirm intended 6.1/6.2 before submission.

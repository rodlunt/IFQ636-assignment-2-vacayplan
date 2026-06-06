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
| Shared GitHub repo URL | `IFQ636-assignment-2-vacayplan` (public) — *(URL populate after repo creation)* | 🟡 partial |
| Public IP / live URL | *(populate after deploy)* | ⬜ |
| Postman collection link (GitHub) | *(populate after export)* | ⬜ |
| Figma / wireframe link | *(populate)* | ⬜ |
| Rodney's contribution scope | *(populate after role split - feeds Part C)* | ⬜ |

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

**Working shortlist for the VacayPlan base** (base decided; patterns still to be validated against the code surface and locked at Phase 1, each must map to a genuine feature, no contrivance):
- Singleton: single MongoDB connection / logger / config instance
- Factory: instantiate user object by role (traveller vs administrator)
- Strategy: interchangeable itinerary sort/filter (by day, by status)
- Proxy: role-gated access to admin-only operations
- Middleware / Chain of Responsibility, Express request pipeline (auth → validation → handler)
- Observer: notify on state change (e.g. trip updated → itinerary refresh)
- Decorator: wrap trip/activity objects with derived presentation (booked vs wishlist styling)
- Facade: single service interface hiding trip + itinerary submodules

> Validate each candidate against the actual code surface before committing. A pattern only earns marks if backend code demonstrates it and the report justifies the choice. Drop any that would be contrived.

**Talking points / justifications:** *(populate per committed pattern)*

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

**Merge-conflict log (need ≥2 genuine):**
| # | Branches | What conflicted | Who resolved | Commit/PR |
|---|----------|-----------------|--------------|-----------|
| *(populate)* | | | | |

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

### References (APA 7th: append as sources are used)

*(No sources confirmed yet. Add full APA entries here as material is cited. No invented references.)*

---

## Open questions for the team / coordinator

- Word-count inclusion rules for A2, confirm same as A1 ruling (includes headings/tables/captions, excludes cover/ToC/references) or re-ask coordinator.
- Template numbering typo: API testing section lists two "6.2" headings, confirm intended 6.1/6.2 before submission.
- Does each member need an individually attributable slice of the 7 patterns, or is collective ownership acceptable for the pattern criterion? (Affects Part C contribution split.)

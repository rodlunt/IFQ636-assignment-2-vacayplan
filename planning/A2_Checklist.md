# A2 Checklist: Mode 3

## Carry-forward feedback (top lessons from prior work of this type)

**No carry-forward feedback yet.** This is the first GRPT (group report) in the feedback bank, and A1 (the first IFQ636 assignment) is not yet marked. Once A1 feedback lands (Mode 11) and/or the first GRPT is marked, surface the top 3 lessons here.

Provisional carry-overs from A1 *process* (not marks, A1 unmarked):
- Atomic commits per logical change; never bundle multi-file features into one commit (deliverable repo discipline).
- Keep the git graph clean, serial PRs, no squash-merge, real merge history. **For A2 the rubric explicitly grades merge-conflict resolution**, so at least 2 genuine conflicts must be created and resolved on record.
- QUT graded screenshots of authenticated web tools keep the full screen with the user avatar visible (authenticity proof).
- Build the submission DOCX from the template via python-docx (preserves header logo, customXml, custom styles), never from-scratch.

---

## Rubric checklist

- [ ] **SRS (10 pts):** All 11 sections complete (2.1–2.11); complete system diagram (2.9); functional (2.6) + non-functional (2.7) requirements; risk management table (2.11); safety considerations (2.10)
- [ ] **Design patterns + OOP (28 pts):** **Minimum 7 patterns**; backend code shown for each; each justified; OOP principles (encapsulation, inheritance, abstraction/polymorphism) demonstrated with code
- [ ] **GitHub collaboration (10 pts):** New team repo; feature branches; PRs; **minimum 2 merge conflicts documented**; commit history graph; team meeting log (section 4.2); all commits attributable to individuals
- [ ] **API testing / Postman (12 pts):** All endpoints tested incl. error handling; exported collection (GitHub link); request/response screenshots or Swagger docs
- [ ] **Unit testing (12 pts):** Mocha/Chai; terminal pass/fail for all CRUD functions (create, update, delete, fetch); test case table with Test Case ID, Expected Output, Actual Output
- [ ] **CI/CD (12 pts):** GitHub Actions build/test/deploy; runs on push; public URL live; pm2 status confirms backend + frontend running (sections 7.1–7.4)
- [ ] **README + Report + Reflection (16 pts):** README with setup instructions + public URL; report complete; reflection with critical insight (challenges, decisions, learning); all sources APA referenced

### Pattern tracker (target ≥7: fill as the team selects)

| # | Pattern | Owner | Project feature it serves | Backend file/class | Justified in report | Code-demonstrated |
|---|---------|-------|---------------------------|--------------------|--------------------|-------------------|
| 1 | Builder | Joe (#54) | Trip list query assembly + partial trip updates | `backend/builders/tripBuilders.js` (`TripQueryBuilder`, `TripUpdateBuilder`) | [x] | [x] |
| 2 | Simple Factory | Lance (#53) | Centralise user response construction across auth and admin controllers | `backend/factories/userResponseFactory.js` (`UserResponseFactory`) | [x] | [x] |
| 3 | Singleton | Rodney (#52) | Single shared MongoDB connection, guarded against re-init | `backend/config/db.js` (`Database`) | [x] | [x] |
| 4 | Decorator | Rodney (#56) | Ownership/audit handler wrappers replacing duplicated checks across trip + activity controllers | `backend/middleware/ownershipDecorator.js` (`withOwnership`) | [x] | [x] |
| 5 | Chain of Responsibility | Rodney (#58) | Express middleware pipeline (protect -> adminProtect -> validate -> handler) | `backend/middleware/validateMiddleware.js` (`validate` + rules) | [x] | [x] |
| 6 | Facade | Lance (#55) | Service layer hiding multi-model cascade operations (trip/user deletes) | `backend/services/tripService.js`, `backend/services/userService.js` | [x] | [x] |
| 7 | Adapter | Joe (#57) | External weather data for a trip (vendor-decoupled forecasts) | `backend/adapters/weatherAdapter.js` (`WeatherProvider`, `OpenMeteoWeatherAdapter`) | [x] | [x] |
| 8 | State | Lance (#59) | Trip lifecycle transition validation (FR-10) | `backend/state/tripState.js`, `backend/controllers/tripController.js` | [x] | [x] |

### Screenshot tracker (template-mandated)

- [ ] 5.1: terminal pass/fail per backend function (create / update / delete / fetch)
- [ ] 6.1: Postman request collections + responses (per endpoint)
- [ ] 4.2: commit history graph
- [ ] 4.2: PR list / merge-conflict resolution evidence
- [ ] 7.1: workflow YML
- [ ] 7.2: EC2 pm2 status output table
- [ ] 7.3: GitHub "Run Test" page (steps passing/failing)
- [ ] 7.4: app first page in browser, public IP highlighted
- [ ] 2.8: low-fidelity UI mockups/wireframes
- [ ] 2.9: complete system diagram

> Screenshots land in `assignment_2/screenshots/`. Keep the full screen with the authenticated user avatar visible for any GitHub/Postman/cloud capture (authenticity proof).

---

## Submission checklist (Mode 10 prerequisites)

- [ ] Template fully completed (`IFQ636 Assignment 2 template.docx`)
- [ ] Built from the template via python-docx (styles/header/customXml preserved), not from scratch
- [ ] Converted to PDF before submission
- [ ] Word count within 2700–3300 (confirm inclusion/exclusion rules with coordinator, A1 ruling: includes headings/tables/captions, excludes cover/ToC/references)
- [ ] One team member submits report PDF on Canvas
- [ ] GitHub link + public IP in report
- [ ] Video submitted via Canvas Studio (each member demonstrates their part; face visible)
- [ ] **Declaration of contribution (Part C) submitted**, names + student IDs + per-member contribution + signatures; one member submits on behalf of team
- [ ] GenAI disclosure completed (mandatory)
- [ ] References in APA 7th
- [ ] All cover-page link fields open without login in incognito (GitHub repo public; public URL live; Postman collection link accessible)

---

## Team coordination checklist (GRPT-specific: new for A2)

- [x] Team allocation confirmed, **2026-06-04: Rodney + Lance + Joseph** (confirm team is complete; collect Lance + Joe student IDs for Part C)
- [x] Base project selected: **VacayPlan** (most feature surface for 7 patterns + CI/CD & unit-test head start), agreed 2026-06-06
- [x] Pattern ownership assigned per member (Rodney #52/#56/#58; Lance #53/#55/#59 State; Joe #54/#57) - confirmed via email + 2026-06-13 call, recorded in #21
- [x] Role split confirmed 2026-06-13: CI/CD Lance (#60); SRS 2.6-2.7 Lance; SRS 2.1-2.5 Joe; Postman collation Joe; unit test table Lance; README/video/wireframes/diagrams Rodney
- [x] Shared GitHub repo created; all members have write access; per-member commit identity verified (merged PRs under each identity: #63 rodlunt, #64 jrmilburn, #65/#66 LDMasina)
- [x] Meeting cadence agreed 2026-06-06: **Tuesday email check-in (minimum) + standing Saturday 3pm AEST WhatsApp group call**; night before the due night (Thu 2 Jul) kept clear as a buffer session with an availability sanity-check at the preceding sync; meeting log started (feeds section 4.2)
- [ ] Contribution-tracking method agreed so Part C is evidence-backed, not reconstructed at the end

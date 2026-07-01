# A2 Delivery Plan

**Due:** 11:59pm AEST Friday 3 July 2026
**Today:** 2026-06-06 (~27 days out)
**Status:** Kickoff meeting held Sat 6 Jun 2026, 3:00pm AEST. **Base project decided: VacayPlan** (`rodlunt/vacationplan_IFQ636`), extended in a new shared repo `IFQ636-assignment-2-vacayplan` (public; clean base-import, not a fork). **Cadence agreed: Tuesday email check-in (minimum) + standing Saturday 3pm AEST WhatsApp group call**, plus the night before the due night (Thu 2 Jul) kept clear as a buffer / final-assembly session (availability sanity-checked at the preceding sync). Roles and Lance/Joe student-ID collection still to settle.

**Availability constraint:** weekday evenings only (~3–4 hr each); weekends flexible. No morning or multi-session weekday work. As a team assignment, hard deadlines also depend on teammates' availability, agree a shared cadence at the first meeting.

---

## Critical-path dependencies (resolve before detailed scheduling)

1. ~~**Team allocation**~~: ✅ resolved 2026-06-04 (Rodney, Lance, Joe).
2. ~~**Base project selection**~~: ✅ resolved 2026-06-06, **VacayPlan** is the base.
3. **Role split**: who owns which patterns / test layers / CI-CD / SRS sections. *Blocks individual work and the Part C contribution split.*

Until 2–3 resolve, only solo-prep (phase 0) is actionable.

---

## Phase 0: Solo prep (actionable now, pre-team)

- [ ] Read the A2 brief PDF and rubric end-to-end (done in workspace summary)
- [ ] Skim Modules 4–8 notes for the graded content: OOP + design patterns (Mod 4), APIs + Postman (Mod 5), testing (Mod 6), cloud/perf (Mod 7), dependability/security (Mod 8)
- [ ] Pattern shortlist for the VacayPlan base (now the chosen base), see `A2_Report_Notes.md` §3.1
- [ ] Re-read A1 CI/CD architecture (nginx + dual PM2 + self-hosted runner), directly reusable
- [x] VacayPlan confirmed as a viable base (CRUD + auth + admin already present) and chosen 2026-06-06

## Phase 1: Team formation + foundations (week of allocation)

- [ ] **First team meeting, Sat 6 Jun 3:00pm (20–30 min):** outline the activity framework. Bring: base-project options, proposed role split, branching/PR model, cadence, student-ID collection (log it, feeds §4.2)
- [ ] Create shared GitHub repo; all members write access; verify per-member commit identity
- [ ] Agree branching model + PR review rules
- [ ] Draft SRS skeleton (2.1–2.11) and assign sections
- [ ] Agree the ≥7 design patterns and which member owns each

## Phase 2: SRS + design (team, ~1 week)

- [ ] Complete SRS 2.1–2.11 collaboratively
- [ ] Low-fidelity wireframes (2.8), extend the A1 VacayPlan Figma
- [ ] Complete system diagram (2.9)
- [ ] Safety considerations (2.10) + risk management table (2.11)
- [ ] Lock the pattern selection matrix with code-location plan per pattern

## Phase 3: Implementation (team, longest phase)

- [ ] Implement the ≥7 design patterns in backend code, each on its own feature branch + PR
- [ ] OOP refactor: encapsulation, inheritance, abstraction, polymorphism with clear code examples
- [ ] **Engineer at least 2 genuine merge conflicts and resolve them on record** (rubric-graded)
- [ ] Keep commit attribution clean per member throughout

## Phase 4: Testing (team, parallel with late impl)

- [ ] Mocha/Chai unit tests for all CRUD functions; capture terminal pass/fail (5.1)
- [ ] Build the test case table (ID, Expected, Actual)
- [ ] Postman collection covering all endpoints incl. error handling; export + commit to repo (6.1/6.2)

## Phase 5: CI/CD + deploy (team)

- [ ] GitHub Actions build/test/deploy pipeline; runs on push
- [ ] Deploy to EC2; pm2 status (7.2); public URL live (7.4); workflow YML (7.1); Run Test page (7.3)

## Phase 6: Report write-up + video (team + individual)

- [ ] Assemble report from `A2_Report_Notes.md` into the template via python-docx
- [ ] Discussion + conclusion (§8); Use of GenAI (§9); Reflection (§9); References (§9)
- [ ] Record single 10-min team video (~3:20 each), each member demos their own part; faces visible
- [ ] Complete Part C declaration (names, IDs, contributions, signatures)

## Phase 7: Pre-submission (Mode 9 then Mode 10)

- [ ] Mode 9: full citation + writing-standards audit
- [ ] Mode 10: submission checklist; incognito link checks; word count; PDF; Canvas Studio video; Part C
- [ ] **Buffer / final-assembly session, evening of Thu 2 Jul (night before the due night), kept clear**; confirm availability at the preceding sync and move earlier if anyone has a clash
- [ ] One member submits report + Part C; video uploaded by one member

---

## Risk register (live: append as risks surface)

| Risk | Impact | Mitigation | Status |
|------|--------|------------|--------|
| Non-responsive team member | Lost marks on collaboration + uneven contribution | Document contact attempts; Mode 8B escalation to coordinator early, not late | Watch |
| Base project too thin for 7 patterns | Forced/contrived patterns read poorly (28 pts) | VacayPlan chosen for feature surface; still validate each pattern maps to a genuine feature | Watch |
| Merge-conflict requirement gamed unconvincingly | Collaboration marks | Create conflicts through genuine parallel work, not staged edits | Open |
| Commit attribution muddled (shared machine, pair work) | Team collaboration marks + Part C integrity | Each member commits under their own identity; no co-author muddling | Open |
| Late integration of CI/CD + deploy | 12 pts at risk if URL down at marking | Stand up pipeline mid-project, not at the end; keep EC2 + pm2 running | Open |

---

## Session log

- **2026-06-04**: A2 workspace setup; A1 archived to `archive/assignment_1/`; A2 Mode 3 workspace created. Team allocated this day: Rodney + Lance + Joseph (team contacts captured in `A2_Report_Notes.md`). Joe travelling until Sat 6 Jun, first team meeting targeted for the weekend of 6–7 Jun. Parked: confirm team is complete; collect Lance + Joe student IDs; agree base project + role split at first meeting. Lance contact captured (held privately). First team meeting locked: Sat 6 Jun 3:00pm (20–30 min) to outline the activity framework.
- **2026-06-06**: Kickoff meeting held (Rodney, Lance, Joe). Decisions: base project = **VacayPlan**; new shared repo `IFQ636-assignment-2-vacayplan` (public, clean base-import, not a fork); cadence = Tuesday email check-in + standing Saturday 3pm AEST WhatsApp call, plus the night before the due night (Thu 2 Jul) kept clear as a buffer session with an availability sanity-check at the preceding sync; git workflow = no squash-merge, one open PR at a time, branch-per-task, review-before-merge, own-identity commits. GitHub usernames captured: Lance `LDMasina`, Joe `jrmilburn`. Action: Rodney to create the repo and add Lance + Joe. Parked: role split; collect Lance + Joe student IDs for Part C.

# A2 Kickoff Meeting: Agenda + Outcomes

**When:** Sat 6 Jun 2026, 3:00pm AEST (held)
**Who:** Rodney, Lance, Joseph
**Central info point:** WhatsApp group (confirmed current channel)
**Goal:** leave with a base project, a rough role split, and an agreed way of working. Detail can settle async afterward.

> **Held 6 Jun.** Decisions recorded inline below under each item. The canonical meeting record (for report §4.2) lives in `A2_Report_Notes.md`. Carried forward (not settled at kickoff): role split and student-ID collection.

> Marks context to keep front of mind: **Design patterns + OOP = 28 of 100** (single largest criterion); **Team collaboration via GitHub = 10**, and it explicitly grades per-author commits, PRs, merges, and **merge-conflict resolution**.

---

## 1. Admin + student IDs + shared read (4 min)
**Discuss:** confirm the team is exactly the three of us; swap student IDs; quick chat about the overview (`A2_Overview_ForTeam.md`) so we're roughly on the same page about scope, and reshape it together if anyone sees it differently.
**Proposed outcome:** all three student IDs captured (needed for the Part C Declaration of Contribution); team confirmed complete; rough shared understanding of scope (adjustments welcome).

## 2. Base project (8 min)
**Discuss:** 60-second pitch each, what your A1 does, how much is built, CI/CD state.
**DECIDED: VacayPlan is the base** (verified live 2026-06-04): full CRUD + auth + admin panel, working GitHub Actions → EC2 deploy, Mocha/Chai suite already running, 3 demo trips seeded. Live at http://3.106.8.108/login. Rationale: maximum feature surface for 7 patterns + a head start on the CI/CD (12) and unit-testing (12) criteria. The new shared repo (`IFQ636-assignment-2-vacayplan`, public) starts from a clean base-import of this codebase, not a fork (the brief requires a *new* repository).

## 3. Roles (5 min)
**Discuss:** split work so each contribution is individually attributable (graded + feeds Part C).
**Proposed outcome:** named owner for each of, SRS sections, the 7 design patterns (≈2–3 each), unit tests, API/Postman tests, CI/CD, video editing. No one owns zero code.

## 4. Ways of working (8 min)

### 4a. Meeting frequency
**Discuss:** how often we sync.
**DECIDED:** a **Tuesday email check-in** (at minimum) and a **standing Saturday 3pm AEST call on the WhatsApp group**. WhatsApp for day-to-day in between. The **night before the due night (Thu 2 Jul) is kept clear** as a reserved buffer / final-assembly session; at the **preceding sync we sanity-check everyone's availability** and bring that session forward if anyone has a clash.

### 4b. Phone vs email touch base
**Discuss:** WhatsApp is already our central point, what each channel is for.
**Proposed outcome:**
- **WhatsApp group** = day-to-day default (quick questions, progress, blockers).
- **Email** = anything needing a record or involving the coordinator (extensions, formal queries, the final submission confirmation).
- **Phone call** = reserved for an urgent blocker that WhatsApp isn't resolving fast enough. Keep numbers handy, don't make it the default.

### 4c. Git workflow: merge vs squash
**Discuss:** how we merge PRs.
**DECIDED: do NOT squash-merge, and keep one open PR at a time.** Ordinary merge commits on the shared repo; one feature branch per task; **only one PR open across the team at any moment** (serial review, so the commit graph stays legible); PR reviewed by at least one other member before merge; everyone commits under their own identity. Full rules in the repo's `CONTRIBUTING.md`.
**Why (this is a marks decision, not a style one):** the 10-pt collaboration criterion grades per-author commit history and visible merge-conflict resolution. Squash-merging collapses each branch into a single commit, which erases who-did-what and destroys the merge-conflict evidence the rubric wants. We should also deliberately create and resolve **at least 2 genuine merge conflicts** and keep them on record.
**Also agree:** branch naming, who creates/owns the shared repo, and that everyone sets their git `user.email` to their own address before the first commit.

## 5. Next checkpoint + actions (3 min)
**Proposed outcome:** each person leaves with 1–2 concrete tasks and the date of the next sync. Repo created and everyone added before we leave (or as the first action item).

---

## Pre-read sent with the agenda
- **`A2_Overview_ForTeam.md`**: my rough read on the assignment; a skim beforehand so we can shape it together rather than start cold
- Everyone sends their **A1 repo + live site (+ test logins)** to the WhatsApp group beforehand, so we arrive with a project in mind
- Base-project candidate: VacayPlan (repo + live demo + logins in the kickoff email)
- The 28-pt design-pattern weighting, the base project must fit 7 genuine patterns without contrivance

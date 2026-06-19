# A2 Saturday Sync: Work Split + Open Decisions (Agenda)

**When:** Sat 13 Jun 2026, 3:00pm AEST (standing call)
**Who:** Rodney, Lance, Joseph
**Central info point:** WhatsApp group
**Goal:** ratify a work split where every member owns a vertical slice (build + tests + report section), and close out the pattern-ownership and collation questions still open from the email thread.

> **Everything below is a proposal for discussion, not a decision.** The allocation and the effort estimates are a starting point to react to and rebalance together, not a fait accompli.

> Marks context to keep front of mind: **Design patterns + OOP = 28 of 100** (single largest criterion); **Team collaboration via GitHub = 10**, and it explicitly grades per-author commits, PRs, merges, and **merge-conflict resolution**.

---

## 1. Pattern ownership: confirm + close the last slot (8 min)

**Already assigned on GitHub (7 of 8):**

| Member | Patterns | Issues |
|--------|----------|--------|
| Rodney | Singleton, Decorator, Chain of Responsibility | #52, #56, #58 |
| Lance | Factory Method, Facade | #53, #55 |
| Joe | Builder, Adapter | #54, #57 |

**Open: Lance's 3rd pattern.** Lance proposed **Proxy** (admin access control) in place of #59 State. On further scrutiny - something we all skimmed past first time - Proxy looks like it overlaps **Chain of Responsibility (#58, Rodney)**: both sit on the admin-auth path (`protect → adminProtect → handler`). Two patterns demonstrated on the same code is where a marker can discount one and drop us under seven.

**Note:** Proxy is a *Structural* pattern (not Behavioural). Swapping out State for it leaves only one Behavioural pattern (CoR). The rubric doesn't grade GoF category spread, so this is a quality/polish point, not a marks one.

**Options for discussion:**
- **Keep Proxy** - Lance to spell out how he'd scope it (e.g. a proxy around a specific service/resource object, clear of the route middleware) so it doesn't overlap CoR.
- **Observer** - anchored to the existing `[AUDIT]` log in `adminController`; behavioural, no overlap, real seed already in the code.
- **Command** - admin operations (suspend/activate/delete user) as command objects; pairs with the audit log.
- **Keep State (#59)** - its `updateUserStatus` anchor is admin-side too; zero new effort.

**Proposed outcome:** Lance's 3rd pattern locked, #59 reassigned/repurposed accordingly.

> **Status update 13 Jun (morning):** ownership is now recorded and closed on GitHub (#21 closed with the full record; #52/#56/#58 assigned to Rodney, #53/#55 Lance, #54/#57 Joe). Item 1 reduces to the Lance's-3rd decision only. Extra datapoint for that decision: FR-10 (status lifecycle) already anchors State in the SRS, so "keep State" needs zero new requirements - see the #27 thread.

## 2. Work split: one vertical slice each (12 min)

**Principle:** each person owns a section end-to-end - the build, its tests, and its report write-up - rather than a code-vs-docs divide. This keeps the commit graph balanced (feeds the 10-pt collaboration mark) and means each report section maps to code that person actually wrote.

| Owner | Lane | Effort (est. %) |
|-------|------|:---:|
| **Rodney** | Patterns (Singleton, Decorator, CoR) · Collaboration evidence (#4, #25, #48) · README collation (#22) · Video edit + upload · SRS 2.8 Figma + 2.9 diagrams + 2.10 safety + 2.11 risk · Report 3.1 | **32** |
| **Lance** | Patterns (Factory, Facade) · CI/CD + deploy (#7, #30, #60) · k6 (#50, optional) · SRS 2.6-2.7 requirements · References (#36) · Report 3.1 + Section 7 (#37) | **32** |
| **Joe** | Patterns (Builder, Adapter) · OOP (#3, #46, #47) · SRS 2.1-2.5 narrative · Report 3.2 + Project overview (#34) + Discussion/Conclusion (#35) | **28** |
| **Shared** | Unit + Postman tests (each tests own controllers) · Video segments (each own) · Declaration (#49) · GenAI + reflection logs | **8** *(split ~3 ways)* |
| | **Total** | **100** |

**Effort scores are rough estimates, for calibrating balance - not authoritative, and effort ≠ marks.** They double as a starting point for the Part C contribution split (#49). Target is ~33 each; this lands ~32 / 32 / 28.

## 3. Single-owner "collation" roles to assign (5 min)

Some deliverables are one shared artefact even though the work is distributed - they each need one owner to collate:

- **Postman collection** - everyone authors requests + test scripts for their own endpoints (#13/#14/#15) in the shared workspace, but ONE owner does setup (#12), export + commit (#17), and the Section 6 write-up + screenshots (#16). **Who owns the collection?**
- **Unit-test case table** (#33) + Step 5 write-up - everyone writes their own test files; one owner collates the table. **Who?**
- Already proposed: **README collation** (Rodney), **video edit + upload** (Rodney). Sanity-check that's not too much end-stage glue on one person.

**Proposed outcome:** named owner for the Postman collection and the unit-test table.

## 4. Open ownership confirmations (4 min)

- **Lance on CI/CD** - this is the lane that needs a live environment (EC2 + self-hosted runner + secrets, #60); slightly higher risk than its effort score, so worth starting early rather than final week. Lance happy to own it?
- **Figma / wireframes (SRS 2.8 + video Figma segment #41)** - proposed: Rodney. Confirm.

## 5. Timeline + next actions (3 min)

Rough sequencing to Fri 3 Jul (≈3.5 weeks):
1. **Now → mid-June:** SRS draft + pattern/OOP backend build in parallel (this is where the 2+ genuine merge conflicts should happen organically).
2. **~3rd week June:** unit + Postman tests; CI/CD deploy stood up.
3. **Final week:** report assembly, references, video record + edit, declaration, final DOCX into template (the Thu 2 Jul buffer night stays reserved).

**Proposed outcome:** each person leaves with their confirmed lane and 1-2 concrete first tasks; pattern slot + collation owners settled.

## 6. New since drafting - 13 Jun morning items (8 min)

> **Status update 13 Jun (pre-call):** #68 and #69 both merged this morning. Singleton **PR #70 is open** (Joe requested as reviewer) - the one-PR lane is occupied; CoR docs commit + PR queued behind it. **New datapoint:** Joe's Adapter is fully built on `pattern/adapter` (7 commits, 18 tests; #57 moved to In Progress) - so the queue after #70 is CoR, then Adapter vs Decorator/Facade ordering, which folds into the sequencing item below.

- **PR queue.** ~~PR #68 awaits review~~ Done. Current state: #70 (Singleton) under review; CoR ready behind it. **Rodney's pattern count: 2 of 3 built.** Ask: queue order for Adapter / Decorator / Facade once CoR lands.
- **Branch hygiene as part of the PR process.** Proposal: when your PR merges, delete the head branch (remote + your local) so the branch list shows only in-flight work. Easiest: flip the repo setting "Automatically delete head branches" - GitHub then removes the remote branch on merge (one-click restorable from the PR page; commits and the merge graph are untouched, so the 10-pt collaboration evidence is unaffected). Context: Rodney's two stale merged branches were cleaned up 13 Jun; three merged branches from Lance/Joe (`feature/factory-method-user-response`, `fix/factory-admin-id-field`, `pattern/builder-trip-query-update`) still sit on the remote. Ask: adopt the convention + flip the setting.
- **Decorator/Facade sequencing (#56 comment).** Both refactor `tripController`; #55 Facade is marked In Progress on the board. Decide who goes through that file first - the second branch in resolves the conflict, which doubles as genuine conflict #2 for the rubric. Decide on the call rather than discover it mid-merge.
- **PR #66 follow-ups (Lance).** Post-merge review found the admin create-user response rename (`_id` to `id`) breaks `AdminUserList` until refetch - fix direction is Lance's call (factory keeps `_id`, or the frontend maps it). Also on the PR: the Simple-Factory-vs-Factory-Method classification point for the 3.1 write-up.
- **SRS pattern-anchoring requirements (#27 thread).** Lance's FR20-23/NFR13-14 proposal + feedback (Facade cascade anchor missing, two items phrased as design rather than requirements). Lance to take to a branch/PR when the queue clears.
- **3.1 word budget.** Eight patterns at the current ~95-word paragraph average = ~760 words against the ~400-500 section guide. Decide: trim all paragraphs, or let 3.1 borrow from other sections' budgets (proposal: borrow - justification depth is where the 28 points live).
- **Test inventory convention (#33).** One line per PR that adds tests; backfilled, all three assigned. Just a flag so Lance and Joe know it exists.
- **Board: new Blocked column + convention.** Status now has a Blocked column: before moving a card there, comment what blocks it and tag whoever owns the blocker (e.g. "Blocked by #68 - @LDMasina to review"). The mention notifies the unblocker. Already in use: #52 and #58 (blocked by the #68 review), #56 (blocked by the Decorator/Facade sequencing decision - this agenda). Board description + README also added. Ask: everyone adopts the convention.

---

## Pre-read
- This agenda + the current GitHub issue board (sections, EPICs, pattern sub-issues #52-#59)
- The 28-pt pattern/OOP weighting and the 10-pt collaboration criterion (per-author commits + merge conflicts)

# Contributing — IFQ636 A2 VacayPlan

How the three of us work on this repo. These rules exist because the **Team
collaboration via GitHub** criterion (10 pts) grades our branching, pull
requests, merges, per-author commit history, and resolved merge conflicts. The
git rules below are deliberate marks decisions, not style preferences.

Team: Rodney (`rodlunt`), Lance (`LDMasina`), Joseph (`jrmilburn`).

## Git workflow

1. **One feature branch per task.** Branch off `main`. Suggested naming:
   `srs/...`, `pattern/...`, `oop/...`, `unit-test/...`, `api-test/...`,
   `ci-cd/...`, `report/...`, `docs/...`, `fix/...` (a short description after
   the slash, e.g. `pattern/strategy-itinerary-sort`).
2. **Multiple pull requests may be open at once.** Open a PR as soon as the
   work is ready rather than holding it back, and aim to review and merge open
   PRs quickly so the queue stays short. Keep each PR small and scoped to one
   task so the commit graph stays clean and legible to the marker. If you are
   blocked waiting on your own work, review an open PR so it can merge.
3. **Never squash-merge. Never rebase-flatten shared history.** Use ordinary
   merge commits. Squashing collapses a branch into a single commit, which
   erases who-did-what and destroys the merge-conflict evidence the rubric
   rewards. On GitHub, merge with the **"Create a merge commit"** option only.
4. **At least one other member reviews and approves** each PR before it merges.
5. **Atomic commits.** One logical change per commit. Don't bundle several
   features into one commit. Write clear, present-tense commit messages.
6. **Commit under your own identity.** Before your first commit, set:
   ```bash
   git config user.name "Your Name"
   git config user.email "your-own-email@example.com"
   ```
   Never commit another member's work under your name, and never add
   co-author trailers.
7. **Two genuine merge conflicts, resolved on record.** The rubric requires at
   least two. Create them through real parallel work (two people editing the
   same area), resolve them in a PR, and keep the evidence (we screenshot the
   resolution for report §4.2).

## No AI authorship signals

GenAI use is disclosed **only** in the report's *Use of GenAI* section (logged in
`planning/A2_Report_Notes.md` §9). Do **not** put AI attribution anywhere else:
no `Co-Authored-By` trailers, no "generated with AI" footers in commits, PRs,
README, docs, code comments, or report prose. Everything in the repo is presented
as our own work; the disclosure section is where AI use is declared.

## Issues and the project board

- All work is an **issue**. Label each issue by assignment section (`srs`,
  `design-patterns`, `oop`, `collaboration`, `unit-testing`, `api-testing`,
  `ci-cd`, `report`, `video`, `declaration`, `admin`) and assign it to whoever
  owns it.
- Track progress on the **GitHub Project board** (kanban: Todo → In progress →
  In review → Done).
### VS Code issue filters

`.vscode/settings.json` ships saved issue queries (committed to the repo, so
they travel with `main` — no copying needed). Each of us gets the same named
filters: *My issues*, one per person, *Unassigned*, and one per assignment
section. To use them:

1. Pull `main`.
2. Install the recommended **GitHub Pull Requests and Issues** extension
   (`github.vscode-pull-request-github`). VS Code prompts to install it from
   `.vscode/extensions.json` when you open the repo.
3. Click the **GitHub** icon in the Activity Bar and sign in to GitHub when
   asked. The filters appear under the **Issues** section.

*My issues* auto-adapts to whoever is signed in. If your filters come up empty,
check you opened the repo's **root folder** (the one with the GitHub remote) —
the queries resolve the owner/repo from that remote, so opening a sub-folder or
a remote-less clone makes them return nothing.

## Meeting cadence

- **Tuesday:** email check-in (at minimum).
- **Saturday 3pm AEST:** standing call on the WhatsApp group.
- **WhatsApp:** day-to-day questions, progress, blockers.
- **Night before the due night (Thu 2 Jul):** kept clear as a buffer /
  final-assembly session. We sanity-check everyone's availability at the
  preceding sync and pull it earlier if anyone has a clash.

## Local setup

See [`README.md`](README.md) for full setup. Quick version: `npm run install-all`
at the root, copy `backend/.env.example` to `backend/.env` and set `MONGO_URI`,
then `npm start`.

**Package managers: root and backend use npm; the frontend uses yarn.** The
root install script and the backend are npm. The **frontend is yarn-managed** -
`frontend/yarn.lock` is the live lockfile and the deploy (`ci.yml`) builds the
frontend with `yarn install` + `yarn run build`. Do **not** run `npm install`
or `npm ci` in `frontend/`: it fails against the stray, drifted
`frontend/package-lock.json` and rewrites `yarn.lock`. Use `yarn` there. Do not
introduce pnpm.

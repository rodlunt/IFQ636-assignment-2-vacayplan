# IFQ636 A2: a rough read to kick us off

*Rodney here. A1 turned into a big workload for me, and I'd rather we get our heads around A2 early and pace it than all hit a wall in the last week when everyone's juggling jobs and life. So I've jotted down how I'm reading the assignment so far. It's a first pass to react to, not a plan I'm attached to. Pull it apart and tell me what you'd do differently.*

## In a nutshell

We're a team of three extending **one** of our Assignment 1 projects into a more complete build. It's worth 50% of the unit and is due **Friday 3 July, 11:59pm**. Three things get submitted:

1. A **team report** (PDF from the supplied template, around 3000 words)
2. A **single 10-minute team video** (Canvas Studio, ~3:20 each), where each of us demonstrates our own part (faces on camera)
3. A **Declaration of Contribution** listing each member's work, with student IDs and signatures

We create a **new shared GitHub repo** for it (not anyone's A1 repo), and the final report includes that project's GitHub link and public IP.

## What we're graded on (100 pts)

| Area | Pts | What it needs |
|------|-----|---------------|
| Design patterns + OOP | **28** | At least 7 design patterns in the backend code, each justified, plus solid OOP (inheritance, encapsulation, polymorphism, abstraction) |
| README + report + reflection + references | 16 | Complete report, a reflection with real insight, sources in APA |
| API testing (Postman) | 12 | Every endpoint tested incl. errors; export the collection |
| Unit testing (Mocha/Chai) | 12 | Pass/fail terminal screenshots for every CRUD function + a test-case table |
| CI/CD pipeline | 12 | GitHub Actions build/test/deploy on push; live URL; pm2 running |
| SRS documentation | 10 | A formal spec (11 subsections: purpose, problem, scope, users, constraints, functional + non-functional reqs, wireframes, system diagram, safety, risk) |
| Team collaboration (GitHub) | 10 | Branches, PRs, merges, **2+ resolved merge conflicts**, commit graph, meeting log, commits attributable to each of us |

## Where I think the effort goes

- **Design patterns is the whole ball game (28 pts).** The grade literally scales with the pattern count: 7 = HD, 6 = D, 5 = C, 4 = Pass. So whichever project we pick has to have enough feature surface to fit 7 genuine patterns without forcing them.
- **Two criteria are about process, not code.** Collaboration (10) needs real branching, PRs, and at least two genuine merge conflicts resolved, with every commit under the right person's name. The reflection (part of 16) only comes out well if we log our decisions and problems as we go, not at the end.
- **Postman API testing (12) is the main new skill** versus A1. The rest (unit tests, CI/CD, deployment) we've each done once already, so we can reuse a lot.

## Sorted out at the kickoff (Sat 6 Jun)

1. **Base project, decided:** we're building on **VacayPlan** (full CRUD + auth + admin, working GitHub Actions → EC2 deploy, Mocha/Chai suite, demo data seeded). It gives the most feature surface for the 7 design patterns plus a head start on CI/CD and unit testing. The new shared repo is **`IFQ636-assignment-2-vacayplan`** (public, a clean base-import of VacayPlan, not a fork).
2. **Ways of working, agreed:** a **Tuesday email check-in** (at minimum) and a **standing Saturday 3pm AEST call on the WhatsApp group**, with WhatsApp for day-to-day in between. We also keep the **night before the due night (Thu 2 Jul) clear** as a buffer / final-assembly session, and sanity-check availability at the preceding sync so we can pull it earlier if someone has a clash. On git we **do not squash-merge** and keep **one open PR at a time**, so the per-person history and the merge-conflict evidence the collaboration mark looks for stay intact. The repo `CONTRIBUTING.md` has the full workflow.

## Still to settle

- **Roles:** how we split the work so each of us has something clearly our own (the marking wants individual contributions visible), plus collecting Lance's and Joe's student IDs for the Part C declaration.

## Rough sequence

SRS + design → design patterns + OOP → testing (unit + Postman) → CI/CD + deploy → report write-up + video + Declaration → final checks → submit.

## A couple of things that'd help before Saturday

- If you get a chance, drop a link to your **A1 repo and live site** (plus any test logins) in the group, so we can all have a look and turn up with a project in mind.
- A quick skim of this if you have a minute, mostly so we're not starting cold on Saturday. No stress if you don't get to it.

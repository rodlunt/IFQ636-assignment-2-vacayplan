# IFQ636 Assignment 2 - Declaration of Contribution

> Draft of Rodney Lunt's entry for the team's Part C declaration. To be merged with Lance's and Joseph's entries into the single team PDF before submission. Teammate rows and all signatures/dates are placeholders for the team to complete during harmonisation.

This document supports transparency and accountability for Assignment 2. The team submits one PDF that documents each member's contribution to the project.

## Team member details and contributions

| Full name | Student ID | Detailed description of contribution |
|---|---|---|
| Rodney Lunt | n12555941 | See the detailed statement below. |
| Lance Masina | [student ID] | See the detailed statement below. |
| Joseph Milburn | [student ID] | See the detailed statement below. |

### Rodney Lunt - detailed description of contribution

**Design patterns implemented.** Authored three of the team's design patterns: the Singleton (database connection in `config/db.js`), the Chain of Responsibility (the `protect` -> `adminProtect` -> `validate` admin middleware pipeline), and the Decorator (`withOwnership` handler wrapper in `middleware/ownershipDecorator.js`, which removed the trip-ownership check duplicated across eight handlers). Each pattern shipped with its own unit tests and write-up.

**Unit testing.** Set up the backend test coverage tooling (c8) and extended the Mocha/Chai suite to the team's coverage figures (180 tests passing; 99.5% statements, 99.3% branches, 100% functions), including tests for the authentication controller, controller error paths, the weather adapter's defensive branches, and previously untested functions. Also fixed the Mocha runner so it exits cleanly under CI and falls back to a test JWT secret locally.

**Continuous integration.** Added the PR Checks workflow (`.github/workflows/pr-checks.yml`) that gates every pull request on the backend test suite and the frontend build, and later corrected its frontend step to use yarn so it matches the deployment. Captured the CI/CD run evidence (Section 7.3) for the report.

**API testing (Postman).** Built the Authentication and Admin folders of the team's Postman collection, including the negative cases (401/403), and resolved collection issues so the full run passes end to end. Fixed a double-response crash in the `protect` middleware uncovered during this work.

**Report and SRS sections.** Wrote the design-patterns (3.1) and OOP (3.2) sections, the functional/unit-testing (Section 5) and API-testing (Section 6) write-ups, the SRS safety (2.10) and risk-management/STRIDE (2.11) sections, the system and use-case diagrams (2.9) and wireframes (2.8), assembled SRS 2.1-2.7 into the draft, and embedded the Section 4.2 collaboration figures.

**Project coordination.** Created and set up the shared repository, imported the VacayPlan base, and authored the team scaffolding (CONTRIBUTING guide, gitignore, project board and VS Code issue queries, `backend/.env.example` and dev-setup notes, README). Logged meetings and agendas, maintained the planning documents, and is responsible for stitching and uploading the team video. Across the project I contributed more than 90 commits and over 40 merged pull requests, reviewed teammates' pull requests, and resolved several genuine merge conflicts on record.

### Lance Masina - detailed description of contribution

**Design patterns implemented.** Authored three of the team's design patterns: the Factory Method (centralising user-response construction, PR #66), the Facade (a service layer for cascade-delete operations, PR #76), and the State pattern (the trip status lifecycle, FR-10, PR #78). Also restored the admin response `_id` field to match the frontend contract (PR #69).

**SRS requirements.** Wrote the functional and non-functional requirements - SRS sections 2.6 and 2.7 (PRs #65, #75).

**CI/CD and deployment.** Stood up the deployment pipeline and the AWS EC2 instance, set the deploy target (PR #77), and wrote the Section 7 CI/CD report (PR #119).

**API testing.** Captured the trip CRUD and State-pattern Postman figures for Section 6.1 (PR #104).

### Joseph Milburn - detailed description of contribution

**Design patterns implemented.** Authored two of the team's design patterns: the Builder (trip update/query assembler, PRs #64 and #83) and the Adapter (the Open-Meteo weather forecast integration, PR #71).

**SRS and report.** Wrote SRS sections 2.1-2.5 (purpose, problem, scope, user characteristics, constraints, PR #95), the Project overview (PR #84), and the Discussion and conclusion (PR #120).

**API testing.** Built the activities and weather folders of the Postman collection with test scripts and captured the Section 6.1 figures (PR #105).

*Lance and Joseph: confirm the above reflects your work, then add your student ID and signature below. Drafted from your merged pull requests (cited) - adjust as needed.*

## Declaration

We declare that the information provided above accurately reflects the contribution of each team member. Each listed student has made a substantial contribution to the project in accordance with unit requirements.

Each team member also agrees to:

- Communicate regularly and respectfully within the team.
- Complete assigned tasks on time.
- Attend team meetings and participate actively.
- Address any conflicts through discussion and OLA guidance if needed.

## Signatures

| Full name | Signature | Date |
|---|---|---|
| Rodney Lunt | [signature] | [date] |
| [Lance Masina] | [signature] | [date] |
| [Joseph Milburn] | [signature] | [date] |

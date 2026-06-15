# SRS Section 2.6 and 2.7 -- VacayPlan Requirements
**Author:** Lance Masina (LDMasina)
**Branch:** docs/srs-requirements-revision
**Date:** 2026-06-13

---

## 2.6 Functional Requirements

The following functional requirements define the behaviour VacayPlan shall exhibit. Requirements are grouped by functional domain and identified by unique identifiers for traceability. Two user roles govern access: a regular user (traveller) and an administrator.

### 2.6.1 Authentication

| ID | Requirement |
|---|---|
| FR-01 | The system shall allow a user to register an account using a unique email address and password. |
| FR-02 | The system shall authenticate a registered user via email and password and issue a JSON Web Token (JWT) upon successful login. |
| FR-03 | The system shall restrict access to all protected routes to authenticated users only. |
| FR-04 | The system shall allow a user to log out, invalidating their active session token. |

### 2.6.2 Trip Management

| ID | Requirement |
|---|---|
| FR-05 | The system shall allow a regular user to create a trip record with a destination, date range, budget, and status. |
| FR-06 | The system shall allow a regular user to view all trips associated with their account on a dashboard. |
| FR-07 | The system shall allow a regular user to update the details of an existing trip. |
| FR-08 | The system shall allow a regular user to delete a trip record from their account. |
| FR-09 | The system shall assign one of three statuses to each trip: planning, active, or completed. |
| FR-10 | The system shall enforce that a trip status transitions follow the defined lifecycle: planning to active to completed. |
| FR-11 | The system shall remove all activities associated with a trip when that trip is permanently deleted. |

### 2.6.3 Activity Management

| ID | Requirement |
|---|---|
| FR-12 | The system shall allow a regular user to add an activity to an existing trip, specifying a name, date, and description. |
| FR-13 | The system shall restrict activity dates to fall within the parent trip date range. |
| FR-14 | The system shall allow a regular user to view all activities associated with a trip, organised by day. |
| FR-15 | The system shall allow a regular user to update or delete an activity they have created. |

### 2.6.4 Administration

| ID | Requirement |
|---|---|
| FR-16 | The system shall provide an administrator with a user management panel listing all registered accounts. |
| FR-17 | The system shall allow an administrator to deactivate or reactivate a user account. |
| FR-18 | The system shall allow an administrator to permanently delete a user account. |
| FR-19 | The system shall remove all trips and activities associated with a user account when that account is permanently deleted. |
| FR-20 | The system shall allow an administrator to view all trips across all user accounts. |
| FR-21 | The system shall prevent a deactivated user from accessing protected routes until their account is reactivated. |
| FR-22 | The system shall return all API responses in a consistent JSON structure, with a standardised shape for user objects regardless of the operation type. |
| FR-23 | The system shall validate all incoming API requests before they reach business logic handlers. |

---

## 2.7 Non-Functional Requirements

The following non-functional requirements define the quality attributes VacayPlan shall maintain across all operating conditions.

### 2.7.1 Performance

| ID | Requirement |
|---|---|
| NFR-01 | The system shall return API responses for standard CRUD operations within 500 milliseconds under normal load conditions. |
| NFR-02 | The frontend dashboard shall render the full trip list within two seconds of a successful authentication event. |

### 2.7.2 Reliability

| ID | Requirement |
|---|---|
| NFR-03 | The system shall maintain a minimum uptime of 99% during the operational period, supported by PM2 process management on the EC2 deployment. |
| NFR-04 | The CI/CD pipeline shall automatically redeploy the application on every push to the main branch, ensuring the live environment reflects the latest stable build. |

### 2.7.3 Security

| ID | Requirement |
|---|---|
| NFR-05 | The system shall encrypt all user passwords using bcrypt before storage in the database. |
| NFR-06 | The system shall use JWT tokens with a defined expiry period to manage authenticated sessions, rejecting expired or malformed tokens. |
| NFR-07 | The system shall restrict all administrative operations to users with a verified administrator role, enforced at the middleware layer. |
| NFR-08 | The system shall not expose database credentials or JWT secrets in any client-accessible code or version control history. |
| NFR-13 | The system shall initialise a single shared database connection instance at application startup, reusing it across all subsequent operations for the lifetime of the process. |

### 2.7.4 Usability

| ID | Requirement |
|---|---|
| NFR-09 | The system shall provide a responsive user interface accessible on desktop and mobile browsers without requiring a native application installation. |
| NFR-10 | The system shall display meaningful error messages to the user when an operation fails, without exposing internal system details. |

### 2.7.5 Scalability

| ID | Requirement |
|---|---|
| NFR-11 | The system architecture shall support horizontal scaling by maintaining stateless API design, enabling additional backend instances to be added without session conflicts. |
| NFR-12 | The MongoDB Atlas database layer shall support collection growth without requiring schema migration, accommodating an increasing number of users and trips over time. |

### 2.7.6 Availability

| ID | Requirement |
|---|---|
| NFR-14 | Core trip planning features shall remain available when external data services are unavailable. |

---

*Note: Requirements in this document were independently authored by Lance Masina based on analysis of the VacayPlan system (README, live deployment, and codebase). Rod Lunt's A1 SysML requirements diagram was used as a system reference only, not as a source text. All "shall" statements are original work following IEEE Std 830-1998 conventions. Revised 2026-06-13 addressing feedback from Rod Lunt on PR #65.*

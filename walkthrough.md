# Walkthrough - Sprint 4: Testing Suite (Jest, Supertest & Playwright)

This document summarizes the final testing configurations and results for Sprint 4.

## Testing Architecture

We have set up a complete split testing suite:
1. **Backend Integration & Unit Tests**: Verified using **Jest** and **Supertest** to test the API endpoints, controller validations, and database repository logic in isolation.
2. **Frontend UI End-to-End (E2E) Tests**: Verified using **Playwright** to run actual browser automation testing user flows on the admin panel dashboard.

---

## 1. Backend Testing (Jest & Supertest)

### Structure under `src/__tests__`:
- **Repository Unit Tests (`src/__tests__/unit/repositories/user.repository.test.ts`)**: 
  - Mock Mongoose `UserModel` queries to test `UserMongoRepository` functions in isolation.
  - Verified pagination queries, newest-first sorting, and case-insensitive search queries.
- **Controller Unit Tests (`src/__tests__/unit/controllers/admin-user.controller.test.ts`)**: 
  - Mock `AdminUserService` to verify controller statuses, URL parameters parsing, and Zod validator outputs.
- **Integration Tests (`src/__tests__/integration/admin-user.integration.test.ts`)**: 
  - Use `supertest` to trigger route calls.
  - Assert authentication (401 Unauthorized) and authorization (403 Forbidden) middlewares.
  - Test CRUD routes, payload validation failures, and database mock cascades.

### Commands to Run:
Run inside the **backend** directory (`c:\Users\User\Documents\binbuddy backend`):
```bash
npm run test
```

### Backend Results:
All **24 tests** passed successfully:
```bash
PASS  src/__tests__/unit/repositories/user.repository.test.ts
PASS  src/__tests__/unit/controllers/admin-user.controller.test.ts
PASS  src/__tests__/integration/admin-user.integration.test.ts

Test Suites: 3 passed, 3 total
Tests:       24 passed, 24 total
Time:        12.193 s
```

---

## 2. Frontend Testing (Playwright E2E)

### Structure under `tests/`:
- **Browser Spec (`tests/admin-ui.spec.ts`)**: 
  - Automates browser sessions, going to `/login`, logging in as Admin, and verifying dashboard components.
  - Performs E2E admin operations: Create user modal (filling values and submitting), search input (verifying debounced result rows), Edit user modal (updating names and roles), and delete confirmation warning modal (verifying row removal).
  - Verifies Route Security: logs out of Admin, logs in as the newly created standard user account, ensures "Admin Panel" link is hidden, attempts direct URL access to `/admin`, and asserts automatic redirection back to `/dashboard`.

### Commands to Run:
Run inside the **frontend** directory (`c:\Users\User\binbuddy_web`):
```bash
npm run test:e2e
```

### Frontend Results:
The E2E test runs completely and passes in ~23 seconds:
```bash
Running 1 test using 1 worker
[chromium] › tests\admin-ui.spec.ts:9:7 › Admin User Management E2E Tests › Verify complete Admin Panel CRUD operations and Route Protection
Navigating to Login Page...
Entering Admin credentials...
Verifying redirect to Dashboard...
Navigating to Admin Panel...
Creating standard user for testing...
Verifying user was created in table...
Testing search functionality...
Editing the created user...
Verifying updated user name...
Logging out of Admin account...
Logging in as the newly created standard user...
Asserting Admin Panel link is hidden for standard user...
Attempting direct access to /admin...
Direct access blocked and successfully redirected back to Dashboard.
Logging out of standard user...
Re-authenticating as Admin to clean up...
Navigating to Admin Panel for deletion...
Deleting the test user...
Verifying test user was deleted...
All E2E checks passed successfully!

  1 passed (23.5s)
```

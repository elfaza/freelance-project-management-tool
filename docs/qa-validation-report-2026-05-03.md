# QA Validation Report - 2026-05-03

## Scope

Reviewed MVP expectations in `docs/07-mvp-scope-and-backlog.md` and QA gates in `docs/10-qa-test-plan.md`.

## Commands Run

| Command | Result | Notes |
| --- | --- | --- |
| `npm run lint` | Pass | ESLint completed with no reported issues. |
| `npm run typecheck` | Pass | TypeScript completed with no reported issues. |
| `npm run build` | Pass | Passed with local placeholder environment variables. |
| `npx prisma validate` | Pass | Passed with local placeholder `DATABASE_URL`. |
| `npx prisma generate` | Pass | Prisma Client generated successfully. |
| `npx vitest run tests/validation/schemas.test.ts tests/storage/files.test.ts` | Pass | 2 test files, 11 tests passed. |

## Bugs and Gaps

### Resolved: Prisma 7 Client Generation Incompatibility

- Prisma 7 configuration was moved into `prisma.config.ts`.
- Runtime Prisma access now uses the PostgreSQL adapter in `lib/db/prisma.ts`.
- `npx prisma validate`, `npx prisma generate`, and `npm run build` now pass when the documented local environment variables are present.

Remaining impact: DB-backed integration tests still need a running PostgreSQL database and a local `.env`.

### Resolved: Missing Notification Read Endpoint

- Implemented `PATCH /api/v1/notifications/[notificationId]/read`.
- The route checks authentication and notification ownership before marking a notification read.

### Resolved: Missing Activity Log Read Endpoints

- Implemented `GET /api/v1/projects/[projectId]/activity-logs`.
- Implemented `GET /api/v1/tasks/[taskId]/activity-logs`.
- Both routes require project/task membership.

### Remaining Gap: DB-Backed Integration QA

No live PostgreSQL database was available during this pass, so the full manual lifecycle and DB-backed API integration scenarios were not executed.

## Test Files Added

- `tests/validation/schemas.test.ts`
- `tests/storage/files.test.ts`

Coverage added for role/theme/status validation, revision feedback requirements, email normalization, task due-date validation, and upload size/type blocking.

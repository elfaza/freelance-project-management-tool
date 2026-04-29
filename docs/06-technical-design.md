# 06 - Technical Design

## Freelancer Project Management Tool (FPMT)

---

## 1. Overview

This document defines the implementation design for the Freelancer Project Management Tool. It translates the product, business, database, and API documents into a concrete build plan for the MVP.

This document aligns with:

- `01-project-overview.md`
- `02-brd-business-requirements.md`
- `03-prd-product-requirements.md`
- `04-erd-database-design.md`
- `05-api-contract.md`

The system is a web-based modular monolith for freelancer-client project collaboration. It supports projects, tasks, submissions, revisions, review approvals, comments, attachments, notifications, activity logs, and role-based access.

---

## 2. Final Technical Decisions

These decisions remove ambiguity from earlier planning documents.

| Area | Decision |
| --- | --- |
| Application framework | Next.js App Router |
| Language | TypeScript |
| Frontend | React |
| Styling | Tailwind CSS |
| Backend | Next.js Route Handlers |
| Database | PostgreSQL |
| ORM | Prisma |
| Validation | Zod |
| Password hashing | bcrypt |
| Authentication storage | Server-issued session token in httpOnly cookie |
| Frontend server state | React Query |
| Form handling | React Hook Form with Zod validation |
| HTTP client | Axios configured with `withCredentials: true` |
| Theme support | Light, dark, and system theme using Tailwind dark mode |
| MVP file storage | Local storage behind a storage service abstraction |
| Deployment target | Vercel-compatible Next.js deployment with managed PostgreSQL |

JWT may be used as the opaque session token format, but the frontend must never read or store it. The browser only carries the httpOnly cookie.

---

## 3. Architecture

The system uses a modular monolith architecture.

```txt
Browser
  -> Next.js UI routes
  -> Next.js API route handlers
  -> Feature service layer
  -> Repository layer
  -> Prisma
  -> PostgreSQL
```

### Layer Responsibilities

| Layer | Responsibility |
| --- | --- |
| UI layer | Pages, components, forms, dashboard views |
| API layer | HTTP request parsing, auth guard, validation, response formatting |
| Service layer | Business rules, workflow transitions, authorization decisions |
| Repository layer | Database reads and writes through Prisma |
| Storage layer | File validation and storage operations |
| Shared layer | Types, constants, response helpers, errors, utilities |

Business rules must live in service modules, not inside UI components or route handlers.

---

## 4. Module Boundaries

The MVP should be organized by feature/domain.

```txt
src/
  app/
    api/v1/
    login/
    register/
    dashboard/
    projects/
    tasks/
    notifications/
  features/
    auth/
    users/
    preferences/
    projects/
    invitations/
    tasks/
    submissions/
    reviews/
    comments/
    attachments/
    notifications/
    activity-logs/
  components/
    ui/
    layout/
  lib/
    auth/
    db/
    http/
    storage/
    theme/
    validation/
  constants/
  types/
```

Each feature module should keep related services, repositories, validators, types, and feature components together.

Recommended feature structure:

```txt
features/tasks/
  components/
  task.constants.ts
  task.repository.ts
  task.service.ts
  task.types.ts
  task.validation.ts
```

---

## 5. API Alignment

All API routes use the base URL:

```txt
/api/v1
```

All API responses follow the standard response shape from `05-api-contract.md`.

Success:

```json
{
  "success": true,
  "message": "Success message",
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "message": "Error message",
  "error": {
    "code": "ERROR_CODE",
    "details": {}
  }
}
```

Route handlers should stay thin:

1. Read authenticated user from cookie.
2. Validate request body, params, and query.
3. Call the relevant service.
4. Return standard response.

---

## 6. Authentication Design

Authentication uses httpOnly cookie-based sessions.

### Login Flow

```txt
User submits email/password
  -> POST /api/v1/auth/login
  -> Validate credentials
  -> Create signed session token
  -> Set httpOnly cookie
  -> Return user summary
```

Cookie requirements:

```txt
HttpOnly: true
Secure: true in production
SameSite: Strict
Path: /
```

The frontend must not store auth tokens in localStorage, sessionStorage, React state, or JavaScript-readable cookies.

### Current User

`GET /api/v1/auth/me` is the canonical endpoint for the authenticated session user.

`GET /api/v1/users/me` may return an expanded user profile if needed, but it should not duplicate session validation behavior.

---

## 7. Authorization Design

Authorization must always be enforced on the backend.

System roles:

```txt
freelancer
client
```

Project access requires membership:

```txt
project_members.user_id = current_user.id
AND project_members.project_id = requested_project.id
```

### Permission Matrix

| Action | Freelancer | Client |
| --- | --- | --- |
| Create project | Yes | No |
| Edit own project | Yes | No |
| Generate invitation link | Yes | No |
| View project | Yes, if member | Yes, if member |
| Create feature task | Yes | No |
| Create change request task | No | Yes |
| Update task status | Yes | No |
| Delete task | Yes | No |
| Submit work | Yes | No |
| Review submission | No | Yes |
| Comment on task | Yes | Yes |
| Upload attachment | Yes | Yes |
| View notification | Own only | Own only |

When creating tasks, clients do not submit `type`. The backend derives task type from the authenticated user's project role.

---

## 8. Data Model Alignment

Implementation must follow the ERD tables:

```txt
users
projects
project_members
project_invitations
tasks
submissions
reviews
comments
task_attachments
submission_attachments
notifications
activity_logs
```

Required constraints:

- `users.email` unique
- `users.theme` must be one of `light`, `dark`, or `system`
- `project_members(project_id, user_id)` unique
- `project_invitations.token` unique
- one active invitation per project
- `submissions(task_id, version)` unique
- `reviews.submission_id` unique

Recommended indexes:

- `projects.created_by`
- `project_members.project_id`
- `project_members.user_id`
- `tasks.project_id`
- `tasks.status`
- `submissions.task_id`
- `comments.task_id`
- `notifications.user_id`
- `notifications.is_read`
- `activity_logs.project_id`
- `activity_logs.task_id`

---

## 9. Core Business Flows

### Project Creation

```txt
POST /api/v1/projects
  -> Require freelancer role
  -> Validate project data
  -> Create project
  -> Insert creator into project_members as freelancer
  -> Create PROJECT_CREATED activity log
  -> Return project
```

### Invitation Generation

```txt
POST /api/v1/projects/:id/invite
  -> Require freelancer project member
  -> Deactivate previous active project invitation
  -> Generate unique token
  -> Store project invitation
  -> Create CLIENT_INVITED activity log
  -> Return invite_link
```

The request body is not required. The invite link is generated by the server.

### Invitation Acceptance

```txt
POST /api/v1/invitations/accept
  -> Require authenticated user
  -> Validate token
  -> Check token is active and not expired
  -> Add user to project_members as client
  -> Create CLIENT_JOINED activity log
  -> Notify freelancer
  -> Return project
```

If the user is already a member, the endpoint should return a conflict or the existing membership consistently.

### Task Creation

```txt
POST /api/v1/tasks
  -> Require project membership
  -> Derive task type from role
  -> freelancer => feature
  -> client => change_request
  -> Create task with status todo
  -> Create TASK_CREATED activity log
  -> Notify other project members
```

### Submission

```txt
POST /api/v1/tasks/:id/submissions
  -> Require freelancer project member
  -> Validate task access
  -> Get latest version for task
  -> Create submission with version + 1
  -> Move task status to review
  -> Create SUBMISSION_CREATED activity log
  -> Notify client members
```

### Review

```txt
POST /api/v1/submissions/:id/review
  -> Require client project member
  -> Validate decision
  -> If revision_requested, require feedback
  -> Create review
  -> approved => task.status = done
  -> revision_requested => task.status = in_progress
  -> Create review activity log
  -> Notify freelancer members
```

### Comment

```txt
POST /api/v1/tasks/:id/comments
  -> Require task project membership
  -> Create comment
  -> Create COMMENT_CREATED activity log
  -> Notify other project members
```

---

## 10. Task Workflow

Task statuses:

```txt
todo -> in_progress -> review -> done
```

Rules:

- New tasks start as `todo`.
- Freelancer controls direct status changes.
- Submitting work moves the task to `review`.
- Client approval moves the task to `done`.
- Client revision request moves the task to `in_progress`.
- Client cannot directly update task status.

---

## 11. File Upload Design

Files can be attached to tasks and submissions.

MVP storage uses local storage through an abstraction:

```txt
uploadFile()
deleteFile()
getFileUrl()
```

Validation rules:

- Maximum size: 10 MB per file
- Allowed image formats: JPG, JPEG, PNG, WebP
- Allowed document formats: PDF, DOC, DOCX, XLS, XLSX, TXT, CSV
- Allowed archive format: ZIP
- Executable files are blocked
- Stored filenames must be generated, not user-controlled
- Uploads require authenticated project access

Database records store:

```txt
file_name
file_url
file_size
file_type
uploaded_by
created_at
```

---

## 12. Notification Design

Notifications are in-app only for MVP.

Trigger events:

- Project invitation generated
- Client joins project
- Task created
- Task status changed
- Submission created
- Review approved
- Revision requested
- Comment added
- File uploaded

Notification fields:

```txt
user_id
type
title
message
reference_type
reference_id
is_read
created_at
```

Notifications must only be readable by their recipient.

---

## 13. Activity Log Design

Activity logs are append-only audit records for project and task history.

Actions:

```txt
PROJECT_CREATED
CLIENT_INVITED
CLIENT_JOINED
TASK_CREATED
TASK_STATUS_CHANGED
SUBMISSION_CREATED
REVIEW_APPROVED
REVISION_REQUESTED
COMMENT_CREATED
FILE_UPLOADED
```

Rules:

- Normal users cannot edit activity logs.
- Project-level actions may have `task_id = null`.
- Task-level actions should include both `project_id` and `task_id`.
- Metadata should store related IDs and small contextual values only.

---

## 14. Security Design

Security requirements:

- Hash passwords with bcrypt.
- Use httpOnly auth cookies.
- Use Secure cookies in production.
- Use SameSite=Strict.
- Validate request input with Zod at API boundaries.
- Validate role and project membership in services.
- Validate Origin / Referer headers for mutation requests.
- Use CSRF token protection for cookie-authenticated mutation requests.
- Never trust frontend role checks.
- Sanitize user content before rendering as HTML.
- Limit request payload size.
- Block executable uploads.

---

## 15. Frontend Design

Main pages:

```txt
/login
/register
/dashboard
/projects
/projects/:projectId
/tasks/:taskId
/notifications
```

Core components:

```txt
ProjectCard
ProjectForm
TaskBoard
TaskCard
TaskStatusBadge
SubmissionHistory
ReviewPanel
CommentThread
AttachmentList
NotificationDropdown
ActivityTimeline
```

State handling:

| State | Tool |
| --- | --- |
| Server state | React Query |
| Form state | React Hook Form |
| Auth user display state | React Context |
| Theme preference | React Context with persisted user preference |
| Local UI state | React component state |

Axios configuration:

```ts
const api = axios.create({
  baseURL: "/api/v1",
  withCredentials: true,
});
```

### Theme Preference

The UI supports three theme modes:

```txt
light
dark
system
```

Rules:

- Light theme is the default for new users.
- Dark theme must be fully supported across pages and components.
- System mode follows `prefers-color-scheme`.
- Theme selection should be available from the app shell user menu or settings area.
- Theme must apply before the page visibly renders to avoid theme flash where practical.
- If a user is authenticated, the preference should be persisted to the user profile.
- If a user is not authenticated, the preference may be stored locally in the browser.
- Authenticated preference updates use `PATCH /api/v1/users/me/preferences`.

Implementation notes:

- Use Tailwind dark mode with a root `dark` class.
- Use design tokens or CSS variables for theme-aware colors.
- Do not hardcode light-only colors in feature components.
- Status colors must remain readable in both themes.

---

## 16. Error Handling

Standard error codes:

```txt
VALIDATION_ERROR
UNAUTHORIZED
FORBIDDEN
NOT_FOUND
CONFLICT
INTERNAL_SERVER_ERROR
```

Use HTTP status codes consistently:

| Status | Usage |
| --- | --- |
| 200 | Successful read or update |
| 201 | Created resource |
| 400 | Invalid request shape |
| 401 | Missing or invalid authentication |
| 403 | Authenticated but not allowed |
| 404 | Resource not found |
| 409 | Duplicate or invalid state conflict |
| 422 | Validation failed |
| 500 | Unexpected server error |

---

## 17. Testing Strategy

### Unit Tests

Focus on service-layer business rules:

- Auth registration and login behavior
- Project creation membership insertion
- Invitation regeneration
- Task type derivation by role
- Submission version increment
- Review decision status changes
- Notification creation

### Integration Tests

Cover API flows:

- Register, login, logout, current user
- Create project
- Generate and accept invitation
- Create freelancer task
- Create client change request task
- Submit work
- Approve submission
- Request revision
- Add comment
- Mark notification as read

### Manual MVP Scenarios

Full lifecycle:

```txt
Freelancer registers
Freelancer creates project
Freelancer creates task
Freelancer invites client
Client joins project
Freelancer submits work
Client approves work
Task becomes done
```

Revision lifecycle:

```txt
Freelancer submits work
Client requests revision with feedback
Task returns to in_progress
Freelancer submits revision 2
Client approves
Task becomes done
```

Change request lifecycle:

```txt
Client creates change request task
Freelancer sees task
Freelancer works on task
Freelancer submits work
Client reviews
```

---

## 18. Deployment Design

Required environment variables:

```txt
DATABASE_URL=
AUTH_SECRET=
APP_URL=
NODE_ENV=
UPLOAD_STORAGE=
CSRF_SECRET=
```

Deployment flow:

```txt
Run lint
Run tests
Build app
Run database migration
Deploy app
```

---

## 19. MVP Scope

Included:

- Authentication
- Role-based authorization
- Project management
- Project invitations
- Task management
- Submission and revision history
- Review and approval flow
- Comments
- Attachments
- Notifications
- Activity logs
- Light/dark/system theme preference

Not included:

- Payments
- Invoices
- Real-time chat
- Advanced analytics
- Third-party integrations
- Multi-workspace organization
- Time tracking

---

## 20. Future Improvements

Possible post-MVP improvements:

- Email notifications
- Real-time notifications
- Cloud object storage
- Advanced reporting
- Workspace and team support
- Payment and invoice module
- Time tracking
- Multi-freelancer collaboration

---

## 21. Implementation Notes

Build the MVP incrementally in this order:

1. Project setup, Prisma, database connection, shared response helpers.
2. Auth and current-user session flow.
3. Project creation and project membership.
4. Invitation generation and acceptance.
5. Task creation and task board.
6. Submission and review flow.
7. Comments, attachments, notifications, and activity logs.
8. Tests for core service and API flows.

This order keeps the dependency chain clear and allows the main project lifecycle to work before secondary features are expanded.

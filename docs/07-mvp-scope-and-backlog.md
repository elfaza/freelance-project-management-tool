# 07 - MVP Scope and Backlog

## Freelancer Project Management Tool (FPMT)

---

## 1. Purpose

This document defines the exact MVP scope and converts the requirements into a development-ready backlog.

The goal is to make implementation clear, measurable, and easy to review.

---

## 2. MVP Goal

The MVP must allow a freelancer and a client to complete a full project collaboration lifecycle:

```txt
Freelancer creates project
-> Freelancer invites client
-> Client joins project
-> Tasks are created
-> Freelancer submits work
-> Client approves or requests revision
-> Comments, attachments, notifications, and activity logs support the workflow
```

---

## 3. Included in MVP

### Authentication

- User registration
- User login
- User logout
- Current authenticated user
- Role support:
  - freelancer
  - client

### Projects

- Freelancer can create projects.
- Freelancer can edit project details.
- Users can view projects they belong to.
- Project creator is automatically added as freelancer member.

### Invitations

- Freelancer can generate a project invitation link.
- Regenerating an invitation invalidates the previous active invitation.
- Client can accept an invitation after login/register.
- Client is added as project member after accepting invitation.

### Tasks

- Freelancer can create feature tasks.
- Client can create change request tasks.
- Freelancer can update task status.
- Freelancer can delete tasks.
- Users can view tasks inside accessible projects.

### Submissions and Revisions

- Freelancer can submit work for a task.
- Each submission creates a new revision version.
- Submission moves task status to `review`.
- Submission history is preserved.

### Reviews

- Client can approve submitted work.
- Client can request revision with feedback.
- Approval moves task status to `done`.
- Revision request moves task status to `in_progress`.

### Comments

- Project members can comment on tasks.
- Comment history is visible on task detail.

### Attachments

- Project members can upload task attachments.
- Freelancer can upload submission attachments.
- Files are validated by size and type.

### Notifications

- Users receive in-app notifications for important events.
- Users can view notifications.
- Users can mark notifications as read.

### Theme Preference

- Users can choose light theme.
- Users can choose dark theme.
- Users can choose system default theme.
- Selected theme persists after refresh and future login.

### Activity Logs

- Important project and task actions are recorded.
- Activity logs are visible on project/task pages.

---

## 4. Out of Scope for MVP

- Payment system
- Invoice management
- Time tracking
- Real-time chat
- Email notifications
- Advanced analytics
- Third-party integrations
- Multi-workspace organization
- Multi-freelancer collaboration
- Role customization

---

## 5. Backlog

### Epic 1: Project Setup

#### Story 1.1: Initialize Application

As a developer, I can run the application locally with the selected stack.

Acceptance criteria:

- Next.js app is configured with TypeScript.
- Tailwind CSS is configured.
- Prisma is configured.
- PostgreSQL connection works.
- Basic project structure follows `06-technical-design.md`.

#### Story 1.2: Add Shared Foundations

As a developer, I have shared helpers for common backend behavior.

Acceptance criteria:

- Standard success response helper exists.
- Standard error response helper exists.
- Shared error codes exist.
- Environment validation exists.
- Prisma client helper exists.

---

### Epic 2: Authentication

#### Story 2.1: Register User

As a new user, I can register as a freelancer or client.

Acceptance criteria:

- User can submit name, email, password, and role.
- Email must be unique.
- Password is hashed before storage.
- Invalid input returns validation errors.
- Response does not include password hash.

#### Story 2.2: Login User

As a registered user, I can login with email and password.

Acceptance criteria:

- Valid credentials create an httpOnly session cookie.
- Invalid credentials return an authentication error.
- Login response includes safe user data.

#### Story 2.3: Logout User

As an authenticated user, I can logout.

Acceptance criteria:

- Logout clears the session cookie.
- User cannot access protected routes after logout.

#### Story 2.4: Get Current User

As an authenticated user, I can retrieve my current session user.

Acceptance criteria:

- `GET /api/v1/auth/me` returns current user.
- Unauthenticated requests return `401`.

---

### Epic 3: Projects and Invitations

#### Story 3.1: Create Project

As a freelancer, I can create a project.

Acceptance criteria:

- Only freelancers can create projects.
- Project requires name and start date.
- Project creator is inserted into `project_members`.
- Activity log is created.

#### Story 3.2: List Projects

As a user, I can view projects I belong to.

Acceptance criteria:

- Freelancer sees projects they created or joined.
- Client sees invited projects only.
- User cannot see projects without membership.

#### Story 3.3: Generate Invitation Link

As a freelancer, I can generate a client invitation link.

Acceptance criteria:

- Only freelancer project members can generate links.
- Previous active invitation is deactivated.
- New token is unique.
- Response returns generated invite link.
- Activity log is created.

#### Story 3.4: Accept Invitation

As a client, I can accept an invitation and join a project.

Acceptance criteria:

- Token must be valid and active.
- Client is added to project members.
- Duplicate membership is prevented.
- Freelancer receives notification.
- Activity log is created.

---

### Epic 4: Tasks

#### Story 4.1: Create Task

As a project member, I can create a task based on my role.

Acceptance criteria:

- Freelancer-created tasks are `feature` tasks.
- Client-created tasks are `change_request` tasks.
- New tasks start as `todo`.
- Task type is derived by backend, not trusted from client input.
- Notification and activity log are created.

#### Story 4.2: View Project Tasks

As a project member, I can view all tasks in a project.

Acceptance criteria:

- Only project members can view tasks.
- Tasks include status, type, due date, and creator.
- Tasks can be filtered by status.

#### Story 4.3: Update Task Status

As a freelancer, I can update task status.

Acceptance criteria:

- Only freelancer project members can update status directly.
- Status must be one of `todo`, `in_progress`, `review`, `done`.
- Status change creates notification and activity log.

#### Story 4.4: Delete Task

As a freelancer, I can delete a task.

Acceptance criteria:

- Only freelancer project members can delete tasks.
- Deleted task is no longer listed.
- Deletion behavior must not break existing data integrity.

---

### Epic 5: Submissions and Reviews

#### Story 5.1: Submit Work

As a freelancer, I can submit work for a task.

Acceptance criteria:

- Only freelancer project members can submit work.
- Submission version increments per task.
- Task status becomes `review`.
- Client receives notification.
- Activity log is created.

#### Story 5.2: View Submission History

As a project member, I can view task submission history.

Acceptance criteria:

- Submissions are ordered by version.
- Submission notes, attachments, author, and timestamp are visible.

#### Story 5.3: Approve Submission

As a client, I can approve submitted work.

Acceptance criteria:

- Only client project members can approve.
- Review record is created.
- Task status becomes `done`.
- Freelancer receives notification.
- Activity log is created.

#### Story 5.4: Request Revision

As a client, I can request a revision with feedback.

Acceptance criteria:

- Feedback is required.
- Review record is created.
- Task status becomes `in_progress`.
- Freelancer receives notification.
- Activity log is created.

---

### Epic 6: Collaboration Support

#### Story 6.1: Add Task Comment

As a project member, I can comment on a task.

Acceptance criteria:

- Comment content is required.
- Only task project members can comment.
- Other project members receive notification.
- Activity log is created.

#### Story 6.2: Upload Attachment

As a project member, I can upload allowed files.

Acceptance criteria:

- Maximum file size is 10 MB.
- Only allowed file types are accepted.
- Executable files are blocked.
- File metadata is stored.
- Activity log is created.

#### Story 6.3: View Notifications

As a user, I can view my notifications.

Acceptance criteria:

- User only sees own notifications.
- Read and unread states are visible.
- Notification links point to related resources.

#### Story 6.4: Mark Notification as Read

As a user, I can mark a notification as read.

Acceptance criteria:

- User can only update own notifications.
- Read state persists.

#### Story 6.5: View Activity Logs

As a project member, I can view project and task activity logs.

Acceptance criteria:

- Project page shows project-level activity.
- Task page shows task-level activity.
- Logs are ordered newest first.

---

### Epic 7: User Preferences

#### Story 7.1: Select Theme

As a user, I can choose light, dark, or system theme.

Acceptance criteria:

- User can select `light`, `dark`, or `system`.
- Selected theme applies immediately.
- Selected theme persists after page refresh.
- Authenticated user's preference persists for future login.
- All core pages remain readable in light and dark themes.

---

## 6. MVP Completion Criteria

The MVP is complete when:

- All included MVP features are implemented.
- Full project lifecycle can be completed manually.
- Core API flows have integration tests.
- Critical business logic has unit tests.
- Authorization is enforced on the backend.
- File upload validation is enforced.
- Light and dark themes are readable across core screens.
- No known blocking bugs remain.

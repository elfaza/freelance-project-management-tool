# 10 - QA Test Plan

## Freelancer Project Management Tool (FPMT)

---

## 1. Purpose

This document defines the testing and QA plan for the MVP.

The goal is to verify that the main project lifecycle works, business rules are enforced, and critical security boundaries are protected.

---

## 2. Test Levels

### Unit Tests

Focus:

- Service-layer business rules
- Validation helpers
- Authorization helpers
- Workflow transitions

### Integration Tests

Focus:

- API endpoints
- Database persistence
- Authenticated flows
- Cross-module workflows

### Manual QA

Focus:

- End-to-end user behavior
- Role-specific UI
- Browser usability
- Empty/loading/error states

---

## 3. Critical Business Rules to Test

Authentication:

- Passwords are hashed.
- Duplicate emails are rejected.
- Invalid login credentials are rejected.
- Protected routes require authentication.

Authorization:

- Client cannot create projects.
- Client cannot directly update task status.
- Client cannot submit work.
- Freelancer cannot review submissions as a client.
- Users cannot access projects they are not members of.
- Users cannot read or update other users' notifications.

Projects:

- Project creator is added as freelancer member.
- Only project members can view project details.

Invitations:

- Invitation token is unique.
- Regenerating invitation invalidates previous active token.
- Invalid invitation token is rejected.
- Duplicate project membership is prevented.

Tasks:

- Freelancer-created task becomes `feature`.
- Client-created task becomes `change_request`.
- New task starts as `todo`.
- Task status accepts only valid enum values.

Submissions:

- Only freelancer can submit work.
- Submission version increments per task.
- Submit work changes task status to `review`.

Reviews:

- Only client can review submissions.
- Approving changes task status to `done`.
- Requesting revision requires feedback.
- Requesting revision changes task status to `in_progress`.
- One submission can only have one review.

Attachments:

- Files larger than 10 MB are rejected.
- Unsupported file types are rejected.
- Executable files are rejected.
- Upload requires project access.

Notifications and activity logs:

- Important events create notifications.
- Important events create activity logs.
- Activity logs are read-only for normal users.

Theme preference:

- User can select light theme.
- User can select dark theme.
- User can select system theme.
- Theme preference persists after refresh.
- Authenticated theme preference persists after logout and future login.
- Core pages remain readable in light and dark themes.

---

## 4. Unit Test Checklist

Auth service:

- Register valid user.
- Reject duplicate email.
- Hash password.
- Login valid user.
- Reject invalid password.

Project service:

- Create project as freelancer.
- Reject project creation as client.
- Insert creator into `project_members`.
- Validate project access for members.
- Reject project access for non-members.

Invitation service:

- Generate invitation.
- Deactivate previous active invitation.
- Accept valid invitation.
- Reject invalid invitation.
- Reject duplicate membership.

Task service:

- Create feature task as freelancer.
- Create change request task as client.
- Derive task type from role.
- Reject client status update.
- Allow freelancer status update.

Submission service:

- Create first submission with version `1`.
- Create next submission with incremented version.
- Move task to `review`.
- Reject submission by client.

Review service:

- Approve submission.
- Request revision with feedback.
- Reject revision request without feedback.
- Reject duplicate review for same submission.

Notification service:

- Create notification.
- List only current user's notifications.
- Mark current user's notification as read.
- Reject updating another user's notification.

Preference service:

- Save valid theme preference.
- Reject invalid theme preference.
- Return persisted theme preference for current user.

---

## 5. Integration Test Checklist

Authentication:

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`

Projects:

- `POST /api/v1/projects`
- `GET /api/v1/projects`
- `GET /api/v1/projects/:id`

Invitations:

- `POST /api/v1/projects/:id/invite`
- `POST /api/v1/invitations/accept`

Tasks:

- `POST /api/v1/tasks`
- `GET /api/v1/projects/:id/tasks`
- `PATCH /api/v1/tasks/:id`
- `DELETE /api/v1/tasks/:id`

Submissions:

- `POST /api/v1/tasks/:id/submissions`
- `GET /api/v1/tasks/:id/submissions`

Reviews:

- `POST /api/v1/submissions/:id/review`

Comments:

- `POST /api/v1/tasks/:id/comments`
- `GET /api/v1/tasks/:id/comments`

Notifications:

- `GET /api/v1/notifications`
- `PATCH /api/v1/notifications/:id/read`

Activity logs:

- `GET /api/v1/projects/:id/activity-logs`
- `GET /api/v1/tasks/:id/activity-logs`

---

## 6. Manual QA Scenarios

### Scenario 1: Full Approval Flow

Steps:

1. Register freelancer.
2. Register client.
3. Freelancer creates project.
4. Freelancer generates invitation link.
5. Client accepts invitation.
6. Freelancer creates feature task.
7. Freelancer moves task to `in_progress`.
8. Freelancer submits work.
9. Client approves submission.

Expected result:

- Task status becomes `done`.
- Submission history shows version `1`.
- Notifications are created.
- Activity logs are created.

### Scenario 2: Revision Flow

Steps:

1. Freelancer submits work for a task.
2. Client requests revision with feedback.
3. Freelancer submits revision again.
4. Client approves second submission.

Expected result:

- First review records `revision_requested`.
- Task returns to `in_progress`.
- Second submission has version `2`.
- Final task status is `done`.

### Scenario 3: Change Request Flow

Steps:

1. Client opens project.
2. Client creates task.
3. Freelancer opens task.
4. Freelancer submits work.
5. Client reviews submission.

Expected result:

- Task type is `change_request`.
- Client cannot directly update status.
- Freelancer can process and submit work.

### Scenario 4: Unauthorized Access

Steps:

1. Create user who is not a project member.
2. Attempt to open project detail.
3. Attempt to list project tasks.
4. Attempt to open task detail.

Expected result:

- Access is denied.
- No project data is leaked.

### Scenario 5: File Upload Validation

Steps:

1. Upload allowed file under 10 MB.
2. Upload allowed file over 10 MB.
3. Upload unsupported file type.
4. Upload executable file.

Expected result:

- Valid file succeeds.
- Invalid files are rejected with clear errors.

---

## 7. UI QA Checklist

Global:

- Navigation works after login.
- Logout works.
- User role is reflected in available actions.
- Loading states are visible.
- Error states are understandable.
- Empty states explain next step.

Responsive:

- Login/register work on mobile.
- Project list works on mobile.
- Task board stacks cleanly on mobile.
- Task detail does not overflow.
- Buttons and labels do not overlap.

Role-based UI:

- Freelancer sees create project action.
- Client does not see create project action.
- Freelancer sees submit work action.
- Client sees review actions only when task is in review.

---

## 8. Release QA Gate

Before MVP is accepted:

- All critical unit tests pass.
- All integration tests for core flows pass.
- Full approval flow passes manually.
- Revision flow passes manually.
- Change request flow passes manually.
- Unauthorized access checks pass.
- File validation checks pass.
- No critical or high severity bugs remain open.

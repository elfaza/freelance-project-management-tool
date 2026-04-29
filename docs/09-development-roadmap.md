# 09 - Development Roadmap

## Freelancer Project Management Tool (FPMT)

---

## 1. Purpose

This document defines the recommended development phases, milestones, and delivery order for the MVP.

The roadmap is organized to build the core workflow first, then add collaboration support and quality gates.

---

## 2. Delivery Strategy

Build vertically through the product lifecycle:

1. Establish project foundations.
2. Build authentication.
3. Build projects and invitations.
4. Build tasks.
5. Build submission and review flow.
6. Add comments, attachments, notifications, and activity logs.
7. Harden with tests and polish.

Each phase should leave the app in a runnable state.

---

## 3. Phase 0: Project Setup

Goal:

- Prepare the technical foundation for development.

Scope:

- Initialize Next.js with TypeScript.
- Configure Tailwind CSS.
- Configure Prisma.
- Connect PostgreSQL.
- Add environment validation.
- Add shared API response helpers.
- Add base layout.

Exit criteria:

- App runs locally.
- Database connection works.
- Initial migration can run.
- Basic page renders.

---

## 4. Phase 1: Authentication

Goal:

- Allow users to register, login, logout, and retrieve current session user.

Scope:

- User model and role enum.
- Registration endpoint and form.
- Login endpoint and form.
- Logout endpoint.
- Current user endpoint.
- httpOnly cookie session.
- Auth guard helper.

Exit criteria:

- Freelancer and client accounts can be created.
- User can login/logout.
- Protected endpoints reject unauthenticated requests.
- Passwords are hashed.

---

## 5. Phase 2: Projects and Membership

Goal:

- Allow freelancers to create projects and users to access only their projects.

Scope:

- Project model.
- Project member model.
- Create project endpoint and UI.
- Project list endpoint and UI.
- Project detail endpoint and UI shell.
- Project access validation.

Exit criteria:

- Freelancer can create a project.
- Creator is automatically added as project member.
- Users only see projects they belong to.
- Project detail page loads for members only.

---

## 6. Phase 3: Invitations

Goal:

- Allow freelancers to invite clients to projects.

Scope:

- Project invitation model.
- Generate invitation endpoint.
- Accept invitation endpoint.
- Invitation accept UI.
- Regenerate invitation behavior.
- Duplicate membership prevention.

Exit criteria:

- Freelancer can generate invitation link.
- Old active invitation is invalidated after regeneration.
- Client can accept invitation.
- Client appears as project member.

---

## 7. Phase 4: Tasks

Goal:

- Allow project work to be organized into role-based tasks.

Scope:

- Task model.
- Create task endpoint and UI.
- Project task list endpoint.
- Task board UI.
- Task detail page.
- Task status update endpoint.
- Task delete endpoint.

Exit criteria:

- Freelancer can create feature tasks.
- Client can create change request tasks.
- Backend derives task type from role.
- Freelancer can move tasks across statuses.
- Client cannot directly update status.

---

## 8. Phase 5: Submissions and Reviews

Goal:

- Complete the core freelancer-client review workflow.

Scope:

- Submission model.
- Review model.
- Submit work endpoint and UI.
- Submission history UI.
- Review endpoint and UI.
- Approval flow.
- Revision request flow.

Exit criteria:

- Freelancer can submit task work.
- Submission version increments per task.
- Task moves to `review`.
- Client can approve submission.
- Client can request revision with feedback.
- Task status updates correctly after review.

---

## 9. Phase 6: Collaboration Support

Goal:

- Add supporting collaboration features around the main workflow.

Scope:

- Comments.
- Task attachments.
- Submission attachments.
- Notifications.
- Activity logs.

Exit criteria:

- Project members can comment on tasks.
- Allowed files can be uploaded.
- Important events create notifications.
- Notifications can be marked read.
- Important events create activity logs.
- Project/task history is visible.

---

## 10. Phase 7: Quality and Polish

Goal:

- Make the MVP stable enough for review and demo.

Scope:

- Unit tests for service logic.
- Integration tests for core API flows.
- Manual QA pass.
- UI empty/loading/error states.
- Responsive layout pass.
- Security review for auth, authorization, file upload, and CSRF.

Exit criteria:

- Full manual lifecycle passes.
- Critical tests pass.
- No known blocking bugs.
- App can be run from documented setup steps.

---

## 11. Suggested Milestones

### Milestone 1: App Foundation

Includes:

- Phase 0
- Phase 1

Outcome:

- Users can register and login.

### Milestone 2: Project Access

Includes:

- Phase 2
- Phase 3

Outcome:

- Freelancer can create a project and invite a client.

### Milestone 3: Task Workflow

Includes:

- Phase 4

Outcome:

- Project members can create and track tasks.

### Milestone 4: Review Workflow

Includes:

- Phase 5

Outcome:

- Freelancer and client can complete submission, approval, and revision flows.

### Milestone 5: Collaboration MVP

Includes:

- Phase 6
- Phase 7

Outcome:

- MVP is ready for review/demo.

---

## 12. Development Rules

- Do not start a phase until the previous phase is runnable.
- Do not implement out-of-scope features during MVP.
- Do not rely on frontend-only authorization.
- Add tests for risky business rules as they are implemented.
- Keep changes aligned with `06-technical-design.md`.

---

## 13. MVP Release Gate

The MVP can be considered releasable when:

- All MVP stories in `07-mvp-scope-and-backlog.md` are complete.
- UI behavior matches `08-ui-ux-specification.md`.
- Setup works using `11-environment-setup.md`.
- QA checklist in `10-qa-test-plan.md` passes.
- No critical security or data integrity issue is open.

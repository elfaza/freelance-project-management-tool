# 08 - UI/UX Specification

## Freelancer Project Management Tool (FPMT)

---

## 1. Purpose

This document defines the expected MVP screens, user interactions, visual direction, and responsive behavior.

The goal is to make the application behavior clear before UI development starts and to ensure the product feels like a modern, responsive project management web application.

---

## 2. Design Principles

- Use a modern SaaS dashboard style that feels clean, professional, and efficient.
- Keep the interface work-focused, organized, and easy to scan.
- Prioritize task progress, project status, and review actions.
- Show different actions based on user role.
- Avoid hiding important workflow states.
- Every empty, loading, and error state should provide a clear next step.
- Use consistent spacing, typography, and visual hierarchy across all pages.
- Prefer clear data presentation over decorative sections.
- Design mobile and desktop experiences intentionally, not as an afterthought.

---

## 3. Visual Design Direction

The product should look like a modern project management dashboard.

### Style

- Clean SaaS interface
- Light and dark theme support
- Subtle borders and shadows
- Soft neutral background
- High contrast text
- Clear status colors
- Compact but comfortable spacing

### Recommended Visual Language

- Light background: light neutral gray
- Light main content surfaces: white
- Light borders: subtle gray
- Dark background: near-black or dark neutral
- Dark main content surfaces: elevated dark neutral
- Dark borders: subtle neutral contrast
- Primary action color: blue or indigo
- Success state: green
- Warning/revision state: amber
- Error/destructive state: red
- Review/pending state: purple or blue

Avoid:

- Overly decorative landing-page style
- Heavy gradients as primary backgrounds
- Large marketing hero sections inside the app
- Low-contrast gray text
- Excessive card nesting
- UI elements that shift size when data changes

### Typography

- Use a modern sans-serif font.
- Page titles should be clear but not oversized.
- Dashboard and tool headings should be compact.
- Body text should be readable on mobile and desktop.
- Avoid text overflow in cards, buttons, badges, and navigation.

### Components

Core UI components should include:

- Buttons with clear primary, secondary, ghost, and destructive variants
- Inputs, textareas, date inputs, and file inputs
- Selects or segmented controls for status filters
- Badges for task status and task type
- Cards for project and task summaries
- Tables or lists for dense historical data
- Modals or drawers for create/edit forms
- Toasts or inline alerts for success/error feedback
- Skeleton loaders for important loading states
- Empty states with a concise action

Cards should use restrained styling and should not be nested inside other cards unless there is a strong structural reason.

---

## 4. Component Level System

The UI should be designed and implemented using clear component levels. This keeps the app consistent, reusable, and easier to maintain.

### Level 1: Foundation

Foundation items define the visual language and should be used by all components.

Includes:

- Colors
- Typography
- Spacing
- Border radius
- Shadows
- Breakpoints
- Z-index rules
- Icon sizing
- Status color mapping

Examples:

- `primary`
- `success`
- `warning`
- `danger`
- `muted`
- `surface`
- `border`

Rules:

- Do not hardcode one-off colors repeatedly.
- Status colors must be consistent across badges, cards, filters, and timelines.
- Spacing should follow a consistent scale.
- Theme tokens must exist for light and dark backgrounds, surfaces, text, muted text, borders, and focus states.

### Level 2: Base UI Components

Base components are small reusable primitives with no business logic.

Includes:

- `Button`
- `Input`
- `Textarea`
- `Select`
- `DateInput`
- `Checkbox`
- `Badge`
- `Avatar`
- `Card`
- `Modal`
- `Drawer`
- `Tabs`
- `DropdownMenu`
- `Toast`
- `Skeleton`
- `EmptyState`
- `FileInput`

Rules:

- Base components should support loading, disabled, error, and focus states where relevant.
- Base components should be responsive by default.
- Base components should not know about projects, tasks, users, or submissions.

### Level 3: App Components

App components combine base UI components with application-specific meaning.

Includes:

- `AppShell`
- `SidebarNav`
- `MobileNav`
- `PageHeader`
- `ThemeToggle`
- `StatusBadge`
- `TaskTypeBadge`
- `UserAvatar`
- `NotificationItem`
- `ActivityItem`
- `FileAttachmentItem`
- `ConfirmDialog`

Rules:

- App components can understand shared app concepts such as user, status, role, and navigation.
- App components should still avoid complex feature-specific business logic.

### Level 4: Feature Components

Feature components belong to a specific domain and handle feature-level UI behavior.

Project components:

- `ProjectCard`
- `ProjectForm`
- `ProjectMemberList`
- `InvitationPanel`

Task components:

- `TaskBoard`
- `TaskColumn`
- `TaskCard`
- `TaskForm`
- `TaskStatusControl`
- `TaskMetadataPanel`

Submission and review components:

- `SubmissionForm`
- `SubmissionHistory`
- `SubmissionItem`
- `ReviewPanel`
- `RevisionFeedbackForm`

Collaboration components:

- `CommentThread`
- `CommentForm`
- `AttachmentList`
- `AttachmentUploader`
- `ActivityTimeline`
- `NotificationList`

Rules:

- Feature components may call feature hooks or receive feature data as props.
- Feature components should keep role-specific UI rules clear.
- Feature components should use Level 2 and Level 3 components instead of restyling from scratch.

### Level 5: Page Components

Page components compose feature components into full screens.

Includes:

- `LoginPage`
- `RegisterPage`
- `DashboardPage`
- `ProjectsPage`
- `ProjectDetailPage`
- `TaskDetailPage`
- `NotificationsPage`

Rules:

- Pages handle route-level loading, empty, and error states.
- Pages coordinate layout and data fetching.
- Pages should avoid duplicating UI patterns that belong in lower-level components.

### Component Dependency Direction

Components should depend downward only:

```txt
Page Components
  -> Feature Components
  -> App Components
  -> Base UI Components
  -> Foundations
```

Lower-level components should not import higher-level components.

---

## 5. Responsive System

The application must be responsive across common viewport sizes.

### Breakpoints

Use these layout targets:

| Viewport | Layout Target |
| --- | --- |
| Mobile: `< 640px` | Single-column layout, stacked sections |
| Tablet: `640px - 1023px` | Two-column where useful, collapsible navigation |
| Desktop: `>= 1024px` | Full dashboard layout with sidebar or expanded nav |
| Wide desktop: `>= 1280px` | Constrained content width with better information density |

### Global Responsive Rules

- Use fluid containers with sensible max widths.
- Use grids that collapse predictably.
- Forms should become single-column on mobile.
- Tables should become cards/lists or support horizontal scroll when needed.
- Task boards should become stacked status groups on mobile.
- Side panels should move below main content or become drawers on mobile.
- Primary actions should remain reachable without horizontal scrolling.
- Buttons, badges, and tabs must not overflow their containers.
- Touch targets should be at least 44px high on mobile.
- Important actions should not rely only on hover.

---

## 6. Global Layout

Authenticated pages use an application layout with:

- Desktop sidebar or top navigation
- Mobile top bar with collapsible menu
- Current user indicator
- Notification entry point
- Main content area
- Logout action

Primary navigation:

- Dashboard
- Projects
- Notifications

Global user controls:

- Theme selector:
  - Light
  - Dark
  - System
- Logout action

Role-specific actions should appear only when allowed.

### Desktop Layout

- Sidebar navigation is preferred for the authenticated app.
- Main content should use a max-width container on content-heavy pages.
- Project detail may use full-width layout to support the task board.
- Page headers should include title, short context, and primary action.

### Mobile Layout

- Navigation collapses behind a menu button.
- Page headers stack title and actions vertically.
- Primary action should remain visible near the top of the page.
- Long content sections should use clear spacing and dividers.

---

## 7. Authentication Screens

### Login Page

Purpose:

- Allow existing users to access the app.

Fields:

- Email
- Password

Actions:

- Login
- Link to register

States:

- Loading while submitting
- Invalid credentials error
- Validation errors for missing/invalid fields

Responsive expectations:

- Centered auth panel on desktop.
- Full-width form with comfortable padding on mobile.
- No horizontal scrolling.

### Register Page

Purpose:

- Allow new users to create an account.

Fields:

- Name
- Email
- Password
- Role:
  - Freelancer
  - Client

Actions:

- Register
- Link to login

States:

- Loading while submitting
- Duplicate email error
- Validation errors

Responsive expectations:

- Role selection should be easy to tap on mobile.
- Form fields stack vertically on all screen sizes.

---

## 8. Dashboard

Purpose:

- Give the user a quick overview after login.

Content:

- Project summary
- Recent tasks
- Recent notifications
- Recent activity

Freelancer actions:

- Create project

Client actions:

- View assigned/joined projects

Empty state:

- Freelancer: prompt to create first project.
- Client: explain that projects appear after accepting an invitation.

Layout expectations:

- Use summary cards for project/task counts.
- Use a recent activity list for quick scanning.
- Use a recent tasks section with status badges.
- On desktop, summary cards can sit in a grid.
- On mobile, summary cards stack in a single column.

---

## 9. Projects List Page

Purpose:

- Show projects the current user can access.

Content per project:

- Project name
- Description preview
- Start date
- End date if available
- Task count summary
- Latest activity timestamp

Freelancer actions:

- Create project
- Open project

Client actions:

- Open project

States:

- Loading project list
- Empty project list
- Project load error

Layout expectations:

- Desktop: responsive project card grid or clean list view.
- Mobile: single-column project cards.
- Cards should show enough metadata to decide which project to open.
- Long descriptions should be clamped with a clear detail page available.

---

## 10. Create/Edit Project

Purpose:

- Allow freelancers to create or update project details.

Fields:

- Name
- Description
- Start date
- End date

Rules:

- Name is required.
- Start date is required.
- End date is optional.
- Client users cannot create or edit projects.

States:

- Validation errors
- Saving state
- Save success
- Save failure

Layout expectations:

- Use a modal, drawer, or dedicated form page.
- Keep labels visible and explicit.
- Place primary save action consistently at the bottom or top-right on desktop.
- On mobile, actions should stack or become full-width.

---

## 11. Project Detail Page

Purpose:

- Provide the main project workspace.

Content:

- Project title and description
- Project dates
- Project members
- Invite client action for freelancers
- Task board
- Recent activity

Task board columns:

- Todo
- In Progress
- Review
- Done

Freelancer actions:

- Generate/copy invitation link
- Create feature task
- Update task status
- Delete task

Client actions:

- Create change request task
- View task details

States:

- No tasks yet
- Invitation link generated
- Invitation generation failed
- Project access denied

Layout expectations:

- Header shows project name, dates, members, and primary actions.
- Task board is the main visual focus.
- Recent activity should be secondary and not compete with the board.
- Desktop uses a four-column board when space allows.
- Tablet can use two-column status sections.
- Mobile uses stacked status sections in workflow order.
- Each task card should show title, type, due date, status, and creator.

---

## 12. Task Creation

Purpose:

- Allow project members to create role-appropriate tasks.

Fields:

- Title
- Description
- Due date

Backend-derived behavior:

- Freelancer creates `feature` task.
- Client creates `change_request` task.

Rules:

- Title is required.
- Due date is optional.
- User cannot manually choose task type.

States:

- Validation errors
- Saving state
- Save success
- Save failure

Layout expectations:

- Use a modal or drawer from the project detail page.
- Explain task type through UI label after role derivation, not through editable input.
- On mobile, modal/drawer should use full-screen or near-full-screen layout.

---

## 13. Task Detail Page

Purpose:

- Show full task context and workflow actions.

Content:

- Title
- Description
- Status
- Task type
- Due date
- Creator
- Attachments
- Submission history
- Review panel
- Comments
- Activity timeline

Freelancer actions:

- Update status
- Submit work
- Upload task attachment
- Upload submission attachment during submission
- Delete task

Client actions:

- Approve submission when task is in review
- Request revision when task is in review
- Upload task attachment
- Comment

States:

- No submissions yet
- Task currently waiting for review
- Task completed
- Revision requested
- Upload error
- Access denied

Layout expectations:

- Desktop can use a two-column layout:
  - Main column: task details, submissions, comments
  - Side column: status, actions, metadata, attachments
- Mobile should use one column:
  - Summary/actions first
  - Details
  - Submissions/review
  - Comments
  - Activity
- Review actions must be visually prominent when task is in `review`.
- Destructive actions should be visually separated from primary workflow actions.

---

## 14. Submission UI

Purpose:

- Allow freelancer to submit task work and preserve revision history.

Fields:

- Notes
- Attachments

Rules:

- Only freelancer project members can submit.
- Submitting moves task to `review`.
- Each submission gets the next version number.

States:

- Uploading attachment
- Submission saving
- Submission success
- Submission failure

Layout expectations:

- Submission form should be easy to reach from task detail.
- Attachment upload should show selected files before submit.
- Previous submissions should appear as chronological revision history.

---

## 15. Review UI

Purpose:

- Allow client to review freelancer submissions.

Visible when:

- User is a client project member.
- Task has a submission pending review.

Actions:

- Approve
- Request revision

Rules:

- Revision feedback is required.
- Approve moves task to `done`.
- Request revision moves task to `in_progress`.

States:

- Review submitting
- Missing feedback error
- Review success
- Review failure

Layout expectations:

- Approve should be the positive primary action.
- Request revision should clearly reveal or require a feedback field.
- Feedback textarea should be full-width on mobile.

---

## 16. Comments UI

Purpose:

- Support task-level discussion.

Content:

- Comment author
- Comment timestamp
- Comment content

Actions:

- Add comment

States:

- No comments yet
- Sending comment
- Comment validation error
- Comment send failure

Layout expectations:

- Comments should be easy to scan by author and time.
- Comment input should stay near the comment history.
- Long comments should wrap cleanly.

---

## 17. Attachments UI

Purpose:

- Show files attached to tasks and submissions.

Content:

- File name
- File type
- File size
- Uploaded by
- Uploaded at

Rules:

- Maximum file size is 10 MB.
- Only approved file formats are allowed.
- Executable files are blocked.

States:

- Uploading
- Invalid file type
- File too large
- Upload failed

Layout expectations:

- File rows should include a recognizable file icon or type badge.
- On mobile, attachment metadata should wrap below the filename.
- Upload errors should appear near the upload control.

---

## 18. Notifications Page

Purpose:

- Show user notification history.

Content:

- Notification title
- Message
- Read/unread state
- Created timestamp
- Link to related project/task/submission/comment

Actions:

- Open notification target
- Mark as read

States:

- No notifications
- Loading notifications
- Notification load error

Layout expectations:

- Unread notifications should be visually distinct.
- Notification list should work well as a single-column list on all screens.
- Notification target links should be clear and easy to tap.

---

## 19. Activity Timeline

Purpose:

- Show traceable project/task history.

Content:

- Action label
- Actor
- Timestamp
- Related task/submission/comment if relevant

Rules:

- Logs are read-only.
- Newest activity appears first.

States:

- No activity yet
- Loading activity
- Activity load error

Layout expectations:

- Use a vertical timeline or compact activity list.
- Use action labels and timestamps for scanability.
- On mobile, avoid dense multi-column timeline layouts.

---

## 20. Role-Based UI Rules

Freelancer should see:

- Create project
- Edit project
- Generate invitation link
- Create feature task
- Update task status
- Submit work
- Delete task

Client should see:

- Accept invitation
- Create change request task
- Review submission
- Approve submission
- Request revision

Both roles should see:

- Accessible projects
- Project tasks
- Task details
- Comments
- Attachments
- Notifications
- Activity logs
- Theme selector

Backend authorization remains required even when UI actions are hidden.

---

## 21. Responsive Page Behavior

Desktop:

- Sidebar navigation may stay visible.
- Dashboard summary cards can use a 3- or 4-column grid.
- Project detail can use a multi-column task board.
- Task detail can show main content and side panels.
- Tables/lists can show more metadata.

Tablet:

- Navigation may collapse.
- Task board can use two columns or grouped sections.
- Project cards can use two columns.
- Side panels should move below main content if width is tight.

Mobile:

- Navigation should collapse into a top-bar menu.
- Task board should become stacked status sections.
- Forms should use full-width fields.
- Primary actions should remain easy to reach.
- Lists and tables should become card-like rows when needed.
- Text must not overflow buttons, cards, or panels.
- Modals should become full-screen or bottom-sheet style where appropriate.
- Important actions should be tappable without precision.

---

## 22. Modern Interaction Expectations

- Theme switching should apply immediately without requiring page reload.
- Theme selector should be available from the app shell user menu or settings area.
- Dark theme must preserve readable contrast for text, borders, badges, cards, forms, and task columns.
- Use optimistic UI only when rollback behavior is clear.
- Use skeleton loading for project lists, task board, task detail, and notifications.
- Use inline validation messages directly under form fields.
- Use toast notifications for successful create/update actions.
- Use confirmation dialogs for destructive actions such as deleting tasks.
- Disable submit buttons while requests are in progress.
- Keep focus states visible for keyboard navigation.
- Return users to the relevant page after successful actions.
- Preserve user context after creating a task, submitting work, or reviewing a submission.

---

## 23. MVP UI Completion Criteria

The UI is MVP-ready when:

- All MVP flows are reachable through the interface.
- Freelancer and client see correct role-specific actions.
- Empty, loading, error, and success states exist for core screens.
- Full project lifecycle can be completed without direct API calls.
- UI does not expose actions the user cannot perform.
- UI follows the component level system from foundation to pages.
- Layout works cleanly on mobile, tablet, desktop, and wide desktop.
- Task board, forms, comments, attachments, and notifications do not overflow on mobile.
- The app has a consistent modern visual style across all screens.
- Light and dark themes are both complete and readable.

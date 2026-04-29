# 📘 Product Requirements Document (PRD)

## Freelancer Project Management Tool (FPMT)

---

## 1. 📌 Overview

### 1.1 Purpose

This document defines the **functional and non-functional product requirements** for the Freelancer Project Management Tool (FPMT).

It translates business requirements into clear system behavior and implementation guidance.

---

## 2. 🎯 Product Goals

- Provide structured collaboration between freelancer and client
- Enable clear task lifecycle and review flow
- Support revision-based workflow
- Centralize communication and files
- Ensure users are always informed via notifications

---

## 3. 👥 User Roles

### Freelancer

- Create and manage project
- Create and manage tasks
- Submit work
- Handle revisions

### Client

- View project and tasks
- Review submissions
- Approve or request revisions
- Comment on tasks
- Create change request tasks

---

## 4. 🧩 Core Features & Requirements

---

## 4.1 Authentication & Authorization

### Functional Requirements

- User can register
- User can login/logout
- Role-based access:
  - Freelancer
  - Client

### Rules

- Only freelancer can create project
- Client only accesses projects they are invited to

---

## 4.2 Project Management

### Functional Requirements

- Create project
- Edit project:
  - Name
  - Description
  - Start date
  - End date (optional)
- Invite client via link
- View project dashboard

---

### Invitation Link Requirements

- Freelancer can generate invitation link per project
- Link is unique and tied to one project
- Freelancer can copy/share the link

---

### Client Join Flow

1. Client opens invitation link
2. If not logged in → redirect to register/login
3. After login → user can accept invitation
4. Client becomes member of project

---

### Rules

- One link = one project
- Client cannot access project without invitation
- Freelancer can regenerate link (old link becomes invalid)
- Optional (MVP+): link expiration

---

### UI Expectations

- Project list page
- Project detail page
- Invite button → generate/copy link

---

## 4.3 Task Management

### Functional Requirements

- Create task
- Edit task
- Delete task (freelancer only)

---

### Task Fields

- Title
- Description
- Due date
- Status
- Task type:
  - Feature Task (freelancer)
  - Change Request Task (client)

---

### Task Status Workflow

Todo → In Progress → Review → Done

---

### Rules

- Freelancer controls status
- Client interacts via review only

---

## 4.4 Submission & Revision System

### Functional Requirements

- Freelancer submits work per task
- Each submission creates a revision
- Multiple revisions supported

---

### Submission Data

- Notes / description
- Attachments
- Timestamp

---

### Rules

- Submit → task moves to Review
- Revision history must be preserved

---

## 4.5 Review & Approval

### Functional Requirements

- Client can:
  - Approve
  - Request revision

---

### Behavior

- Approve → Done
- Request revision → In Progress

---

### Rules

- Revision request must include feedback

---

## 4.6 Comments & Communication

### Functional Requirements

- Comment per task
- View comment history

---

### Rules

- Comments linked to task
- Each comment includes:
  - Author
  - Timestamp

---

## 4.7 File & Attachment Management

### Functional Requirements

- Upload file to:
  - Task
  - Submission

---

### Constraints

- Maximum file size: 10 MB per file
- Allowed formats:
  - Images: JPG, JPEG, PNG, WebP
  - Documents: PDF, DOC, DOCX, XLS, XLSX, TXT, CSV
  - Archives: ZIP
- Executable files are not allowed

---

## 4.8 Notification System

### Functional Requirements

System generates notifications for:

- Task status changes
- New submissions
- Revision requests
- Comments
- Project invitations

---

### Notification Behavior

- In-app notification list
- Read/unread status
- Click redirects to related page
- Notification history available

---

## 4.9 Theme Preference

### Functional Requirements

- User can choose interface theme:
  - Light
  - Dark
  - System default
- Selected theme is applied across the application.
- Selected theme persists after refresh and future login.

### Rules

- Light theme is the default when no preference exists.
- System default follows the user's operating system preference.
- Theme selection affects UI appearance only and does not affect project data.

---

## 4.10 Activity Log

### Functional Requirements

System records:

- Status changes
- Submissions
- Reviews
- Comments
- File uploads

---

### UI

- Activity timeline per task/project

---

## 4.11 Timeline & Deadlines

### Functional Requirements

- Set due date per task
- Show overdue tasks
- Optional project duration

---

## 5. 🔄 User Flows

---

### 5.1 Project Flow

1. Freelancer creates project
2. Freelancer generates invitation link
3. Freelancer shares link
4. Client joins project

---

### 5.2 Task Flow

1. Task created → Todo
2. Freelancer moves → In Progress
3. Freelancer submits → Review

---

### 5.3 Review Flow

1. Client reviews
2. Approve → Done
3. Request revision → In Progress

---

### 5.4 Change Request Flow

1. Client creates task
2. Task labeled as Change Request
3. Freelancer processes task

---

## 6. ⚙️ Non-Functional Requirements

---

### Performance

- Fast load time (<2s)
- Smooth UI interaction

---

### Scalability

- Modular monolith architecture
- Clear module separation

---

### Security

- Secure authentication (httpOnly cookies)
- Role-based authorization
- Input validation
- Secure file upload

---

### Usability

- Simple UI
- Clear task status visibility
- Minimal learning curve

---

### Reliability

- Consistent task state
- No data loss in submissions

---

## 7. 🗂️ Data Model (High-Level)

---

### Entities

- User
- Project
- Task
- Submission
- Comment
- Notification
- Activity Log
- Attachment

---

### Relationships

- Project → Tasks
- Task → Submissions
- Task → Comments
- User → Projects
- Submission → Task

---

## 8. 📏 Acceptance Criteria (MVP)

- Project can be created
- Client can join via link
- Task lifecycle works end-to-end
- Submission & revision loop works
- Client can approve/request revision
- Comments function correctly
- Notifications are triggered and visible
- Activity logs recorded
- User can switch between light, dark, and system theme

---

## 9. 🚧 Out of Scope (MVP)

- Payment system
- Real-time chat
- Advanced analytics/dashboard
- Third-party integrations

---

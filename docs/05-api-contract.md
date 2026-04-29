# 📘 05 - API Contract

## Freelancer Project Management Tool (FPMT)

---

## 1. 📌 Overview

This document defines the **API contract between frontend and backend** for the Freelancer Project Management Tool.

It ensures:

- Clear communication between FE & BE
- Consistent request/response structure
- Scalable development
- Alignment with ERD, PRD, and BRD

---

## 2. 🌐 Base Configuration

### Base URL

```
/api/v1
```

---

### Standard Response Format

#### ✅ Success

```json
{
  "success": true,
  "message": "Success message",
  "data": {}
}
```

#### ❌ Error

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

---

## 3. 🔐 Authentication (httpOnly Cookie Based)

### 🔑 Concept

- Backend sets **httpOnly cookie**
- Frontend does NOT store token
- Browser automatically sends cookie
- Use `withCredentials: true` in HTTP client

---

### POST `/auth/register`

```json
{
  "name": "John Doe",
  "email": "john@email.com",
  "password": "password123",
  "role": "freelancer"
}
```

---

### POST `/auth/login`

```json
{
  "email": "john@email.com",
  "password": "password123"
}
```

#### Response

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "name": "John",
      "role": "freelancer"
    }
  }
}
```

#### Server Behavior

```
Set-Cookie: access_token=xxx; HttpOnly; Secure; SameSite=Strict
```

---

### POST `/auth/logout`

- Clears cookie

---

### GET `/auth/me`

- Get current authenticated user

---

## 4. 👤 Users

### GET `/users/me`

- Get current user profile

---

### PATCH `/users/me/preferences`

```json
{
  "theme": "dark"
}
```

#### Rules

- `theme` must be one of `light`, `dark`, or `system`.
- Updates only the authenticated user's preferences.
- Returns updated user preference data.

---

## 5. 📁 Projects

### POST `/projects`

```json
{
  "name": "Website Project",
  "description": "Landing page",
  "start_date": "2026-05-01",
  "end_date": "2026-05-10"
}
```

---

### GET `/projects`

- List projects for current user

---

### GET `/projects/:id`

- Get project detail

---

## 6. 🔗 Project Invitation

### POST `/projects/:id/invite`

Request body is not required. The server generates a new invitation token, deactivates the previous active invitation for the project, and returns the generated link.

#### Response

```json
{
  "invite_link": "https://app.com/invite/abc123"
}
```

---

### POST `/invitations/accept`

```json
{
  "token": "abc123"
}
```

---

## 7. ✅ Tasks

### POST `/tasks`

```json
{
  "project_id": "uuid",
  "title": "Build Login Page",
  "description": "UI + API",
  "due_date": "2026-05-05"
}
```

#### Behavior

- If the current user is a freelancer, the server creates a `feature` task.
- If the current user is a client, the server creates a `change_request` task.
- Clients cannot choose or override task type.

---

### GET `/projects/:id/tasks`

- List tasks by project

---

### PATCH `/tasks/:id`

```json
{
  "status": "in_progress"
}
```

---

### DELETE `/tasks/:id`

- Freelancer only

---

## 8. 📤 Submissions (Revisions)

### POST `/tasks/:id/submissions`

```json
{
  "notes": "Revision 1 completed"
}
```

#### Behavior

- Auto increment version
- Task → `review`
- Trigger notification

---

### GET `/tasks/:id/submissions`

- Get submission history

---

## 9. 🧾 Reviews

### POST `/submissions/:id/review`

#### Approve

```json
{
  "decision": "approved"
}
```

#### Request Revision

```json
{
  "decision": "revision_requested",
  "feedback": "Fix UI spacing"
}
```

#### Behavior

- Approved → task = `done`
- Revision → task = `in_progress`

---

## 10. 💬 Comments

### POST `/tasks/:id/comments`

```json
{
  "content": "Please adjust padding"
}
```

---

### GET `/tasks/:id/comments`

- Get all comments

---

## 11. 📎 Attachments

### POST `/tasks/:id/attachments`

- Upload task file

---

### POST `/submissions/:id/attachments`

- Upload submission file

---

## 12. 🔔 Notifications

### GET `/notifications`

- List notifications

---

### PATCH `/notifications/:id/read`

- Mark as read

---

## 13. 🕓 Activity Logs

### GET `/projects/:id/activity-logs`

---

### GET `/tasks/:id/activity-logs`

---

## 14. ⚙️ Authorization Rules

| Action             | Freelancer | Client              |
| ------------------ | ---------- | ------------------- |
| Create Project     | ✅         | ❌                  |
| Invite Client      | ✅         | ❌                  |
| Create Task        | ✅         | ✅ (change_request) |
| Update Task Status | ✅         | ❌                  |
| Submit Work        | ✅         | ❌                  |
| Review Submission  | ❌         | ✅                  |

---

## 15. 🔄 Key Flow Mapping

### Submission Flow

```
POST /tasks/:id/submissions
→ create submission
→ update task status = review
→ create notification
→ create activity log
```

---

### Review Flow

```
POST /submissions/:id/review

IF approved:
  → task = done

IF revision_requested:
  → task = in_progress
```

---

### Invitation Flow

```
POST /projects/:id/invite
→ generate token

POST /invitations/accept
→ add user to project_members
```

---

## 16. 🔒 Security Notes

- Use httpOnly cookies (no token in frontend)
- Enable:
  - Secure
  - SameSite=Strict
- Implement CSRF protection for mutation requests
- Validate Origin / Referer headers for cookie-authenticated mutation requests
- Validate roles on backend
- Protect all routes with auth middleware

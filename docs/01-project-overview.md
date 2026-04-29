# 📘 Project Overview

## Freelancer Project Management Tool

---

## 🧩 Project Name

**Freelancer Project Management Tool (FPMT)**

---

## 🎯 Purpose

The Freelancer Project Management Tool is a web-based application designed to streamline collaboration between freelancers and clients across various types of work.

It provides a structured environment for managing projects, tracking task progress, handling feedback, and ensuring clear communication throughout the project lifecycle.

---

## 🚀 Problem Statement

Freelancers and clients often rely on multiple disconnected tools such as messaging apps, spreadsheets, and file-sharing platforms. This leads to:

- Lack of clear task ownership
- Poor visibility of project progress
- Miscommunication between freelancer and client
- Unstructured feedback and revision processes
- Difficulty tracking changes and approvals

Clients also struggle to understand project status and provide feedback in an organized way.

---

## 💡 Solution

This system centralizes project collaboration into a single platform where:

- Freelancers manage tasks and workflow execution
- Clients review work and provide structured feedback
- Both parties track progress transparently
- All activities are recorded and traceable

The platform introduces a structured workflow:

**Todo → In Progress → Review → Done**

It supports task-level submissions and revisions, including **change request tasks created by clients** when additional work is needed.

---

## 👥 Target Users

### 1. Freelancer

- Manages projects and tasks
- Executes work and submits deliverables
- Handles revisions and updates

### 2. Client

- Reviews submitted work
- Approves or requests revisions
- Monitors project progress
- Can create **change request tasks**

### 3. Admin (Optional)

- Manages users and system configuration

---

## 🧱 Core Value Proposition

- Clear task lifecycle management
- Structured review and approval flow
- Support for change requests within the system
- Transparent communication through comments and activity logs
- Centralized file and attachment management
- Role-based access control
- In-app notifications for important updates

---

## ⚙️ Key Features (MVP Scope)

- Authentication with role-based access
- Project creation and management
- Task management with status workflow
- Task-level submission and revision history
- Review and approval system
- Comments and discussions on tasks
- File attachments
- Activity logs
- Support for change request tasks (client-created)
- Basic timeline support (task due dates)
- In-app notifications for important updates

---

## 🏗️ System Approach

The system is built as a **modular monolith** using a modern web framework.

- Single application (frontend and backend)
- Clear module separation (auth, project, task, review, notification, etc.)
- Defined API contracts between frontend and backend layers
- Role-based authorization

This approach enables fast development while maintaining a scalable structure.

---

## 🔄 High-Level Workflow

1. Freelancer creates a project

2. Freelancer creates tasks

3. Client is invited to the project

4. Client joins and can view tasks

5. Freelancer works on tasks

6. Freelancer submits task (creates a revision)

7. Task moves to **Review**

8. Client reviews:
   - Approves → Task marked as Done
   - Requests changes → Task returns to In Progress

9. Client may create **change request tasks** if additional work is required

10. All actions are recorded in activity logs

---

## 📈 Success Criteria

- Users can complete a full project lifecycle within the platform
- Clear visibility of task status at any time
- Structured and repeatable review process
- Reduced miscommunication between freelancer and client
- Users stay informed through in-app notifications

---

## 📌 Product Direction

This system is designed as a general freelancer-client project management tool.

It supports different types of freelance work such as development, design, content creation, marketing, and consulting by using flexible core concepts like:

- Projects
- Tasks
- Submissions
- Revisions
- Comments
- Attachments
- Notifications
- Approvals

For demonstration purposes, initial example data may reflect a web development workflow, while the system itself remains generic and adaptable.

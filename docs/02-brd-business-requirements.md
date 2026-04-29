# 📘 Business Requirements Document (BRD)

## Freelancer Project Management Tool (FPMT)

---

## 1. 📌 Introduction

### 1.1 Purpose

This document defines the business requirements for the **Freelancer Project Management Tool (FPMT)**. It outlines the problems being solved, the business goals, and the required capabilities of the system from a business perspective.

---

### 1.2 Scope

The system will provide a centralized platform for freelancers and clients to manage projects, tasks, submissions, revisions, and notifications in a structured and transparent way.

---

## 2. 🎯 Business Objectives

- Reduce miscommunication between freelancers and clients
- Provide clear visibility of project progress
- Standardize task workflow and review process
- Improve efficiency in handling revisions and feedback
- Ensure users are informed of important updates
- Centralize all project-related activities

---

## 3. 🚨 Problem Overview

Freelancer workflows currently rely on disconnected tools, leading to:

- Unclear task ownership
- Scattered communication
- Missed updates or delayed responses
- Unstructured feedback
- Poor progress visibility

---

## 4. 💡 Business Solution

The system will:

- Centralize all project activities
- Provide structured workflow
- Enable clear submission & review process
- Maintain revision history
- Improve collaboration transparency
- Notify users of important events and updates

---

## 5. 👥 Stakeholders

- Freelancer
- Client
- Admin (optional)

---

## 6. 👤 User Roles & Responsibilities

### Freelancer

- Create project
- Create and manage tasks
- Update task status
- Submit work
- Handle revisions

---

### Client

- View all tasks within project
- Review submitted work
- Approve or request revisions
- Provide feedback through comments
- Create new tasks as **change requests**

---

### Admin (Optional)

- Manage system and users

---

### Task Ownership Rules

- Tasks can be created by:
  - Freelancer (main project tasks)
  - Client (change request tasks)

- Task types:
  - **Feature Task** → created by freelancer
  - **Change Request Task** → created by client

- Permissions:
  - Freelancer:
    - Full control over all tasks

  - Client:
    - Can create new tasks
    - Cannot modify existing task structure (MVP scope)

---

## 7. 🔄 Business Process Workflow

### 7.1 Project Flow

1. Freelancer creates project
2. Freelancer creates tasks
3. Freelancer invites client
4. Client joins project
5. Client can view all tasks

---

### 7.2 Task Lifecycle

Todo → In Progress → Review → Done

---

### 7.3 Submission Flow

1. Freelancer works on task
2. Freelancer submits work (revision created)
3. Task moves to **Review**
4. Client:
   - Approves → Task becomes **Done**
   - Requests revision → Task returns to **In Progress**

---

## 8. 📦 Business Requirements

### 8.1 Project Management

- Create project
- Invite client
- View project overview

---

### 8.2 Task Management

- Create tasks
- Update task status
- Track task progress

---

### 8.3 Timeline Management

- Set project start date
- Set optional project end date
- Assign due date for each task

---

### 8.4 Submission & Revision

- Submit work per task
- Maintain revision history
- Support multiple revisions

---

### 8.5 Review & Approval

- Client reviews submission
- Approve or request revision
- Provide feedback

---

### 8.6 Communication

- Comment per task
- Contextual discussion

---

### 8.7 File Management

- Upload attachments
- Link files to tasks or submissions

---

### 8.8 Activity Tracking

- Log all actions:
  - Status changes
  - Submissions
  - Reviews
  - Comments

---

### 8.9 Notification System

The system must notify users of important events to ensure timely awareness and action.

---

#### Notification Scope

Users should receive in-app notifications for key activities, including:

- Task updates (status changes, submissions, revisions)
- New comments on tasks
- File uploads related to tasks
- Project invitations

---

#### Notification Requirements

- Notifications must be visible within the application
- Users should be able to distinguish unread and read notifications
- Notifications should direct users to the relevant task or project
- Notification history should be available for user reference

---

### 8.10 Access Control

- Role-based access:
  - Freelancer (full control)
  - Client (view, review, create change request tasks)

---

## 9. 📏 Success Metrics

- Users can complete full project lifecycle within the system
- Task status is always clear and up-to-date
- Feedback and revisions are structured and traceable
- Communication is centralized and contextual
- Users are consistently aware of important updates

---

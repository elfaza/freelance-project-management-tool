# 11 - Environment Setup

## Freelancer Project Management Tool (FPMT)

---

## 1. Purpose

This document defines how developers should set up and run the project locally.

The exact commands may be adjusted after the application is scaffolded, but this document defines the expected development environment.

---

## 2. Required Tools

Required:

- Node.js 22 LTS or newer
- npm
- PostgreSQL 18 or newer
- Git

Recommended:

- Prisma CLI through `npx prisma`
- Database GUI such as TablePlus, DBeaver, or pgAdmin

---

## 3. Project Setup

Install dependencies:

```bash
npm install
```

Create local environment file:

```bash
cp .env.example .env
```

Run database migration:

```bash
npx prisma migrate dev
```

Seed demo data:

```bash
npm run prisma:seed
```

Start development server:

```bash
npm run dev
```

Default local URL:

```txt
http://localhost:3000
```

---

## 4. Environment Variables

Required variables:

```txt
DATABASE_URL=
AUTH_SECRET=
APP_URL=
NODE_ENV=
UPLOAD_STORAGE=
CSRF_SECRET=
```

Example local values:

```txt
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/fpmt_dev"
AUTH_SECRET="replace-with-local-development-secret"
APP_URL="http://localhost:3000"
NODE_ENV="development"
UPLOAD_STORAGE="local"
CSRF_SECRET="replace-with-local-csrf-secret"
```

Rules:

- Do not commit real secrets.
- `.env` must be ignored by git.
- Production secrets must be generated securely.

---

## 5. Database Setup

Create local database:

```bash
createdb fpmt_dev
```

Apply migrations:

```bash
npx prisma migrate dev
```

Open Prisma Studio:

```bash
npx prisma studio
```

Reset local database when needed:

```bash
npx prisma migrate reset
```

Use reset only for local development because it deletes local data.

---

## 6. Expected npm Scripts

The project should provide these scripts after scaffold:

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "typecheck": "tsc --noEmit",
  "test": "vitest",
  "test:watch": "vitest --watch",
  "prisma:migrate": "prisma migrate dev",
  "prisma:seed": "prisma db seed"
}
```

---

## 7. Demo Seed Data

The seed script should create:

Freelancer user:

```txt
email: freelancer@example.com
password: password123
role: freelancer
```

Client user:

```txt
email: client@example.com
password: password123
role: client
```

Sample data:

- One project
- Freelancer and client as project members
- Tasks in each status:
  - todo
  - in_progress
  - review
  - done
- At least one feature task
- At least one change request task
- At least one submission
- At least one review
- At least one comment
- At least one notification
- Activity logs for sample actions

---

## 8. Local File Storage

For MVP local development:

```txt
UPLOAD_STORAGE=local
```

Expected local upload directory:

```txt
uploads/
```

Rules:

- Uploaded files should not be committed.
- Store generated filenames, not raw user-controlled filenames.
- Keep original filename only as metadata.

---

## 9. Development Quality Checks

Before marking work complete, run:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

If a command does not exist yet, add it during project setup.

---

## 10. Troubleshooting

### Database connection fails

Check:

- PostgreSQL is running.
- Database exists.
- `DATABASE_URL` is correct.
- User has database permissions.

### Auth cookie does not persist

Check:

- `APP_URL` matches local URL.
- Cookie `Secure` flag is disabled in local development.
- Axios uses `withCredentials: true`.

### Prisma client is missing

Run:

```bash
npx prisma generate
```

### Migration is out of sync

For local development only:

```bash
npx prisma migrate reset
```

---

## 11. Definition of Done for Setup

Setup is complete when:

- Dependencies install successfully.
- Environment variables are documented.
- Database migration runs.
- Seed data is available.
- Development server starts.
- App opens at `http://localhost:3000`.
- Lint, typecheck, test, and build commands are available.

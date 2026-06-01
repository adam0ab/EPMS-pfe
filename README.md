# ESPRIT Procedure Management System (EPMS)

A premium Electron desktop application for managing institutional procedures across
ESPRIT's departments — academic, administrative, financial, HR, logistics, IT, quality,
and more.

## Tech Stack

- **Frontend**: Electron, React, TypeScript, Tailwind CSS, Zustand, React Router, React Query, Recharts
- **Backend**: Node.js, Express.js, JWT auth, bcrypt, Multer + MongoDB GridFS, PDFKit, ExcelJS
- **Database**: MongoDB, Mongoose
- **Architecture**: Clean Architecture (controller → service → repository), npm workspaces monorepo

## Project Structure

```
adam/
├── apps/
│   ├── server/            Express API (Clean Architecture)
│   │   └── src/
│   │       ├── config/        env, MongoDB connection, GridFS bucket
│   │       ├── models/        Mongoose schemas
│   │       ├── repositories/  Repository pattern (data access)
│   │       ├── services/      Business logic (incl. AI, reports, notifications)
│   │       ├── controllers/   HTTP request handlers
│   │       ├── routes/        Express routers
│   │       ├── middleware/    JWT auth, RBAC, error handling, file upload
│   │       ├── utils/         JWT, password hashing, ApiError, PDF/Excel renderers
│   │       └── seed/          Departments / categories / users seed data
│   └── desktop/            Electron + React renderer
│       ├── electron/          main.ts (BrowserWindow), preload.ts
│       └── src/
│           ├── api/            axios clients per resource
│           ├── hooks/          React Query hooks
│           ├── store/          Zustand stores (auth, theme)
│           ├── components/     layout, ui primitives, charts, procedure/document/AI widgets
│           ├── pages/           Login, Dashboard, Procedures, Departments, Categories, Users, Reports
│           └── routes/          React Router config + role guards
└── packages/
    └── shared/             Types, enums and seed constants shared by both apps
```

## Prerequisites

- Node.js 18+
- A running MongoDB instance (local `mongod` or a connection string, e.g. MongoDB Atlas)

## Setup

```bash
# 1. Install dependencies for every workspace (also builds @epms/shared)
npm install

# 2. Configure environment variables
cp apps/server/.env.example apps/server/.env
cp apps/desktop/.env.example apps/desktop/.env
# edit apps/server/.env with your MONGO_URI, a real JWT_SECRET, and (optionally) an AI key

# 3. Seed departments, categories, and default users
npm run seed

# 4. Run the API (terminal 1)
npm run dev:server

# 5. Run the Electron app (terminal 2)
npm run dev:desktop
```

The desktop app expects the API at `http://localhost:4000/api` (configurable via
`apps/desktop/.env` → `VITE_API_URL`).

### Default accounts (created by `npm run seed`)

| Role        | Email                | Password         |
|-------------|-----------------------|-------------------|
| Super Admin | admin@esprit.tn       | Admin@12345       |
| Employee    | employee@esprit.tn    | Employee@12345    |

## Roles & Permissions

- **Super Admin**: full access — create/edit/delete/publish/archive procedures, manage
  departments, categories, users and documents, view dashboard statistics, generate reports.
- **Employee**: log in, search/view published procedures, download attached documents, use
  the AI Assistant, view notifications. Cannot create, edit, delete, or manage admin
  resources (enforced both by hidden UI and by the `requireRole` middleware on the API).

## API Overview

All routes are prefixed with `/api` and (except `/auth/login`) require
`Authorization: Bearer <token>`.

- `POST /auth/login`, `GET /auth/me`
- `GET/POST/PATCH/DELETE /users` (Super Admin only)
- `GET /departments`, `POST/PATCH/DELETE /departments` (Super Admin only)
- `GET /categories`, `POST/PATCH/DELETE /categories` (Super Admin only)
- `GET /procedures` (supports `search`, `department`, `category`, `keyword`, `status`,
  `versionNumber`, `effectiveFrom`, `effectiveTo`, `page`, `pageSize`)
- `GET /procedures/:id`, `GET /procedures/:id/recommendations`, `POST /procedures`,
  `PATCH /procedures/:id`
- `POST /procedures/:id/publish`, `POST /procedures/:id/archive`, `DELETE /procedures/:id`
- `GET /documents/procedure/:procedureId`, `POST /documents/procedure/:procedureId`
  (multipart upload, Super Admin only), `GET /documents/:id/download`,
  `DELETE /documents/:id` (Super Admin only) — files are streamed to/from MongoDB GridFS
- `GET /notifications`, `PATCH /notifications/:id/read`, `PATCH /notifications/read-all`
- `GET /dashboard/stats`
- `GET /reports/:type/pdf`, `GET /reports/:type/excel` (Super Admin only) — `:type` is one
  of `by-department`, `by-category`, `most-viewed`, `monthly-activity`
- `GET /ai/status`, `POST /ai/ask`, `POST /ai/summarize/:procedureId`

Every create/update/delete/publish/archive/login/download action is recorded in the
`AuditLog` collection (`auditService.log`). Publishing, updating a published procedure, or
archiving a procedure notifies all active users (`Notification` collection).

## AI Assistant

Live via [Groq](https://console.groq.com)'s OpenAI-compatible API (`api.groq.com`), used for
ask / summarize on the Procedure Detail page. Configure in `apps/server/.env`:

```
AI_PROVIDER=groq
AI_API_KEY=<your Groq API key>
AI_MODEL=llama-3.3-70b-versatile
```

`GET /ai/status` reports whether it's configured; the frontend AI Assistant card shows a
"not configured" message instead of the ask/summarize UI when it isn't. The integration
lives in `apps/server/src/services/ai.service.ts` — swapping providers means changing the
request URL/payload there (it's a plain `fetch` call, no SDK lock-in).

## Reports

Super Admins can generate four report types, each downloadable as PDF (PDFKit) or Excel
(ExcelJS) from the **Reports** page: Procedures by Department, Procedures by Category, Most
Viewed Procedures, and Monthly Activity (procedures created per month, last 6 months).

## Packaging (Windows)

```bash
cd apps/desktop
npm run package:win
```

Builds the renderer/main/preload, then runs `electron-builder` to produce an NSIS installer
at `apps/desktop/release/EPMS Setup <version>.exe` (and an unpacked build at
`release/win-unpacked/`). No code signing certificate is configured, so Windows SmartScreen
will warn on first run of the installer — add a cert and `win.certificateFile` /
`win.certificatePassword` in `apps/desktop/package.json` → `build` for a signed release.

## Security

- Passwords hashed with bcrypt (12 salt rounds)
- JWT-based authentication, 8h expiry by default
- Role-based access control enforced at the route level
- Audit logging for all mutating actions
- `helmet` + scoped CORS on the API
- File uploads validated by MIME type and capped at 20MB (Multer)
- Electron pinned to 42.4.1 and electron-builder to 26.x to pick up upstream security fixes.
  Two residual `npm audit` findings are dev-tooling-only (not present in production builds):
  Vite's bundled esbuild dev-server (would require a Vite 6+ major bump) and ExcelJS's
  transitive `uuid` dependency (internal ID generation only, no user input reaches it).

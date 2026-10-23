# DevFlow — Full-Stack Developer Productivity Platform

[![DevFlow CI](https://github.com/KiranKishore05/devflow/actions/workflows/ci.yml/badge.svg)](https://github.com/KiranKishore05/devflow/actions/workflows/ci.yml)
[![Node.js Version](https://img.shields.io/badge/Node.js-v22%20%7C%20v24-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-5.22-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16%20%7C%2018-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)

DevFlow is an enterprise-grade developer productivity platform designed for engineering teams and solo builders. It unifies project tracking, an interactive drag-and-drop Kanban board, markdown technical runbooks, quantitative delivery metrics, and real-time activity auditing in one cohesive workspace.

---

## Table of Contents

- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [Project Directory Structure](#project-directory-structure)
- [Database Schema & Entity Relationships](#database-schema--entity-relationships)
- [Technology Stack](#technology-stack)
- [Local Development Setup](#local-development-setup)
- [Environment Configuration](#environment-configuration)
- [REST API Specification](#rest-api-specification)
- [Automated Testing & Quality Checks](#automated-testing--quality-checks)
- [Production Deployment](#production-deployment)
- [Security Model](#security-model)

---

## Key Features

- **Robust Authentication & Session Handling:** Bcrypt password hashing (10 salt rounds), JWT token issuance via both `Authorization: Bearer <token>` and HTTP-only `auth_token` cookies with SameSite safeguards.
- **Role-Based Project Management:** Create, update, archive, and manage projects. Role-based access control (`OWNER`, `ADMIN`, `MEMBER`) with auto-provisioning for team member invitations.
- **Broken Object-Level Authorization (BOLA) Prevention:** Strict tenant and membership isolation across all projects, tasks, comments, and notes.
- **Interactive Kanban Board:** 4-column agile board (`To Do`, `In Progress`, `In Review`, `Done`) with instant status transitions, priority badges (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`), overdue deadline warnings, and comment threads.
- **Technical Documentation & Notes:** Project-scoped markdown technical runbooks, architecture decision records (ADRs), and notes catalog.
- **Engineering Analytics & KPI Dashboard:** Real-time metrics calculating total active projects, completion rates, overdue task counters, priority distributions, and audit activity feeds.
- **System Health Probes:** Honest health check endpoint (`/api/health`) querying the database and reporting node uptime, memory consumption, and connectivity latency.

---

## System Architecture

```mermaid
flowchart TD
    subgraph Client ["Client Tier (Browser)"]
        UI["React 19 SPA (Vite 6 + Tailwind CSS v4)"]
        Cache["TanStack Query v5 (Client State & Cache)"]
        UI <--> Cache
    end

    subgraph Hosting_Frontend ["Frontend Hosting"]
        Vercel["Vercel Edge Network / Static CDN"]
        Vercel --> UI
    end

    subgraph Hosting_Backend ["Backend Hosting"]
        Render["Render Web Service (Node.js ESM)"]
        API["Express 4 REST API"]
        Middlewares["Helmet + Strict CORS + Rate Limiter"]
        Zod["Zod Input Validation"]
        AuthMid["JWT & RBAC Middleware"]
        Controllers["Domain Routes (Projects, Tasks, Notes, Analytics)"]

        Render --> Middlewares
        Middlewares --> Zod
        Zod --> AuthMid
        AuthMid --> Controllers
    end

    subgraph Database_Tier ["Data Tier"]
        Prisma["Prisma ORM 5 (Connection Pooling)"]
        PG[("Managed PostgreSQL (Neon / Supabase / Render)")]
        SQLite[("Embedded SQLite (Local Windows Dev)")]

        Controllers --> Prisma
        Prisma -.->|Local Dev| SQLite
        Prisma -->|Production| PG
    end

    UI -->|HTTPS / REST API / Bearer Token| Render
```

---

## Project Directory Structure

```text
devflow/
├── .github/
│   └── workflows/
│       └── ci.yml                   # GitHub Actions CI pipeline (Lint, Typecheck, Vitest, Build)
├── backend/                         # Express 4 + TypeScript API Microservice
│   ├── prisma/
│   │   ├── migrations/
│   │   │   ├── 20261023120000_init/ # PostgreSQL initial DDL migration
│   │   │   └── migration_lock.toml  # Prisma PostgreSQL provider lock
│   │   ├── schema.prisma            # Active local development schema (SQLite)
│   │   └── schema.postgresql.prisma # Production PostgreSQL schema
│   ├── src/
│   │   ├── config/
│   │   │   └── env.ts               # Zod validated environment config with strict production checks
│   │   ├── middleware/
│   │   │   ├── auth.ts              # JWT verification & Request user augmentation
│   │   │   ├── errorHandler.ts      # Centralized error handler
│   │   │   └── validate.ts          # Zod schema validation middleware
│   │   ├── routes/
│   │   │   ├── analytics.routes.ts  # Dashboard aggregations & KPIs
│   │   │   ├── auth.routes.ts       # Register, Login, Logout, Me
│   │   │   ├── health.routes.ts     # Health checks & DB latency probing
│   │   │   ├── note.routes.ts       # Project technical notes CRUD
│   │   │   ├── project.routes.ts    # Project management & membership RBAC
│   │   │   └── task.routes.ts       # Task CRUD, Kanban status, comments
│   │   ├── utils/
│   │   │   ├── jwt.ts               # Token signing & verification
│   │   │   ├── password.ts          # Bcrypt hashing & verification
│   │   │   ├── prisma.ts            # Prisma client singleton & ping probe
│   │   │   └── response.ts          # Standardized JSON response helpers
│   │   ├── app.ts                   # Express application setup, Helmet & CORS
│   │   └── server.ts                # Server bootstrap & graceful shutdown
│   ├── tests/
│   │   ├── auth.test.ts             # Auth validation & security integration tests
│   │   └── health.test.ts           # Health endpoint tests
│   ├── Dockerfile                   # Multi-stage container build
│   ├── package.json                 # Backend dependencies & production scripts
│   └── tsconfig.json                # TypeScript NodeNext configuration
├── frontend/                        # React 19 + Vite 6 Single Page Application
│   ├── src/
│   │   ├── components/ui/           # Button, Card, Input, Modal, Badge primitives
│   │   ├── features/auth/           # AuthContext, ProtectedRoute, Login/Register forms
│   │   ├── layouts/                 # Header, Sidebar, AppLayout
│   │   ├── lib/api.ts               # Fetch client with token injection & VITE_API_URL support
│   │   ├── pages/                   # Dashboard, Projects, Kanban, Notes, Analytics
│   │   ├── App.tsx                  # Application routing & React Query client setup
│   │   ├── index.css                # Tailwind CSS v4 design tokens
│   │   └── main.tsx                 # Client entrypoint
│   ├── Dockerfile & nginx.conf      # Production NGINX web server container
│   ├── package.json                 # Frontend dependencies & scripts
│   └── vite.config.ts               # Vite bundler config with /api proxy
├── docs/                            # Deep-dive technical specifications
│   ├── api.md                       # Comprehensive REST API reference
│   ├── architecture.md              # System design & security architecture
│   ├── database.md                  # Database schema & index definitions
│   └── deployment.md                # Deployment guide
├── docker-compose.yml               # Container orchestration (Postgres + API + Web)
├── .env.example                     # Root environment variable template
├── .gitignore                       # Git exclusion rules (secrets, dist, node_modules, *.db)
└── package.json                     # Monorepo workspaces & root scripts
```

---

## Database Schema & Entity Relationships

The relational schema is defined with strict foreign keys, cascade delete rules, and composite indexes:

```mermaid
erDiagram
    User ||--o{ Project : "owns"
    User ||--o{ ProjectMembership : "holds"
    User ||--o{ Task : "creates"
    User ||--o{ Task : "assigned to"
    User ||--o{ Comment : "writes"
    User ||--o{ ProjectNote : "authors"
    User ||--o{ ActivityLog : "triggers"

    Project ||--o{ ProjectMembership : "has"
    Project ||--o{ Task : "contains"
    Project ||--o{ ProjectNote : "contains"
    Project ||--o{ ActivityLog : "logs"

    Task ||--o{ Comment : "has discussion"

    User {
        string id PK "UUID"
        string email UK "Unique lowercase"
        string passwordHash "Bcrypt hash"
        string name "Display name"
        string avatarUrl "Nullable"
        datetime createdAt
        datetime updatedAt
    }

    Project {
        string id PK "UUID"
        string name "Project name"
        string key UK "Uppercase code (e.g. DF, API)"
        string description "Nullable"
        string status "ACTIVE | ARCHIVED | COMPLETED"
        string ownerId FK "Users.id"
        datetime createdAt
        datetime updatedAt
    }

    ProjectMembership {
        string id PK "UUID"
        string projectId FK "Projects.id (Cascade)"
        string userId FK "Users.id (Cascade)"
        string role "OWNER | ADMIN | MEMBER"
        datetime joinedAt
    }

    Task {
        string id PK "UUID"
        string title "Task headline"
        string description "Nullable"
        string status "TODO | IN_PROGRESS | IN_REVIEW | DONE"
        string priority "LOW | MEDIUM | HIGH | CRITICAL"
        datetime dueDate "Nullable"
        int order "Sort order"
        string projectId FK "Projects.id (Cascade)"
        string creatorId FK "Users.id (Cascade)"
        string assigneeId FK "Users.id (SetNull)"
        datetime createdAt
        datetime updatedAt
    }

    Comment {
        string id PK "UUID"
        string content "Comment text"
        string taskId FK "Tasks.id (Cascade)"
        string authorId FK "Users.id (Cascade)"
        datetime createdAt
        datetime updatedAt
    }

    ProjectNote {
        string id PK "UUID"
        string title "Note title"
        string content "Markdown body"
        string projectId FK "Projects.id (Cascade)"
        string authorId FK "Users.id (Cascade)"
        datetime createdAt
        datetime updatedAt
    }

    ActivityLog {
        string id PK "UUID"
        string action "Event action name"
        string entityType "PROJECT | TASK | USER"
        string entityId "Entity UUID"
        string details "JSON metadata"
        string userId FK "Users.id"
        string projectId FK "Projects.id"
        datetime createdAt
    }
```

---

## Technology Stack

| Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | React | 19.0.0 | Component-driven UI library |
| **Frontend Bundler** | Vite | 6.2.0 | Next-generation frontend tooling |
| **Styling** | Tailwind CSS | 4.0.8 | Modern design tokens and utility styling |
| **Client State / Cache**| TanStack Query | 5.66.9 | Server cache, query invalidation, background re-fetching |
| **Icons** | Lucide React | 0.475.0 | Crisp, modern iconography |
| **Routing** | React Router | 7.2.0 | Declarative client-side routing & navigation |
| **Backend Runtime** | Node.js | v22 / v24 ESM | High-performance asynchronous JavaScript runtime |
| **Backend Framework** | Express | 4.21.2 | Lightweight, extensible REST API server |
| **Language** | TypeScript | 5.7.3 | Static typing, interfaces, and compiler checks |
| **ORM** | Prisma | 5.22.0 | Type-safe database queries & automated migrations |
| **Database** | PostgreSQL | 15 / 16 / 18 | ACID-compliant production relational database |
| **Security & Headers** | Helmet & CORS | 8.0 / 2.8 | Secure HTTP headers and origin enforcement |
| **Input Validation** | Zod | 3.24.2 | Strict schema validation for request payloads |
| **Password Hashing** | Bcrypt.js | 2.4.3 | Salted password encryption |
| **Authentication** | JSON Web Tokens| 9.0.2 | Cryptographic session tokens |
| **Testing** | Vitest & Supertest | 3.0 / 7.0 | Fast unit and integration test runner |

---

## Local Development Setup

### 1. Prerequisites
- **Node.js** v20+ (Node v22 or v24 recommended)
- **npm** v10+
- **Git**

### 2. Clone and Install
```powershell
# Clone the repository
git clone https://github.com/KiranKishore05/devflow.git
cd devflow

# Install workspace dependencies
npm install
```

### 3. Environment Setup
DevFlow includes zero-friction local development support with embedded SQLite, while reserving PostgreSQL for production:

```powershell
# In project root:
Copy-Item .env.example .env
Copy-Item backend\.env.example backend\.env
Copy-Item frontend\.env.example frontend\.env
```

Default development values in `backend/.env`:
```env
PORT=5001
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173
JWT_SECRET=devflow_secure_development_secret_key_32_characters_minimum
JWT_EXPIRES_IN=7d
DATABASE_URL="file:./dev.db"
```

### 4. Run the Dev Servers
```powershell
# Start both Backend and Frontend concurrently (or in two terminals):
npm run dev:backend
npm run dev:frontend
```
- **Backend API:** `http://localhost:5001`
- **Frontend App:** `http://localhost:5173`
- **Health Check:** `http://localhost:5001/api/health`

---

## Environment Configuration

| Variable | Target | Required | Description | Example / Default |
| :--- | :--- | :---: | :--- | :--- |
| `NODE_ENV` | Backend | **Yes** | Execution mode (`development`, `production`, `test`) | `production` |
| `PORT` | Backend | Optional | Port for the Express API server | `5000` (Render sets automatically) |
| `DATABASE_URL` | Backend | **Yes** | PostgreSQL connection string (supports SSL) | `postgresql://user:pass@host:5432/db?sslmode=require` |
| `CLIENT_ORIGIN` | Backend | **Yes** | Allowed frontend URL for CORS & cookies (supports comma-separated) | `https://devflow-app.vercel.app` |
| `JWT_SECRET` | Backend | **Yes** | Secret for signing auth tokens (>= 32 chars in production) | *(64-character random string)* |
| `JWT_EXPIRES_IN` | Backend | Optional | Token expiration lifespan | `7d` |
| `VITE_API_URL` | Frontend | Optional | Backend base URL for decoupled hosting | `https://devflow-api.onrender.com` |

> [!IMPORTANT]
> In production (`NODE_ENV=production`), `JWT_SECRET` is mandatory and must be at least 32 characters long. The server will safely refuse to boot if `JWT_SECRET` is missing or set to the development default.

---

## REST API Specification

All endpoints communicate using standard JSON: `application/json`. Authenticated routes require an `Authorization: Bearer <token>` header or a valid session cookie.

### Health Probe
- `GET /api/health` — Probes server uptime, memory usage, and live database latency (Public).

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Create a new developer account.
- `POST /api/auth/login` — Authenticate credentials and receive token.
- `POST /api/auth/logout` — Clear session cookies.
- `GET /api/auth/me` — Retrieve currently logged-in user profile (Authenticated).

### Project Management (`/api/projects`)
- `GET /api/projects` — List all projects accessible to the authenticated user.
- `POST /api/projects` — Create a new project (Assigns creator as `OWNER`).
- `GET /api/projects/:id` — Get project details, task count, notes count, and member list (BOLA guarded).
- `PATCH /api/projects/:id` — Update project metadata or status (Requires `OWNER` or `ADMIN`).
- `DELETE /api/projects/:id` — Delete project and all associated tasks/notes (Requires `OWNER`).
- `POST /api/projects/:id/members` — Invite/add a team member (Auto-provisions account if new).

### Task & Kanban Management (`/api/tasks`)
- `GET /api/tasks?projectId=&status=&priority=&search=` — Filterable task list across accessible projects.
- `POST /api/tasks` — Create task within a project.
- `PATCH /api/tasks/:id/status` — Instant status update for Kanban drag-and-drop transitions.
- `PATCH /api/tasks/:id` — Edit task title, description, priority, assignee, or due date.
- `DELETE /api/tasks/:id` — Remove task.
- `POST /api/tasks/:id/comments` — Post a discussion comment on a task card.

### Technical Runbooks & Notes (`/api/notes`)
- `GET /api/notes?projectId=&search=` — Retrieve technical runbooks for user projects.
- `POST /api/notes` — Create new markdown documentation note.
- `GET /api/notes/:id` — View note details.
- `PATCH /api/notes/:id` — Edit note title or markdown content.
- `DELETE /api/notes/:id` — Delete note.

### Analytics & Metrics (`/api/analytics`)
- `GET /api/analytics/dashboard` — Aggregates completion rates, overdue counters, status distributions, and recent activity logs.

---

## Automated Testing & Quality Checks

Run the verified test suites using standard npm scripts:

```powershell
# 1. Run Backend Unit & Integration Tests (Vitest)
npm run test:backend

# 2. Run Backend TypeScript Compilation Check
npm run build:backend

# 3. Run Frontend Lint (Oxlint)
npm --prefix frontend run lint

# 4. Run Frontend Production Bundle Build
npm run build:frontend

# 5. Full Monorepo Build
npm run build
```

---

## Production Deployment

DevFlow is optimized for decoupled cloud hosting with zero infrastructure maintenance:

```text
┌─────────────────────────────────┐       ┌─────────────────────────────────┐
│        Vercel (Frontend)        │       │         Render (Backend)        │
│  - Vite SPA Static CDN          │       │  - Express Node.js Service      │
│  - VITE_API_URL -> Render API   │ ────> │  - Prisma ORM 5                 │
└─────────────────────────────────┘       └────────────────┬────────────────┘
                                                           │
                                                           ▼
                                          ┌─────────────────────────────────┐
                                          │   Managed PostgreSQL Database   │
                                          │   (Neon / Supabase / Render)    │
                                          └─────────────────────────────────┘
```

### 1. Managed PostgreSQL Setup
1. Create a PostgreSQL instance on [Neon](https://neon.tech), [Supabase](https://supabase.com), or [Render PostgreSQL](https://render.com).
2. Copy the connection string with SSL mode enabled (`?sslmode=require`).

### 2. Backend Deployment on Render
1. Create a **New Web Service** pointing to repository `KiranKishore05/devflow`.
2. Configure settings:
   - **Root Directory:** `backend`
   - **Environment:** `Node`
   - **Build Command:**
     ```bash
     npm install && npm run prisma:generate:pg && npm run prisma:deploy:pg && npm run build
     ```
   - **Start Command:**
     ```bash
     npm run start
     ```
3. Set Environment Variables:
   - `NODE_ENV`: `production`
   - `DATABASE_URL`: *(Your Managed PostgreSQL Connection String)*
   - `CLIENT_ORIGIN`: `https://your-devflow-app.vercel.app`
   - `JWT_SECRET`: *(Secure random 32+ character string)*
   - `JWT_EXPIRES_IN`: `7d`

### 3. Frontend Deployment on Vercel
1. Import repository `KiranKishore05/devflow` into **Vercel**.
2. Configure settings:
   - **Framework Preset:** `Vite`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Set Environment Variable:
   - `VITE_API_URL`: `https://your-devflow-api.onrender.com`

---

## Security Model

1. **Strict CORS Policy:** In production, cross-origin access is strictly restricted to explicitly declared domains. Legitimate server-to-server health checks without origin headers are safely accepted.
2. **Mandatory Production Cryptography:** `JWT_SECRET` must be set, minimum 32 characters, and cannot match the development fallback.
3. **Broken Object-Level Authorization (BOLA):** Every database mutation and query checks project ownership or active membership, preventing horizontal privilege escalation.
4. **Zero Tracked Secrets:** `.gitignore` actively prevents `.env`, local database files (`*.db`), and build artifacts from ever entering git history.

---

## License

ISC License. Built for developer productivity.

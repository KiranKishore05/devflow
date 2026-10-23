# DevFlow — Complete Developer Productivity Platform

DevFlow is a modern full-stack developer productivity workspace where individual engineers and small teams manage software projects, Kanban tasks, bugs, deadlines, technical runbooks, and engineering metrics in one unified environment.

---

## Key Features

- **Authentication & Security:** Secure registration, login, logout, password hashing with bcrypt, JWT authorization tokens, HTTP-only cookies, rate limiting, and Broken Object-Level Authorization (BOLA) safeguards.
- **Project Management:** Create, view, update, archive, and delete software projects. Includes unique project keys, role-based memberships (Owner, Admin, Member), and team invitations.
- **Interactive Kanban Board:** 4-column drag-and-drop workflow (`To Do`, `In Progress`, `In Review`, `Done`), instant status transition buttons, priority badges (`Low`, `Medium`, `High`, `Critical`), due date warnings with overdue indicators, and discussion comment threads.
- **Technical Notes & Runbooks:** Markdown-friendly documentation manager to preserve architecture decision records, API payloads, and setup runbooks directly within project scopes.
- **Quantitative Analytics & Dashboard:** Real-time KPI cards (total projects, completion rate, active tasks, overdue items), task distribution charts by status and priority, and audit activity feeds.
- **Database-Aware Health Checks:** Dedicated health probe (`/api/health`) reporting system uptime, memory usage, and PostgreSQL connectivity status honestly.

---

## Technology Stack

- **Frontend:** React 19, TypeScript, Vite 6, Tailwind CSS v4, React Router v7, TanStack Query v5, Lucide React icons.
- **Backend:** Node.js v22/v24 ESM, Express 4, TypeScript, Zod validation, Helmet security headers, CORS, Cookie Parser.
- **Database:** PostgreSQL, Prisma ORM 5 with automated SQL migrations.
- **Testing & Tooling:** Vitest, Supertest, Docker, Docker Compose, GitHub Actions CI.

---

## Getting Started on Windows (PowerShell)

### 1. Prerequisites
- **Node.js** v20+ (Node v24 is installed and verified)
- **npm** v10+ (npm v11 is installed and verified)
- **Git** (Git v2.50 is verified)
- **PostgreSQL** 13/18 (installed locally) OR **Docker** for containerized database

### 2. Environment Setup
Copy the environment templates in the project root and backend:
```powershell
# In project root:
Copy-Item .env.example .env
Copy-Item backend\.env.example backend\.env
```

Edit `backend/.env` with your desired configuration:
```env
PORT=5000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173
JWT_SECRET=your_secure_random_jwt_secret_at_least_32_characters
DATABASE_URL=postgresql://devflow_user:password@localhost:5432/devflow_db?schema=public
```

### 3. Install Dependencies & Build
Install all workspace dependencies:
```powershell
# Root dependencies and subprojects
npm install
npm --prefix frontend install
npm --prefix backend install

# Generate Prisma Client
npm --prefix backend run prisma:generate

# Build both applications
npm run build
```

### 4. Running the Applications

#### Option A: Running in Two Terminal Windows
Terminal 1 (Backend API):
```powershell
cd d:\devflow\backend
npm run dev
# Starts API server on http://localhost:5000
```

Terminal 2 (Frontend React App):
```powershell
cd d:\devflow\frontend
npm run dev
# Starts Vite dev server on http://localhost:5173
```

#### Option B: Running with Docker Compose
If you prefer running isolated containers:
```powershell
docker compose up -d
```
Access the application at `http://localhost:5173`.

---

## Automated Testing & Verification

Run backend unit and integration tests:
```powershell
npm test
```
Or directly in the backend folder:
```powershell
cd d:\devflow\backend
npm test
```

Tests verify:
- Health check responses and database connection reporting.
- 404 route handling.
- Registration input validation and email format checks.
- Password minimum length enforcement (8+ characters).
- Authentication requirement on protected endpoints.
- Broken object-level authorization rejection.

---

## Database Configuration & Recovery

Refer to [docs/database.md](docs/database.md) for full database architecture and host PostgreSQL 13 vs 18 diagnosis.

- **PostgreSQL 18** runs on port `5432`.
- **PostgreSQL 13** runs on port `5433`.
- Both require `scram-sha-256` password authentication.

To run migrations once credentials are configured:
```powershell
cd backend
npm run prisma:migrate
```

---

## Documentation Links

- [System Architecture](docs/architecture.md)
- [REST API Specification](docs/api.md)
- [Database Schema & Migrations](docs/database.md)
- [Deployment Guide](docs/deployment.md)

---

## License

ISC License. Built for developer productivity.

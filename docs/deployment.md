# DevFlow Deployment Guide

## 1. Production Build & Validation

Before deploying, ensure that both backend and frontend build cleanly without warnings or errors.

```powershell
# In project root:
npm run build
```
This triggers:
1. `npm --prefix backend run build` -> compiles TypeScript to `backend/dist`.
2. `npm --prefix frontend run build` -> compiles React Vite bundle to `frontend/dist`.

---

## 2. Environment Variables Matrix

| Variable | Environment | Required | Description | Example |
|---|---|---|---|---|
| `PORT` | Backend | Optional | Port for Express API | `5000` |
| `NODE_ENV` | Backend | Yes | Execution environment | `production` |
| `CLIENT_ORIGIN` | Backend | Yes | Allowed frontend origin for CORS | `https://devflow.vercel.app` |
| `JWT_SECRET` | Backend | Yes | 32+ character key for signing tokens | `secret_key_random_string_32_chars` |
| `JWT_EXPIRES_IN` | Backend | Optional | Token lifetime | `7d` |
| `DATABASE_URL` | Backend | Yes | Connection string for PostgreSQL | `postgresql://user:pass@host:5432/db?sslmode=require` |
| `VITE_API_URL` | Frontend | Optional | Base URL if frontend is on separate domain | `/api` or `https://api.devflow.app` |

---

## 3. Frontend Deployment (Vercel)

1. Connect your Git repository to **Vercel**.
2. Configure project settings:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Configure Rewrites in `vercel.json` for SPA routing:
```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "https://your-backend-url.onrender.com/api/$1" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## 4. Backend Deployment (Render)

1. Create a **New Web Service** on [Render](https://render.com).
2. Connect your Git repository.
3. Configure:
   - **Root Directory:** `backend`
   - **Environment:** Node
   - **Build Command:** `npm ci && npm run prisma:generate && npm run build`
   - **Start Command:** `npm run prisma:deploy && node dist/server.js`
4. Set Environment Variables:
   - `NODE_ENV`: `production`
   - `CLIENT_ORIGIN`: `https://your-frontend-domain.vercel.app`
   - `JWT_SECRET`: Generate a random 64-char string
   - `DATABASE_URL`: Your managed PostgreSQL URL

---

## 5. Managed PostgreSQL Setup (Neon / Supabase / Railway)

1. Provision a PostgreSQL 15+ database instance.
2. Obtain the connection string:
   `postgresql://postgres:[PASSWORD]@[HOST]:5432/[DB]?sslmode=require`
3. Run initial schema migrations:
   ```powershell
   cd backend
   npx prisma migrate deploy
   ```

---

## 6. Docker & Docker Compose Deployment

To deploy the entire stack locally or on a VPS (Ubuntu / Debian):
```bash
docker compose up -d --build
```
This launches:
- `devflow-postgres` on port `5434`
- `devflow-backend` on port `5000`
- `devflow-frontend` on port `5173` (served via Nginx)

Health check validation:
```bash
curl http://localhost:5000/api/health
```

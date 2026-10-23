# DevFlow Database Architecture & PostgreSQL Configuration

## 1. Schema Design

DevFlow utilizes a normalized relational schema managed with Prisma ORM and automated migrations.

```
+--------------------+        +-------------------------+
|       users        |<------>|   project_memberships   |
+--------------------+   1:N  +-------------------------+
| id (PK)            |             | id (PK)            |
| email (Unique)     |             | projectId (FK)     |
| passwordHash       |             | userId (FK)        |
| name               |             | role               |
| avatarUrl          |             | joinedAt           |
+--------------------+             +-------------------------+
         |                                     |
         | 1:N                                 |
         v                                     v
+--------------------+   1:N       +-------------------------+
|      projects      |<----------->|          tasks          |
+--------------------+             +-------------------------+
| id (PK)            |             | id (PK)                 |
| name               |             | title                   |
| key (Unique)       |             | description             |
| description        |             | status                  |
| status             |             | priority                |
| ownerId (FK)       |             | dueDate                 |
+--------------------+             | projectId (FK)          |
         |                         | creatorId (FK)          |
         | 1:N                     | assigneeId (FK)         |
         v                         +-------------------------+
+--------------------+                         |
|   project_notes    |                         | 1:N
+--------------------+                         v
| id (PK)            |             +-------------------------+
| title              |             |        comments         |
| content            |             +-------------------------+
| projectId (FK)     |             | id (PK)                 |
| authorId (FK)      |             | content                 |
| authorId (FK)      |             | taskId (FK)             |
+--------------------+             | authorId (FK)           |
                                   +-------------------------+
```

---

## 2. Table Specifications

### `users`
- `id` (TEXT, PK, UUID)
- `email` (TEXT, Unique, indexed)
- `passwordHash` (TEXT, Bcrypt)
- `name` (TEXT)
- `avatarUrl` (TEXT, Nullable)
- `createdAt` / `updatedAt` (TIMESTAMP)

### `projects`
- `id` (TEXT, PK, UUID)
- `name` (TEXT)
- `key` (TEXT, Unique, indexed) — e.g. "DF", "API"
- `description` (TEXT, Nullable)
- `status` (TEXT, Default 'ACTIVE', indexed)
- `ownerId` (TEXT, FK -> `users.id` ON DELETE CASCADE)

### `project_memberships`
- `id` (TEXT, PK, UUID)
- `projectId` (TEXT, FK -> `projects.id` ON DELETE CASCADE)
- `userId` (TEXT, FK -> `users.id` ON DELETE CASCADE)
- `role` (TEXT, Default 'MEMBER') — `OWNER`, `ADMIN`, `MEMBER`
- Unique constraint: `(projectId, userId)`

### `tasks`
- `id` (TEXT, PK, UUID)
- `title` (TEXT)
- `description` (TEXT, Nullable)
- `status` (TEXT, Default 'TODO', indexed) — `TODO`, `IN_PROGRESS`, `IN_REVIEW`, `DONE`
- `priority` (TEXT, Default 'MEDIUM', indexed) — `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`
- `dueDate` (TIMESTAMP, Nullable, indexed)
- `order` (INTEGER, Default 0)
- `projectId` (TEXT, FK -> `projects.id` ON DELETE CASCADE)
- `creatorId` (TEXT, FK -> `users.id` ON DELETE CASCADE)
- `assigneeId` (TEXT, Nullable, FK -> `users.id` ON DELETE SET NULL)

### `comments`
- `id` (TEXT, PK, UUID)
- `content` (TEXT)
- `taskId` (TEXT, FK -> `tasks.id` ON DELETE CASCADE)
- `authorId` (TEXT, FK -> `users.id` ON DELETE CASCADE)

### `project_notes`
- `id` (TEXT, PK, UUID)
- `title` (TEXT)
- `content` (TEXT)
- `projectId` (TEXT, FK -> `projects.id` ON DELETE CASCADE)
- `authorId` (TEXT, FK -> `users.id` ON DELETE CASCADE)

### `activity_logs`
- `id` (TEXT, PK, UUID)
- `action` (TEXT)
- `entityType` (TEXT)
- `entityId` (TEXT)
- `details` (TEXT, Nullable, JSON string)
- `userId` (TEXT, FK -> `users.id` ON DELETE CASCADE)
- `projectId` (TEXT, Nullable, FK -> `projects.id` ON DELETE CASCADE)
- `createdAt` (TIMESTAMP, indexed)

---

## 3. Host PostgreSQL Inspection Findings

During environment inspection (Stage 1):
1. **PostgreSQL 18:**
   - Windows Service: `postgresql-x64-18` (Running)
   - Configuration Port: `5432`
   - Data Directory: `C:\Program Files\PostgreSQL\18\data`
   - Active Authentication: `scram-sha-256` for loopback `127.0.0.1/32`
   - Backup File: Verified `%USERPROFILE%\Desktop\pg_hba.conf.backup` is identical to active `pg_hba.conf`.
   - Access: Requires valid password credentials.

2. **PostgreSQL 13:**
   - Windows Service: `postgresql-x64-13` (Running)
   - Configuration Port: `5433`
   - Data Directory: `C:\Program Files\PostgreSQL\13\data`
   - Active Authentication: `scram-sha-256`

---

## 4. Safe PostgreSQL Credential Recovery Procedure

If the superuser password for PostgreSQL 18 is unknown, here is the safe, non-destructive administrative procedure:

### Option A: Safe Recovery via Administrative Command Prompt

1. Open **PowerShell as Administrator**.
2. Run PostgreSQL's built-in utility in single-user mode or use an administrative password reset script:
```powershell
# Stop PostgreSQL 18 service safely
Stop-Service postgresql-x64-18

# Edit "C:\Program Files\PostgreSQL\18\data\pg_hba.conf" temporarily
# Change the local 127.0.0.1 scram-sha-256 line to:
# host all all 127.0.0.1/32 trust

# Start the service
Start-Service postgresql-x64-18

# Connect and set a new password for devflow_user (least privilege)
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -h 127.0.0.1 -p 5432 -c "CREATE USER devflow_user WITH PASSWORD 'YourSecurePasswordHere';"
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -h 127.0.0.1 -p 5432 -c "CREATE DATABASE devflow_db OWNER devflow_user;"
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -h 127.0.0.1 -p 5432 -c "GRANT ALL PRIVILEGES ON DATABASE devflow_db TO devflow_user;"

# RESTORE original pg_hba.conf from desktop backup immediately
Copy-Item "$env:USERPROFILE\Desktop\pg_hba.conf.backup" "C:\Program Files\PostgreSQL\18\data\pg_hba.conf" -Force

# Restart service to re-lock with scram-sha-256
Restart-Service postgresql-x64-18
```

3. Update `backend/.env`:
```env
DATABASE_URL=postgresql://devflow_user:YourSecurePasswordHere@localhost:5432/devflow_db?schema=public
```

4. Run migrations:
```powershell
cd d:\devflow\backend
npm run prisma:migrate
```

### Option B: Zero-Friction Isolated Docker Database

If you do not want to alter local Windows PostgreSQL configurations:
```powershell
docker compose up -d postgres
```
This boots an isolated PostgreSQL 16 database on port `5434`, keeping local 13 and 18 instances completely untouched.
Set `DATABASE_URL` in `backend/.env`:
```env
DATABASE_URL=postgresql://devflow_user:devflow_secure_password_123@localhost:5434/devflow_db?schema=public
```

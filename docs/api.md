# DevFlow REST API Specification

Base URL: `/api` (or `http://localhost:5000/api`)

All requests and responses use `application/json`.
Authenticated requests require the header: `Authorization: Bearer <token>` or valid session cookie.

---

## 1. Response Structure

### Success Response
```json
{
  "success": true,
  "message": "Optional descriptive message",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error description",
  "details": [ ... ]
}
```

---

## 2. Health Check

### `GET /api/health`
Checks service health and probes live database connection status.
- **Access:** Public
- **Response (200 OK or 503 Service Unavailable):**
```json
{
  "status": "healthy",
  "uptime": 124.5,
  "timestamp": "2026-10-23T12:00:00.000Z",
  "database": {
    "status": "connected",
    "latencyMs": 4
  },
  "system": {
    "nodeVersion": "v22.13.0"
  }
}
```

---

## 3. Authentication Endpoints

### `POST /api/auth/register`
Creates a new developer account.
- **Body:**
```json
{
  "name": "Jane Developer",
  "email": "jane@company.com",
  "password": "SecurePassword123!"
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "jane@company.com",
      "name": "Jane Developer",
      "createdAt": "2026-10-23T12:00:00.000Z"
    },
    "token": "eyJhbGciOi..."
  }
}
```

### `POST /api/auth/login`
Authenticates existing developer credentials.
- **Body:**
```json
{
  "email": "jane@company.com",
  "password": "SecurePassword123!"
}
```
- **Response (200 OK):** User object and JWT token.

### `POST /api/auth/logout`
Clears session cookie.
- **Response (200 OK):** `{ "success": true }`

### `GET /api/auth/me`
Retrieves currently authenticated user profile.
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):** User profile object.

---

## 4. Projects Endpoints

### `GET /api/projects`
List projects owned by or shared with the authenticated user.
- **Query Parameters:**
  - `status`: `ACTIVE`, `ARCHIVED`, `COMPLETED`, or `ALL` (default)
  - `limit`: number of items to return
- **Response (200 OK):** Array of Project objects with task/note/member counts.

### `POST /api/projects`
Create a new project workspace.
- **Body:**
```json
{
  "name": "Cloud API Gateway",
  "key": "GW",
  "description": "High throughput routing proxy"
}
```
- **Response (201 Created):** Newly created project.

### `GET /api/projects/:id`
Get full project details with members and activity history.
- **Response (200 OK):** Project with owners and memberships.

### `PATCH /api/projects/:id`
Update project title, description, or status (Requires OWNER or ADMIN).
- **Body:** `{ "name": "New Name", "status": "ARCHIVED" }`

### `DELETE /api/projects/:id`
Permanently delete project (Requires OWNER).
- **Response (200 OK):** `{ "success": true }`

### `POST /api/projects/:id/members`
Add a team member to a project.
- **Body:**
```json
{
  "email": "teammate@company.com",
  "role": "MEMBER"
}
```

---

## 5. Tasks & Kanban Endpoints

### `GET /api/tasks`
Retrieve tasks scoped to user's accessible projects.
- **Query Parameters:**
  - `projectId`: filter by project UUID
  - `status`: `TODO`, `IN_PROGRESS`, `IN_REVIEW`, `DONE`
  - `priority`: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`
  - `search`: search substring in title/description
- **Response (200 OK):** Array of Task objects with comments.

### `POST /api/tasks`
Create a task in a project.
- **Body:**
```json
{
  "title": "Build OAuth 2.0 PKCE flow",
  "description": "Follow RFC 7636 specs",
  "status": "TODO",
  "priority": "HIGH",
  "dueDate": "2026-11-01T00:00:00.000Z",
  "projectId": "project-uuid"
}
```

### `PATCH /api/tasks/:id/status`
Fast status transition (Kanban drag-and-drop).
- **Body:** `{ "status": "IN_PROGRESS" }`
- **Response (200 OK):** Updated task.

### `PATCH /api/tasks/:id`
Update task title, description, priority, assignee, due date.

### `DELETE /api/tasks/:id`
Delete task.

### `POST /api/tasks/:id/comments`
Add a discussion comment to a task.
- **Body:** `{ "content": "PR is ready for review #42" }`

---

## 6. Technical Notes Endpoints

### `GET /api/notes`
List technical notes.
- **Query Parameters:** `projectId`, `search`.

### `POST /api/notes`
Create technical note or runbook.
- **Body:**
```json
{
  "title": "PostgreSQL Failover Runbook",
  "content": "### Step 1: Promote Replica\nRun `pg_ctl promote`...",
  "projectId": "project-uuid"
}
```

### `PUT /api/notes/:id`
Update note title or content.

### `DELETE /api/notes/:id`
Delete technical note.

---

## 7. Analytics Endpoints

### `GET /api/analytics/dashboard`
Aggregated quantitative KPIs derived from database tables:
```json
{
  "totalProjects": 4,
  "totalTasks": 28,
  "completedTasks": 18,
  "pendingTasks": 10,
  "overdueTasks": 2,
  "completionRate": 64,
  "tasksByStatus": {
    "TODO": 4,
    "IN_PROGRESS": 4,
    "IN_REVIEW": 2,
    "DONE": 18
  },
  "tasksByPriority": {
    "LOW": 6,
    "MEDIUM": 12,
    "HIGH": 8,
    "CRITICAL": 2
  },
  "recentActivities": [ ... ]
}
```

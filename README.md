# Team Task Manager

Team Task Manager is a full-stack workspace for planning projects, assigning tasks, and tracking team delivery. It uses a React frontend, an Express API, JWT authentication, and a local NeDB datastore so it can run without an external database.

The interface has been refreshed with a modern futuristic dashboard style: electric accent colors, glass-like panels, responsive layouts, and clearer task/status visibility across desktop and mobile screens.

## What It Does

- Account signup and login with JWT sessions.
- Single workspace admin mode: the first account becomes the only global admin, and every later signup becomes a member.
- Project creation, editing, deletion, and member management.
- Task assignment with priority, due dates, status changes, and project-level access checks.
- Dashboard summaries for projects, workload, overdue tasks, and recent activity.
- Responsive futuristic dark interface for desktop and mobile use.

## Tech Stack

| Area | Tools |
| --- | --- |
| Frontend | React 18, React Router, Axios, react-toastify |
| Backend | Node.js, Express |
| Database | NeDB file datastore |
| Auth | JSON Web Tokens, bcryptjs |
| Validation | express-validator |

## Project Layout

```text
backend/
  config/db.js
  controllers/
  middleware/
  models/
  routes/
  server.js

frontend/
  public/
  src/
    components/
    context/
    pages/
    services/

package.json
nixpacks.toml
railway.json
```

## Local Setup

Install dependencies:

```bash
npm run install-all
```

Create `backend/.env`:

```env
PORT=5000
JWT_SECRET=replace-this-with-a-strong-secret
JWT_EXPIRES_IN=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

Run the backend:

```bash
npm run dev --prefix backend
```

Run the frontend in a second terminal:

```bash
npm start --prefix frontend
```

The frontend runs on `http://localhost:3000` and proxies API calls to `http://localhost:5000`.

## Admin Rule

Team Task Manager intentionally allows only one global admin.

- If no admin exists, the next signup becomes the workspace admin.
- If an admin already exists, signup creates a member account.
- If old data contains more than one admin, the server keeps the earliest admin and demotes duplicate admins to members on startup.

Per-project admin roles still exist separately for project-level management.

## API Overview

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/api/auth/setup-status` | Public | Check whether the workspace admin already exists |
| POST | `/api/auth/signup` | Public | Create an account |
| POST | `/api/auth/login` | Public | Login and receive a token |
| GET | `/api/auth/me` | Token | Get the current user |
| PUT | `/api/auth/me` | Token | Update profile name |
| GET | `/api/auth/users` | Admin | List users |
| GET | `/api/projects` | Token | List accessible projects |
| POST | `/api/projects` | Token | Create a project |
| GET | `/api/dashboard` | Token | Load dashboard data |

Protected endpoints require:

```http
Authorization: Bearer <token>
```

## Deployment Notes

The repository can run as one service: Express serves the API and, in production, the React build.

Build:

```bash
npm run build
```

Start:

```bash
npm start
```

For Railway, set:

```env
JWT_SECRET=replace-this-with-a-strong-secret
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain
```

`FRONTEND_URL` can contain multiple comma-separated frontend domains. The backend also accepts `ALLOWED_ORIGINS` and `CLIENT_URL`, so any one of those names can be used in Railway variables.

If the frontend is deployed as a separate service/site, build it with:

```env
REACT_APP_API_URL=https://your-railway-backend-domain/api
```

If you deploy this repository as one Railway service, Express serves the React build and the frontend can keep the default `/api` base URL. If you need persistent NeDB data, attach storage for `backend/data`.

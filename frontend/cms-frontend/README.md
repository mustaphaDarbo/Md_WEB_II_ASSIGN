# CmsFrontend

Angular frontend for the Dynamic Role-Based CMS (ContentFlow).

## Requirements

- Node.js 18+ and npm
- Backend API running (default: http://localhost:5001)

## Setup

Install dependencies:

```bash
cd frontend/cms-frontend
npm install
```

Run development server:

```bash
npm start
# or
ng serve --open
```

App will be available at `http://localhost:4200` by default.

## Configuration

API base URLs are configured directly in the service files under `src/app/services/` (default `http://localhost:5001/api`). Update these if your backend runs on a different host/port.

## Key Features

- JWT authentication (access + refresh tokens)
- HTTP interceptor that attaches access token and attempts refresh on 401
- Route guards: `AuthGuard` and `PermissionGuard`
- Dynamic sidebar and topbar based on logged-in user
- Articles module: list, create, edit, publish/unpublish
- Users & Roles management (SuperAdmin-only)
- Access Matrix page displays role-permission mapping (fetched from backend)

## Notes & Security

- Registration should be controlled by SuperAdmin; public registration is not intended.
- Tokens are stored in `localStorage` in this demo; consider a more secure storage strategy for production.

## Next Steps / TODO

- Improve client-side form validation and file/image upload for articles
- Add unit and e2e tests
- Centralize API base URL into environment files

## Backend Endpoints Expected

- `POST /api/auth/login` — login
- `POST /api/auth/refresh-token` — refresh
- `POST /api/auth/logout` — logout
- `GET/POST/PUT/DELETE /api/articles` — articles
- `GET/POST/PUT/DELETE /api/users` — users management
- `GET/POST /api/roles` — roles & permissions

For full frontend implementation details, see source under `src/app`.

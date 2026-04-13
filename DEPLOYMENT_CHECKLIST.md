# DEPLOYMENT_CHECKLIST.md

## 1. Pre-Deployment
- Verify required environment variables from `backend/.env.example` and `frontend/.env.example`.
- Confirm MySQL connectivity and target schema readiness.
- If upgrading from older releases, run DB migration script:
  - `mysql -h <db-host> -u <db-user> -p <db-name> < backend/sql/migrations/V20260413__drop_admin_settings_viewer_project_creation_allowed.sql`
- Run full release checks:
  - `./release-check.ps1`
- Run release packaging:
  - `./release-package.ps1`

## 2. Bundle Verification
- Confirm release bundle directory exists under `release/`.
- Verify the following files are present:
  - `backend/<backend-jar>.jar`
  - `backend/.env.example`
  - `frontend/.env.example`
  - `frontend/dist/*`
  - `release-manifest.txt`

## 3. Backend Deployment
- Copy bundled backend jar and runtime env file to target host.
- Set production `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`, `CORS_ALLOWED_ORIGINS`.
- Start backend process with Java 21+:
  - `java -jar <backend-jar>.jar`
- Validate:
  - `GET /api/health`

## 4. Frontend Deployment
- Upload bundled `frontend/dist` to static hosting path.
- Set `VITE_API_BASE_URL` to production backend URL.
- Validate dashboard and authenticated routes load correctly.

## 5. Post-Deployment Smoke
- Signup/Login flow works.
- Project list/create/edit/delete works.
- Task board create and status update works.
- Documents, meetings, AI endpoints return expected responses.
- Artifact upload/download/delete works.
- Optional API performance baseline:
  - `./api-performance-check.ps1 -BaseUrl http://<backend-host>:<port>`
  - or local one-shot runner: `./run-performance-with-backend.ps1 -DbUsername <user> -DbPassword <password>`

## 6. Rollback Plan
- Keep previous backend jar and frontend dist snapshot.
- If critical issue is found:
  - Roll back backend to previous jar.
  - Roll back frontend static files to previous dist.
  - Re-run health check and critical API smoke checks.

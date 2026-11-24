# EduSphere — Learning Management Platform

A runnable, integrated educational LMS starter implementing the core workflows and engineering evidence for the 15-assessment brief. It includes a Next.js/TypeScript frontend, Express REST API, PostgreSQL schema, FastAPI grading/analytics service, Redis/BullMQ worker, Docker Compose, tests, OpenAPI, Postman collection, and GitHub Actions.

> This is an educational reference implementation. External video, email, calendar, and payment integrations are sandbox/mock adapters and are explicitly labelled. Review security settings and replace development secrets before deployment.

## Architecture

- **Next.js** (`apps/web`): role-aware dashboard and course/lesson/assessment views.
- **Express** (`services/api`): authoritative business API, authentication, RBAC, course hierarchy, enrollment, progress, attempts, submissions, grading, certificates.
- **PostgreSQL**: source of truth; schema and seed script in `services/api/sql`.
- **FastAPI** (`services/learning`): deterministic MCQ grading, rubric aggregation, CSV validation, completion/cohort analytics.
- **Redis + BullMQ** (`services/worker`): retry-safe notification job example.
- **Docker Compose**: reproducible local stack.

## Quick start

Requirements: Docker Desktop with Compose.

1. Copy `.env.example` to `.env`.
2. Run `docker compose up --build`.
3. Open:
   - Web: http://localhost:3000
   - Express API: http://localhost:4000/health
   - Swagger/OpenAPI: http://localhost:4000/docs
   - FastAPI docs: http://localhost:8000/docs
4. Demo accounts (seeded):
   - Admin: `admin@edusphere.local` / `Password123!`
   - Instructor: `instructor@edusphere.local` / `Password123!`
   - Learner: `learner@edusphere.local` / `Password123!`

The API uses JWT access tokens for this demo. Change `JWT_SECRET` and all demo passwords for any non-local deployment.

## Local development

### API
```bash
cd services/api
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

### Python service
```bash
cd services/learning
python -m venv .venv
# activate the environment, then:
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Web
```bash
cd apps/web
npm install
npm run dev
```

## Assessment mapping

| # | Assessment | Implementation/evidence |
|---|---|---|
| 01 | Learner/author frontend | `apps/web` responsive role-aware UI |
| 02 | Backend APIs | `services/api/src/routes` |
| 03 | Learning data model | PostgreSQL schema, constraints, indexes |
| 04 | Authorization | JWT + role and resource ownership middleware |
| 05 | Python utilities | deterministic grading, rubric and CSV endpoints |
| 06 | FastAPI analytics | progress, completion and at-risk endpoints |
| 07 | Progress engine | prerequisite and attempt-limit checks |
| 08 | Integrations | sandbox adapters for video, storage, email/calendar, payments |
| 09 | Docker | root `Dockerfile`s and `docker-compose.yml` |
| 10 | Governance | content versions, audit log, branch/PR guidance |
| 11 | CI/CD | `.github/workflows/ci.yml` |
| 12 | Workflow testing | API and Python regression tests |
| 13 | API docs | `/docs`, `openapi.json`, `postman_collection.json` |
| 14 | Deployment | `docs/DEPLOYMENT.md`, HTTPS/reverse proxy guidance |
| 15 | Incident simulation | `docs/INCIDENTS.md`, audit events and regression tests |

## Important limitations

- The application is a functional MVP/reference implementation, not a certified production LMS.
- Video playback, object storage, email/calendar, and payment are adapter/sandbox demonstrations. No real payment is processed.
- Analytics use synthetic/demo records and transparent rules.
- Production deployment requires managed secrets, HTTPS, private database networking, backups, monitoring, rate limiting, refresh-token rotation, and a security review.
- The demo JWT flow is intentionally compact. Do not expose it publicly with the seeded credentials.

## Tests

```bash
cd services/api && npm test
cd services/learning && pytest -q
```

## Repository workflow

Use feature branches and reviewed pull requests. Keep `main` protected, require CI, review SQL migrations, and never commit `.env`, credentials, learner personal data, or production exports.

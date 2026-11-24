# Deployment runbook

1. Provision a cloud VM or managed container platform. Place PostgreSQL in a private network; do not expose port 5432 publicly.
2. Configure managed secrets for `DATABASE_URL`, `JWT_SECRET`, Redis credentials and integration credentials. Never deploy `.env.example` values.
3. Build/publish API, web, worker and learning-service images through CI. Pin image tags by immutable digest for releases.
4. Configure a reverse proxy (Caddy/Nginx/managed ingress) for HTTPS and route `/` to web and `/api` to API. Set strict CORS origins.
5. Use object storage with private buckets and short-lived signed URLs for lesson attachments. Configure video provider webhooks with signature verification and idempotency keys before enabling production use.
6. Run migrations as a one-off release job, then deploy services with readiness probes and graceful shutdown.
7. Schedule encrypted database backups. Perform a restore drill and record the result; a backup that has never been restored is unverified.
8. Monitor request rate, error rate, latency, queue depth, failed jobs, DB connections and disk capacity. Alert on sustained failures.
9. Roll back by redeploying the previous immutable image and applying a forward-fix migration; avoid destructive schema rollback during active traffic.

Production hardening still required: refresh-token rotation/revocation, CSRF strategy if cookie sessions are introduced, MFA for administrators, password reset flow, stronger audit coverage, secrets rotation, dependency scanning, rate-limit tuning, and external integration verification.

# Security notes

- All business routes require JWT except login and health.
- Role checks are server-side; learners cannot grade submissions or create courses.
- Lesson completion checks active enrollment and prerequisites in the API.
- Assessment attempts check enrollment and attempt count under a transaction/row lock.
- Certificate issuance checks enrollment ownership and lesson completion in a transaction.
- Inputs are validated with Zod/Pydantic; request size is capped and rate limiting enabled.
- Use synthetic learner data only.

Before production: implement refresh/revocation, password reset, MFA, CSRF protection for cookie auth, ownership scoping for every instructor operation, webhook signature verification, idempotency key persistence, security headers/CORS allowlist, secret manager, vulnerability scanning and formal penetration testing.

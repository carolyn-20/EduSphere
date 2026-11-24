# Assessment 15 — incident simulation and RCA template

Use synthetic data only. For each drill: reproduce, capture request ID and timestamps, inspect structured logs and relevant rows, identify root cause, patch, add regression test, verify recovery, and document prevention.

## Drill A: duplicate assessment attempt
- Reproduce by sending concurrent attempt submissions at the configured limit.
- Inspect `attempts` by assessment and learner.
- Current control: transaction + assessment row lock + count-before-insert.
- Regression: parallel requests should never exceed `max_attempts`.

## Drill B: incorrect grade
- Recompute from immutable answer key and submitted answers using `/grade/mcq`.
- Compare rubric weights and scores using `/grade/rubric`.
- Record correction in audit history in a production extension; never silently overwrite a grade.

## Drill C: progress desynchronization
- Compare `lesson_progress` with enrollment and lesson hierarchy.
- Current control: unique `(enrollment_id, lesson_id)` and idempotent upsert.
- Regression: repeated completion request creates one progress row.

## Drill D: unauthorized certificate
- Attempt certificate issuance for another learner or incomplete course.
- Current control: ownership check and completion check inside transaction.
- Regression: unauthorized and incomplete issuance returns 403/409.

## Drill E: broken video access
- Check provider status, signed URL expiry, object permissions and webhook delivery.
- Do not make buckets public; retry transient provider failures with bounded backoff.

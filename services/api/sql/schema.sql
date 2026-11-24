CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE IF NOT EXISTS users (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, email TEXT UNIQUE NOT NULL,
 password_hash TEXT NOT NULL, role TEXT NOT NULL CHECK(role IN ('learner','instructor','author','assessor','admin')),
 created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS courses (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), title TEXT NOT NULL, description TEXT NOT NULL DEFAULT '',
 instructor_id UUID NOT NULL REFERENCES users(id), status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','published','archived')),
 price_cents INTEGER NOT NULL DEFAULT 0 CHECK(price_cents >= 0), created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS topics (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
 title TEXT NOT NULL, position INTEGER NOT NULL, UNIQUE(course_id,position)
);
CREATE TABLE IF NOT EXISTS lessons (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
 title TEXT NOT NULL, body TEXT NOT NULL DEFAULT '', video_url TEXT, position INTEGER NOT NULL,
 prerequisite_lesson_id UUID REFERENCES lessons(id), UNIQUE(topic_id,position)
);
CREATE TABLE IF NOT EXISTS enrollments (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), learner_id UUID NOT NULL REFERENCES users(id),
 course_id UUID NOT NULL REFERENCES courses(id), status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','completed','cancelled')),
 enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(), UNIQUE(learner_id,course_id)
);
CREATE TABLE IF NOT EXISTS lesson_progress (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), enrollment_id UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
 lesson_id UUID NOT NULL REFERENCES lessons(id), completed_at TIMESTAMPTZ,
 UNIQUE(enrollment_id,lesson_id)
);
CREATE TABLE IF NOT EXISTS assessments (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), course_id UUID NOT NULL REFERENCES courses(id),
 title TEXT NOT NULL, questions JSONB NOT NULL DEFAULT '[]', pass_mark INTEGER NOT NULL DEFAULT 70 CHECK(pass_mark BETWEEN 0 AND 100),
 max_attempts INTEGER NOT NULL DEFAULT 3 CHECK(max_attempts > 0), version INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS attempts (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), assessment_id UUID NOT NULL REFERENCES assessments(id),
 learner_id UUID NOT NULL REFERENCES users(id), answers JSONB NOT NULL DEFAULT '{}',
 score INTEGER, status TEXT NOT NULL DEFAULT 'submitted' CHECK(status IN ('submitted','graded','void')),
 submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(), UNIQUE(id)
);
CREATE INDEX IF NOT EXISTS attempts_lookup_idx ON attempts(assessment_id,learner_id);
CREATE TABLE IF NOT EXISTS submissions (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), course_id UUID NOT NULL REFERENCES courses(id),
 learner_id UUID NOT NULL REFERENCES users(id), title TEXT NOT NULL, content TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'submitted', grade NUMERIC(5,2), feedback TEXT, submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS certificates (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), enrollment_id UUID UNIQUE NOT NULL REFERENCES enrollments(id),
 certificate_code TEXT UNIQUE NOT NULL, issued_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS content_versions (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), course_id UUID NOT NULL REFERENCES courses(id),
 version INTEGER NOT NULL, snapshot JSONB NOT NULL, created_by UUID NOT NULL REFERENCES users(id),
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(), UNIQUE(course_id,version)
);
CREATE TABLE IF NOT EXISTS audit_log (
 id BIGSERIAL PRIMARY KEY, actor_id UUID REFERENCES users(id), action TEXT NOT NULL,
 resource_type TEXT NOT NULL, resource_id TEXT NOT NULL, details JSONB NOT NULL DEFAULT '{}',
 created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS courses_status_idx ON courses(status);
CREATE INDEX IF NOT EXISTS enrollments_learner_idx ON enrollments(learner_id);
CREATE INDEX IF NOT EXISTS progress_enrollment_idx ON lesson_progress(enrollment_id);

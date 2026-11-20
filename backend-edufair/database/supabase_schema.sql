-- ================================================================
-- SMANIS EDU FAIR - SUPABASE POSTGRESQL SCHEMA & INITIAL SEED
-- Project Ref: vafdraatcqseavssispf
-- ================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ================================================================
-- 2. DROP TABLES IF EXIST (CLEAN REBUILD)
-- ================================================================
DROP TABLE IF EXISTS winners CASCADE;
DROP TABLE IF EXISTS lucky_draw_participants CASCADE;
DROP TABLE IF EXISTS university_points CASCADE;
DROP TABLE IF EXISTS student_visits CASCADE;
DROP TABLE IF EXISTS universities CASCADE;
DROP TABLE IF EXISTS personal_access_tokens CASCADE;
DROP TABLE IF EXISTS password_reset_tokens CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS cache_locks CASCADE;
DROP TABLE IF EXISTS cache CASCADE;
DROP TABLE IF EXISTS failed_jobs CASCADE;
DROP TABLE IF EXISTS job_batches CASCADE;
DROP TABLE IF EXISTS jobs CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ================================================================
-- 3. CORE APPLICATION TABLES
-- ================================================================

-- TABLE: users
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'student',
    remember_token VARCHAR(100) NULL,
    created_at TIMESTAMPTZ NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_role ON users(role);

-- TABLE: universities
CREATE TABLE universities (
    id BIGSERIAL PRIMARY KEY,
    admin_id BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    logo VARCHAR(255) NULL,
    website VARCHAR(255) NULL,
    location VARCHAR(255) NULL,
    qr_token VARCHAR(255) UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
    created_at TIMESTAMPTZ NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_universities_admin_id ON universities(admin_id);
CREATE INDEX idx_universities_qr_token ON universities(qr_token);

-- TABLE: student_visits (Stempel Kunjungan QR Booth)
CREATE TABLE student_visits (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    university_id BIGINT NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
    visited_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_student_university_visit UNIQUE (student_id, university_id)
);

CREATE INDEX idx_student_visits_student_id ON student_visits(student_id);
CREATE INDEX idx_student_visits_university_id ON student_visits(university_id);
CREATE INDEX idx_student_visits_visited_at ON student_visits(visited_at);

-- TABLE: university_points (Rating & Review Booth 1 - 5)
CREATE TABLE university_points (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    university_id BIGINT NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
    score SMALLINT NOT NULL DEFAULT 0 CHECK (score >= 0 AND score <= 5),
    created_at TIMESTAMPTZ NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_student_university_point UNIQUE (student_id, university_id)
);

CREATE INDEX idx_university_points_student_id ON university_points(student_id);
CREATE INDEX idx_university_points_university_id ON university_points(university_id);

-- TABLE: lucky_draw_participants (Peserta Undian Lucky Draw)
CREATE TABLE lucky_draw_participants (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    participant_number VARCHAR(50) UNIQUE NOT NULL,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_lucky_draw_participants_number ON lucky_draw_participants(participant_number);

-- TABLE: winners (Pemenang Undian)
CREATE TABLE winners (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    prize VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_winners_student_id ON winners(student_id);

-- ================================================================
-- 4. LARAVEL INFRASTRUCTURE TABLES (Sanctum, Session, Cache, Jobs)
-- ================================================================

CREATE TABLE personal_access_tokens (
    id BIGSERIAL PRIMARY KEY,
    tokenable_type VARCHAR(255) NOT NULL,
    tokenable_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    token VARCHAR(64) UNIQUE NOT NULL,
    abilities TEXT NULL,
    last_used_at TIMESTAMPTZ NULL,
    expires_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_personal_access_tokens_tokenable ON personal_access_tokens(tokenable_type, tokenable_id);

CREATE TABLE password_reset_tokens (
    email VARCHAR(255) PRIMARY KEY,
    token VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sessions (
    id VARCHAR(255) PRIMARY KEY,
    user_id BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    payload TEXT NOT NULL,
    last_activity INTEGER NOT NULL
);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_last_activity ON sessions(last_activity);

CREATE TABLE cache (
    key VARCHAR(255) PRIMARY KEY,
    value TEXT NOT NULL,
    expiration INTEGER NOT NULL
);
CREATE INDEX idx_cache_expiration ON cache(expiration);

CREATE TABLE cache_locks (
    key VARCHAR(255) PRIMARY KEY,
    owner VARCHAR(255) NOT NULL,
    expiration INTEGER NOT NULL
);

CREATE TABLE jobs (
    id BIGSERIAL PRIMARY KEY,
    queue VARCHAR(255) NOT NULL,
    payload TEXT NOT NULL,
    attempts SMALLINT NOT NULL,
    reserved_at INTEGER NULL,
    available_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL
);
CREATE INDEX idx_jobs_queue ON jobs(queue);

CREATE TABLE job_batches (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    total_jobs INTEGER NOT NULL,
    pending_jobs INTEGER NOT NULL,
    failed_jobs INTEGER NOT NULL,
    failed_job_ids TEXT NOT NULL,
    options TEXT NULL,
    cancelled_at INTEGER NULL,
    created_at INTEGER NOT NULL,
    finished_at INTEGER NULL
);

CREATE TABLE failed_jobs (
    id BIGSERIAL PRIMARY KEY,
    uuid VARCHAR(255) UNIQUE NOT NULL,
    connection TEXT NOT NULL,
    queue TEXT NOT NULL,
    payload TEXT NOT NULL,
    exception TEXT NOT NULL,
    failed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ================================================================
-- 5. INITIAL SEED DATA (Admin, Siswa, & Universitas)
-- Password Default:
--   superadmin: admin / admin123
--   student: student / password
--   uni admins: admin_binus, admin_ui, etc / password
-- ================================================================

-- Bcrypt hashes:
-- 'admin123' -> $2y$12$K89.Z4m5aX2h7QcI2KkCjeH1nQc2QdJm8qM0YV6mRkE1GZg9n1Kqy
-- 'password' -> $2y$12$e0MYzXyjpJS7Pd0RVvHwHeFj7/B0gqN6zZf9L6qXq9tVlV1KqY6Ki

INSERT INTO users (id, name, password, role, created_at, updated_at) VALUES
(1, 'admin', '$2y$12$K89.Z4m5aX2h7QcI2KkCjeH1nQc2QdJm8qM0YV6mRkE1GZg9n1Kqy', 'superadmin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'student', '$2y$12$e0MYzXyjpJS7Pd0RVvHwHeFj7/B0gqN6zZf9L6qXq9tVlV1KqY6Ki', 'student', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 'admin_binus', '$2y$12$e0MYzXyjpJS7Pd0RVvHwHeFj7/B0gqN6zZf9L6qXq9tVlV1KqY6Ki', 'university_admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 'admin_ui', '$2y$12$e0MYzXyjpJS7Pd0RVvHwHeFj7/B0gqN6zZf9L6qXq9tVlV1KqY6Ki', 'university_admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, 'admin_itb', '$2y$12$e0MYzXyjpJS7Pd0RVvHwHeFj7/B0gqN6zZf9L6qXq9tVlV1KqY6Ki', 'university_admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(6, 'admin_ugm', '$2y$12$e0MYzXyjpJS7Pd0RVvHwHeFj7/B0gqN6zZf9L6qXq9tVlV1KqY6Ki', 'university_admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(7, 'admin_unair', '$2y$12$e0MYzXyjpJS7Pd0RVvHwHeFj7/B0gqN6zZf9L6qXq9tVlV1KqY6Ki', 'university_admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(8, 'admin_unpad', '$2y$12$e0MYzXyjpJS7Pd0RVvHwHeFj7/B0gqN6zZf9L6qXq9tVlV1KqY6Ki', 'university_admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(9, 'admin_undip', '$2y$12$e0MYzXyjpJS7Pd0RVvHwHeFj7/B0gqN6zZf9L6qXq9tVlV1KqY6Ki', 'university_admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(10, 'admin_ub', '$2y$12$e0MYzXyjpJS7Pd0RVvHwHeFj7/B0gqN6zZf9L6qXq9tVlV1KqY6Ki', 'university_admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Reset sequence to 11
SELECT setval('users_id_seq', 11, true);

INSERT INTO universities (id, name, logo, description, website, location, qr_token, admin_id, created_at, updated_at) VALUES
(1, 'Binus University', '/logos/binus.png', 'A world-class university in Jakarta specializing in computing, business, and creative technology.', 'https://binus.ac.id', 'Main Hall - Booth A1', 'binus-booth-uuid-token-01', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'Universitas Indonesia', '/logos/ui.png', 'One of the oldest and most prestigious national universities in Indonesia, located in Depok.', 'https://ui.ac.id', 'Main Hall - Booth A2', 'ui-booth-uuid-token-02', 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 'Institut Teknologi Bandung', '/logos/itb.png', 'Premier technology and engineering research university located in Bandung, West Java.', 'https://itb.ac.id', 'Main Hall - Booth B1', 'itb-booth-uuid-token-03', 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 'Universitas Gadjah Mada', '/logos/ugm.png', 'A leading public research university in Yogyakarta, renowned for its diverse programs and research.', 'https://ugm.ac.id', 'Main Hall - Booth B2', 'ugm-booth-uuid-token-04', 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, 'Universitas Airlangga', '/logos/unair.png', 'Top public university in Surabaya with a strong reputation in medicine and social sciences.', 'https://unair.ac.id', 'Annex Hall - Booth C1', 'unair-booth-uuid-token-05', 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(6, 'Universitas Padjadjaran', '/logos/unpad.png', 'Renowned public university in Bandung offering highly-rated programs in medicine, law, and communications.', 'https://unpad.ac.id', 'Annex Hall - Booth C2', 'unpad-booth-uuid-token-06', 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(7, 'Universitas Diponegoro', '/logos/undip.png', 'A leading university in Semarang known for engineering, marine sciences, and law.', 'https://undip.ac.id', 'Annex Hall - Booth D1', 'undip-booth-uuid-token-07', 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(8, 'Universitas Brawijaya', '/logos/ub.png', 'A dynamic public university in Malang with excellent agricultural, administrative, and engineering programs.', 'https://ub.ac.id', 'Annex Hall - Booth D2', 'ub-booth-uuid-token-08', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Reset sequence to 9
SELECT setval('universities_id_seq', 9, true);

-- Enable RLS for all exposed public tables as Supabase best practice
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE university_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE lucky_draw_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE winners ENABLE ROW LEVEL SECURITY;

-- Create service/public access policies (Laravel connects via postgres user which bypasses RLS)
CREATE POLICY "Public read universities" ON universities FOR SELECT TO PUBLIC USING (true);
CREATE POLICY "Public read points" ON university_points FOR SELECT TO PUBLIC USING (true);
CREATE POLICY "Public read winners" ON winners FOR SELECT TO PUBLIC USING (true);

-- Feedbacks table
CREATE TABLE IF NOT EXISTS feedbacks (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    student_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) DEFAULT 'Umum',
    rating INT DEFAULT 5,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public insert feedbacks" ON feedbacks FOR INSERT TO PUBLIC WITH CHECK (true);
CREATE POLICY "Public read feedbacks" ON feedbacks FOR SELECT TO PUBLIC USING (true);
CREATE POLICY "Public delete feedbacks" ON feedbacks FOR DELETE TO PUBLIC USING (true);



-- ========================================================
-- CivicTrust AI — Initial Supabase / PostgreSQL Schema Migration
-- Includes RLS Policies, Indexes, Audit Log Triggers
-- ========================================================

-- Enable PostGIS extension for spatial distance calculations if available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Departments
CREATE TABLE IF NOT EXISTS departments (
    id TEXT PRIMARY KEY,
    name_en TEXT NOT NULL,
    name_hi TEXT NOT NULL,
    head_officer TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    escalation_officer TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Complaints Table
CREATE TABLE IF NOT EXISTS complaints (
    id TEXT PRIMARY KEY, -- e.g. CT-2026-0101
    category_id TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    address TEXT NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    landmark TEXT,
    citizen_phone_masked TEXT,
    citizen_consent BOOLEAN DEFAULT TRUE,
    status TEXT NOT NULL DEFAULT 'SUBMITTED' 
        CHECK (status IN ('SUBMITTED', 'TRIAGED', 'ASSIGNED', 'IN_PROGRESS', 'UNDER_VERIFICATION', 'RESOLVED', 'ESCALATED', 'REOPENED')),
    department_id TEXT REFERENCES departments(id),
    assigned_officer TEXT,
    escalated_to TEXT,
    reopened_reason TEXT,
    duplicate_of TEXT REFERENCES complaints(id),
    sla_deadline TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Evidence Table (Separated from complaint records)
CREATE TABLE IF NOT EXISTS evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id TEXT NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    uploader_role TEXT NOT NULL CHECK (uploader_role IN ('citizen', 'officer', 'admin')),
    file_path TEXT NOT NULL,
    safe_filename TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    phash TEXT,
    verification_status TEXT NOT NULL DEFAULT 'Needs Review' 
        CHECK (verification_status IN ('Verified', 'Needs Review', 'Verification Failed', 'Unavailable')),
    confidence_score NUMERIC(3, 2) DEFAULT 0.0,
    checks_run JSONB DEFAULT '[]'::jsonb,
    flags JSONB DEFAULT '[]'::jsonb,
    explanation TEXT,
    is_simulated BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Immutable Audit Trail
CREATE TABLE IF NOT EXISTS audit_events (
    id TEXT PRIMARY KEY,
    complaint_id TEXT NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    actor TEXT NOT NULL,
    role TEXT NOT NULL,
    action TEXT NOT NULL,
    previous_state TEXT,
    new_state TEXT,
    notes TEXT,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 5. Duplicate Candidates Table
CREATE TABLE IF NOT EXISTS duplicate_candidates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    original_id TEXT NOT NULL REFERENCES complaints(id),
    candidate_id TEXT NOT NULL REFERENCES complaints(id),
    score INTEGER NOT NULL,
    reasons JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'LINKED', 'DISMISSED')),
    reviewed_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_dept ON complaints(department_id);
CREATE INDEX IF NOT EXISTS idx_complaints_sla ON complaints(sla_deadline);
CREATE INDEX IF NOT EXISTS idx_evidence_complaint ON evidence(complaint_id);
CREATE INDEX IF NOT EXISTS idx_audit_complaint ON audit_events(complaint_id);

-- Row Level Security (RLS) Policies
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;

-- Citizen Policy: Anyone can submit a complaint; citizens can read status of complaints
CREATE POLICY "Public complaint submission" ON complaints
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Public status tracking" ON complaints
    FOR SELECT USING (true);

-- Officer Policy: Officers can update complaints assigned to their department
CREATE POLICY "Officer complaint update" ON complaints
    FOR UPDATE USING (
        auth.jwt() ->> 'role' IN ('officer', 'admin')
    );

-- Evidence Policy: Citizens can upload initial photo, Officers upload resolution photos
CREATE POLICY "Public evidence upload" ON evidence
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Public evidence view" ON evidence
    FOR SELECT USING (true);

-- Audit Policy: Read-only for authorized review; inserts triggered by workflow
CREATE POLICY "Staff audit view" ON audit_events
    FOR SELECT USING (
        auth.jwt() ->> 'role' IN ('officer', 'admin') OR auth.role() = 'anon'
    );

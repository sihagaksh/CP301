-- ============================================================
-- 043_alumni_requests.sql
-- Adds tables for alumni requests and custom email OTPs
-- ============================================================

-- 1. Alumni Requests
CREATE TABLE alumni_requests (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    personal_email TEXT NOT NULL,
    status         TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    resolved_at    TIMESTAMPTZ,
    resolved_by    UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Ensure a user can only have one pending request at a time
CREATE UNIQUE INDEX idx_alumni_requests_pending_user ON alumni_requests(user_id) WHERE status = 'pending';

-- Add updated_at trigger
CREATE TRIGGER trg_alumni_requests_updated_at BEFORE UPDATE ON alumni_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS Policies for Alumni Requests
ALTER TABLE alumni_requests ENABLE ROW LEVEL SECURITY;

-- Users can see their own requests
CREATE POLICY "alumni_req_select_own" ON alumni_requests
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

-- Students can insert their own requests
CREATE POLICY "alumni_req_insert_own" ON alumni_requests
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Admins can view all requests
CREATE POLICY "alumni_req_select_admin" ON alumni_requests
    FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.is_admin = true));

-- Admins can update all requests
CREATE POLICY "alumni_req_update_admin" ON alumni_requests
    FOR UPDATE TO authenticated
    USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.is_admin = true))
    WITH CHECK (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.is_admin = true));


-- 2. Email OTPs (for custom verification before submission)
CREATE TABLE email_otps (
    email       TEXT PRIMARY KEY,
    otp_code    TEXT NOT NULL,
    expires_at  TIMESTAMPTZ NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Only accessible via service role (bypasses RLS) or specific secure RPCs if needed
-- We'll keep RLS enabled but with no policies so anon/authenticated users can't read/write directly.
ALTER TABLE email_otps ENABLE ROW LEVEL SECURITY;

-- 3. Bulk Resolve RPC
CREATE OR REPLACE FUNCTION bulk_resolve_alumni_requests(
    p_request_ids UUID[],
    p_new_status TEXT,
    p_admin_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Verify caller is admin (double check)
    IF NOT EXISTS (SELECT 1 FROM users WHERE id = p_admin_id AND is_admin = true) THEN
        RAISE EXCEPTION 'Unauthorized: Only admins can bulk resolve alumni requests';
    END IF;

    UPDATE alumni_requests
    SET status = p_new_status,
        resolved_at = now(),
        resolved_by = p_admin_id,
        updated_at = now()
    WHERE id = ANY(p_request_ids) AND status = 'pending';
END;
$$;

-- Track migration
INSERT INTO _migrations (filename) VALUES ('043_alumni_requests.sql');

-- ============================================================
-- 041_org_members_removal_trigger.sql
-- Trigger to automatically deactivate user positions when a 
-- member is removed from an organization.
-- ============================================================

CREATE OR REPLACE FUNCTION handle_org_member_removal()
RETURNS TRIGGER AS $$
BEGIN
    -- If a member is updated and their status changes to removed
    IF (TG_OP = 'UPDATE' AND NEW.status = 'removed' AND OLD.status != 'removed') THEN
        UPDATE user_positions
        SET is_active = false,
            valid_until = CURRENT_DATE
        WHERE user_id = NEW.user_id
          AND org_id = NEW.org_id
          AND is_active = true;
    END IF;

    -- If a member is deleted entirely
    IF (TG_OP = 'DELETE') THEN
        UPDATE user_positions
        SET is_active = false,
            valid_until = CURRENT_DATE
        WHERE user_id = OLD.user_id
          AND org_id = OLD.org_id
          AND is_active = true;
        RETURN OLD;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_org_member_removal ON org_members;
CREATE TRIGGER trigger_org_member_removal
    AFTER UPDATE OR DELETE ON org_members
    FOR EACH ROW
    EXECUTE FUNCTION handle_org_member_removal();

-- Track migration
INSERT INTO _migrations (filename) VALUES ('041_org_members_removal_trigger.sql');

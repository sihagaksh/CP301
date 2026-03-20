-- Drop the existing unique constraint on (participant1_id, participant2_id)
-- so that the same two users can have multiple different conversations (e.g. one for L&F, one for B&S)
ALTER TABLE conversations DROP CONSTRAINT IF EXISTS conversations_participant1_id_participant2_id_key;

-- We could optionally add a unique constraint on (participant1_id, participant2_id, context_type)
-- but context_type can be NULL, and unique constraints with NULL behave differently across DBs.
-- By just dropping the constraint, we rely on the application logic to find/create the right conversation.

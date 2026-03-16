-- =====================================================
-- MESSAGE READ STATUS & DELIVERY TICKS
-- Adds last_message_sender_id to conversations so we can
-- show single-tick (delivered) vs double-blue-tick (seen)
-- in the conversation list preview.
-- =====================================================

-- Track who sent the last message in each conversation
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS last_message_sender_id UUID REFERENCES users(id);

-- Backfill from existing messages
UPDATE conversations c SET last_message_sender_id = (
    SELECT m.sender_id
    FROM messages m
    WHERE m.conversation_id = c.id
    ORDER BY m.created_at DESC
    LIMIT 1
);

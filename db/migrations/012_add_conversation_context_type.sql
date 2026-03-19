-- 012_add_conversation_context_type.sql
-- Adds a context_type column to conversations to tag inquiry-based chats.
-- Values: 'lost_found' | 'buy_sell' | NULL (regular DMs)

ALTER TABLE conversations
  ADD COLUMN IF NOT EXISTS context_type TEXT CHECK (context_type IN ('lost_found', 'buy_sell')) DEFAULT NULL;

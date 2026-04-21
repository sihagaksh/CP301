-- Migration: 019_conversation_delete_policy.sql
-- Description: Allow participants to delete their conversations

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Allow participants to delete a conversation
-- NOTE: In a production app, soft-delete is usually preferred so the other participant 
-- does not lose the chat history. But for simplicity, we allow hard delete here.
DROP POLICY IF EXISTS "conv_delete_own" ON conversations;
CREATE POLICY "conv_delete_own" ON conversations
    FOR DELETE TO authenticated
    USING (auth.uid() = participant1_id OR auth.uid() = participant2_id);

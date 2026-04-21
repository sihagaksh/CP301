-- 021_pinned_chats.sql

-- 1. Add pinned flags to conversations for both participants
ALTER TABLE conversations
ADD COLUMN is_pinned_p1 BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN is_pinned_p2 BOOLEAN NOT NULL DEFAULT false;

-- 2. Create function to toggle pin state safely
CREATE OR REPLACE FUNCTION toggle_conversation_pin(conv_id UUID, is_pinned BOOLEAN)
RETURNS void AS $$
DECLARE
    current_user_id UUID := auth.uid();
    part1 UUID;
    part2 UUID;
BEGIN
    SELECT participant1_id, participant2_id INTO part1, part2
    FROM conversations WHERE id = conv_id;
    
    IF current_user_id = part1 THEN
        UPDATE conversations SET is_pinned_p1 = is_pinned WHERE id = conv_id;
    ELSIF current_user_id = part2 THEN
        UPDATE conversations SET is_pinned_p2 = is_pinned WHERE id = conv_id;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

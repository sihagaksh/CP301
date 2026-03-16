-- Run this script in the Supabase SQL Editor
-- This adds 'returned' to the lost_found_status enum

-- Since postgres doesn't support 'IF NOT EXISTS' for enum values easily,
-- we wrap it in a DO block to catch the duplicate exception if it's already there.
DO $$ 
BEGIN
    ALTER TYPE lost_found_status ADD VALUE 'returned';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

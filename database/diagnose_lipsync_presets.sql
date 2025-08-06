-- Diagnostic script for lipsync_presets table
-- Run this in your Supabase SQL Editor to check the table structure and identify issues

-- 1. Check if the table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'lipsync_presets'
) as table_exists;

-- 2. Check table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'lipsync_presets' 
ORDER BY ordinal_position;

-- 3. Check constraints
SELECT 
    constraint_name,
    constraint_type,
    table_name
FROM information_schema.table_constraints 
WHERE table_name = 'lipsync_presets';

-- 4. Check indexes
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'lipsync_presets';

-- 5. Check RLS policies
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'lipsync_presets';

-- 6. Check if RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'lipsync_presets';

-- 7. Test a simple insert (this will help identify the exact issue)
-- Uncomment the lines below to test insert (remove the -- at the beginning)
/*
INSERT INTO lipsync_presets (
    user_id,
    name,
    description,
    prompt,
    video_url,
    voice_url,
    voice_name,
    preset_image,
    upload_flag
) VALUES (
    '00000000-0000-0000-0000-000000000000', -- Replace with a valid UUID
    'Test Preset',
    'Test Description',
    'Test Prompt',
    'https://example.com/video.mp4',
    'https://example.com/voice.mp3',
    'Test Voice Name',
    'https://example.com/image.jpg',
    false
) RETURNING id;
*/

-- 8. Check for any recent errors in the logs (if you have access)
-- This might not work in Supabase, but worth trying
SELECT 
    log_time,
    user_name,
    database_name,
    process_id,
    session_id,
    command_tag,
    message
FROM pg_stat_activity 
WHERE query LIKE '%lipsync_presets%'
ORDER BY log_time DESC
LIMIT 10; 
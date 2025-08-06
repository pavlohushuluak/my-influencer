-- Migration script to add voice_name column to lipsync_presets table
-- This script should be run on existing databases to add the new voice_name field

-- Add voice_name column to existing lipsync_presets table
ALTER TABLE lipsync_presets 
ADD COLUMN IF NOT EXISTS voice_name TEXT;

-- Add index for voice_name column
CREATE INDEX IF NOT EXISTS idx_lipsync_presets_voice_name ON lipsync_presets(voice_name);

-- Add comment for the new column
COMMENT ON COLUMN lipsync_presets.voice_name IS 'Name of the selected voice (for ElevenLabs voices when upload_flag is false)';

-- Update existing presets to have voice_name based on voice_url if possible
-- This is a placeholder for any data migration logic that might be needed
-- UPDATE lipsync_presets 
-- SET voice_name = 'Unknown Voice' 
-- WHERE voice_name IS NULL AND voice_url IS NOT NULL AND upload_flag = false; 
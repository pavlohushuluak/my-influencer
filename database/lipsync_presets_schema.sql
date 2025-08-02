-- Lipsync Presets Database Schema
-- This table stores lipsync generation presets for users

CREATE TABLE IF NOT EXISTS lipsync_presets (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Lipsync generation settings
    prompt TEXT NOT NULL,
    video_url TEXT, -- Video URL for lipsync generation
    voice_url TEXT, -- Voice/audio URL for lipsync generation
    preset_image TEXT, -- Preset image URL (selected image for the preset)
    upload_flag BOOLEAN DEFAULT FALSE, -- Flag to determine if using option 1 or 2
    
    -- Metadata
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    favorite BOOLEAN DEFAULT FALSE,
    
    -- Constraints
    CONSTRAINT lipsync_presets_name_not_empty CHECK (name != ''),
    CONSTRAINT lipsync_presets_user_id_not_null CHECK (user_id IS NOT NULL),
    CONSTRAINT lipsync_presets_prompt_not_empty CHECK (prompt != '')
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_lipsync_presets_user_id ON lipsync_presets(user_id);
CREATE INDEX IF NOT EXISTS idx_lipsync_presets_created_at ON lipsync_presets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lipsync_presets_favorite ON lipsync_presets(favorite);
CREATE INDEX IF NOT EXISTS idx_lipsync_presets_rating ON lipsync_presets(rating);
CREATE INDEX IF NOT EXISTS idx_lipsync_presets_upload_flag ON lipsync_presets(upload_flag);

-- Enable Row Level Security (RLS)
ALTER TABLE lipsync_presets ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own lipsync presets" ON lipsync_presets
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own lipsync presets" ON lipsync_presets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lipsync presets" ON lipsync_presets
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lipsync presets" ON lipsync_presets
    FOR DELETE USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_lipsync_presets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_lipsync_presets_updated_at
    BEFORE UPDATE ON lipsync_presets
    FOR EACH ROW
    EXECUTE FUNCTION update_lipsync_presets_updated_at();

-- Comments
COMMENT ON TABLE lipsync_presets IS 'Stores lipsync generation presets for users with essential lipsync generation parameters';
COMMENT ON COLUMN lipsync_presets.prompt IS 'Main prompt describing what to generate in the lipsync';
COMMENT ON COLUMN lipsync_presets.video_url IS 'URL to the video file for lipsync generation';
COMMENT ON COLUMN lipsync_presets.voice_url IS 'URL to the voice/audio file for lipsync generation';
COMMENT ON COLUMN lipsync_presets.preset_image IS 'URL to the preset image (selected image for the preset)';
COMMENT ON COLUMN lipsync_presets.upload_flag IS 'Flag to determine if using upload option (option 1) or other option (option 2)';
COMMENT ON COLUMN lipsync_presets.rating IS 'User rating from 1-5 stars';
COMMENT ON COLUMN lipsync_presets.favorite IS 'Whether the preset is marked as favorite by the user'; 